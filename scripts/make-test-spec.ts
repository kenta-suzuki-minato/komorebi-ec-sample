import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import ExcelJS from 'exceljs';

interface TestCase {
  id: string;
  viewpoint_id: string;
  major: string;
  minor: string;
  precondition: string;
  steps: string[];
  expected: string;
  automation: 'e2e' | 'unit' | 'manual';
}

interface TestSpec {
  cases: TestCase[];
  uncovered_viewpoints: string[];
}

interface Viewpoint {
  観点ID: string;
  画面: string;
}

const testDirectory = new URL('../docs/test/', import.meta.url);
const specName = 'テスト仕様書_購入手続き';
const checkoutScreens = new Set(['購入手続き', 'カート確認', 'お届け先と支払い方法', '確認', '画面間の移動']);

function validateSpec(spec: TestSpec, viewpoints: Viewpoint[]) {
  const caseIds = new Set<string>();
  const coveredIds = new Set<string>();
  for (const testCase of spec.cases) {
    if (typeof testCase.id !== 'string' || !/^TC-CHK-[0-9]{3}(?![\s\S])/.test(testCase.id)) {
      throw new Error(`テストケース ID の形式が不正です: ${JSON.stringify(testCase.id)}`);
    }
    if (caseIds.has(testCase.id)) {
      throw new Error(`テストケース ID が重複しています: ${testCase.id}`);
    }
    caseIds.add(testCase.id);
    coveredIds.add(testCase.viewpoint_id);
  }

  for (const entry of spec.uncovered_viewpoints) {
    const id = /^VP-[0-9]+\b/.exec(entry.trim())?.[0];
    if (id) coveredIds.add(id);
  }

  const missingIds = viewpoints
    .filter((row) => checkoutScreens.has(row.画面) && !coveredIds.has(row.観点ID))
    .map((row) => row.観点ID);
  if (missingIds.length > 0) {
    throw new Error(`ケースにも uncovered_viewpoints にも記載されていない観点: ${missingIds.join(', ')}`);
  }
}

async function main() {
  const [json, csv] = await Promise.all([
    readFile(new URL(`${specName}.json`, testDirectory), 'utf8'),
    readFile(new URL('テスト観点表.csv', testDirectory), 'utf8'),
  ]);
  const spec = JSON.parse(json.replace(/^\uFEFF/, '')) as TestSpec;
  const viewpoints = parse<Viewpoint>(csv, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  validateSpec(spec, viewpoints);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('購入手続き', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  sheet.columns = [
    { header: 'No', width: 16 },
    { header: '大項目', width: 26 },
    { header: '中項目', width: 32 },
    { header: '前提条件', width: 42 },
    { header: '手順', width: 58 },
    { header: '期待結果', width: 58 },
    { header: '結果', width: 12 },
    { header: '実施日', width: 14 },
    { header: '実施者', width: 16 },
    { header: '自動テスト', width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const testCase of spec.cases) {
    const row = sheet.addRow([
      testCase.id,
      testCase.major,
      testCase.minor,
      testCase.precondition,
      testCase.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
      testCase.expected,
      null,
      null,
      null,
      testCase.automation,
    ]);
    row.alignment = { vertical: 'top', wrapText: true };
  }

  const output = fileURLToPath(new URL(`${specName}.xlsx`, testDirectory));
  await workbook.xlsx.writeFile(output);
  console.log(output);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
