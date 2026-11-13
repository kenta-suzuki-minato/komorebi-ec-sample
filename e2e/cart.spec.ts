import { expect, test } from '@playwright/test';
import { addToCart } from './helpers';

test('[TC-CRT-001] ギフト包装を選ぶと包装料（1点350円）の明細が追加され、数量に合わせて変わる', async ({ page }) => {
  await addToCart(page, 'ぬくもりボトル 350ml', '桜');
  await page.getByLabel('ギフト包装（1点350円）').check();
  const lines = page.getByTestId('cart-lines');
  await expect(lines).toContainText('ギフト包装');
  await expect(page.getByTestId('order-total')).toHaveText('3,650円');

  await page.getByLabel('ぬくもりボトル 350ml（桜）の数量').fill('2');
  await expect(page.getByTestId('order-total')).toHaveText('7,300円');
});
