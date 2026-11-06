## 概要
月の日次記録から、F7 の形の CSV の文字列を作る純粋関数とテストを `shared/src/csv.ts` に追加する（U10）。画面のボタンとファイル保存は、このあとの別の Task。

Closes #<!-- この Task の番号。GitHub に接続できず調べられなかったため、PR を出すときに書き入れる -->

## 変更内容
- `shared/src/csv.ts`（`shared/src/index.ts` から export）
  - `monthCsvRows(records)`: F7 の列の順の文字列の配列の配列（エスケープ前）。日付順。出勤日は「通常」1行、追加の移動は1件1行。移動の無い日は行なし
  - `escapeCsvField(value)`: `,`・改行（CR・LF）・`"` を含めば `"` で囲み、中の `"` は `""`
  - `monthCsv(records)`: `UTF8_BOM` + 見出し + 明細。CRLF 区切りで、最後の行にも CRLF
  - `CSV_HEADER`・`UTF8_BOM`・`csvFileName(month)`（`routepense-YYYY-MM.csv`）
  - 型 `CsvRecord`（`DailyRecord` の `date`・`workStyle`・`extraTrips`）
- `shared/src/csv.test.ts`: エスケープ、各行の中身、行が作られない日、並び順、列の数、**金額の列の和 = `monthlyFare(...).total`**、BOM・CRLF
- 教科書 第18章「文字列の組み立てとエスケープ」と、`docs/textbook/README.md` の一覧

### 自分で決めたこと
- 金額は `workStyleFare`・`extraTripFare` を使って出す（足し方を別に書かず、月次画面の合計と必ず合うように）
- 記録の並びは日付順に直す（呼び出し側の順序に頼らない。引数の配列は変えない）。同じ日は通常 → 追加の登録順
- 最後の行にも CRLF を付ける（RFC 4180 は任意。F7 の「改行は CRLF」に素直に従った）
- 引数の型は `DailyRecord` 全体ではなく `Pick`（`CsvRecord`）。`monthlyFare` と同じ作り
- 交通手段・曜日・勤務区分の日本語の名前は `csv.ts` の中に持つ（フロントに共通の名前の一覧が見当たらなかったため）。画面側で同じ名前が要るようになったら共通化する
- 通常の行の「目的」は空、追加の行の「ルート名」は空（F7 のとおり）
- `=`・`+`・`@` で始まる値を表計算ソフトが式と解釈する問題（CSV インジェクション）への対策は入れていない。値を書き換えると元のデータと変わるため。個人利用で、値は自分が入力したものなので後回しにした。必要なら別の Task にする

## 確認が必要な項目
なし

## 動作確認の方法
```
npm install
npm run typecheck && npm run lint && npm run test
```
`shared/src/csv.test.ts` が通ること（全体で 241 テスト通過）。画面はまだ無い。

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [x] 教科書（docs/textbook/）の関連する章を書いた・更新した
- [x] 要件定義（docs/requirements.md）と食い違っていない
- [x] 秘密情報・個人情報を含んでいない

🤖 Generated with [Claude Code](https://claude.ai/code)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
