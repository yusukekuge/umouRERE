/**
 * app.js - メインアプリケーションロジック
 */

// ============================================================
// アプリ状態
// ============================================================
const App = {
  currentView: 'dashboard',
  editingOrder: null,   // 現在編集中の注文オブジェクト
  editingCustomer: null,
  customItemCount: 0,
};

// ============================================================
// 初期化
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  navigateTo('dashboard');
});

function setupNav() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });
}

function navigateTo(view) {
  App.currentView = view;
  // サイドバーのアクティブ状態
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.closest('.nav-item')?.classList.toggle('active', el.dataset.nav === view);
  });
  // ビュー切り替え
  document.querySelectorAll('.view-section').forEach(el => {
    el.style.display = 'none';
  });
  const section = document.getElementById(`view-${view}`);
  if (section) section.style.display = 'block';

  // ビュー描画
  switch(view) {
    case 'dashboard':  renderDashboard(); break;
    case 'estimate':   renderEstimateForm(); break;
    case 'orders':     renderOrderList(); break;
    case 'customers':  renderCustomerList(); break;
    case 'settings':   renderSettings(); break;
  }
}

// ============================================================
// ダッシュボード
// ============================================================
function renderDashboard() {
  const orders = getOrders();
  const customers = getCustomers();

  // サマリーカード更新
  const counts = {};
  ORDER_STATUSES.forEach(s => counts[s.key] = 0);
  let totalRevenue = 0;
  let monthRevenue = 0;
  const thisMonth = new Date().toISOString().slice(0, 7);
  orders.forEach(o => {
    counts[o.status] = (counts[o.status] || 0) + 1;
    totalRevenue += (o.total || 0);
    if ((o.orderDate || o.createdAt || '').startsWith(thisMonth)) {
      monthRevenue += (o.total || 0);
    }
  });

  setEl('dash-total-orders', orders.length);
  setEl('dash-customers', customers.length);
  setEl('dash-month-revenue', formatYen(monthRevenue));
  setEl('dash-total-revenue', formatYen(totalRevenue));

  // ステータス別
  const sbEl = document.getElementById('dash-status-breakdown');
  if (sbEl) {
    sbEl.innerHTML = ORDER_STATUSES.map(s =>
      `<div class="d-flex justify-content-between align-items-center mb-1">
        <span class="badge bg-${s.color}">${s.label}</span>
        <strong>${counts[s.key] || 0} 件</strong>
      </div>`
    ).join('');
  }

  // 最近の受注（5件）
  const recent = [...orders]
    .sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''))
    .slice(0, 5);
  const recentEl = document.getElementById('dash-recent-orders');
  if (recentEl) {
    if (recent.length === 0) {
      recentEl.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">受注データがありません</td></tr>';
    } else {
      recentEl.innerHTML = recent.map(o => {
        const c = o.customerId ? getCustomer(o.customerId) : null;
        const name = o.customerName || (c ? c.name : '---');
        return `<tr style="cursor:pointer" onclick="showOrderDetail('${o.id}')">
          <td>${o.orderNo || o.estimateNo || '---'}</td>
          <td>${name}</td>
          <td><span class="badge bg-${getStatusColor(o.status)}">${getStatusLabel(o.status)}</span></td>
          <td class="text-end">${formatYen(o.total)}</td>
          <td>${formatDate(o.orderDate || o.createdAt)}</td>
        </tr>`;
      }).join('');
    }
  }
}

