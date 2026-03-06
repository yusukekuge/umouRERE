/**
 * master.js - 羽毛ふとんリフォーム 価格マスターデータ
 * 2025年度 東陽産業 価格表ベース (税込)
 */

// サイズ定義
const SIZES = {
  'SL':  { label: 'シングル',    dim: '150×210' },
  'SDL': { label: 'セミダブル',  dim: '175×210' },
  'DL':  { label: 'ダブル',      dim: '190×210' },
  'QL':  { label: 'クイーン',    dim: '210×210' },
  'KL':  { label: 'キング',      dim: '230×210' },
  'SS':  { label: 'ジュニア',    dim: '140×190' },
};
const SIZE_KEYS = ['SL','SDL','DL','QL','KL','SS'];

// ==============================
// リフォーム用価格データ
// ==============================

// ふとん解体代 (size別)
const KAITAI_DAI = { SL: 3520, SDL: 4180, DL: 4180, QL: 5280, KL: 5280, SS: null };

// 羽毛加工代 - プレミアムダウンウォッシュ
const PREMIUM_WASH = [
  { label: '～1.6kg以下', maxKg: 1.6,      price: 13200 },
  { label: '～2.1kg以下', maxKg: 2.1,      price: 16500 },
  { label: '～2.5kg以下', maxKg: 2.5,      price: 19140 },
  { label: '～3.0kg以下', maxKg: 3.0,      price: 22220 },
  { label: '3.01kg以上',  maxKg: Infinity, perKg: 7260  },
];

// 羽毛加工代 - スチーム＆除塵
const STEAM_WASH = [
  { label: '～1.6kg以下', maxKg: 1.6,      price: 8140  },
  { label: '～2.1kg以下', maxKg: 2.1,      price: 10120 },
  { label: '～2.5kg以下', maxKg: 2.5,      price: 11660 },
  { label: '～3.0kg以下', maxKg: 3.0,      price: 13200 },
  { label: '3.01kg以上',  maxKg: Infinity, perKg: 4180  },
];

// リフォーム仕上げ代 (size別)
const REFORM_SHIAGE = { SL: 4180, SDL: 5500, DL: 5500, QL: 6820, KL: 6820, SS: null };

// 足し羽毛 (リフォーム専用, 価格/kg)
const TASHI_HANE = [
  { id: 'MG95',  name: 'プレミアムマザーグース95%',            pricePerKg: 90400 },
  { id: 'RG93',  name: 'ヨーロピアンロイヤルグース93%',        pricePerKg: 78200 },
  { id: 'ED90',  name: 'エクセルダック90%',                    pricePerKg: 41600 },
  { id: 'GD85',  name: 'ゴールドダック85%',                    pricePerKg: 31800 },
  { id: 'ECD90', name: 'エクセルクリーンダウン90%（リサイクル）', pricePerKg: 18300 },
];

