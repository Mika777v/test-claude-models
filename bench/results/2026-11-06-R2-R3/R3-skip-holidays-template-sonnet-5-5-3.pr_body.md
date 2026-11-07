## 概要
一括設定の対象日の計算（`bulkTargetDates`）と下見の API（`POST /api/daily-records/bulk/preview`）で、祝日を除けるようにする（要件定義 F3・U9）。画面のチェックは別の Task。

Part of #（親 Epic の番号。この Task の番号が分かれば `Closes #Task番号` に直す。GitHub に接続できず、番号を確かめられなかった）

## 変更内容
- `shared/src/bulk.ts`: `BulkInput` に `skipHolidays: boolean` を足した（`BulkPreviewRequest` は `BulkInput` から作っているので同じ項目を持つ）。`bulkTargetDates` は、`skipHolidays` が true のとき `holidayName(date)` がある日を除く。曜日の条件と両方に合う日だけが対象になる
- `backend/.../parse-bulk-input.ts`: `skipHolidays` が boolean かを受け口で確かめる。違えば 400 で `fieldErrors` の field は `skipHolidays`
- テスト: `bulk.test.ts`（true / false / 曜日が合わない祝日 / 一覧に無い年）、`bulk-router.test.ts`（祝日を除く下見、`skipHolidays` が無い・boolean でないと 400）。既存のテストは `skipHolidays` を足した
- 教科書 第6・7章の `bulkTargetDates` の引数の型を更新

## 決めたこと（Task で PR に書くよう求められた点）
**`skipHolidays` は、型でも API でも必須にした。「送らないと既定値（除く）」にはしていない。** 画面側は同じ PR で `true` を送るようにした（`frontend/src/calendar/bulk-form.ts` の `toBulkPreviewRequest`）。

理由:
- 要件定義の「バリデーション」に「祝日を除くが true / false であること」とあり、受け口で boolean を確かめる Task の文面とも合う。省略を許すと「送り忘れ」と「除かない」を区別できない
- 既定値を受け口（API）に置くと、`BulkPreviewRequest` が「画面が送る形」と「API が受ける形」に分かれ、型が2つ要る。必須なら型は1つで、画面を直し忘れるとコンパイルエラーで気づける
- 画面の変更は `skipHolidays: true` を1項目足しただけ。要件定義 F3 の「最初から ON」とも同じ

注意点: 画面のチェックが入るまで、画面からの一括設定は祝日を除く（要件定義の既定値と同じ）。これまでは祝日にも当てはまっていたので、**画面の挙動がこの PR で1つ変わる**（祝日の日は当てはめず、記録はそのまま残る）。チェックを足す Task で、画面の値（`BulkFormValues`）に持たせて送るように直す。

## 確認が必要な項目
なし（ADR・DB のスキーマ・要件定義の変更は無い。要件定義は既に `skipHolidays` を定めており、それに合わせた）

## 動作確認の方法
```
npm install
npm run typecheck && npm run lint && npm run test
```
API を手で試す場合（backend を起動して。文化の日 2026-11-03 が除かれる）:
```
curl -s -X POST localhost:3000/api/daily-records/bulk/preview -H 'Content-Type: application/json' \
  -d '{"startDate":"2026-11-02","endDate":"2026-11-06","weekdays":[1,2,3,4,5],"skipHolidays":true,"workStyle":{"kind":"remote"}}'
```
`skipHolidays` を `false` にすると 11-03 が入る。外す・`"true"`（文字列）にすると 400。

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [x] 教科書（docs/textbook/）の関連する章を書いた・更新した
- [x] 要件定義（docs/requirements.md）と食い違っていない
- [x] 秘密情報・個人情報を含んでいない

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
