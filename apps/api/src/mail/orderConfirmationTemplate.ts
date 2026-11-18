// 注文確認メールのテンプレート（KEC-16）。文面はお客様から受領後に調整する（KEC-32）。
export const ORDER_CONFIRMATION_TEMPLATE = `{{{customerName}}} 様

こもれびストアをご利用いただき、ありがとうございます。
以下の内容でご注文を承りました。

ご注文番号：{{{orderNo}}}

{{#lines}}
・{{{name}}} × {{{qty}}}　{{{amount}}}
{{/lines}}

合計　{{{total}}}（うち消費税 {{{taxTotal}}}）
{{#breakdown}}
　{{{rate}}}対象 {{{taxable}}}（消費税 {{{tax}}}）
{{/breakdown}}
{{#noshi}}

のし：{{{omotegaki}}}
{{/noshi}}

こもれびリビング`;
