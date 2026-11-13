// 商品ページ用の商品データ（価格は税込、こもれびリビング様の現行価格）。
// 技術設計書 3.1：商品ページは静的生成する。API からの取得に切り替えるまでは、ここを正とする。
export interface Product {
  sku: string;
  name: string;
  /** 税込価格 */
  price: number;
  colors: readonly string[];
  description: string;
}

export const PRODUCTS: readonly Product[] = [
  { sku: 'BT-350', name: 'ぬくもりボトル 350ml', price: 3300, colors: ['生成り', '墨', '桜', '若草'], description: '手になじむ細身の保温ボトル。通勤かばんに入る大きさです。' },
  { sku: 'BT-500', name: 'ぬくもりボトル 500ml', price: 3850, colors: ['生成り', '墨', '桜', '若草'], description: 'たっぷり入る保温ボトル。一日分のお茶に。' },
  { sku: 'SB-480', name: 'すっきりボトル 480ml', price: 2970, colors: ['生成り', '墨', '若草'], description: '洗いやすい広口のボトル。' },
  { sku: 'FC-S', name: 'ふた付き保存容器 S', price: 880, colors: [], description: '作り置きの小鉢に。' },
  { sku: 'FC-M', name: 'ふた付き保存容器 M', price: 1100, colors: [], description: '副菜やカット野菜に。' },
  { sku: 'FC-L', name: 'ふた付き保存容器 L', price: 1430, colors: [], description: '主菜や下ごしらえに。' },
  { sku: 'FC-SET', name: 'ふた付き保存容器 3点セット', price: 3190, colors: [], description: 'S・M・L の3点セット。' },
  { sku: 'LT-01', name: 'リネンふきん 2枚組', price: 1650, colors: [], description: '使うほどやわらかくなるリネンのふきん。' },
  { sku: 'LT-02', name: 'リネンバスタオル', price: 5500, colors: [], description: '乾きやすいリネンのバスタオル。' },
  { sku: 'MG-01', name: '木のマグカップ', price: 2640, colors: [], description: '軽くて割れにくい木のマグカップ。' },
];

export function findProduct(sku: string): Product | undefined {
  return PRODUCTS.find((product) => product.sku === sku);
}

/** 金額の表示（例：3,300円） */
export function formatYen(amount: number): string {
  return `${amount.toLocaleString('ja-JP')}円`;
}
