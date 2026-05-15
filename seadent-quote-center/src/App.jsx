import React from "react";

const GOOGLE_SHEET_ID = "1HAFKnOoIs9VmdlmVuonjNSxpvKfzHlrCJ4l1zQq3HUs";
const GOOGLE_SHEET_TAB = "products";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhp4Rv3FCzVYziwUx-og_5O47HUaazt79G_0DJsu1Oz1v2fiip1yHYxwg81spFAKRKLg/exec";
const DISCOUNT_PASSWORD = "seadent";

const DEMO_PRODUCTS = [
  { id: "1", name: "Planmeca Compact i5", category: "Dental Unit", price: 450000000, stock: 3, discount: 10 },
  { id: "2", name: "Belmont Clesta eIII", category: "Dental Unit", price: 390000000, stock: 2, discount: 12 },
  { id: "3", name: "Durr VS 1200", category: "Suction", price: 89000000, stock: 8, discount: 8 },
  { id: "4", name: "Melag Vacuklav", category: "Sterilization", price: 125000000, stock: 4, discount: 15 },
];

const money = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} đ`;
const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const finalPrice = (price, discount) => num(price) - (num(price) * num(discount)) / 100;
const isBrowser = () => typeof window !== "undefined";

const getLocal = (key, fallback) => {
  if (!isBrowser()) return fallback;
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};

const setLocal = (key, value) => {
  if (!isBrowser()) return;
  try { localStorage.setItem(key, value); } catch {}
};

const normalizeProduct = (item, index) => ({
  id: String(item.id || item.name || index + 1),
  name: String(item.name || "Unnamed product"),
  category: String(item.category || "Uncategorized"),
  price: num(item.price),
  stock: num(item.stock),
  discount: num(item.discount),
});

export default function App() {
  const [products, setProducts] = React.useState(DEMO_PRODUCTS);
  const [discounts, setDiscounts] = React.useState({});
  const [cart, setCart] = React.useState({});
  const [search, setSearch] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [syncStatus, setSyncStatus] = React.useState("Đang tải dữ liệu...");
  const [globalDiscount, setGlobalDiscount] = React.useState(10);
  const [collapsedCategories, setCollapsedCategories] = React.useState({});
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");
  const [customerNote, setCustomerNote] = React.useState("");
  const [isUnlocked, setIsUnlocked] = React.useState(() => getLocal("seadent_discount_unlocked", "false") === "true");
  const [isGrouped, setIsGrouped] = React.useState(() => getLocal("seadent_group_by_category", "true") === "true");

  React.useEffect(() => {
    setLocal("seadent_discount_unlocked", String(isUnlocked));
  }, [isUnlocked]);

  React.useEffect(() => {
    setLocal("seadent_group_by_category", String(isGrouped));
  }, [isGrouped]);

  React.useEffect(() => {
    async function loadProducts() {
      if (GOOGLE_SHEET_ID === "GOOGLE_SHEET_ID") {
        const demoDiscounts = Object.fromEntries(DEMO_PRODUCTS.map((p) => [p.id, p.discount]));
        setDiscounts(demoDiscounts);
        setSyncStatus("Đang dùng dữ liệu demo. Hãy thay GOOGLE_SHEET_ID để đồng bộ Google Sheet.");
        return;
      }

      try {
        const res = await fetch(`https://opensheet.elk.sh/${GOOGLE_SHEET_ID}/${GOOGLE_SHEET_TAB}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const formatted = data.map(normalizeProduct).filter((p) => p.name);
        const sheetDiscounts = Object.fromEntries(formatted.map((p) => [p.id, p.discount]));
        setProducts(formatted);
        setDiscounts(sheetDiscounts);
        setSyncStatus("Đã đồng bộ dữ liệu từ Google Sheet");
      } catch (error) {
        console.error("Google Sheet Error:", error);
        const demoDiscounts = Object.fromEntries(DEMO_PRODUCTS.map((p) => [p.id, p.discount]));
        setProducts(DEMO_PRODUCTS);
        setDiscounts(demoDiscounts);
        setSyncStatus("Không tải được Google Sheet. Đang dùng dữ liệu demo để web không bị lỗi.");
      }
    }
    loadProducts();
  }, []);

  const getDiscount = (id) => discounts[String(id)] ?? 0;

  const syncDiscount = async (payload) => {
    if (GOOGLE_SCRIPT_URL === "GOOGLE_APPS_SCRIPT_WEB_APP_URL") {
      setSyncStatus("Chưa cấu hình GOOGLE_SCRIPT_URL. Thay đổi chỉ hiển thị trên web hiện tại.");
      return;
    }
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSyncStatus("Đã gửi cập nhật chiết khấu lên Google Sheet");
    } catch (error) {
      console.error(error);
      setSyncStatus("Không thể đồng bộ chiết khấu lên Google Sheet");
    }
  };

  const updateDiscount = async (id, value) => {
    if (!isUnlocked) return;
    const productId = String(id);
    const discount = num(value);
    setDiscounts((prev) => ({ ...prev, [productId]: discount }));
    setCart((prev) => {
      if (!prev[productId]) return prev;
      return { ...prev, [productId]: { ...prev[productId], discount, finalPrice: finalPrice(prev[productId].price, discount) } };
    });
    await syncDiscount({ action: "updateDiscount", id: productId, discount });
  };

  const applyGlobalDiscount = async (value) => {
    if (!isUnlocked) return;
    const discount = num(value);
    setGlobalDiscount(discount);
    setDiscounts(Object.fromEntries(products.map((p) => [p.id, discount])));
    setCart((prev) => Object.fromEntries(Object.values(prev).map((item) => [item.id, { ...item, discount, finalPrice: finalPrice(item.price, discount) }])));
    await syncDiscount({ action: "updateAllDiscounts", discount });
  };

  const unlockDiscount = () => {
    if (password !== DISCOUNT_PASSWORD) return alert("Sai mật khẩu mở khóa chiết khấu");
    setIsUnlocked(true);
    setPassword("");
    setSyncStatus("Đã mở khóa chỉnh sửa chiết khấu");
  };

  const filteredProducts = products.filter((p) =>
    `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())
  );

  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const category = product.category || "Uncategorized";
    groups[category] = groups[category] || [];
    groups[category].push(product);
    return groups;
  }, {});

  const categories = Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b));
  const quoteTotal = filteredProducts.reduce((sum, p) => sum + finalPrice(p.price, getDiscount(p.id)), 0);
  const cartItems = Object.values(cart);
  const cartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

  const addToCart = (product) => {
    const id = String(product.id);
    const discount = getDiscount(id);
    setCart((prev) => ({
      ...prev,
      [id]: {
        id,
        name: product.name,
        category: product.category,
        price: product.price,
        discount,
        finalPrice: finalPrice(product.price, discount),
        quantity: (prev[id]?.quantity || 0) + 1,
      },
    }));
  };

  const updateQty = (id, quantity) => {
    const safeQty = Math.max(1, num(quantity, 1));
    setCart((prev) => ({ ...prev, [id]: { ...prev[id], quantity: safeQty } }));
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const exportQuotePdf = () => {
    if (!isBrowser()) return;
    if (!cartItems.length) return alert("Vui lòng thêm sản phẩm vào giỏ hàng trước khi xuất PDF");

    const rows = cartItems.map((item, index) => `
      <tr>
        <td>${index + 1}</td><td>${item.name}</td><td>${item.category}</td>
        <td>${money(item.price)}</td><td>${item.discount}%</td><td>${money(item.finalPrice)}</td>
        <td>${item.quantity}</td><td>${money(item.finalPrice * item.quantity)}</td>
      </tr>`).join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!doctype html><html><head><meta charset="UTF-8" /><title>SEADENT Quotation</title>
      <style>
        body{font-family:"Segoe UI",Tahoma,Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;color:#111827;padding:28px} .header{display:flex;justify-content:space-between;border-bottom:3px solid #f97316;padding-bottom:16px;margin-bottom:20px}
        .brand{font-size:24px;font-weight:900;color:#f97316}.sub{color:#6b7280;line-height:1.5}.meta{text-align:right;line-height:1.6} h2{text-align:center;margin:24px 0}
        .customer{background:#fff7ed;border:1px solid #fed7aa;padding:14px;border-radius:12px;margin-bottom:18px;line-height:1.8}
        table{width:100%;border-collapse:collapse} th{background:#f97316;color:#ffffff;padding:9px;font-size:12px;text-align:left;font-weight:700} td{border-bottom:1px solid #e5e7eb;padding:9px;font-size:12px;font-weight:500}
        .total{text-align:right;margin-top:22px;font-size:24px;font-weight:900;color:#f97316}.signature{display:flex;justify-content:space-between;margin-top:55px;text-align:center}
        @media print{body{padding:18px}}
      </style></head><body>
      <div class="header"><div style="display:flex;gap:14px"><img src="/logo.png" style="width:82px;object-fit:contain"/><div><div class="brand">CÔNG TY CỔ PHẦN SEADENT</div><div class="sub">VP.HCM: 13 Đặng Tất, Phường Tân Định, TP.HCM<br/>VP.HN: Tầng 6, 110-112 Bà Triệu, Hà Nội<br/>Hotline: 0901371516 | Email: info@seadent.com.vn | Website: seadent.com.vn</div></div></div><div class="meta"><b>Ngày:</b> ${new Date().toLocaleDateString("vi-VN")}<br/><b>Mã báo giá:</b> SQC-${Date.now()}</div></div>
      <h2>BẢNG BÁO GIÁ</h2>
      <div class="customer"><b>Tên khách hàng:</b> ${customerName || "........................"}<br/><b>Số điện thoại:</b> ${customerPhone || "........................"}<br/><b>Địa chỉ:</b> ${customerAddress || "........................"}<br/><b>Ghi chú:</b> ${customerNote || "Không có"}</div>
      <table><thead><tr><th>#</th><th>Sản phẩm</th><th>Danh mục</th><th>Giá niêm yết</th><th>CK</th><th>Đơn giá sau CK</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="total">Tổng cộng: ${money(cartTotal)}</div>
      <div style="margin-top:16px;color:#6b7280;font-family:'Segoe UI',Tahoma,sans-serif">Báo giá được tạo từ SEADENT Quote Center.</div>
      <div class="signature"><div><b>Khách hàng</b><br/><br/><br/>........................</div><div><b>Nhân viên phụ trách</b><br/><br/><br/>........................</div><div><b>Giám đốc kinh doanh</b><br/><br/><br/>........................</div></div>
      <script>window.onload=function(){document.body.style.zoom='1';window.print()}</script></body></html>`);
    win.document.close();
  };

  const styles = {
    page: { minHeight: "100vh", background: "linear-gradient(135deg,#fff 0%,#f6f7fb 50%,#fff3ea 100%)", color: "#111827", fontFamily: "Arial, Helvetica, sans-serif", padding: 28 },
    container: { maxWidth: 1280, margin: "0 auto" },
    card: { background: "#fff", border: "1px solid #eef0f4", borderRadius: 22, padding: 22, boxShadow: "0 18px 45px rgba(15,23,42,.07)" },
    hero: { display: "flex", justifyContent: "space-between", gap: 24, alignItems: "center", marginBottom: 22, background: "linear-gradient(135deg,#fff,#fff7ed)", border: "1px solid #fed7aa", borderRadius: 28, padding: 26, boxShadow: "0 24px 65px rgba(15,23,42,.08)" },
    brand: { display: "flex", gap: 16, alignItems: "center" },
    logo: { width: 72, height: 72, objectFit: "contain", background: "#fff", borderRadius: 20, padding: 8, border: "1px solid #fed7aa" },
    title: { fontSize: 42, margin: 0, letterSpacing: "-.04em" },
    muted: { color: "#6b7280", fontSize: 14 },
    badge: { display: "inline-block", background: "#fff1e7", color: "#ea580c", padding: "6px 10px", borderRadius: 999, fontWeight: 800, fontSize: 12, marginBottom: 8 },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(3,150px)", gap: 12 },
    stat: { background: "rgba(255,255,255,.9)", border: "1px solid #eef0f4", borderRadius: 18, padding: 16 },
    statValue: { color: "#ea580c", fontSize: 22, fontWeight: 900 },
    grid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginBottom: 18 },
    input: { width: "100%", background: "#f8fafc", color: "#111827", border: "1px solid #e5e7eb", borderRadius: 14, padding: "12px 14px", outline: "none", boxSizing: "border-box" },
    button: { background: "#f97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 14px", cursor: "pointer", fontWeight: 900 },
    secondaryBtn: { background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 999, padding: "10px 13px", cursor: "pointer", fontWeight: 800 },
    darkBtn: { background: "#111827", color: "#fff", border: "none", borderRadius: 999, padding: "10px 14px", cursor: "pointer", fontWeight: 900 },
    dangerBtn: { background: "#fff1f2", color: "#e11d48", border: "1px solid #ffe4e6", borderRadius: 999, padding: "10px 14px", cursor: "pointer", fontWeight: 900 },
    toolbar: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 },
    tableWrap: { background: "#fff", border: "1px solid #eef0f4", borderRadius: 22, overflow: "hidden", boxShadow: "0 18px 45px rgba(15,23,42,.07)" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: 14, background: "#f9fafb", color: "#6b7280", fontSize: 12, textTransform: "uppercase" },
    td: { padding: 14, borderTop: "1px solid #f1f5f9", color: "#374151" },
    category: { display: "flex", justifyContent: "space-between", padding: "14px 18px", background: "#fff7ed", cursor: "pointer", fontWeight: 900, color: "#111827" },
    tag: { background: "#fff1e7", color: "#ea580c", borderRadius: 999, padding: "6px 10px", fontWeight: 800, fontSize: 12 },
    miniInput: { width: 82, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: 8, fontWeight: 800 },
    price: { color: "#ea580c", fontWeight: 900 },
    cart: { marginTop: 22 },
    cartHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 },
    formGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 },
    summary: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 18, padding: 16 },
    footer: { textAlign: "center", color: "#9ca3af", marginTop: 28, fontSize: 13 },
  };

  const ProductRow = ({ product }) => {
    const discount = getDiscount(product.id);
    const price = finalPrice(product.price, discount);
    return (
      <tr>
        <td style={{ ...styles.td, fontWeight: 800 }}>{product.name}</td>
        <td style={styles.td}><span style={styles.tag}>{product.category}</span></td>
        <td style={styles.td}>{product.stock}</td>
        <td style={styles.td}>{money(product.price)}</td>
        <td style={styles.td}><input style={{ ...styles.miniInput, opacity: isUnlocked ? 1 : .45 }} disabled={!isUnlocked} type="number" value={discount} onChange={(e) => updateDiscount(product.id, e.target.value)} /> %</td>
        <td style={{ ...styles.td, ...styles.price }}>{money(price)}</td>
        <td style={styles.td}><button style={styles.button} onClick={() => addToCart(product)}>+ Giỏ hàng</button></td>
      </tr>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.brand}>
            <img src="/logo.png" alt="SEADENT" style={styles.logo} />
            <div>
              <div style={styles.badge}>● SEADENT PRICING SYSTEM</div>
              <h1 style={styles.title}>SEADENT Quote Center</h1>
              <div style={styles.muted}>Internal Pricing & Quotation Dashboard</div>
            </div>
          </div>
          <div style={styles.statGrid}>
            <div style={styles.stat}><div style={styles.muted}>Products</div><div style={styles.statValue}>{products.length}</div></div>
            <div style={styles.stat}><div style={styles.muted}>Quote Total</div><div style={styles.statValue}>{money(quoteTotal)}</div></div>
            <div style={styles.stat}><div style={styles.muted}>Cart Total</div><div style={styles.statValue}>{money(cartTotal)}</div></div>
          </div>
        </section>

        <div style={styles.grid}>
          <div style={styles.card}>
            <input style={styles.input} placeholder="Tìm nhanh sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div style={styles.toolbar}>
              <button style={isGrouped ? styles.button : styles.secondaryBtn} onClick={() => setIsGrouped(!isGrouped)}>{isGrouped ? "✓ Group by Category" : "Group by Category"}</button>
              {isGrouped && <><button style={styles.secondaryBtn} onClick={() => setCollapsedCategories({})}>Expand all</button><button style={styles.secondaryBtn} onClick={() => setCollapsedCategories(Object.fromEntries(categories.map((c) => [c, true])))}>Collapse all</button></>}
            </div>
            <div style={{ ...styles.muted, marginTop: 12 }}>{syncStatus}</div>
          </div>

          <div style={styles.card}>
            <div style={styles.badge}>{isUnlocked ? "🔓 Discount Unlocked" : "🔒 Discount Locked"}</div>
            <input style={{ ...styles.input, opacity: isUnlocked ? 1 : .45 }} type="number" value={globalDiscount} disabled={!isUnlocked} onChange={(e) => applyGlobalDiscount(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginTop: 12 }}>
              <input style={styles.input} type="password" placeholder="Password" value={password} disabled={isUnlocked} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlockDiscount()} />
              <button style={styles.button} onClick={isUnlocked ? () => setIsUnlocked(false) : unlockDiscount}>{isUnlocked ? "Lock" : "Unlock"}</button>
            </div>
            <button style={{ ...styles.dangerBtn, width: "100%", marginTop: 10, opacity: isUnlocked ? 1 : .5 }} onClick={() => isUnlocked ? applyGlobalDiscount(0) : alert("Vui lòng mở khóa trước")}>Reset Discount</button>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Product</th><th style={styles.th}>Category</th><th style={styles.th}>Stock</th><th style={styles.th}>List Price</th><th style={styles.th}>Discount</th><th style={styles.th}>Final Price</th><th style={styles.th}>Cart</th></tr></thead>
            <tbody>
              {isGrouped ? categories.map((category) => (
                <React.Fragment key={category}>
                  <tr><td colSpan="7" style={{ padding: 0 }}><div style={styles.category} onClick={() => setCollapsedCategories((p) => ({ ...p, [category]: !p[category] }))}><span>{collapsedCategories[category] ? "▸" : "▾"} {category} <span style={styles.tag}>{groupedProducts[category].length}</span></span><span>{collapsedCategories[category] ? "+" : "−"}</span></div></td></tr>
                  {!collapsedCategories[category] && groupedProducts[category].map((product) => <ProductRow key={product.id} product={product} />)}
                </React.Fragment>
              )) : filteredProducts.map((product) => <ProductRow key={product.id} product={product} />)}
            </tbody>
          </table>
        </div>

        <section style={{ ...styles.card, ...styles.cart }}>
          <div style={styles.cartHeader}>
            <div><h2 style={{ margin: 0 }}>Giỏ hàng báo giá</h2><div style={styles.muted}>{cartQty} sản phẩm đã chọn</div></div>
            <div style={styles.toolbar}><button style={styles.darkBtn} onClick={exportQuotePdf}>Xuất PDF báo giá</button><button style={styles.dangerBtn} onClick={() => setCart({})}>Xóa giỏ hàng</button></div>
          </div>

          <div style={styles.formGrid}>
            <input style={styles.input} placeholder="Tên khách hàng / phòng khám" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input style={styles.input} placeholder="Số điện thoại" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <input style={styles.input} placeholder="Địa chỉ" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
            <input style={styles.input} placeholder="Ghi chú" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
          </div>

          {!cartItems.length ? <div style={{ ...styles.card, textAlign: "center", color: "#64748b" }}>Chưa có sản phẩm trong giỏ hàng.</div> : (
            <>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead><tr><th style={styles.th}>Sản phẩm</th><th style={styles.th}>Đơn giá sau CK</th><th style={styles.th}>Số lượng</th><th style={styles.th}>Thành tiền</th><th style={styles.th}>Xóa</th></tr></thead>
                  <tbody>{cartItems.map((item) => <tr key={item.id}><td style={styles.td}>{item.name}</td><td style={styles.td}>{money(item.finalPrice)}</td><td style={styles.td}><input style={styles.miniInput} type="number" min="1" value={item.quantity} onChange={(e) => updateQty(item.id, e.target.value)} /></td><td style={{ ...styles.td, ...styles.price }}>{money(item.finalPrice * item.quantity)}</td><td style={styles.td}><button style={styles.dangerBtn} onClick={() => removeFromCart(item.id)}>Xóa</button></td></tr>)}</tbody>
                </table>
              </div>
              <div style={styles.summary}><strong>Tổng cộng {cartQty} sản phẩm trong báo giá</strong><div style={{ ...styles.statValue, fontSize: 30 }}>{money(cartTotal)}</div></div>
            </>
          )}
        </section>

        <div style={styles.footer}>SEADENT Quote Center © 2026</div>
      </div>
    </div>
  );
}
