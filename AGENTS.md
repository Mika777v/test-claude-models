# AGENTS.md — test-claude-models で作業する AI エージェントへの指示

> **目的**: どの AI エージェント（Claude Code・GitHub Copilot・Cursor・Gemini など）にも共通する、このリポジトリでの作業のルールの**正本**。ツールごとの設定ファイル（`CLAUDE.md` など）は、このファイルを読むよう指すだけにする。
> **いつ読むか**: 毎回のセッションの最初（多くのツールは自動で読み込む）。ルールに迷ったとき。
> **元**: [ai-driven-dev-template](https://github.com/Mika777v/ai-driven-dev-template) の `AGENTS.md`。このリポジトリに無い文書（`docs/AI_*.md`・errnav）への案内は外し、要点をここに書いた。

---

## 0. このファイルの読み方

- ここには「必ず守ること」の要点だけを置く。詳しいことは下の表の文書にある
- **ファイル全体を読み込まず、いまの作業に要る箇所だけを読む**（`bench/results/` の `.jsonl`・`.diff` は大きい。`grep`・`jq`・行範囲で読む）

| 知りたいこと | 読むもの |
|---|---|
| 検証したいこと・仮説 | [`README.md`](README.md) |
| 測り方の方針（決めたいこと・指標・回数） | [`docs/EVALUATION.md`](docs/EVALUATION.md) |
| ベンチの道具の使い方・Task・採点の項目 | [`bench/README.md`](bench/README.md) |
| これまでの測定の結果 | `bench/results/<日付>-<Task>/README.md` |
| いまの進み具合・次にやること | [`docs/PROGRESS.md`](docs/PROGRESS.md) |
| 過去の設計判断 | [`docs/adr/`](docs/adr/README.md) |

## 1. プロジェクトの要約（3行）

- **何**: AI エージェントの運用ルール（ai-driven-dev-template）やモデルの使い分けの効果を、同じ Task を AI（Claude Code）に実装させて測るベンチマーク（`bench/`）と、その結果
- **誰のため**: オーナー（ai-driven-dev-template の作者）。どのルールを入れるか・どのモデルをどこに使うかを、データで決めるため
- **いまの段階**: 立ち上げ（ai-driven-dev-template の `bench/agent-bench` から道具と結果を移している）

## 2. やりとり

- 説明は **日本語** で書く。専門用語は初めて出たときに一言で説明する
- **確かめたことと、確かめられなかったことを分けて報告する。** 推測で「動きます」と言わない。結果の読みは「3回中2回」のように数で書く
- 決めるのがオーナーのこと（測る目的・Task の正解・お金や利用枠を使うこと・テンプレートへの反映）は、選択肢とおすすめを示して聞く。聞くときは、答えだけで次に進めるように書く
- **AI を動かすベンチ（`bench/run.sh run`）は、オーナーが「動かして」と言うまで実行しない。** 利用枠を使うため。`prepare`・`dry`・`report` と `score.sh` は AI を動かさないので実行してよい

## 3. 必ず守ること（要点）

1. **1つの作業 = 1ブランチ = 1 PR。** 最新の `main` からブランチを切る。ツールやセッションがブランチを指定しているときはそれに従う
2. **PR のタイトルは Conventional Commits**（`feat(bench): 内容`。scope は `bench`・`docs`・`ci` など）。本文は `.github/pull_request_template.md` の見出しに沿う
3. **force push しない。** push 済みの履歴を書き換えない。マージ済みの PR の続きは新しいブランチで別の PR にする。`main` の取り込みは rebase ではなく merge
4. **「確認が必要な項目」に当てはまる PR は、自動マージせずオーナーに確認する。** 待つのはその PR だけで、依存しない作業は進める。当てはまるもの: ADR・評価の方針（`docs/EVALUATION.md`）・Task / 受け入れテスト / 採点の基準・運用ルール / CI・利用枠やお金を使うこと・テンプレートへの反映
5. **PR を出す前に、手元で `bash scripts/check.sh` を通す。** CI が落ちたら原因を直す。受け入れテストや採点を弱めることで通さない
6. **秘密情報（API キー・トークン）をコミットしない。** `bench/results/` に AI のやりとり（`.jsonl`）を入れる前に、キーやトークンが含まれていないか確かめる
7. **やらないこと（スコープ外）に手を広げない。** 対象のリポジトリ（routepense）やテンプレートを直接直さない。直すべき点が見つかったら、結果の README と PR の本文に書いてオーナーに渡す
8. **区切りで止まって報告する。** 区切りの単位: 測定1つ（`docs/EVALUATION.md` の「1つの測定の流れ」の 1〜6）
9. **セッションを終える前に `docs/PROGRESS.md` を更新する。** 会話の中で決めたことは会話の外（docs）に残す。後から変えにくいこと（測り方・採点の基準・Task の作り方）を決めたら ADR を書く

## 4. コマンド

必要なもの: git・jq・Node.js 22・Claude Code の CLI（`run` のときだけ、ログイン済み）。

| 用途 | コマンド |
|---|---|
| 対象のリポジトリの取得・依存の導入（1回だけ） | `bash bench/run.sh prepare` |
| AI を動かさずに確かめる（受け入れテストが落ちること・正解の実装で通ること） | `bash bench/run.sh dry` |
| PR 前の確認（構文・shellcheck・Task のそろい・パッチの形。数秒） | `bash scripts/check.sh` |
| 加えて、すべての Task の dry（ベンチの道具・Task を変えたとき。初回は数分） | `CHECK_DRY=1 bash scripts/check.sh` |
| 1つの Task だけ dry（土台は自動で選ぶ） | `bash scripts/dry-all.sh <ID>` |
| 結果の表 | `bash bench/run.sh report` |
| **AI を動かして測る（オーナーの指示があるときだけ）** | `BENCH_MODEL=<モデル> bash bench/run.sh run` |

- 確認のコマンドは、まとめて1回で実行する
- 出力は必要な行だけを見る（`grep`・`tail`・行範囲の指定）

## 5. ディレクトリ

```
README.md        検証したいこと・仮説
AGENTS.md        このファイル（CLAUDE.md はこれを読み込むだけ）
bench/           ベンチマークの道具（元は ai-driven-dev-template の tools/agent-bench/）
  run.sh           prepare / dry / run / report
  score.sh         1回の作業場所を採点する
  tasks/<ID>/      Task の本文・隠した受け入れテスト・正解の例・採点の設定
  fixtures/        条件ごとに差し替える CLAUDE.md など
  results/         測定ごとの結果と読み比べ（README）
docs/
  EVALUATION.md    測り方の方針
  PROGRESS.md      進み具合・次にやること
  adr/             設計判断の記録
scripts/check.sh   PR 前の確認（CI の ci.yml と同じ）
scripts/dry-all.sh すべての Task の dry と判定（CI の bench-dry.yml と同じ）
```

## 6. 気をつけること（過去につまずいた点）

<!-- つまずいたら1行ずつ足す。「何をすると・どうなる・どうする」の形で書く -->
- 自動の採点（`score.sh`）の判定はよく外れる（「なし（スキーマは変えていない）」を申告と数える・直し漏れを見分けない など）。結果は自動の値だけで書かず、PR の本文と差分を読んで確かめる
- `run` は利用枠の上限で途中で止まることがある。`run.sh` は止まった回を残さないので、もう一度 `run` すれば済んだ回を飛ばして続きから動く
- `bench/` の履歴は subtree で取り込んだ。テンプレート側と行き来するときは `git subtree` を使い、取り込みの PR は「Create a merge commit」でマージする（squash すると履歴が潰れる）
