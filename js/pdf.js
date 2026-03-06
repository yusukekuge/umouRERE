/**
 * pdf.js - PDF生成 (jsPDF + jsPDF-AutoTable)
 * 見積書・発注書のPDF出力
 */

// ============================================================
// 共通ヘルパー
// ============================================================
function createDoc() {
  // jsPDF: { orientation, unit, format }
  return new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

const PDF_COLORS = {
  primary:   [41, 98, 155],   // 濃い青
  secondary: [100, 100, 100],
  accent:    [230, 130, 30],
  border:    [200, 200, 200],
  lightBg:   [245, 248, 252],
  white:     [255, 255, 255],
  black:     [30, 30, 30],
};

// フォント設定 (日本語はベースフォントのみ; 埋め込み不要の文字で対応)
function setupFont(doc) {
  // jsPDF デフォルトでは Helveticaのみ。日本語はCanvas経由 or noto等。
  // ここでは html2canvas相当のシンプル出力を採用。
  doc.setFont('helvetica');
}

// ============================================================
// 見積書PDF
// ============================================================
function generateEstimatePDF(order) {
  const doc = createDoc();
  const settings = getSettings();
  const customer = order.customerId ? getCustomer(order.customerId) : null;
  const customerName = order.customerName || (customer ? customer.name : '');

  // --- ページ設定 ---
  const pageW = 210;
  const margin = 15;
  let y = 15;

  // ヘッダー背景
  doc.setFillColor(...PDF_COLORS.primary);
  doc.rect(0, 0, pageW, 28, 'F');

  // タイトル
  doc.setFontSize(18);
  doc.setTextColor(...PDF_COLORS.white);
  doc.text('見  積  書', pageW / 2, 12, { align: 'center' });

  // 見積番号・日付
  doc.setFontSize(8);
  doc.text(`見積番号: ${order.estimateNo || ''}`, pageW - margin, 10, { align: 'right' });
  doc.text(`発行日: ${formatDate(order.estimateDate || new Date())}`, pageW - margin, 15, { align: 'right' });
  doc.text(`有効期限: ${formatDate(order.validUntil || addDays(settings.estimateValid))}`, pageW - margin, 20, { align: 'right' });

  y = 36;

  // 会社情報（右上）
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.secondary);
  const co = settings;
  const coLines = [
    co.companyName,
    co.postalCode ? `〒${co.postalCode}` : '',
    co.companyAddress,
    co.companyTel ? `TEL: ${co.companyTel}` : '',
    co.companyFax ? `FAX: ${co.companyFax}` : '',
    co.companyEmail ? co.companyEmail : '',
  ].filter(Boolean);
  let coY = y;
  coLines.forEach(line => {
    doc.text(line, pageW - margin, coY, { align: 'right' });
    coY += 4.5;
  });

  // 宛先
  doc.setFontSize(13);
  doc.setTextColor(...PDF_COLORS.black);
  doc.text(`${customerName || '　　　　　　　　'} 御中`, margin, y + 5);
  doc.setLineWidth(0.3);
  doc.setDrawColor(...PDF_COLORS.primary);
  doc.line(margin, y + 7, 100, y + 7);

  if (customer?.address) {
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.secondary);
    doc.text(customer.address, margin, y + 12);
    if (customer.tel) doc.text(`TEL: ${customer.tel}`, margin, y + 16);
  }

  y = Math.max(y + 20, coY + 5);

  // 件名・種別
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.black);
  const typeLabel = order.type === 'reform' ? '羽毛ふとんリフォーム' : 'オーダー羽毛ふとん';
  const sizeLabel = order.size ? `${SIZES[order.size]?.label ?? order.size}（${SIZES[order.size]?.dim ?? ''}）` : '';
  doc.text(`件名: ${typeLabel} ${sizeLabel}`, margin, y);
  y += 7;

  // 合計金額ボックス
  doc.setFillColor(...PDF_COLORS.lightBg);
  doc.setDrawColor(...PDF_COLORS.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageW - margin * 2, 12, 2, 2, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.secondary);
  doc.text('お見積り金額（税込）', margin + 4, y + 5);
  doc.setFontSize(16);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(formatYen(order.total), pageW - margin - 4, y + 8, { align: 'right' });
  y += 18;

  // 明細テーブル
  const tableBody = (order.breakdown || []).map(item => [
    item.label,
    item.note || '',
    item.price === 0 && item.note ? item.note : formatYen(item.price),
  ]);

  doc.autoTable({
    startY: y,
    head: [['品目・内容', '備考', '金額（税込）']],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: PDF_COLORS.primary,
      textColor: [255,255,255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [248, 250, 253] },
  });

  y = doc.lastAutoTable.finalY + 5;

  // 合計行
  doc.autoTable({
    startY: y,
    body: [
      ['', '合　計（税込）', formatYen(order.total)],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, fontStyle: 'bold' },
    bodyStyles: {
      fillColor: [235, 245, 255],
      textColor: PDF_COLORS.primary,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 40, halign: 'right' },
    },
    tableLineColor: PDF_COLORS.primary,
    tableLineWidth: 0.3,
  });

  y = doc.lastAutoTable.finalY + 8;

  // 備考
  if (order.notes) {
    doc.setFontSize(9);
    doc.setTextColor(...PDF_COLORS.secondary);
    doc.text('【備考】', margin, y);
    y += 5;
    doc.setTextColor(...PDF_COLORS.black);
    const noteLines = doc.splitTextToSize(order.notes, pageW - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 5 + 3;
  }

  // フッター
  const pageH = 297;
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.secondary);
  doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
  doc.text('※本見積書の価格は税込金額です。', margin, pageH - 8);
  doc.text(settings.companyName, pageW - margin, pageH - 8, { align: 'right' });

  doc.save(`見積書_${order.estimateNo || 'draft'}.pdf`);
}

