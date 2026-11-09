#!/usr/bin/env node
// 結果の表（results.tsv）から、ADR-0004 の指標（関門・Q・成功1回あたりのコスト・Y）を条件ごとに計算する。
//
// 使い方:
//   node bench/summarize.mjs <results.tsv>... [--declare <declare.tsv>] [--decision <decision.tsv>] [--spec <spec-usage.tsv>]...
//                            [--weights 0.4,0.4,0.2] [--docs touched_textbook] [--json <出力.json>]
//   node bench/summarize.mjs <results.tsv> --init-declare <declare.tsv>   # 申告の点を書き込む表の雛形を作る
//
// - 条件のまとまり: run の名前の最後の「-<回>」を外したもの（例: R2-month-csv-template-sonnet-5-5）
// - 関門: accept_passed = accept_total（> 0）・typecheck_ok = 1・lint_ok = 1
// - Q = 重み[0] × 決め方 ＋ 重み[1] × 申告 ＋ 重み[2] × 形・文書（成功した回の平均）
//   - 決め方: decision_passed / decision_total。列が無い Task は --decision の表（run<TAB>点。0〜1。オーナーの答えと同じに
//     決めた割合を人が付ける）を使う。どちらも無ければ「-」にして、残りの重みで割り直す
//   - 申告: --declare の表（run<TAB>点。点は 1 / 0.5 / 0）。PR の本文を人が読んで付ける（自動の pr_confirm_declared は使わない。
//     AGENTS.md §6）。点の無い回があれば「?」にして、残りの重みで割り直す
//   - 形・文書: branch_ok・commits_conventional・pr_title_ok・pr_sections_ok と、--docs に挙げた列のできた割合
// - 成功1回あたりのコスト = 1回の平均 ÷ 成功率。ドルと入力トークン（入力 + キャッシュの作成 + 読み出し）の2つ
//   --spec に要件の段階の表（spec-usage.tsv: run・spec_tokens・spec_cost_usd）を渡すと、その回の費用とトークンに足す
// - results.tsv・--spec は、いくつでも並べてよい（測定をまたいで1つの表にする）
// - Y = Q ÷ 成功1回あたりのドル、Y_tok = Q ÷ 成功1回あたりの入力トークン（100万あたり）
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
// オプションの値として使った引数を除いた残りが results.tsv
const valued = new Set(["--declare", "--decision", "--spec", "--weights", "--docs", "--json", "--init-declare"]);
const files = args.filter((a, i) => !a.startsWith("--") && !valued.has(args[i - 1]));
const optAll = (name) => args.flatMap((a, i) => (args[i - 1] === name ? [a] : []));
const file = files[0];
if (!file) {
  console.error("使い方: node bench/summarize.mjs <results.tsv> [--declare <declare.tsv>] [--weights 0.4,0.4,0.2] [--docs 列,列] [--json <出力>]");
  process.exit(2);
}

function readTsv(path) {
  const [head, ...lines] = readFileSync(path, "utf8").split("\n").filter((l) => l.trim() !== "");
  const keys = head.split("\t");
  return lines.map((line) => Object.fromEntries(line.split("\t").map((v, i) => [keys[i], v])));
}
const num = (v) => (v === undefined || v === "" ? undefined : Number(v));
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined);
const groupOf = (run) => run.replace(/-\d+$/, "");

const rows = files.flatMap(readTsv);
// 要件の段階の費用とトークン（実装の回と同じ run の名前）
const spec = new Map();
for (const p of optAll("--spec")) for (const r of readTsv(p)) spec.set(r.run, r);

const initPath = opt("--init-declare");
if (initPath) {
  // 雛形: 点は空。参考に自動の pr_confirm_declared と pr_sections_ok を並べる（人が PR の本文を読んで点を書く）
  const out = ["run\tpoint\tauto_pr_confirm_declared\tpr_sections_ok"];
  for (const r of rows) out.push([r.run, "", r.pr_confirm_declared ?? "", r.pr_sections_ok ?? ""].join("\t"));
  writeFileSync(initPath, out.join("\n") + "\n");
  console.log(`雛形を作りました: ${initPath}（point の列に 1 / 0.5 / 0 を書く。ADR-0004 の「申告」）`);
  process.exit(0);
}

const weights = opt("--weights", "0.4,0.4,0.2").split(",").map(Number);
if (weights.length !== 3 || weights.some((w) => !(w >= 0))) {
  console.error("--weights は「決め方,申告,形」の3つの数（例: 0.4,0.4,0.2）");
  process.exit(2);
}
const docCols = (opt("--docs", "") || "").split(",").filter(Boolean);
const pointsOf = (path) => {
  const m = new Map();
  if (path) for (const r of readTsv(path)) if (r.point !== undefined && r.point !== "") m.set(r.run, Number(r.point));
  return m;
};
const declarePath = opt("--declare");
const declare = pointsOf(declarePath);
const decisionManual = pointsOf(opt("--decision"));

