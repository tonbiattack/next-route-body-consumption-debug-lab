#!/usr/bin/env bash
set -euo pipefail

project_root="${1:-.}"
cd "$project_root"

required_files=(
  package.json
  tsconfig.json
  next-env.d.ts
  README.md
  SUMMARY.md
  DESIGN.md
  coverage-matrix.md
  fundamentals/README.md
  fundamentals/01-route-body-consumption.md
  docs/debugging-record.md
  docs/reference-notes.md
)

for required_file in "${required_files[@]}"; do
  if [[ ! -s "$required_file" ]]; then
    echo "必要な教材ファイルがありません: $required_file" >&2
    exit 1
  fi
done

git diff --check
npm run typecheck
npm test
npm run build

echo "Next.js Route Handler教材の基本検証に成功しました。"
