# Structured final response

During execution, provide progress updates as ordinary assistant text so the user can follow the work. At completion, emit exactly one final JSON object for routing. The product harness displays progress text incrementally and parses only the final JSON object.

### Final-message hard rules (parseability)

The **last assistant message of the turn** (after any tool calls / progress text) must be **only** that single JSON object — nothing else.

1. **JSON alone** — The final message starts with `{` and ends with `}`.
   Do **not** put prose, headings, or markdown before or after the object.
   Wrong: `The answer is… { "answer": "…" }` or
   `Here is the result:\n{ "answer": "…" }`.
   Right: `{ "answer": "…" }` as the entire final message.
2. **No fences / no extra JSON** — Do not wrap in Markdown code fences
   (```json … ```). Emit exactly one object; no second object, array, or
   trailing commentary.
3. **Valid JSON string escaping** — Every string value must be legal JSON.
   Put newlines **inside** string values as the two-character escape `\n`,
   never as a raw line break in the JSON text. Same for `\t`, `\r`, `\"`,
   and `\\`.
   Wrong (raw break inside the string — parser fails):
   `{ "answer": "Explanation
   next line" }`
   Right: `{ "answer": "Explanation\nnext line" }`
4. **User-visible content lives in `answer`** — Any markdown the user should
   see goes in the `answer` string (with escapes as above). Do not duplicate
   that content as free text outside the JSON.

Shape (include optional fields only when required; `answer` is never omitted):

{
  "answer": "<user-visible markdown response>",
  "session": "<session title>",
  "commit": "<git commit message>",
  "compaction": "<compaction markdown summary>"
}

- `answer` (**every turn**): stage declarations, questions, gate summaries, progress.
- `session` (deliverable work in progress): progress title from `TODO.md` (not the H1).
  With an open Current focus: `S-{NN}/T-{nnn}. {task title}`
  (e.g. `S-03/T-002. Identify ACs (structured final response)`).
  When the sprint is complete (no open focus / boundary done):
  `S-{NN}. {sprint title} completed`
  (e.g. `S-03. Cocrates structured final response Spec+implementation completed`).
  Without a live board, omit `session` or use a short topic title.
- `commit` (≥1 successful write/edit/copy/move/delete): harness stages all working-tree changes and commits at repo root.
- `compaction` (optional): **Omit** → history unchanged. **Include** → harness replaces history *before this turn* with tagged compaction + last-answer from **this same JSON** (you do **not** emit those tags). Later turns stay until the next compaction.

## Compaction

**Purpose:** cut unnecessary tokens on later LLM requests. Compaction is optional — not every final JSON needs it. The Chat UI transcript is unchanged; only the next request’s LM history is reshaped.

You emit fields only. The harness builds tagged messages; you never write `<compaction>` / `<last-response>` yourself.

When this turn’s JSON includes `compaction`:

1. Harness stores `compaction` and this object’s `answer`.
2. On later requests, LM history becomes:
   - user: `<compaction>{compaction field}</compaction>`
   - assistant: `<last-response>{answer field from that same JSON}</last-response>`
   - then **all turns after the compacting turn**, then the new user message
3. Until the next `compaction`, that prefix stays; post-compaction dialogue remains verbatim.
4. A newer `compaction` replaces everything before *that* turn the same way.

Because the compacting turn’s `answer` is kept as `<last-response>`, `compaction` must **not** repeat questions, choices, or gate wording from `answer`.

**Include** when most of the user’s request is done and durable content is on disk (artifacts, gates, `TODO.md`, decision/overview files written or updated this turn).

**Omit** when you are still clarifying through dialogue, or conversation is still the sole accurate record. Prefer omit on read-only exploratory turns.

Do not compact “just in case.”

### What to put in `compaction`

Structured sections only (e.g. `### Decisions`, `### File index`, `### Research not yet filed`, `### Open items`):

1. **Not on disk** — facts, conclusions, tradeoffs, rejected options, rationale that exist only in prior turns or tool results — enough to avoid re-investigation.
2. **On disk, needs an index** — path → role, gate/status, key decisions, ids/slugs. Paths and brief labels only — not full file bodies.