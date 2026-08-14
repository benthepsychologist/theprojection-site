<!-- RELEASED 2026-08-14: this file was rendered and hash-tracked by the kestrel engine until sites stopped being kit targets (kestrel ROADMAP/FLEET.md §3.3). It is now THIS repo's own file, outright — edit it freely, nothing will overwrite it, and no drift check tracks it. The contract it describes is restated on the corpus side, in that repo's OPERATING.md. -->

# CLAUDE.md — theprojection-site

This repo is the **published surface only** — a Hugo site with exactly one
content writer: theprojection's own adapter,
`/workspace/theprojection-corpus/publish/adapter.py` (declared by that repo's
`kestrel.yaml` `outputs.adapter`), which calls the kestrel engine's
publish core (`/workspace/kestrel/kestrel/publish/core.py`) for the
guarantees. The adapter is instance code, fed by `/workspace/theprojection-corpus` — no
per-site adapter code lives in the engine.

**Single-writer contract:** `data/` and `content/threads|entities|map|claim/*`
are generated and overwritten wholesale on every publish run — never
hand-edit them; edits belong upstream, in the data repo or the adapter.
Hand-authored pages (`content/about.md`, `content/metric/*.md`) are this
repo's own and are never touched by publish.

**What IS this repo's own code:** `layouts/`, `assets/css/`, `static/`,
`hugo.yaml`, `wrangler.toml` — templates, brand system, and site config are
edited and pushed here directly, same as any other Hugo site.

**Deploy:** the Cloudflare Workers Builds deploy hook, fired automatically
by `/publish --push` in the data repo, builds and deploys this site. A
bare template/CSS push does **not** auto-fire the hook — only a content
publish run does; fire it by hand (`curl -X POST` the hook URL) after a
template/CSS-only change.

**Upstream pointers:** engine — `/workspace/kestrel`; data/instance repo —
`/workspace/theprojection-corpus`.
