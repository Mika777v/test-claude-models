## 概要
F7（CSV 出力）の土台。月の日次記録から CSV の文字列を作る純粋関数とテスト、教科書の第18章を追加した。画面（ボタン・ファイル保存）は含まない。

## 変更内容
- `shared/src/csv.ts`（`shared` の index からも公開）
  - `monthCsvRows(records)`: F7 の列の順の行（エスケープ前）。出勤日の通常ルート1行＋追加の移動1件ごとに1行。移動の無い日は行なし
  - `escapeCsvField`: RFC 4180。`,` `"` CR LF のいずれかを含めば `"` で囲み、`"` は `""`
  - `monthCsv`: BOM + 見出し + 明細、各行 CRLF（最後の行も CRLF）
  - `CSV_HEADER`・`UTF8_BOM`・`csvFileName`（`routepense-YYYY-MM.csv`）
- `shared/src/csv.test.ts`: エスケープ、行の形、BOM・CRLF、金額の列の和 = `monthlyFare().total`
- `docs/textbook/18-string-building-and-escaping.md` と README の一覧

## 実装の理由
金額は `workStyleFare`・`extraTripFare` を再利用。月次画面と同じ関数を通るので合計が必ず合う。

## 確認が必要な項目
なし（ADR・DB・要件定義・CI の変更なし）。自動マージを予約してよい。

## 自分で決めたこと
- 行の順は渡された記録の順のまま（並べ替えない）。呼ぶ側が日付順で渡す
- 曜日・勤務区分・交通手段の表示名は `shared` から frontend を参照できないため、`csv.ts` に持った（frontend の `WEEKDAY_LABELS`・`TRANSPORT_LABELS` と同じ文言。二重管理なので、将来 shared に寄せる余地あり）
- 最後の行の後にも CRLF を付ける（RFC 4180 で許される）
- `=` `+` `-` `@` で始まる値の数式対策（CSV インジェクション）は入れていない。個人利用で、要件にも無いため。必要なら別 Task
- 記録に `month` 外の日が混ざっていても絞り込まない（呼ぶ側の責務）。`csvFileName` は形式の検証をしない

## 動作確認
`npm run typecheck && npm run lint && npm run test` が通る（実行済み）。

Closes #（Task の番号を記入。GitHub に接続できず確認できなかった）

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
