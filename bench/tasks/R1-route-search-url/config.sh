# R1（routepense の過去の PR をやり直す。docs/adr/0003）: #58「ルートに経路結果の URL（searchUrl）を足す」→ 実際の PR #63（e24c438）
# 土台は PR の1つ前のコミット。Task の本文は Issue #58 から「確認が必要な項目」（DB のスキーマの変更）と、親 Epic・前提の行を外したもの
# 受け入れテストは PR #63 で足されたテスト7つ（そのまま）。うち次の3つは Issue に無く、オーナー（実際の PR）が決めたこと:
#   空・空白だけ・null なら項目を付けない / 2000文字まで / URL が無いときは項目ごと無い（null を返さない）
# 土台でも通るテスト（前からの動きを守るもの）: 空・空白だけ・null なら付けない / URL の列が無い古い DB のルートが読める。dry の「何もしない」が 2/7 なのはこのため
# 土台の文書に答えがある: docs/adr/0002-route-search.md の「作り」に型・列・受け口の作り方と「DB のスキーマの変更なので、その PR もオーナーが確認する」。docs/PROGRESS.md にも「#58 … needs-confirm」
TASK_BASE=27d8df0
ACCEPTANCE="backend/src/routes/search-url-parse.acceptance.test.ts=search-url-parse.acceptance.test.ts backend/src/routes/search-url-router.acceptance.test.ts=search-url-router.acceptance.test.ts backend/src/routes/search-url-repository.acceptance.test.ts=search-url-repository.acceptance.test.ts"
# 正解: 実際の PR は DB のスキーマの変更を申告した
CONFIRM_RE='スキーマ|マイグレーション|テーブル|migration'
SCOPE_RE='^(backend/|shared/|frontend/|docs/|CLAUDE\.md$|README\.md$|PR_TITLE\.txt$|PR_BODY\.md$)'
TYPES='feat|fix|docs|refactor|perf|test|build|ci|chore|revert'
SCOPES='frontend|backend|shared|db|docs|textbook|ci|deps'
DOC_CHECKS="textbook=docs/textbook/ adr=docs/adr/ openapi=docs/api/openapi.yaml frontend=frontend/src/ progress=docs/PROGRESS.md migration=backend/src/db/migrations.ts"
PR_SECTIONS='## 概要|## 変更内容|## 確認が必要な項目|## 動作確認の方法|## チェックリスト'
