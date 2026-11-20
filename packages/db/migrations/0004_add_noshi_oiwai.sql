ALTER TABLE orders
  DROP CONSTRAINT orders_noshi_omotegaki_check,
  ADD CONSTRAINT orders_noshi_omotegaki_check
    CHECK (noshi_omotegaki IN ('無地', '御歳暮', '御年賀', '内祝', '御祝'));
