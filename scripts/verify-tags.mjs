#!/usr/bin/env node
// 章ごとのタグが「本に書いた状態」のままかを確かめる（メンテナンス用）。
//   node scripts/verify-tags.mjs            … tests/expected-outcomes.json のすべてのタグ
//   node scripts/verify-tags.mjs ch05-kec17 … 指定したタグだけ
//   node scripts/verify-tags.mjs --e2e      … E2Eテスト（Playwright）の期待結果も確かめる
//                                             （先に pnpm exec playwright install chromium が必要）
//
// タグごとに一時ワークツリーを作り、次を確認する。
//   1. pnpm install --frozen-lockfile（失敗が期待されるタグは、そのエラーコードで失敗すること）
//   2. pnpm lint / pnpm typecheck / pnpm test がすべて通ること
//   3. it.fails で印を付けた既知の不具合（[B1] など）が期待どおりの一覧であること
//   4. it.fails を it に戻すと、その不具合のテストだけが期待どおりのメッセージで失敗すること
//   5. （--e2e のとき）e2e.fail に書いたテストだけが期待どおりのメッセージで失敗し、ほかはすべて成功すること
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const expected = JSON.parse(readFileSync(join(root, 'tests', 'expected-outcomes.json'), 'utf8'));
const args = process.argv.slice(2);
const withE2e = args.includes('--e2e');
const tagArgs = args.filter((arg) => !arg.startsWith('--'));
const tags = tagArgs.length > 0 ? tagArgs : Object.keys(expected.tags);
const workBase = join(tmpdir(), 'komorebi-verify-tags');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function run(args, cwd) {
  const result = spawnSync(pnpm, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' });
  return { code: result.status ?? 1, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

function testFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...testFiles(path));
    else if (name.endsWith('.test.ts')) files.push(path);
  }
  return files;
}

function vitestJson(cwd, name) {
  const out = join(cwd, `.vitest-${name}.json`);
  run(['exec', 'vitest', 'run', '--reporter=json', `--outputFile=${out}`], cwd);
  const report = JSON.parse(readFileSync(out, 'utf8'));
  return report.testResults.flatMap((file) => file.assertionResults);
}

// Playwright の JSON レポートから、テストごとの結果（タイトル、状態、エラーメッセージ）を取り出す
function playwrightResults(cwd) {
  const out = join(cwd, '.playwright-report.json');
  const result = spawnSync(pnpm, ['exec', 'playwright', 'test', '--reporter=json'], {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: out },
  });
  if (!existsSync(out)) throw new Error(`Playwright のレポートがありません\n${(result.stdout ?? '') + (result.stderr ?? '')}`.slice(-800));
  const report = JSON.parse(readFileSync(out, 'utf8'));
  const tests = [];
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const last = test.results?.at(-1);
        tests.push({ title: spec.title, status: last?.status ?? 'skipped', message: (last?.errors ?? []).map((e) => e.message ?? '').join('\n') });
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report.suites ?? []) walk(suite);
  return tests;
}

const specIdOf = (title) => (/^\[(TC-[A-Z]+-\d+)\]/.exec(title) ?? [])[1] ?? title;

function removeWorktree(dir) {
  try {
    execSync(`git worktree remove --force "${dir}"`, { cwd: root, stdio: 'ignore' });
  } catch {
    rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
    execSync('git worktree prune', { cwd: root });
  }
}

const bugIdOf = (title) => (/\[(TC-[A-Z]+-\d+)\]\[B\d+\]/.exec(title) ?? [])[1] ?? title;

let failures = 0;
const fail = (tag, message) => {
  failures += 1;
  console.log(`  NG ${tag}: ${message}`);
};

