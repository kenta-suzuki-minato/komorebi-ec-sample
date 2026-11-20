import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';

interface ImpactItem {
  area: string;
  target: string;
  location: string;
  current: string;
  impact: string;
  verdict: string;
  evidence: string;
  effort_days: number | null;
}

const impactDirectory = new URL('../docs/impact/', import.meta.url);
const impactName = 'coupon_points_tax';

async function main() {
  const json = await readFile(new URL(`${impactName}.json`, impactDirectory), 'utf8');
  const { items } = JSON.parse(json.replace(/^\uFEFF/, '')) as { items: ImpactItem[] };

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('影響範囲調査表', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  sheet.columns = [
    { header: 'No', width: 8 },
    { header: '区分', width: 18 },
    { header: '対象', width: 32 },
    { header: '場所', width: 40 },
    { header: '現状', width: 48 },
    { header: '影響内容', width: 58 },
    { header: '判定', width: 12 },
    { header: '根拠', width: 58 },
    { header: '工数（人日）', width: 16 },
    { header: '確認者', width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  let totalEffort = 0;
  let unestimatedCount = 0;
  for (const [index, item] of items.entries()) {
    const row = sheet.addRow([
      index + 1,
      item.area,
      item.target,
      item.location,
      item.current,
      item.impact,
      item.verdict,
      item.evidence,
      item.effort_days,
      null,
    ]);
    row.alignment = { vertical: 'top', wrapText: true };

    if (item.verdict !== '要修正') continue;
    if (item.effort_days === null) {
      unestimatedCount += 1;
    } else {
      totalEffort += item.effort_days;
    }
  }

  const summary = sheet.addRow([
    null, null, null, null, null,
    '要修正の工数合計',
    null,
    `工数未見積もり（要修正） ${unestimatedCount}件`,
    totalEffort,
  ]);
  summary.font = { bold: true };

  const output = fileURLToPath(new URL(`${impactName}.xlsx`, impactDirectory));
  await workbook.xlsx.writeFile(output);
  console.log(output);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
