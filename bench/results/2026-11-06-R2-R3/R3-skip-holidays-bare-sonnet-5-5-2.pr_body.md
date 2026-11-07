## 概要
一括設定の対象日の計算と下見の API に「祝日を除く」（`skipHolidays: boolean`）を足した。画面のチェックは別の Task。

## 変更
- `shared/src/bulk.ts`: `BulkInput` に `skipHolidays` を追加。`bulkTargetDates` は true のとき祝日（振替休日・国民の休日を含む。一覧に無い年は祝日なし）を除く。`BulkPreviewRequest` は `BulkInput` から導出されるので同じ項目を持つ
- `backend/.../parse-bulk-input.ts`: `skipHolidays` が boolean かを受け口で確かめる（違う・無いと 400、`fieldErrors` の field は `skipHolidays`）
- テスト: `bulkTargetDates`（祝日を除く／除かない／振替休日／一覧に無い年）、下見の API（除く・含める、無い・boolean でない値は 400）、フロントの送信内容
- docs: 教科書 06・07 の `bulkTargetDates` の例を更新

## 決めたこと
**「送らないと既定値」ではなく、型で必須にし、画面側を同じ PR で `true` を送るように直した。**
- 既定値にすると、API を直接呼ぶ側が祝日を除くかどうかを意識しないまま動き、型にも表れない。要件定義（データ項目: `skipHolidays` boolean、受け口で true/false を確かめる）にも合わせて必須にした
- 画面は `toBulkPreviewRequest`（`frontend/src/calendar/bulk-form.ts`）で `skipHolidays: true` を固定で送る。要件の「最初から ON」と同じ。チェックを付ける Task で、欄の値から送るように置き換える
- 既存のテストで祝日の影響を受けないよう、`bulkTargetDates` や API の既存テストには `skipHolidays: false` を付けた

## 影響
- 画面の見た目は変わらないが、一括設定の下見では祝日（例: 2026-11-03）が対象から外れる
- `POST /api/daily-records/bulk/preview` は `skipHolidays` が必須になった（画面以外に呼び出し元は無い）

## 確認
`npm run typecheck` / `npm run lint` / `npm run test`（183 件）すべて通過