mkdirSync(workBase, { recursive: true });
for (const tag of tags) {
  const spec = expected.tags[tag];
  if (!spec) {
    fail(tag, 'tests/expected-outcomes.json に定義がありません');
    continue;
  }
  console.log(`== ${tag}`);
  const dir = join(workBase, tag);
  if (existsSync(dir)) removeWorktree(dir);
  execSync(`git worktree add --detach "${dir}" ${tag}`, { cwd: root, stdio: 'ignore' });

  try {
    const install = run(['install', '--frozen-lockfile'], dir);
    const nodeMajor = Number(process.versions.node.split('.')[0]);
    if (spec.requiresNodeMajor && nodeMajor !== spec.requiresNodeMajor) {
      if (install.code === 0) fail(tag, `Node ${nodeMajor} で install が成功した（${spec.installErrorOtherNode} で失敗するはず）`);
      else if (!install.output.includes(spec.installErrorOtherNode)) fail(tag, `install のエラーが ${spec.installErrorOtherNode} ではない`);
      else console.log(`  OK Node ${nodeMajor} では install が ${spec.installErrorOtherNode} で失敗`);
      continue;
    }
    if (spec.install === 'fail') {
      if (install.code === 0) fail(tag, 'install が成功した（失敗するはず）');
      else if (!install.output.includes(spec.installError)) fail(tag, `install のエラーが ${spec.installError} ではない`);
      else console.log(`  OK install は ${spec.installError} で失敗`);
      continue;
    }
    if (install.code !== 0) {
      fail(tag, `install 失敗\n${install.output.slice(-800)}`);
      continue;
    }
    for (const script of ['lint', 'typecheck', 'test']) {
      const result = run([script], dir);
      if (result.code !== 0) fail(tag, `pnpm ${script} 失敗\n${result.output.slice(-800)}`);
      else console.log(`  OK pnpm ${script}`);
    }

    const normal = vitestJson(dir, 'normal');
    const bugTests = normal.filter((t) => /\]\[B\d+\]/.test(t.title)).map((t) => bugIdOf(t.title)).sort();
    const want = Object.keys(spec.knownBugs ?? {}).sort();
    if (JSON.stringify(bugTests) !== JSON.stringify(want)) {
      fail(tag, `既知の不具合テストの一覧が違う\n    実際：${bugTests.join(', ')}\n    期待：${want.join(', ')}`);
    } else {
      console.log(`  OK 既知の不具合テスト ${bugTests.length} 件（${normal.length} 件中）`);
    }
    if (spec.minTests && normal.length < spec.minTests) fail(tag, `テスト数 ${normal.length} < ${spec.minTests}`);

    if (want.length > 0) {
      const before = failures;
      for (const file of testFiles(dir)) {
        const text = readFileSync(file, 'utf8');
        if (text.includes('it.fails(')) writeFileSync(file, text.replaceAll('it.fails(', 'it('));
      }
      const probe = vitestJson(dir, 'bugs');
      const failed = probe.filter((t) => t.status === 'failed');
      const failedIds = failed.map((t) => bugIdOf(t.title)).sort();
      if (JSON.stringify(failedIds) !== JSON.stringify(want)) {
        fail(tag, `it.fails を外したときに失敗するテストが違う\n    実際：${failedIds.join(', ')}\n    期待：${want.join(', ')}`);
      }
      for (const [id, message] of Object.entries(spec.knownBugs)) {
        if (!message) continue;
        const test = failed.find((t) => bugIdOf(t.title) === id);
        const text = (test?.failureMessages ?? []).join('\n');
        if (!text.includes(message)) fail(tag, `${id} の失敗メッセージに「${message}」がない`);
      }
      if (failures === before) console.log('  OK it.fails を外すと既知の不具合だけが失敗');
    }

    if (withE2e && spec.e2e) {
      // it.fails を書き換えたファイルを元に戻してから実行する
      execSync('git checkout -- .', { cwd: dir, stdio: 'ignore' });
      const before = failures;
      const results = playwrightResults(dir);
      const wantFail = spec.e2e.fail ?? {};
      for (const t of results) {
        const id = specIdOf(t.title);
        if (id in wantFail) {
          if (t.status === 'passed') fail(tag, `E2E ${id} が成功した（失敗するはず）`);
          else if (!t.message.includes(wantFail[id])) fail(tag, `E2E ${id} の失敗メッセージに「${wantFail[id]}」がない`);
        } else if (t.status !== 'passed' && t.status !== 'skipped') {
          fail(tag, `E2E ${t.title} が ${t.status}\n${t.message.slice(0, 400)}`);
        }
      }
      for (const id of Object.keys(wantFail)) {
        if (!results.some((t) => specIdOf(t.title) === id)) fail(tag, `E2E ${id} が見つからない`);
      }
      if (failures === before) {
        const failedCount = results.filter((t) => t.status !== 'passed' && t.status !== 'skipped').length;
        console.log(`  OK E2E ${results.length} 件（期待どおりの失敗 ${failedCount} 件）`);
      }
    }
  } finally {
    removeWorktree(dir);
  }
}
rmSync(workBase, { recursive: true, force: true });
execSync('git worktree prune', { cwd: root });

console.log(failures === 0 ? '\nすべてのタグが期待どおりです。' : `\n${failures} 件の不一致があります。`);
process.exit(failures === 0 ? 0 : 1);
