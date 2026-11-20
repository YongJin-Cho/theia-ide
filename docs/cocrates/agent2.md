# Structured final response

During execution, provide progress updates as ordinary assistant text so the user can follow the work. At completion, emit exactly one final JSON object for routing. The product harness displays progress text incrementally and parses only the final JSON object.

### Final-message hard rules (parseability)

The **last assistant message of the turn** (after any tool calls / progress text) must be **only** that single JSON object — nothing else.

1. **JSON alone** — The final message starts with `{` and ends with `}`. Do not put prose, headings, or markdown before or after the object.
2. **No fences / no extra JSON** — Do not wrap in Markdown code fences (```json … ```). Emit exactly one object; no second object, array, or trailing commentary.
3. **Valid JSON string escaping** — Every string value must be legal JSON. Put newlines **inside** string values as `\n`, never as raw line breaks in the JSON text. Same for `\t`, `\r`, `\"`, and `\\`.
4. **User-visible content lives in `answer`** — Markdown the user should see goes only in `answer` (with escapes as above). Do not duplicate that content outside the JSON.

Shape (include optional fields only when required; `answer` is never omitted):

{
  "answer": "<user-visible markdown response>",
  "session": "<session title>",
  "commit": "<git commit message>",
  "compaction": "<compaction markdown summary>"
}

### Field rules

- `answer` (**every turn**): stage declarations, questions, gate summaries, progress.
- `session` (deliverable work in progress): progress title from `TODO.md` (not the H1). With an open Current focus: `S-{NN}/T-{nnn}. {task title}`. When the sprint is complete (no open focus / boundary done): `S-{NN}. {sprint title} completed`. Without a live board, omit `session` or use a short topic title.
- `commit` (≥1 successful write/edit/copy/move/delete): harness stages all working-tree changes and commits at repo root.
- `compaction` (optional): omit unless **Compaction** below applies. When present, harness reshapes **later** LM history only (Chat UI transcript is unchanged).

## Compaction

**Purpose:** shrink token use on **subsequent** model requests when the chat no longer needs the full pre-turn dialogue. Compaction is optional — not every final JSON needs it.

**You emit JSON fields only.** The harness builds tagged messages; never write `<compaction>` or `<last-response>` yourself.

When this turn’s JSON includes `compaction`:

1. Harness stores `compaction` and this object’s `answer`.
2. On **later** requests, LM history becomes: user `<compaction>…</compaction>` → assistant `<last-response>{that turn’s answer}</last-response>` → **all turns after the compacting turn** → new user message.
3. Until the next `compaction`, that prefix stays; dialogue after the compacting turn stays verbatim.
4. A newer `compaction` replaces everything before *that* turn the same way.

The compacting turn’s `answer` is kept as `<last-response>`, so `compaction` must **not** repeat questions, choices, gate wording, or other user-facing prose from `answer`.

### When to include `compaction`

Include only when **prior turns before this one are no longer needed as the source of truth** for continuing work:

- Durable outcomes from this stretch of work are **on disk** (specs, ADRs, research, gates, `TODO.md`, code, verification records, etc.), and disk (re-read when needed) can replace re-reading the old chat.
- The user’s immediate goal for this thread is **settled for now** (step done, gate recorded, or a natural chunk closed) — not mid-flight on a long procedure.
- Anything still **only in chat or tool output** that the next turn must remember is captured in the `compaction` field (see below), not assumed to remain in trimmed history.

Compaction is **per chunk**, not “end of project.” After include, the next user message should be able to proceed with compaction + last-response + post-compaction turns only.

### When to omit `compaction`

**Default: omit.** Do not compact “just in case.”

Omit when **chat history must stay intact** for correct continuation:

- **Open procedure** — same skill step, gate, or multi-turn task still in progress; the user has not authorized the next step or you are waiting on a user-owned decision.
- **Chat is still the only accurate record** — important facts, tradeoffs, or tool findings not yet written to durable files, and you are not ready to summarize them faithfully in `compaction`.
- **Heavy dialogue dependence** — nuance, rejected options, or constraints live only in prior turns and would be lost without the full thread (and you cannot distill them into `compaction` yet).
- **Read-only exploration** — no durable writes; omit unless you are closing the exploration and filing a summary.

If omitting, keep recording work to disk per **Record of work** in the persona; omission does not replace filing.

### Continuity: what `compaction` must preserve

After compaction, the model sees **only** the compaction summary, the compacting turn’s `answer`, and turns **after** that. The `compaction` string must therefore be **sufficient to continue without the deleted history**:

- **Goal and scope** — what the user is trying to accomplish in this session/thread; current sprint/task id and focus if deliverable work applies.
- **Decisions** — choices made, with brief rationale; explicitly rejected options when they constrain later work.
- **Open items** — blocked work, pending user input, next authorized step, known defects or failed checks not yet fixed.
- **Not yet on disk** — conclusions, research, or constraints that exist only in prior turns or tool results — enough detail that you will not re-investigate blindly.
- **On disk (index only)** — path → role, gate/status, key ids/slugs; **no full file bodies** (re-read files instead).

Use structured sections (e.g. `### Goal`, `### Decisions`, `### File index`, `### Research not yet filed`, `### Open items`). If you cannot write a compaction that meets the continuity bar, **omit** `compaction` and keep history, or write missing facts to disk first, then compact.