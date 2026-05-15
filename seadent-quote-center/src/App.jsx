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
const calcPrice = (price, discount) => num(price) - (num(price) * num(discount)) / 100;
const isBrowser = () => typeof window !== "undefined";

const getLocal = (key, fallback) => {
  if (!isBrowser()) return fallback;
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};

const setLocal = (key, value) => {
  if (!isBrowser()) return;
  try { window.localStorage.setItem(key, value); } catch {}
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
  const [collapsed, setCollapsed] = React.useState({});
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");
  const [customerNote, setCustomerNote] = React.useState("");
  const [isUnlocked, setIsUnlocked] = React.useState(() => getLocal("seadent_discount_unlocked", "false") === "true");
  const [isGrouped, setIsGrouped] = React.useState(() => getLocal("seadent_group_by_category", "true") === "true");

  React.useEffect(() => {
    if (!isBrowser()) return undefined;

    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      document.head.appendChild(viewport);
    }
    viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover");
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.margin = "0";
    return undefined;
  }, []);

  React.useEffect(() => setLocal("seadent_discount_unlocked", String(isUnlocked)), [isUnlocked]);
  React.useEffect(() => setLocal("seadent_group_by_category", String(isGrouped)), [isGrouped]);

  React.useEffect(() => {
    async function loadProducts() {
      if (GOOGLE_SHEET_ID === "GOOGLE_SHEET_ID") {
        setDiscounts(Object.fromEntries(DEMO_PRODUCTS.map((p) => [p.id, p.discount])));
        setSyncStatus("Đang dùng dữ liệu demo. Hãy thay GOOGLE_SHEET_ID để đồng bộ Google Sheet.");
        return;
      }

      try {
        const res = await fetch(`https://opensheet.elk.sh/${GOOGLE_SHEET_ID}/${GOOGLE_SHEET_TAB}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const formatted = data.map(normalizeProduct).filter((p) => p.name);
        setProducts(formatted);
        setDiscounts(Object.fromEntries(formatted.map((p) => [p.id, p.discount])));
        setSyncStatus("Đã đồng bộ dữ liệu từ Google Sheet");
      } catch (error) {
        console.error("Google Sheet Error:", error);
        setProducts(DEMO_PRODUCTS);
        setDiscounts(Object.fromEntries(DEMO_PRODUCTS.map((p) => [p.id, p.discount])));
        setSyncStatus("Không tải được Google Sheet. Đang dùng dữ liệu demo để web không bị lỗi.");
      }
    }
    loadProducts();
  }, []);

  const getDiscount = (id) => discounts[String(id)] ?? 0;
  const filtered = products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()));

  const grouped = filtered.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    acc[category] = acc[category] || [];
    acc[category].push(product);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  const cartItems = Object.values(cart);
  const cartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartBeforeDiscount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const cartDiscount = cartBeforeDiscount - cartTotal;
  const quoteTotal = filtered.reduce((sum, p) => sum + calcPrice(p.price, getDiscount(p.id)), 0);

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
      const item = prev[productId];
      if (!item) return prev;
      return { ...prev, [productId]: { ...item, discount, finalPrice: calcPrice(item.price, discount) } };
    });
    await syncDiscount({ action: "updateDiscount", id: productId, discount });
  };

  const applyGlobalDiscount = async (value) => {
    if (!isUnlocked) return;
    const discount = num(value);
    setGlobalDiscount(discount);
    setDiscounts(Object.fromEntries(products.map((p) => [p.id, discount])));
    setCart((prev) => Object.fromEntries(Object.values(prev).map((item) => [item.id, { ...item, discount, finalPrice: calcPrice(item.price, discount) }])));
    await syncDiscount({ action: "updateAllDiscounts", discount });
  };

  const unlockDiscount = () => {
    if (password !== DISCOUNT_PASSWORD) {
      alert("Sai mật khẩu mở khóa chiết khấu");
      return;
    }
    setIsUnlocked(true);
    setPassword("");
    setSyncStatus("Đã mở khóa chỉnh sửa chiết khấu");
  };

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
        finalPrice: calcPrice(product.price, discount),
        quantity: (prev[id]?.quantity || 0) + 1,
      },
    }));
  };

  const updateQty = (id, quantity) => {
    const safeQty = Math.max(1, num(quantity, 1));
    setCart((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], quantity: safeQty } } : prev));
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const scrollToCart = () => {
    if (!isBrowser()) return;
    document.getElementById("quote-cart")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const exportQuotePdf = () => {
    if (!isBrowser()) return;
    if (!cartItems.length) {
      alert("Vui lòng thêm sản phẩm vào giỏ hàng trước khi xuất PDF");
      return;
    }

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
        body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#111827;padding:28px;-webkit-font-smoothing:antialiased}.header{display:flex;justify-content:space-between;border-bottom:3px solid #f97316;padding-bottom:16px;margin-bottom:20px}
        .brand{font-size:24px;font-weight:900;color:#f97316}.sub{color:#6b7280;line-height:1.5}.meta{text-align:right;line-height:1.6}h2{text-align:center;margin:24px 0}
        .customer{background:#fff7ed;border:1px solid #fed7aa;padding:14px;border-radius:12px;margin-bottom:18px;line-height:1.8}table{width:100%;border-collapse:collapse}th{background:#f97316;color:white;padding:9px;font-size:12px;text-align:left}td{border-bottom:1px solid #e5e7eb;padding:9px;font-size:12px}
        .summary{width:520px;margin-left:auto;margin-top:22px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.sumrow{display:grid;grid-template-columns:220px 1fr;gap:18px;padding:10px 14px;border-bottom:1px solid #e5e7eb}.sumlabel{font-weight:800}.sumvalue{text-align:right;font-weight:900;white-space:nowrap}.sumfinal{background:#fff7ed;color:#f97316;font-size:18px}.note{margin-top:18px;padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;color:#7c2d12;line-height:1.8}.signature{display:flex;justify-content:space-between;margin-top:55px;text-align:center}@media print{body{padding:18px}}
      </style></head><body>
      <div class="header"><div style="display:flex;gap:14px"><img src="/logo.png" style="width:82px;object-fit:contain"/><div><div class="brand">CÔNG TY CỔ PHẦN SEADENT</div><div class="sub">VP.HCM: 13 Đặng Tất, Phường Tân Định, TP.HCM<br/>VP.HN: Tầng 6, 110-112 Bà Triệu, Hà Nội<br/>Hotline: 0901371516 | Email: info@seadent.com.vn | Website: seadent.com.vn</div></div></div><div class="meta"><b>Ngày:</b> ${new Date().toLocaleDateString("vi-VN")}<br/><b>Mã báo giá:</b> SQC-${Date.now()}</div></div>
      <h2>BẢNG BÁO GIÁ</h2>
      <div class="customer"><b>Tên khách hàng:</b> ${customerName || "........................"}<br/><b>Số điện thoại:</b> ${customerPhone || "........................"}<br/><b>Địa chỉ:</b> ${customerAddress || "........................"}<br/><b>Ghi chú:</b> ${customerNote || "Không có"}</div>
      <table><thead><tr><th>#</th><th>Sản phẩm</th><th>Danh mục</th><th>Giá niêm yết</th><th>CK</th><th>Đơn giá sau CK</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="summary"><div class="sumrow"><div class="sumlabel">Tổng tiền trước chiết khấu</div><div class="sumvalue">${money(cartBeforeDiscount)}</div></div><div class="sumrow"><div class="sumlabel">Tổng tiền chiết khấu</div><div class="sumvalue">${money(cartDiscount)}</div></div><div class="sumrow sumfinal"><div class="sumlabel">Tổng cộng sau chiết khấu</div><div class="sumvalue">${money(cartTotal)}</div></div></div>
      <div class="note"><b>• Giá trên đã bao gồm thuế GTGT</b><br/><b>• Chất lượng hàng hoá mới 100%</b></div>
      <div style="margin-top:16px;color:#6b7280">Báo giá được tạo từ SEADENT Quote Center.</div>
      <div class="signature"><div><b>Khách hàng</b><br/><br/><br/>........................</div><div><b>Nhân viên phụ trách</b><br/><br/><br/>........................</div><div><b>Giám đốc kinh doanh</b><br/><br/><br/>........................</div></div>
      <script>window.onload=function(){window.print()}</script></body></html>`);
    win.document.close();
  };

  const css = {
    page: { minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", background: "#f8fafc", color: "#111827", fontFamily: "Arial, Helvetica, sans-serif", boxSizing: "border-box", padding: 12, paddingBottom: cartItems.length ? 108 : 24 },
    shell: { width: "100%", maxWidth: 1180, margin: "0 auto" },
    hero: { background: "linear-gradient(135deg,#fff,#fff7ed)", border: "1px solid #fed7aa", borderRadius: 22, padding: 16, boxShadow: "0 16px 38px rgba(15,23,42,.08)", marginBottom: 12 },
    heroGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, alignItems: "center" },
    brandRow: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
    logo: { width: 52, height: 52, objectFit: "contain", borderRadius: 16, background: "#fff", border: "1px solid #fed7aa", padding: 7, boxSizing: "border-box", flexShrink: 0 },
    badge: { display: "inline-block", background: "#fff1e7", color: "#ea580c", padding: "5px 9px", borderRadius: 999, fontWeight: 900, fontSize: 11, marginBottom: 6 },
    title: { margin: 0, fontSize: "clamp(25px,5.5vw,42px)", lineHeight: 1.05, letterSpacing: "-.04em" },
    muted: { color: "#6b7280", fontSize: 12, lineHeight: 1.45 },
    stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 },
    stat: { background: "rgba(255,255,255,.92)", border: "1px solid #eef0f4", borderRadius: 16, padding: 12, minWidth: 0 },
    statLabel: { color: "#6b7280", fontSize: 12, fontWeight: 800 },
    statValue: { color: "#ea580c", fontWeight: 950, fontSize: "clamp(16px,4.5vw,22px)", marginTop: 3, overflowWrap: "anywhere" },
    topGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, marginBottom: 12 },
    panel: { background: "#fff", border: "1px solid #eef0f4", borderRadius: 20, padding: 14, boxShadow: "0 14px 32px rgba(15,23,42,.06)", minWidth: 0 },
    input: { width: "100%", height: 46, background: "#f8fafc", color: "#111827", border: "1px solid #e5e7eb", borderRadius: 14, padding: "0 13px", fontSize: 16, outline: "none", boxSizing: "border-box" },
    btn: { width: "100%", minHeight: 46, border: "none", borderRadius: 15, padding: "11px 13px", fontSize: 14, fontWeight: 900, cursor: "pointer", background: "#f97316", color: "#fff" },
    btnDark: { background: "#111827", color: "#fff" },
    btnLight: { background: "#fff", color: "#374151", border: "1px solid #e5e7eb" },
    btnDanger: { background: "#fff1f2", color: "#e11d48", border: "1px solid #ffe4e6" },
    stack: { display: "grid", gridTemplateColumns: "1fr", gap: 10 },
    toolGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginTop: 10 },
    category: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: "12px 14px", fontWeight: 950, color: "#111827" },
    count: { background: "#fff1e7", color: "#ea580c", borderRadius: 999, padding: "5px 9px", fontSize: 12, fontWeight: 900 },
    cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 },
    card: { background: "#fff", border: "1px solid #eef0f4", borderRadius: 18, padding: 14, boxShadow: "0 14px 32px rgba(15,23,42,.06)", minWidth: 0 },
    productTitle: { fontSize: 16, fontWeight: 950, lineHeight: 1.35, marginBottom: 8, overflowWrap: "anywhere" },
    tag: { display: "inline-block", background: "#fff1e7", color: "#ea580c", borderRadius: 999, padding: "5px 9px", fontSize: 12, fontWeight: 900 },
    line: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f1f5f9", color: "#4b5563", fontSize: 13 },
    value: { color: "#111827", fontWeight: 900, textAlign: "right", overflowWrap: "anywhere" },
    price: { color: "#ea580c", fontWeight: 950 },
    miniInput: { width: 78, height: 38, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0 8px", fontSize: 16, fontWeight: 900, boxSizing: "border-box" },
    formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10, marginBottom: 12 },
    summary: { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: 14, display: "grid", gap: 6, marginTop: 12 },
    sticky: { position: "fixed", left: 10, right: 10, bottom: 10, zIndex: 99, background: "#111827", color: "#fff", borderRadius: 20, padding: 10, boxShadow: "0 18px 50px rgba(0,0,0,.25)", display: cartItems.length ? "grid" : "none", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 640, margin: "0 auto" },
    stickyTop: { gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "0 4px 2px" },
    footer: { textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 20 },
  };

  const ProductCard = ({ product }) => {
    const discount = getDiscount(product.id);
    const price = calcPrice(product.price, discount);
    return (
      <div style={css.card}>
        <div style={css.productTitle}>{product.name}</div>
        <div style={{ marginBottom: 8 }}><span style={css.tag}>{product.category}</span></div>
        <div style={css.line}><span>Giá niêm yết</span><span style={css.value}>{money(product.price)}</span></div>
        <div style={css.line}><span>Tồn kho</span><span style={css.value}>{product.stock}</span></div>
        <div style={css.line}>
          <span>Chiết khấu</span>
          <span style={css.value}><input style={{ ...css.miniInput, opacity: isUnlocked ? 1 : 0.45 }} disabled={!isUnlocked} type="number" value={discount} onChange={(e) => updateDiscount(product.id, e.target.value)} /> %</span>
        </div>
        <div style={css.line}><span>Giá bán</span><span style={{ ...css.value, ...css.price }}>{money(price)}</span></div>
        <button style={{ ...css.btn, marginTop: 12 }} onClick={() => addToCart(product)}>+ Thêm vào giỏ hàng</button>
      </div>
    );
  };

  const CartCard = ({ item }) => (
    <div style={css.card}>
      <div style={css.productTitle}>{item.name}</div>
      <div style={css.line}><span>Đơn giá</span><span style={css.value}>{money(item.finalPrice)}</span></div>
      <div style={css.line}><span>Số lượng</span><input style={css.miniInput} type="number" min="1" value={item.quantity} onChange={(e) => updateQty(item.id, e.target.value)} /></div>
      <div style={css.line}><span>Thành tiền</span><span style={{ ...css.value, ...css.price }}>{money(item.finalPrice * item.quantity)}</span></div>
      <button style={{ ...css.btn, ...css.btnDanger, marginTop: 12 }} onClick={() => removeFromCart(item.id)}>Xóa sản phẩm</button>
    </div>
  );

  return (
    <div style={css.page}>
      <main style={css.shell}>
        <section style={css.hero}>
          <div style={css.heroGrid}>
            <div style={css.brandRow}>
              <img src="/logo.png" alt="SEADENT" style={css.logo} />
              <div>
                <div style={css.badge}>SEADENT PRICING</div>
                <h1 style={css.title}>Quote Center</h1>
                <div style={css.muted}>Báo giá nhanh trên mọi thiết bị</div>
              </div>
            </div>
            <div style={css.stats}>
              <div style={css.stat}><div style={css.statLabel}>Products</div><div style={css.statValue}>{products.length}</div></div>
              <div style={css.stat}><div style={css.statLabel}>Quote Total</div><div style={css.statValue}>{money(quoteTotal)}</div></div>
              <div style={css.stat}><div style={css.statLabel}>Cart Total</div><div style={css.statValue}>{money(cartTotal)}</div></div>
            </div>
          </div>
        </section>

        <div style={css.topGrid}>
          <section style={css.panel}>
            <input style={css.input} placeholder="Tìm nhanh sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div style={css.toolGrid}>
              <button style={{ ...css.btn, ...(isGrouped ? {} : css.btnLight) }} onClick={() => setIsGrouped(!isGrouped)}>{isGrouped ? "✓ Group" : "Group"}</button>
              {isGrouped && <button style={{ ...css.btn, ...css.btnLight }} onClick={() => setCollapsed({})}>Mở tất cả</button>}
              {isGrouped && <button style={{ ...css.btn, ...css.btnLight }} onClick={() => setCollapsed(Object.fromEntries(categories.map((c) => [c, true])))}>Thu gọn</button>}
            </div>
            <div style={{ ...css.muted, marginTop: 10 }}>{syncStatus}</div>
          </section>

          <section style={css.panel}>
            <div style={css.badge}>{isUnlocked ? "🔓 Đã mở khóa" : "🔒 Đang khóa"}</div>
            <div style={css.stack}>
              <input style={{ ...css.input, opacity: isUnlocked ? 1 : 0.45 }} type="number" value={globalDiscount} disabled={!isUnlocked} onChange={(e) => applyGlobalDiscount(e.target.value)} />
              <input style={css.input} type="password" placeholder="Password" value={password} disabled={isUnlocked} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlockDiscount()} />
              <button style={css.btn} onClick={isUnlocked ? () => setIsUnlocked(false) : unlockDiscount}>{isUnlocked ? "Khóa lại" : "Mở khóa"}</button>
              <button style={{ ...css.btn, ...css.btnDanger, opacity: isUnlocked ? 1 : 0.5 }} onClick={() => isUnlocked ? applyGlobalDiscount(0) : alert("Vui lòng mở khóa trước")}>Reset Discount</button>
            </div>
          </section>
        </div>

        <section style={css.stack}>
          {isGrouped ? categories.map((category) => (
            <React.Fragment key={category}>
              <div style={css.category} onClick={() => setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))}>
                <span>{collapsed[category] ? "▸" : "▾"} {category}</span>
                <span style={css.count}>{grouped[category].length}</span>
              </div>
              {!collapsed[category] && <div style={css.cardGrid}>{grouped[category].map((product) => <ProductCard key={product.id} product={product} />)}</div>}
            </React.Fragment>
          )) : <div style={css.cardGrid}>{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
        </section>

        <section id="quote-cart" style={{ ...css.panel, marginTop: 14 }}>
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Giỏ hàng báo giá</h2>
            <div style={css.muted}>{cartQty} sản phẩm đã chọn</div>
          </div>
          <div style={css.toolGrid}>
            <button style={{ ...css.btn, ...css.btnDark }} onClick={exportQuotePdf}>Xuất PDF</button>
            <button style={{ ...css.btn, ...css.btnDanger }} onClick={() => setCart({})}>Xóa giỏ hàng</button>
          </div>

          <div style={{ ...css.formGrid, marginTop: 12 }}>
            <input style={css.input} placeholder="Tên khách hàng / phòng khám" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input style={css.input} placeholder="Số điện thoại" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <input style={css.input} placeholder="Địa chỉ" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
            <input style={css.input} placeholder="Ghi chú" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
          </div>

          {!cartItems.length ? (
            <div style={{ ...css.card, textAlign: "center", color: "#64748b" }}>Chưa có sản phẩm trong giỏ hàng.</div>
          ) : (
            <>
              <div style={css.cardGrid}>{cartItems.map((item) => <CartCard key={item.id} item={item} />)}</div>
              <div style={css.summary}>
                <strong>Tổng cộng {cartQty} sản phẩm</strong>
                <div style={css.muted}>Trước CK: {money(cartBeforeDiscount)}</div>
                <div style={css.muted}>Tiền CK: {money(cartDiscount)}</div>
                <div style={{ ...css.statValue, fontSize: 26 }}>{money(cartTotal)}</div>
              </div>
            </>
          )}
        </section>

        <div style={css.footer}>SEADENT Quote Center © 2026</div>
      </main>

      <div style={css.sticky}>
        <div style={css.stickyTop}>
          <span>Tổng báo giá</span>
          <strong>{money(cartTotal)}</strong>
        </div>
        <button style={{ ...css.btn, ...css.btnLight }} onClick={scrollToCart}>Xem giỏ</button>
        <button style={css.btn} onClick={exportQuotePdf}>Xuất PDF</button>
      </div>
    </div>
  );
}
