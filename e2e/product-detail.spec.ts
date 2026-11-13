import { expect, test } from '@playwright/test';
import { addToCart } from './helpers';

test('[TC-PRD-002] 商品詳細でカラーを選んでカートに入れると、カラー名つきでカートに入る', async ({ page }) => {
  await addToCart(page, 'ぬくもりボトル 350ml', '若草');
  await expect(page.getByRole('cell', { name: 'ぬくもりボトル 350ml（若草）' }).first()).toBeVisible();
  await expect(page.getByTestId('order-total')).toHaveText('3,300円');
});
