## 概要
ADR-0002 に沿って、ルートに任意の経路結果の URL（`searchUrl`）を持てるようにしました（型・DB・API の受け口まで。画面と経路検索の API は別の Task）。

- `shared`: `Route` に `searchUrl?: string` を追加。`RouteSnapshot` には入れていません（`RouteInput` は `Route` から作るので自動で受け取ります）
- DB: マイグレーション version 3 で `routes.search_url TEXT`（NULL 可）を追加。version 1・2 の SQL は書き換えていません
- リポジトリ: 登録・編集・読み出しに対応。NULL の行は `searchUrl` の項目を付けずに返す（既存ルートは今までと同じ形で読める）
- 受け口: `parseRouteInput` で `searchUrl` を確認（`validation/fields.ts` に `optionalUrl` を追加）

**DB のスキーマ変更を含むので、ADR のとおりオーナーの確認をお願いします。**

## 決めたこと（Task に書かれていなかった点）
- 長さの上限は **2000 文字**（`MAX_URL`）。前後の空白を取り除いたあとで数える
- 形の判定は `^https?://` で始まり、空白を含まないこと（大文字小文字は区別しない）。URL として厳密に解析まではしない
- 無い・`null`・空文字（空白だけも）は「URL なし」として通す。値は保存しない
- 文字列以外はエラー。エラーの項目名は `searchUrl`
- 編集（PUT）は全項目の置き換えなので、`searchUrl` を送らないと URL は消える（他の項目と同じ扱い）
- フロントの変更は含めていません。型は任意項目なので既存のフロントはそのまま動きます

## テスト
- 受け口の判定（正常・前後の空白・空・null・`ftp://`・`javascript:`・スキームなし・空白入り・文字列以外・2000/2001 文字の境界）
- リポジトリ（保存・編集で消す・URL なしは項目なし）
- version 2 の DB に既存ルートを入れてから version 3 を適用しても、そのまま読めること
- API（登録・編集・不正な URL は 400）
- `npm run typecheck` / `npm run lint` / `npm run test` はすべて通過

## 未対応・メモ
- ADR-0002 の「実装の前に確かめること」（フリープランで URL を保存してよいか等）は、この PR では確かめていません。URL の保存は ADR 側の確認待ちです
