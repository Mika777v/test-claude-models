## 概要
一括設定に「祝日を除く」（`skipHolidays: boolean`）を足した。画面のチェックは別の Task。

- `shared/src/bulk.ts`: `BulkInput` に `skipHolidays` を追加。`bulkTargetDates` は `true` のとき `holidayName` で祝日の日を除く（`BulkPreviewRequest` は `BulkInput` から作るので同じ項目を持つ）
- `backend/.../parse-bulk-input.ts`: `skipHolidays` が boolean かを受け口で確かめる。違えば 400（`field: "skipHolidays"`）
- テスト: `bulkTargetDates`（除く／残す／曜日外の祝日／祝日一覧に無い年）、下見の API（除く／残す／省略・boolean でない値は 400）、フロントの `toBulkPreviewRequest`

## 決めたこと
**型で必須にし、画面側を同じ PR で `true` を送るように直した**（「送らないと既定値」にはしていない）。

- 理由: 既定値を API に持たせると、送り忘れが 400 にならず静かに祝日が除かれる。型と受け口で必須にすれば、送り忘れをコンパイルと 400 で見つけられる。要件 U9 の「最初から ON」は画面の初期値の話なので、画面側で `true` を送れば満たせる
- `frontend/src/calendar/bulk-form.ts` の `toBulkPreviewRequest` が常に `skipHolidays: true` を送る。チェックを置く別の Task で、欄の値から送るように変える
- 影響: 画面から一括設定の下見をすると、祝日は対象から外れる（U9 の通り、除いた日の既存の記録はそのまま残る）。API を直接呼ぶ側は `skipHolidays` が必須になる（互換性の影響はこのアプリ内のみ）

## 確認
`npm run typecheck` / `lint` / `test` すべて成功（183 tests）。
docs は `requirements.md` に `skipHolidays` とバリデーションが既に書かれているため変更なし。
