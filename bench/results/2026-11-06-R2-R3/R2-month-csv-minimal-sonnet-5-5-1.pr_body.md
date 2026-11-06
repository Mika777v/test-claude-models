## 概要
F7・U10 の CSV の文字列を作る純粋関数を `shared/src/csv.ts` に追加し、`shared` の `index.ts` から export した（画面のボタン・ファイル保存はこの Task の範囲外）。

- `monthCsvRows(records)`: エスケープ前の行（F7 の列の順）
- `escapeCsvField(value)`: RFC 4180 のエスケープ
- `monthCsv(records)`: BOM + 見出し + 明細（CRLF）
- `CSV_HEADER` / `UTF8_BOM` / `csvFileName(month)`
- テスト `shared/src/csv.test.ts`（エスケープ、行の作り方、金額の和 = `monthlyFare`）
- 教科書 第18章「文字列の組み立てとエスケープ」（README の表にも追加）

## 自分で決めたこと
- `records` の順を保つ（並べ替えない）。同じ日の中は通常 → 追加。呼ぶ側が日付順に渡す
- 追加の移動は、運賃が 0 円でも1件1行にする（「1行 = 1つの移動」を優先。金額の和は変わらない）
- 通常ルートの行は、出勤日なら運賃が 0 円でも出す
- 最後の行にも CRLF を付ける（RFC 4180 は任意。記録が無い月は見出しだけ）
- 引数の型は `CsvRecord`（`DailyRecord` の `date`・`workStyle`・`extraTrips` の `Pick`）を足して export した
- 曜日・祝日は `weekdayOf`・`holidayName` から出す（記録には持たせない）
- 先頭が `=` などの値への CSV インジェクション対策はしていない（自分用で、要件に無いため）

## 確認
`npm run typecheck && npm run lint && npm run test` が通る（31 ファイル・240 テスト）。
