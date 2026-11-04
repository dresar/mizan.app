---
name: soft-blue-neumorphism
description: Build polished, mobile-first websites and cross-platform apps using a calm Soft Blue Neumorphism design system. Use when creating, redesigning, or implementing UI/UX for web dashboards, admin panels, SaaS products, PWAs, Android apps, or iOS apps that need soft surfaces, restrained blue gradients, concise microcopy, responsive grids, reusable components, fixed navigation, and subtle motion.
license: MIT
metadata:
  author: OpenAI
  version: "1.1.0"
---

# Soft Blue Neumorphism

Build clean, consistent, production-minded interfaces with a soft blue visual language. The result must feel modern, calm, tactile, readable, fast, and genuinely usable on a phone before it is adapted for larger screens.

## 1. Non-negotiable principles

1. **Mobile first.** Design the narrow screen first, then expand the same system for tablet and desktop. Do not create a desktop layout and merely shrink it.
2. **Reusable components.** Build a small, consistent component system before scattering one-off markup and styles throughout the app. Reuse tokens, variants, states, and layout primitives.
3. **Concise UI language.** Prefer one-word labels and short actions: `Simpan`, `Batal`, `Tambah`, `Edit`, `Hapus`, `Cari`, `Masuk`, `Keluar`, `Tutup`, `Kirim`. Do not write long sentences inside buttons, tabs, badges, navigation, or compact cards. Use short helper text only when it prevents confusion.
4. **Soft, not muddy.** Neumorphic shadows must be subtle. Preserve text contrast, clear boundaries, and visible focus states. Do not make every element look raised.
5. **Restrained color.** Use the blue palette as the identity. Gradients are accents, not wallpaper. Keep large surfaces mostly calm and near-white.
6. **Subtle motion.** Motion should communicate state and hierarchy, never distract or slow down the interface.
7. **Stable navigation.** Desktop sidebar and header remain stationary while the main content scrolls. Mobile navigation respects safe areas and does not cover content.
8. **No placeholder UI.** Every visible control must work, navigate, validate, submit, open, close, or be clearly disabled. Do not render decorative controls that look interactive.
9. **Accessible by default.** Use semantic elements, keyboard support, accessible names, visible focus, sufficient contrast, reduced-motion support, and touch targets suited to mobile.
10. **Platform-aware.** Keep the same design language across web, PWA, Android, and iOS, but implement controls using the conventions and capabilities of each platform.

## 2. Required workflow

When starting a UI task, follow this sequence:

1. Inspect the existing project, framework, routing, design tokens, dependencies, and current behavior. Do not replace the stack without a strong reason.
2. Identify the target: responsive website, PWA, Android, iOS, or shared cross-platform app. If the user requests multiple platforms, choose a shared implementation only when the current stack supports it cleanly.
3. Identify the main user tasks, navigation groups, forms, data views, public routes, private routes, and permission/error states.
4. Read the relevant reference map in `references/implementation-map.md`; use the design tokens in `references/design-system.md` and component requirements in `references/component-catalog.md`.
5. For every public web route, plan crawlability, rendering, metadata, canonical URLs, structured data where applicable, sitemap inclusion, and Search Console verification using `references/seo-ai-discoverability.md`. Keep private and authenticated pages out of public indexing.
6. Build the app shell and responsive navigation first. Confirm the fixed/stationary behavior before filling every page.
7. Build reusable components and interaction states. Use real data and existing API contracts where available; do not invent backend behavior.
8. Implement motion and data-fetching states from `references/motion-loading.md`; every real asynchronous interaction must have an appropriate pending, success, and error path.
9. Implement requested screen flows, then test narrow mobile, larger mobile, tablet, laptop, and wide desktop layouts. Test keyboard, touch, reduced-motion, loading, and failure behavior.
10. Run formatter, type checker, tests, SEO checks, accessibility checks, and production build when available. Fix warnings and regressions introduced by the work.
11. Summarize implemented screens, SEO/indexing setup, reusable components, motion/loading behavior, platform coverage, commands run, and remaining limitations.

Do not stop after producing a static mockup when the user asked for a working website or app. Do not rewrite unrelated files or remove working behavior without a reason.

For public websites, SEO and machine-readable discoverability are part of implementation, not an optional finishing touch. For backend-driven UI, loading, empty, stale, error, retry, and success states are required wherever those states can occur. Read the two corresponding references before implementation.

