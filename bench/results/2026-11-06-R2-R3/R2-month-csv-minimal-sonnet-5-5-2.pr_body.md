## 概要
月の日次記録から F7 の形の CSV の文字列を作る純粋関数を `shared/src/csv.ts` に追加しました（U10 のとおり `shared/` に置き、`shared/src/index.ts` から export）。画面のボタンやファイル保存はこの PR に含みません。

- `monthCsvRows(records)`: エスケープ前の行（`string[][]`）。通常ルート1行 + 追加の移動1件ごとに1行。0 円の日・未入力の日は行なし
- `escapeCsvField(value)`: `,`・改行（CR/LF）・`"` があれば `"` で囲み、中の `"` は `""`（RFC 4180）
- `monthCsv(records)`: `UTF8_BOM` + 見出し + 明細。CRLF 区切り
- `CSV_HEADER` / `UTF8_BOM` / `csvFileName(month)`（`routepense-YYYY-MM.csv`）
- テスト `shared/src/csv.test.ts`: 列の順、祝日・曜日、エスケープ各種、金額の列の和が `monthlyFare(...).total` と一致すること、ファイル名
- 教科書 第18章「文字列の組み立てとエスケープ」と README の表

## 自分で決めたこと（仕様に書かれていなかった点）
- **行の順序**: 日付の昇順に並べ直す（入力の順に依存しない）。同じ日は通常 → 追加の移動の足した順。渡された配列は変更しない
- **最後の行の CRLF**: 最後の行の後にも CRLF を付ける（RFC 4180 で許容。見出しだけの月は「BOM + 見出し + CRLF」）
- **`monthCsv` は BOM を含む**: 「ファイルの中身全体」と読んだため
- **引数の型**: `CsvRecord = Pick<DailyRecord, "date" | "workStyle" | "extraTrips">` を export。`monthlyFare` に同じ配列を渡せる
- **出勤で運賃が 0 円の場合**: 通常ルートの行は出す（F7 は「出勤日の通常ルートで1行」とあるため）。その場合は金額列が 0 になるが、合計は変わらない
- **曜日・祝日**: `weekdayOf` と `holidayName` から出す（`Date` のタイムゾーンに依存しない）
- **追加の移動の `purpose` が無い場合**: 空文字

## 確認
`npm run typecheck && npm run lint && npm run test` が通ることを確認済み（239 テスト）。

## 気になる点（今回は対応していない）
- 値が `=`・`+`・`-`・`@` で始まると、表計算ソフトが式として解釈しうる（CSV インジェクション）。自分用のデータなので要件にはなく、今回は入れていない。必要なら別の Task で
