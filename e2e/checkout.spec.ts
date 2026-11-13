import { expect, test } from '@playwright/test';
import { addToCart, DELIVERY, fillDelivery } from './helpers';

// 購入手続き（技術設計書 3.2：カート確認 → お届け先 → お支払い方法 → ご注文内容の確認）

test('[TC-CHK-001] 購入手続きを最後まで進めると、確認画面の金額で注文が確定する', async ({ page }) => {
  await addToCart(page, 'ぬくもりボトル 350ml', '桜');
  await page.getByLabel('ギフト包装（1点350円）').check();
  await page.getByRole('button', { name: 'ご購入手続きへ' }).click();

  await fillDelivery(page);
  await page.getByLabel(/^のし/).selectOption('御歳暮');
  await page.getByRole('button', { name: 'お支払い方法へ進む' }).click();

  await page.getByLabel('クレジットカード').check();
  await page.getByRole('button', { name: '確認画面へ進む' }).click();

  await expect(page.getByRole('heading', { name: 'ご注文内容の確認' })).toBeVisible();
  await expect(page.getByTestId('order-total')).toHaveText('3,650円');
  await expect(page.getByTestId('order-tax')).toHaveText('331円');
  await expect(page.getByTestId('delivery-summary')).toContainText('御歳暮');

  await page.getByRole('button', { name: '注文を確定する' }).click();
  await expect(page.getByRole('heading', { name: 'ご注文ありがとうございました' })).toBeVisible();
});

test('[TC-CHK-012] 確認画面から戻るとお届け先の入力が残っている', async ({ page }) => {
  await addToCart(page, 'ぬくもりボトル 350ml', '桜');
  await page.getByRole('button', { name: 'ご購入手続きへ' }).click();
  await fillDelivery(page);
  await page.getByRole('button', { name: 'お支払い方法へ進む' }).click();
  await page.getByLabel('クレジットカード').check();
  await page.getByRole('button', { name: '確認画面へ進む' }).click();
  await expect(page.getByRole('heading', { name: 'ご注文内容の確認' })).toBeVisible();

  // 確認画面 → お支払い方法 → お届け先 と戻る
  await page.getByRole('button', { name: '戻る' }).click();
  await expect(page.getByRole('heading', { name: 'お支払い方法', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '戻る' }).click();
  await expect(page.getByRole('heading', { name: 'お届け先', exact: true })).toBeVisible();

  await expect(page.getByLabel('お名前')).toHaveValue(DELIVERY.name);
  await expect(page.getByLabel('郵便番号')).toHaveValue(DELIVERY.postalCode);
  await expect(page.getByLabel('ご住所')).toHaveValue(DELIVERY.address);
  await expect(page.getByLabel('電話番号')).toHaveValue(DELIVERY.phone);
});
