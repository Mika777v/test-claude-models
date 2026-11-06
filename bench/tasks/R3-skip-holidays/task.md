[Task] 一括設定の対象日の計算と下見の API で、祝日を除けるようにする

## 作業内容
- `shared/src/bulk.ts`: `BulkInput` に「祝日を除く」（例: `skipHolidays: boolean`）を足し、`bulkTargetDates` で祝日を除く。テストを足す
- `BulkPreviewRequest` も同じ項目を持つ
- backend の `parse-bulk-input.ts` で、その項目が boolean かを受け口で確かめる。下見の API のテストを足す
- 画面は変えない（画面のチェックは別の Task）。画面から送るまでの間は、送らないと既定値（除く）になるか、型で必須にして画面側を同じ PR で `true` を送るように直すかを、PR で決めて書く

## 完了条件（Definition of Done）
- [ ] 受け入れ条件を満たす
- [ ] テストを追加・更新した
- [ ] CI がグリーン
- [ ] 教科書・docs を更新した（必要なら）

## 見積り
S (≤0.5d)
