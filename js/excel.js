/**
 * excel.js - Excel出力 (SheetJS/xlsx)
 * 見積書・発注書・受注一覧のExcel出力
 */

// ============================================================
// 共通ユーティリティ
// ============================================================

function applyHeaderStyle(ws, range) {
  // SheetJSのスタイル設定（xlsx-style使用時のみ有効）
  // 基本版では構造のみ設定
}

/** ワークブックをダウンロード */
function downloadXlsx(wb, filename) {
  XLSX.writeFile(wb, filename);
}

// ============================================================
// 見積書 Excel出力
// ============================================================
function generateEstimateExcel(order) {
  const settings = getSettings();
  const customer = order.customerId ? getCustomer(order.customerId) : null;
  const customerName = order.customerName || (customer ? customer.name : '');
  const sizeLabel = order.size ? `${SIZES[order.size]?.label ?? order.size}（${SIZES[order.size]?.dim ?? ''}）` : '';
  const typeLabel = order.type === 'reform' ? '羽毛ふとんリフォーム' : 'オーダー羽毛ふとん';

  const wb = XLSX.utils.book_new();

  // シートデータ構築
  const rows = [];
  rows.push(['見　積　書']);
  rows.push([]);
  rows.push(['見積番号', order.estimateNo || '', '', '', '発行日', formatDate(order.estimateDate || new Date())]);
  rows.push(['有効期限', formatDate(order.validUntil || addDays(settings.estimateValid))]);
  rows.push([]);
  rows.push([`${customerName || '　　　　　　　　'} 御中`]);
  if (customer?.address) rows.push([customer.address]);
  if (customer?.tel)     rows.push([`TEL: ${customer.tel}`]);
  rows.push([]);
  rows.push(['件名', `${typeLabel} ${sizeLabel}`]);
  rows.push([]);

  // 金額ボックス
  rows.push(['お見積り金額（税込）', '', formatYen(order.total)]);
  rows.push([]);

  // 明細ヘッダー
  rows.push(['品目・内容', '備考', '金額（税込）']);

  // 明細
  (order.breakdown || []).forEach(item => {
    rows.push([
      item.label,
      item.note || '',
      item.price === 0 && item.note ? item.note : `¥${Number(item.price).toLocaleString('ja-JP')}`,
    ]);
  });

  rows.push([]);
  rows.push(['', '合　計（税込）', `¥${Number(order.total).toLocaleString('ja-JP')}`]);
  rows.push([]);

  // 備考
  if (order.notes) {
    rows.push(['【備考】']);
    rows.push([order.notes]);
    rows.push([]);
  }

  rows.push(['']);
  rows.push(['発行者', settings.companyName]);
  rows.push(['住所', settings.companyAddress || '']);
  rows.push(['TEL', settings.companyTel || '']);
  rows.push(['']);
  rows.push(['※本見積書の価格は税込金額です。']);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // 列幅設定
  ws['!cols'] = [
    { wch: 50 }, // A列
    { wch: 20 }, // B列
    { wch: 18 }, // C列
  ];

  XLSX.utils.book_append_sheet(wb, ws, '見積書');
  downloadXlsx(wb, `見積書_${order.estimateNo || 'draft'}.xlsx`);
}

