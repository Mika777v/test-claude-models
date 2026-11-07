## 概要
一括設定の対象日の計算（`bulkTargetDates`）と下見の API（`POST /api/daily-records/bulk/preview`）で、祝日を除けるようにする（要件定義 F3）。画面のチェックは別の Task。

Closes #<この Task の番号>
<!-- GitHub に接続できずに作ったため、Issue の番号は入れられていない。PR を出すときに入れる -->

## 変更内容
- `shared/src/bulk.ts`: `BulkInput` に `skipHolidays: boolean` を追加。`bulkTargetDates` は、true のとき `holidayName` が名前を返す日を除く。祝日の一覧に無い年は何も除かれない
- `BulkPreviewRequest` は `Omit<BulkInput, "workStyle">` から作っているので、同じ項目を自動で持つ
- `backend/.../parse-bulk-input.ts`: `skipHolidays` が boolean かを受け口で確かめる。違う・無いときは `fieldErrors` に `skipHolidays` を入れて 400
- `frontend/.../bulk-form.ts`: 下見のリクエストに `skipHolidays: true` を入れる（下の「決めたこと」）
- テスト: shared（true / false / 曜日に合わない祝日 / 祝日だけの期間 / 一覧に無い年）、backend の下見 API（除く・除かない・無い・boolean でない）、frontend（`true` を送る）
- 教科書 第7章に、`Omit` で項目が自動で入ることを一文足した

## 決めたこと
- **型で必須にし、API でも必須にした（既定値は置かない）。** 画面側は同じ PR で `skipHolidays: true` を送るように直した
  - 理由: 「送らないと除く」にすると、送り忘れが気づかれずに祝日が除かれる。型で必須なら、新しい呼び出しで書き忘れるとコンパイルが通らず、API でも 400 で気づける（要件定義の「true / false であること」にも合う）
  - 既定を `true`（除く）にしたのは、要件定義 F3 の既定に合わせるため。画面のチェックを作る Task で、欄の値に置き換える
- **見た目の変化:** 今までは一括設定の下見に祝日も入っていたが、この PR 以降は画面から使うと祝日が外れる（チェックの欄ができるまで外せない）。意図した変化
- 祝日の判定は `holidayName` を使う（`HOLIDAYS` は 2026・2027 年のみ。それ以外の年は除かれない）

## 確認が必要な項目
なし
<!-- 要件定義は変えていない（`skipHolidays` は既に書いてある）。DB・ADR・CI の変更も無い -->

## 動作確認の方法
```
npm run typecheck && npm run lint && npm run test
```
手動なら、backend を起動して下見を呼ぶ（11/3 は文化の日）。
```
curl -s -X POST localhost:<port>/api/daily-records/bulk/preview -H 'Content-Type: application/json' \
  -d '{"startDate":"2026-11-02","endDate":"2026-11-06","weekdays":[1,2,3,4,5],"workStyle":{"kind":"remote"},"skipHolidays":true}'
```
`skipHolidays` を `false` にすると 11-03 が入る。付けないと 400。画面の一括設定でも、11 月の平日に 11/3 が入らない。

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [x] 教科書（docs/textbook/）の関連する章を書いた・更新した
- [x] 要件定義（docs/requirements.md）と食い違っていない
- [x] 秘密情報・個人情報を含んでいない

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