## 3. Visual direction

Use **Soft Blue Neumorphism** as the visual identity:

- Soft cool-blue background with a very light gradient or radial glow.
- White or pale-blue surfaces with restrained raised/inset shadows.
- Deep blue for primary actions and selected navigation.
- Rounded corners with consistent radius tokens.
- Minimal header, clear content hierarchy, and generous but controlled spacing.
- Small gradient accents on primary buttons, selected states, charts, and decorative highlights.
- Mostly flat content surfaces for long text, tables, and dense data. Do not apply heavy neumorphic shadows to every row or text block.

Use the exact base palette and token guidance in `references/design-system.md`. When the existing product already has a brand palette, map the tokens to that brand while preserving contrast and the soft visual character.

Animation is mandatory as a designed system across the interface: provide purposeful transitions for page entry, navigation, overlays, interactive controls, feedback, and asynchronous loading where appropriate. This does not mean animating every element continuously. Follow `references/motion-loading.md`; respect reduced-motion settings and never trade usability or performance for decoration.

## 4. Responsive layout rules

### Breakpoints

Use mobile-first CSS and these default breakpoints unless the project already defines a consistent system:

- Small mobile: below `360px`.
- Mobile: `360px` to `767px`.
- Tablet: `768px` to `1023px`.
- Desktop: `1024px` to `1439px`.
- Wide desktop: `1440px` and above.

Use content-driven breakpoints where a layout genuinely needs them. Do not add breakpoints without a visible layout reason.

### Grid rules

- **Mobile:** 2 columns by default for dashboards, summaries, shortcuts, and compact cards.
- **Tablet:** 2 or 3 columns depending on card width and reading order.
- **Desktop:** 4 columns for the main dashboard card grid by default.
- **Wide desktop:** retain 4 columns or use 5 only when the content clearly benefits and cards remain readable.
- Use a consistent gap of approximately `12–16px` on mobile and `16–24px` on larger screens.
- Allow a card to span 2 columns when it contains a chart, long text, or a key summary.
- Never force a 2-column mobile layout when the content becomes cramped. For dense content, let the component span the full row.
- Avoid fixed card heights unless the content type requires a stable visual rhythm. Prefer `min-height` and flexible content.

### Content behavior

- Mobile forms are one column. Desktop forms may use two columns only for closely related, short fields.
- Keep primary actions reachable without excessive scrolling. Use a sticky action area only when it does not obscure inputs or device safe areas.
- Tables may become horizontally scrollable with a clear affordance, or transform into stacked summary cards on mobile. Choose the form that preserves the task and information hierarchy.
- Charts must resize and keep labels legible. Hide secondary labels before shrinking them below a readable size.
- Use fluid widths and `minmax(0, 1fr)` to prevent overflow. Avoid fixed pixel widths for primary content.
- Add safe horizontal page padding: approximately `16px` on mobile, `24px` on tablet, and `28–40px` on desktop.

## 5. Navigation and app shell

### Desktop

- Use a persistent sidebar on the left for primary navigation in dashboard/admin products.
- Sidebar width should generally be `232–264px`; collapsed width may be `72–80px` when icon-only navigation remains understandable with tooltips and accessible names.
- Sidebar stays fixed or sticky in place. It must not jump, drift, or scroll away with the content.
- Use an independent sidebar scroll region only if navigation overflows. Keep the logo and user/account area stable where practical.
- Use a minimal header, generally `56–64px` high. Show only the page title or breadcrumb, essential search/action, and profile/notification controls.
- The main content is the independently scrolling region. Reserve space for the fixed sidebar and header so content is never hidden behind them.
- Do not animate the sidebar width on every route change. If collapse is supported, animate it briefly and preserve state intentionally.

### Mobile

- Do not show the full desktop sidebar permanently.
- Use a minimal top bar, generally `52–60px` high, with a hamburger, short page title/logo, and at most one or two high-value actions.
- Hamburger opens an accessible side drawer. The drawer should have a dimmed backdrop, clear close action, grouped navigation, and escape/back handling.
- For products with 3–5 primary destinations, use a fixed bottom navigation for the most common routes. Put secondary routes inside the hamburger drawer or a `Menu` item.
- Bottom navigation must include bottom safe-area padding and must never cover the page's final content or action buttons. Add matching bottom content padding.
- The active destination must be unmistakable. Do not rely on color alone; use a selected surface, label, or indicator.
- Do not put every route in the bottom bar. Keep it focused and uncluttered.

