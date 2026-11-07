## 概要
F7（CSV 出力）の土台として、月の日次記録から CSV の文字列を作る純粋関数とテストを `shared/src/csv.ts` に追加しました（U10 に従い `shared/` に置き、`index.ts` から export）。画面のボタン・ファイル保存は含みません。

- `monthCsvRows(records)`: F7 の列の順の行（エスケープ前）
- `escapeCsvField(value)`: RFC 4180 のエスケープ
- `monthCsv(records)`: BOM + 見出し + 明細（CRLF）
- `CSV_HEADER` / `UTF8_BOM` / `csvFileName(month)`
- 教科書 第18章（文字列の組み立てとエスケープ）と README の目次

## テスト
`npm run typecheck && npm run lint && npm run test` が通ります。カンマ・改行・`"` のエスケープ、移動の無い日が行にならないこと、金額の列の和 = `monthlyFare().total` を確認しています。

## 自分で決めたこと
- 行は日付順に並べ替える（入力順に依存しない）。同じ日の中は「通常 → 追加の移動（登録順）」
- 末尾の行にも CRLF を付ける（RFC 4180 で許されており、多くのツールが期待する）。記録が無い月は見出しだけ
- 追加の移動の目的が未設定なら空。追加の移動を持つ在宅・休日の日は、勤務区分をそのまま出し、追加の移動の行だけ作る
- 引数の型は `Pick<DailyRecord, "date" | "workStyle" | "extraTrips">`（`monthlyFare` と同様、DB の項目に依存しない）
- 囲むかの判定はカンマ・`"`・CR・LF のみ。先頭が `=` などの値（表計算の数式として解釈される）への対策はしていない（自分用で、要件にないため）
- `csvFileName` は形式の検査をしない（呼び出し側が `YYYY-MM` を渡す前提）

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
