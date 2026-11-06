## 概要
ADR-0002 に沿って、ルートに任意の経路結果 URL（`searchUrl`）を持たせる。型・DB・API の受け口までで、画面と経路検索のインターフェースは別 Task。

## 変更
- `shared`: `Route` に `searchUrl?: string` を追加。`RouteSnapshot` には入れていない（`RouteInput` は `Route` から作っているので自動で受け取る）
- DB: マイグレーション version 3 `ALTER TABLE routes ADD COLUMN search_url TEXT`（NULL 可）。既存の番号の SQL は書き換えていない
- リポジトリ: 登録・編集・読み出しで `search_url` を扱う。URL なしのルートは `searchUrl` のキーごと省く
- 受け口: `parseRouteInput` で `searchUrl` を確かめる（`optionalUrl` を `validation/fields.ts` に追加）
- テスト: 判定（正常・空・不正・長さの境界）、リポジトリ（保存・変更・消去）、API（400 と登録・編集）、version 2 の既存ルートを version 3 に上げても読めること

## 自分で決めたこと
- **長さの上限は 2000 文字**（`MAX_URL`）。通常の項目の 100 文字では経路結果の URL が入らないため。ADR に数字が無いので、レビューで変えてよい
- **形の判定**: 前後の空白を取り除いたあと、`^https?://`（大文字小文字は問わない）で始まり、かつ `new URL()` で読めること。`javascript:` などは弾く
- **空文字・空白だけ・null は「URL なし」** として扱い、エラーにしない（フォームの空欄をそのまま送れるように）。編集で `searchUrl` を送らなければ URL は消える（PUT は全項目の置き換えという今の動きに合わせた）
- 文字列以外はエラー

## 確認してほしいこと
- **DB のスキーマ変更を含む**ので、ADR の方針どおりオーナーの確認が必要
- 駅すぱあとの仕様書での確認（URL を保存してよいか等）は ADR の「実装の前に確かめること」にあり、この PR では未実施

## 確認
`npm run typecheck` / `npm run lint` / `npm run test`（192 件）が通ることを確認済み。
