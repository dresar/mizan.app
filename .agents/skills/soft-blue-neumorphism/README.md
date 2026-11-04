# Soft Blue Neumorphism Skill

Reusable Agent Skill for production-minded, mobile-first websites, PWAs, and cross-platform apps using a Soft Blue Neumorphism design system.

## What's included

- `SKILL.md` — activation instructions, mandatory workflow, mobile-first design, app shell, responsive rules, concise UI copy, icon policy, motion, loading, SEO, quality gates, and delivery expectations.
- `references/implementation-map.md` — task-to-reference routing map, implementation sequence, and architecture ownership map.
- `references/design-system.md` — colors, gradients, shadows, radii, spacing, typography, motion tokens, and CSS starter.
- `references/component-catalog.md` — reusable components, variants, required states, and interaction behavior.
- `references/platform-adaptation.md` — web, PWA, Expo/React Native, Flutter, Android, and iOS guidance.
- `references/motion-loading.md` — required animations, backend pending/loading patterns, skeletons, error/retry/success states, and reduced-motion behavior.
- `references/seo-ai-discoverability.md` — Google SEO, AI Search discoverability, metadata, SSR/SSG, canonical URLs, robots, sitemap, JSON-LD, Search Console, content quality, and validation.

## Install

Copy the `soft-blue-neumorphism` folder into the skills directory supported by your coding agent. Common locations include:

- Codex: `.codex/skills/soft-blue-neumorphism/`
- Claude Code: `.claude/skills/soft-blue-neumorphism/`
- Cursor: `.cursor/skills/soft-blue-neumorphism/`
- OpenCode: `.opencode/skills/soft-blue-neumorphism/`

Follow the current configuration of the coding agent being used.

## Invoke

Use a request such as:

```text
Use soft-blue-neumorphism to build this website mobile-first.
Read the implementation map and apply the relevant references.
Implement the responsive shell, reusable components, motion, real loading states, and SEO for public routes.
```

Or in Indonesian:

```text
Pakai skill soft-blue-neumorphism.
Buat website mobile-first, lengkap dengan komponen reusable,
animasi, loading backend, responsive, dan SEO Google.
Baca implementation-map.md lalu ikuti referensi yang sesuai.
```

## Important SEO note

The skill improves technical eligibility and content discoverability but cannot guarantee crawling, indexing, ranking, rich results, AI citations, or visibility in any search product. Search platforms make those decisions. Google currently recommends foundational SEO and useful people-first content for its AI Search features; special AI files such as `llms.txt` are not required for Google AI Overviews or AI Mode.