### Stable shell requirements

- Desktop: sidebar and header do not move while the content area scrolls.
- Mobile: the top bar remains available where appropriate; bottom navigation remains anchored to the viewport and handles safe areas.
- Avoid nested scroll areas unless they are essential. Prevent accidental horizontal page scrolling.

## 6. UI copy and labels

- Prefer one-word labels, especially for buttons, navigation, tabs, badges, and field actions.
- Examples: `Beranda`, `Data`, `Ujian`, `Info`, `Profil`, `Menu`, `Simpan`, `Batal`, `Tambah`, `Edit`, `Hapus`, `Cari`, `Filter`, `Ekspor`, `Kirim`, `Lanjut`, `Tutup`.
- Keep page titles short: `Pengguna`, `Laporan`, `Pengaturan`, `Jadwal`.
- Use short field labels: `Nama`, `Email`, `Kelas`, `Tanggal`, `Status`.
- Use placeholders as examples, not as replacements for labels: `Nama lengkap`, `Cari data`.
- For destructive confirmation or important errors, clarity wins over the one-word rule. Use a short sentence when needed, such as `Data ini akan dihapus permanen.`
- Avoid vague labels such as `Oke` when the action can be named precisely. Prefer `Simpan`, `Hapus`, or `Lanjut`.
- Do not use filler text, fake testimonials, fake statistics, or meaningless marketing copy in functional products.

## 7. Icons and illustration policy

- Never use emoji, text glyphs, Wingdings, arbitrary Unicode symbols, or platform-default placeholder icons as product icons.
- Prefer a consistent icon library already present in the project. Good options include Lucide, Tabler, Phosphor, or Material Symbols when they match the visual system.
- For React Native, use a native-compatible package such as `lucide-react-native` or `@phosphor-icons/react-native` and its required SVG dependency.
- For Flutter, use a consistent package such as `lucide_icons` or custom SVG assets rendered with `flutter_svg`.
- For SwiftUI, use a consistent custom SVG/image asset pipeline or SF Symbols only when the product explicitly accepts native platform glyphs and visual consistency is preserved.
- If the library lacks an icon, create a clean, original SVG icon with a consistent 1.75–2px stroke, rounded caps/joins, a `24 × 24` viewBox, and no unnecessary detail.
- Do not mix multiple icon families on the same screen. Use one family, consistent size, stroke, and optical alignment.
- Icon-only buttons require an accessible label, tooltip where appropriate, and a touch target of at least `44 × 44px`.
- Avoid decorative icons beside every single label. Icons should clarify navigation, action, status, or object type.

## 8. Motion and interaction