// ============================================================
// 見積もりフォーム
// ============================================================
function renderEstimateForm(existingOrder) {
  App.editingOrder = existingOrder || null;
  App.customItemCount = 0;

  // カスタム項目をクリア
  const customContainer = document.getElementById('custom-items-container');
  if (customContainer) customContainer.innerHTML = '<small class="text-muted">「追加」ボタンで自由に項目を加えられます</small>';

  // 顧客ドロップダウン
  const custSel = document.getElementById('est-customer-select');
  if (custSel) {
    const customers = getCustomers();
    custSel.innerHTML = '<option value="">-- 既存顧客を選択 --</option>' +
      customers.map(c => `<option value="${c.id}">${c.name}${c.tel ? ' / ' + c.tel : ''}</option>`).join('');
    if (existingOrder?.customerId) custSel.value = existingOrder.customerId;
  }

  // 既存データ復元
  if (existingOrder) {
    const type = existingOrder.type || 'reform';
    setVal('est-type', type);
    // ラジオボタン同期
    const radio = document.getElementById(type === 'reform' ? 'type-reform' : 'type-order');
    if (radio) radio.checked = true;
    setVal('est-size', existingOrder.size || 'SL');
    setVal('est-customer-name', existingOrder.customerName || '');
    setVal('est-notes', existingOrder.notes || '');
    setVal('est-estimate-no', existingOrder.estimateNo || '');
    setVal('est-order-date', existingOrder.estimateDate || today());
    setVal('est-delivery-date', existingOrder.deliveryDate || addDays(getSettings().deliveryDays));

    if (existingOrder.type === 'reform') {
      setVal('est-wash-method', existingOrder.washMethod || 'premium');
      setVal('est-wash-kg', existingOrder.washKg || '');
      setVal('est-fabric-select', existingOrder.newFabricIdx ?? '');
      setVal('est-quilt-select', existingOrder.quiltId ?? '');
      setVal('est-adddown-select', existingOrder.addDownId || '');
      setVal('est-adddown-kg', existingOrder.addDownKg || '');
      setVal('est-bag-select', existingOrder.bagIdx ?? '');
    } else {
      setVal('est-hane-select', existingOrder.haneNo || '');
      setVal('est-hane-kg', existingOrder.haneFillKg || '');
      setVal('est-order-fabric', existingOrder.fabricIdx ?? '');
      setVal('est-order-quilt', existingOrder.quiltId ?? '');
      setVal('est-order-bag', existingOrder.bagIdx ?? '');
    }
  } else {
    // デフォルト値
    setVal('est-type', 'reform');
    const reformRadio = document.getElementById('type-reform');
    if (reformRadio) reformRadio.checked = true;
    setVal('est-size', 'SL');
    setVal('est-customer-name', '');
    setVal('est-notes', '');
    setVal('est-wash-method', 'premium');
    setVal('est-wash-kg', '');
    setVal('est-fabric-select', '');
    setVal('est-quilt-select', '');
    setVal('est-adddown-select', '');
    setVal('est-adddown-kg', '');
    setVal('est-bag-select', '');
    setVal('est-hane-select', '');
    setVal('est-hane-kg', '');
    setVal('est-order-fabric', '');
    setVal('est-order-quilt', '');
    setVal('est-order-bag', '');
    setVal('est-estimate-no', generateEstimateNo());
    setVal('est-order-date', today());
    setVal('est-delivery-date', addDays(getSettings().deliveryDays));
  }

  toggleEstimateType();
  updateEstimateTotal();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toggleEstimateType() {
  const type = getVal('est-type');
  document.getElementById('reform-fields')?.style && (
    document.getElementById('reform-fields').style.display = type === 'reform' ? 'block' : 'none'
  );
  document.getElementById('order-fields')?.style && (
    document.getElementById('order-fields').style.display = type === 'order' ? 'block' : 'none'
  );
  updateEstimateTotal();
}

function updateEstimateTotal() {
  const type   = getVal('est-type');
  const size   = getVal('est-size');
  if (!size) return;

  let result;
  if (type === 'reform') {
    const washKg    = parseFloat(getVal('est-wash-kg')) || 0;
    const addDownKg = parseFloat(getVal('est-adddown-kg')) || 0;
    const fabricIdx = getVal('est-fabric-select') !== '' ? parseInt(getVal('est-fabric-select')) : null;
    const quiltId   = getVal('est-quilt-select')  !== '' ? parseInt(getVal('est-quilt-select'))  : null;
    const addDownId = getVal('est-adddown-select') || null;
    const bagIdx    = getVal('est-bag-select')     !== '' ? parseInt(getVal('est-bag-select'))    : null;

    result = calcReform({
      size, washMethod: getVal('est-wash-method') || 'premium',
      washKg, newFabricIdx: fabricIdx, quiltId,
      addDownId, addDownKg, bagIdx,
      customItems: getCustomItems('reform'),
    });
  } else {
    const haneFillKg = parseFloat(getVal('est-hane-kg')) || 0;
    const fabricIdx  = getVal('est-order-fabric') !== '' ? parseInt(getVal('est-order-fabric')) : null;
    const quiltId    = getVal('est-order-quilt')  !== '' ? parseInt(getVal('est-order-quilt'))  : null;
    const bagIdx     = getVal('est-order-bag')    !== '' ? parseInt(getVal('est-order-bag'))    : null;

    result = calcOrder({
      size, haneNo: getVal('est-hane-select'),
      haneFillKg, fabricIdx, quiltId, bagIdx,
      customItems: getCustomItems('order'),
    });
  }

  // 内訳表示
  const breakdownEl = document.getElementById('est-breakdown');
  if (breakdownEl) {
    if (result.breakdown.length === 0) {
      breakdownEl.innerHTML = '<tr><td colspan="2" class="text-center text-muted">項目を選択してください</td></tr>';
    } else {
      breakdownEl.innerHTML = result.breakdown.map(item =>
        `<tr>
          <td>${item.label}</td>
          <td class="text-end fw-bold">${item.price === 0 && item.note ? item.note : formatYen(item.price)}</td>
        </tr>`
      ).join('');
    }
  }

  // 合計表示
  setEl('est-total-display', formatYen(result.total));

  // アプリ状態に保持
  App._currentResult = result;
}

function getCustomItems(prefix) {
  const items = [];
  document.querySelectorAll(`.custom-item-row`).forEach(row => {
    const name  = row.querySelector('.custom-item-name')?.value?.trim();
    const price = row.querySelector('.custom-item-price')?.value;
    if (name && price) items.push({ name, price: parseInt(price.replace(/,/g,'')) || 0 });
  });
  return items;
}

function addCustomItem() {
  App.customItemCount++;
  const container = document.getElementById('custom-items-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'row g-2 mb-2 custom-item-row';
  div.innerHTML = `
    <div class="col-7">
      <input type="text" class="form-control form-control-sm custom-item-name" placeholder="項目名">
    </div>
    <div class="col-4">
      <input type="number" class="form-control form-control-sm custom-item-price" placeholder="金額（税込）" oninput="updateEstimateTotal()">
    </div>
    <div class="col-1">
      <button class="btn btn-sm btn-outline-danger" onclick="this.closest('.custom-item-row').remove(); updateEstimateTotal();">✕</button>
    </div>`;
  container.appendChild(div);
}

// 顧客選択時に名前を自動入力
function onCustomerSelect() {
  const sel = document.getElementById('est-customer-select');
  if (!sel || !sel.value) return;
  const c = getCustomer(sel.value);
  if (c) setVal('est-customer-name', c.name);
}

// 見積もり保存
function saveEstimate(status) {
  const type    = getVal('est-type');
  const size    = getVal('est-size');
  const custId  = getVal('est-customer-select') || null;
  const custName = getVal('est-customer-name') || '';
  const result  = App._currentResult || { breakdown: [], total: 0 };

  const order = {
    ...(App.editingOrder || {}),
    type,
    size,
    customerId:    custId,
    customerName:  custName,
    estimateNo:    getVal('est-estimate-no') || generateEstimateNo(),
    orderNo:       App.editingOrder?.orderNo || generateOrderNo(),
    estimateDate:  getVal('est-order-date') || today(),
    deliveryDate:  getVal('est-delivery-date') || addDays(getSettings().deliveryDays),
    validUntil:    addDays(getSettings().estimateValid),
    notes:         getVal('est-notes') || '',
    breakdown:     result.breakdown,
    total:         result.total,
    status:        status || App.editingOrder?.status || 'estimate',
    updatedAt:     new Date().toISOString(),
  };

  // タイプ別パラメータ保持
  if (type === 'reform') {
    Object.assign(order, {
      washMethod:   getVal('est-wash-method') || 'premium',
      washKg:       parseFloat(getVal('est-wash-kg')) || 0,
      newFabricIdx: getVal('est-fabric-select') !== '' ? parseInt(getVal('est-fabric-select')) : null,
      quiltId:      getVal('est-quilt-select')  !== '' ? parseInt(getVal('est-quilt-select'))  : null,
      addDownId:    getVal('est-adddown-select') || null,
      addDownKg:    parseFloat(getVal('est-adddown-kg')) || 0,
      bagIdx:       getVal('est-bag-select')     !== '' ? parseInt(getVal('est-bag-select'))    : null,
    });
  } else {
    Object.assign(order, {
      haneNo:     getVal('est-hane-select') || null,
      haneFillKg: parseFloat(getVal('est-hane-kg')) || 0,
      fabricIdx:  getVal('est-order-fabric') !== '' ? parseInt(getVal('est-order-fabric')) : null,
      quiltId:    getVal('est-order-quilt')  !== '' ? parseInt(getVal('est-order-quilt'))  : null,
      bagIdx:     getVal('est-order-bag')    !== '' ? parseInt(getVal('est-order-bag'))    : null,
    });
  }

  upsertOrder(order);
  App.editingOrder = order;
  showToast('保存しました');
  return order;
}

function saveAndShowPDF() {
  const order = saveEstimate();
  generateEstimatePDF(order);
}
function saveAndShowExcel() {
  const order = saveEstimate();
  generateEstimateExcel(order);
}
function saveOrderSheet() {
  const order = saveEstimate('confirmed');
  generateOrderSheetPDF(order);
}
function saveOrderSheetExcel() {
  const order = saveEstimate('confirmed');
  generateOrderSheetExcel(order);
}

// ============================================================
// 受注一覧
// ============================================================
function renderOrderList() {
  const orders = getOrders();
  const filterStatus = getVal('filter-status') || '';
  const filterType   = getVal('filter-type')   || '';
  const searchText   = (getVal('order-search') || '').toLowerCase();

  const filtered = orders.filter(o => {
    if (filterStatus && o.status !== filterStatus) return false;
    if (filterType   && o.type   !== filterType)   return false;
    if (searchText) {
      const c = o.customerId ? getCustomer(o.customerId) : null;
      const name = (o.customerName || (c ? c.name : '') || '').toLowerCase();
      const no   = (o.orderNo || o.estimateNo || '').toLowerCase();
      if (!name.includes(searchText) && !no.includes(searchText)) return false;
    }
    return true;
  }).sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''));

  const tbody = document.getElementById('order-list-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">受注データがありません</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const c = o.customerId ? getCustomer(o.customerId) : null;
    const name = o.customerName || (c ? c.name : '---');
    const typeLabel = o.type === 'reform' ? '<span class="badge bg-info text-dark">リフォーム</span>' : '<span class="badge bg-warning text-dark">オーダー</span>';
    const sizeLabel = o.size ? SIZES[o.size]?.label ?? o.size : '---';
    return `<tr>
      <td><small>${o.orderNo || o.estimateNo || '---'}</small></td>
      <td>${name}</td>
      <td>${typeLabel} ${sizeLabel}</td>
      <td><span class="badge bg-${getStatusColor(o.status)}">${getStatusLabel(o.status)}</span></td>
      <td class="text-end fw-bold">${formatYen(o.total)}</td>
      <td><small>${formatDate(o.orderDate || o.createdAt)}</small></td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editOrder('${o.id}')">編集</button>
        <button class="btn btn-sm btn-outline-secondary me-1" onclick="showOrderDetail('${o.id}')">詳細</button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteOrder('${o.id}')">削除</button>
      </td>
    </tr>`;
  }).join('');
}

