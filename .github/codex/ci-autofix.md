CIが失敗した。ci-failure.log と、package.json、pnpm-lock.yaml、
直近のコミットを調べて原因を診断し、指定の形式で答えて。
- pnpm-lock.yaml は編集しない。ロックファイルの問題なら
  fix_kind を lockfile_update にして、ファイルは変えない
- コードかテストの問題で、書き込みが許されているときだけ、
  最小限の修正をワークスペースに書く
- 原因が分からなければ fix_kind を unknown にする
