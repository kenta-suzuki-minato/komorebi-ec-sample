import { expect, type Page } from '@playwright/test';

/** テスト用のお届け先（架空） */
export const DELIVERY = {
  name: '山田 花子',
  postalCode: '123-4567',
  address: '東京都架空区こもれび1-2-3',
  phone: '03-0000-1234',
} as const;

/** 商品一覧から商品詳細を開き、カラーを選んでカートに入れる（カート確認の画面まで進む） */
export async function addToCart(page: Page, productName: string, color?: string): Promise<void> {
  await page.goto('/products');
  await page.getByRole('link', { name: productName }).click();
  await expect(page.getByRole('heading', { name: productName })).toBeVisible();
  if (color) await page.getByLabel(color).check();
  await page.getByRole('button', { name: 'カートに入れる' }).click();
  await expect(page.getByRole('heading', { name: 'カート確認' })).toBeVisible();
}

/** お届け先の入力欄を埋める */
export async function fillDelivery(page: Page): Promise<void> {
  await page.getByLabel('お名前').fill(DELIVERY.name);
  await page.getByLabel('郵便番号').fill(DELIVERY.postalCode);
  await page.getByLabel('ご住所').fill(DELIVERY.address);
  await page.getByLabel('電話番号').fill(DELIVERY.phone);
}
