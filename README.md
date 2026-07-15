# Learn Anything 🎓

Turn any topic into a **real lesson** — not a summary. Free, open-source, **zero extra credits**.

One [MCP](https://modelcontextprotocol.io) server for Claude & ChatGPT.

## What a lesson contains

- **Where this sits** — what it is, why it's worth knowing, and the **prerequisites** (with the one you're most likely missing flagged)
- **Intuition** — the core idea in plain language, plus an analogy that maps *structurally* — and the exact point where the analogy **stops being true**
- **Worked example** — one concrete case with real values, every step shown (including the one it'd be tempting to call obvious)
- **The precise version** — the formal account, mapped line-by-line back to the intuition
- **What people get wrong** — real misconceptions: what people believe → why it's tempting → why it's wrong → what's true
- **Check yourself** — questions escalating *recognize → apply → transfer*, with worked answers, plus an "explain it back" task
- **Make it stick** — a 1 day / 1 week / 1 month spaced-repetition plan and what to learn next

## Why it's actually good

Two rules make the difference:

- **Simplify the wording, never the substance.** A beginner lesson must leave you with a *smaller true model*, never a false one.
- **Flag every simplification where it's made**, and name the truer version — so you always know where the map ends.

Plus: it teaches *your* topic verbatim (not an adjacent easier one), and invents nothing — no fabricated
facts, papers, names, or numbers.

## How it's free

The server runs **no AI**. It returns a master-teacher **protocol** as plain text; your own
Claude/ChatGPT executes it in the same turn. No API key, no second bill.

## Use it

```
Learn Anything: how do transformers work?
Learn Anything, beginner: Bayes' theorem
Learn Anything, advanced, I know linear algebra: diffusion models
```

Knobs: `level` (beginner/intermediate/advanced) · `background` (what you already know) · `focus`

## Deploy your own (free)

```powershell
npm install
npx wrangler deploy      # prints your live URL
```
Your connector URL is that address **+ `/mcp`**.

## Connect it
- **Claude** (any plan): Settings → Connectors → Add custom connector → paste the `/mcp` URL
- **ChatGPT** (Plus+, desktop web): Settings → Connectors → Advanced → Developer mode → add the `/mcp` URL, Auth **None**

## License
MIT © 2026 Pranay Mahendrakar — free to use, modify, and share.
