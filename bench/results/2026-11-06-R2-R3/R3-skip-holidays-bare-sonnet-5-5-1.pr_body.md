## 概要
一括設定で「祝日を除く」を扱えるようにした（要件定義 F3 の `skipHolidays`）。画面のチェックは別の Task。

- `shared/src/bulk.ts`: `BulkInput` に `skipHolidays: boolean` を追加。`bulkTargetDates` は `skipHolidays` が true のとき `holidayName` が返す日（振替休日・国民の休日を含む）を除く。`BulkPreviewRequest` は `BulkInput` から作っているので、同じ項目を持つ
- `backend/.../parse-bulk-input.ts`: `skipHolidays` が boolean かを受け口で確かめる（違えば `fieldErrors` に `skipHolidays`）
- テスト: `bulkTargetDates`（除く／除かない／曜日に当たらない祝日／土日の祝日／祝日一覧に無い年）、下見 API（除く・除かない・省略や非 boolean で 400）
- docs: textbook 06・07 のコード片を新しいシグネチャに更新（requirements.md には `skipHolidays` が既に書いてあるので変更なし）

## 決めたこと: 画面から送るまでの間の扱い
**型でも API でも必須にし、画面側を同じ PR で `true` を送るように直した**（`toBulkPreviewRequest`）。

- 理由: 既定値を API で補うと、送り忘れが黙って「除く」になり、後から画面のチェックを足したときに意図とずれても型や 400 で気づけない。必須なら、送り忘れはコンパイル時と受け口で見つかる。このアプリの API の利用者は自前の画面だけなので、必須にしても影響が小さい
- 画面の見た目や操作は変えていない。ただし**挙動は変わる**: 今は下見で祝日が除かれる（「除く」が既定という Task の方針どおり）。チェックが付く Task では `true` の固定をチェックの値に置き換える
- `skipHolidays` を省略した下見リクエストは 400 になる（互換性が必要なら、`parse` で `undefined` → `true` にする案もあるが採らなかった）

## 確認
`npm run typecheck` / `npm run lint` / `npm run test`（183 件）すべて成功。

## 補足
祝日の一覧は `HOLIDAY_YEARS`（2026・2027）のみ。一覧に無い年は祝日なしとして扱われる（既存の仕様）。