function editOrder(id) {
  const order = getOrder(id);
  if (!order) return;
  navigateTo('estimate');
  renderEstimateForm(order);
}

function showOrderDetail(id) {
  const order = getOrder(id);
  if (!order) return;
  const c = order.customerId ? getCustomer(order.customerId) : null;
  const name = order.customerName || (c ? c.name : '---');
  const sizeInfo = order.size ? `${SIZES[order.size]?.label ?? order.size}（${SIZES[order.size]?.dim ?? ''}）` : '---';
  const typeLabel = order.type === 'reform' ? 'リフォーム' : 'オーダー';

  const breakdownHtml = (order.breakdown || []).map(item =>
    `<tr><td>${item.label}</td><td class="text-end">${formatYen(item.price)}</td></tr>`
  ).join('');

  const statusOpts = ORDER_STATUSES.map(s =>
    `<option value="${s.key}" ${order.status === s.key ? 'selected' : ''}>${s.label}</option>`
  ).join('');

  document.getElementById('order-detail-body').innerHTML = `
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header bg-light"><strong>基本情報</strong></div>
          <div class="card-body">
            <table class="table table-sm table-borderless mb-0">
              <tr><th width="40%">種別</th><td>${typeLabel}</td></tr>
              <tr><th>サイズ</th><td>${sizeInfo}</td></tr>
              <tr><th>顧客名</th><td>${name}</td></tr>
              <tr><th>見積番号</th><td>${order.estimateNo || '---'}</td></tr>
              <tr><th>受注番号</th><td>${order.orderNo || '---'}</td></tr>
              <tr><th>見積日</th><td>${formatDate(order.estimateDate)}</td></tr>
              <tr><th>納期</th><td>${formatDate(order.deliveryDate)}</td></tr>
              <tr><th>ステータス</th><td>
                <select class="form-select form-select-sm" id="detail-status-sel">${statusOpts}</select>
              </td></tr>
            </table>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header bg-light"><strong>金額内訳</strong></div>
          <div class="card-body p-0">
            <table class="table table-sm mb-0">
              ${breakdownHtml}
              <tr class="table-primary fw-bold">
                <td>合　計（税込）</td>
                <td class="text-end">${formatYen(order.total)}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      ${order.notes ? `<div class="col-12"><div class="alert alert-light"><strong>備考:</strong> ${order.notes}</div></div>` : ''}
    </div>`;

  document.getElementById('detail-edit-btn').onclick   = () => { bootstrap.Modal.getInstance(document.getElementById('orderDetailModal')).hide(); editOrder(id); };
  document.getElementById('detail-est-pdf-btn').onclick = () => generateEstimatePDF(order);
  document.getElementById('detail-est-xls-btn').onclick = () => generateEstimateExcel(order);
  document.getElementById('detail-ord-pdf-btn').onclick = () => generateOrderSheetPDF(order);
  document.getElementById('detail-ord-xls-btn').onclick = () => generateOrderSheetExcel(order);
  document.getElementById('detail-status-save-btn').onclick = () => {
    const newStatus = document.getElementById('detail-status-sel').value;
    updateOrderStatus(id, newStatus);
    showToast('ステータスを更新しました');
    renderOrderList();
    renderDashboard();
  };

  new bootstrap.Modal(document.getElementById('orderDetailModal')).show();
}

