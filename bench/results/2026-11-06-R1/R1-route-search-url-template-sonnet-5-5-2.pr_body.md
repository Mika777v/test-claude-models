## 概要
ADR-0002 の最初の一歩として、ルートに任意の経路結果 URL（`searchUrl`）を足す（型・DB・API の受け口）。画面と経路検索 API の呼び出しは別の Task。

Closes #（この Task の番号を入れてください。手元から Issue を確認できなかったため空欄）

## 変更内容
- `shared`: `Route` に `searchUrl?: string` を追加。`RouteSnapshot` は `Pick` で項目を選んでいるので入らない（金額の計算に使わないため）。`RouteInput` は `Route` から作られるので自動で任意の項目になる
- DB: マイグレーション v3 `ALTER TABLE routes ADD COLUMN search_url TEXT`（NULL 可）。v1・v2 は書き換えていない
- リポジトリ: `search_url` を読み書き。NULL のときは `searchUrl` のキー自体を付けない。編集（PUT）で `searchUrl` を送らなければ URL は消える（PUT は全項目の置き換えという今の動きに合わせた）
- 受け口: `optionalHttpUrl`（`validation/fields.ts`）を追加し `parseRouteInput` で使用
- テスト: URL の判定、API の 201/400、保存・更新・消去、バージョン2の DB（URL 列なし）に既存ルートがある状態で開いても読めること

## 自分で決めたこと
- 長さの上限は **2000 文字**（ほかの文字の項目は 100 文字だが、経路結果の URL は長くなりやすいため別の定数 `MAX_URL`）
- 形の判定: 前後の空白を除き、`http://` か `https://` で始まり（大文字小文字は問わない）、`URL.canParse` で読めるもの。`javascript:` などは通さない
- 無い・`null`・空白だけは「URL なし」として受け付ける（フォームの空欄を許すため）。型が文字列でなければ 400
- 実装のエラー文言はほかの項目と同じ口調にした

## 確認が必要な項目
- **DB のスキーマの変更**（マイグレーション v3）→ 自動マージを予約せず、オーナーの確認を待つ
- 補足: ADR-0002 は「提案（オーナーの確認待ち）」のまま。ADR の決定が変わった場合はこの PR も見直す

## 動作確認の方法
```
npm install
npm run typecheck && npm run lint && npm run test
```
バージョン2までの既存 DB でも、backend を起動すると v3 が適用され、既存ルートは `searchUrl` なしで返る（テスト「URL 列が無かった頃の既存ルート」）。

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [ ] 教科書（docs/textbook/）の関連する章を書いた・更新した — この Task は型・DB・API のみ。教科書は画面・インターフェースの Task でまとめて書く想定（未対応）
- [x] 要件定義（docs/requirements.md）と食い違っていない（searchUrl の定義と一致）
- [x] 秘密情報・個人情報を含んでいない
