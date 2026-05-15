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

const STYLES = `
  * { box-sizing: border-box; }
  html, body, #root { width: 100%; max-width: 100%; margin: 0; overflow-x: hidden; }
  body { background: #f8fafc; font-family: Arial, Helvetica, sans-serif; color: #111827; }
  button, input { font-family: inherit; }

  .sq-page { min-height: 100vh; width: 100%; max-width: 100vw; overflow-x: hidden; padding: 12px 12px 112px; background: #f8fafc; }
  .sq-shell { width: 100%; max-width: 1180px; margin: 0 auto; }
  .sq-hero { background: linear-gradient(135deg,#fff,#fff7ed); border: 1px solid #fed7aa; border-radius: 22px; padding: 16px; box-shadow: 0 16px 38px rgba(15,23,42,.08); margin-bottom: 12px; }
  .sq-brand { display: flex; gap: 12px; align-items: center; min-width: 0; }
  .sq-logo { width: 52px; height: 52px; object-fit: contain; border-radius: 16px; background: #fff; border: 1px solid #fed7aa; padding: 7px; flex: 0 0 auto; }
  .sq-badge { display: inline-block; background: #fff1e7; color: #ea580c; padding: 5px 9px; border-radius: 999px; font-weight: 900; font-size: 11px; margin-bottom: 6px; }
  .sq-title { margin: 0; font-size: 25px; line-height: 1.05; letter-spacing: -.04em; }
  .sq-muted { color: #6b7280; font-size: 12px; line-height: 1.45; }
  .sq-stats { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 14px; }
  .sq-stat { background: rgba(255,255,255,.92); border: 1px solid #eef0f4; border-radius: 16px; padding: 12px; min-width: 0; }
  .sq-stat-label { color: #6b7280; font-size: 12px; font-weight: 800; }
  .sq-stat-value { color: #ea580c; font-weight: 950; font-size: 18px; margin-top: 3px; overflow-wrap: anywhere; }

  .sq-panel { background: #fff; border: 1px solid #eef0f4; border-radius: 20px; padding: 14px; box-shadow: 0 14px 32px rgba(15,23,42,.06); margin-bottom: 12px; min-width: 0; }
  .sq-input { width: 100%; height: 46px; background: #f8fafc; color: #111827; border: 1px solid #e5e7eb; border-radius: 14px; padding: 0 13px; font-size: 16px; outline: none; }
  .sq-btn { width: 100%; min-height: 46px; border: none; border-radius: 15px; padding: 11px 13px; font-size: 14px; font-weight: 900; cursor: pointer; background: #f97316; color: #fff; }
  .sq-btn-dark { background: #111827; color: #fff; }
  .sq-btn-light { background: #fff; color: #374151; border: 1px solid #e5e7eb; }
  .sq-btn-danger { background: #fff1f2; color: #e11d48; border: 1px solid #ffe4e6; }
  .sq-stack { display: grid; grid-template-columns: 1fr; gap: 10px; }
  .sq-tools { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 10px; }

  .sq-category { display: flex; justify-content: space-between; align-items: center; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 12px 14px; font-weight: 950; color: #111827; }
  .sq-count { background: #fff1e7; color: #ea580c; border-radius: 999px; padding: 5px 9px; font-size: 12px; font-weight: 900; }
  .sq-card-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
  .sq-card { background: #fff; border: 1px solid #eef0f4; border-radius: 18px; padding: 14px; box-shadow: 0 14px 32px rgba(15,23,42,.06); min-width: 0; }
  .sq-product-title { font-size: 16px; font-weight: 950; line-height: 1.35; margin-bottom: 8px; overflow-wrap: anywhere; }
  .sq-tag { display: inline-block; background: #fff1e7; color: #ea580c; border-radius: 999px; padding: 5px 9px; font-size: 12px; font-weight: 900; }
  .sq-line { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #4b5563; font-size: 13px; }
  .sq-value { color: #111827; font-weight: 900; text-align: right; overflow-wrap: anywhere; }
  .sq-price { color: #ea580c; font-weight: 950; }
  .sq-mini-input { width: 78px; height: 38px; background: #ffffff; color: #111827; border: 1px solid #d1d5db; border-radius: 10px; padding: 0 8px; font-size: 16px; font-weight: 900; text-align: center; outline: none; opacity: 1; -webkit-text-fill-color: #111827; caret-color: #111827; }
  .sq-mini-input:disabled { background: #f3f4f6; color: #111827; -webkit-text-fill-color: #111827; opacity: .65; }
  .sq-mini-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,.15); }
  .sq-summary { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 14px; display: grid; gap: 6px; margin-top: 12px; }

  .sq-sticky { position: fixed; left: 10px; right: 10px; bottom: 10px; z-index: 99; background: #111827; color: #fff; border-radius: 20px; padding: 10px; box-shadow: 0 18px 50px rgba(0,0,0,.25); display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-width: 640px; margin: 0 auto; }
  .sq-sticky-top { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 0 4px 2px; }
  .sq-footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }

  @media (min-width: 768px) {
    .sq-page { padding: 24px 24px 112px; }
    .sq-hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 16px; align-items: center; }
    .sq-title { font-size: 42px; }
    .sq-logo { width: 72px; height: 72px; }
    .sq-stats { grid-template-columns: repeat(3, minmax(0,1fr)); margin-top: 0; }
    .sq-top-grid { display: grid; grid-template-columns: minmax(0,1fr) 360px; gap: 12px; }
    .sq-tools { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .sq-card-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .sq-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
  }

  @media (min-width: 1100px) {
    .sq-card-grid { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .sq-form-grid { grid-template-columns: repeat(4, minmax(0,1fr)); }
  }
`;