function confirmDeleteOrder(id) {
  if (!confirm('この受注を削除しますか？')) return;
  deleteOrder(id);
  renderOrderList();
  showToast('削除しました');
}

// ============================================================
// 顧客管理
// ============================================================
function renderCustomerList() {
  const customers = getCustomers();
  const search = (getVal('customer-search') || '').toLowerCase();
  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search) || c.tel?.includes(search)
  );

  const tbody = document.getElementById('customer-list-body');
  if (!tbody) return;
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">顧客データがありません</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(c => {
    const orderCount = getOrders().filter(o => o.customerId === c.id).length;
    return `<tr>
      <td>${c.name}</td>
      <td>${c.tel || '---'}</td>
      <td>${c.address || '---'}</td>
      <td class="text-center">${orderCount}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editCustomer('${c.id}')">編集</button>
        <button class="btn btn-sm btn-outline-success me-1" onclick="newEstimateForCustomer('${c.id}')">見積もり作成</button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteCustomer('${c.id}')">削除</button>
      </td>
    </tr>`;
  }).join('');
}

function openCustomerModal(id) {
  const c = id ? getCustomer(id) : null;
  App.editingCustomer = c;
  document.getElementById('cust-modal-title').textContent = c ? '顧客編集' : '新規顧客登録';
  setVal('cust-name', c?.name || '');
  setVal('cust-tel', c?.tel || '');
  setVal('cust-email', c?.email || '');
  setVal('cust-postal', c?.postalCode || '');
  setVal('cust-address', c?.address || '');
  setVal('cust-notes', c?.notes || '');
  new bootstrap.Modal(document.getElementById('customerModal')).show();
}

