---
name: web-search
description: Search the web using Exa for research, articles, and content retrieval. Use for current information not in memory.
---

# Web search (Exa)

## Search

```bash
exa search "<query>" --num-results 5 --text
```

## Retrieve full article content

```bash
exa contents "<url>"
```

## Rules

- Prefer specific queries (5–8 words) over broad ones
- Always summarize results before passing upstream — never paste raw Exa output
- For YouTube URLs: use the YouTube transcripts plugin instead
- Cite the source URL in summaries
- Use `memory_search` first — avoid redundant searches for the same query
