## 概要
要件定義 F7・U10 の CSV の文字列を作る純粋関数を `shared/src/csv.ts` に追加し、`shared` の index から公開しました（画面のボタン・ファイル保存はこの PR の範囲外）。

- `monthCsvRows(records)`: 行（F7 の列順、エスケープ前の文字列配列）
- `escapeCsvField(value)`: RFC 4180 のエスケープ（`,` `"` CR LF を含むときだけ囲み、`"` は `""`）
- `monthCsv(records)`: `UTF8_BOM` + 見出し + 明細、CRLF
- `CSV_HEADER` / `UTF8_BOM` / `csvFileName(month)`
- テスト `shared/src/csv.test.ts`: エスケープ、F7 の例の行、金額の列の和 = `monthlyFare().total`、BOM・CRLF
- 教科書 第18章（文字列の組み立てとエスケープ）と README の目次

## 自分で決めたこと
- 行の並びは日付昇順（入力順に依存しない）、同じ日は通常 → 追加（追加は入力順）。引数は書き換えない
- 金額は `workStyleFare` / `extraTripFare` を使う（月次画面と同じ計算）
- 明細が0件でも、BOM + 見出しだけのファイルを返す。最後の行にも CRLF を付ける
- 囲む必要の無い値は `"` で囲まない（最小限のエスケープ）
- 祝日名・曜日は `holidayName` / `weekdayOf` から作る。曜日・交通手段・勤務区分の表示名は `csv.ts` 内に持つ（frontend の `route-form.ts` は shared から参照できないため。重複は小さいのでこのまま）
- `monthCsv` の引数の型は `Pick<DailyRecord, "date" | "workStyle" | "extraTrips">`（`monthlyFare` と同様）
- `csvFileName` は形式の検証をしない（`month` は呼ぶ側が `YYYY-MM` で渡す前提）
- 表計算ソフトの数式として解釈される値（`=` `+` で始まる等）の無害化はしていない（F7 の範囲外。自分用の記録のため）

## 確認
`npm run typecheck && npm run lint && npm run test` が通ることを確認（241 tests）。