// ============================================================
// 発注書 Excel出力
// ============================================================
function generateOrderSheetExcel(order) {
  const settings = getSettings();
  const customer = order.customerId ? getCustomer(order.customerId) : null;
  const customerName = order.customerName || (customer ? customer.name : '');
  const sizeLabel = order.size ? `${SIZES[order.size]?.label ?? order.size}（${SIZES[order.size]?.dim ?? ''}）` : '';
  const typeLabel = order.type === 'reform' ? '羽毛ふとんリフォーム' : 'オーダー羽毛ふとん';

  const wb = XLSX.utils.book_new();
  const rows = [];

  rows.push(['発　注　書']);
  rows.push([]);
  rows.push(['発注番号', order.orderNo || '', '', '', '発注日', formatDate(order.orderDate || new Date())]);
  rows.push(['納期', formatDate(order.deliveryDate || addDays(settings.deliveryDays))]);
  rows.push([]);
  rows.push(['発注先', '　　　　　　　　　　　御中']);
  rows.push([]);
  rows.push(['発注者', settings.companyName]);
  rows.push(['住所', settings.companyAddress || '']);
  rows.push(['TEL', settings.companyTel || '']);
  rows.push([]);
  rows.push(['エンドユーザー', customerName]);
  rows.push(['種別', `${typeLabel}`]);
  rows.push(['サイズ', sizeLabel]);
  rows.push([]);

  rows.push(['No.', '品目・内容', '備考', '金額（税込）']);
  (order.breakdown || []).forEach((item, i) => {
    rows.push([
      i + 1,
      item.label,
      item.note || '',
      item.price === 0 && item.note ? item.note : `¥${Number(item.price).toLocaleString('ja-JP')}`,
    ]);
  });

  rows.push([]);
  rows.push(['', '', '発注合計（税込）', `¥${Number(order.total).toLocaleString('ja-JP')}`]);
  rows.push([]);

  if (order.notes) {
    rows.push(['【特記事項】']);
    rows.push([order.notes]);
    rows.push([]);
  }

  rows.push(['※本発注書の価格は税込金額です。']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 52 },
    { wch: 20 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, '発注書');
  downloadXlsx(wb, `発注書_${order.orderNo || 'draft'}.xlsx`);
}

// ============================================================
// 受注一覧 Excel出力
// ============================================================
function generateOrderListExcel() {
  const orders = getOrders();
  const wb = XLSX.utils.book_new();

  const rows = [
    ['受注一覧', '', '', '', '', '', '', '', formatDate(new Date())],
    [],
    ['受注番号', '見積番号', '顧客名', '種別', 'サイズ', '合計金額', 'ステータス', '受注日', '納品日', '備考'],
  ];

  orders.forEach(o => {
    const customer = o.customerId ? getCustomer(o.customerId) : null;
    rows.push([
      o.orderNo || '',
      o.estimateNo || '',
      o.customerName || (customer ? customer.name : ''),
      o.type === 'reform' ? 'リフォーム' : 'オーダー',
      o.size ? `${SIZES[o.size]?.label ?? o.size}` : '',
      o.total ? `¥${Number(o.total).toLocaleString('ja-JP')}` : '',
      getStatusLabel(o.status),
      formatDate(o.orderDate || o.createdAt),
      formatDate(o.deliveryDate),
      o.notes || '',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, '受注一覧');
  downloadXlsx(wb, `受注一覧_${formatDate(new Date()).replace(/\//g, '')}.xlsx`);
}

// ============================================================
// データバックアップExcel出力
// ============================================================
function exportDataToExcel() {
  const wb = XLSX.utils.book_new();

  // 顧客シート
  const customers = getCustomers();
  const custRows = [
    ['顧客ID', '氏名', '電話番号', 'メール', '住所', '郵便番号', '備考', '登録日'],
    ...customers.map(c => [
      c.id, c.name, c.tel || '', c.email || '', c.address || '',
      c.postalCode || '', c.notes || '', formatDate(c.createdAt),
    ]),
  ];
  const wsCust = XLSX.utils.aoa_to_sheet(custRows);
  XLSX.utils.book_append_sheet(wb, wsCust, '顧客マスター');

  // 受注シート
  const orders = getOrders();
  const orderRows = [
    ['注文ID', '受注番号', '見積番号', '顧客名', '種別', 'サイズ', '合計', 'ステータス', '受注日', '納品日', '備考'],
    ...orders.map(o => {
      const c = o.customerId ? getCustomer(o.customerId) : null;
      return [
        o.id, o.orderNo || '', o.estimateNo || '',
        o.customerName || (c ? c.name : ''),
        o.type === 'reform' ? 'リフォーム' : 'オーダー',
        o.size || '', o.total || 0,
        getStatusLabel(o.status),
        formatDate(o.orderDate || o.createdAt),
        formatDate(o.deliveryDate),
        o.notes || '',
      ];
    }),
  ];
  const wsOrd = XLSX.utils.aoa_to_sheet(orderRows);
  XLSX.utils.book_append_sheet(wb, wsOrd, '受注一覧');

  downloadXlsx(wb, `データバックアップ_${formatDate(new Date()).replace(/\//g, '')}.xlsx`);
}
