import { Order } from '@/types';
import { formatRupiah } from './hpp';

export type ReceiptWidth = '58mm' | '80mm' | 'a4';

export interface PrintStrukOptions {
  width: ReceiptWidth;
  storeName?: string;
  tagline?: string;
  phone?: string;
}

export function generateReceiptHtml(order: Order, options: PrintStrukOptions): string {
  const widthMm = options.width === '58mm' ? 48 : options.width === '80mm' ? 72 : 180;
  const fontSize = options.width === '58mm' ? '11px' : options.width === '80mm' ? '13px' : '15px';
  const headerSize = options.width === '58mm' ? '15px' : options.width === '80mm' ? '18px' : '22px';

  const orderDateObj = new Date(order.createdAt || Date.now());
  const dateFormatted = orderDateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = orderDateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isAntar = order.orderType === 'antar';

  const itemsHtml = order.items
    .map(
      (item) => `
      <div style="margin: 3px 0;">
        <div style="font-weight: 600; word-break: break-word;">${item.productName}</div>
        <div style="display: flex; justify-content: space-between; font-size: 0.9em; color: #333;">
          <span>${formatRupiah(item.price)} × ${item.quantity}</span>
          <span>${formatRupiah(item.price * item.quantity)}</span>
        </div>
        ${item.notes ? `<div style="font-size: 0.8em; font-style: italic; color: #555;">- ${item.notes}</div>` : ''}
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Struk ${order.orderNumber} - ${options.storeName || 'SENDOKecil'}</title>
      <style>
        @page {
          size: ${options.width === 'a4' ? 'A4 portrait' : 'auto'};
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Courier New', Courier, monospace;
          color: #000;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 6px 0;
          background: #fff;
        }
        .struk-wrapper {
          width: ${widthMm}mm;
          max-width: 100%;
          padding: 4px;
          font-size: ${fontSize};
          line-height: 1.35;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .divider {
          border-top: 1px dashed #444;
          margin: 6px 0;
          height: 0;
        }
        .flex-between {
          display: flex;
          justify-content: space-between;
          gap: 6px;
        }
        .store-header {
          font-size: ${headerSize};
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .meta-text {
          font-size: 0.85em;
          color: #333;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border: 1px solid #000;
          font-size: 0.85em;
          font-weight: bold;
          margin: 4px 0;
          border-radius: 4px;
        }
        .footer-note {
          font-size: 0.8em;
          color: #444;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="struk-wrapper">
        <div class="text-center">
          <div class="store-header">${options.storeName || 'SENDOKECIL'}</div>
          <div class="meta-text">${options.tagline || 'Dessert & Sweet Moments · EST 2026'}</div>
          ${options.phone ? `<div class="meta-text">WA: ${options.phone}</div>` : ''}
        </div>

        <div class="divider"></div>

        <div class="flex-between meta-text">
          <span>No: <b>${order.orderNumber}</b></span>
          <span>${dateFormatted} ${timeFormatted}</span>
        </div>
        <div class="flex-between meta-text">
          <span>Pelanggan:</span>
          <b>${order.customerName}</b>
        </div>
        ${order.customerPhone ? `
          <div class="flex-between meta-text">
            <span>WhatsApp:</span>
            <span>${order.customerPhone}</span>
          </div>
        ` : ''}
        <div class="flex-between meta-text" style="margin-top: 2px;">
          <span>Layanan:</span>
          <b>${isAntar ? '🛵 ANTAR (DELIVERY)' : '🏪 AMBIL DI TEMPAT'}</b>
        </div>
        ${isAntar && order.deliveryAddress ? `
          <div style="font-size: 0.85em; margin-top: 3px; background: #f4f4f4; padding: 3px; border-radius: 3px;">
            <b>Alamat:</b> ${order.deliveryAddress}
            ${order.deliveryTimeNote ? `<br><b>Waktu:</b> ${order.deliveryTimeNote}` : ''}
          </div>
        ` : ''}

        <div class="divider"></div>

        <!-- Items list -->
        <div>
          ${itemsHtml}
        </div>

        <div class="divider"></div>

        <!-- Totals -->
        <div class="flex-between" style="margin-bottom: 2px;">
          <span>Total Item</span>
          <span>${order.totalPcs} pcs</span>
        </div>
        <div class="flex-between" style="margin-bottom: 2px;">
          <span>Subtotal</span>
          <span>${formatRupiah(order.subtotal || order.totalAmount)}</span>
        </div>
        ${order.deliveryFee ? `
          <div class="flex-between" style="margin-bottom: 2px;">
            <span>Ongkos Kirim</span>
            <span>${formatRupiah(order.deliveryFee)}</span>
          </div>
        ` : ''}
        <div class="flex-between bold" style="font-size: 1.15em; margin-top: 4px; border-top: 1px solid #000; padding-top: 4px;">
          <span>TOTAL</span>
          <span>${formatRupiah(order.totalAmount)}</span>
        </div>

        <div class="divider"></div>

        <div class="flex-between meta-text">
          <span>Metode Bayar:</span>
          <b>${order.paymentMethod === 'TF' ? 'Transfer BCA' : order.paymentMethod}</b>
        </div>
        <div class="text-center" style="margin-top: 4px;">
          <div class="status-badge">
            ${order.paymentStatus === 'lunas' ? '✓ LUNAS' : 'MENUNGGU VERIFIKASI'}
          </div>
        </div>

        ${order.customerNotes ? `
          <div class="divider"></div>
          <div style="font-size: 0.85em;">
            <b>Catatan:</b> ${order.customerNotes}
          </div>
        ` : ''}

        <div class="divider"></div>

        <div class="text-center footer-note">
          Terima kasih atas pesanan Anda!<br>
          <i>Simpan di chiller/kulkas agar lebih nikmat ✨</i><br>
          Instagram: @sendokecil
        </div>
      </div>
    </body>
    </html>
  `;
}

export function printOrderReceipt(order: Order, options: PrintStrukOptions = { width: '58mm' }) {
  const html = generateReceiptHtml(order, options);

  // Use a hidden iframe for seamless printing without leaving the page
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
