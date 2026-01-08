# astro-llm

Deterministic, build-time content extraction for Astro sites, designed for Large Language Model (LLM) usage.

`astro-llm` generates a single, clean, **static context file** from your built HTML — suitable for:
- Retrieval-Augmented Generation (RAG)
- Chat grounding
- Offline LLM training
- Search indexing
- Auditable documentation snapshots

No runtime JavaScript.  
No servers.  
No magic.

---

## Core Principles

- **Build-time only** – runs after `astro build`
- **Deterministic output** – same input, same output
- **Config-first** – behaviour controlled by `llm.config.json`
- **Safety by default** – sensitive data stripped
- **LLM-friendly** – readable, predictable structure

---

## What This Plugin Does

After your site is built:

1. Scans generated `.html` files in `/dist`
2. Extracts readable content in DOM order
3. Applies safety rules (email / phone / scripts)
4. Applies include/exclude rules
5. Writes a single output file (e.g. `llm.txt` or `llm.json`)

---

## What This Plugin Does NOT Do

- ❌ No runtime DOM mutation
- ❌ No network requests
- ❌ No environment variables
- ❌ No telemetry or analytics
- ❌ No automatic crawling or discovery

Everything is explicit.

---

## First Run Behaviour

On first run (dev or build), `astro-llm` will:

- Create `llm.config.json` in the project root
- Populate it with explicit defaults
- Never overwrite it again

If the file already exists, it is left untouched.

---

## Configuration (`llm.config.json`)

This file is the **single source of truth**.

```json
{
  "enabled": true,
  "output": {
    "format": "txt",
    "filename": "llm.txt"
  },
  "include": {
    "pages": true,
    "headings": true,
    "paragraphs": true,
    "lists": true,
    "tables": true,
    "codeBlocks": true,
    "meta": {
      "title": true,
      "description": true,
      "keywords": true
    }
  },
  "exclude": {
    "paths": [],
    "selectors": []
  },
  "safety": {
    "stripEmails": true,
    "stripPhoneNumbers": true,
    "stripForms": true,
    "stripScripts": true
  },
  "purpose": {
    "llmTraining": true,
    "ragIndexing": true,
    "chatGrounding": true
  }
}
```

---

## Output Format

### TXT (default)

```text
---
PATH: /index.html
---
Page title
Section heading
Paragraph content here
[email removed]
```

### JSON

```json
{
  "documents": [
    {
      "path": "/index.html",
      "content": "..."
    }
  ]
}
```

---

## Safety Rules

When enabled, the plugin removes:

- Email addresses → `[email removed]`
- Phone numbers → `[phone removed]`
- `<script>`, `<style>`, `<form>` blocks
- Inline JavaScript content

Already-encoded entities are preserved.

---

## Exclusions

### Path exclusions

```json
"exclude": {
  "paths": ["/admin", "/api"]
}
```

### Selector exclusions

```json
"exclude": {
  "selectors": [".llm-ignore", "#internal"]
}
```

---

## Determinism Guarantee

Given:
- Same HTML output
- Same config
- Same plugin version

You will always get **identical output**.

---

## Recommended Use Cases

- RAG pipelines
- Static knowledge bases
- LLM prompt grounding
- Offline semantic indexing
- Compliance-safe extraction

---

## License

MIT © Velohost
