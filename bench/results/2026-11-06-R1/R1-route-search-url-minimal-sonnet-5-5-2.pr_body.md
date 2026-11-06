## 概要
ADR-0002 に沿って、ルートに任意の経路結果の URL（`searchUrl`）を持てるようにする（型・DB・ルートの API の受け口）。frontend と経路検索の API は別の Task。

Closes #

## 変更内容
- `shared`: `Route` に `searchUrl?: string` を追加。`RouteSnapshot` には入れない（`RouteInput` は `Route` から作るので自動で任意項目になる）
- DB: マイグレーション v3 `ALTER TABLE routes ADD COLUMN search_url TEXT`（NULL 可）。v1・v2 の SQL は書き換えていない
- リポジトリ: 登録・編集・読み出しで `search_url` を扱う。NULL の行は `searchUrl` のキーごと省く
- 受け口: `parseRouteInput` で `searchUrl` を確かめる（`fields.ts` に `optionalUrl` を追加）
- テスト: 入力判定、リポジトリ、ルート API、v2 の DB を v3 に上げても既存ルートが読めること

## 自分で決めたこと
- **長さの上限は 2000 文字**（`MAX_URL`）。ほかの文字項目の 100 文字では経路結果の URL が入らないため
- **形の判定**: 前後の空白を除いたうえで `http://` か `https://`（大文字小文字を問わない）で始まり、ホスト部があり、空白を含まず、`new URL()` で読めること。それ以外は 400 で `fieldErrors` の `searchUrl` に理由を返す
- **空文字・null・未指定は「URL なし」**として扱う。PUT は全項目を置き換える API なので、`searchUrl` を送らずに編集すると URL は消える（NULL に戻る）。frontend が URL の欄を持つ Task で、既存値を送り返す前提にする
- 「駅すぱあとの URL か」までは確かめない（手で直せる欄で、他社の URL も許す方針）。必要になったらドメインの制限を足す

## 確認が必要な項目
- DB のスキーマ（`routes` に列を追加）の変更を含むため、オーナーの確認を待つ（自動マージは予約しない）

## 動作確認の方法
- `npm run typecheck && npm run lint && npm run test`
- 既存ルート: v2 までの DB に行を入れてから開き直しても読めることを `sqlite-route-repository.test.ts` で確認

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [ ] 教科書（docs/textbook/）の関連する章を書いた・更新した（今回は対象外）
- [x] 要件定義（docs/requirements.md）と食い違っていない
- [x] 秘密情報・個人情報を含んでいない
