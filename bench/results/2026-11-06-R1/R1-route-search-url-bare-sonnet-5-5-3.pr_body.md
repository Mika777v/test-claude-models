## 概要
ADR-0002 の「作り」のうち、`shared` の型・DB・ルートの API の受け口までを実装します（経路検索のインターフェース・画面は別 Task）。

- `shared`: `Route` に任意の `searchUrl?: string` を追加。`RouteSnapshot` には入れない（`Pick` に含めず、コメントで明示）
- DB: マイグレーション version 3 `ALTER TABLE routes ADD COLUMN search_url TEXT`（NULL 可）。**スキーマ変更なので、ADR のとおりオーナーの確認が必要です**
- リポジトリ: `search_url` の読み書き。NULL のときは `searchUrl` のキー自体を付けない
- 受け口（`parseRouteInput`）: `searchUrl` は任意。`http://` / `https://` で始まり、空白を含まず `new URL` で読めること。2000文字まで

## 決めたこと
- **長さの上限は 2000 文字**（`MAX_URL`）。経路結果の URL は駅名などでパラメータが長くなりがちなので、既存の `MAX_TEXT`（100）とは別にした。ADR に数値の指定が無いため、目安として決めた。多すぎ・少なすぎなら `fields.ts` の定数だけ変えればよい
- **無い・null・空白だけは「URL なし」** とみなす。エラーにはしない（フォームの空欄をそのまま送れる）
- **編集（PUT）は全項目の置き換え**。`searchUrl` を送らないと URL は消える（他の項目と同じ扱い）
- 形の判定は「http(s) で始まる」＋ `new URL` で解析できること。`javascript:` などは弾く。ホストの許可リスト（駅すぱあとのドメインのみ等）は、手で直せる欄にする方針（ADR）なので入れていない

## 注意
- フロントの `toRouteInput` はまだ `searchUrl` を送らない。今は URL を設定する手段が無いので影響は無いが、**フロントの Task で URL の欄を足すまでは、画面からルートを編集すると URL が消える**。フロントの Task で必ずフォームに含めること
- 駅すぱあとの仕様書で「URL を保存してよいか」の確認（ADR の「実装の前に確かめること」）は、この PR では未確認

## テスト
- `parseRouteInput`: 無し/null/空白、通る URL、不正な形（ftp・javascript・スキームなし・空白入り・非文字列）、2000/2001 文字の境界
- リポジトリ: 保存・読み出し・変更・消去、**version 2 の DB（列なし）に既存ルートを入れてから開いても読める**こと
- ルート API: 登録・編集、PUT で URL を省くと消えること、POST/PUT で不正な URL が 400
- `npm run typecheck` / `lint` / `test` すべて通過（194 件）
