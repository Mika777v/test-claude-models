[Task] 月の記録から CSV の文字列を作る純粋関数とテスト

## 作業内容
- 月の日次記録の一覧から、F7 の形の CSV の文字列を作る純粋関数を作る（置き場所は U10 に従う）
- カンマ・改行・`"` を含む値のエスケープ、金額の合計が月次画面の合計（`monthlyFare`）と合うことをテストする
- 教科書: 文字列の組み立て・エスケープで使った概念の章を書く

## 完了条件（Definition of Done）
- [ ] 関数とテストがあり、`npm run typecheck && npm run lint && npm run test` が通る
- [ ] 教科書の章を書いた

## 名前と形（この名前で作る）
`shared/src/csv.ts` に置き、`shared` の外からも使えるようにする。

- `monthCsvRows(records)`: 記録（`date`・`workStyle`・`extraTrips` を持つもの）の配列から、CSV の行（F7 の列の順の文字列の配列。エスケープする前の値）の配列を返す
- `escapeCsvField(value: string): string`: 1つの値をエスケープする
- `monthCsv(records): string`: CSV のファイルの中身全体を返す
- `CSV_HEADER`: 見出しの行（列の名前の配列）
- `UTF8_BOM`: BOM の文字
- `csvFileName(month: string): string`: `month`（`YYYY-MM`）からファイル名を返す
