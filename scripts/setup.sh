#!/usr/bin/env bash
# Nighthawk Superpowers v2 — post-install setup
# Syncs workspace .md files and creates user-profile.json if missing.
set -euo pipefail

OPENCLAW_STATE="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLE_DIR="$SCRIPT_DIR/../bundle"

echo "Nighthawk Superpowers v2 — workspace setup"
echo "State dir: $OPENCLAW_STATE"
echo ""

AGENTS=(zuzu fitness-coach productivity-agent finance-agent creative-agent learning-agent sysadmin-agent social-agent home-agent)

for agent in "${AGENTS[@]}"; do
  src="$BUNDLE_DIR/agents/$agent/workspace"
  dst="$OPENCLAW_STATE/agents/$agent/workspace"
  mkdir -p "$dst"
  if [ -d "$src" ]; then
    find "$src" -maxdepth 1 -name "*.md" | while read -r f; do
      cp "$f" "$dst/"
    done
    echo "  ✓ $agent"
  fi
done

# Create user-profile.json only if it doesn't exist (never overwrite — it holds live data)
PROFILE_DST="$OPENCLAW_STATE/agents/zuzu/workspace/user-profile.json"
PROFILE_SRC="$BUNDLE_DIR/agents/zuzu/workspace/user-profile.example.json"
if [ ! -f "$PROFILE_DST" ]; then
  cp "$PROFILE_SRC" "$PROFILE_DST"
  echo ""
  echo "  ✓ user-profile.json created at $PROFILE_DST"
  echo "    Fill in the REPLACE_* values (Discord channel IDs, etc.) before first use."
else
  echo ""
  echo "  ✓ user-profile.json already exists — skipped"
fi

echo ""
echo "Done. To update your openclaw.json agent list, run:"
echo "  npm run plugin:apply-config"
