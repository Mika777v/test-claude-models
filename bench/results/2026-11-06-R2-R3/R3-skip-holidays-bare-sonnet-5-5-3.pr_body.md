## 概要
一括設定の入力に `skipHolidays: boolean`（祝日を除く）を足し、対象日の計算と下見の API で祝日を除けるようにした。画面のチェックは別の Task。

- `shared/src/bulk.ts`: `BulkInput` に `skipHolidays` を追加（`BulkPreviewRequest` は `Omit<BulkInput, "workStyle">` 由来なので同じ項目を持つ）。`bulkTargetDates` は `true` のとき、`holidayName` が返す日（振替休日・国民の休日を含む）を除く
- `backend/.../parse-bulk-input.ts`: `skipHolidays` が boolean かを受け口で確かめる。違えば `fieldErrors` に `skipHolidays` を出して 400
- テスト: `bulkTargetDates`（除く / 除かない / 曜日に合わない祝日 / 振替休日・国民の休日 / 一覧に無い年）、下見 API（祝日を除く・除かない、無い・boolean でない値で 400）、フロントの送信内容

## 決めたこと
**「送らないと既定値（除く）」にはせず、型でも受け口でも必須にした。画面側は同じ PR で `true` を送るように直した。**

- 要件定義 5 章の「バリデーション」は「`祝日を除く` が true / false であること」としており、省略を許す書き方ではない
- 既定値にすると、送り忘れが気づかれないまま「祝日が除かれる」挙動になる。必須なら、送り忘れは型エラー（フロント）か 400（API）で見つかる
- 画面の修正は `toBulkPreviewRequest` で `skipHolidays: true` を固定で送るだけ。要件 F3 の「最初から ON」と同じ挙動なので、画面の見た目は変わらない
- ただし、この PR で**画面の挙動は1つ変わる**: これまでは祝日にも当てはめていたが、`true` 固定のため、祝日は対象から外れる。チェックを付ける別 Task が入るまでの暫定で、その Task で `true` の固定をフォームの値に置き換える

## 確認
- `npm run typecheck` / `npm run lint` / `npm run test` はすべて通った（183 テスト）
- docs: 要件定義に既に `skipHolidays` の記載があるため変更なし