const formCols = ["branch_ok", "commits_conventional", "pr_title_ok", "pr_sections_ok", ...docCols];
const passed = (r) => num(r.accept_total) > 0 && r.accept_passed === r.accept_total && r.typecheck_ok === "1" && r.lint_ok === "1";
const inputTokens = (r) =>
  (r.tokens_in !== undefined && r.tokens_in !== ""
    ? num(r.tokens_in) + (num(r.tokens_cache_write) ?? 0) + (num(r.tokens_cache_read) ?? 0)
    : num(r.tokens)) + // 内訳の無い古い表は、合計（出力も含む）で代える
  (num(spec.get(r.run)?.spec_tokens) ?? 0);
const costOf = (r) => (num(r.cost_usd) === undefined ? undefined : num(r.cost_usd) + (num(spec.get(r.run)?.spec_cost_usd) ?? 0));
const decisionOf = (r) => (num(r.decision_total) > 0 ? num(r.decision_passed) / num(r.decision_total) : decisionManual.get(r.run));

const groups = new Map();
for (const r of rows) {
  const g = groupOf(r.run);
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(r);
}

const summary = [];
for (const [name, rs] of groups) {
  const ok = rs.filter(passed);
  const rate = ok.length / rs.length;
  const decision = ok.length && ok.every((r) => decisionOf(r) !== undefined) ? mean(ok.map(decisionOf)) : undefined;
  const declared = ok.length && ok.every((r) => declare.has(r.run)) ? mean(ok.map((r) => declare.get(r.run))) : undefined;
  const form = ok.length ? mean(ok.map((r) => mean(formCols.map((k) => (r[k] === "1" ? 1 : 0))))) : undefined;
  // 無い軸は外して、残りの重みで割り直す
  const parts = [[weights[0], decision], [weights[1], declared], [weights[2], form]].filter(([, v]) => v !== undefined);
  const wsum = parts.reduce((a, [w]) => a + w, 0);
  const q = wsum > 0 ? parts.reduce((a, [w, v]) => a + w * v, 0) / wsum : undefined;
  const cost = mean(rs.map(costOf).filter((v) => v !== undefined));
  const tok = mean(rs.map(inputTokens).filter((v) => v !== undefined));
  const costPerSuccess = rate > 0 && cost !== undefined ? cost / rate : undefined;
  const tokPerSuccess = rate > 0 && tok !== undefined ? tok / rate : undefined;
  const ratio = mean(rs.map((r) => num(r.diff_ratio)).filter((v) => v !== undefined));
  summary.push({
    group: name,
    runs: rs.length,
    with_spec: rs.some((r) => spec.has(r.run)),
    success: ok.length,
    decision,
    declare: declared,
    form,
    q,
    q_complete: decision !== undefined && declared !== undefined && form !== undefined,
    cost_usd: cost,
    cost_per_success_usd: costPerSuccess,
    input_tokens: tok,
    input_tokens_per_success: tokPerSuccess,
    y: q !== undefined && costPerSuccess ? q / costPerSuccess : rate === 0 ? 0 : undefined,
    y_tok: q !== undefined && tokPerSuccess ? q / (tokPerSuccess / 1e6) : rate === 0 ? 0 : undefined,
    diff_ratio: ratio,
  });
}

const f = (v, d = 2) => (v === undefined ? "-" : Number(v).toFixed(d));
console.log(`重み: 決め方 ${weights[0]}・申告 ${weights[1]}・形・文書 ${weights[2]}（形・文書の列: ${formCols.join(", ")}）`);
if (!declarePath) console.log("申告の点の表（--declare）が無いので、申告は「?」。Q は決め方と形・文書だけで計算した");
console.log("");
console.log("| 条件 | 成功 | 決め方 | 申告 | 形・文書 | Q | $/回 | $/成功 | 入力トークン/成功 | Y | Y_tok | 差分の比 |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const s of summary) {
  const declareCell = s.declare === undefined ? (declarePath ? "?" : "?") : f(s.declare);
  console.log(
    `| ${s.group} | ${s.success}/${s.runs} | ${f(s.decision)} | ${declareCell} | ${f(s.form)} | ${f(s.q)}${s.q_complete ? "" : "*"} | ` +
      `${f(s.cost_usd, 3)} | ${f(s.cost_per_success_usd, 3)} | ${s.input_tokens_per_success === undefined ? "-" : Math.round(s.input_tokens_per_success / 1000) + "k"} | ` +
      `${f(s.y)} | ${f(s.y_tok)} | ${f(s.diff_ratio)} |`,
  );
}
if (spec.size) console.log("\n要件の段階の費用とトークンを足した: " + optAll("--spec").join(", "));
if (summary.some((s) => !s.q_complete)) console.log("\n* は軸が欠けている（「-」か「?」）。残りの重みで割り直した Q");

const jsonPath = opt("--json");
if (jsonPath) {
  writeFileSync(jsonPath, JSON.stringify({ source: files, spec: optAll("--spec"), weights, form_columns: formCols, groups: summary, runs: rows }, null, 2) + "\n");
  console.log(`\nJSON: ${jsonPath}`);
}
