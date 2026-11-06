## 概要
ADR-0002 の最初の一歩として、ルートに任意の経路結果の URL（`searchUrl`）を足した（型・DB・リポジトリ・API の受け口）。画面と経路検索のインターフェースは別の Task（#59・#60）。

## 変更内容
- `shared`: `Route` に `searchUrl?: string` を追加。`RouteSnapshot` には入れていない（`Pick` で項目を指定しているので変わらない）。`RouteInput` は `Route` から作られるので自動で追従する
- DB: マイグレーション v3 `ALTER TABLE routes ADD COLUMN search_url TEXT`（NULL 可）。v1・v2 は書き換えていない
- リポジトリ: 登録・編集・読み出しに `search_url` を追加。NULL のルートは `searchUrl` の項目ごと付けない（`null` を API に出さない）。編集で URL を渡さなければ NULL に戻る（フォームで消せる）
- 受け口: `optionalUrl`（`validation/fields.ts`）を追加し `parseRouteInput` で使用
- テスト: 受け口の判定、リポジトリの保存・消去、バージョン2の DB に v3 を適用しても既存のルートが URL なしで読めること、ルートの API

`npm run typecheck && npm run lint && npm run test` は通過（195 tests）。

## 自分で決めたこと
- URL の判定: 前後の空白を取り除いたうえで、`new URL()` で読めて、プロトコルが `http:` / `https:` でホスト名があるものだけ通す。`javascript:` などはリンクにすると危ないので弾く
- 長さの上限: **2000文字**（`MAX_URL`）。ほかの文字の項目の上限は100だが、経路結果の URL は長くなるため別にした。仕様書で実際の長さを確かめたら見直す
- 空文字・空白だけ・`null` は「URL なし」として受け付ける（エラーにしない）。任意項目を消すための入力に使える
- ホスト名を駅すぱあとのものに限定することはしていない。ADR で「URL の欄は手でも直せる」としているため

## 確認が必要な項目
- **DB のスキーマの変更（マイグレーション v3）**: `CLAUDE.md` の運用により、自動マージは予約していない。オーナーの確認をお願いします
- `docs/requirements.md` と `docs/PROGRESS.md` は、要件定義・運用に関わるため、この PR では触っていない

Closes #58

🤖 Generated with [Claude Code](https://claude.ai/code)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
