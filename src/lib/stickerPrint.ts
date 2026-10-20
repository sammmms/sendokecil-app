import { Order } from '@/types';

export type StickerType = 'shipping_label' | 'greeting_card';
export type StickerLayout = 'single' | 'grid4';

export interface StickerPrintOptions {
  type: StickerType;
  layout: StickerLayout;
  headline?: string;
  recipient?: string;
  sender?: string;
  message?: string;
  includeItemsSummary?: boolean;
}

export function generateStickerHtml(order: Order, options: StickerPrintOptions): string {
  const isGreeting = options.type === 'greeting_card';
  const headline = options.headline || (isGreeting ? 'Special Sweet Treat' : 'DELIVERY ORDER');
  const recipient = options.recipient || order.customerName;
  const sender = options.sender || 'SENDOKecil';
  const message = options.message || 'Semoga hari Anda semakin manis dan berkesan bersama SENDOKecil! ✨';

  const itemsSummary = order.items
    .map((it) => `${it.quantity}x ${it.productName}`)
    .join(', ');

  const renderSingleShippingLabel = () => `
    <div class="sticker-box shipping-card">
      <div class="sticker-cut-line">✂ - - - - - - - - Garis Potong Label (10 cm × 7.5 cm) - - - - - - - - ✂</div>
      <div class="card-inner">
        <div class="header-row">
          <div>
            <div class="brand-title">SENDOKecil</div>
            <div class="brand-sub">EST 2026 · DESSERT BOX</div>
          </div>
          <div class="badge-priority ${order.priority === 'urgent' || order.priority === 'high' ? 'priority-urgent' : ''}">
            ${order.priority.toUpperCase()}
          </div>
        </div>

        <div class="divider"></div>

        <div class="info-section">
          <div class="field-label">PENERIMA / DESTINASI:</div>
          <div class="recipient-name">${recipient}</div>
          ${order.customerPhone ? `<div class="field-value phone">📞 ${order.customerPhone}</div>` : ''}
          ${order.orderType === 'antar' ? `
            <div class="address-box">
              <div class="address-text">📍 ${order.deliveryAddress || 'Alamat tidak dicantumkan'}</div>
              ${order.deliveryTimeNote ? `<div class="time-note">⏰ Catatan Waktu: <b>${order.deliveryTimeNote}</b></div>` : ''}
            </div>
          ` : `
            <div class="pickup-badge">🏪 AMBIL DI TEMPAT (PICKUP)</div>
          `}
        </div>

        <div class="divider"></div>

        <div class="order-summary-row">
          <div class="field-label">ISI PESANAN (${order.totalPcs} pcs):</div>
          <div class="items-text">${itemsSummary}</div>
        </div>

        <div class="footer-row">
          <div>No. Pesanan: <b>${order.orderNumber}</b></div>
          <div>Pengirim: <b>${sender}</b></div>
        </div>
      </div>
    </div>
  `;

  const renderSingleGreetingCard = () => `
    <div class="sticker-box greeting-card">
      <div class="sticker-cut-line">✂ - - - - - - - - Garis Potong Kartu (10 cm × 7 cm) - - - - - - - - ✂</div>
      <div class="card-inner greeting-inner">
        <!-- Elegant minimalist flourish border -->
        <div class="ornament top-left">❦</div>
        <div class="ornament top-right">❧</div>

        <div class="greeting-header">
          <div class="greeting-headline">${headline}</div>
          <div class="greeting-to">Untuk: <b>${recipient}</b></div>
        </div>

        <div class="greeting-body">
          ${message.replace(/\n/g, '<br>')}
        </div>

        <div class="greeting-footer">
          <div class="from-text">Dari: <b>${sender}</b></div>
          <div class="brand-tag">SENDOKecil · Sweet Moments</div>
        </div>

        <div class="ornament bottom-left">❧</div>
        <div class="ornament bottom-right">❦</div>
      </div>
    </div>
  `;

  const cardHtml = isGreeting ? renderSingleGreetingCard() : renderSingleShippingLabel();

  // If 4-up grid layout
  const contentHtml = options.layout === 'grid4'
    ? `<div class="grid-4-container">${cardHtml}${cardHtml}${cardHtml}${cardHtml}</div>`
    : `<div class="single-container">${cardHtml}</div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cetak Sticker / Kartu - ${order.orderNumber}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #fff;
          color: #2D1E16;
          display: flex;
          justify-content: center;
        }
        .single-container {
          padding: 10mm 0;
          display: flex;
          justify-content: center;
        }
        .grid-4-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8mm 6mm;
          width: 100%;
        }
        .sticker-box {
          position: relative;
          width: 95mm;
          min-height: 68mm;
          margin: 0 auto;
        }
        .sticker-cut-line {
          font-size: 8px;
          color: #999;
          text-align: center;
          margin-bottom: 2mm;
          letter-spacing: 0.5px;
        }
        .card-inner {
          border: 1.5px solid #4A2E1B;
          border-radius: 6px;
          padding: 4mm 5mm;
          background: #FFFAF5;
          height: calc(100% - 6mm);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .greeting-inner {
          position: relative;
          background: #FCF9F2;
          border: 1.5px solid #8C5E38;
          text-align: center;
          padding: 5mm;
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .brand-title {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #4A2E1B;
        }
        .brand-sub {
          font-size: 8px;
          font-weight: 600;
          color: #7A583E;
          letter-spacing: 0.5px;
        }
        .badge-priority {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          background: #EFE7DC;
          border-radius: 3px;
          color: #4A2E1B;
        }
        .priority-urgent {
          background: #FEE2E2;
          color: #991B1B;
          border: 1px solid #F87171;
        }
        .divider {
          border-top: 1px dashed #D3C1B0;
          margin: 2.5mm 0;
        }
        .field-label {
          font-size: 8.5px;
          color: #7A583E;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .recipient-name {
          font-size: 14px;
          font-weight: 800;
          color: #2D1E16;
          margin-top: 1px;
        }
        .phone {
          font-size: 11px;
          font-weight: 600;
          margin-top: 2px;
        }
        .address-box {
          margin-top: 3px;
          padding: 2mm;
          background: #F5ECE1;
          border-radius: 4px;
        }
        .address-text {
          font-size: 10.5px;
          line-height: 1.3;
          font-weight: 500;
        }
        .time-note {
          font-size: 9.5px;
          color: #8B3A1C;
          margin-top: 2px;
        }
        .pickup-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          color: #1E3A8A;
          background: #DBEAFE;
          padding: 2px 6px;
          border-radius: 3px;
          margin-top: 3px;
        }
        .items-text {
          font-size: 10px;
          font-weight: 600;
          color: #4A2E1B;
          margin-top: 1px;
        }
        .footer-row {
          display: flex;
          justify-content: space-between;
          font-size: 8.5px;
          color: #7A583E;
          margin-top: 2mm;
          padding-top: 2mm;
          border-top: 1px solid #E5D5C5;
        }
        /* Greeting card styles */
        .greeting-headline {
          font-size: 15px;
          font-weight: 800;
          color: #4A2E1B;
          letter-spacing: 0.5px;
          font-family: Georgia, serif;
        }
        .greeting-to {
          font-size: 12px;
          margin-top: 2px;
          color: #63432B;
        }
        .greeting-body {
          font-size: 10.5px;
          line-height: 1.45;
          margin: 3mm 0;
          color: #382417;
          font-style: italic;
          padding: 0 4mm;
        }
        .greeting-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 9px;
          border-top: 1px dashed #D8C4B0;
          padding-top: 2mm;
        }
        .from-text {
          color: #4A2E1B;
        }
        .brand-tag {
          font-size: 8px;
          color: #8C5E38;
          font-weight: 600;
        }
        .ornament {
          position: absolute;
          font-size: 11px;
          color: #A6754D;
          opacity: 0.5;
        }
        .top-left { top: 2mm; left: 2.5mm; }
        .top-right { top: 2mm; right: 2.5mm; }
        .bottom-left { bottom: 2mm; left: 2.5mm; }
        .bottom-right { bottom: 2mm; right: 2.5mm; }
      </style>
    </head>
    <body>
      ${contentHtml}
    </body>
    </html>
  `;
}

export function printSticker(order: Order, options: StickerPrintOptions) {
  const html = generateStickerHtml(order, options);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 250);
}
