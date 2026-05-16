import React from "react";

const BANNER_URL = "/banner-seadent.png?v=2026-final";

const STYLES = `
*{box-sizing:border-box}html,body,#root{margin:0;padding:0;width:100%;min-height:100%;overflow-x:hidden;font-family:Arial,sans-serif;background:#f8fafc;color:#111827}body{background:#f5f7fb}img{max-width:100%;display:block}.sq-page{min-height:100vh;background:#f5f7fb;padding:16px;padding-bottom:120px}.sq-shell{width:100%;max-width:1280px;margin:0 auto}.seadent-banner-v2{width:100%;margin-bottom:18px;border-radius:24px;overflow:hidden;background:#fff;border:1px solid #fed7aa;box-shadow:0 8px 24px rgba(15,23,42,.05);line-height:0}.seadent-banner-v2__image{width:100%;aspect-ratio:1920/620;background-position:center;background-repeat:no-repeat;background-size:contain;background-color:#fff}.sq-hero,.sq-panel,.sq-card{background:#fff;border:1px solid #e5e7eb;border-radius:22px;box-shadow:0 8px 24px rgba(15,23,42,.05)}.sq-hero{padding:18px;margin-bottom:16px}.sq-hero-grid{display:grid;grid-template-columns:160px 1fr 160px;gap:18px;align-items:center}.sq-brand{display:flex;align-items:center;justify-content:center;gap:22px;text-align:center}.sq-hero-left{display:flex;align-items:center;justify-content:center;border-right:1px solid #e5e7eb;height:90px}.sq-title-orange{color:#ea580c}.sq-logo{width:74px;height:74px;object-fit:contain;background:#fff7ed;padding:10px;border-radius:18px}.sq-badge{display:inline-flex;align-items:center;justify-content:center;padding:8px 14px;border-radius:999px;background:#fff1e7;color:#ea580c;font-size:13px;font-weight:800;margin-bottom:10px}.sq-title{margin:0;font-size:64px;font-weight:900;line-height:1}.sq-muted{color:#6b7280;font-size:14px;line-height:1.6}.sq-stats{display:flex;gap:14px;justify-content:flex-end}.sq-stat{min-width:130px;background:#fff7ed;border-radius:18px;padding:18px;text-align:center}.sq-stat-label{font-size:14px;color:#6b7280;margin-bottom:8px;font-weight:700}.sq-stat-value{font-size:36px;font-weight:900;color:#ea580c}.sq-top-grid{display:grid;grid-template-columns:1fr 340px;gap:16px;margin-bottom:18px}.sq-panel{padding:18px}.sq-stack{display:flex;flex-direction:column;gap:12px}.sq-tools{display:flex;gap:12px;margin-top:14px;flex-wrap:wrap}.sq-input{width:100%;height:54px;border-radius:16px;border:1px solid #d1d5db;padding:0 18px;font-size:18px;background:#fff;outline:none}.sq-input:focus{border-color:#f97316}.sq-btn{height:52px;border:none;border-radius:16px;padding:0 22px;background:#ff730f;color:#fff;font-size:17px;font-weight:800;cursor:pointer;transition:.2s}.sq-btn:hover{opacity:.92}.sq-btn-light{background:#fff;color:#111827;border:1px solid #d1d5db}.sq-btn-dark{background:#111827}.sq-btn-danger{background:#fff5f5;color:#ef4444;border:1px solid #fecaca}.sq-category{display:flex;align-items:center;justify-content:space-between;background:#fffaf3;border:1px solid #fed7aa;border-radius:22px;padding:18px 22px;font-size:20px;font-weight:800;cursor:pointer;margin-bottom:14px}.sq-count{width:42px;height:42px;border-radius:999px;background:#fff;color:#f97316;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px}.sq-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:18px}.sq-card{padding:18px}.sq-product-title{font-size:18px;font-weight:900;margin-bottom:14px}.sq-tag{display:inline-flex;align-items:center;justify-content:center;padding:8px 14px;border-radius:999px;background:#fff1e7;color:#ea580c;font-size:13px;font-weight:800}.sq-line{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #f1f5f9;gap:10px}.sq-value{font-weight:800}.sq-price{color:#ea580c}.sq-mini-input{width:70px;height:42px;border-radius:12px;border:1px solid #d1d5db;text-align:center;font-size:16px;color:#111827;-webkit-text-fill-color:#111827;background:#fff}.sq-summary{margin-top:18px;background:#fff7ed;border-radius:18px;padding:18px;border:1px solid #fed7aa}.sq-form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.login-overlay{position:fixed;inset:0;z-index:999;background:rgba(15,23,42,.65);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(12px)}.login-card{width:100%;max-width:420px;background:#fff;border-radius:28px;padding:34px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25)}.login-logo{width:100px;margin:0 auto 20px}.login-title{margin:0;font-size:32px;font-weight:900}.login-subtitle{margin-top:10px;color:#6b7280}.login-form{margin-top:24px;display:flex;flex-direction:column;gap:14px}.login-input{width:100%;height:54px;border-radius:16px;border:1px solid #d1d5db;padding:0 16px;font-size:16px}.login-button{height:54px;border:none;border-radius:16px;background:#ff730f;color:#fff;font-size:18px;font-weight:800;cursor:pointer}.login-secure{margin-top:18px;font-size:13px;color:#94a3b8}.login-error{color:#ef4444;font-size:14px;font-weight:700}.login-blur{filter:blur(8px);pointer-events:none;user-select:none}.sq-sticky{position:fixed;left:0;right:0;bottom:0;z-index:50;background:#fff;border-top:1px solid #e5e7eb;padding:14px;display:flex;gap:12px;align-items:center;justify-content:center;box-shadow:0 -8px 24px rgba(15,23,42,.08)}.sq-sticky-top{display:flex;flex-direction:column;margin-right:12px}.sq-footer{text-align:center;padding:30px 0;color:#94a3b8;font-size:14px}.welcome-toast{position:fixed;top:24px;right:24px;z-index:9999;background:#111827;color:#fff;padding:16px 22px;border-radius:18px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.25)}@media(max-width:1024px){.sq-top-grid{grid-template-columns:1fr}.sq-hero-grid{grid-template-columns:1fr}.sq-hero-left{border-right:0;height:auto}.sq-stats{width:100%;justify-content:center}.sq-title{font-size:44px}}@media(max-width:768px){.sq-page{padding:10px;padding-bottom:140px}.sq-form-grid{grid-template-columns:1fr}.sq-title{font-size:36px}.sq-card-grid{grid-template-columns:1fr}.sq-tools{flex-direction:column}.sq-btn{width:100%}.sq-stats{flex-direction:column}.sq-banner{border-radius:18px}.sq-category{font-size:18px}}
`;