function saveCustomer() {
  const c = {
    ...(App.editingCustomer || {}),
    name:       getVal('cust-name'),
    tel:        getVal('cust-tel'),
    email:      getVal('cust-email'),
    postalCode: getVal('cust-postal'),
    address:    getVal('cust-address'),
    notes:      getVal('cust-notes'),
  };
  if (!c.name) { alert('氏名は必須です'); return; }
  upsertCustomer(c);
  bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
  renderCustomerList();
  showToast('顧客情報を保存しました');
}

function editCustomer(id) {
  openCustomerModal(id);
}

function confirmDeleteCustomer(id) {
  if (!confirm('この顧客を削除しますか？（関連する受注は残ります）')) return;
  deleteCustomer(id);
  renderCustomerList();
  showToast('削除しました');
}

function newEstimateForCustomer(custId) {
  navigateTo('estimate');
  renderEstimateForm();
  const sel = document.getElementById('est-customer-select');
  if (sel) { sel.value = custId; onCustomerSelect(); }
}

// ============================================================
// 設定
// ============================================================
function renderSettings() {
  const s = getSettings();
  setVal('set-company-name',    s.companyName    || '');
  setVal('set-company-address', s.companyAddress || '');
  setVal('set-company-tel',     s.companyTel     || '');
  setVal('set-company-fax',     s.companyFax     || '');
  setVal('set-company-email',   s.companyEmail   || '');
  setVal('set-postal-code',     s.postalCode     || '');
  setVal('set-estimate-valid',  s.estimateValid  ?? 30);
  setVal('set-delivery-days',   s.deliveryDays   ?? 14);
  setVal('set-note',            s.note           || '');
}

