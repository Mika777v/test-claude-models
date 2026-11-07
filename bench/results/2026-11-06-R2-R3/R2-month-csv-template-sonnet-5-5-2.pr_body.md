## 概要
CSV 出力（F7・U10）の土台として、月の日次記録から CSV の文字列を作る純粋関数とテストを `shared/src/csv.ts` に追加する。画面（ボタン・ファイル保存）は別の Task。

Part of E?? CSV 出力の Epic（番号は Issue で確認できなかったため未記入。Task の番号を `Closes #` に入れてから出す）

## 変更内容
- `shared/src/csv.ts`（`shared/src/index.ts` から export）
  - `monthCsvRows(records)`: F7 の列の順の行（エスケープ前）。出勤は通常ルート1行、追加の移動は1件1行。在宅・休日で追加の移動が無い日は行なし
  - `escapeCsvField(value)`: カンマ・CR・LF・`"` を含むなら `"` で囲み、中の `"` を `""` に（RFC 4180）
  - `monthCsv(records)`: BOM + 見出し + 行。CRLF
  - `CSV_HEADER` / `UTF8_BOM` / `csvFileName(month)`（`routepense-YYYY-MM.csv`）
- `shared/src/csv.test.ts`: エスケープ、行の作り方、BOM・CRLF、金額の列の和 = `monthlyFare(...).total`
- 教科書 第18章「文字列の組み立てとエスケープ」と README の一覧

## 自分で決めたこと（質問できなかったため）
- 入力の型は `CsvRecord = Pick<DailyRecord, "date" | "workStyle" | "extraTrips">`（`monthlyFare` と同じ作り）。`export` もした
- 行は**日付の昇順**に並べる（渡した配列は変えない）。同じ日は通常ルート → 追加の移動（足した順）。呼ぶ側の並びに左右されないため
- `monthCsv` は**先頭に BOM を含み、最後の行にも CRLF を付ける**（「ファイルの中身全体」と読んだため）。記録が無い月は見出しだけ
- 曜日・勤務区分・交通手段・片道/往復の日本語の表記は `csv.ts` の中に持つ。frontend にも似た表記があるが、`shared` は frontend を参照できないため重複を許した（まとめるなら別の Task）
- 祝日は `holidayName(date)` で引く（祝日の一覧に無い年は空）
- 「`=`・`+`・`-`・`@` で始まる値」の無害化（表計算ソフトでの式の実行対策）は**入れていない**。要件 F7 は RFC 4180 のエスケープだけを定めており、入れると値が変わって転記時に困るため。個人利用なので見送ったが、複数ユーザー化・他人の入力を扱う段階で再検討したい

## 確認が必要な項目
なし（要件定義・DB・依存は変更していない。上の「自分で決めたこと」に異論があれば教えてほしい）

## 動作確認の方法
```
npm install
npm run typecheck && npm run lint && npm run test
```
`shared/src/csv.test.ts` が通ること。

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [x] 教科書（docs/textbook/）の関連する章を書いた・更新した
- [x] 要件定義（docs/requirements.md）と食い違っていない
- [x] 秘密情報・個人情報を含んでいない
