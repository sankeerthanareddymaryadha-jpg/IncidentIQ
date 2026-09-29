# I Built an Agent That Remembers How We Fixed Production

Most incident tools remember that an outage happened. I wanted Incident IQ to remember what actually fixed it.

When a production incident arrives, the useful question is often not just *"What could be wrong?"* It is *"Have we seen this pattern before, and what worked last time?"*

That is the idea behind Incident IQ: an incident-response agent that uses historical incidents, root causes, successful fixes, failed approaches, runbooks, and post-mortems as operational memory.

The application models that memory explicitly, with a persistent memory boundary designed around [Hindsight](https://github.com/vectorize-io/hindsight).

<img width="1220" height="707" alt="Screenshot 2026-09-29 052201" src="https://github.com/user-attachments/assets/84b86848-81e6-40d1-acc6-fdd9c2238b78" />

*Figure 1 — The Incident IQ flow: incident intake → investigation → historical memory → recommended recovery → resolution → reusable memory.*

## What Incident IQ actually does

I started by treating an incident as more than a title and a status.

The application has separate views for the dashboard, incident reporting, investigation, history, runbooks, agent memory, resolution, and post-mortems. That structure matters because incident response is a workflow, not a single chat response.

At the data-model level, an incident carries its lifecycle, service, severity, timeline, recommended actions, similar incidents, root cause, resolution notes, failed approaches, and post-mortem.

```ts
export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedService: string;
  // ...
  rootCause?: string;
  resolutionNotes?: string;
  failedApproaches?: string[];
  timeline: TimelineEvent[];
  recommendedActions: RecommendedAction[];
  similarIncidentIds: string[];
  postMortem?: PostMortem;
}
```

That gives the agent something much more useful than a blank prompt.

<img width="1200" height="705" alt="Screenshot 2026-09-29 052228" src="https://github.com/user-attachments/assets/4235f05e-bad7-45bd-855f-dabe5cff76f4" />


*Figure 2 — Incident IQ dashboard with active incidents, critical priority, AI investigations, and resolved incidents.*

<img width="1210" height="702" alt="Screenshot 2026-09-29 052254" src="https://github.com/user-attachments/assets/22a349de-a6ad-4f5c-9957-be42ae9571db" />

*Figure 3 — The incident feed with severity, service, status, investigation controls, and access to past fixes.*

## The workflow starts with a plain-language incident

The report screen is intentionally simple. An engineer can describe what is happening, select a category and severity, and optionally add service and affected-user information.

The repository includes test presets for payment, database, API, and mobile incidents. For example, the payment preset describes checkout failures, HTTP 500 errors, and a growing payment webhook queue.

That makes the investigation flow easy to demonstrate without pretending the engineer already knows the root cause.

<img width="1201" height="691" alt="Screenshot 2026-09-29 052315" src="https://github.com/user-attachments/assets/59520e4f-ca7f-464f-8faa-077f50c54b01" />

*Figure 4 — Incident intake: the engineer describes what happened in plain language and provides the minimum context needed for investigation.*

Once submitted, the frontend sends the incident details and the available memory entries to the investigation endpoint:

```ts
const res = await fetch('/api/gemini/investigate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: data.description,
    category: data.category,
    severity: data.severity,
    memoryBank: memoryBank.map((m) => ({
      id: m.id,
      incidentTitle: m.incidentTitle,
      service: m.service,
      symptoms: m.symptoms,
      rootCause: m.rootCause,
      successfulFix: m.successfulFix,
      resolutionTimeMinutes: m.resolutionTimeMinutes,
    })),
  }),
});
```

The important part here is `memoryBank`.

The model is not being asked to solve the incident from scratch. It receives structured historical evidence alongside the new incident.

## I made historical evidence visible

The investigation endpoint tells Gemini to compare the incident with the historical memory bank and return structured JSON.

One of the rules in the prompt is deliberately explicit:

```text
Known from previous incidents
AI suggestion
User-provided information
```

I wanted those sources separated because an incident agent can become misleading very quickly if historical evidence and generated guesses are presented as though they have the same status.

The response includes a matched memory ID, match confidence, similarity explanation, probable root cause, a follow-up question, and recommended actions.

That gives the UI enough information to show *why* a recommendation appeared instead of only showing the recommendation itself.

For example, a payment incident can match a historical incident whose root cause was database connection-pool exhaustion.

The useful output is then closer to:

```text
Known from previous incidents:
Payment Service Failure — March 2026

Historical root cause:
Database connection pool exhaustion caused by an unindexed batch query.

AI suggestion:
Check current connection usage and recent timeout logs.

User-provided information:
Customers are receiving payment failures during checkout.
```

A similar incident is evidence, not automatically the diagnosis.

## The fallback retrieval path is intentionally simple

The current backend also has a local fallback path when the Gemini call is unavailable.

It ranks memory entries using token overlap and gives additional weight to operational terms such as `payment`, `timeout`, `database`, `postgres`, `redis`, `500`, and `504`.

The core idea is small enough to fit in the request handler:

```ts
const descWords = new Set(
  desc
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
);

for (const mem of memories) {
  let score = 0;
  const memText =
    `${mem.incidentTitle} ${mem.service} ${mem.rootCause} ${mem.symptoms.join(' ')}`
      .toLowerCase();

  const memWords = memText
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  for (const w of descWords) {
    if (memWords.includes(w)) {
      score += 1;

      if (
        ['payment', 'pool', 'timeout', '504', '500',
         'lock', 'database', 'postgres', 'redis', 'crash']
          .includes(w)
      ) {
        score += 2;
      }
    }
  }
}
```

I don't consider that the final retrieval system. It is a transparent fallback that keeps the memory behavior understandable.

For persistent agent memory, I want the application to have a proper memory boundary.

## Where Hindsight fits

The architecture separates Incident IQ's application workflow from the long-term memory layer.

[Hindsight's GitHub repository](https://github.com/vectorize-io/hindsight) and [Hindsight documentation](https://hindsight.vectorize.io/) are the references I use for that persistent-memory layer.

The boundary is conceptually:

```text
                                                 INCIDENT IQ
                                                       │
                                        ┌──────────────┴──────────────┐
                                        │                             │
                        │    Application Data                        AI Agent
                                        │                              │
                                   PostgreSQL                       Hindsight
                                        │                              │
                                 ┌──────┼─────────┐           ┌────────┼─────────┐
                                 │      │         │           │        │         │
                              Users  Incidents Runbooks   Memories  Experiences  Lessons
                                │      │         │            │        │         │
                                └──────┴─────────┘            └────────┴─────────┘
                                        │                             │
                                        └──────────────┬──────────────┘
                                                       ↓
                                                      LLM
                                                       ↓
                                             Incident Investigation
                                                       ↓
                                               Recommendations
                                                       ↓
                                                  Resolution
                                                       ↓
                                                 Post-Mortem
                                                       ↓
                                                Hindsight Memory
                                                       ↺
```

The current repository already has the structure needed for this boundary through `AgentMemoryEntry`. The persistent implementation can use that structure rather than turning the application into one large collection of chat transcripts.

```ts
export interface AgentMemoryEntry {
  id: string;
  incidentId: string;
  incidentTitle: string;
  service: string;
  symptoms: string[];
  rootCause: string;
  successfulFix: string;
  successfulRunbookId?: string;
  successfulRunbookTitle?: string;
  failedApproaches: string[];
  resolutionTimeMinutes: number;
  date: string;
  timesReferenced: number;
  lessonsLearned: string;
}
```

The shape is intentional.

I don't only want to remember what happened. I want to remember what worked, what failed, how long resolution took, and what should be done differently next time.

That is the distinction I find useful when thinking about [agent memory](https://vectorize.io/what-is-agent-memory).

<img width="1211" height="706" alt="Screenshot 2026-09-29 052405" src="https://github.com/user-attachments/assets/14fa485f-3438-41aa-8598-9efbb5816a1a" />

*Figure 6 — Agent Memory stores the incident patterns the agent can retrieve later: root causes, successful fixes, and reuse history.*

## Memory should include failed approaches

One of the more useful fields in the data model is `failedApproaches`.

The seed memory includes examples such as restarting a downstream webhook listener before fixing the database pool, or restarting web-tier pods before clearing a database lock.

Those actions did not solve the original problem.

That is still valuable information.

If the next incident looks similar, the agent should be able to say:

```text
We tried this before.
It did not resolve the incident.
The successful path was different.
```

A memory system that stores only successful outcomes loses half of the operational lesson.

## Runbooks turn memory into an action plan

Historical memory tells the agent what happened before. Runbooks turn that knowledge into a repeatable sequence.

Incident IQ includes runbooks for payment recovery, database lock clearing, API gateway recovery, and authentication/session-cache problems.

A runbook step contains an instruction and, where appropriate, a command or snippet.

```ts
export interface RunbookStep {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  commandOrSnippet?: string;
  completed: boolean;
}
```

That means a recommendation can point to an actual recovery procedure rather than producing a paragraph of generic advice.

<img width="1217" height="698" alt="Screenshot 2026-09-29 052425" src="https://github.com/user-attachments/assets/c52365ad-d62e-43c9-b714-fb3d1c71e424" />

*Figure 7 — Fixing Guides (runbooks) provide ordered recovery procedures that can be referenced during investigation.*

## I put a boundary around dangerous actions

Incident response is one place where I don't think "agentic" should mean "execute whatever the model suggests."

Recommended actions explicitly carry a danger flag:

```ts
export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  whyRecommended: string;
  previousSuccessHistory?: string;
  instructions: string;
  isDangerous: boolean;
  dangerousConfirmationText?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}
```

The investigation prompt also tells the model not to automatically execute service restarts, configuration changes, or cache evictions.

So the intended relationship is:

```text
Memory → informs the recommendation
AI → explains the recommendation
Engineer → confirms risky production actions
```

I prefer that boundary to pretending an LLM can safely infer every operational consequence from a short incident description.

## Resolution is where the memory loop closes

The most important part of the workflow is not incident creation. It is what happens after the incident is fixed.

Incident IQ captures the root cause, resolution notes, runbook used, failed approaches, duration, and lessons learned. Those fields can then become the next reusable memory entry.

The resulting loop is:

```text
INCIDENT IQ │ ┌──────────────┴──────────────┐ │ │ Application Data AI Agent │ │ PostgreSQL Hindsight │ │ ┌──────┼─────────┐ ┌────────┼─────────┐ │ │ │ │ │ │ Users Incidents Runbooks Memories Experiences Lessons │ │ │ │ │ │ └──────┴─────────┘ └────────┴─────────┘ │ │ └──────────────┬──────────────┘ ↓ LLM ↓ Incident Investigation ↓ Recommendations ↓ Resolution ↓ Post-Mortem ↓ Hindsight Memory ↺
```

Incident IQ can compare that description with its historical memory.

The repository contains a historical payment incident where:

- the payment service returned HTTP 500 errors;
- the database connection pool was exhausted;
- an unindexed batch query caused the exhaustion;
- increasing the pool and restarting the payment service restored normal processing;
- the incident was resolved in 12 minutes;
- an attempted webhook-listener restart did not solve the problem.

That history gives the new investigation a concrete starting point.

It does **not** prove that the new incident has the same root cause.

The engineer still needs to verify the current system.

That distinction is important because infrastructure changes. A fix that worked three months ago can be the wrong action today.

## What I learned

### 1. Memory should be part of the workflow

A memory page is useful for inspection, but historical knowledge becomes much more valuable when it is automatically consulted during investigation.

### 2. Store outcomes, not just conversations

The useful memory is structured around symptoms, root cause, successful fix, failed approaches, runbook, resolution time, and lessons learned.

A transcript alone doesn't tell me which step actually solved the incident.

### 3. Failed approaches deserve first-class storage

If an approach failed, the next investigation should be able to see that.

Otherwise the system can repeatedly recommend the same dead end.

### 4. Similarity should narrow the search, not replace diagnosis

A historical match is evidence.

It should reduce the investigation space while leaving room for the current incident to be different.

### 5. The memory loop should close after resolution

The best time to capture a new operational lesson is immediately after the incident, while the root cause, actions, failed experiments, and outcome are still known.

## The implementation detail I would change next

The current repository has a clear conceptual separation between incident state, memory entries, recommendations, runbooks, and post-mortems.

The next architectural step is making persistent agent memory a first-class service rather than keeping the working memory bank in application state.

That is where Hindsight belongs.

I don't want Incident IQ to become a chatbot with a list of old incidents attached to it. I want historical experience to participate in the investigation loop.

The principle is simple:

```text
Don't start every incident from a blank page.

Retrieve relevant experience.
Verify it against the current system.
Use the evidence to guide the investigation.
Then write the new lesson back into memory.
```

Production incidents will always be messy. Symptoms overlap. Systems change. Yesterday's fix can become today's wrong answer.

But the investigation doesn't have to forget everything that came before it.

---
