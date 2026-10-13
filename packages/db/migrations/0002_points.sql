-- ポイント台帳（技術設計書 3.4）。残高列は持たず、集計で求める
CREATE TABLE point_ledger (
  id          uuid PRIMARY KEY,
  member_id   uuid NOT NULL REFERENCES members (id),
  kind        text NOT NULL CHECK (kind IN ('grant', 'use', 'expire')),
  points      integer NOT NULL,
  order_id    uuid REFERENCES orders (id),
  expires_at  date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- PR #118：同じ注文に2回付与しない
CREATE UNIQUE INDEX point_ledger_order_kind ON point_ledger (order_id, kind) WHERE order_id IS NOT NULL;
