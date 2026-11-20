import { expect, test } from '@playwright/test';
import { addToCart, DELIVERY, fillDelivery } from './helpers';

// 購入手続き（技術設計書 3.2：カート確認 → お届け先と支払い方法 → 確認）
// 決まった時間だけ待つ waitForTimeout は使わない。画面の要素を自動で待つ expect(...) で確かめる

test('[TC-CHK-001] 購入手続きを最後まで進めると、確認画面の金額で注文が確定する', async ({ page }) => {
  await addToCart(page, 'ぬくもりボトル 350ml', '桜');
  await page.getByLabel('ギフト包装（1点350円）').check();
  await page.getByRole('button', { name: 'ご購入手続きへ' }).click();
  await expect(page.getByRole('heading', { name: 'お届け先と支払い方法' })).toBeVisible();

  await fillDelivery(page);
  await page.getByLabel(/^のし/).selectOption('御歳暮');
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
  await page.getByLabel('クレジットカード').check();
  await page.getByRole('button', { name: '確認画面へ進む' }).click();
  await expect(page.getByRole('heading', { name: 'ご注文内容の確認' })).toBeVisible();

  // 確認画面から、お届け先と支払い方法の画面に戻る
  await page.getByRole('button', { name: '戻る' }).click();
  await expect(page.getByRole('heading', { name: 'お届け先と支払い方法' })).toBeVisible();

  await expect(page.getByLabel('お名前')).toHaveValue(DELIVERY.name);
  await expect(page.getByLabel('郵便番号')).toHaveValue(DELIVERY.postalCode);
  await expect(page.getByLabel('ご住所')).toHaveValue(DELIVERY.address);
  await expect(page.getByLabel('電話番号')).toHaveValue(DELIVERY.phone);
  await expect(page.getByLabel('クレジットカード')).toBeChecked();
});

test.fixme('[TC-CHK-002] 複数商品の小計と合計', () => {
  // 前提条件：ぬくもりボトル 350ml（桜）とぬくもりボトル 500ml（桜）を各1点カートに入れている。包装なし。
  // 手順 1：「カート確認」の「ご注文金額」で商品ごとの明細と合計を確認する。
  // 期待結果：ぬくもりボトル 350ml（桜）は「×1」3,300円、ぬくもりボトル 500ml（桜）は「×1」3,850円、「合計（税込）」は7,150円と表示される。
});

test.fixme('[TC-CHK-003] 包装の選択と解除', () => {
  // 前提条件：ぬくもりボトル 350ml（桜）1点を包装なしでカートに入れている。
  // 手順 1：「ギフト包装（1点350円）」を選ぶ。
  // 手順 2：同じチェックを外す。
  // 期待結果：選択後は「ギフト包装」「×1」350円の明細が追加され、「合計（税込）」が3,650円になる。解除後は包装明細が消え、「合計（税込）」が3,300円に戻る。
});

test.fixme('[TC-CHK-004] 数量変更時の包装料と合計', () => {
  // 前提条件：ぬくもりボトル 350ml（桜）1点の「ギフト包装（1点350円）」を選択済み。
  // 手順 1：「ぬくもりボトル 350ml（桜）の数量」を1から2に変更する。
  // 期待結果：商品明細は「×2」6,600円、「ギフト包装」は「×2」700円、「合計（税込）」は7,300円と表示される。
});

test.fixme('[TC-CHK-005] 半角の郵便番号と電話番号のハイフン有無', () => {
  // 前提条件：商品1点をカートに入れ、「お届け先と支払い方法」を開いている。
  // 手順 1：「お名前」に「山田 花子」、「ご住所」に「東京都架空区こもれび1-2-3」を入力し、「クレジットカード」を選ぶ。
  // 手順 2：新規入力で郵便番号と電話番号をそれぞれ「123-4567」「03-0000-1234」と入力し、「確認画面へ進む」を押す。
  // 手順 3：別の試行で「1234567」「0300001234」を入力し、同様に進む。
  // 期待結果：どちらも「確認画面へ進む」が有効になり、「ご注文内容の確認」が表示される。「住所」と「電話番号」には各試行で入力した表記のまま、「〒123-4567 東京都架空区こもれび1-2-3」「03-0000-1234」または「〒1234567 東京都架空区こもれび1-2-3」「0300001234」が表示される。
});

test.fixme('[TC-CHK-006] 全角数字と全角ハイフンの受け付け', () => {
  // 前提条件：商品1点をカートに入れ、「お届け先と支払い方法」で氏名・住所を入力し、支払い方法を選択済み。
  // 手順 1：「郵便番号」に「１２３－４５６７」、「電話番号」に「０３－００００－１２３４」を入力する。
  // 手順 2：「確認画面へ進む」を押す。
  // 期待結果：観点表では入力が受け付けられ、「確認画面へ進む」が有効になって「ご注文内容の確認」が表示される。現行コードでは「確認画面へ進む」が無効になる。
});

test.fixme('[TC-CHK-007] のしの表書き一覧と確認画面への反映', () => {
  // 前提条件：包装付きの商品をカートに入れ、お届け先4項目と支払い方法を入力済み。
  // 手順 1：「のし（ギフト包装を選んだ商品に付けます）」の一覧を開く。
  // 手順 2：「無地」「御歳暮」「御年賀」「内祝」を1つずつ選び、そのたびに「確認画面へ進む」を押して「のし」を確認する。試行間は「戻る」で入力画面に戻る。
  // 期待結果：一覧に「のしなし」「無地」「御歳暮」「御年賀」「内祝」が表示される。「ご注文内容の確認」の「のし」に各試行で選んだ表書きが表示される。
});

test.fixme('[TC-CHK-008] のしを指定しないときの表示', () => {
  // 前提条件：包装付きの商品をカートに入れ、お届け先4項目と支払い方法を入力済み。
  // 手順 1：のしで「のしなし」を選ぶ。
  // 手順 2：「確認画面へ進む」を押す。
  // 期待結果：「ご注文内容の確認」の「お届け先」欄で、「のし」の値が「のしなし」と表示される。
});

test.fixme('[TC-CHK-010] 包装料を除いた付与予定ポイント', () => {
  // 前提条件：ぬくもりボトル 350ml（桜）1点を包装付きでカートに入れ、お届け先4項目と支払い方法を入力済み。
  // 手順 1：「確認画面へ進む」を押し、「合計（税込）」と「付与予定ポイント」を確認する。
  // 期待結果：「合計（税込）」は3,650円、「付与予定ポイント」は商品代金3,300円分の「33ポイント」と表示される。
});

test.fixme('[TC-CHK-011] 確認画面から戻ったときののしの保持', () => {
  // 前提条件：包装付きの商品をカートに入れ、お届け先4項目と支払い方法を入力済み。
  // 手順 1：のしで「御年賀」を選び、「確認画面へ進む」を押す。
  // 手順 2：「ご注文内容の確認」で「戻る」を押す。
  // 期待結果：「お届け先と支払い方法」が表示され、「のし（ギフト包装を選んだ商品に付けます）」で「御年賀」が選択されたままになる。
});
