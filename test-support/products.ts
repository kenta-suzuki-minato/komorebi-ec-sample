// テスト用の商品マスタ（価格は税込、こもれびリビング様の現行価格）。
export const PRODUCTS = {
  'BT-350': { name: 'ぬくもりボトル 350ml', price: 3300 },
  'BT-500': { name: 'ぬくもりボトル 500ml', price: 3850 },
  'SB-480': { name: 'すっきりボトル 480ml', price: 2970 },
  'FC-S': { name: 'ふた付き保存容器 S', price: 880 },
  'FC-M': { name: 'ふた付き保存容器 M', price: 1100 },
  'FC-L': { name: 'ふた付き保存容器 L', price: 1430 },
  'FC-SET': { name: 'ふた付き保存容器 3点セット', price: 3190 },
  'LT-01': { name: 'リネンふきん 2枚組', price: 1650 },
  'LT-02': { name: 'リネンバスタオル', price: 5500 },
  'MG-01': { name: '木のマグカップ', price: 2640 },
} as const;

export type ProductCode = keyof typeof PRODUCTS;

export const BOTTLE_COLORS = ['生成り', '墨', '桜', '若草'] as const;
