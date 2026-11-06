#!/usr/bin/env bash
# すべての Task で bench/run.sh dry を流し、結果が期待どおりかを判定する。AI は動かさない。
# run.sh dry は結果を表示するだけなので、ここで次を確かめて、外れたら終了コード 1 にする。
#   - 「何もしない場合」: 正解の実装（reference*.patch）がある Task では、受け入れテストが1つ以上落ちる
#     （正解の実装が無い Task は、あいまいにした点の正解を決めないので、壊していないかだけを見る。判定しない）
#   - 「正解の実装を当てた場合」: 受け入れテストが全部通る
#
# 使い方:
#   bash scripts/dry-all.sh                 # すべての Task
#   bash scripts/dry-all.sh T1-daily-note   # 指定した Task だけ
#
# 必要なもの: git・jq・Node.js 22・ネットワーク（初回は routepense の clone と npm ci で数分かかる）
# 作業場所: DRY_OUT（既定 ${TMPDIR:-/tmp}/agent-bench-dry）の下に、土台ごとに分けて作る。2回目からは prepare を飛ばす
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

OUT_ROOT="${DRY_OUT:-${TMPDIR:-/tmp}/agent-bench-dry}"

# Task ごとの土台（routepense のコミット）。結果の README に書いた土台と合わせる（docs/adr/0002）
base_of() {
  case "$1" in
    T0-*|T1-*|T2-*|T3-*) echo 41ac314 ;;
    T4-*|T5-*)           echo d4d15fd ;;
    R*) sed -n 's/^TASK_BASE=//p' "bench/tasks/$1/config.sh" ;;
    *) return 1 ;;
  esac
}

if [ $# -gt 0 ]; then
  tasks=("$@")
else
  tasks=()
  for d in bench/tasks/*/; do tasks+=("$(basename "$d")"); done
fi

fail=0
for t in "${tasks[@]}"; do
  base=$(base_of "$t") || { echo "::error::$t の土台が決まっていません（scripts/dry-all.sh の base_of に足す）"; fail=1; continue; }
  out="$OUT_ROOT/$base"
  if [ ! -d "$out/base" ]; then
    echo "==> prepare（土台 $base）"
    BENCH_OUT="$out" BENCH_BASE="$base" bash bench/run.sh prepare || { fail=1; continue; }
  fi

  echo "==> dry: $t（土台 $base）"
  accept_log="$OUT_ROOT/$t.accept.log"; mkdir -p "$OUT_ROOT"; : > "$accept_log"
  log=$(BENCH_ACCEPT_LOG="$accept_log" BENCH_OUT="$out" BENCH_BASE="$base" BENCH_TASK="$t" bash bench/run.sh dry 2>&1)
  status=$?
  printf '%s\n' "$log" | sed 's/^/  /'
  if [ "$status" -ne 0 ]; then
    echo "::error::$t の dry が止まりました（終了コード $status）"; fail=1; continue
  fi

  has_ref=0
  compgen -G "bench/tasks/$t/reference*.patch" >/dev/null && has_ref=1

  # 「== 」で始まる見出しごとに、accept_passed と accept_total を比べる
  verdict=$(printf '%s\n' "$log" | awk -v has_ref="$has_ref" '
    function check() {
      if (title == "") return
      if (total == "") { print "NG\t" title "\t受け入れテストの結果がありません"; return }
      if (title ~ /正解の実装/ && passed != total) print "NG\t" title "\t" passed "/" total "（全部通るはず）"
      else if (title ~ /何もしない/ && has_ref == 1 && passed == total) print "NG\t" title "\t" passed "/" total "（落ちるはず）"
      else print "OK\t" title "\t" passed "/" total
    }
    /^== / { check(); title = $0; passed = ""; total = ""; next }
    $1 == "accept_passed" { passed = $2 }
    $1 == "accept_total"  { total = $2 }
    END { check() }
  ')
  printf '%s\n' "$verdict" | sed 's/^/  判定: /'
  if printf '%s\n' "$verdict" | grep -q '^NG'; then
    echo "::error::$t の dry の結果が期待と違います"; fail=1
    echo "  --- 受け入れテストの生の出力（最後の 40 行。$accept_log）"
    tail -n 40 "$accept_log" | sed 's/^/  | /'
  fi
done

[ "$fail" -eq 0 ] && echo "dry: すべて期待どおり" || echo "dry: 期待と違う Task があります"
exit "$fail"
