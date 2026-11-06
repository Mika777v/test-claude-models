# R2（routepense の過去の PR をやり直す。docs/adr/0003）: #78「月の記録から CSV の文字列を作る純粋関数とテスト」→ 実際の PR #84（bf7906b）
# 土台は PR の1つ前のコミット。Task の本文は Issue #78 から親 Epic・前提の行を外し、「名前と形」の節を足した（docs/adr/0005。テストが使う名前を、実際の PR から写した）
# 難しさ（docs/adr/0004）: 見積り（Issue に無し。実際の差分は 377行・5ファイル）・あいまいさ 2つ（並べる順と元の配列を変えないこと・最後の行の CRLF）・
#   土台の文書に作り方がある（docs/requirements.md の F7 に列・文字コード・改行・エスケープ・ファイル名、U10 に置き場所）→ 段: 易
# 正解: 確認が必要な項目は「なし」（要件定義は前の PR #80 で決まっている）
TASK_BASE=281a17c
ACCEPTANCE="shared/src/month-csv.acceptance.test.ts=month-csv.acceptance.test.ts"
DECISION="shared/src/month-csv.decision.test.ts=month-csv.decision.test.ts"
# 確認が要らない Task。申告したら「確認に回しすぎ」として読む
CONFIRM_RE='スキーマ|マイグレーション|テーブル|migration|要件定義'
SCOPE_RE='^(backend/|shared/|frontend/|docs/|CLAUDE\.md$|README\.md$|PR_TITLE\.txt$|PR_BODY\.md$)'
TYPES='feat|fix|docs|refactor|perf|test|build|ci|chore|revert'
SCOPES='frontend|backend|shared|db|docs|textbook|ci|deps'
DOC_CHECKS="textbook=docs/textbook/ adr=docs/adr/ requirements=docs/requirements.md frontend=frontend/src/ progress=docs/PROGRESS.md"
PR_SECTIONS='## 概要|## 変更内容|## 確認が必要な項目|## 動作確認の方法|## チェックリスト'
