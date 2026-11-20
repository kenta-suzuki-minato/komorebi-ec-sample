// TDDの2つの段階（test / impl）を守らせるフック
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const mode = process.argv[2]; // "pre"、"post" または "stop"
const input = JSON.parse(readFileSync(0, "utf8"));
const phase = readFileSync(".codex/tdd-phase.txt", "utf8").trim();

const isTest = (p) => /\.test\.ts$/.test(p);
const isGuard = (p) => p.replace(/\\/g, "/").includes(".codex/");

function deny(reason) {
  const d = { hookEventName: "PreToolUse", permissionDecision: "deny",
    permissionDecisionReason: reason };
  console.log(JSON.stringify({ hookSpecificOutput: d }));
  process.exit(0);
}

// tool_input の中の文字列をすべて集める（パッチ本文やコマンド）
function strings(v) {
  if (typeof v === "string") return [v];
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

if (mode === "pre") {
  const text = strings(input.tool_input).join("\n");
  const re = /^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm;
  const files = [...text.matchAll(re)].map((m) => m[1].trim());
  const writeCmd = /Set-Content|Add-Content|Out-File|Remove-Item|Move-Item|Copy-Item/;
  if (files.some(isGuard) || (writeCmd.test(text) && text.includes(".codex")))
    deny(".codex/ の中は変更できません。");
  if (phase === "test" && files.some((f) => !isTest(f)))
    deny("今はテストを書く段階です。実装のファイルは変更しないでください。");
  if (phase === "impl" && (files.some(isTest) ||
      (writeCmd.test(text) && /\.test\.ts/.test(text))))
    deny("今は実装の段階です。テストのファイルは変更しないでください。");
}

// packages/domain のテストを実行し、失敗した行だけを返す（成功なら空文字）
function failures() {
  try {
    execSync("pnpm vitest run packages/domain", { stdio: "pipe" });
    return "";
  } catch (e) {
    return String(e.stdout).split("\n").filter((l) => /FAIL|×/.test(l))
      .slice(0, 15).join("\n");
  }
}

// post は書き換えのたび、stop は終了前に1回だけ（続けさせたあとの終了では実行しない）
const runTests = mode === "post" || (mode === "stop" && !input.stop_hook_active);
if (phase === "impl" && runTests) {
  const f = failures();
  const reason = "テストが失敗しています。テストは変えずに実装を直してください。\n"
    + f;
  if (f) console.log(JSON.stringify({ decision: "block", reason }));
}
