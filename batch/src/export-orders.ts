// 出荷指示データ（あおば物流様向けCSV、Shift_JIS、CRLF）。
import iconv from 'iconv-lite';

export interface ShipmentRow {
  orderNo: string;
  shipToName: string;
  postalCode: string;
  address: string;
  phone: string;
  productCode: string;
  color: string;
  qty: number;
  giftWrap: boolean;
  /** のしの表書き。なしは undefined */
  noshi?: string;
}

// 倉庫側ののしコード（あおば物流様の取り決め）
const NOSHI_CODES: Record<string, string> = {
  無地: 'N0',
  御歳暮: 'N1',
  御年賀: 'N2',
  内祝: 'N3',
};

const HEADER = ['受注番号', 'お届け先氏名', '郵便番号', '住所', '電話番号', '商品コード', 'カラー', '数量', '包装', 'のしコード'];

function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toShipmentCsv(rows: readonly ShipmentRow[]): string {
  const body = rows.map((row) => {
    const noshiCode = row.noshi === undefined ? '' : NOSHI_CODES[row.noshi];
    if (noshiCode === undefined) {
      throw new Error(`のしコードがありません: ${row.noshi}`);
    }
    return [
      row.orderNo,
      row.shipToName,
      row.postalCode,
      row.address,
      row.phone,
      row.productCode,
      row.color,
      String(row.qty),
      row.giftWrap ? '1' : '0',
      noshiCode,
    ]
      .map(csvField)
      .join(',');
  });
  return [HEADER.join(','), ...body].join('\r\n') + '\r\n';
}

export function encodeShiftJis(csv: string): Buffer {
  return iconv.encode(csv, 'Shift_JIS');
}
