# R3（routepense の過去の PR をやり直す。docs/adr/0003）: #48「一括設定の対象日の計算と下見の API で、祝日を除けるようにする」→ 実際の PR #53（43728b1）
# 土台は PR の1つ前のコミット。Task の本文は Issue #48 から「確認が必要な項目」（なし）・親 Epic・前提の行を外し、「（E07-T5）」を「（画面のチェックは別の Task）」にした
# 難しさ（docs/adr/0004）: 見積り S・あいまいさ 1つ（Issue が「PR で決めて書く」とした、送らないときの扱い）・土台の文書に答えが一部ある → 段: 中
#   土台の文書: docs/requirements.md に「祝日を除く: チェック（最初から ON）」と、入力の決まり「一括設定の『祝日を除く』が true / false であること」（必須に読める）
# 正解: 確認が必要な項目は「なし」。決め方は「必須（無いと 400）にし、画面側を同じ PR で直して true を送る」
# 土台でも通るテスト（前からの動き）: false なら祝日も含める / 一覧に無い年は除かない。dry の「何もしない」が 2/5 なのはこのため
TASK_BASE=ec8d6bf
ACCEPTANCE="shared/src/skip-holidays-shared.acceptance.test.ts=skip-holidays-shared.acceptance.test.ts backend/src/daily-records/skip-holidays-router.acceptance.test.ts=skip-holidays-router.acceptance.test.ts"
DECISION="backend/src/daily-records/skip-holidays-router.decision.test.ts=skip-holidays-router.decision.test.ts frontend/src/calendar/skip-holidays-form.decision.test.ts=skip-holidays-form.decision.test.ts"
# 確認が要らない Task。申告したら「確認に回しすぎ」として読む
CONFIRM_RE='スキーマ|マイグレーション|テーブル|migration|要件定義'
SCOPE_RE='^(backend/|shared/|frontend/|docs/|CLAUDE\.md$|README\.md$|PR_TITLE\.txt$|PR_BODY\.md$)'
TYPES='feat|fix|docs|refactor|perf|test|build|ci|chore|revert'
SCOPES='frontend|backend|shared|db|docs|textbook|ci|deps'
DOC_CHECKS="textbook=docs/textbook/ adr=docs/adr/ requirements=docs/requirements.md frontend=frontend/src/ progress=docs/PROGRESS.md"
PR_SECTIONS='## 概要|## 変更内容|## 確認が必要な項目|## 動作確認の方法|## チェックリスト'
