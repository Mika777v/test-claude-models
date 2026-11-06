## 概要
一括設定の対象日の計算（`bulkTargetDates`）と下見 API が、`skipHolidays`（祝日を除く）を扱えるようにする。画面のチェックは別の Task。

Closes #<!-- この Task の Issue 番号（GitHub に接続できず確認できなかったため、push 前に記入） -->

## 変更内容
- `shared/src/bulk.ts`: `BulkInput` に `skipHolidays: boolean` を追加。`bulkTargetDates` は true のとき `holidayName` が返す日（祝日・振替休日・国民の休日）を除く。祝日が土日と重なる日も除く
- `BulkPreviewRequest` は `BulkInput` から作っているので、同じ項目を持つ
- `backend/.../parse-bulk-input.ts`: `skipHolidays` が boolean かを受け口で確かめる（違うと `field: "skipHolidays"` の 400）
- テスト: 祝日を除く／除かない・曜日に合わない祝日・土日と重なる祝日・一覧に無い年（shared）、下見 API の 200 と 400（backend）、画面が `true` を送ること（frontend）
- 教科書 06 章のコード抜粋の型を更新

## 判断したこと（質問できないため自分で決めた）
- **必須にした（省略時の既定値は置かない）。** 項目 `skipHolidays` は `docs/requirements.md` でも boolean の必須項目として書かれている。省略を既定値で補うと、送り忘れが気づかれずに祝日が除かれたり残ったりするため、型と受け口で必須にした
- **画面側は同じ PR で直した。** 画面の見た目は変えず、`toBulkPreviewRequest` が常に `skipHolidays: true`（要件の「最初から ON」と同じ）を送る。チェックボックスは別の Task で足し、そのとき `BulkFormValues` に項目を足してこの固定値を置き換える
- 画面を変えないが、この PR のあと、画面からの一括設定は祝日を除くようになる（要件 U9 の既定どおり）。祝日に「休日」などを一括で当てたい場合は、チェックの Task が入るまでカレンダー上で手で直す
- 登録 API（`POST /bulk`）は日ごとの一覧を受け取るので変えていない

## 確認が必要な項目
なし

## 動作確認の方法
```
npm install
npm run typecheck && npm run lint && npm run test
```
`POST /api/daily-records/bulk/preview` に `skipHolidays: true`、2026-11-01〜11-08・平日を送ると、11-03（文化の日）を除く 4 日分が返る。`skipHolidays` を省くと 400。

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [x] 教科書（docs/textbook/）の関連する章を書いた・更新した（06 章の型の抜粋のみ）
- [x] 要件定義（docs/requirements.md）と食い違っていない
- [x] 秘密情報・個人情報を含んでいない

🤖 Generated with [Claude Code](https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
