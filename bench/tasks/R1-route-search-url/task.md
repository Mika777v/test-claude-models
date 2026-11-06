[Task] ルートに経路結果の URL（searchUrl）を足す（型・DB・ルートの API）

## 作業内容
- ADR-0002 に沿って、`shared` の `Route` に任意の `searchUrl` を足す（`RouteSnapshot` には入れない）
- `routes` の表に URL の列（NULL 可）を足すマイグレーション
- ルートの登録・編集の API の受け口で URL の形を確かめる（`http(s)://` で始まる、長さの上限）

## 完了条件（Definition of Done）
- [ ] 型・マイグレーション・リポジトリ・受け口の判定とテスト
- [ ] 既存のルート（URL なし）がそのまま読める

## 見積り
S
