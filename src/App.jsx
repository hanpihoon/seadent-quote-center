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

function isBrowser() {
  return typeof window !== "undefined";
}

function safeLocalStorageGet(key, fallback = null) {
  if (!isBrowser()) return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeLocalStorageSet(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore localStorage errors
  }
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(toNumber(value)) + " đ";
}

function calculateFinalPrice(price, discount) {
  const safePrice = toNumber(price);
  const safeDiscount = toNumber(discount);
  return safePrice - (safePrice * safeDiscount) / 100;
}

function normalizeProduct(item, index) {
  return {
    id: String(item.id || item.name || index + 1),
    name: String(item.name || "Unnamed product"),
    category: String(item.category || "Uncategorized"),
    price: toNumber(item.price),
    stock: toNumber(item.stock),
    discount: toNumber(item.discount),
  };
}

function runDevTests() {
  if (!isBrowser()) return;
  if (import.meta?.env?.MODE === "production") return;

  console.assert(calculateFinalPrice(1000000, 10) === 900000, "Test failed: 10% discount");
  console.assert(calculateFinalPrice("200", "25") === 150, "Test failed: string numbers");
  console.assert(toNumber("abc", 7) === 7, "Test failed: invalid number fallback");

  const product = normalizeProduct({ id: 1, name: "Test", price: "100", stock: "2", discount: "5" }, 0);
  console.assert(product.id === "1", "Test failed: normalize id");
  console.assert(product.price === 100, "Test failed: normalize price");
}