const GOOGLE_SHEET_ID = "1HAFKnOoIs9VmdlmVuonjNSxpvKfzHlrCJ4l1zQq3HUs";
const GOOGLE_SHEET_TAB = "products";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhp4Rv3FCzVYziwUx-og_5O47HUaazt79G_0DJsu1Oz1v2fiip1yHYxwg81spFAKRKLg/exec";
const DISCOUNT_PASSWORD = "seadent";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "seadent";
// Preview mode: tăng thời gian auto-lock để không che banner khi kiểm tra giao diện.
const AUTO_LOCK_MS = 24 * 60 * 60 * 1000;


const DEMO_PRODUCTS = [
  { id: "1", name: "Planmeca Compact i5", category: "Dental Unit", price: 450000000, stock: 3, discount: 10, techDocUrl: "https://www.planmeca.com/dental-units/planmeca-compact-i5/" },
  { id: "2", name: "Belmont Clesta eIII", category: "Dental Unit", price: 390000000, stock: 2, discount: 12, techDocUrl: "https://belmontdental.com/products/clesta-eiii/" },
  { id: "3", name: "Durr VS 1200", category: "Suction", price: 89000000, stock: 8, discount: 8, techDocUrl: "https://www.duerrdental.com/en/products/suction-systems/" },
  { id: "4", name: "Melag Vacuklav", category: "Sterilization", price: 125000000, stock: 4, discount: 15, techDocUrl: "https://www.melag.com/en/products/autoclaves" },
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

const normalizeKey = (key) => String(key || "")
  .toLowerCase()
  .split(" ").join("")
  .split("_").join("")
  .split("-").join("")
  .split(".").join("")
  .trim();

const pickText = (item, keys) => {
  const wantedKeys = keys.map(normalizeKey);

  for (const [rawKey, rawValue] of Object.entries(item || {})) {
    const normalized = normalizeKey(rawKey);
    if (wantedKeys.includes(normalized) && rawValue !== undefined && rawValue !== null && String(rawValue).trim()) {
      return String(rawValue).trim();
    }
  }

  return "";
};

const normalizeProduct = (item, index) => ({
  id: String(item.id || item.ID || item.name || item.Name || index + 1),
  name: String(item.name || item.Name || item.product || item.Product || "Unnamed product"),
  category: String(item.category || item.Category || "Uncategorized"),
  price: num(item.price || item.Price || item.listPrice || item["List Price"]),
  stock: num(item.stock || item.Stock),
  discount: num(item.discount || item.Discount),
  techDocUrl: pickText(item, [
    "techurl",
    "techUrl",
    "techURL",
    "tech doc url",
    "techDocUrl",
    "techdocurl",
    "tech_doc_url",
    "documentUrl",
    "document url",
    "linktailieu",
    "link tai lieu",
    "tailieu",
    "tai lieu",
    "catalogue",
    "catalog",
  ]),
});

function ProductCard({ product, discount, isUnlocked, updateDiscount, addToCart }) {
  const price = calcPrice(product.price, discount);
  return (
    <div className="sq-card">
      <div className="sq-product-title">{product.name}</div>
      <div style={{ marginBottom: 8 }}>
        <span className="sq-tag">{product.category}</span>
        {product.techDocUrl && <span className="sq-tag" style={{ marginLeft: 6, background: "#ecfdf5", color: "#047857" }}>Có tài liệu</span>}
      </div>
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
  // Preview mode: mặc định mở khóa màn hình để xem nhanh banner và giao diện.
const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const [loginUser, setLoginUser] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [showWelcome, setShowWelcome] = React.useState(false);

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
  React.useEffect(() => setLocal("seadent_admin_logged_in", String(isLoggedIn)), [isLoggedIn]);

  React.useEffect(() => {
    if (!isBrowser() || !isLoggedIn) return undefined;

    let lockTimer;
    const resetAutoLock = () => {
      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(() => {
        setIsLoggedIn(false);
        setLoginPassword("");
        setLoginError("Phiên đăng nhập đã tự động khóa sau 1 phút không thao tác.");
      }, AUTO_LOCK_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((eventName) => window.addEventListener(eventName, resetAutoLock, { passive: true }));
    resetAutoLock();

    return () => {
      window.clearTimeout(lockTimer);
      events.forEach((eventName) => window.removeEventListener(eventName, resetAutoLock));
    };
  }, [isLoggedIn]);

  React.useEffect(() => {
    if (!showWelcome || !isBrowser()) return undefined;
    const timer = window.setTimeout(() => setShowWelcome(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showWelcome]);

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`https://opensheet.elk.sh/${GOOGLE_SHEET_ID}/${GOOGLE_SHEET_TAB}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const formatted = data.map(normalizeProduct).filter((p) => p.name);
        setProducts(formatted.length ? formatted : DEMO_PRODUCTS);
        setDiscounts(Object.fromEntries((formatted.length ? formatted : DEMO_PRODUCTS).map((p) => [p.id, p.discount])));
        const techCount = formatted.filter((p) => p.techDocUrl).length;
        setSyncStatus(`Đã đồng bộ Google Sheet · ${techCount} sản phẩm có tài liệu kỹ thuật`);
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

  const handleAdminLogin = () => {
    const validUser = loginUser.trim().toLowerCase() === ADMIN_USERNAME;
    const validPassword = loginPassword === ADMIN_PASSWORD;

    if (!validUser || !validPassword) {
      setLoginError("Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.");
      return;
    }

    setIsLoggedIn(true);
    setLoginUser("");
    setLoginPassword("");
    setLoginError("");
    setShowWelcome(true);
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
        techDocUrl: String(product.techDocUrl || "").trim(),
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

    const techDocRows = cartItems
      .filter((item) => item.techDocUrl)
      .map((item) => {
        const cleanUrl = String(item.techDocUrl || "").trim();
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(cleanUrl)}`;
        return `
          <div class="tech-card">
            <div class="tech-name">${item.name}</div>
            <div class="tech-qr-wrap"><img class="tech-qr" src="${qrUrl}" /></div>
            <div class="tech-caption">Quét QR để tải tài liệu</div>
          </div>
        `;
      }).join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!doctype html><html><head><meta charset="UTF-8" /><title>SEADENT Quotation</title>
      <style>
        body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#111827;padding:28px;-webkit-font-smoothing:antialiased}.header{display:flex;justify-content:space-between;border-bottom:3px solid #f97316;padding-bottom:16px;margin-bottom:20px}
        .brand{font-size:24px;font-weight:900;color:#f97316}.sub{color:#6b7280;line-height:1.5}.meta{text-align:right;line-height:1.6}h2{text-align:center;margin:24px 0}
        .customer{background:#fff7ed;border:1px solid #fed7aa;padding:14px;border-radius:12px;margin-bottom:18px;line-height:1.8}table{width:100%;border-collapse:collapse}th{background:#f97316;color:white;padding:9px;font-size:12px;text-align:left}td{border-bottom:1px solid #e5e7eb;padding:9px;font-size:12px}
        .summary{width:100%;margin:18px 0 0 0;border:1px solid #fed7aa;border-radius:10px;overflow:hidden;background:#fff}.sumrow{display:grid;grid-template-columns:1fr 240px;gap:16px;padding:8px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;align-items:center}.sumlabel{font-weight:700;line-height:1.3}.sumvalue{text-align:right;font-weight:800;white-space:nowrap;word-break:keep-all;overflow-wrap:normal}.sumfinal{background:#fff7ed;color:#f97316;font-size:13px}.sumfinal .sumvalue{font-size:15px;white-space:nowrap}.note{margin-top:16px;padding:10px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;color:#7c2d12;line-height:1.55;font-size:12px}.tech-section{margin-top:26px;padding-top:14px;border-top:2px solid #f97316;page-break-inside:avoid}.tech-title{font-size:15px;font-weight:900;color:#111827;margin-bottom:4px;text-align:center}.tech-subtitle{font-size:11px;color:#6b7280;text-align:center;margin-bottom:12px}.tech-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.tech-card{border:1px solid #fed7aa;border-radius:12px;padding:10px;background:#fffaf5;text-align:center;page-break-inside:avoid}.tech-name{font-size:11px;font-weight:800;color:#111827;line-height:1.35;min-height:32px;margin-bottom:8px}.tech-qr-wrap{display:inline-flex;align-items:center;justify-content:center;width:82px;height:82px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:5px}.tech-qr{width:72px;height:72px;object-fit:contain}.tech-caption{font-size:9px;color:#ea580c;font-weight:800;margin-top:6px}.signature{display:flex;justify-content:space-between;margin-top:40px;text-align:center;font-size:12px}@media print{body{padding:18px}}
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
      ${techDocRows ? `<div class="tech-section"><div class="tech-title">Tài liệu kỹ thuật sản phẩm</div><div class="tech-subtitle">Quét mã QR để xem hoặc tải tài liệu kỹ thuật tương ứng</div><div class="tech-grid">${techDocRows}</div></div>` : ""}
      <script>
        window.onload=function(){
          setTimeout(function(){ window.print(); }, 900);
        }
      </script></body></html>`);
    win.document.close();
  };

  return (
    <>
      <style>{STYLES}</style>
      {showWelcome && <div className="welcome-toast">Chào mừng admin trở lại SEADENT Quote Center</div>}
      {!isLoggedIn && (
        <div className="login-overlay">
          <div className="login-card">
            <img src="/logo.png" alt="SEADENT" className="login-logo" />
            <h2 className="login-title">SEADENT Login</h2>
            <div className="login-subtitle">Đăng nhập để truy cập hệ thống báo giá nội bộ</div>
            <div className="login-form">
              <input
                className="login-input"
                placeholder="User"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                autoFocus
              />
              <input
                className="login-input"
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />
              {loginError && <div className="login-error">{loginError}</div>}
              <button className="login-button" onClick={handleAdminLogin}>Đăng nhập</button>
            </div>
            <div className="login-secure">Hệ thống tự động khóa sau 1 phút không thao tác</div>
          </div>
        </div>
      )}
      <div className={isLoggedIn ? "sq-page" : "sq-page login-blur"}>
        <main className="sq-shell">
          <div className="seadent-banner-v2">
            <div className="seadent-banner-v2__image" style={{ backgroundImage: `url(${BANNER_URL})` }} />
          </div>
          <section className="sq-hero">
            <div className="sq-hero-grid">
              <div className="sq-hero-left">
                <img src="/logo.png" alt="SEADENT" className="sq-logo" />
              </div>
              <div className="sq-brand">
                <div>
                  <div className="sq-badge">SEADENT PRICING</div>
                  <h1 className="sq-title"><span className="sq-title-orange">Seadent</span> Quote Center</h1>
                  <div className="sq-muted">Báo giá nhanh trên mọi thiết bị</div>
                </div>
              </div>
              <div className="sq-stats">
                <div className="sq-stat"><div className="sq-stat-label">Products</div><div className="sq-stat-value">{products.length}</div></div>
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
