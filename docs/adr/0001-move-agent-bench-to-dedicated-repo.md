# ADR-0001: agent-bench をテンプレートから分け、このリポジトリの bench/ に履歴ごと置く

- 状態: 決定
- 日付: 2026-11-06
- 関係する Issue・PR: [#1](https://github.com/Mika777v/test-claude-models/pull/1)

## 背景

agent-bench（運用ルールの効果を AI に実装させて測る道具と結果）は、ai-driven-dev-template のブランチ `bench/agent-bench` の `tools/agent-bench/` にあった。
routepense 専用で、結果（`results/`）も増え続けるため、テンプレートの main には入れていなかった。
測り方の方針（`docs/EVALUATION.md`）を決め、測定を続けていくには、ブランチではなく、Issue・PR・CI を持てる置き場所が要る。

## 選択肢

| 案 | 内容 | 良い点 | 気になる点 |
|---|---|---|---|
| A | テンプレートのブランチ `bench/agent-bench` のまま続ける | 移す手間が無い | main に入らないので、PR・CI・Issue の流れに乗らない。テンプレートを使う人に関係ない物が混ざる |
| B | 専用のリポジトリにファイルだけコピーする | 簡単 | なぜその Task・採点にしたかを、コミットの履歴から追えなくなる |
| C | 専用のリポジトリに `git subtree split` / `subtree add` で履歴ごと移す | 18 コミットの履歴（作者・日付・理由）が残る | 取り込みの PR を squash するとその履歴が潰れる |

置き場所は `bench/`（ルートには既に README.md があり、`tools/agent-bench/` は専用のリポジトリでは深すぎる）。

## 決定

C。このリポジトリの `bench/` に、`git subtree add`（`--squash` なし）で取り込む。取り込み元はブランチ `bench/agent-bench` の `27b324e`。

## 理由

Task・採点・条件を「なぜそうしたか」はコミットのメッセージに残っていて、測り方を変えるときの根拠になる。手間の差は小さい。

## 影響

- `bench/` の中のパスは `tools/agent-bench/` から `bench/` に変えた
- テンプレートの `bench/agent-bench` は、これ以降は更新しない（正本はこのリポジトリ）。テンプレートに反映したい結果は、テンプレートへの PR として出す
- `bench/` を取り込み直す・テンプレートへ戻す PR は、「Create a merge commit」でマージする（squash すると履歴が潰れる）
