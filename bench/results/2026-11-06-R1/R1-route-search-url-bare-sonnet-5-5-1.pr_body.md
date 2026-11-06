## 概要
ADR-0002 の最初の Task。ルートに任意の経路結果 URL（`searchUrl`）を持たせる。画面（frontend）と経路検索の受け口は含まない。

## 変更
- `shared`: `Route` に `searchUrl?: string` を追加。`RouteSnapshot` には入れない（ADR のとおり）。`RouteInput` は `Route` から作っているので自動で受け取る
- DB: マイグレーション v3 `ALTER TABLE routes ADD COLUMN search_url TEXT`（NULL 可）。**DB のスキーマ変更なので、ADR-0002 のとおりオーナーの確認が必要**
- リポジトリ: 登録・編集・読み出しで `search_url` を扱う
- 受け口: `parseRouteInput` で `searchUrl` を確かめる（`optionalHttpUrl` を `validation/fields.ts` に追加）

## 自分で決めたこと
- 上限は **2048 文字**（既存の文字項目の 100 文字では経路結果の URL が入らないため、専用の `MAX_URL` を作った）
- 判定は「`http://` か `https://` で始まる（大文字小文字は区別しない）」＋ `new URL()` で解釈できること。前後の空白は取り除く
- `searchUrl` が無い・`null`・空白だけのときは「URL なし」として扱う（エラーにしない）。文字以外はエラー
- URL なしのルートは、レスポンスに `searchUrl` のキーを出さない（NULL をキーごと省く）。既存のクライアントと既存テストの形が変わらない
- PUT は全項目を置き換える既存の作りのままなので、編集で `searchUrl` を送らないと URL は消える（NULL に戻る）
- ホスト名の制限（駅すぱあとのドメインだけ許す等）はしていない。ADR の「URL を保存してよいか」の確認が済んでいないため、手で直せる前提で形だけ確かめる

## テスト
- 受け口: 正常・空・null・不正な形・文字以外・長さの境界
- リポジトリ: 保存・付け外し・URL なしはキーなし
- 既存のルート: v2 までの DB を作って開き直し、URL なしでそのまま読めること
- ルーター: 付けて登録、不正は 400
- `npm run typecheck` / `lint` / `test`（194 件）すべて通過

## 未対応（ADR の残りの Task）
- frontend のフォームの URL 欄、`RouteSearch`、`/api/route-search`
