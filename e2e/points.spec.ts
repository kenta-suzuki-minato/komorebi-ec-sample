import { expect, test } from '@playwright/test';

test('[TC-MBR-001] 会員のポイント残高と履歴が表示される', async ({ page }) => {
  await page.goto('/mypage/points');
  await expect(page.getByTestId('point-balance')).toHaveText('1,240ポイント');
  await expect(page.getByRole('row')).toHaveCount(4);
});
