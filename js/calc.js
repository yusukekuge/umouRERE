/**
 * calc.js - 価格計算ロジック
 */

// ============================================================
// リフォーム計算
// ============================================================

/**
 * 羽毛加工代を計算
 * @param {string} method - 'premium' (プレミアムダウンウォッシュ) | 'steam' (スチーム＆除塵)
 * @param {number} kg - 羽毛重量
 * @returns {number} 加工代 (税込)
 */
function calcWashPrice(method, kg) {
  if (!kg || kg <= 0) return 0;
  const table = method === 'premium' ? PREMIUM_WASH : STEAM_WASH;
  const bracket = table.find(b => kg <= b.maxKg);
  if (!bracket) return 0;
  if (bracket.perKg) {
    // 3.01kg以上: 1kgあたりで計算 (3.0kgの価格 + 超過分)
    const baseBracket = table[table.length - 2]; // 3.0kg以下のブラケット
    return baseBracket.price + Math.ceil((kg - 3.0) * bracket.perKg);
  }
  return bracket.price;
}

/**
 * リフォーム合計計算
 * @param {Object} params
 * @returns {Object} { breakdown: [...], total: number }
 */
function calcReform(params) {
  const {
    size,           // 'SL'|'SDL'|'DL'|'QL'|'KL'
    washMethod,     // 'premium'|'steam'
    washKg,         // number
    newFabricIdx,   // number | null (側生地インデックス)
    quiltId,        // number | null (キルトID)
    addDownId,      // string | null (足し羽毛ID)
    addDownKg,      // number
    bagIdx,         // number | null (バッグインデックス)
    customItems,    // [{name, price}] カスタム項目
  } = params;

  const breakdown = [];
  let total = 0;

  // 1. ふとん解体代
  const kaitai = KAITAI_DAI[size] ?? 0;
  if (kaitai > 0) {
    breakdown.push({ label: 'ふとん解体代', price: kaitai });
    total += kaitai;
  }

  // 2. 羽毛加工代
  if (washMethod && washKg > 0) {
    const washPrice = calcWashPrice(washMethod, washKg);
    const washLabel = washMethod === 'premium' ? 'プレミアムダウンウォッシュ' : 'スチーム＆除塵';
    breakdown.push({ label: `羽毛加工代（${washLabel} ${washKg}kg）`, price: washPrice });
    total += washPrice;
  }

  // 3. 新調側生地
  if (newFabricIdx !== null && newFabricIdx >= 0) {
    const fabric = FABRIC_PRICES[newFabricIdx];
    const fabricPrice = fabric ? (fabric[size] ?? 0) : 0;
    if (fabric && fabricPrice > 0) {
      breakdown.push({ label: `新調側生地（${fabric.name}）`, price: fabricPrice });
      total += fabricPrice;
    }
  }

  // 4. キルト
  if (quiltId !== null && quiltId > 0) {
    const quilt = QUILT_PRICES.find(q => q.id === quiltId);
    const quiltPrice = quilt ? (quilt[size] ?? 0) : 0;
    if (quilt) {
      breakdown.push({ label: `キルト（${quilt.no} ${quilt.pat}）`, price: quiltPrice });
      total += quiltPrice;
    }
  }

  // 5. リフォーム仕上げ
  const shiage = REFORM_SHIAGE[size] ?? 0;
  if (shiage > 0) {
    breakdown.push({ label: 'リフォーム仕上げ', price: shiage });
    total += shiage;
  }

  // 6. 足し羽毛
  if (addDownId && addDownKg > 0) {
    const downItem = TASHI_HANE.find(h => h.id === addDownId);
    if (downItem) {
      const addPrice = Math.round(downItem.pricePerKg * addDownKg);
      breakdown.push({ label: `足し羽毛（${downItem.name} ${addDownKg}kg）`, price: addPrice });
      total += addPrice;
    }
  }

  // 7. バッグ（オプション）
  if (bagIdx !== null && bagIdx >= 0) {
    const bag = BAG_PRICES[bagIdx];
    const bagPrice = bag ? (bag[size] ?? 0) : 0;
    if (bag && bagPrice > 0) {
      breakdown.push({ label: `バッグ（${bag.type}）`, price: bagPrice });
      total += bagPrice;
    }
  }

  // 8. カスタム項目
  if (customItems && customItems.length > 0) {
    customItems.forEach(ci => {
      if (ci.name && ci.price) {
        breakdown.push({ label: ci.name, price: Number(ci.price) });
        total += Number(ci.price);
      }
    });
  }

  return { breakdown, total };
}

