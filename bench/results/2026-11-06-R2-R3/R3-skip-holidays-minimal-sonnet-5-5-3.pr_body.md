## 概要
一括設定に「祝日を除く」(`skipHolidays: boolean`) を足した（要件 F3・U9）。画面のチェックは別の Task。

- `shared/src/bulk.ts`: `BulkInput` に `skipHolidays` を追加。`bulkTargetDates` は `skipHolidays` が true のとき、`holidayName` で祝日と分かる日を除く。`BulkPreviewRequest` も `BulkInput` から作っているので同じ項目を持つ
- `backend/.../parse-bulk-input.ts`: `skipHolidays` が boolean かを受け口で確かめる（違えば 400、項目名は `skipHolidays`）
- テスト: `bulk.test.ts`（除く・除かない・曜日に合わない祝日・一覧に無い年）、`bulk-router.test.ts`（除いた日は当てはめず上書きもしない／省略と boolean 以外は 400）、`bulk-form.test.ts`

## 決めたこと
**`skipHolidays` は型で必須にし、画面側を同じ PR で `true` を送るように直した**（「送らないと既定値」にはしなかった）。
- 理由: 要件では最初から ON。API の既定値にすると、画面を作る Task で送り忘れても気づけない。必須にすれば、送り忘れは型エラーと 400 で分かる
- 画面: `toBulkPreviewRequest`（`frontend/src/calendar/bulk-form.ts`）が常に `skipHolidays: true` を送る。チェックの追加は別の Task でここを欄の値に置き換える
- 注意: このPRのあと、画面の一括設定は祝日（例: 11/3）に当てはめなくなる（要件どおりの挙動）
- 既存のテストで、祝日を含む期間（2026-11 など）を使うものは `skipHolidays: false` を付けて元の期待のままにした

## 確認
`npm run typecheck` / `npm run lint` / `npm run test` はすべて通った（182 tests）。docs は要件定義に既に書かれているため変更なし。
