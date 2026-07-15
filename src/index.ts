/**
 * Learn Anything — a free, open MCP server that turns any topic into a
 * genuinely world-class lesson, adapted to the learner's level.
 * Zero extra API credits.
 *
 * Architecture (same as the rest of this family):
 *   The server runs NO AI. It returns a master-teacher *protocol* as text; the
 *   user's own Claude/ChatGPT executes it. Free forever, works on both hosts.
 *
 * Endpoints:  GET / (landing) · POST /mcp (Streamable HTTP) · /sse (legacy)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

interface Env {
  MCP_OBJECT: DurableObjectNamespace;
}

function protocolFor(level: string): string {
  return `Act as a world-class teacher of this subject: real depth, no jargon for its own sake. Teach the TOPIC below to a ${level} learner as one self-contained lesson. Add signal, never padding.

ARC — prereqs → intuition + analogy → worked example → precise version → misconceptions → recall → what next. Intuition lands before formalism, always.
LEVEL — beginner: assume only everyday knowledge and define every term you use. intermediate: assume the field's basics; spend the depth on mechanism and why. advanced: assume fluency; go to derivations, edge cases, failure modes, and where the standard account is contested or open.
PREREQS — name the 2–4 ideas this rests on. Give each a one-line definition so the lesson stands alone, and flag the one most likely to be the learner's actual gap.
INTUITION — one analogy that maps structurally, not superficially. State which part of the mapping is faithful and which part breaks.
WORKED EXAMPLE — one concrete case with real values, every step shown, including the step you'd be tempted to call obvious.
PRECISE VERSION — the formal definition / statement / mechanism, tied back line-by-line to the intuition so the learner sees they are the same object.
MISCONCEPTIONS — 2–3 errors learners actually make: what they believe, why it's tempting, why it's wrong, what's true instead.
RECALL — questions escalate: recognize → apply → transfer to an unseen case. Answers worked, not just stated.
HONESTY — mark each simplification where you make it and name the truer version. Every fact, name, date, and number must be one you're confident is real; where you're unsure, say so plainly.
DEPTH — simplify the explanation, never the content: a beginner lesson is one a beginner can follow to a true idea.`;
}

const GUARDRAILS = `GUARDRAILS
• Teach the user's topic verbatim as given — not an adjacent, easier, or more familiar topic.
• Invent nothing: no fabricated facts, papers, names, dates, or numbers. Say you're unsure instead of guessing, and cite only sources you can vouch for.
• Make the analogy map structurally, and name the exact point where it stops being true.
• Simplify the wording, not the substance — leave the learner with a smaller true model, never a false one.
• Flag every simplification at the point you make it and name the truer version.
• Give correct, self-contained answers to every practice question.
• Keep it dense: structure and signal, no filler, no restating the question back.`;

function outputShape(topic: string): string {
  return `Reply in EXACTLY this shape:
**🧭 Where this sits** — what it is in one line, why it's worth knowing, and the prereqs (mark the likely gap)
**💡 Intuition** — the core idea in plain language, then the analogy and exactly where it breaks
**🔧 Worked example** — one concrete case, every step
**📐 The precise version** — the formal account, mapped back to the intuition
**⚠️ What people get wrong** — belief → why it's tempting → why it's wrong → what's true
**🧪 Check yourself** — 3–4 questions easy→hard with worked answers, then: "Explain ${topic} back in your own words to a smart friend — where do you stall?"
**🔁 Make it stick** — review at 1 day / 1 week / 1 month with what to re-test each time, then the 2–3 things to learn next, in order`;
}

function buildLesson(topic: string, level: string, background?: string, focus?: string): string {
  const extras: string[] = [];
  if (background) extras.push(`LEARNER BACKGROUND — they already know: ${background}. Tune the prereq diagnosis and pick the analogy's source domain from this.`);
  if (focus) extras.push(`FOCUS — centre the lesson on: ${focus}.`);
  const extraBlock = extras.length ? extras.join("\n") + "\n\n" : "";

  return `🎓 LEARN ANYTHING — build the lesson, then teach it.

${protocolFor(level)}

${extraBlock}${GUARDRAILS}

${outputShape(topic)}

TOPIC
<<<
${topic}
>>>`;
}

export class LearnAnything extends McpAgent {
  server = new McpServer({ name: "Learn Anything", version: "1.0.0" });

  async init() {
    this.server.registerTool(
      "curriculum",
      {
        title: "Learn anything — a real lesson",
        description:
          "Turn any topic into a world-class self-contained lesson: prerequisites, intuition and a structurally-honest analogy, a fully worked example, the precise/formal version, the misconceptions people actually have, practice questions with worked answers, and a spaced-repetition plan. Use when the user wants to learn, understand, or be taught something, or says 'Learn Anything'.",
        inputSchema: {
          topic: z.string().min(1).describe("What to learn, e.g. 'how transformers work', 'Bayes' theorem', 'options pricing'."),
          level: z.enum(["beginner", "intermediate", "advanced"]).optional().describe("Learner level. Default intermediate."),
          background: z.string().optional().describe("What the learner already knows or their field — tunes prereqs and the analogy."),
          focus: z.string().optional().describe("Narrow the lesson to a specific aspect."),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ topic, level, background, focus }) => ({
        content: [{ type: "text", text: buildLesson(topic, level ?? "intermediate", background, focus) }],
      }),
    );

    // Claude-only slash-command convenience.
    this.server.registerPrompt(
      "learn_anything",
      {
        title: "Learn Anything",
        description: "Turn any topic into a world-class lesson.",
        argsSchema: { topic: z.string().describe("What do you want to learn?") },
      },
      ({ topic }) => ({
        messages: [{ role: "user", content: { type: "text", text: buildLesson(topic, "intermediate") } }],
      }),
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") return LearnAnything.serve("/mcp").fetch(request, env, ctx);
    if (url.pathname === "/sse" || url.pathname === "/sse/message") return LearnAnything.serveSSE("/sse").fetch(request, env, ctx);
    if (url.pathname === "/") {
      return new Response(landingPage(url.origin), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response("Not found", { status: 404 });
  },
};

function landingPage(origin: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Learn Anything — live</title>
<style>body{font-family:system-ui,sans-serif;max-width:44rem;margin:3rem auto;padding:0 1rem;line-height:1.6}
code{background:#f2f2f2;padding:.15rem .35rem;border-radius:.25rem}.ok{color:#0a7d28;font-weight:600}</style></head>
<body>
<h1>Learn Anything <span class="ok">✔ live</span></h1>
<p>A free <strong>Model Context Protocol</strong> server that turns any topic into a real lesson —
prerequisites, intuition, a worked example, the precise version, the misconceptions people actually have,
practice with answers, and a spaced-repetition plan. Uses the AI you're already in, at zero extra cost.</p>
<p>Add it to Claude or ChatGPT with this URL:</p>
<p><code>${origin}/mcp</code></p>
<p>Then ask: <strong>"Learn Anything: how do transformers work?"</strong></p>
</body></html>`;
}
