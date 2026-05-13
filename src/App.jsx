import React from "react";

export default function App() {
  const [search, setSearch] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isDiscountUnlocked, setIsDiscountUnlocked] = React.useState(() => {
    return localStorage.getItem("seadent_discount_unlocked") === "true";
  });
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);

  const [globalDiscount, setGlobalDiscount] = React.useState(() => {
    const saved = localStorage.getItem("seadent_global_discount");
    return saved ? Number(saved) : 10;
  });

  const [discounts, setDiscounts] = React.useState(() => {
    const saved = localStorage.getItem("seadent_product_discounts");
    return saved ? JSON.parse(saved) : {};
  });

  const [products, setProducts] = React.useState([]);

  React.useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = screenWidth <= 760;
  const isTablet = screenWidth <= 1024;

  React.useEffect(() => {
    fetch("https://opensheet.elk.sh/1HAFKnOoIs9VmdlmVuonjNSxpvKfzHlrCJ4l1zQq3HUs/products")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item, index) => ({
          id: item.id || item.name || index + 1,
          name: item.name,
          category: item.category,
          price: Number(item.price),
          stock: Number(item.stock),
        }));

        setProducts(formatted);
      })
      .catch((err) => {
        console.error("Google Sheet Error:", err);
      });
  }, []);

  React.useEffect(() => {
    localStorage.setItem("seadent_global_discount", String(globalDiscount));
  }, [globalDiscount]);

  React.useEffect(() => {
    localStorage.setItem("seadent_product_discounts", JSON.stringify(discounts));
  }, [discounts]);

  React.useEffect(() => {
    localStorage.setItem("seadent_discount_unlocked", String(isDiscountUnlocked));
  }, [isDiscountUnlocked]);

  const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value || 0) + " đ";

  const getDiscount = (id) => discounts[id] ?? globalDiscount;

  const updateDiscount = (id, value) => {
    if (!isDiscountUnlocked) return;
    setDiscounts({ ...discounts, [id]: Number(value) });
  };

  const handleGlobalDiscountChange = (value) => {
    if (!isDiscountUnlocked) return;
    setGlobalDiscount(Number(value));
  };

  const unlockDiscount = () => {
    if (password === "seadent") {
      setIsDiscountUnlocked(true);
      setPassword("");
    } else {
      alert("Sai mật khẩu mở khóa chiết khấu");
    }
  };

  const lockDiscount = () => {
    setIsDiscountUnlocked(false);
    setPassword("");
  };

  const resetSavedDiscounts = () => {
    if (!isDiscountUnlocked) {
      alert("Vui lòng mở khóa trước khi reset chiết khấu");
      return;
    }

    localStorage.removeItem("seadent_global_discount");
    localStorage.removeItem("seadent_product_discounts");
    setGlobalDiscount(10);
    setDiscounts({});
  };

  const filteredProducts = products.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filteredProducts.reduce((acc, item) => {
    const discount = getDiscount(item.id);
    return acc + (item.price - (item.price * discount) / 100);
  }, 0);

  const s = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #070b14 0%, #0b0f19 45%, #111827 100%)",
      color: "#ffffff",
      fontFamily: "Arial, Helvetica, sans-serif",
      padding: isMobile ? 14 : 28,
      boxSizing: "border-box",
    },
    container: { maxWidth: 1240, margin: "0 auto" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      gap: isMobile ? 16 : 24,
      alignItems: isMobile ? "flex-start" : "center",
      marginBottom: isMobile ? 18 : 28,
      flexWrap: "wrap",
    },
    brand: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? 12 : 18,
      width: isMobile ? "100%" : "auto",
    },
    logoImage: {
      width: isMobile ? 54 : 72,
      height: isMobile ? 54 : 72,
      borderRadius: isMobile ? 16 : 20,
      objectFit: "contain",
      background: "#ffffff",
      padding: 8,
      boxSizing: "border-box",
      flexShrink: 0,
    },
    title: {
      fontSize: isMobile ? 25 : isTablet ? 34 : 42,
      fontWeight: 800,
      margin: 0,
      lineHeight: 1.1,
    },
    subtitle: {
      color: "#9ca3af",
      marginTop: 6,
      fontSize: isMobile ? 13 : 16,
      lineHeight: 1.4,
    },
    statGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2, minmax(170px, 1fr))",
      gap: isMobile ? 10 : 16,
      width: isMobile ? "100%" : "auto",
    },
    card: {
      background: "rgba(20, 27, 45, 0.92)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: isMobile ? 18 : 24,
      padding: isMobile ? 14 : 22,
      boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
      boxSizing: "border-box",
    },
    label: { color: "#9ca3af", fontSize: isMobile ? 12 : 14, marginBottom: 8 },
    statNumber: { fontSize: isMobile ? 22 : 30, fontWeight: 800 },
    total: { fontSize: isMobile ? 15 : 22, fontWeight: 800, color: "#4ade80" },
    toolbar: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1fr 320px",
      gap: isMobile ? 12 : 16,
      marginBottom: isMobile ? 16 : 24,
    },
    input: {
      width: "100%",
      background: "#1b2337",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: isMobile ? "13px 14px" : "14px 16px",
      outline: "none",
      fontSize: isMobile ? 15 : 16,
      boxSizing: "border-box",
      opacity: 1,
    },
    disabledInput: {
      opacity: 0.45,
      cursor: "not-allowed",
      background: "#111827",
    },
    lockPanel: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
      gap: 10,
      marginTop: 12,
    },
    primaryButton: {
      background: isDiscountUnlocked ? "rgba(34,197,94,0.18)" : "rgba(249,115,22,0.18)",
      color: isDiscountUnlocked ? "#86efac" : "#fdba74",
      border: isDiscountUnlocked ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(249,115,22,0.35)",
      borderRadius: 14,
      padding: "11px 14px",
      cursor: "pointer",
      fontWeight: 800,
      whiteSpace: "nowrap",
    },
    resetButton: {
      marginTop: 10,
      width: "100%",
      background: "rgba(239,68,68,0.16)",
      color: "#fca5a5",
      border: "1px solid rgba(239,68,68,0.28)",
      borderRadius: 14,
      padding: "10px 12px",
      cursor: isDiscountUnlocked ? "pointer" : "not-allowed",
      fontWeight: 700,
      opacity: isDiscountUnlocked ? 1 : 0.45,
    },
    lockStatus: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 10px",
      borderRadius: 999,
      background: isDiscountUnlocked ? "rgba(34,197,94,0.16)" : "rgba(239,68,68,0.14)",
      color: isDiscountUnlocked ? "#86efac" : "#fca5a5",
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 12,
    },
    tableWrap: {
      display: isMobile ? "none" : "block",
      background: "rgba(20, 27, 45, 0.92)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 24,
      overflowX: "auto",
      boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    },
    table: { width: "100%", minWidth: 900, borderCollapse: "collapse" },
    th: {
      textAlign: "left",
      padding: 18,
      color: "#9ca3af",
      fontSize: 14,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    td: {
      padding: 18,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      color: "#e5e7eb",
    },
    badge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 999,
      background: "rgba(99,102,241,0.18)",
      color: "#a5b4fc",
      fontSize: 13,
    },
    price: { color: "#4ade80", fontWeight: 800, fontSize: 17 },
    miniInput: {
      width: 90,
      background: "#1b2337",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: "9px 10px",
      outline: "none",
      fontSize: 15,
      boxSizing: "border-box",
    },
    mobileList: {
      display: isMobile ? "grid" : "none",
      gap: 12,
    },
    productCard: {
      background: "rgba(20, 27, 45, 0.94)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      padding: 15,
      boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
    },
    productName: { fontSize: 17, fontWeight: 800, lineHeight: 1.35, marginBottom: 10 },
    mobileRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      padding: "8px 0",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      color: "#d1d5db",
      fontSize: 14,
    },
    featureGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)",
      gap: isMobile ? 12 : 16,
      marginTop: isMobile ? 16 : 24,
    },
    featureTitle: { fontSize: isMobile ? 17 : 20, fontWeight: 800, marginBottom: 10 },
    featureText: { color: "#9ca3af", lineHeight: 1.7, fontSize: isMobile ? 13 : 14 },
    footer: { textAlign: "center", color: "#6b7280", marginTop: 30, paddingBottom: 20, fontSize: 13 },
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div style={s.brand}>
            <img src="/logo.png" alt="SEADENT Logo" style={s.logoImage} />
            <div>
              <h1 style={s.title}>SEADENT Quote Center</h1>
              <div style={s.subtitle}>Internal Pricing & Quotation Dashboard</div>
            </div>
          </div>

          <div style={s.statGrid}>
            <div style={s.card}>
              <div style={s.label}>Products</div>
              <div style={s.statNumber}>{products.length}</div>
            </div>
            <div style={s.card}>
              <div style={s.label}>Quote Total</div>
              <div style={s.total}>{formatPrice(totalValue)}</div>
            </div>
          </div>
        </div>

        <div style={s.toolbar}>
          <div style={s.card}>
            <input
              style={s.input}
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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

            <button onClick={resetSavedDiscounts} style={s.resetButton}>
              Reset Discount
            </button>
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
              {filteredProducts.map((item) => {
                const discount = getDiscount(item.id);
                const finalPrice = item.price - (item.price * discount) / 100;
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
              })}
            </tbody>
          </table>
        </div>

        <div style={s.mobileList}>
          {filteredProducts.map((item) => {
            const discount = getDiscount(item.id);
            const finalPrice = item.price - (item.price * discount) / 100;
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
                  <strong style={{ color: "#4ade80", fontSize: 16 }}>{formatPrice(finalPrice)}</strong>
                </div>
              </div>
            );
          })}
        </div>

        <div style={s.featureGrid}>
          <div style={s.card}><div style={s.featureTitle}>PDF Export</div><div style={s.featureText}>Generate professional quotation PDF with customer information, company logo and signature.</div></div>
          <div style={s.card}><div style={s.featureTitle}>Google Sheets Sync</div><div style={s.featureText}>Auto update product pricing directly from Google Sheets.</div></div>
          <div style={s.card}><div style={s.featureTitle}>Admin Dashboard</div><div style={s.featureText}>Manage products, pricing, quotation history and customers.</div></div>
        </div>

        <div style={s.footer}>SEADENT Quote Center © 2026</div>
      </div>
    </div>
  );
}
