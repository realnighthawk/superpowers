---
name: web-search
description: Search the web using Exa MCP for research, articles, and content retrieval. Use for current information not in memory.
---

# Web search (Exa MCP)

Uses the **Exa MCP server** (`web_search_exa`, `web_fetch_exa`). Do **not** run `exa` CLI via `exec`.

Requires `EXA_API_KEY` on the gateway (OpenClaw `mcp.servers.exa` → `https://mcp.exa.ai/mcp`).

## Search

Call **`web_search_exa`** with a focused query (5–8 words). Prefer `numResults: 5` unless the task needs more.

## Fetch full page

Call **`web_fetch_exa`** with one or more URLs when you need article body text beyond search snippets.

## Rules

- Always summarize results before passing upstream — never paste raw tool output
- For YouTube URLs: use the YouTube transcripts plugin instead
- Cite source URLs in summaries
- Use `memory_search` first — avoid redundant searches for the same query
