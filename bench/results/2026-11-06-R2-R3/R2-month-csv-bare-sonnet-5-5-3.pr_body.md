## 概要
F7・U10 の CSV 出力のうち、「月の記録から CSV の文字列を作る」純粋関数を `shared/src/csv.ts` に追加しました（`shared` の `index.ts` からも export）。画面のボタン・ファイル保存はこの PR に含みません。

- `monthCsvRows(records)`: F7 の列の順の行（エスケープ前）
- `escapeCsvField(value)`: RFC 4180 のエスケープ
- `monthCsv(records)`: BOM + 見出し + 明細、各行 CRLF
- `CSV_HEADER` / `UTF8_BOM` / `csvFileName(month)`
- テスト `shared/src/csv.test.ts`（エスケープ、行の中身、`monthlyFare().total` との一致 など）
- 教科書 第18章「文字列の組み立てとエスケープ」と README の目次

## 自分で決めたこと
- 行の並び: 日付の昇順（入力の配列は変更しない）。同じ日は通常ルート → 追加の移動（渡された順）。
- 引数の型: `date`・`workStyle`・`extraTrips` だけを持つもの（`Pick<DailyRecord, ...>`）。`monthlyFare` と同じ流儀。
- 全行の末尾に CRLF を付ける（最後の行も）。記録が無い月は見出しだけのファイル。
- 曜日・勤務区分・交通手段・片道/往復の表示名は `csv.ts` に持つ（`frontend` の `WEEKDAY_LABELS` は `shared` から参照できないため。重複は小さいので許容）。
- 祝日は `holidayName`（U9 の一覧に無い年は空）。
- 数式として解釈される先頭文字（`=` など）の無害化は、要件に無いので行っていない。

## 確認
`npm run typecheck && npm run lint && npm run test` が通ることを確認済み（242 tests）。
