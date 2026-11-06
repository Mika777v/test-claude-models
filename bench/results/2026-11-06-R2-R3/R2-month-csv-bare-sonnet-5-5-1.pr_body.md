## 概要
F7（CSV 出力）の土台として、月の日次記録から CSV の文字列を作る純粋関数とテストを追加します（U10 に従い `shared/` に置く）。画面（ボタン・ファイル保存）はこの PR に含めません。

- `shared/src/csv.ts`: `monthCsvRows` / `escapeCsvField` / `monthCsv` / `CSV_HEADER` / `UTF8_BOM` / `csvFileName`（`shared/src/index.ts` から export）
- `shared/src/csv.test.ts`: 行の形、エスケープ（カンマ・改行・`"`）、金額の和が `monthlyFare` の合計と一致すること、ファイル名
- 教科書 第18章「文字列の組み立てとエスケープ」と README の目次

## 自分で決めたこと
- `monthCsv` は **BOM を先頭に含む**（「ファイルの中身全体」と解釈）。画面側で BOM を足す必要はない。
- 最後の行にも CRLF を付ける（RFC 4180 で許される形）。記録が 0 行なら見出し行だけ。
- 行は **渡された記録の順のまま**出す（並べ替えない）。月の記録は呼び出し側で日付順にして渡す想定。
- 追加の移動の行も、その日の勤務区分（在宅・休日を含む）を「勤務区分」列に出す。
- 通常ルートの行の「目的」は空、追加の行の「ルート名」は空（F7 の表どおり）。
- エスケープは必要な値だけ `"` で囲む。値の欄は個別にエスケープしてから `,` で結ぶ。
- 曜日は `weekdayOf`、祝日は `holidayName` を使う（一覧に無い年は祝日が空）。
- 引数の型は `Pick<DailyRecord, "date" | "workStyle" | "extraTrips">`（`monthlyFare` と同じ形）。
- 数式インジェクション対策（`=` 始まりの値の無害化）は仕様に無いので入れていない。

## 確認
`npm run typecheck && npm run lint && npm run test` が通ることを確認済み（236 テスト）。

PR_TITLE.txt / PR_BODY.md はコミットしていません。GitHub に接続できないため push と PR 作成は未実施です。

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
