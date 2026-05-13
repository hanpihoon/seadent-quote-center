import React from "react";

export default function App() {
  const [search, setSearch] = React.useState("");
  const [globalDiscount, setGlobalDiscount] = React.useState(10);
  const [discounts, setDiscounts] = React.useState({});

  const products = [
    { id: 1, name: "Planmeca Compact i5", category: "Dental Unit", price: 450000000, stock: 3 },
    { id: 2, name: "Belmont Clesta eIII", category: "Dental Unit", price: 390000000, stock: 2 },
    { id: 3, name: "Durr VS 1200", category: "Suction", price: 89000000, stock: 8 },
    { id: 4, name: "Melag Vacuklav", category: "Sterilization", price: 125000000, stock: 4 },
  ];

  const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value) + " đ";
  const getDiscount = (id) => discounts[id] ?? globalDiscount;
  const updateDiscount = (id, value) => setDiscounts({ ...discounts, [id]: Number(value) });

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filteredProducts.reduce((acc, item) => {
    const discount = getDiscount(item.id);
    return acc + (item.price - (item.price * discount) / 100);
  }, 0);

  const s = {
    page: {
      minHeight: "100vh",
      background: "#0b0f19",
      color: "#ffffff",
      fontFamily: "Arial, Helvetica, sans-serif",
      padding: 28,
    },
    container: { maxWidth: 1200, margin: "0 auto" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      gap: 24,
      alignItems: "center",
      marginBottom: 28,
      flexWrap: "wrap",
    },
    brand: { display: "flex", alignItems: "center", gap: 18 },
    logoBox: {
      width: 68,
      height: 68,
      borderRadius: 20,
      background: "rgba(255, 103, 31, 0.18)",
      color: "#ff6b22",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 34,
      fontWeight: 800,
    },
    title: { fontSize: 42, fontWeight: 800, margin: 0 },
    subtitle: { color: "#9ca3af", marginTop: 8, fontSize: 16 },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(170px, 1fr))", gap: 16 },
    card: {
      background: "#141b2d",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 24,
      padding: 22,
      boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    },
    label: { color: "#9ca3af", fontSize: 14, marginBottom: 8 },
    statNumber: { fontSize: 30, fontWeight: 800 },
    total: { fontSize: 22, fontWeight: 800, color: "#4ade80" },
    toolbar: { display: "grid", gridTemplateColumns: "1fr 260px", gap: 16, marginBottom: 24 },
    input: {
      width: "100%",
      background: "#1b2337",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "14px 16px",
      outline: "none",
      fontSize: 16,
      boxSizing: "border-box",
    },
    tableWrap: {
      background: "#141b2d",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 24,
      overflowX: "auto",
      boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    },
    table: { width: "100%", minWidth: 900, borderCollapse: "collapse" },
    th: { textAlign: "left", padding: 18, color: "#9ca3af", fontSize: 14, borderBottom: "1px solid rgba(255,255,255,0.08)" },
    td: { padding: 18, borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#e5e7eb" },
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
    },
    featureGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 },
    featureTitle: { fontSize: 20, fontWeight: 800, marginBottom: 10 },
    featureText: { color: "#9ca3af", lineHeight: 1.7, fontSize: 14 },
    footer: { textAlign: "center", color: "#6b7280", marginTop: 36, paddingBottom: 20 },
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div style={s.brand}>
            <div style={s.logoBox}>S</div>
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
            <input style={s.input} type="text" placeholder="Search product..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={s.card}>
            <div style={s.label}>Default Discount</div>
            <input style={s.input} type="number" value={globalDiscount} onChange={(e) => setGlobalDiscount(Number(e.target.value))} />
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
                      <input style={s.miniInput} type="number" value={discount} onChange={(e) => updateDiscount(item.id, e.target.value)} /> <span>%</span>
                    </td>
                    <td style={{ ...s.td, ...s.price }}>{formatPrice(finalPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
