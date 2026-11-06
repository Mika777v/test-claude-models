## 概要
同じ名前のルートが2つあると、出勤を選ぶときに区別できない。`POST /api/routes` で、すでにあるルートと名前が同じなら登録せずに 409 を返す。

Closes #（Task の番号が分からなかったため、push 前に記入してください）

## 変更内容
- `POST /api/routes`: 同じ名前のルートがあれば 409。本文は 400 と同じ形（`error: "入力に誤りがあります"`、`fieldErrors: [{ field: "name", message: "同じ名前のルートがあります" }]`）。ルートは増えない
- `RouteRepository` に `existsByName(userId, name)` を追加（SQLite 実装も）
- 画面: コードの変更なし。フォームはステータスに関係なく `fieldErrors` を欄ごとに振り分けるので、文が「ルート名」の欄の下に出る（`toRouteFormErrors` のテストで確認）
- `docs/api/openapi.yaml`（POST に 409）・`docs/troubleshooting.md`（メッセージの行・ステータス表の 409）を同じ PR で更新

## 自分で決めたこと
- **名前の比較は完全一致、同じユーザーの中だけ。** 大文字小文字・全角半角は同一視しない。前後の空白は、バリデーション（`text`）で取り除かれた後の値で比べる
- **DB の一意制約（UNIQUE インデックス）は付けない。** スキーマの変更になり、すでに同名のルートがある DB ではマイグレーションが失敗するため。API の受け口での確認だけにした。同時に2つ登録されると、理屈の上ではすり抜ける（個人利用なので許容）
- **編集（`PUT /api/routes/:id`）では調べない。** Task は登録だけを対象にしている。このため、編集で既存ルートと同名にはできてしまう。必要なら別の Task にする
- すでにある同名のルートは、そのまま残す（消さない・変えない）
- 409 の `error` の文は、400 と同じ「入力に誤りがあります」にした（「今のエラーと同じ形」に合わせた）

## 確認が必要な項目
- **業務の決まりを足している**（「同じ名前のルートは登録できない」）ため、自動マージを予約せず、オーナーの確認を待つ。上の「自分で決めたこと」（特に編集で調べないこと・UNIQUE を付けないこと）の確認をお願いします
- ADR・DB のスキーマ変更は無し

## 動作確認の方法
- `npm run typecheck && npm run lint && npm run test`（実行済み。すべて通過）
- 画面: ルートを登録し、同じ名前でもう一度登録 → 「ルート名」の欄の下に「同じ名前のルートがあります」が出て、一覧が増えない。名前を変えると登録できる
- API: `curl -i -X POST localhost:3000/api/routes -H 'Content-Type: application/json' -d '{"name":"自宅↔本社","from":"A駅","to":"B駅","transport":"train","oneWayFare":220}'` を2回 → 2回目が 409

## チェックリスト
- [x] テストを追加・更新した（ロジックを変えた場合）
- [x] 要件定義（docs/requirements.md）と食い違っていない（要件定義は変更していない。同名を禁止する決まりは要件に未記載なので、確認をお願いします）
- [x] 秘密情報・個人情報を含んでいない

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01MePBtj8ENLUnmtk2ci95iN
