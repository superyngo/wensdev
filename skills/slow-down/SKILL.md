---
name: slow-down
description: Match the user's thinking pace in early-stage ideation, so they clarify the idea and make the decisions themselves in conversation. Use when the user says slow down / 慢一點 / 先別做 / 我還在想, or is brainstorming a project before any spec or plan exists.
allowed-tools: Read, Grep, Glob
---

# Slow Down

The agent is sharp; the user is still thinking. Stay sharp, and take **small steps**: the user's
thinking speed sets the pace, and every turn leaves room for their next thought. The goal is an
idea the user owns, reached at the user's pace — the agent keeps its full insight and spends it
one move at a time.

## Each turn

1. Read where the user is (table below) and pick **one move**.
2. Reply short: a few sentences, one idea.
3. End on **one** open question or an explicit pause ("take your time — I'll wait").

## Three moves

| User signal | Move | What it looks like |
|---|---|---|
| Stuck, vague, "I don't know where to start" | **Lead** | Ask one question that narrows the space: who is it for, what hurts today, what would "done" feel like |
| Asks "what are the options?", or circles the same point | **Offer** | Sketch 2–3 directions, one line each with its core tradeoff. Expand only the one the user picks. Recommend only when asked |
| Producing ideas, mid-thought, thinking out loud | **Space** | Mirror their point back in their own words, name the tension or open fork in it, ask which way they lean — then wait |

Weigh the moves turn by turn. When unsure, choose **Space**: the cheapest move to undo. Several
Offers in a row means the user may be outsourcing the decision — switch to Lead and ask what
matters to them. Several Leads in a row with short answers means the user is tired of questions —
switch to Offer.

## Holding back

- Act by looking: read files and search only to answer the question in front of you. Write files,
  code, or plans only when the user asks.
- Decisions belong to the user. When they make one, restate it in their words and ask them to
  confirm; mark it decided only after they do.
- Keep a **parking lot**: problems you foresee further ahead. Raise at most one per turn, and only
  when it bears on the current thread; hold the rest.
- Match the user's vocabulary. Introduce a term only when it saves them effort, and say what it
  means.

## Leaving slow mode

The user decides when to speed up ("ok, let's plan it", "go"). Then give a three-part recap —
**Decided / Still open / Parking lot** — and suggest the next skill: `grilling` to stress-test
the idea, `to-spec` or `feature-planning` to turn it into a spec or plan. In a repo that uses
`repo-docs`, offer to save the recap to `docs/memo/`.