// ============================================================
// 発注書PDF
// ============================================================
function generateOrderSheetPDF(order) {
  const doc = createDoc();
  const settings = getSettings();
  const customer = order.customerId ? getCustomer(order.customerId) : null;
  const customerName = order.customerName || (customer ? customer.name : '');

  const pageW = 210;
  const margin = 15;
  let y = 15;

  // ヘッダー背景
  doc.setFillColor(...[22, 60, 100]);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setFontSize(18);
  doc.setTextColor(255,255,255);
  doc.text('発  注  書', pageW / 2, 12, { align: 'center' });

  doc.setFontSize(8);
  doc.text(`発注番号: ${order.orderNo || ''}`, pageW - margin, 10, { align: 'right' });
  doc.text(`発注日: ${formatDate(order.orderDate || new Date())}`, pageW - margin, 15, { align: 'right' });
  const delivDate = order.deliveryDate || addDays(settings.deliveryDays);
  doc.text(`納期: ${formatDate(delivDate)}`, pageW - margin, 20, { align: 'right' });

  y = 36;

  // 発注先（右上）
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.secondary);
  const coLines = [
    settings.companyName,
    settings.companyAddress || '',
    settings.companyTel ? `TEL: ${settings.companyTel}` : '',
  ].filter(Boolean);
  let coY = y;
  coLines.forEach(line => {
    doc.text(line, pageW - margin, coY, { align: 'right' });
    coY += 4.5;
  });

  // 発注先ラベル
  doc.setFontSize(11);
  doc.setTextColor(...PDF_COLORS.black);
  doc.text('発注先: 　　　　　　　　　　　御中', margin, y + 5);
  doc.setLineWidth(0.3);
  doc.setDrawColor(...PDF_COLORS.primary);
  doc.line(margin, y + 7, pageW / 2, y + 7);

  y = Math.max(y + 18, coY + 5);

  // エンドユーザー情報
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.secondary);
  doc.text(`エンドユーザー: ${customerName}`, margin, y);
  const sizeLabel = order.size ? `${SIZES[order.size]?.label ?? order.size}（${SIZES[order.size]?.dim ?? ''}）` : '';
  const typeLabel = order.type === 'reform' ? '羽毛ふとんリフォーム' : 'オーダー羽毛ふとん';
  doc.text(`種別: ${typeLabel}  /  サイズ: ${sizeLabel}`, margin, y + 5);
  y += 13;

  // 発注明細テーブル
  const tableBody = (order.breakdown || []).map((item, i) => [
    String(i + 1),
    item.label,
    item.note || '',
    item.price === 0 && item.note ? item.note : formatYen(item.price),
  ]);

  doc.autoTable({
    startY: y,
    head: [['No.', '品目・内容', '備考', '金額（税込）']],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [22, 60, 100],
      textColor: [255,255,255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 95 },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [248, 250, 253] },
  });

  y = doc.lastAutoTable.finalY + 5;

  // 合計
  doc.autoTable({
    startY: y,
    body: [['', '', '発注合計（税込）', formatYen(order.total)]],
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fillColor: [235, 245, 255], textColor: [22, 60, 100] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 95 },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 8;

  // 備考
  if (order.notes) {
    doc.setFontSize(9);
    doc.setTextColor(...PDF_COLORS.secondary);
    doc.text('【特記事項】', margin, y);
    y += 5;
    doc.setTextColor(...PDF_COLORS.black);
    const lines = doc.splitTextToSize(order.notes, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 3;
  }

  // 確認欄
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.secondary);
  doc.text('確認印', margin, y);
  doc.rect(margin + 15, y - 5, 20, 12);
  doc.text('受領印', margin + 50, y);
  doc.rect(margin + 65, y - 5, 20, 12);

  // フッター
  const pageH = 297;
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.secondary);
  doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
  doc.text('※本発注書の価格は税込金額です。', margin, pageH - 8);
  doc.text(settings.companyName, pageW - margin, pageH - 8, { align: 'right' });

  doc.save(`発注書_${order.orderNo || 'draft'}.pdf`);
}
