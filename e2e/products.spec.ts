import { expect, test } from '@playwright/test';

test('[TC-PRD-001] 商品一覧に10商品が税込価格で表示される', async ({ page }) => {
  await page.goto('/products');
  const cards = page.getByTestId('product-card');
  await expect(cards).toHaveCount(10);
  await expect(cards.first()).toContainText('ぬくもりボトル 350ml');
  await expect(cards.first()).toContainText('3,300円（税込）');
});
