# PROGRESS — 進み具合（セッションの引き継ぎ）

> **目的**: 会話をまたいで作業を続けるための引き継ぎのメモ。新しいセッションは `AGENTS.md` の次にこれを読んで続きを始める。
> **いつ読むか**: セッションの最初。**いつ書くか**: セッションを終える前と、区切りの報告のとき。
> **書き方**: 古くなった内容は消す（履歴は git にある）。PR・Issue はリンクで書く。測定の結果そのものは `bench/results/` の README に、決めた理由は `docs/adr/` に書き、ここにはリンクだけ置く。

- 最終更新: 2026-11-06

## ステップ

| # | ステップ | 状態 | 主な PR |
|---|---|---|---|
| 0 | 検証用のリポジトリの立ち上げ（道具の移行・テンプレート・評価の方針・CI） | 終わった | [#1](https://github.com/Mika777v/test-claude-models/pull/1)・[#2](https://github.com/Mika777v/test-claude-models/pull/2)・[#3](https://github.com/Mika777v/test-claude-models/pull/3)・[#4](https://github.com/Mika777v/test-claude-models/pull/4) |

## これまでの測定（テンプレートのリポジトリで行ったもの）

結果の表はテンプレートの `README.md`「ルールの効果（測った結果）」、決めたいことごとのまとめは [`EVALUATION.md`](EVALUATION.md) §1。

| 測定 | 状態 | 結果 | 要点 |
|---|---|---|---|
| T0〜T3（ルールあり・なし・案内なし、影響度、モデル） | 終わった | テンプレートの README | 正しさは変わらない。ルールで作業は約2倍。得られるのは人のための成果物（申告・形・文書） |
| T4（仕様の曖昧な Task）・`none` 条件 | 終わった | [results/2026-11-06-T4](../bench/results/2026-11-06-T4/README.md) | スキーマと要件定義を変えた回の申告は、ルールあり 5/5・なし 0/6。`none` では ADR 0/6 |
| T2（続きの Task） | 終わった | [results/2026-11-06-T2](../bench/results/2026-11-06-T2/README.md) | 続きの AI は前の作業が残した物を真似る。正しさ 18/18、費用は約1.06倍 |
| T4 を要件の段階（Opus・Sonnet）→ Sonnet で実装 | 終わった | [results/2026-11-06-T4-spec](../bench/results/2026-11-06-T4-spec/README.md) | 揺れは消え、境目がオーナーへの質問（8〜12 個）になる。費用は Sonnet だけの約3.2倍（要件も Sonnet なら Opus の約8割） |
| T5（②業務の決まりだけがあいまい） | 終わった | [results/2026-11-06-T5](../bench/results/2026-11-06-T5/README.md) | 12/12 が②に気づき落とし穴も避けた。要件の段階が無いとルールがあっても確認に回さない（0/3） |
| T5 + 確認の項目に「業務の決まり」（`template-biz`。[#6](https://github.com/Mika777v/test-claude-models/issues/6)） | 終わった | [results/2026-11-06-T5-biz](../bench/results/2026-11-06-T5-biz/README.md) | 確認に回すのが 0/3 → 3/3、要件定義に書くのも 0/3 → 2/3。費用は $0.22 → $0.26。作る物（編集は対象外）は変わらず、問いとして渡した |
| R1（過去の PR #63 をやり直す。[#11](https://github.com/Mika777v/test-claude-models/issues/11)） | 終わった | [results/2026-11-06-R1](../bench/results/2026-11-06-R1/README.md) | 9回とも実際とほぼ同じ物（正しさ 9/9・決め方 8/9）。確認の申告は bare でも 3/3（土台の ADR に書いてあった）。差は形だけ。教科書は CLAUDE.md にあっても 0/3。土台の ADR に作り方まで書いてあり、易しすぎた |
| R2・R3（過去の PR #84・#53。ADR-0004 の指標） | 終わった | [results/2026-11-06-R2-R3](../bench/results/2026-11-06-R2-R3/README.md) | 正しさ 18/18・決め方は条件で差なし・確認に回しすぎ 0/18。template だけが「確認が必要な項目: なし」と書き、形もそろえた（費用は 2〜3割高い）。節を書かない回の申告の点しだいで R2 の Y の順位が入れ替わる |

## 次にやること

1. **オーナーが決めること**（R2・R3 の結果から）
   - ~~申告の点（確認が要らない Task で節を書かなかった回）~~ → 0.5（[ADR-0006](adr/0006-declare-point-when-no-section.md)）
   - 次の測定: R1〜R3 はどれも土台の文書に答えがあり易しかった。ルールの差を見るには、土台に答えの無い判断が多い Task が要る（作った Task のほうが向く）
   - 道具: 採点の JSON 出力・トークンの内訳・Q と Y の計算・差分の大きさの比を足した（`bench/summarize.mjs`。ADR-0004 の「影響」）。トークンの内訳と差分の比は、次に動かす回から入る
   - B（要件定義から一から作る）は、1つの Epic（ルートの管理）で `template` を1回だけ動かして費用を見てから決める
2. 残りの候補（どれもオーナーが「動かして」と言うまで `run` しない。`EVALUATION.md` §6 の流れで、まず Issue に「決めたいこと」を書く）
   - T2 の発展: 続きの AI もルールありの条件（from-template をルールありで続ける）と比べる
   - T4 を Opus でも動かす
   - 担当ごとにモデルを変える運用の残り: 確認が必要な PR を Opus がレビューする段階
   - 「オーナーの答え」のファイルを渡して、要件の段階でオーナーが答える場面を測る
   - テンプレートに足した ADR のルールで、AI が実際に ADR を書くか（T3 を土台 `d4d15fd` で動かす。T4 では Haiku・template が書いた）

## 開いている PR・待っていること

- なし（テンプレート側の [#10](https://github.com/Mika777v/ai-driven-dev-template/pull/10)・[#11](https://github.com/Mika777v/ai-driven-dev-template/pull/11)（業務の決まりを確認の項目に）もマージ済み）

## 作業場所の作り方

- ベンチの作業と結果の置き場所は `BENCH_OUT`（既定 `${TMPDIR:-/tmp}/agent-bench`）。マシンが替わると消えるので、新しいマシンでは `bash bench/run.sh prepare` からやり直す
- クラウドのセッションの中から `run` すると、ベンチの AI の PR の本文に、そのセッションの URL が入る（[results/2026-11-06-T5-biz](../bench/results/2026-11-06-T5-biz/README.md)）
- 土台を変えるときは `BENCH_BASE`（T0〜T3・T2 は `41ac314`、T4・T5 は `d4d15fd`、R* は config.sh の `TASK_BASE`）と `BENCH_OUT` を分ける（[ADR-0002](adr/0002-bench-base-and-conditions.md)）

## 会話で決めたこと（ほかの文書に無いもの）

- PR は下書き（draft）にしない（下書きは自動マージを予約できないため）。「確認が必要な項目」に当たらない PR は、作ったら自動マージを予約する。当たる PR は予約せずオーナーを待つ（2026-11-06 オーナー）
- routepense の Issue は、このセッションの権限では読めない（取り込みを止められた）。`gh api -X GET search/issues -f q='repo:Mika777v/routepense is:issue'` の検索で本文を読める

## リポジトリの設定

- 2026-11-06 にオーナーが Codespaces で `REPO=Mika777v/test-claude-models bash scripts/github/setup-repo.sh --codespace` を実行し、最後まで通った（[#9](https://github.com/Mika777v/test-claude-models/pull/9)）。`main` は PR 必須・必須チェック `ci-ok`・force push と削除の禁止・マージは squash と merge・自動マージあり。設定を変えるときはスクリプトを直して実行し直す

## 既知の問題・警告

- `bench/score.sh` は、色を出す環境（GitHub Actions・`FORCE_COLOR`）で受け入れテストの通過を 0 件と数えていた。[#4](https://github.com/Mika777v/test-claude-models/pull/4) で直した（保存してある 42 回は 0 件の回が無く、影響なし）

採点（`bench/score.sh`）の直しどころ。直すまでは、自動の値を読んで確かめる。

- `diff_hides_in_selection`（T4）: 「カレンダーの画面を変えたか」だけで見ているので、API の既定で除く作りを見落とす
- `typecheck_ok=0`（T4 の Sonnet・template）: 原因が未確認
- `leftover_files`（T2）: 決定の記録の「200 文字から 100 文字に」も数えるので、直し漏れと見分けない
- `SCOPE_RE`（T2）: ルートの `README.md` が入っていない
