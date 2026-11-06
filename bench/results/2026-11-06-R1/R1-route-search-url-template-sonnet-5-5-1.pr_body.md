## 概要
ADR-0002 に沿って、ルートに任意の経路結果の URL（`searchUrl`）を持たせる。型・DB・リポジトリ・API の受け口までで、画面と経路検索の呼び出しは含まない。

Closes #58

## 変更内容
- `shared`: `Route` に `searchUrl?: string` を追加（`RouteSnapshot` には入れない。金額の計算に使わないため）
- DB: マイグレーション v3 `ALTER TABLE routes ADD COLUMN search_url TEXT`（NULL 可）。既存の行は NULL のままなので、そのまま読める
- リポジトリ: 登録・編集・読み出しで `search_url` を扱う。NULL のときは項目ごと省く（`searchUrl: undefined` を持たせない）
- 受け口: `optionalUrl`（`validation/fields.ts`）を追加。`http://` か `https://` で始まり、`new URL` で読め、2000文字以内。無い・null・空白だけは「URL なし」
- テスト: 受け口の判定、リポジトリ（保存・消去・v2 の DB で作った既存行が読める）、ルーターの登録・編集

## 自分で決めたこと
- 長さの上限は **2000文字**（経路結果の URL は長くなりがちで、ほかの文字の項目の100文字では足りないため）。`javascript:` など別の種類は通さない
- 編集（PUT）で `searchUrl` を送らなければ URL は消える（PUT は全項目を置き換える、今の仕様に合わせた）
- 画面（ルートのフォーム）は触っていない。`RouteInput` の `searchUrl` は任意なので、既存の画面はそのまま動く
- 教科書の更新は、画面と経路検索のインターフェースの Task（依存性の注入の章）でまとめて行う想定で、この PR では見送った

## 確認が必要な項目
- **DB のスキーマの変更**（マイグレーション v3）のため、自動マージは予約せず、オーナーの確認を待つ

## 動作確認の方法
- `npm run typecheck && npm run lint && npm run test`（すべて通過を確認済み）
- 手元で `POST /api/routes` に `searchUrl: "https://example.com/r"` を付けて登録 → 一覧に出る。`"example.com"` なら 400（`fieldErrors` に `searchUrl`）

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [ ] 教科書（docs/textbook/）の関連する章を書いた・更新した（上のとおり後続の Task で）
- [x] 要件定義（docs/requirements.md）と食い違っていない
- [x] 秘密情報・個人情報を含んでいない

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