function ProductCard({ product, discount, isUnlocked, updateDiscount, addToCart }) {
  const price = calcPrice(product.price, discount);
  return (
    <div className="sq-card">
      <div className="sq-product-title">{product.name}</div>
      <div style={{ marginBottom: 8 }}><span className="sq-tag">{product.category}</span></div>
      <div className="sq-line"><span>Giá niêm yết</span><span className="sq-value">{money(product.price)}</span></div>
      <div className="sq-line"><span>Tồn kho</span><span className="sq-value">{product.stock}</span></div>
      <div className="sq-line">
        <span>Chiết khấu</span>
        <span className="sq-value">
          <input className="sq-mini-input" style={{ opacity: isUnlocked ? 1 : 0.45 }} disabled={!isUnlocked} type="number" value={discount} onChange={(e) => updateDiscount(product.id, e.target.value)} /> %
        </span>
      </div>
      <div className="sq-line"><span>Giá bán</span><span className="sq-value sq-price">{money(price)}</span></div>
      <button className="sq-btn" style={{ marginTop: 12 }} onClick={() => addToCart(product)}>+ Thêm vào giỏ hàng</button>
    </div>
  );
}

function CartCard({ item, updateQty, updateCartDiscount, removeFromCart, isUnlocked }) {
  return (
    <div className="sq-card">
      <div className="sq-product-title">{item.name}</div>
      <div className="sq-line"><span>Đơn giá</span><span className="sq-value">{money(item.finalPrice)}</span></div>
      <div className="sq-line">
        <span>Chiết khấu</span>
        <span className="sq-value">
          <input
            className="sq-mini-input"
            type="number"
            min="0"
            max="100"
            value={item.discount}
            disabled={!isUnlocked}
            style={{ opacity: isUnlocked ? 1 : 0.45 }}
            onChange={(e) => updateCartDiscount(item.id, e.target.value)}
          /> %
        </span>
      </div>
      <div className="sq-line"><span>Số lượng</span><input className="sq-mini-input" type="number" min="1" value={item.quantity} onChange={(e) => updateQty(item.id, e.target.value)} /></div>
      <div className="sq-line"><span>Thành tiền</span><span className="sq-value sq-price">{money(item.finalPrice * item.quantity)}</span></div>
      <button className="sq-btn sq-btn-danger" style={{ marginTop: 12 }} onClick={() => removeFromCart(item.id)}>Xóa sản phẩm</button>
    </div>
  );
}

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
      try {
        const res = await fetch(`https://opensheet.elk.sh/${GOOGLE_SHEET_ID}/${GOOGLE_SHEET_TAB}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const formatted = data.map(normalizeProduct).filter((p) => p.name);
        setProducts(formatted.length ? formatted : DEMO_PRODUCTS);
        setDiscounts(Object.fromEntries((formatted.length ? formatted : DEMO_PRODUCTS).map((p) => [p.id, p.discount])));
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

  const updateCartDiscount = (id, value) => {
    if (!isUnlocked) return;
    const discount = Math.max(0, Math.min(100, num(value)));

    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;

      return {
        ...prev,
        [id]: {
          ...item,
          discount,
          finalPrice: calcPrice(item.price, discount),
        },
      };
    });
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
        .summary{width:460px;margin-left:auto;margin-top:18px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}.sumrow{display:grid;grid-template-columns:210px 1fr;gap:14px;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px}.sumlabel{font-weight:700}.sumvalue{text-align:right;font-weight:800;white-space:nowrap}.sumfinal{background:#fff7ed;color:#f97316;font-size:14px}.sumfinal .sumvalue{font-size:16px}.note{margin-top:16px;padding:10px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;color:#7c2d12;line-height:1.55;font-size:12px}.signature{display:flex;justify-content:space-between;margin-top:40px;text-align:center;font-size:12px}@media print{body{padding:18px}}
      </style></head><body>
      <div class="header"><div style="display:flex;gap:14px"><img src="/logo.png" style="width:82px;object-fit:contain"/><div><div class="brand">CÔNG TY CỔ PHẦN SEADENT</div><div class="sub">VP.HCM: 13 Đặng Tất, Phường Tân Định, TP.HCM<br/>VP.HN: Tầng 6, 110-112 Bà Triệu, Hà Nội<br/>Hotline: 0934831516 | Email: info@seadent.com.vn | Website: seadent.com.vn</div></div></div><div class="meta"><b>Ngày:</b> ${new Date().toLocaleDateString("vi-VN")}<br/><b>Mã báo giá:</b> SQC-${Date.now()}</div></div>
      <h2>BẢNG BÁO GIÁ</h2>
      <div class="customer"><b>Tên khách hàng:</b> ${customerName || "........................"}<br/><b>Số điện thoại:</b> ${customerPhone || "........................"}<br/><b>Địa chỉ:</b> ${customerAddress || "........................"}<br/><b>Ghi chú:</b> ${customerNote || "Không có"}</div>
      <table><thead><tr><th>#</th><th>Sản phẩm</th><th>Danh mục</th><th>Giá niêm yết</th><th>CK</th><th>Đơn giá sau CK</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="summary"><div class="sumrow"><div class="sumlabel">Tổng tiền trước chiết khấu</div><div class="sumvalue">${money(cartBeforeDiscount)}</div></div><div class="sumrow"><div class="sumlabel">Tổng tiền chiết khấu</div><div class="sumvalue">${money(cartDiscount)}</div></div><div class="sumrow sumfinal"><div class="sumlabel">Tổng cộng sau chiết khấu</div><div class="sumvalue">${money(cartTotal)}</div></div></div>
      <div class="note">
        <b>• Giá trên đã bao gồm thuế GTGT</b><br/>
        <b>• Chất lượng hàng hoá mới 100%</b><br/>
        <b>• Báo giá được tạo từ SEADENT Quote Center</b>
      </div>
      <div class="signature"><div><b>Khách hàng</b><br/><br/><br/>........................</div><div><b>Nhân viên phụ trách</b><br/><br/><br/>........................</div><div><b>Giám đốc kinh doanh</b><br/><br/><br/>........................</div></div>
      <script>window.onload=function(){window.print()}</script></body></html>`);
    win.document.close();
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="sq-page">
        <main className="sq-shell">
          <section className="sq-hero">
            <div className="sq-hero-grid">
              <div className="sq-brand">
                <img src="/logo.png" alt="SEADENT" className="sq-logo" />
                <div>
                  <div className="sq-badge">SEADENT PRICING</div>
                  <h1 className="sq-title">Quote Center</h1>
                  <div className="sq-muted">Báo giá nhanh trên mọi thiết bị</div>
                </div>
              </div>
              <div className="sq-stats">
                <div className="sq-stat"><div className="sq-stat-label">Products</div><div className="sq-stat-value">{products.length}</div></div>
                <div className="sq-stat"><div className="sq-stat-label">Quote Total</div><div className="sq-stat-value">{money(quoteTotal)}</div></div>
                <div className="sq-stat"><div className="sq-stat-label">Cart Total</div><div className="sq-stat-value">{money(cartTotal)}</div></div>
              </div>
            </div>
          </section>

          <div className="sq-top-grid">
            <section className="sq-panel">
              <input className="sq-input" placeholder="Tìm nhanh sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="sq-tools">
                <button className={`sq-btn ${isGrouped ? "" : "sq-btn-light"}`} onClick={() => setIsGrouped(!isGrouped)}>{isGrouped ? "✓ Group" : "Group"}</button>
                {isGrouped && <button className="sq-btn sq-btn-light" onClick={() => setCollapsed({})}>Mở tất cả</button>}
                {isGrouped && <button className="sq-btn sq-btn-light" onClick={() => setCollapsed(Object.fromEntries(categories.map((c) => [c, true])))}>Thu gọn</button>}
              </div>
              <div className="sq-muted" style={{ marginTop: 10 }}>{syncStatus}</div>
            </section>

            <section className="sq-panel">
              <div className="sq-badge">{isUnlocked ? "🔓 Đã mở khóa" : "🔒 Đang khóa"}</div>
              <div className="sq-stack">
                <input className="sq-input" style={{ opacity: isUnlocked ? 1 : 0.45 }} type="number" value={globalDiscount} disabled={!isUnlocked} onChange={(e) => applyGlobalDiscount(e.target.value)} />
                <input className="sq-input" type="password" placeholder="Password" value={password} disabled={isUnlocked} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlockDiscount()} />
                <button className="sq-btn" onClick={isUnlocked ? () => setIsUnlocked(false) : unlockDiscount}>{isUnlocked ? "Khóa lại" : "Mở khóa"}</button>
                <button className="sq-btn sq-btn-danger" style={{ opacity: isUnlocked ? 1 : 0.5 }} onClick={() => isUnlocked ? applyGlobalDiscount(0) : alert("Vui lòng mở khóa trước")}>Reset Discount</button>
              </div>
            </section>
          </div>

          <section className="sq-stack">
            {isGrouped ? categories.map((category) => (
              <React.Fragment key={category}>
                <div className="sq-category" onClick={() => setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))}>
                  <span>{collapsed[category] ? "▸" : "▾"} {category}</span>
                  <span className="sq-count">{grouped[category].length}</span>
                </div>
                {!collapsed[category] && <div className="sq-card-grid">{grouped[category].map((product) => <ProductCard key={product.id} product={product} discount={getDiscount(product.id)} isUnlocked={isUnlocked} updateDiscount={updateDiscount} addToCart={addToCart} />)}</div>}
              </React.Fragment>
            )) : <div className="sq-card-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} discount={getDiscount(product.id)} isUnlocked={isUnlocked} updateDiscount={updateDiscount} addToCart={addToCart} />)}</div>}
          </section>

          <section id="quote-cart" className="sq-panel" style={{ marginTop: 14 }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22 }}>Giỏ hàng báo giá</h2>
              <div className="sq-muted">{cartQty} sản phẩm đã chọn</div>
            </div>
            <div className="sq-tools">
              <button className="sq-btn sq-btn-dark" onClick={exportQuotePdf}>Xuất PDF</button>
              <button className="sq-btn sq-btn-danger" onClick={() => setCart({})}>Xóa giỏ hàng</button>
            </div>

            <div className="sq-form-grid" style={{ marginTop: 12, marginBottom: 12 }}>
              <input className="sq-input" placeholder="Tên khách hàng / phòng khám" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <input className="sq-input" placeholder="Số điện thoại" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              <input className="sq-input" placeholder="Địa chỉ" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
              <input className="sq-input" placeholder="Ghi chú" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
            </div>

            {!cartItems.length ? (
              <div className="sq-card" style={{ textAlign: "center", color: "#64748b" }}>Chưa có sản phẩm trong giỏ hàng.</div>
            ) : (
              <>
                <div className="sq-card-grid">{cartItems.map((item) => (
                  <CartCard
                    key={item.id}
                    item={item}
                    updateQty={updateQty}
                    updateCartDiscount={updateCartDiscount}
                    removeFromCart={removeFromCart}
                    isUnlocked={isUnlocked}
                  />
                ))}</div>
                <div className="sq-summary">
                  <strong>Tổng cộng {cartQty} sản phẩm</strong>
                  <div className="sq-muted">Trước CK: {money(cartBeforeDiscount)}</div>
                  <div className="sq-muted">Tiền CK: {money(cartDiscount)}</div>
                  <div className="sq-stat-value" style={{ fontSize: 26 }}>{money(cartTotal)}</div>
                </div>
              </>
            )}
          </section>

          <div className="sq-footer">SEADENT Quote Center © 2026</div>
        </main>

        {cartItems.length > 0 && (
          <div className="sq-sticky">
            <div className="sq-sticky-top">
              <span>Tổng báo giá</span>
              <strong>{money(cartTotal)}</strong>
            </div>
            <button className="sq-btn sq-btn-light" onClick={scrollToCart}>Xem giỏ</button>
            <button className="sq-btn" onClick={exportQuotePdf}>Xuất PDF</button>
          </div>
        )}
      </div>
    </>
  );
}
