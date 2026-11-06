#!/usr/bin/env bash
# PR の前にまとめて流す確認。手元でも CI（.github/workflows/ci.yml）でも同じものを使う。
# AI は動かさない（bench/run.sh run は呼ばない）。どれかが失敗したら終了コード 1。
#
# 使い方:
#   bash scripts/check.sh              # 構文の確認だけ（数秒。ネットワーク不要）
#   CHECK_DRY=1 bash scripts/check.sh  # 加えて、すべての Task の dry（scripts/dry-all.sh。初回は数分）
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

fail=0
step() { echo "==> $*"; }
ng() { echo "::error::$*"; fail=1; }

step "シェルの構文（bash -n）"
while IFS= read -r f; do
  bash -n "$f" || ng "構文の誤り: $f"
done < <(git ls-files '*.sh')

step "shellcheck"
if command -v shellcheck >/dev/null; then
  shellcheck -S warning bench/run.sh bench/score.sh scripts/*.sh scripts/github/*.sh || ng "shellcheck の指摘があります"
  # config.sh は run.sh・score.sh が読み込んで使う変数を並べるだけなので、「使っていない変数」（SC2034）は除く
  shellcheck -s bash -S warning -e SC2034 bench/tasks/*/config.sh || ng "shellcheck の指摘があります（config.sh）"
else
  echo "  shellcheck が無いため飛ばします（CI では動きます）"
fi

step "Task のそろい（task.md・config.sh・acceptance/）"
for d in bench/tasks/*/; do
  t=$(basename "$d")
  [ -s "$d/task.md" ] || ng "$t: task.md がありません"
  [ -s "$d/config.sh" ] || ng "$t: config.sh がありません"
  compgen -G "$d/acceptance/*.test.ts" >/dev/null || ng "$t: acceptance/ に受け入れテストがありません"
done

step "パッチの形（git apply --stat。当てはしない）"
while IFS= read -r p; do
  git apply --stat "$p" >/dev/null 2>&1 || ng "パッチとして読めません: $p"
done < <(git ls-files 'bench/tasks/*.patch' 'bench/tasks/*.diff')

step "markdown の差し替え漏れ（{{...}}）"
if grep -rnE '\{\{[A-Z0-9_]+\}\}' . --exclude-dir=.git --exclude-dir=node_modules; then
  ng "テンプレートの {{...}} が残っています"
fi

if [ "${CHECK_DRY:-0}" = 1 ]; then
  step "dry（AI は動かさない）"
  bash scripts/dry-all.sh || ng "dry の結果が期待と違います"
fi

if [ "$fail" -eq 0 ]; then echo "done"; else echo "失敗した確認があります"; fi
exit "$fail"
