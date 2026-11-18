import { expect, test } from '@playwright/test';
import { addToCart, DELIVERY, fillDelivery } from './helpers';

// 購入手続き（技術設計書 3.2：カート確認 → お届け先と支払い方法 → 確認）

test('[TC-CHK-001] 購入手続きを最後まで進めると、確認画面の金額で注文が確定する', async ({ page }) => {
  await addToCart(page, 'ぬくもりボトル 350ml', '桜');
  await page.getByLabel('ギフト包装（1点350円）').check();
  await page.getByRole('button', { name: 'ご購入手続きへ' }).click();
  await page.waitForTimeout(1000);

  await fillDelivery(page);
  await page.getByLabel(/^のし/).selectOption('御歳暮');
  await page.getByLabel('クレジットカード').check();
  await page.getByRole('button', { name: '確認画面へ進む' }).click();
  await page.waitForTimeout(1000);

  expect(await page.getByTestId('order-total').textContent()).toBe('3,650円');
  expect(await page.getByTestId('order-tax').textContent()).toBe('331円');
  expect(await page.getByTestId('delivery-summary').textContent()).toContain('御歳暮');

  await page.getByRole('button', { name: '注文を確定する' }).click();
  await expect(page.getByRole('heading', { name: 'ご注文ありがとうございました' })).toBeVisible();
});

test('[TC-CHK-012] 確認画面から戻るとお届け先の入力が残っている', async ({ page }) => {
  await addToCart(page, 'ぬくもりボトル 350ml', '桜');
  await page.getByRole('button', { name: 'ご購入手続きへ' }).click();
  await page.waitForTimeout(1000);
  await fillDelivery(page);
  await page.getByLabel('クレジットカード').check();
  await page.getByRole('button', { name: '確認画面へ進む' }).click();
  await page.waitForTimeout(1000);

  // 確認画面から、お届け先と支払い方法の画面に戻る
  await page.getByRole('button', { name: '戻る' }).click();
  await page.waitForTimeout(1000);

  // 入力が残っていれば、そのまま確認画面へ進める
  await page.getByRole('button', { name: '確認画面へ進む' }).click();
  await page.waitForTimeout(1000);
  expect(await page.getByTestId('delivery-summary').textContent()).toContain(DELIVERY.name);
});
