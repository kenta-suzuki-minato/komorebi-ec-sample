-- ギフト包装・のし（KEC-12、KEC-13）
ALTER TABLE orders
  ADD COLUMN noshi_omotegaki text
  CHECK (noshi_omotegaki IN ('無地', '御歳暮', '御年賀', '内祝'));