export default function App() {
  const [search, setSearch] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [syncStatus, setSyncStatus] = React.useState("Đang tải dữ liệu...");
  const [screenWidth, setScreenWidth] = React.useState(1200);
  const [globalDiscount, setGlobalDiscount] = React.useState(10);
  const [discounts, setDiscounts] = React.useState({});
  const [products, setProducts] = React.useState(DEMO_PRODUCTS);
  const [collapsedCategories, setCollapsedCategories] = React.useState({});

  const [isDiscountUnlocked, setIsDiscountUnlocked] = React.useState(() => {
    return safeLocalStorageGet("seadent_discount_unlocked", "false") === "true";
  });

  const [isGroupedByCategory, setIsGroupedByCategory] = React.useState(() => {
    return safeLocalStorageGet("seadent_group_by_category", "true") === "true";
  });

  React.useEffect(() => {
    runDevTests();
  }, []);

  React.useEffect(() => {
    if (!isBrowser()) return undefined;

    const handleResize = () => setScreenWidth(window.innerWidth || 1200);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    safeLocalStorageSet("seadent_discount_unlocked", String(isDiscountUnlocked));
  }, [isDiscountUnlocked]);

  React.useEffect(() => {
    safeLocalStorageSet("seadent_group_by_category", String(isGroupedByCategory));
  }, [isGroupedByCategory]);

  React.useEffect(() => {
    const loadProducts = async () => {
      const isSheetConfigured = GOOGLE_SHEET_ID && GOOGLE_SHEET_ID !== "GOOGLE_SHEET_ID";

      if (!isSheetConfigured) {
        const demoDiscounts = {};
        DEMO_PRODUCTS.forEach((product) => {
          demoDiscounts[product.id] = product.discount;
        });
        setProducts(DEMO_PRODUCTS);
        setDiscounts(demoDiscounts);
        setSyncStatus("Đang dùng dữ liệu demo. Hãy thay GOOGLE_SHEET_ID để đồng bộ Google Sheet.");
        return;
      }

      try {
        const response = await fetch(`https://opensheet.elk.sh/${GOOGLE_SHEET_ID}/${GOOGLE_SHEET_TAB}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Google Sheet response is not an array");
        }

        const formatted = data.map(normalizeProduct).filter((item) => item.name);

        if (formatted.length === 0) {
          throw new Error("No products found in Google Sheet");
        }

        const sheetDiscounts = {};
        formatted.forEach((product) => {
          sheetDiscounts[product.id] = product.discount;
        });

        setProducts(formatted);
        setDiscounts(sheetDiscounts);
        setSyncStatus("Đã đồng bộ dữ liệu từ Google Sheet");
      } catch (error) {
        console.error("Google Sheet Error:", error);

        const demoDiscounts = {};
        DEMO_PRODUCTS.forEach((product) => {
          demoDiscounts[product.id] = product.discount;
        });

        setProducts(DEMO_PRODUCTS);
        setDiscounts(demoDiscounts);
        setSyncStatus("Không tải được Google Sheet. Đang dùng dữ liệu demo để web không bị lỗi.");
      }
    };

    loadProducts();
  }, []);

  const isMobile = screenWidth <= 760;
  const isTablet = screenWidth <= 1024;
  const isScriptConfigured = GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "GOOGLE_APPS_SCRIPT_WEB_APP_URL";

  const getDiscount = (id) => discounts[String(id)] ?? 0;

  const syncDiscountToSheet = async (payload) => {
    if (!isScriptConfigured) {
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
      console.error("Update discount error:", error);
      setSyncStatus("Không thể đồng bộ chiết khấu lên Google Sheet");
      if (isBrowser()) alert("Không thể đồng bộ chiết khấu lên Google Sheet");
    }
  };

  const updateDiscount = async (id, value) => {
    if (!isDiscountUnlocked) return;

    const productId = String(id);
    const newDiscount = toNumber(value);
    setDiscounts({ ...discounts, [productId]: newDiscount });

    await syncDiscountToSheet({
      action: "updateDiscount",
      id: productId,
      discount: newDiscount,
    });
  };

  const handleGlobalDiscountChange = async (value) => {
    if (!isDiscountUnlocked) return;

    const newGlobalDiscount = toNumber(value);
    setGlobalDiscount(newGlobalDiscount);

    const newDiscounts = {};
    products.forEach((product) => {
      newDiscounts[String(product.id)] = newGlobalDiscount;
    });
    setDiscounts(newDiscounts);

    await syncDiscountToSheet({
      action: "updateAllDiscounts",
      discount: newGlobalDiscount,
    });
  };

  const unlockDiscount = () => {
    if (password === DISCOUNT_PASSWORD) {
      setIsDiscountUnlocked(true);
      setPassword("");
      setSyncStatus("Đã mở khóa chỉnh sửa chiết khấu");
    } else if (isBrowser()) {
      alert("Sai mật khẩu mở khóa chiết khấu");
    }
  };

  const lockDiscount = () => {
    setIsDiscountUnlocked(false);
    setPassword("");
    setSyncStatus("Đã khóa chỉnh sửa chiết khấu");
  };

  const resetSavedDiscounts = () => {
    if (!isDiscountUnlocked) {
      if (isBrowser()) alert("Vui lòng mở khóa trước khi reset chiết khấu");
      return;
    }
    handleGlobalDiscountChange(0);
  };

  const filteredProducts = products.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const category = product.category || "Uncategorized";
    if (!groups[category]) groups[category] = [];
    groups[category].push(product);
    return groups;
  }, {});

  const categoryNames = Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b));

  const toggleCategory = (category) => {
    setCollapsedCategories({
      ...collapsedCategories,
      [category]: !collapsedCategories[category],
    });
  };

  const expandAllCategories = () => setCollapsedCategories({});

  const collapseAllCategories = () => {
    const next = {};
    categoryNames.forEach((category) => {
      next[category] = true;
    });
    setCollapsedCategories(next);
  };

  const totalValue = filteredProducts.reduce((acc, item) => {
    return acc + calculateFinalPrice(item.price, getDiscount(item.id));
  }, 0);

  const scrollToProducts = () => {
    if (!isBrowser()) return;
    const element = document.getElementById("products-section");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const s = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ffffff 0%, #f6f7fb 45%, #fff3ea 100%)",
      color: "#1f2937",
      fontFamily: "Arial, Helvetica, sans-serif",
      padding: isMobile ? 12 : 28,
      boxSizing: "border-box",
    },
    container: { maxWidth: 1280, margin: "0 auto" },
    landingHero: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1.05fr 0.95fr",
      gap: isMobile ? 18 : 28,
      alignItems: "center",
      background: "radial-gradient(circle at top right, rgba(249,115,22,0.20), transparent 34%), linear-gradient(135deg, #ffffff 0%, #fff7ed 52%, #f8fafc 100%)",
      border: "1px solid rgba(249,115,22,0.16)",
      borderRadius: isMobile ? 26 : 36,
      padding: isMobile ? 18 : 34,
      marginBottom: isMobile ? 14 : 24,
      boxShadow: "0 26px 80px rgba(15, 23, 42, 0.10)",
      overflow: "hidden",
      position: "relative",
    },
    landingBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#fff1e7",
      color: "#ea580c",
      border: "1px solid rgba(249,115,22,0.18)",
      padding: "8px 12px",
      borderRadius: 999,
      fontSize: isMobile ? 11 : 13,
      fontWeight: 900,
      marginBottom: 14,
    },
    landingTitle: {
      fontSize: isMobile ? 32 : isTablet ? 46 : 58,
      lineHeight: 1.02,
      letterSpacing: "-0.055em",
      fontWeight: 950,
      color: "#111827",
      margin: 0,
      maxWidth: 720,
    },
    landingHighlight: { color: "#f97316" },
    landingText: {
      color: "#6b7280",
      fontSize: isMobile ? 15 : 18,
      lineHeight: 1.65,
      marginTop: 16,
      maxWidth: 650,
    },
    landingActions: {
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 22,
    },
    landingPrimary: {
      background: "#f97316",
      color: "#ffffff",
      border: "none",
      borderRadius: 999,
      padding: isMobile ? "12px 16px" : "14px 20px",
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 14px 32px rgba(249,115,22,0.28)",
    },
    landingSecondary: {
      background: "#ffffff",
      color: "#374151",
      border: "1px solid #e5e7eb",
      borderRadius: 999,
      padding: isMobile ? "12px 16px" : "14px 20px",
      fontWeight: 900,
      cursor: "pointer",
    },
    landingVisual: {
      minHeight: isMobile ? 250 : 360,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    visualBlob: {
      position: "absolute",
      width: isMobile ? 250 : 390,
      height: isMobile ? 250 : 390,
      borderRadius: "42% 58% 50% 50% / 45% 42% 58% 55%",
      background: "linear-gradient(135deg, #fb923c 0%, #f97316 45%, #fdba74 100%)",
      opacity: 0.18,
    },
    visualPanel: {
      position: "relative",
      width: "100%",
      maxWidth: 450,
      background: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(255,255,255,0.85)",
      borderRadius: isMobile ? 24 : 34,
      padding: isMobile ? 16 : 22,
      boxShadow: "0 30px 70px rgba(15,23,42,0.18)",
      transform: isMobile ? "none" : "rotate(-2deg)",
      backdropFilter: "blur(14px)",
    },
    visualTopBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },
    visualDots: { display: "flex", gap: 6 },
    visualDot: { width: 10, height: 10, borderRadius: 999, background: "#fed7aa" },
    visualMiniLogo: {
      width: 42,
      height: 42,
      borderRadius: 14,
      objectFit: "contain",
      background: "#fff7ed",
      padding: 6,
      boxSizing: "border-box",
      border: "1px solid #fed7aa",
    },
    visualMetricGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 14,
    },
    visualMetric: {
      background: "#f8fafc",
      border: "1px solid #eef0f4",
      borderRadius: 18,
      padding: 14,
    },
    visualMetricLabel: {
      color: "#9ca3af",
      fontSize: 12,
      fontWeight: 800,
      marginBottom: 8,
    },
    visualMetricValue: {
      color: "#111827",
      fontSize: isMobile ? 19 : 24,
      fontWeight: 950,
    },
    visualList: { display: "grid", gap: 10 },
    visualRow: {
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 12,
      alignItems: "center",
      background: "#ffffff",
      border: "1px solid #eef0f4",
      borderRadius: 16,
      padding: "12px 14px",
    },
    visualProduct: { color: "#374151", fontWeight: 900, fontSize: 13 },
    visualPrice: { color: "#ea580c", fontWeight: 950, fontSize: 13 },
    visualFloatingCard: {
      position: isMobile ? "relative" : "absolute",
      right: isMobile ? "auto" : -6,
      bottom: isMobile ? "auto" : 24,
      marginTop: isMobile ? 12 : 0,
      background: "#111827",
      color: "#ffffff",
      borderRadius: 22,
      padding: "14px 16px",
      boxShadow: "0 18px 40px rgba(17,24,39,0.24)",
      maxWidth: isMobile ? "100%" : 210,
    },
    floatingLabel: { color: "#fdba74", fontSize: 12, fontWeight: 900, marginBottom: 6 },
    floatingValue: { fontSize: 20, fontWeight: 950 },
    hero: {
      background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)",
      border: "1px solid rgba(255, 122, 24, 0.16)",
      borderRadius: isMobile ? 22 : 32,
      padding: isMobile ? 16 : 28,
      boxShadow: "0 24px 70px rgba(15, 23, 42, 0.08)",
      marginBottom: isMobile ? 14 : 24,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      gap: isMobile ? 16 : 24,
      alignItems: isMobile ? "flex-start" : "center",
      flexWrap: "wrap",
    },
    brand: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? 12 : 18,
      width: isMobile ? "100%" : "auto",
    },
    logoImage: {
      width: isMobile ? 54 : 74,
      height: isMobile ? 54 : 74,
      borderRadius: isMobile ? 16 : 22,
      objectFit: "contain",
      background: "#ffffff",
      padding: 8,
      boxSizing: "border-box",
      flexShrink: 0,
      boxShadow: "0 12px 28px rgba(249, 115, 22, 0.18)",
      border: "1px solid rgba(249, 115, 22, 0.18)",
    },
    eyebrow: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#fff1e7",
      color: "#ea580c",
      border: "1px solid rgba(249, 115, 22, 0.18)",
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: isMobile ? 11 : 12,
      fontWeight: 800,
      marginBottom: 8,
    },
    title: {
      fontSize: isMobile ? 26 : isTablet ? 36 : 46,
      fontWeight: 900,
      margin: 0,
      lineHeight: 1.05,
      color: "#111827",
      letterSpacing: "-0.04em",
    },
    subtitle: {
      color: "#6b7280",
      marginTop: 8,
      fontSize: isMobile ? 13 : 16,
      lineHeight: 1.5,
    },
    statGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2, minmax(178px, 1fr))",
      gap: isMobile ? 10 : 14,
      width: isMobile ? "100%" : "auto",
    },
    statCard: {
      background: "rgba(255,255,255,0.9)",
      border: "1px solid #eef0f4",
      borderRadius: isMobile ? 18 : 24,
      padding: isMobile ? 14 : 20,
      boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
      boxSizing: "border-box",
    },
    card: {
      background: "rgba(255,255,255,0.95)",
      border: "1px solid #eef0f4",
      borderRadius: isMobile ? 18 : 24,
      padding: isMobile ? 14 : 22,
      boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
      boxSizing: "border-box",
    },
    label: { color: "#6b7280", fontSize: isMobile ? 12 : 14, marginBottom: 8, fontWeight: 700 },
    statNumber: { fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#111827" },
    total: { fontSize: isMobile ? 16 : 23, fontWeight: 900, color: "#ea580c" },
    syncStatus: { marginTop: 14, color: "#6b7280", fontSize: isMobile ? 12 : 13, lineHeight: 1.5 },
    toolbar: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1fr 360px",
      gap: isMobile ? 12 : 16,
      marginBottom: isMobile ? 14 : 22,
    },
    searchBox: { display: "flex", alignItems: "center", gap: 12 },
    searchIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      background: "#fff1e7",
      color: "#ea580c",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 900,
      flexShrink: 0,
    },
    groupToolbar: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, alignItems: "center" },
    groupButton: {
      background: isGroupedByCategory ? "#f97316" : "#ffffff",
      color: isGroupedByCategory ? "#ffffff" : "#374151",
      border: isGroupedByCategory ? "1px solid #f97316" : "1px solid #e5e7eb",
      borderRadius: 999,
      padding: "10px 14px",
      cursor: "pointer",
      fontWeight: 900,
      boxShadow: isGroupedByCategory ? "0 10px 24px rgba(249,115,22,0.22)" : "none",
    },
    smallButton: {
      background: "#ffffff",
      color: "#6b7280",
      border: "1px solid #e5e7eb",
      borderRadius: 999,
      padding: "10px 13px",
      cursor: "pointer",
      fontWeight: 800,
    },
    categoryHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      padding: isMobile ? "13px 14px" : "15px 18px",
      background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
      borderTop: "1px solid #eef0f4",
      borderBottom: "1px solid #eef0f4",
      cursor: "pointer",
    },
    categoryTitle: { display: "flex", alignItems: "center", gap: 10, fontWeight: 900, color: "#111827" },
    categoryCount: {
      background: "#ffedd5",
      color: "#ea580c",
      borderRadius: 999,
      padding: "5px 10px",
      fontSize: 12,
      fontWeight: 900,
    },
    categoryArrow: { color: "#ea580c", fontWeight: 900, fontSize: 18 },
    input: {
      width: "100%",
      background: "#f8fafc",
      color: "#111827",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: isMobile ? "13px 14px" : "14px 16px",
      outline: "none",
      fontSize: isMobile ? 15 : 16,
      boxSizing: "border-box",
      opacity: 1,
    },
    disabledInput: { opacity: 0.5, cursor: "not-allowed", background: "#f3f4f6", color: "#6b7280" },
    lockPanel: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
      gap: 10,
      marginTop: 12,
    },
    primaryButton: {
      background: isDiscountUnlocked ? "#16a34a" : "#f97316",
      color: "#ffffff",
      border: "none",
      borderRadius: 14,
      padding: "12px 16px",
      cursor: "pointer",
      fontWeight: 900,
      whiteSpace: "nowrap",
      boxShadow: isDiscountUnlocked ? "0 12px 28px rgba(22,163,74,0.22)" : "0 12px 28px rgba(249,115,22,0.24)",
    },
    resetButton: {
      marginTop: 10,
      width: "100%",
      background: "#fff1f2",
      color: "#e11d48",
      border: "1px solid #ffe4e6",
      borderRadius: 14,
      padding: "11px 12px",
      cursor: isDiscountUnlocked ? "pointer" : "not-allowed",
      fontWeight: 800,
      opacity: isDiscountUnlocked ? 1 : 0.48,
    },
    lockStatus: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 11px",
      borderRadius: 999,
      background: isDiscountUnlocked ? "#dcfce7" : "#fff1f2",
      color: isDiscountUnlocked ? "#15803d" : "#e11d48",
      fontSize: 13,
      fontWeight: 900,
      marginBottom: 12,
      border: isDiscountUnlocked ? "1px solid #bbf7d0" : "1px solid #ffe4e6",
    },
    tableWrap: {
      display: isMobile ? "none" : "block",
      background: "#ffffff",
      border: "1px solid #eef0f4",
      borderRadius: 26,
      overflowX: "auto",
      boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
    },
    table: { width: "100%", minWidth: 920, borderCollapse: "collapse" },
    th: {
      textAlign: "left",
      padding: 18,
      color: "#6b7280",
      fontSize: 13,
      borderBottom: "1px solid #eef0f4",
      background: "#f9fafb",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },
    td: { padding: 18, borderBottom: "1px solid #f1f5f9", color: "#374151" },
    badge: {
      display: "inline-block",
      padding: "7px 12px",
      borderRadius: 999,
      background: "#fff1e7",
      color: "#ea580c",
      fontSize: 13,
      fontWeight: 800,
      border: "1px solid rgba(249,115,22,0.12)",
    },
    price: { color: "#ea580c", fontWeight: 900, fontSize: 17 },
    miniInput: {
      width: 90,
      background: "#f8fafc",
      color: "#111827",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "10px 10px",
      outline: "none",
      fontSize: 15,
      boxSizing: "border-box",
      fontWeight: 800,
    },
    mobileList: { display: isMobile ? "grid" : "none", gap: 12 },
    mobileCategoryHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
      border: "1px solid #fed7aa",
      borderRadius: 18,
      padding: "13px 14px",
      color: "#111827",
      fontWeight: 900,
      boxShadow: "0 10px 26px rgba(249,115,22,0.1)",
      cursor: "pointer",
    },
    productCard: {
      background: "#ffffff",
      border: "1px solid #eef0f4",
      borderRadius: 22,
      padding: 16,
      boxShadow: "0 16px 40px rgba(15, 23, 42, 0.07)",
    },
    productName: { fontSize: 17, fontWeight: 900, lineHeight: 1.35, marginBottom: 10, color: "#111827" },
    mobileRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      padding: "9px 0",
      borderBottom: "1px solid #f1f5f9",
      color: "#4b5563",
      fontSize: 14,
    },
    featureGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)",
      gap: isMobile ? 12 : 16,
      marginTop: isMobile ? 16 : 24,
    },
    featureTitle: { fontSize: isMobile ? 17 : 20, fontWeight: 900, marginBottom: 10, color: "#111827" },
    featureText: { color: "#6b7280", lineHeight: 1.7, fontSize: isMobile ? 13 : 14 },
    footer: { textAlign: "center", color: "#9ca3af", marginTop: 30, paddingBottom: 20, fontSize: 13 },
  };

  const renderProductRow = (item) => {
    const discount = getDiscount(item.id);
    const finalPrice = calculateFinalPrice(item.price, discount);

    return (
      <tr key={item.id}>
        <td style={{ ...s.td, fontWeight: 700 }}>{item.name}</td>
        <td style={s.td}><span style={s.badge}>{item.category}</span></td>
        <td style={s.td}>{item.stock}</td>
        <td style={s.td}>{formatPrice(item.price)}</td>
        <td style={s.td}>
          <input
            style={{ ...s.miniInput, ...(!isDiscountUnlocked ? s.disabledInput : {}) }}
            type="number"
            value={discount}
            disabled={!isDiscountUnlocked}
            onChange={(e) => updateDiscount(item.id, e.target.value)}
          /> <span>%</span>
        </td>
        <td style={{ ...s.td, ...s.price }}>{formatPrice(finalPrice)}</td>
      </tr>
    );
  };

  const renderMobileProductCard = (item) => {
    const discount = getDiscount(item.id);
    const finalPrice = calculateFinalPrice(item.price, discount);

    return (
      <div style={s.productCard} key={item.id}>
        <div style={s.productName}>{item.name}</div>
        <div style={{ marginBottom: 8 }}><span style={s.badge}>{item.category}</span></div>
        <div style={s.mobileRow}><span>Stock</span><strong>{item.stock}</strong></div>
        <div style={s.mobileRow}><span>List Price</span><strong>{formatPrice(item.price)}</strong></div>
        <div style={s.mobileRow}>
          <span>Discount</span>
          <span>
            <input
              style={{ ...s.miniInput, width: 76, ...(!isDiscountUnlocked ? s.disabledInput : {}) }}
              type="number"
              value={discount}
              disabled={!isDiscountUnlocked}
              onChange={(e) => updateDiscount(item.id, e.target.value)}
            /> %
          </span>
        </div>
        <div style={{ ...s.mobileRow, borderBottom: "none" }}>
          <span>Final Price</span>
          <strong style={{ color: "#ea580c", fontSize: 16 }}>{formatPrice(finalPrice)}</strong>
        </div>
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <section style={s.landingHero}>
          <div>
            <div style={s.landingBadge}>✨ SEADENT DIGITAL QUOTATION</div>
            <h1 style={s.landingTitle}>
              Báo giá nhanh, <span style={s.landingHighlight}>chính xác</span> và chuyên nghiệp hơn.
            </h1>
            <div style={s.landingText}>
              Quản lý danh sách sản phẩm, tra cứu giá, chỉnh chiết khấu và đồng bộ dữ liệu Google Sheet trong một giao diện hiện đại cho đội ngũ SEADENT.
            </div>
            <div style={s.landingActions}>
              <button style={s.landingPrimary} onClick={scrollToProducts}>Bắt đầu báo giá</button>
              <button style={s.landingSecondary} onClick={() => setSearch("")}>Xem toàn bộ sản phẩm</button>
            </div>
          </div>

          <div style={s.landingVisual}>
            <div style={s.visualBlob}></div>
            <div style={s.visualPanel}>
              <div style={s.visualTopBar}>
                <div style={s.visualDots}>
                  <span style={s.visualDot}></span>
                  <span style={{ ...s.visualDot, background: "#fdba74" }}></span>
                  <span style={{ ...s.visualDot, background: "#fb923c" }}></span>
                </div>
                <img src="/logo.png" alt="SEADENT" style={s.visualMiniLogo} />
              </div>

              <div style={s.visualMetricGrid}>
                <div style={s.visualMetric}>
                  <div style={s.visualMetricLabel}>PRODUCTS</div>
                  <div style={s.visualMetricValue}>{products.length}</div>
                </div>
                <div style={s.visualMetric}>
                  <div style={s.visualMetricLabel}>QUOTE TOTAL</div>
                  <div style={{ ...s.visualMetricValue, color: "#ea580c" }}>{formatPrice(totalValue)}</div>
                </div>
              </div>

              <div style={s.visualList}>
                {filteredProducts.slice(0, 3).map((item) => {
                  const discount = getDiscount(item.id);
                  const finalPrice = calculateFinalPrice(item.price, discount);
                  return (
                    <div style={s.visualRow} key={`visual-${item.id}`}>
                      <div style={s.visualProduct}>{item.name}</div>
                      <div style={s.visualPrice}>{formatPrice(finalPrice)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={s.visualFloatingCard}>
              <div style={s.floatingLabel}>SYNC STATUS</div>
              <div style={s.floatingValue}>Google Sheet Ready</div>
            </div>
          </div>
        </section>

        <div style={s.hero}>
          <div style={s.header}>
            <div style={s.brand}>
              <img src="/logo.png" alt="SEADENT Logo" style={s.logoImage} />
              <div>
                <div style={s.eyebrow}>● SEADENT PRICING SYSTEM</div>
                <h1 style={s.title}>SEADENT Quote Center</h1>
                <div style={s.subtitle}>Internal Pricing & Quotation Dashboard</div>
              </div>
            </div>

            <div style={s.statGrid}>
              <div style={s.statCard}>
                <div style={s.label}>Products</div>
                <div style={s.statNumber}>{products.length}</div>
              </div>
              <div style={s.statCard}>
                <div style={s.label}>Quote Total</div>
                <div style={s.total}>{formatPrice(totalValue)}</div>
              </div>
            </div>
          </div>
          <div style={s.syncStatus}>{syncStatus}</div>
        </div>

        <div id="products-section" style={s.toolbar}>
          <div style={s.card}>
            <div style={s.searchBox}>
              <div style={s.searchIcon}>⌕</div>
              <input
                style={s.input}
                type="text"
                placeholder="Tìm nhanh sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={s.groupToolbar}>
              <button style={s.groupButton} onClick={() => setIsGroupedByCategory(!isGroupedByCategory)}>
                {isGroupedByCategory ? "✓ Group by Category" : "Group by Category"}
              </button>

              {isGroupedByCategory && (
                <>
                  <button style={s.smallButton} onClick={expandAllCategories}>Expand all</button>
                  <button style={s.smallButton} onClick={collapseAllCategories}>Collapse all</button>
                </>
              )}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.lockStatus}>{isDiscountUnlocked ? "🔓 Discount Unlocked" : "🔒 Discount Locked"}</div>

            <div style={s.label}>Default Discount</div>
            <input
              style={{ ...s.input, ...(!isDiscountUnlocked ? s.disabledInput : {}) }}
              type="number"
              value={globalDiscount}
              disabled={!isDiscountUnlocked}
              onChange={(e) => handleGlobalDiscountChange(e.target.value)}
            />

            <div style={s.lockPanel}>
              <input
                style={s.input}
                type="password"
                placeholder="Password"
                value={password}
                disabled={isDiscountUnlocked}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") unlockDiscount();
                }}
              />

              <button style={s.primaryButton} onClick={isDiscountUnlocked ? lockDiscount : unlockDiscount}>
                {isDiscountUnlocked ? "Lock" : "Unlock"}
              </button>
            </div>

            <button onClick={resetSavedDiscounts} style={s.resetButton}>Reset Discount</button>
          </div>
        </div>

        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Product</th>
                <th style={s.th}>Category</th>
                <th style={s.th}>Stock</th>
                <th style={s.th}>List Price</th>
                <th style={s.th}>Discount</th>
                <th style={s.th}>Final Price</th>
              </tr>
            </thead>
            <tbody>
              {isGroupedByCategory ? (
                categoryNames.map((category) => (
                  <React.Fragment key={category}>
                    <tr>
                      <td colSpan="6" style={{ padding: 0 }}>
                        <div style={s.categoryHeader} onClick={() => toggleCategory(category)}>
                          <div style={s.categoryTitle}>
                            <span>{collapsedCategories[category] ? "▸" : "▾"}</span>
                            <span>{category}</span>
                            <span style={s.categoryCount}>{groupedProducts[category].length} sản phẩm</span>
                          </div>
                          <div style={s.categoryArrow}>{collapsedCategories[category] ? "+" : "−"}</div>
                        </div>
                      </td>
                    </tr>
                    {!collapsedCategories[category] && groupedProducts[category].map(renderProductRow)}
                  </React.Fragment>
                ))
              ) : (
                filteredProducts.map(renderProductRow)
              )}
            </tbody>
          </table>
        </div>

        <div style={s.mobileList}>
          {isGroupedByCategory ? (
            categoryNames.map((category) => (
              <React.Fragment key={category}>
                <div style={s.mobileCategoryHeader} onClick={() => toggleCategory(category)}>
                  <span>{collapsedCategories[category] ? "▸" : "▾"} {category}</span>
                  <span style={s.categoryCount}>{groupedProducts[category].length}</span>
                </div>
                {!collapsedCategories[category] && groupedProducts[category].map(renderMobileProductCard)}
              </React.Fragment>
            ))
          ) : (
            filteredProducts.map(renderMobileProductCard)
          )}
        </div>

        <div style={s.featureGrid}>
          <div style={s.card}>
            <div style={s.featureTitle}>PDF Export</div>
            <div style={s.featureText}>Generate professional quotation PDF with customer information, company logo and signature.</div>
          </div>
          <div style={s.card}>
            <div style={s.featureTitle}>Google Sheets Sync</div>
            <div style={s.featureText}>Auto update product pricing directly from Google Sheets.</div>
          </div>
          <div style={s.card}>
            <div style={s.featureTitle}>Admin Dashboard</div>
            <div style={s.featureText}>Manage products, pricing, quotation history and customers.</div>
          </div>
        </div>

        <div style={s.footer}>SEADENT Quote Center © 2026</div>
      </div>
    </div>
  );
}
