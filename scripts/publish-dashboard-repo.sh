#!/usr/bin/env bash
# Copy this dashboard into Joanuser/2027_internship_dashboard and push main.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${DEST:-$HOME/2027_internship_dashboard}"
REMOTE="https://github.com/Joanuser/2027_internship_dashboard.git"

if [ ! -d "$DEST/.git" ]; then
  git clone "$REMOTE" "$DEST"
fi

cd "$DEST"
origin="$(git remote get-url origin)"
case "$origin" in
  *2027_internship_dashboard*) ;;
  *)
    echo "停下來：${DEST} 不是 2027_internship_dashboard（origin 是 ${origin}）"
    exit 1
    ;;
esac

git fetch origin
if git show-ref --verify --quiet refs/remotes/origin/main; then
  git checkout main
  git pull --ff-only origin main
elif ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git checkout -b main
fi

rm -rf src public internships .github
mkdir -p src public internships .github/workflows
cp -R "$ROOT/dashboard/src/." src/
cp "$ROOT/dashboard/index.html" index.html
cp "$ROOT/dashboard/public/internships.json" public/internships.json
cp "$ROOT/internships/aggregate.py" internships/aggregate.py
cp "$ROOT/internships/test_aggregate.py" internships/test_aggregate.py
cp "$ROOT/tsconfig.json" tsconfig.json
cp "$ROOT/.gitignore" .gitignore
cp "$ROOT/package-lock.json" package-lock.json

python3 - << 'PY'
from pathlib import Path
path = Path("internships/aggregate.py")
path.write_text(path.read_text().replace(
    'OUT_PATH = ROOT / "dashboard" / "public" / "internships.json"',
    'OUT_PATH = ROOT / "public" / "internships.json"',
))
PY

cat > package.json << 'EOF'
{
  "name": "2027-internship-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.4"
  },
  "devDependencies": {
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@vitejs/plugin-react": "^5.1.0",
    "typescript": "^5.9.3",
    "vite": "^7.1.12"
  }
}
EOF

cat > vite.config.ts << 'EOF'
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5175 },
});
EOF

cat > .github/workflows/internships.yml << 'EOF'
name: Refresh internship dashboard

on:
  workflow_dispatch:
  schedule:
    # Minute 0 is when GitHub drops scheduled jobs. 6:17 Detroit always
    # rebuilds. 8:17 rebuilds only if today's list is not already there.
    - cron: "17 6 * * *"
      timezone: "America/Detroit"
    - cron: "17 8 * * *"
      timezone: "America/Detroit"

permissions:
  contents: write

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Rebuild unless this morning already succeeded
        id: gate
        env:
          EVENT_NAME: ${{ github.event_name }}
          SCHEDULE: ${{ github.event.schedule }}
          LIST_FILE: public/internships.json
        run: |
          if [ "$EVENT_NAME" = "workflow_dispatch" ]; then
            echo "manual run"
            echo "run=true" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          # 6:17 always rebuilds. An empty or unexpected schedule also rebuilds,
          # so a delayed trigger is not skipped.
          if [ "$SCHEDULE" != "17 8 * * *" ]; then
            echo "schedule '${SCHEDULE}' rebuilds the list"
            echo "run=true" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          generated=""
          if [ -f "$LIST_FILE" ]; then
            generated=$(sed -n 's/.*"generatedAt": "\([^"]*\)".*/\1/p' "$LIST_FILE" | head -n 1)
          fi
          today=$(TZ=America/Detroit date +%F)
          echo "8:17 catch-up; generatedAt='${generated}'; Detroit today=${today}"
          case "$generated" in
            "$today"*) echo "run=false" >> "$GITHUB_OUTPUT" ;;
            *) echo "run=true" >> "$GITHUB_OUTPUT" ;;
          esac
      - uses: actions/setup-python@v5
        if: steps.gate.outputs.run == 'true'
        with:
          python-version: "3.12"
      - run: python3 internships/aggregate.py
        if: steps.gate.outputs.run == 'true'
      - name: Commit the list
        if: steps.gate.outputs.run == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add public/internships.json
          if git diff --staged --quiet; then
            echo "No listing changes"
            exit 0
          fi
          git commit -m "Refresh internship listings"
          git push origin HEAD:main || {
            git fetch origin main
            git rebase origin/main
            git push origin HEAD:main
          }
EOF

cat > README.md << 'EOF'
# 2027 Internship Dashboard

獨立的實習 Dashboard。

```bash
npm install
npm run dev
```

打開 Vite 印出的網址，預設是 http://localhost:5175/

清單在每天早上 6:17（America/Detroit）重建。若那一班沒有寫進今天的清單，同一天 8:17 會再補一次。這要等這個檔案在 `main` 上才會開始。
EOF

if ! git config user.name >/dev/null; then
  git config user.name "Joanuser"
fi
if ! git config user.email >/dev/null; then
  git config user.email "Joanuser@users.noreply.github.com"
fi

git add -A
if git diff --staged --quiet; then
  echo "沒有新的變更。"
else
  git commit -m "Add the internship dashboard"
fi
git push -u origin HEAD:main
echo "已推上 https://github.com/Joanuser/2027_internship_dashboard"
