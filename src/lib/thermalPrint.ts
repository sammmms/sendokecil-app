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

/**
 * Render a pure black-and-white monochrome receipt directly onto an HTML5 canvas.
 * Perfectly sized for 58mm/80mm thermal printers or sharing to WhatsApp / Bluetooth print apps.
 */
export async function renderReceiptToCanvas(order: Order, width: ReceiptWidth = '58mm'): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas 2d context');

  // Standard thermal widths: 58mm -> 384px (render at 2x 576px for crisp text), 80mm -> 576px (render at 720px)
  const canvasWidth = width === '58mm' ? 576 : width === '80mm' ? 720 : 800;
  const padding = 24;
  const contentWidth = canvasWidth - padding * 2;

  // Measurement pass to compute total height
  const lineHeight = 28;
  const fontMonospace = '"Courier New", Courier, monospace';

  // Estimate lines needed
  let estimatedHeight = 360 + order.items.length * 64;
  if (order.deliveryAddress) estimatedHeight += 60;
  if (order.customerNotes) estimatedHeight += 50;

  canvas.width = canvasWidth;
  canvas.height = estimatedHeight;

  // Pure white paper background (thermal paper)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pure black text & ink
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;

  let y = 36;

  // Helper to draw dashed divider
  const drawDashedDivider = (currY: number) => {
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(padding, currY);
    ctx.lineTo(canvasWidth - padding, currY);
    ctx.stroke();
    ctx.restore();
  };

  // Header
  ctx.font = `bold 28px ${fontMonospace}`;
  ctx.textAlign = 'center';
  ctx.fillText('SENDOKECIL', canvasWidth / 2, y);
  y += 26;

  ctx.font = `18px ${fontMonospace}`;
  ctx.fillText('EST 2026 · KUE GABIN FLA', canvasWidth / 2, y);
  y += 24;

  ctx.font = `16px ${fontMonospace}`;
  ctx.fillText('WA: 0813 7749 3907', canvasWidth / 2, y);
  y += 18;

  drawDashedDivider(y);
  y += 26;

  // Metadata
  ctx.font = `18px ${fontMonospace}`;
  ctx.textAlign = 'left';
  ctx.fillText(`NO: #${order.orderNumber}`, padding, y);
  ctx.textAlign = 'right';
  ctx.fillText(order.orderDate || '', canvasWidth - padding, y);
  y += lineHeight;

  ctx.textAlign = 'left';
  ctx.fillText('PELANGGAN:', padding, y);
  ctx.textAlign = 'right';
  ctx.font = `bold 18px ${fontMonospace}`;
  ctx.fillText(order.customerName, canvasWidth - padding, y);
  y += lineHeight;

  if (order.customerPhone) {
    ctx.font = `18px ${fontMonospace}`;
    ctx.textAlign = 'left';
    ctx.fillText('WHATSAPP:', padding, y);
    ctx.textAlign = 'right';
    ctx.fillText(order.customerPhone, canvasWidth - padding, y);
    y += lineHeight;
  }

  ctx.font = `18px ${fontMonospace}`;
  ctx.textAlign = 'left';
  ctx.fillText('LAYANAN:', padding, y);
  ctx.textAlign = 'right';
  ctx.fillText(order.orderType === 'antar' ? 'DELIVERY (ANTAR)' : 'AMBIL SENDIRI', canvasWidth - padding, y);
  y += lineHeight;

  if (order.orderType === 'antar' && order.deliveryAddress) {
    ctx.textAlign = 'left';
    ctx.font = `bold 17px ${fontMonospace}`;
    ctx.fillText(`TUJUAN: ${order.deliveryAddress}`, padding, y);
    y += 22;
    if (order.deliveryTimeNote) {
      ctx.font = `16px ${fontMonospace}`;
      ctx.fillText(`WAKTU : ${order.deliveryTimeNote}`, padding, y);
      y += 22;
    }
  }

  y += 6;
  drawDashedDivider(y);
  y += 28;

  // Items
  order.items.forEach((item) => {
    ctx.font = `bold 19px ${fontMonospace}`;
    ctx.textAlign = 'left';
    ctx.fillText(item.productName, padding, y);
    y += 22;

    ctx.font = `17px ${fontMonospace}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${formatRupiah(item.price)} x ${item.quantity}`, padding, y);
    ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(item.price * item.quantity), canvasWidth - padding, y);
    y += 28;
  });

  drawDashedDivider(y);
  y += 26;

  // Subtotals
  ctx.font = `18px ${fontMonospace}`;
  ctx.textAlign = 'left';
  ctx.fillText(`TOTAL ITEM (${order.totalPcs} pcs):`, padding, y);
  ctx.textAlign = 'right';
  ctx.fillText(formatRupiah(order.subtotal || order.totalAmount), canvasWidth - padding, y);
  y += lineHeight;

  if (order.deliveryFee) {
    ctx.textAlign = 'left';
    ctx.fillText('ONGKIR:', padding, y);
    ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(order.deliveryFee), canvasWidth - padding, y);
    y += lineHeight;
  }

  // Grand Total Solid Line
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.moveTo(padding, y);
  ctx.lineTo(canvasWidth - padding, y);
  ctx.stroke();
  y += 26;

  ctx.font = `bold 24px ${fontMonospace}`;
  ctx.textAlign = 'left';
  ctx.fillText('TOTAL :', padding, y);
  ctx.textAlign = 'right';
  ctx.fillText(formatRupiah(order.totalAmount), canvasWidth - padding, y);
  y += 24;

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(canvasWidth - padding, y);
  ctx.stroke();
  y += 24;

  // Payment Status Box
  ctx.font = `bold 18px ${fontMonospace}`;
  ctx.textAlign = 'center';
  const statusText = order.paymentStatus === 'lunas' ? '[ LUNAS / APPROVED ]' : '[ MENUNGGU KONFIRMASI ]';
  ctx.fillText(statusText, canvasWidth / 2, y);
  y += 24;

  ctx.font = `16px ${fontMonospace}`;
  ctx.fillText(`METODE: ${order.paymentMethod === 'TF' ? 'TRANSFER BCA' : order.paymentMethod}`, canvasWidth / 2, y);
  y += 18;

  drawDashedDivider(y);
  y += 26;

  // Footer notes
  ctx.font = `15px ${fontMonospace}`;
  ctx.textAlign = 'center';
  ctx.fillText('Terima kasih atas pesanan Anda!', canvasWidth / 2, y);
  y += 20;
  ctx.fillText('Simpan di kulkas agar lebih nikmat', canvasWidth / 2, y);
  y += 20;
  ctx.fillText('Instagram: @sendokecil', canvasWidth / 2, y);
  y += 28;

  // Crop canvas height to actual content
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = canvasWidth;
  finalCanvas.height = y;
  const fCtx = finalCanvas.getContext('2d');
  if (fCtx) {
    fCtx.drawImage(canvas, 0, 0);
    return finalCanvas;
  }
  return canvas;
}

/**
 * Share or download the monochrome thermal receipt as a high-contrast PNG image.
 * Uses Web Share API if available (direct sharing to WhatsApp / Bluetooth apps / Gallery).
 */
export async function shareReceiptImage(order: Order, width: ReceiptWidth = '58mm'): Promise<{ success: boolean; method: 'share' | 'download' }> {
  try {
    const canvas = await renderReceiptToCanvas(order, width);
    const filename = `Struk-SENDOKecil-${order.orderNumber}.png`;

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Gagal merender gambar struk');

    const file = new File([blob], filename, { type: 'image/png' });

    // Check if device supports sharing files
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Struk SENDOKecil #${order.orderNumber}`,
        text: `Struk Pesanan SENDOKecil #${order.orderNumber} - ${order.customerName}`,
      });
      return { success: true, method: 'share' };
    }

    // Fallback: download PNG file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    return { success: true, method: 'download' };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { success: false, method: 'share' };
    }
    throw err;
  }
}
