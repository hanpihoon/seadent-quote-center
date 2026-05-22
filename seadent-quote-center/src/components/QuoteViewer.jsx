import React from "react";

export default function QuoteViewer({ quote, money }) {
  const items = quote?.items || [];

  const totalBefore = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalAfter = items.reduce((s, i) => s + i.finalPrice * i.quantity, 0);
  const discount = totalBefore - totalAfter;

  return (
    <main className="sq-page">
      <div className="sq-shell">
        <section className="sq-panel">
          <h1 style={{ textAlign: "center", margin: 0 }}>
            BÁO GIÁ SEADENT
          </h1>

          <div className="sq-muted" style={{ textAlign: "center", marginTop: 8 }}>
            Mã báo giá: {quote.quoteCode}
          </div>

          <div className="sq-summary">
            <b>Khách hàng:</b> {quote.customerName || "........................"}<br />
            <b>Số điện thoại:</b> {quote.customerPhone || "........................"}<br />
            <b>Địa chỉ:</b> {quote.customerAddress || "........................"}<br />
            <b>Ghi chú:</b> {quote.customerNote || "Không có"}
          </div>

          <div className="sq-card-grid" style={{ marginTop: 18 }}>
            {items.map((item) => (
              <div className="sq-card" key={item.id}>
                <div className="sq-product-title">{item.name}</div>
                <div className="sq-line">
                  <span>Danh mục</span>
                  <span className="sq-value">{item.category}</span>
                </div>
                <div className="sq-line">
                  <span>Giá niêm yết</span>
                  <span className="sq-value">{money(item.price)}</span>
                </div>
                <div className="sq-line">
                  <span>Chiết khấu</span>
                  <span className="sq-value">{item.discount}%</span>
                </div>
                <div className="sq-line">
                  <span>Số lượng</span>
                  <span className="sq-value">{item.quantity}</span>
                </div>
                <div className="sq-line">
                  <span>Thành tiền</span>
                  <span className="sq-value sq-price">
                    {money(item.finalPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="sq-summary" style={{ textAlign: "center" }}>
            <div>Trước chiết khấu: {money(totalBefore)}</div>
            <div>Tiền chiết khấu: {money(discount)}</div>
            <h2 style={{ color: "#ea580c" }}>{money(totalAfter)}</h2>
          </div>

          <div className="sq-tools" style={{ justifyContent: "center" }}>
            <button className="sq-btn" onClick={() => window.print()}>
              Tải / In PDF
            </button>

            <button
              className="sq-btn sq-btn-light"
              onClick={() => {
                window.location.href = window.location.origin;
              }}
            >
              Về trang chính
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}