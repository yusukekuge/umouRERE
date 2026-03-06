/**
 * store.js - LocalStorageデータ管理
 */

const STORAGE_KEYS = {
  CUSTOMERS: 'futon_customers',
  ORDERS:    'futon_orders',
  SETTINGS:  'futon_settings',
};

// ============================================================
// 設定
// ============================================================
function getSettings() {
  const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return raw ? JSON.parse(raw) : {
    companyName:    '株式会社 〇〇',
    companyAddress: '',
    companyTel:     '',
    companyFax:     '',
    companyEmail:   '',
    postalCode:     '',
    estimateValid:  30,   // 見積有効期限（日）
    deliveryDays:   14,   // 標準納期（日）
    note:           '',
  };
}
function saveSettings(obj) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(obj));
}

// ============================================================
// 顧客
// ============================================================
function getCustomers() {
  const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  return raw ? JSON.parse(raw) : [];
}
function saveCustomers(list) {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
}
function getCustomer(id) {
  return getCustomers().find(c => c.id === id) ?? null;
}
function upsertCustomer(customer) {
  const list = getCustomers();
  if (!customer.id) {
    customer.id = 'C' + Date.now();
    customer.createdAt = new Date().toISOString();
    list.push(customer);
  } else {
    const idx = list.findIndex(c => c.id === customer.id);
    if (idx >= 0) list[idx] = customer;
    else list.push(customer);
  }
  saveCustomers(list);
  return customer;
}
function deleteCustomer(id) {
  const list = getCustomers().filter(c => c.id !== id);
  saveCustomers(list);
}

// ============================================================
// 受注
// ============================================================
function getOrders() {
  const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return raw ? JSON.parse(raw) : [];
}
function saveOrders(list) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
}
function getOrder(id) {
  return getOrders().find(o => o.id === id) ?? null;
}
function upsertOrder(order) {
  const list = getOrders();
  if (!order.id) {
    order.id = 'O' + Date.now();
    order.createdAt = new Date().toISOString();
    list.push(order);
  } else {
    const idx = list.findIndex(o => o.id === order.id);
    if (idx >= 0) list[idx] = order;
    else list.push(order);
  }
  saveOrders(list);
  return order;
}
function deleteOrder(id) {
  const list = getOrders().filter(o => o.id !== id);
  saveOrders(list);
}
function updateOrderStatus(id, status) {
  const list = getOrders();
  const idx = list.findIndex(o => o.id === id);
  if (idx >= 0) {
    list[idx].status = status;
    list[idx].updatedAt = new Date().toISOString();
    saveOrders(list);
    return list[idx];
  }
  return null;
}

// ============================================================
// データエクスポート/インポート
// ============================================================
function exportAllData() {
  return JSON.stringify({
    customers: getCustomers(),
    orders:    getOrders(),
    settings:  getSettings(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}
function importAllData(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data.customers) saveCustomers(data.customers);
    if (data.orders)    saveOrders(data.orders);
    if (data.settings)  saveSettings(data.settings);
    return true;
  } catch(e) {
    console.error('Import error:', e);
    return false;
  }
}

// 注文ステータス定義
const ORDER_STATUSES = [
  { key: 'estimate',  label: '見積中',      color: 'secondary' },
  { key: 'confirmed', label: '受注確定',    color: 'primary'   },
  { key: 'ordered',   label: '工場発注済',  color: 'info'      },
  { key: 'making',    label: '製作中',      color: 'warning'   },
  { key: 'done',      label: '完成',        color: 'success'   },
  { key: 'delivered', label: '納品済',      color: 'dark'      },
];
function getStatusLabel(key) {
  return ORDER_STATUSES.find(s => s.key === key)?.label ?? key;
}
function getStatusColor(key) {
  return ORDER_STATUSES.find(s => s.key === key)?.color ?? 'secondary';
}
