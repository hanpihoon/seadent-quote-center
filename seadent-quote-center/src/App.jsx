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
const calcFinal = (price, discount) => num(price) - (num(price) * num(discount)) / 100;
const isBrowser = () => typeof window !== "undefined";

const getLocal = (key, fallback) => {
  if (!isBrowser()) return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const setLocal = (key, value) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore localStorage errors
  }
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
  const [width, setWidth] = React.useState(() => (isBrowser() ? window.innerWidth : 1280));

  React.useEffect(() => setLocal("seadent_discount_unlocked", String(isUnlocked)), [isUnlocked]);
  React.useEffect(() => setLocal("seadent_group_by_category", String(isGrouped)), [isGrouped]);

  React.useEffect(() => {
    if (!isBrowser()) return undefined;

    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      document.head.appendChild(viewport);
    }
    viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover");

    const onResize = () => {
      const safeWidth = Math.min(window.innerWidth || 1280, document.documentElement.clientWidth || 1280);
      setWidth(safeWidth);
    };

    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

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

  const isPhone = width <= 900 || (isBrowser() && /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent));
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
  const quoteTotal = filtered.reduce((sum, p) => sum + calcFinal(p.price, getDiscount(p.id)), 0);

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
      return { ...prev, [productId]: { ...item, discount, finalPrice: calcFinal(item.price, discount) } };
    });

    await syncDiscount({ action: "updateDiscount", id: productId, discount });
  };

  const applyGlobalDiscount = async (value) => {
    if (!isUnlocked) return;
    const discount = num(value);
    setGlobalDiscount(discount);
    setDiscounts(Object.fromEntries(products.map((p) => [p.id, discount])));
    setCart((prev) => Object.fromEntries(Object.values(prev).map((item) => [item.id, { ...item, discount, finalPrice: calcFinal(item.price, discount) }])));
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
        finalPrice: calcFinal(product.price, discount),
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
      <!doctype html><html><head><title>SEADENT Quotation</title>
      <style>
        body{font-family:Arial,sans-serif;color:#111827;padding:28px}.header{display:flex;justify-content:space-between;border-bottom:3px solid #f97316;padding-bottom:16px;margin-bottom:20px}
        .brand{font-size:24px;font-weight:900;color:#f97316}.sub{color:#6b7280;line-height:1.5}.meta{text-align:right;line-height:1.6}h2{text-align:center;margin:24px 0}
        .customer{background:#fff7ed;border:1px solid #fed7aa;padding:14px;border-radius:12px;margin-bottom:18px;line-height:1.8}table{width:100%;border-collapse:collapse}th{background:#f97316;color:white;padding:9px;font-size:12px;text-align:left}td{border-bottom:1px solid #e5e7eb;padding:9px;font-size:12px}
        .summary{width:520px;margin-left:auto;margin-top:22px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.sumrow{display:grid;grid-template-columns:220px 1fr;gap:18px;padding:10px 14px;border-bottom:1px solid #e5e7eb}.sumlabel{font-weight:800}.sumvalue{text-align:right;font-weight:900;white-space:nowrap}.sumfinal{background:#fff7ed;color:#f97316;font-size:18px}.note{margin-top:18px;padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;color:#7c2d12;line-height:1.8}.signature{display:flex;justify-content:space-between;margin-top:55px;text-align:center}@media print{body{padding:18px}}
      </style></head><body>
      <div class="header"><div style="display:flex;gap:14px"><img src="/logo.png" style="width:82px;object-fit:contain"/><div><div class="brand">CÔNG TY CỔ PHẦN SEADENT</div><div class="sub">VP.HCM: 13 Đặng Tất, Phường Tân Định, TP.HCM<br/>VP.HN: Tầng 6, 110-112 Bà Triệu, Hà Nội<br/>Hotline: 0901371516 · Email: info@seadent.com.vn · Website: seadent.com.vn</div></div></div><div class="meta"><b>Ngày:</b> ${new Date().toLocaleDateString("vi-VN")}<br/><b>Mã báo giá:</b> SQC-${Date.now()}</div></div>
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

  const s = {
    page: { minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", background: "linear-gradient(135deg,#fff 0%,#f6f7fb 50%,#fff3ea 100%)", color: "#111827", fontFamily: "Arial, Helvetica, sans-serif", padding: isPhone ? 10 : 28, boxSizing: "border-box" },
    container: { maxWidth: isPhone ? "100%" : 1280, margin: "0 auto", overflowX: "hidden" },
    card: { background: "#fff", border: "1px solid #eef0f4", borderRadius: isPhone ? 18 : 22, padding: isPhone ? 14 : 22, boxShadow: "0 18px 45px rgba(15,23,42,.07)" },
    hero: { display: "flex", flexDirection: isPhone ? "column" : "row", justifyContent: "space-between", gap: isPhone ? 16 : 24, alignItems: isPhone ? "stretch" : "center", marginBottom: isPhone ? 14 : 22, background: "linear-gradient(135deg,#fff,#fff7ed)", border: "1px solid #fed7aa", borderRadius: isPhone ? 22 : 28, padding: isPhone ? 16 : 26, boxShadow: "0 24px 65px rgba(15,23,42,.08)" },
    brand: { display: "flex", gap: isPhone ? 12 : 16, alignItems: "center" },
    logo: { width: isPhone ? 54 : 72, height: isPhone ? 54 : 72, objectFit: "contain", background: "#fff", borderRadius: isPhone ? 16 : 20, padding: 8, border: "1px solid #fed7aa" },
    title: { fontSize: isPhone ? 25 : 42, margin: 0, letterSpacing: "-.04em", lineHeight: 1.08 },
    muted: { color: "#6b7280", fontSize: isPhone ? 12 : 14 },
    badge: { display: "inline-block", background: "#fff1e7", color: "#ea580c", padding: "6px 10px", borderRadius: 999, fontWeight: 800, fontSize: 12, marginBottom: 8 },
    statGrid: { display: "grid", gridTemplateColumns: isPhone ? "1fr" : "repeat(3,150px)", gap: isPhone ? 8 : 12, width: isPhone ? "100%" : "auto" },
    stat: { background: "rgba(255,255,255,.9)", border: "1px solid #eef0f4", borderRadius: isPhone ? 14 : 18, padding: isPhone ? 10 : 16, minWidth: 0 },
    statValue: { color: "#ea580c", fontSize: isPhone ? 13 : 22, fontWeight: 900, wordBreak: "break-word" },
    grid: { display: "grid", gridTemplateColumns: isPhone ? "minmax(0,1fr)" : "1fr 360px", gap: isPhone ? 12 : 16, marginBottom: isPhone ? 12 : 18, width: "100%" },
    input: { width: "100%", background: "#f8fafc", color: "#111827", border: "1px solid #e5e7eb", borderRadius: 14, padding: isPhone ? "12px" : "12px 14px", outline: "none", boxSizing: "border-box", fontSize: 16 },
    button: { background: "#f97316", color: "#fff", border: "none", borderRadius: 999, padding: isPhone ? "11px 12px" : "10px 14px", cursor: "pointer", fontWeight: 900, fontSize: isPhone ? 13 : 14 },
    secondary: { background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 999, padding: isPhone ? "11px 12px" : "10px 13px", cursor: "pointer", fontWeight: 800, fontSize: isPhone ? 13 : 14 },
    dark: { background: "#111827", color: "#fff", border: "none", borderRadius: 999, padding: isPhone ? "11px 12px" : "10px 14px", cursor: "pointer", fontWeight: 900, fontSize: isPhone ? 13 : 14 },
    danger: { background: "#fff1f2", color: "#e11d48", border: "1px solid #ffe4e6", borderRadius: 999, padding: isPhone ? "11px 12px" : "10px 14px", cursor: "pointer", fontWeight: 900, fontSize: isPhone ? 13 : 14 },
    toolbar: { display: "flex", flexDirection: isPhone ? "column" : "row", gap: 10, flexWrap: "wrap", marginTop: 14 },
    tableWrap: { background: "#fff", border: "1px solid #eef0f4", borderRadius: 22, overflowX: "auto", boxShadow: "0 18px 45px rgba(15,23,42,.07)" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: 14, background: "#f9fafb", color: "#6b7280", fontSize: 12, textTransform: "uppercase", whiteSpace: "nowrap" },
    td: { padding: 14, borderTop: "1px solid #f1f5f9", color: "#374151", fontSize: 14 },
    category: { display: "flex", justifyContent: "space-between", padding: "14px 18px", background: "#fff7ed", cursor: "pointer", fontWeight: 900, color: "#111827" },
    tag: { background: "#fff1e7", color: "#ea580c", borderRadius: 999, padding: "5px 9px", fontWeight: 800, fontSize: 12, whiteSpace: "nowrap" },
    miniInput: { width: 82, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: 8, fontWeight: 800, fontSize: 16 },
    price: { color: "#ea580c", fontWeight: 900 },
    mobileList: { display: "grid", gap: 12, marginTop: 12 },
    mobileCategory: { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: "12px 14px", fontWeight: 900, color: "#111827", display: "flex", justifyContent: "space-between", alignItems: "center" },
    productCard: { background: "#fff", border: "1px solid #eef0f4", borderRadius: 18, padding: 14, boxShadow: "0 14px 32px rgba(15,23,42,.07)", width: "100%", boxSizing: "border-box" },
    productName: { fontSize: 16, fontWeight: 900, color: "#111827", lineHeight: 1.35, marginBottom: 8 },
    mobileLine: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f1f5f9", color: "#4b5563", fontSize: 13 },
    mobileValue: { fontWeight: 900, color: "#111827", textAlign: "right" },
    cart: { marginTop: isPhone ? 14 : 22, marginBottom: isPhone ? 116 : 0, scrollMarginTop: 12 },
    cartHeader: { display: "flex", flexDirection: isPhone ? "column" : "row", justifyContent: "space-between", alignItems: isPhone ? "stretch" : "center", gap: 12, marginBottom: 14 },
    formGrid: { display: "grid", gridTemplateColumns: isPhone ? "1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 14 },
    summary: { display: "flex", flexDirection: isPhone ? "column" : "row", justifyContent: "space-between", alignItems: isPhone ? "stretch" : "center", gap: isPhone ? 10 : 0, marginTop: 16, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 18, padding: 16 },
    sticky: { position: "fixed", left: 8, right: 8, bottom: 8, zIndex: 50, background: "#111827", color: "#fff", borderRadius: 18, padding: "10px", boxShadow: "0 18px 50px rgba(0,0,0,.24)", display: isPhone ? "grid" : "none", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "center" },
    stickyInfo: { gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "0 4px 2px" },
    stickyBtn: { border: "none", borderRadius: 14, padding: "12px 10px", fontWeight: 900, fontSize: 14, cursor: "pointer" },
    mobilePdfBtn: { width: "100%", background: "#111827", color: "#fff", border: "none", borderRadius: 16, padding: "14px 12px", fontWeight: 900, fontSize: 15, marginTop: 10, cursor: "pointer" },
    footer: { textAlign: "center", color: "#9ca3af", marginTop: 28, fontSize: 13, paddingBottom: isPhone ? 18 : 0 },
  };

  const ProductRow = ({ product }) => {
    const discount = getDiscount(product.id);
    const price = calcFinal(product.price, discount);
    return (
      <tr>
        <td style={{ ...s.td, fontWeight: 800 }}>{product.name}</td>
        <td style={s.td}><span style={s.tag}>{product.category}</span></td>
        <td style={s.td}>{product.stock}</td>
        <td style={s.td}>{money(product.price)}</td>
        <td style={s.td}><input style={{ ...s.miniInput, opacity: isUnlocked ? 1 : 0.45 }} disabled={!isUnlocked} type="number" value={discount} onChange={(e) => updateDiscount(product.id, e.target.value)} /> %</td>
        <td style={{ ...s.td, ...s.price }}>{money(price)}</td>
        <td style={s.td}><button style={s.button} onClick={() => addToCart(product)}>+ Giỏ hàng</button></td>
      </tr>
    );
  };

  const ProductCard = ({ product }) => {
    const discount = getDiscount(product.id);
    const price = calcFinal(product.price, discount);
    return (
      <div style={s.productCard}>
        <div style={s.productName}>{product.name}</div>
        <div style={{ marginBottom: 8 }}><span style={s.tag}>{product.category}</span></div>
        <div style={s.mobileLine}><span>Giá niêm yết</span><span style={s.mobileValue}>{money(product.price)}</span></div>
        <div style={s.mobileLine}><span>Tồn kho</span><span style={s.mobileValue}>{product.stock}</span></div>
        <div style={s.mobileLine}>
          <span>Chiết khấu</span>
          <span style={s.mobileValue}><input style={{ ...s.miniInput, width: 74, opacity: isUnlocked ? 1 : 0.45 }} disabled={!isUnlocked} type="number" value={discount} onChange={(e) => updateDiscount(product.id, e.target.value)} /> %</span>
        </div>
        <div style={s.mobileLine}><span>Giá bán</span><span style={{ ...s.mobileValue, color: "#ea580c" }}>{money(price)}</span></div>
        <button style={{ ...s.button, width: "100%", marginTop: 12 }} onClick={() => addToCart(product)}>+ Thêm vào giỏ hàng</button>
      </div>
    );
  };

  const CartCard = ({ item }) => (
    <div style={s.productCard}>
      <div style={s.productName}>{item.name}</div>
      <div style={s.mobileLine}><span>Đơn giá</span><span style={s.mobileValue}>{money(item.finalPrice)}</span></div>
      <div style={s.mobileLine}><span>Số lượng</span><input style={{ ...s.miniInput, width: 74 }} type="number" min="1" value={item.quantity} onChange={(e) => updateQty(item.id, e.target.value)} /></div>
      <div style={s.mobileLine}><span>Thành tiền</span><span style={{ ...s.mobileValue, color: "#ea580c" }}>{money(item.finalPrice * item.quantity)}</span></div>
      <button style={{ ...s.danger, width: "100%", marginTop: 12 }} onClick={() => removeFromCart(item.id)}>Xóa</button>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>
        <section style={s.hero}>
          <div style={s.brand}>
            <img src="/logo.png" alt="SEADENT" style={s.logo} />
            <div>
              <div style={s.badge}>● SEADENT PRICING SYSTEM</div>
              <h1 style={s.title}>SEADENT Quote Center</h1>
              <div style={s.muted}>Internal Pricing & Quotation Dashboard</div>
            </div>
          </div>
          <div style={s.statGrid}>
            <div style={s.stat}><div style={s.muted}>Products</div><div style={s.statValue}>{products.length}</div></div>
            <div style={s.stat}><div style={s.muted}>Quote Total</div><div style={s.statValue}>{money(quoteTotal)}</div></div>
            <div style={s.stat}><div style={s.muted}>Cart Total</div><div style={s.statValue}>{money(cartTotal)}</div></div>
          </div>
        </section>

        <div style={s.grid}>
          <div style={s.card}>
            <input style={s.input} placeholder="Tìm nhanh sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div style={s.toolbar}>
              <button style={{ ...(isGrouped ? s.button : s.secondary), width: isPhone ? "100%" : "auto" }} onClick={() => setIsGrouped(!isGrouped)}>{isGrouped ? "✓ Group by Category" : "Group by Category"}</button>
              {isGrouped && <><button style={{ ...s.secondary, width: isPhone ? "100%" : "auto" }} onClick={() => setCollapsed({})}>Expand all</button><button style={{ ...s.secondary, width: isPhone ? "100%" : "auto" }} onClick={() => setCollapsed(Object.fromEntries(categories.map((c) => [c, true])))}>Collapse all</button></>}
            </div>
            <div style={{ ...s.muted, marginTop: 12 }}>{syncStatus}</div>
          </div>

          <div style={s.card}>
            <div style={s.badge}>{isUnlocked ? "🔓 Discount Unlocked" : "🔒 Discount Locked"}</div>
            <input style={{ ...s.input, opacity: isUnlocked ? 1 : 0.45 }} type="number" value={globalDiscount} disabled={!isUnlocked} onChange={(e) => applyGlobalDiscount(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "1fr auto", gap: 10, marginTop: 12 }}>
              <input style={s.input} type="password" placeholder="Password" value={password} disabled={isUnlocked} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlockDiscount()} />
              <button style={s.button} onClick={isUnlocked ? () => setIsUnlocked(false) : unlockDiscount}>{isUnlocked ? "Lock" : "Unlock"}</button>
            </div>
            <button style={{ ...s.danger, width: "100%", marginTop: 10, opacity: isUnlocked ? 1 : 0.5 }} onClick={() => isUnlocked ? applyGlobalDiscount(0) : alert("Vui lòng mở khóa trước")}>Reset Discount</button>
          </div>
        </div>

        {isPhone ? (
          <div style={s.mobileList}>
            {isGrouped ? categories.map((category) => (
              <React.Fragment key={category}>
                <div style={s.mobileCategory} onClick={() => setCollapsed((p) => ({ ...p, [category]: !p[category] }))}>
                  <span>{collapsed[category] ? "▸" : "▾"} {category}</span>
                  <span style={s.tag}>{grouped[category].length}</span>
                </div>
                {!collapsed[category] && grouped[category].map((product) => <ProductCard key={product.id} product={product} />)}
              </React.Fragment>
            )) : filtered.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr><th style={s.th}>Product</th><th style={s.th}>Category</th><th style={s.th}>Stock</th><th style={s.th}>List Price</th><th style={s.th}>Discount</th><th style={s.th}>Final Price</th><th style={s.th}>Cart</th></tr></thead>
              <tbody>
                {isGrouped ? categories.map((category) => (
                  <React.Fragment key={category}>
                    <tr><td colSpan="7" style={{ padding: 0 }}><div style={s.category} onClick={() => setCollapsed((p) => ({ ...p, [category]: !p[category] }))}><span>{collapsed[category] ? "▸" : "▾"} {category} <span style={s.tag}>{grouped[category].length}</span></span><span>{collapsed[category] ? "+" : "−"}</span></div></td></tr>
                    {!collapsed[category] && grouped[category].map((product) => <ProductRow key={product.id} product={product} />)}
                  </React.Fragment>
                )) : filtered.map((product) => <ProductRow key={product.id} product={product} />)}
              </tbody>
            </table>
          </div>
        )}

        <section id="quote-cart" style={{ ...s.card, ...s.cart }}>
          <div style={{ display: "flex", flexDirection: isPhone ? "column" : "row", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <div><h2 style={{ margin: 0 }}>Giỏ hàng báo giá</h2><div style={s.muted}>{cartQty} sản phẩm đã chọn</div></div>
            <div style={s.toolbar}>
              <button style={{ ...s.dark, width: isPhone ? "100%" : "auto", padding: isPhone ? "14px 16px" : s.dark.padding }} onClick={exportQuotePdf}>Xuất PDF báo giá</button>
              <button style={{ ...s.danger, width: isPhone ? "100%" : "auto" }} onClick={() => setCart({})}>Xóa giỏ hàng</button>
            </div>
          </div>

          {isPhone && cartItems.length > 0 && (
            <button style={s.mobilePdfBtn} onClick={exportQuotePdf}>Xuất PDF báo giá</button>
          )}

          <div style={s.formGrid}>
            <input style={s.input} placeholder="Tên khách hàng / phòng khám" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input style={s.input} placeholder="Số điện thoại" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <input style={s.input} placeholder="Địa chỉ" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
            <input style={s.input} placeholder="Ghi chú" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
          </div>

          {!cartItems.length ? <div style={{ ...s.card, textAlign: "center", color: "#64748b" }}>Chưa có sản phẩm trong giỏ hàng.</div> : (
            <>
              {isPhone ? (
                <div style={s.mobileList}>{cartItems.map((item) => <CartCard key={item.id} item={item} />)}</div>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead><tr><th style={s.th}>Sản phẩm</th><th style={s.th}>Đơn giá sau CK</th><th style={s.th}>Số lượng</th><th style={s.th}>Thành tiền</th><th style={s.th}>Xóa</th></tr></thead>
                    <tbody>{cartItems.map((item) => <tr key={item.id}><td style={s.td}>{item.name}</td><td style={s.td}>{money(item.finalPrice)}</td><td style={s.td}><input style={s.miniInput} type="number" min="1" value={item.quantity} onChange={(e) => updateQty(item.id, e.target.value)} /></td><td style={{ ...s.td, ...s.price }}>{money(item.finalPrice * item.quantity)}</td><td style={s.td}><button style={s.danger} onClick={() => removeFromCart(item.id)}>Xóa</button></td></tr>)}</tbody>
                  </table>
                </div>
              )}
              <div style={s.summary}>
                <div><strong>Tổng cộng {cartQty} sản phẩm</strong><div style={s.muted}>Trước CK: {money(cartBeforeDiscount)} · Tiền CK: {money(cartDiscount)}</div></div>
                <div style={{ ...s.statValue, fontSize: isPhone ? 24 : 30 }}>{money(cartTotal)}</div>
              </div>
            </>
          )}
        </section>

        {isPhone && cartItems.length > 0 && (
          <div style={s.sticky}>
            <div style={s.stickyInfo}>
              <span>Tổng báo giá</span>
              <strong>{money(cartTotal)}</strong>
            </div>
            <button
              style={{ ...s.stickyBtn, background: "#ffffff", color: "#111827" }}
              onClick={() => document.getElementById("quote-cart")?.scrollIntoView({ behavior: "smooth" })}
            >
              Xem giỏ
            </button>
            <button
              style={{ ...s.stickyBtn, background: "#f97316", color: "#ffffff" }}
              onClick={exportQuotePdf}
            >
              Xuất PDF
            </button>
          </div>
        )}

        <div style={s.footer}>SEADENT Quote Center © 2026</div>
      </div>
    </div>
  );
}
