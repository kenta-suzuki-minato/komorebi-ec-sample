---
paths:
  - "packages/domain/**"
---

# 金額の扱い（packages/domain）

- 消費税は注文ごと・税率ごとに1回だけ計算し、1円未満を切り捨てる。計算するのは `calcOrderTotals` だけ。
- 金額は円の整数で扱う。`Math.round` で税額を丸めない。
- 詳しくは `packages/domain/AGENTS.md`。