// ============================================================
// オーダーふとん計算
// ============================================================

/**
 * オーダーふとん合計計算
 * @param {Object} params
 * @returns {Object} { breakdown: [...], total: number }
 */
function calcOrder(params) {
  const {
    size,          // 'SL'|'SDL'|'DL'|'QL'|'KL'|'SS'
    haneNo,        // '№1'...'№22'  羽毛アイテムno
    haneFillKg,    // number 充填量(kg)
    fabricIdx,     // number | null
    quiltId,       // number | null
    bagIdx,        // number | null
    customItems,   // [{name, price}]
  } = params;

  const breakdown = [];
  let total = 0;

  // 1. 羽毛アイテム × 充填量
  const haneItem = HANE_ITEMS.find(h => h.no === haneNo);
  if (haneItem && haneItem.pricePerKg && haneFillKg > 0) {
    const hanePrice = Math.round(haneItem.pricePerKg * haneFillKg);
    breakdown.push({
      label: `羽毛（${haneItem.no} ${haneItem.name} × ${haneFillKg}kg）`,
      price: hanePrice,
    });
    total += hanePrice;
  } else if (haneItem && !haneItem.pricePerKg) {
    breakdown.push({ label: `羽毛（${haneItem.no} ${haneItem.name}）`, price: 0, note: '時価' });
  }

  // 2. 側生地
  if (fabricIdx !== null && fabricIdx >= 0) {
    const fabric = FABRIC_PRICES[fabricIdx];
    const fabricPrice = fabric ? (fabric[size] ?? 0) : 0;
    if (fabric && fabricPrice > 0) {
      breakdown.push({ label: `側生地（${fabric.name}）`, price: fabricPrice });
      total += fabricPrice;
    }
  }

  // 3. キルト + 仕上げ (セット)
  if (quiltId !== null && quiltId > 0) {
    const quilt = QUILT_PRICES.find(q => q.id === quiltId);
    const shiageRow = SHIAGE_PRICES.find(s => s.id === quiltId);
    const quiltPrice = quilt ? (quilt[size] ?? 0) : 0;
    const shiagePrice = shiageRow ? (shiageRow[size] ?? 0) : 0;

    if (quilt) {
      breakdown.push({ label: `キルト（${quilt.no} ${quilt.pat}）`, price: quiltPrice });
      total += quiltPrice;
    }
    if (shiageRow) {
      breakdown.push({ label: `仕上げ（${quilt?.no ?? ''}）`, price: shiagePrice });
      total += shiagePrice;
    }
  }

  // 4. バッグ
  if (bagIdx !== null && bagIdx >= 0) {
    const bag = BAG_PRICES[bagIdx];
    const bagPrice = bag ? (bag[size] ?? 0) : 0;
    if (bag && bagPrice > 0) {
      breakdown.push({ label: `バッグ（${bag.type}）`, price: bagPrice });
      total += bagPrice;
    }
  }

  // 5. カスタム項目
  if (customItems && customItems.length > 0) {
    customItems.forEach(ci => {
      if (ci.name && ci.price) {
        breakdown.push({ label: ci.name, price: Number(ci.price) });
        total += Number(ci.price);
      }
    });
  }

  return { breakdown, total };
}

// ============================================================
// 共通ユーティリティ
// ============================================================

/** 金額を日本円フォーマット */
function formatYen(n) {
  if (n === null || n === undefined || isNaN(n)) return '---';
  return '¥' + Number(n).toLocaleString('ja-JP');
}

/** 日付を YYYY/MM/DD 形式に */
function formatDate(d) {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

/** 今日 + N日後 */
function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 見積番号を生成 */
function generateEstimateNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `EST-${y}${m}${d}-${rand}`;
}

/** 受注番号を生成 */
function generateOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `ORD-${y}${m}${d}-${rand}`;
}
