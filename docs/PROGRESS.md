# PROGRESS — 進み具合（セッションの引き継ぎ）

> **目的**: 会話をまたいで作業を続けるための引き継ぎのメモ。新しいセッションは `AGENTS.md` の次にこれを読んで続きを始める。
> **いつ読むか**: セッションの最初。**いつ書くか**: セッションを終える前と、区切りの報告のとき。
> **書き方**: 古くなった内容は消す（履歴は git にある）。PR・Issue はリンクで書く。

- 最終更新: 2026-11-06

## ステップ

| # | ステップ | 状態 | 主な PR |
|---|---|---|---|
| 0 | 検証用のリポジトリの立ち上げ（道具の移行・テンプレート・評価の方針・CI） | 進行中 | |

## 次にやること

1. agent-bench を履歴ごと `bench/` に移す（[#1](https://github.com/Mika777v/test-claude-models/pull/1)。「Create a merge commit」でマージする）
2. テンプレート（AGENTS.md・PR テンプレート・docs/adr・この PROGRESS.md）を入れる
3. `EVALUATION-draft.md` を `docs/EVALUATION.md` に、`HANDOFF.md` を この PROGRESS.md と ADR に分ける
4. CI（構文と dry。AI は動かさない）

## 開いている PR・待っていること

- なし

## 会話で決めたこと（ほかの文書に無いもの）

- AI を動かすベンチ（`bench/run.sh run`）は、オーナーが言うまで実行しない（2026-11-06。利用枠を使うため。AGENTS.md §2 にも書いた）

## 既知の問題・警告

- なし
