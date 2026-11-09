## 概要

転勤で使わなくなったルートが増え、ルートの一覧と出勤の選択肢がごちゃごちゃしてきたため、ルートを「片付ける」（アーカイブ）機能を足す。

- 片付けたルートは、ルートの一覧と出勤の選択肢（日の編集パネル・追加の移動の選択）に出ず、新しい記録には使えない
- 過去の記録は、作った時点の値をそのまま持つので変わらない（U7）
- 片付けたルートは、ルート画面の「片付けたルート」の一覧から「戻す」で使うように戻せる
- 削除は今のまま残す（削除は元に戻せない。経路の URL も消える）

Closes #<Task の番号>
<!-- Task の番号が分からないため、オーナーが入れてください -->

## 変更内容
- shared: `Route` に `archived?: boolean`（片付けた時だけ付く。使っているルートには項目が無い）。`RouteInput` からは外した（片付けは別の API で行う）
- DB: マイグレーション 4 で `routes.archived_at`（TEXT・NULL 可）を足す。既存のルートは NULL（使っている）のまま読める
- backend:
  - `RouteRepository` に `listArchived`・`setArchived` を足す。`list` は使っているルートだけを返すように変えた
  - `GET /api/routes?archived=true` で片付けたルートの一覧。`GET /api/routes` は使っているルートだけ
  - `PUT /api/routes/{id}/archived`（本文 `{ "archived": true | false }`）を追加。不正な本文は 400、無いルートは 404
  - `resolveWorkStyle` で、片付けたルートを新しい記録に使うと弾く（「選んだルートが見つかりません」と同じ文）
- frontend:
  - `routes-api.ts` に `listArchivedRoutes`・`setRouteArchived` を足す
  - `RouteTicket`: 「片付ける」（または片付けた一覧では「戻す」）。片付けたルートには「編集」を出さない（戻してから編集する）
  - `RoutesPage`: 使っているルートの下に「片付けたルート」の一覧を出す。片付けるときは確認を出す（削除と同じ作り）
- docs:
  - `docs/requirements.md`: F1 に片付けの決まり、§5 に `archived`、決定の記録に U11
  - `docs/adr/0004-route-archive.md`（新規）と ADR の一覧
  - `docs/api/openapi.yaml`: 新しい API と `archived` の項目。`openapi.test.ts` の数を 15 → 16 に直した
  - `docs/troubleshooting.md`: 「選んだルートが見つかりません」の説明を直し、「片付けたルートが選択肢に出ない」の行を足した（画面のメッセージに関わるため）
  - `docs/PROGRESS.md`: 進み具合と、次にやること

## 確認が必要な項目
- **DB のスキーマ**: `routes` に `archived_at` の列を足すマイグレーション 4（`backend/src/db/migrations.ts`）
- **要件定義**: `docs/requirements.md` の F1（片付けの決まり）・§5（`archived`）・決定の記録 U11。「何ができて何ができないか」（片付けたルートは新しい記録に使えない、削除は残す）を足した
- **ADR**: `docs/adr/0004-route-archive.md`（片付け（アーカイブ）にして、削除は残す。選択肢と理由）。提案として書いた

上の3つを含むので、自動マージは予約していない。オーナーの確認後にマージしてほしい。

## 自分で決めたこと
- **削除は残した**: 既に削除はあり、取り消せないため。「片付ける」は別の操作にした（ADR-0004）
- **片付けたルートは `archived` の項目の有無で表す**: 既存の `searchUrl` と同じ作り。DB の NULL は項目ごと無くす
- **片付けたルートの編集は、画面では出さない**: 戻してから編集する流れにした。API 上は編集できるまま
- **既存の記録が片付けたルートを指していても、表示はそのまま**: 日の編集パネルは、今の記録の出勤を選択肢の先頭に残す（既存の動作）。選び直さない限り、保存は起きない
- **戻すときは確認を出さない**: 戻すのは取り消せる操作のため
- **片付けたルートの並びは、作った順のまま**（一覧と同じ並び順）

## 動作確認の方法
1. `npm install` のあと `npm run dev` で起動し、「ルート」の画面を開く
2. 適当なルートの「片付ける」→ 確認で OK → そのルートが一覧から消え、下の「片付けたルート」に出る
3. 月次画面で、日の編集パネルを開く → 出勤の選択肢に、片付けたルートが出ない
4. 「片付けたルート」の「戻す」→ 一覧と選択肢に戻る
5. API で確かめるなら: `curl -X PUT localhost:3000/api/routes/<id>/archived -H 'Content-Type: application/json' -d '{"archived":true}'` のあと `curl localhost:3000/api/routes?archived=true`

※ この PR を作った環境ではブラウザでの動作確認はしていない。`npm run typecheck && npm run lint && npm run test`（263 件）は通した。

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [x] 要件定義（docs/requirements.md）と食い違っていない（F1・§5・U11 を足した）
- [x] 秘密情報・個人情報を含んでいない

🤖 Generated with [Claude Code](https://claude.com/claude-code)