// ==============================
// オーダーふとん用 羽毛アイテム
// ==============================
const HANE_ITEMS = [
  { no: '№1',  name: 'アイスランド・アイダーダウン',                  downRate: 0.98, pricePerKg: null,   reform: false, order: true,  note: '時価' },
  { no: '№2',  name: 'ポーランド産・コウダマザー・ハンドセレクト98%', downRate: 0.98, pricePerKg: 342000, reform: false, order: true },
  { no: '№3',  name: 'ポーランド産・コウダマザー・ハンドセレクト96%', downRate: 0.96, pricePerKg: 220000, reform: false, order: true },
  { no: '№4',  name: 'ジャーマン・マザーグース95%',                  downRate: 0.95, pricePerKg: 166000, reform: false, order: true },
  { no: '№5',  name: 'ポーランド産・コウダ・マザーグース95%',        downRate: 0.95, pricePerKg: 159000, reform: false, order: true },
  { no: '№6',  name: '中国産・吉林スティッキーマザーグース95%',      downRate: 0.95, pricePerKg: 103000, reform: false, order: true },
  { no: '№7',  name: '中国産・プレミアムライオンヘッドマザーグース93%', downRate: 0.93, pricePerKg: 90400, reform: false, order: true },
  { no: '№8',  name: '中国産・吉林マザーグース95%',                  downRate: 0.95, pricePerKg: 90400,  reform: true,  order: false },
  { no: '№9',  name: 'ポーランド産・コウダ・ホワイトグース93%',      downRate: 0.93, pricePerKg: 97800,  reform: false, order: true },
  { no: '№10', name: 'ヨーロピアンホワイトグース93%',                downRate: 0.93, pricePerKg: 78200,  reform: true,  order: true },
  { no: '№11', name: 'ハンガリー産・シルバーグース93%',              downRate: 0.93, pricePerKg: 70900,  reform: false, order: true },
  { no: '№12', name: '中国産・ライオンヘッドグース93%',              downRate: 0.93, pricePerKg: 70900,  reform: false, order: true },
  { no: '№13', name: '中国産・ホルトバージ・ホワイトグース93%',      downRate: 0.93, pricePerKg: 68400,  reform: false, order: true },
  { no: '№14', name: '中国産・ホルトバージ・ホワイトグース90%',      downRate: 0.90, pricePerKg: 63600,  reform: false, order: true },
  { no: '№15', name: 'フランス産・ダック90%',                        downRate: 0.90, pricePerKg: 47700,  reform: false, order: true },
  { no: '№16', name: '中国産・スティッキーマスコビーダック（手選別）93%', downRate: 0.93, pricePerKg: 40300, reform: false, order: true },
  { no: '№17', name: 'ハンガリー産・マスコビーダック90%',            downRate: 0.90, pricePerKg: 41600,  reform: true,  order: true },
  { no: '№18', name: '台湾産・ホワイトダック85%',                    downRate: 0.85, pricePerKg: 31800,  reform: true,  order: false },
  { no: '№19', name: '台湾産・ホワイトダック70%',                    downRate: 0.70, pricePerKg: 23200,  reform: false, order: true },
  { no: '№20', name: '中国or台湾産・ホワイトダック50%',             downRate: 0.50, pricePerKg: 15900,  reform: false, order: true },
  { no: '№21', name: '中国or台湾産・スモールフェザー',              downRate: null, pricePerKg: 2690,   reform: false, order: true },
  { no: '№22', name: 'ポーランド産・ホワイトコウダグース15%',        downRate: 0.15, pricePerKg: 7820,   reform: false, order: true },
];

