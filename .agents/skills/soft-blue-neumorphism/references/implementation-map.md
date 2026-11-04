# Skill Implementation Map

This file is the routing index for the Soft Blue Neumorphism skill. Read `SKILL.md` first, then open the references selected by the task. The skill uses one source of truth per topic to reduce conflicting rules.

## 1. Reference map

| Need | Required reference | Main output |
|---|---|---|
| Overall design, colors, typography, shadows, spacing, breakpoints | `design-system.md` | Shared theme tokens and responsive visual rules |
| Reusable UI patterns and component states | `component-catalog.md` | Component inventory and behavior contracts |
| Web, PWA, Android, iOS, Flutter, Expo, native implementation | `platform-adaptation.md` | Platform-specific implementation and build constraints |
| Google Search, SEO, sitemap, robots, metadata, schema, AI discoverability | `seo-ai-discoverability.md` | Public route indexing plan and SEO validation |
| Animation, transitions, skeletons, spinners, API loading/error states | `motion-loading.md` | Motion map and async state contract |
| This index | `implementation-map.md` | Task-to-reference routing and delivery sequence |

## 2. Task routing

| User request | Read first | Also read when relevant |
|---|---|---|
| New website or dashboard | `design-system.md`, `component-catalog.md` | `motion-loading.md`, `seo-ai-discoverability.md` |
| Redesign existing site | `SKILL.md`, `design-system.md`, `component-catalog.md` | `platform-adaptation.md`, `motion-loading.md`, SEO reference |
| Admin panel with backend | `component-catalog.md`, `motion-loading.md` | `design-system.md`, `platform-adaptation.md`; SEO for public marketing pages only |
| SEO or Google indexing improvement | `seo-ai-discoverability.md` | `platform-adaptation.md` for framework rendering; design system only if visual work is requested |
| AI-readable content or AI search visibility | `seo-ai-discoverability.md` | `platform-adaptation.md` when SSR/SSG/JS rendering is involved |
| PWA | `platform-adaptation.md` | design system, component catalog, motion/loading, SEO |
| Android APK/AAB | `platform-adaptation.md` | design system, component catalog, motion/loading |
| iOS app | `platform-adaptation.md` | design system, component catalog, motion/loading |
| Loading animation or API integration | `motion-loading.md` | component catalog and platform adaptation |
| Shared design-system implementation | design system and component catalog | motion/loading and platform adaptation |

## 3. Required implementation sequence

1. **Inspect:** identify the existing stack, routes, API contracts, auth boundaries, assets, tests, and conventions.
2. **Classify:** separate public/indexable web content from private application screens and native-only routes.
3. **Plan:** map tasks, information architecture, responsive layouts, navigation, data lifecycle, and SEO needs.
4. **Tokenize:** define colors, typography, spacing, radii, shadows, breakpoints, and motion values centrally.
5. **Shell:** build desktop fixed sidebar/header and mobile hamburger/drawer/bottom navigation as applicable.
6. **Components:** implement only needed reusable components, including accessibility and all relevant states.
7. **Data:** connect real backend contracts and define pending, empty, error, retry, stale, and success behavior.
8. **Motion:** add purposeful page, control, navigation, overlay, and loading transitions.
9. **SEO:** for public web routes, implement rendered content, metadata, canonical URLs, internal links, schema when valid, robots, and sitemap.
10. **Validate:** run responsive, functional, accessibility, performance, SEO, type, test, and production-build checks.
11. **Report:** state completed work and distinguish confirmed outcomes from setup instructions or limitations.

## 4. Architecture and component ownership map

| Layer | Owns | Must not own |
|---|---|---|
| Design tokens/theme | Colors, type, spacing, radii, shadows, elevation, motion | API calls or page business rules |
| App shell | Sidebar, header, drawer, bottom navigation, scroll regions | Feature-specific data logic |
| Shared components | Visual states, semantics, validation display, accessibility | Duplicate backend logic in every component |
| Page/route | Content composition, route metadata, page-level state | Reimplementation of global tokens |
| Data/service layer | API clients, schemas, authorization-aware data access, cache invalidation | Visual styling |
| SEO layer | Titles, descriptions, canonical, schema, robots, sitemap, public rendering | Leaking private records |
| Platform layer | Safe areas, keyboard, native navigation, system integrations | Inconsistent design language without a reason |

## 5. Project-wide done definition

A feature is not done merely because it looks correct in one screenshot. It is complete only when:

- The visual system is consistent and mobile-first.
- Layouts work at actual mobile, tablet, and desktop widths.
- The main user flow works with keyboard and touch.
- All visible controls perform their stated action.
- Backend-driven states are truthful and recoverable.
- Motion is purposeful and reduced-motion safe.
- Public pages are technically discoverable and correctly separated from private pages.
- Tests, builds, and validation checks pass or remaining failures are disclosed.
