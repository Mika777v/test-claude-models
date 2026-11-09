## 概要

ルートの一覧に「自宅↔本社」が2つあり、出勤を選ぶときにどちらか分からなくなった。
同じ名前のルートは登録できないようにした。

- `POST /api/routes` で、すでにあるルートと名前が同じなら登録せず **409** を返す。本文は今の 400 と同じ形（`error` と `fieldErrors`。`field` は `"name"`、文は「同じ名前のルートがあります」）
- 画面の登録フォームは、API の `fieldErrors` をルート名の欄の下に出す仕組みが既にあるので、画面のコードは変えていない（テストで確かめた）
- 判定の決まりと選択肢は ADR-0004（`docs/adr/0004-route-name-uniqueness.md`）

Closes #（Task の番号: GitHub に接続できなかったため未確認。付けてください）

## 変更内容

- `backend/src/routes/route-repository.ts`・`sqlite-route-repository.ts`: `existsByName(userId, name)` を足す（同じ名前のルートがあるか）
- `backend/src/routes/route-router.ts`: `POST /api/routes` で、入力の検証の後に `existsByName` を見て、あれば 409
- テスト
  - `route-router.test.ts`: 409 の本文、ルートが増えないこと、前後の空白・大文字小文字の扱い、名前が違えば 201、名前の欄の誤りは 400 のまま
  - `sqlite-route-repository.test.ts`: `existsByName` がユーザーごとに働くこと、削除したら名前が使えること
  - `frontend/src/routes/route-form.test.ts`: 409 の文がルート名の欄に振り分けられること
- `docs/api/openapi.yaml`: `POST /api/routes` に 409（`Conflict` の応答）を足す。操作（メソッド＋パス）は変わらないので、一致のテストはそのまま通る
- `docs/troubleshooting.md`: API のステータスの表に 409、画面に出るメッセージの表に「同じ名前のルートがあります」を足す（`CLAUDE.md`「git の運用」10）
- `docs/adr/0004-route-name-uniqueness.md`・`docs/adr/README.md`: ADR-0004 を追加（提案）
- `docs/PROGRESS.md`: 最終更新と、この作業の行を足す

変えていないこと: 一覧・編集（PUT）・削除・出勤の保存、DB のスキーマ、要件定義（`docs/requirements.md`）。

## 確認が必要な項目

自動マージを予約していない。次の2つに当てはまるため、オーナーの確認を待つ。

1. **ADR の追加**（ADR-0004）: 判定を API に置き、DB の UNIQUE 制約は使わない、という決めの記録。選択肢と理由は ADR 本文
2. **業務の決まりを足す**: 「同じ名前のルートは登録できない」は、何ができて何ができないかの決まり。`docs/requirements.md` の F1 にはまだ書いていない（要件定義は直していない）。書くかどうかはオーナーが決める

オーナーに決めてほしいこと（この PR では決めていない）

- **編集（PUT）で、同じ名前に変えられる抜け道がある。** 今回は「編集の動きは変えない」の受け入れ条件に従って直していない。直すなら、`existsByName` に「自分以外」の条件を足す（ADR-0004「見直すとき」）
- **DB の UNIQUE 制約を足すかどうか。** 同時の登録に強くなるが、スキーマの変更（確認が要る）と、既存の DB の重なりの確認が要る。今の構成（1つのプロセス・同期の処理）では、判定と登録の間に隙は無い

## 自分で決めたこと

- 名前の比べ方は、前後の空白を除いたあとの**完全一致**（大文字小文字は区別。全角と半角は別の名前）。既存の検証（`text()`）が空白を除くので、それに合わせた
- 判定は**登録（POST）だけ**。編集は今回は変えない（上の「オーナーに決めてほしいこと」）
- 順番は、入力の検証（400）→ 同じ名前（409）。名前が空なら 400 になり、409 は返らない
- 409 の本文の `error` は、400 と同じ「入力に誤りがあります」にした（画面の出し方を揃えるため）
- 409 の判定は `parseRouteInput` の中ではなく、ルーターに置いた（DB を見るのはリポジトリの役目。検証は入力の形だけを見る）

## 動作確認の方法

1. `npm run dev` で backend と frontend を起動し、`http://localhost:5173` を開く
2. 「ルートを登録」で「自宅↔本社」を登録する（出発地・到着地・運賃は適当でよい）
3. もう一度、同じ名前「自宅↔本社」で登録する
   - 登録されず、ルート名の欄の下に赤い文「同じ名前のルートがあります」が出る
   - 右の一覧に「自宅↔本社」は1つのまま
4. 名前を「自宅↔客先A」に変えて登録すると、今までどおり登録できる
5. API で確かめるなら、同じ名前を2回 `POST` する（2回目は 409、本文の `fieldErrors` に `name`）

```bash
curl -s -X POST http://localhost:3000/api/routes -H 'Content-Type: application/json' \
  -d '{"name":"自宅↔本社","from":"A駅","to":"B駅","transport":"train","oneWayFare":220}'
```

## チェックリスト

- [x] テストを追加・更新した（ロジックを変えた場合）
- [x] 要件定義（docs/requirements.md）と食い違っていない（要件定義には書かれていない決まりを、この PR で足している。上の「確認が必要な項目」2を参照）
- [x] 秘密情報・個人情報を含んでいない

検証: `npm run typecheck && npm run lint && npm run test` が通る（テスト 258 件。変更前は 250 件で、追加は 8 件）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