- Use subtle transitions for hover, focus, press, selection, drawer, modal, dropdown, and loading states.
- Typical duration: `140–220ms` for micro-interactions and `200–280ms` for drawers or larger panels.
- Use calm easing such as `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- Use small changes: slight elevation, background shift, opacity, or `1–2px` movement. Avoid large bouncing, parallax, constant floating, or animated gradients.
- Keep gradients static or very slowly changing; do not run attention-seeking animation continuously.
- Provide a visible pressed state for touch and click.
- Respect `prefers-reduced-motion` on web and the platform's reduced-motion setting on native apps. In reduced-motion mode, remove nonessential movement and use immediate state changes or subtle fades.
- Never use animation as the only way to communicate success, error, selection, or loading.

## 9. Component implementation rules

Build shared, typed, documented-by-structure components with variants and states. Do not copy-paste similar markup across screens. Use the component catalog in `references/component-catalog.md` as the baseline.

Each reusable component must define:

- Purpose and semantic role.
- Variants and sizes.
- Default, hover, focus, pressed, disabled, loading, and error states as applicable.
- Responsive behavior.
- Keyboard, touch, and screen-reader behavior.
- Loading, empty, error, and success behavior where relevant.

At minimum, create or reuse these component families when required by the product:

- App shell, desktop sidebar, mobile drawer, top header, bottom navigation, breadcrumbs.
- Buttons, icon buttons, links, segmented controls, tabs, badges, tooltips.
- Text inputs, password inputs, search, select, checkbox, radio, switch, textarea, date/time controls, form field wrapper, validation message.
- Cards, statistic cards, panels, list rows, tables, pagination, filters, sort controls.
- Dialog/modal, confirmation dialog, drawer, dropdown menu, toast/snackbar, alert.
- Avatar, menu item, skeleton, spinner, progress, empty state, error state, loading state.
- Responsive grid, stack, page container, section header, divider.

Do not build every possible component if the current product does not need it. Build the baseline library once, then add components only when a real screen requires them.

## 10. Technical quality

- Follow the existing framework's idioms and project conventions.
- Keep design tokens centralized. Avoid scattered hard-coded colors, radii, shadows, and spacing values.
- Prefer CSS variables/design tokens for web. Use theme objects or typed constants for native apps.
- Keep components small and focused. Separate layout, data access, state, and visual presentation appropriately.
- Use semantic HTML on the web. Use native controls and accessibility APIs on native apps.
- Handle form validation, disabled states, pending requests, API errors, retry, and success feedback.
- Use real loading states and skeletons only when content is actually loading. Do not show indefinite fake loading animations.
- Avoid unnecessary dependencies. Before adding an icon or animation package, inspect existing dependencies.
- Optimize images, use responsive image sizing, avoid layout shifts, and lazy-load noncritical media.
- Avoid excessive blur and large shadow stacks that can harm performance on low-end phones.
- Keep touch targets at least `44 × 44px`; leave enough spacing between destructive and safe actions.
- Check text contrast and focus visibility. Do not encode status using color alone.
- Do not store secrets in client code. Do not invent endpoints, credentials, or permission rules.

## 11. Platform adaptation

Read `references/platform-adaptation.md` when the project targets Android, iOS, PWA, or more than one platform.

- A responsive web application can be made installable as a PWA when offline behavior, manifest, icons, and service worker requirements are deliberately implemented.
- React Native with Expo or Flutter can share most UI and business logic across Android and iOS, but platform navigation, safe areas, keyboard handling, permissions, and build configuration still need platform-specific work.
- Native Android and native iOS implementations should preserve tokens and interaction patterns while respecting each platform's conventions.
- Do not claim that a web page is automatically a native APK or IPA. Build and validate actual platform packages using the project's chosen toolchain.
- Android deliverables may include APK for direct testing and AAB for Play Store distribution.
- iOS distribution typically requires macOS/Xcode signing and an Apple Developer account for device/TestFlight/App Store distribution. State these requirements honestly when relevant.

## 12. SEO, search indexing, and AI discoverability

For every public-facing website, treat search discovery as a first-class deliverable. Read `references/seo-ai-discoverability.md` and apply the parts relevant to the framework and content type.

- Give every indexable route a unique, descriptive title, meta description, canonical URL, language, useful heading structure, and meaningful visible text.
- Make primary content available in crawlable HTML. Prefer SSR, SSG, or a suitable hybrid approach for public content when the framework supports it. Do not require user interaction for essential content to appear.
- Use real anchor links with valid `href` values for navigation and internal links. Make important pages discoverable from the site navigation or other crawlable pages.
- Generate and maintain `robots.txt` and an XML sitemap using canonical, public, indexable URLs only. Keep sitemap `lastmod` accurate. Do not expose private URLs, personal data, internal APIs, or secret routes.
- Add JSON-LD structured data only when it accurately describes visible page content and a relevant Schema.org type is supported by the search engine. Never fabricate ratings, prices, reviews, authors, dates, or business details.
- Keep public content helpful, original, trustworthy, and written for people. Use descriptive image alt text, clear link text, logical headings, and explanatory text instead of image-only content.
- Make pages usable without client-side JavaScript where practical. If the site depends on JavaScript, follow framework-specific rendering guidance and verify the rendered HTML with search tooling.
- Set private dashboards, account pages, admin pages, and sensitive user content to non-indexable and protect them with real authentication and authorization. `robots.txt` is not access control.
- Include setup instructions for Google Search Console verification and sitemap submission. Do not claim that a URL is indexed merely because a sitemap was generated or submitted.
- Do not promise first-page rankings, guaranteed indexing, or guaranteed citations in AI answers. Explain that discovery and display are decided by each search platform.
- Do not add `llms.txt`, AI-only metadata, keyword stuffing, hidden text, or special schema as a supposed Google AI ranking trick. Such files may be offered as optional ecosystem experiments only when explicitly requested, with their limitations stated.

## 13. Animation and backend loading requirements

Read `references/motion-loading.md` for implementation patterns and the full state matrix.

- Every interactive surface must respond visibly to hover where relevant, focus, press, selection, open/close, and route changes.
- Use small entrance transitions for meaningful content regions, not a cascade of distracting animations on every child.
- Every request that waits on a backend, network, database, file operation, or asynchronous computation must expose a truthful pending state.
- Use skeletons for known content layouts, inline spinners for compact actions, and progress indicators only when progress is measurable.
- Prevent layout shifts by reserving space for skeletons, images, charts, and async content.
- Provide empty, error, retry, success, disabled, and stale-data behavior wherever relevant.
- Never fabricate progress percentages, show infinite loading after a settled request, or block the entire interface for a small background refresh.
- Respect `prefers-reduced-motion` and native reduced-motion settings. Maintain the information conveyed by motion using direct state changes and accessible labels.

## 14. Quality checklist


Before calling the work complete, verify:

### Visual
- [ ] Soft Blue palette is consistent and gradients are restrained.
- [ ] Shadows are subtle and text remains readable.
- [ ] Radius, spacing, typography, and icon style are consistent.
- [ ] UI labels are concise, with one-word labels wherever clarity allows.
- [ ] No emoji or random Unicode symbols are used as icons.
- [ ] Page, navigation, overlay, feedback, and loading motion is present where appropriate and remains restrained.

### Responsive
- [ ] Mobile was designed and checked first.
- [ ] Dashboard grids use 2 columns on mobile and 4 on desktop by default.
- [ ] Tablet behavior is intentional.
- [ ] No horizontal page overflow at narrow widths.
- [ ] Cards and forms remain readable and touchable.
- [ ] Bottom navigation respects safe areas and does not cover content.

### Navigation
- [ ] Desktop sidebar remains stationary.
- [ ] Desktop header remains minimal and stationary.
- [ ] Mobile hamburger opens and closes correctly.
- [ ] Mobile drawer supports backdrop, escape/back, and focus handling.
- [ ] Bottom navigation contains only primary destinations.

### Interaction and accessibility
- [ ] Every visible control works or is clearly disabled.
- [ ] Focus, pressed, loading, disabled, success, and error states exist where needed.
- [ ] Keyboard and screen-reader names work.
- [ ] Touch targets are at least 44px.
- [ ] Reduced-motion preference is respected.
- [ ] Async actions show real pending states and do not use fake indefinite loaders.
- [ ] Empty, error, retry, success, and stale-data states are implemented where relevant.
- [ ] Contrast and status communication are sufficient.

### SEO and discoverability
- [ ] Public routes have unique titles, descriptions, canonical URLs, and meaningful visible content.
- [ ] Crawlable internal links and indexable route structure are in place.
- [ ] `robots.txt` and XML sitemap contain only intended public routes.
- [ ] Structured data is valid, relevant, and matches visible page content.
- [ ] Private and authenticated pages are protected and non-indexable.
- [ ] Google Search Console setup and validation steps are documented.
- [ ] No ranking, indexing, or AI-citation guarantees are claimed.

### Engineering
- [ ] Existing behavior and routes are preserved.
- [ ] Components and tokens are reused.
- [ ] No dead code, debug output, fake data, or unnecessary dependencies were added.
- [ ] Tests, type checks, formatter, and build pass when available.
- [ ] Any build or platform limitations are disclosed clearly.

## 15. Expected delivery

For a new interface, deliver working screens rather than just a style description. Include the app shell, navigation, reusable components, responsive layouts, representative content states, and functional interactions requested by the user. When the project has multiple screens, apply the same tokens and components throughout.

In the final handoff, state briefly:

- What was built.
- Which reusable components were created or updated.
- Which screen sizes/platforms were checked.
- Which commands/tests/builds passed.
- Any remaining limitation, signing requirement, or item that needs real backend data.

For detailed values and examples, use `references/implementation-map.md` to select the correct reference, then read the relevant file in `references/`. The reference map is the routing index for this skill; do not skip it on complex or multi-platform work.
