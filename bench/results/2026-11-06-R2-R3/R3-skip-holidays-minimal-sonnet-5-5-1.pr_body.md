## 概要
一括設定に「祝日を除く」(`skipHolidays: boolean`) を足し、対象日の計算と下見の API で祝日を除けるようにした（要件定義 F3・U9）。画面のチェックは別の Task。

Closes #

## 変更内容
- `shared/src/bulk.ts`: `BulkInput` に `skipHolidays` を追加。`bulkTargetDates` は `skipHolidays` が true のとき、`holidayName` が返す日（祝日）を対象から除く。`BulkPreviewRequest` は `BulkInput` から作っているので同じ項目を持つ
- `backend/src/daily-records/parse-bulk-input.ts`: `skipHolidays` が boolean かを受け口で確かめる（違う・無いときは `fieldErrors` に `skipHolidays` を入れて 400）
- `frontend/src/calendar/bulk-form.ts`: `toBulkPreviewRequest` が `skipHolidays: true` を送るようにした（下記の決めたこと）
- テスト: `bulk.test.ts`（true / false / 日曜の祝日 / 一覧に無い年）、`bulk-router.test.ts`（祝日を除く・含める・boolean でない／無いと 400）、`bulk-form.test.ts`。既存テストの入力には `skipHolidays` を足した

## 決めたこと
**「送らないと既定値（除く）」ではなく「型で必須にして、画面側を同じ PR で `true` を送るように直す」を選んだ。**
- 理由: 要件定義の既定値（最初から ON）は画面のチェックの初期値の話。API に隠れた既定値を置くと、送り忘れても通ってしまい、祝日の上書きという取り消しにくい結果につながる。型で必須にすれば、送り忘れはコンパイルで見つかる
- API は項目が無いと 400（`skipHolidays` の欄）。要件定義のバリデーション「true / false であること」とも合う
- 画面は `toBulkPreviewRequest` で `true` を固定で送る。見た目・操作は変わらない。チェックを足す Task で、この固定値を欄の値に置き換える
- 祝日の一覧は `holidayName` を使うので、一覧に無い年（2026・2027 以外）は祝日なし扱いのまま
- 除いた日の記録は触らない（`applyBulk` には対象日だけが渡るため、上書きの情報にも出ない）

## 確認が必要な項目
なし

## 動作確認の方法
- `npm run typecheck` / `npm run lint` / `npm run test`（すべて成功。182 テスト）
- 手で確かめるなら、下見の API に `skipHolidays: true` で 2026-11-02〜11-06 の平日を送ると 11-03（文化の日）が `records` に入らない

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [ ] 教科書（docs/textbook/）の関連する章を書いた・更新した — 該当なし（新しい概念は無い）
- [x] 要件定義（docs/requirements.md）と食い違っていない（要件に既にある項目を実装しただけ）
- [x] 秘密情報・個人情報を含んでいない
