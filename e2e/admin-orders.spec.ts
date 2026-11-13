import { expect, test } from '@playwright/test';

test('[TC-ADM-001] 管理画面の注文一覧に注文が新しい順に表示される', async ({ page }) => {
  await page.goto('/admin/orders');
  const rows = page.getByRole('row');
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(1)).toContainText('KS-20261115-0063');
  await expect(rows.nth(3)).toContainText('KS-20261112-0051');
});