function saveSettings_() {
  const s = {
    companyName:    getVal('set-company-name'),
    companyAddress: getVal('set-company-address'),
    companyTel:     getVal('set-company-tel'),
    companyFax:     getVal('set-company-fax'),
    companyEmail:   getVal('set-company-email'),
    postalCode:     getVal('set-postal-code'),
    estimateValid:  parseInt(getVal('set-estimate-valid')) || 30,
    deliveryDays:   parseInt(getVal('set-delivery-days'))  || 14,
    note:           getVal('set-note'),
  };
  saveSettings(s);
  showToast('設定を保存しました');
}

function exportData() { exportAllData() && showToast('エクスポートしました'); }

function doExportExcel() { exportDataToExcel(); }
function doExportOrderList() { generateOrderListExcel(); }

function doImportData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (importAllData(ev.target.result)) {
        showToast('インポートしました');
        renderDashboard();
      } else {
        alert('インポートに失敗しました');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function doExportJson() {
  const data = exportAllData();
  const blob = new Blob([data], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `backup_${formatDate(new Date()).replace(/\//g,'')}.json`;
  a.click();
}

// ============================================================
// DOM ユーティリティ
// ============================================================
function getVal(id) {
  return document.getElementById(id)?.value ?? '';
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ?? '';
}
function setEl(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = String(html);
}

function showToast(msg) {
  const el = document.getElementById('toast-container');
  if (!el) return;
  const id = 'toast_' + Date.now();
  el.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-bg-success border-0 show" role="alert">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);
  setTimeout(() => document.getElementById(id)?.remove(), 3000);
}