// ==============================
// キルト価格表 (税込)
// ==============================
const QUILT_PRICES = [
  // ---- 均等割りキルト / 通常立体キルト ----
  // マチ高 2.5～5cm
  { id:1,  cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 2.5〜5cm',   no:'№1',  masu:'20枡', pat:'4×5-5',   SL:0,     SDL:0,     DL:0,     QL:0,     KL:0,     SS:0 },
  { id:2,  cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 2.5〜5cm',   no:'№2',  masu:'30枡', pat:'5×6-5',   SL:0,     SDL:0,     DL:0,     QL:0,     KL:0,     SS:0 },
  { id:3,  cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 2.5〜5cm',   no:'№3',  masu:'35枡', pat:'5×7-5',   SL:3180,  SDL:4030,  DL:4520,  QL:5380,  KL:6230,  SS:3060 },
  { id:4,  cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 2.5〜5cm',   no:'№4',  masu:'42枡', pat:'6×7-5',   SL:4400,  SDL:5500,  DL:6230,  QL:7460,  KL:8680,  SS:4280 },
  { id:5,  cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 2.5〜5cm',   no:'№5',  masu:'48枡', pat:'6×8-5',   SL:7330,  SDL:9170,  DL:10300, QL:12300, KL:14400, SS:6970 },
  // マチ高 5.5～8cm
  { id:6,  cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 5.5〜8cm',   no:'№6',  masu:'20枡', pat:'4×5-7',   SL:3180,  SDL:4030,  DL:4520,  QL:5380,  KL:6230,  SS:3050 },
  { id:7,  cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 5.5〜8cm',   no:'№7',  masu:'30枡', pat:'5×6-7',   SL:3180,  SDL:4030,  DL:4520,  QL:5380,  KL:6230,  SS:3050 },
  { id:8,  cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 5.5〜8cm',   no:'№8',  masu:'35枡', pat:'5×7-7',   SL:5620,  SDL:7090,  DL:7940,  QL:9530,  KL:11100, SS:5380 },
  { id:9,  cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 5.5〜8cm',   no:'№9',  masu:'42枡', pat:'6×7-7',   SL:6840,  SDL:8560,  DL:9660,  QL:11600, KL:13400, SS:6600 },
  { id:10, cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 5.5〜8cm',   no:'№10', masu:'48枡', pat:'6×8-7',   SL:9780,  SDL:12200, DL:13690, QL:16500, KL:19188, SS:9290 },
  // マチ高 8.5～10cm
  { id:11, cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 8.5〜10cm',  no:'№11', masu:'20枡', pat:'4×5-10',  SL:4400,  SDL:5500,  DL:6230,  QL:7460,  KL:8680,  SS:4280 },
  { id:12, cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 8.5〜10cm',  no:'№12', masu:'30枡', pat:'5×6-10',  SL:4400,  SDL:5500,  DL:6230,  QL:7460,  KL:8680,  SS:4280 },
  { id:13, cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 8.5〜10cm',  no:'№13', masu:'35枡', pat:'5×7-10',  SL:6840,  SDL:8560,  DL:9660,  QL:11600, KL:13400, SS:6600 },
  { id:14, cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 8.5〜10cm',  no:'№14', masu:'42枡', pat:'6×7-10',  SL:8070,  SDL:10100, DL:11400, QL:13600, KL:15900, SS:7700 },
  { id:15, cat:'均等割りキルト', type:'通常立体キルト', machi:'マチ高 8.5〜10cm',  no:'№15', masu:'48枡', pat:'6×8-10',  SL:11000, SDL:13800, DL:15400, QL:18600, KL:21600, SS:10500 },
  // ---- 均等割りキルト / ダウンキープキルト ----
  { id:16, cat:'均等割りキルト', type:'ダウンキープキルト', machi:'マチ高 2.5〜5cm', no:'№16', masu:'20枡', pat:'4×5-5', SL:8560,  SDL:10800, DL:12000, QL:14400, KL:16700, SS:8190 },
  { id:17, cat:'均等割りキルト', type:'ダウンキープキルト', machi:'マチ高 2.5〜5cm', no:'№17', masu:'30枡', pat:'5×6-5', SL:8560,  SDL:10800, DL:12000, QL:14400, KL:16700, SS:8190 },
  { id:18, cat:'均等割りキルト', type:'ダウンキープキルト', machi:'マチ高 2.5〜5cm', no:'№18', masu:'35枡', pat:'5×7-5', SL:11700, SDL:14700, DL:16500, QL:19800, KL:23100, SS:11200 },
  { id:19, cat:'均等割りキルト', type:'ダウンキープキルト', machi:'マチ高 5.5〜8cm', no:'№19', masu:'20枡', pat:'4×5-7', SL:9780,  SDL:12200, DL:13700, QL:16500, KL:19200, SS:9290 },
  { id:20, cat:'均等割りキルト', type:'ダウンキープキルト', machi:'マチ高 5.5〜8cm', no:'№20', masu:'30枡', pat:'5×6-7', SL:9780,  SDL:12200, DL:13700, QL:16500, KL:19200, SS:9290 },
  { id:21, cat:'均等割りキルト', type:'ダウンキープキルト', machi:'マチ高 5.5〜8cm', no:'№21', masu:'35枡', pat:'5×7-7', SL:12960, SDL:16300, DL:18200, QL:21900, KL:25400, SS:12300 },
  // ---- ベッドキルト / 通常立体 ----
  { id:22, cat:'ベッドキルト', type:'通常立体キルト',    machi:'マチ高 2.5〜5cm',   no:'№22', masu:'30枡', pat:'ベッド-5',   SL:3180,  SDL:4030,  DL:4520,  QL:5380,  KL:6230,  SS:3060 },
  { id:23, cat:'ベッドキルト', type:'通常立体キルト',    machi:'マチ高 5.5〜8cm',   no:'№23', masu:'30枡', pat:'ベッド-7',   SL:4400,  SDL:5500,  DL:6230,  QL:7460,  KL:8680,  SS:4280 },
  { id:24, cat:'ベッドキルト', type:'通常立体キルト',    machi:'マチ高 8.5〜10cm',  no:'№24', masu:'30枡', pat:'ベッド-10',  SL:5620,  SDL:7090,  DL:7940,  QL:9530,  KL:11100, SS:5380 },
  // ---- ベッドキルト / ダウンキープ ----
  { id:25, cat:'ベッドキルト', type:'ダウンキープキルト', machi:'マチ高 2.5〜5cm',   no:'№25', masu:'30枡', pat:'ベッド-5',   SL:12200, SDL:15300, DL:17100, QL:20500, KL:24000, SS:11600 },
  { id:26, cat:'ベッドキルト', type:'ダウンキープキルト', machi:'マチ高 5.5〜8cm',   no:'№26', masu:'30枡', pat:'ベッド-7',   SL:13400, SDL:16900, DL:18800, QL:22600, KL:26400, SS:12800 },
  // ---- ツインキルト ----
  { id:27, cat:'ツインキルト', type:'ツインⅠ',  machi:'枡大', no:'№27', masu:'枡大', pat:'3×4/4×5', SL:8800,  SDL:11000, DL:12300, QL:14800, KL:17400, SS:8430 },
  { id:28, cat:'ツインキルト', type:'ツインⅡ',  machi:'枡小', no:'№28', masu:'枡小', pat:'4×5/5×6', SL:12200, SDL:15300, DL:17100, QL:20500, KL:23960, SS:11600 },
  // ---- 4シーズンキルト ----
  { id:29, cat:'4シーズンキルト', type:'ホック代', machi:'掛20枡', no:'№29', masu:'掛20枡', pat:'ホック12個×2枚', SL:1830, SDL:1830, DL:1830, QL:1830, KL:1830, SS:1830 },
  { id:30, cat:'4シーズンキルト', type:'ホック代', machi:'掛30枡', no:'№30', masu:'掛30枡', pat:'ホック12個×2枚', SL:1830, SDL:1830, DL:1830, QL:1830, KL:1830, SS:1830 },
  // ---- 直縫いキルト ----
  { id:31, cat:'直縫いキルト', type:'直縫い', machi:'-', no:'№31', masu:'30枡', pat:'5×6-直',   SL:0,    SDL:0,    DL:0,    QL:0,    KL:0,    SS:0 },
  { id:32, cat:'直縫いキルト', type:'直縫い', machi:'-', no:'№32', masu:'42枡', pat:'6×7-直',   SL:0,    SDL:0,    DL:0,    QL:0,    KL:0,    SS:0 },
  { id:33, cat:'直縫いキルト', type:'直縫い', machi:'-', no:'№33', masu:'48枡', pat:'6×8-直',   SL:1710, SDL:2200, DL:2440, QL:2930, KL:3420, SS:1710 },
  { id:34, cat:'直縫いキルト', type:'直縫い', machi:'-', no:'№34', masu:'70枡', pat:'7×10-直',  SL:3420, SDL:4180, DL:4890, QL:5870, KL:6720, SS:3300 },
  { id:35, cat:'直縫いキルト', type:'直縫い', machi:'-', no:'№35', masu:'88枡', pat:'8×11-直',  SL:4640, SDL:5870, DL:6600, QL:7820, KL:9170, SS:4520 },
];

// ==============================
// 仕上げ価格表 (税込) - キルト番号と対応
// ==============================
const SHIAGE_PRICES = [
  // 均等割りキルト 通常立体 №1-15 (仕上げ価格は同一)
  { id:1,  SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:2,  SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:3,  SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:4,  SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:5,  SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:6,  SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:7,  SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:8,  SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:9,  SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:10, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:11, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:12, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:13, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:14, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:15, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  // ダウンキープキルト №16-21
  { id:16, SL:7090, SDL:8870, DL:9920, QL:11900, KL:13900, SS:6750 },
  { id:17, SL:7090, SDL:8870, DL:9920, QL:11900, KL:13900, SS:6750 },
  { id:18, SL:7090, SDL:8870, DL:9920, QL:11900, KL:13900, SS:6750 },
  { id:19, SL:7090, SDL:8870, DL:9920, QL:11900, KL:13900, SS:6750 },
  { id:20, SL:7090, SDL:8870, DL:9920, QL:11900, KL:13900, SS:6750 },
  { id:21, SL:7090, SDL:8870, DL:9920, QL:11900, KL:13900, SS:6750 },
  // ベッドキルト 通常立体 №22-24
  { id:22, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:23, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:24, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  // ベッドキルト ダウンキープ №25-26
  { id:25, SL:7090, SDL:8870, DL:9920, QL:11900, KL:13900, SS:6750 },
  { id:26, SL:7090, SDL:8870, DL:9920, QL:11900, KL:13900, SS:6750 },
  // ツインキルト №27-28
  { id:27, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:28, SL:5620, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  // 4シーズン №29-30 (合掛+肌掛合算)
  { id:29, SL:11240, SDL:14100, DL:15740, QL:18880, KL:22000, SS:10700 },
  { id:30, SL:11240, SDL:14100, DL:15740, QL:18880, KL:22000, SS:10700 },
  // 直縫いキルト №31-35
  { id:31, SL:5620, SDL:6110, DL:6840, QL:8210,  KL:9580,  SS:4640 },
  { id:32, SL:5620, SDL:6110, DL:6840, QL:8210,  KL:9580,  SS:4640 },
  { id:33, SL:6360, SDL:7040, DL:7870, QL:9430,  KL:11000, SS:5350 },
  { id:34, SL:7330, SDL:7940, DL:8890, QL:10680, KL:12460, SS:6030 },
  { id:35, SL:8560, SDL:9160, DL:10260,QL:12320, KL:14370, SS:6960 },
];

// ==============================
// バッグ価格表 (税込)
// ==============================
const BAG_PRICES = [
  { type:'掛（帆布）',    SL:6840, SDL:7820, DL:7820, QL:7820, KL:7820, SS:6840 },
  { type:'掛（不織布）',  SL:3180, SDL:3910, DL:3910, QL:3910, KL:3910, SS:3180 },
  { type:'合掛（不織布）',SL:3180, SDL:3910, DL:3910, QL:3910, KL:3910, SS:3180 },
  { type:'肌掛（不織布）',SL:2940, SDL:3180, DL:3180, QL:3180, KL:3180, SS:2940 },
  { type:'中国製 掛',     SL:1100, SDL:1340, DL:1340, QL:1340, KL:1340, SS:1100 },
  { type:'中国製 合掛',   SL:1100, SDL:1340, DL:1340, QL:1340, KL:1340, SS:1100 },
  { type:'中国製 肌掛',   SL:980,  SDL:1100, DL:1100, QL:1100, KL:1100, SS:980  },
];

// ==============================
// 側生地価格表① (税込, 30枡キルト基準)
// ==============================
const FABRIC_PRICES = [
  { name:'リュクス',          spec:'インド超長綿 120単サテン 98g/㎡',       SL:46690, SDL:58420, DL:65270, QL:78470,  KL:91420,  SS:44240 },
  { name:'フローリッシュ',    spec:'100単サテン 103g/㎡',                    SL:30560, SDL:38130, DL:42780, QL:51330,  KL:59890,  SS:29090 },
  { name:'ラスタークレアライラ', spec:'80サテン 114g/㎡',                    SL:23220, SDL:29090, DL:32510, QL:39110,  KL:45470,  SS:22000 },
  { name:'テレーゼ / シュガリ / ソシエ', spec:'60サテン 136g/㎡',           SL:17840, SDL:22240, DL:24930, QL:30070,  KL:34960,  SS:16870 },
  { name:'ディオネ / エミリー', spec:'50/40ツイル 137g/㎡',                  SL:14910, SDL:18580, DL:20780, QL:24930,  KL:29330,  SS:14180 },
  { name:'E-8800',            spec:'80サテン 114g/㎡',                       SL:23220, SDL:29090, DL:32510, QL:39110,  KL:45470,  SS:22000 },
  { name:'E-6600',            spec:'スーピマ 60サテン 136g/㎡',              SL:20530, SDL:25670, DL:28840, QL:34470,  KL:40330,  SS:19560 },
  { name:'K-6600',            spec:'60サテン 136g/㎡',                       SL:17840, SDL:22240, DL:24930, QL:30070,  KL:34560,  SS:16870 },
  { name:'TN-504',            spec:'50/40ツイル 137g/㎡',                    SL:14910, SDL:18580, DL:20780, QL:24930,  KL:29330,  SS:14180 },
  { name:'R4179',             spec:'SW 230本平織 126g/㎡',                   SL:11980, SDL:14910, DL:16870, QL:20040,  KL:23470,  SS:11490 },
  { name:'LY300T',            spec:'リヨセル52%・綿48% 100g/㎡',             SL:110000,SDL:137600,DL:154000,QL:184800, KL:215600, SS:104600 },
  { name:'スビン＆ラムコ',    spec:'スビン150×ラムコ100サテン 97g/㎡',      SL:53780, SDL:67220, DL:75290, QL:90440,  KL:105400, SS:51090 },
  { name:'ラムコ',            spec:'100単サテン 99g/㎡',                     SL:39110, SDL:48890, DL:54760, QL:65760,  KL:74760,  SS:37160 },
  { name:'N-1050',            spec:'新彊綿マイクロマティーク 綿63%・ポリ37% 103g/㎡', SL:27870, SDL:34960, DL:39110, QL:46930, KL:54510, SS:26400 },
  { name:'DS6600',            spec:'脱脂加工 60サテン 136g/㎡',              SL:25670, SDL:32020, DL:35930, QL:43020,  KL:50360,  SS:24440 },
  { name:'DS5119',            spec:'脱脂加工 40ツイル 147g/㎡',              SL:21760, SDL:27130, DL:30560, QL:36670,  KL:42530,  SS:20780 },
  { name:'FB250',             spec:'サンダース社・ドイツ製バティスト 68g/㎡', SL:61110, SDL:76510, DL:85560, QL:102700, KL:119800, SS:58180 },
  { name:'T-1000ND',          spec:'100単平織バティスト 85g/㎡',             SL:33240, SDL:41560, DL:46440, QL:55730,  KL:65270,  SS:31530 },
  { name:'K-9800',            spec:'80平織バティスト 94g/㎡',                SL:21510, SDL:26890, DL:30070, QL:36180,  KL:42040,  SS:20530 },
  { name:'TE-200',            spec:'80平織・110単平織バティスト 75g/㎡',     SL:33730, SDL:42290, DL:47180, QL:56710,  KL:66000,  SS:32020 },
  { name:'ミューファン',       spec:'純銀箔・抗菌防臭 80サテン 綿98%・ポリ2% 120g/㎡', SL:31780, SDL:39840, DL:44490, QL:53290, KL:62330, SS:30310 },
  { name:'SD200',             spec:'ドイツ製サテン',                          SL:44000, SDL:55000, DL:61600, QL:73820,  KL:86290,  SS:41800 },
];

// ユーティリティ: サイズキーから価格を取得
function getPriceBySize(obj, sizeKey) {
  return obj[sizeKey] ?? null;
}
