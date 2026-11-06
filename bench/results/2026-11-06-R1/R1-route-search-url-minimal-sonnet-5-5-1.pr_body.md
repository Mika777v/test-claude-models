## 概要
ADR-0002 に沿って、ルートに任意の経路結果の URL（`searchUrl`）を持たせる（型・DB・ルートの API の受け口）。画面と経路検索 API は別の Task。

Closes #

## 変更内容
- `shared`: `Route` に `searchUrl?: string` を追加（`RouteSnapshot` には入れない）
- DB: マイグレーション v3 で `routes.search_url TEXT`（NULL 可）を追加。既存の行は NULL のまま
- リポジトリ: 登録・編集・読み出しに対応。NULL の行は `searchUrl` の項目ごと無い形で返す（既存ルートがそのまま読める）
- 受け口: `parseRouteInput` で `searchUrl` を確かめる（`validation/fields.ts` に `optionalUrl` を追加）
- テスト: 受け口の判定、リポジトリ（保存・消去・旧形式の行）、ルーターの 201/400

## 決めたこと
- 長さの上限は **2000 文字**（経路結果の URL は長くなりやすいため、他の文字項目の 100 より大きくした）
- `http://` / `https://` の始まり（大文字小文字は問わない）に加え、`new URL()` で解釈できることも確かめる。`javascript:` などは弾く
- 空文字・空白だけ・`null`・未指定は「URL なし」とみなす（エラーにしない）。編集で空にすると URL が消える
- 前後の空白は取り除く
- 既存のマイグレーション SQL は書き換えず、v3 を足した

## 確認が必要な項目
- DB のスキーマの変更（`routes` に列を追加）を含むため、オーナーの確認を待つ

## 動作確認の方法
- `npm run typecheck && npm run lint && npm run test`（すべて通過）

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [ ] 教科書（docs/textbook/）の関連する章を書いた・更新した（この Task では対象外）
- [x] 要件定義（docs/requirements.md）と食い違っていない
- [x] 秘密情報・個人情報を含んでいない
