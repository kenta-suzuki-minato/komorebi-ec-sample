import iconv from 'iconv-lite';
import { describe, expect, it } from 'vitest';
import { encodeShiftJis, toShipmentCsv, type ShipmentRow } from './export-orders';

const row: ShipmentRow = {
  orderNo: 'KS-20261110-0001',
  shipToName: '山田 花子',
  postalCode: '000-0001',
  address: '神奈川県横浜市〇〇区1-2-3',
  phone: '045-000-0000',
  productCode: 'BT-350',
  color: '生成り',
  qty: 1,
  giftWrap: true,
  noshi: '御歳暮',
};

describe('toShipmentCsv', () => {
  it('見出し行と明細行を CRLF で区切る', () => {
    const csv = toShipmentCsv([row]);
    const [header, line] = csv.split('\r\n');
    expect(header).toBe('受注番号,お届け先氏名,郵便番号,住所,電話番号,商品コード,カラー,数量,包装,のしコード');
    expect(line).toBe('KS-20261110-0001,山田 花子,000-0001,神奈川県横浜市〇〇区1-2-3,045-000-0000,BT-350,生成り,1,1,N1');
    expect(csv.endsWith('\r\n')).toBe(true);
  });

  it.each([
    ['無地', 'N0'],
    ['御歳暮', 'N1'],
    ['御年賀', 'N2'],
    ['内祝', 'N3'],
  ])('のし「%s」はコード %s', (noshi, code) => {
    expect(toShipmentCsv([{ ...row, noshi }]).split('\r\n')[1]?.endsWith(`,${code}`)).toBe(true);
  });

  it('のしなしはコード欄が空', () => {
    expect(toShipmentCsv([{ ...row, noshi: undefined, giftWrap: false }]).split('\r\n')[1]).toMatch(/,1,0,$/);
  });

  it('コードのない表書きはエラー（倉庫に送れない）', () => {
    expect(() => toShipmentCsv([{ ...row, noshi: '御中元' }])).toThrow('のしコードがありません');
  });

  it('カンマを含む住所は引用符で囲む', () => {
    const csv = toShipmentCsv([{ ...row, address: '横浜市〇〇区1-2-3,こもれびビル' }]);
    expect(csv).toContain('"横浜市〇〇区1-2-3,こもれびビル"');
  });
});

describe('encodeShiftJis', () => {
  it('Shift_JIS に変換し、元に戻せる', () => {
    const bytes = encodeShiftJis('生成り,墨,桜,若草');
    expect(iconv.decode(bytes, 'Shift_JIS')).toBe('生成り,墨,桜,若草');
    expect(bytes.length).toBeLessThan(Buffer.byteLength('生成り,墨,桜,若草', 'utf8'));
  });
});
