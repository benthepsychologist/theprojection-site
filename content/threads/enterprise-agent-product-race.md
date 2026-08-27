---
title: The Enterprise Agent Land Grab
lens: ai
status: open
opened: 2026-08-25
last_seen: 2026-08-26
weight: 2
entities:
- anthropic
- google-deepmind
- mistral-ai
thread_kind: story
blurb: 'Whether the enterprise agent-product surface — the layer where labs and adjacent
  vendors package existing model capability into something a company actually deploys
  (seats, IDE integrations, workflow bundles) — keeps shipping at the pace 2026-08-20
  revealed, and whether this map can keep up now that it has a place to log it. Opened
  after the heaviest single-day coverage-critic miss on record: five confirmed misses
  in one day (08-20), all on this exact axis, zero overlap with anything this map
  tracked, and only one (Mistral''s Agentic Search) had an existing thread to land
  on. The candidate this produced was offered twice (08-20, 08-21) and dropped without
  a decision either way — a real, evidence-backed gap that sat unresolved for five
  days before being promoted. Track: whether the pace holds or 08-20 was a one-off
  pileup; whether any lab treats this as a distinct product line with its own roadmap
  rather than a bundling exercise; and whether enterprise adoption numbers (seats,
  IDE install counts) ever get disclosed to test whether the packaging actually converts
  to usage.'
---

## 2026-08-26 — Claudeforce puts the CRM inside the model, not the model inside the CRM

- **Salesforce and Anthropic announced "Claudeforce," a 37-skill Salesforce
  plugin running inside Claude** — deal-health review, pipeline updates and
  meeting prep against live CRM data from Claude's own interface, in pilot now
  with a broader beta in September. Announced 16:00 ET, timed to Salesforce's
  Q2 FY2027 earnings call. **The direction of travel is the development, not the
  feature list**: the enterprise application is moving inside the model's
  surface rather than calling the model from within the application, which
  inverts the integration pattern every vendor on this thread has used so far.
  ([Salesforce IR](https://investor.salesforce.com/news/news-details/2026/Salesforce-and-Anthropic-Announce-Claudeforce-The-1-AI-Meets-the-1-AI-CRM/default.aspx),
  [CNBC](https://www.cnbc.com/2026/08/26/salesforce-anthropic-partnership-claudeforce.html))

## 2026-08-25 — First live development since the thread opened: Anthropic merges memory across chat and its agent product

- **Anthropic merged the memory systems of Claude Chat and Claude
  Cowork, so context learned in one surface carries into the other** —
  and moved memory from an end-of-conversation summarisation step to
  continuous updating during a conversation. Users can view, edit and
  delete stored memories; sensitive categories (health, race, ethnicity,
  religion, politics, gender identity) are excluded by default behind an
  opt-in toggle, and government IDs, SSNs and criminal history are never
  stored. It is on by default across Free, Pro and Max, on web, desktop
  and mobile, at no extra cost. **This is the packaging pattern this
  thread was opened to track, applied to state rather than to
  capability:** the agent product and the chat product stop being two
  places you have to brief separately, which is the friction that keeps
  an agent surface from becoming the place work actually lives. No seat
  or adoption numbers disclosed — the disclosure question this thread
  watches stays unanswered.
  ([TechCrunch](https://techcrunch.com/2026/08/25/claude-cowork-finally-remembers-what-you-told-the-app-in-chat/))

## 2026-08-25 — Thread opened, backfilled from the 2026-08-20 coverage-critic catch

- **Opened on Ben's promotion of a candidate the map's own 2026-08-25
  weekly retrospective found: offered twice (08-20, 08-21) during the
  week it surfaced and dropped by inaction, not a ruling.** The case: on
  2026-08-20, five confirmed coverage-critic misses landed in one day,
  all on the same axis, with zero overlap with anything this map already
  tracked — the heaviest single-day miss count on record.
- **Anthropic bundled computer use, browser access, versioned Skills and
  a reusable Files API into a single production-agent surface for
  enterprises** — the pieces existed separately; what shipped is the
  packaging, which is what turns a demo capability into something a
  company can build a workflow on. ([Anthropic](https://claude.com/blog))
- **Google folded Antigravity, its coding-agent product, into eligible
  Gemini Enterprise Standard and Plus subscriptions**, with IDE
  extensions for VS Code (GA), Visual Studio, JetBrains and Zed
  (preview), plus unified billing, spend/quota controls, and audit
  logging — putting a coding agent inside seats enterprises already pay
  for. ([Google
  Cloud](https://cloud.google.com/blog/products/ai-machine-learning/expanding-google-antigravity-for-enterprise-customers))
- **Slack launched code channels, where teams plan, write and review
  software alongside AI agents inside Slack itself**, with GitHub,
  Anthropic and Vercel integrated as named partners. ([Slack](https://slack.com/blog))
- **Harvey released "Harvey Tenet," its first post-trained open-weight
  legal model, specialised for diligence and document review — built,
  per the benchmark that carried it, on Kimi K3.** Cross-references
  [Distillation Fight](/threads/kimi-distillation-fight/): an American legal-AI vendor post-training
  on Kimi K3 the same week Washington accused Moonshot of distilling a
  US frontier model to build it. ([Harvey](https://harvey.ai/blog))
- **Mistral shipped Agentic Search, giving a model five tool-like
  actions — search, open, navigate, read, grep** — the one item of the
  five that already had a thread to land on. Full detail on [Mistral AI](/threads/mistral-ai/).
  ([Mistral](https://mistral.ai/news/agentic-search))
