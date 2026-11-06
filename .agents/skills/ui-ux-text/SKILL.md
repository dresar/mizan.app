---
name: ui-ux-text
version: 2.0.0
description: A framework-agnostic standard for clean, professional, minimal, accessible, mobile-first UI/UX, concise interface copy, consistent design systems, robust interaction states, and production-quality implementation.
---

# UI/UX, Microcopy, and Mobile-First Engineering Skill

## 1. Purpose

Use this skill whenever designing, reviewing, refactoring, implementing, or improving a website, web app, SaaS product, dashboard, admin panel, browser extension, PWA, mobile interface, form, component library, or other digital product interface.

The goal is to make interfaces feel clear, professional, calm, consistent, fast to understand, easy to use, responsive, accessible, and production-ready.

Optimize for these outcomes, in this order:

1. Correctness and usability.
2. Clear hierarchy and understandable actions.
3. Accessibility and responsive behavior.
4. Concise, consistent interface text.
5. Consistent design language.
6. Maintainable, minimal implementation.
7. Visual polish without decorative clutter.

Do not confuse minimalism with removing useful information. Remove noise, repetition, and filler. Keep information users need to understand a decision, complete a task, avoid a mistake, or recover from an error.

## 2. Core Principle

**Clear > Short > Consistent > Accessible > Elegant.**

A short interface is successful only when it remains understandable. A visually attractive interface is successful only when it remains functional. A responsive interface is successful only when its content, interactions, and accessibility remain usable across screen sizes and input methods.

Every visible element must serve a purpose. Every word must add meaning. Every interaction must communicate its state. Every layout must work with real content, not just ideal sample text.

## 3. Operating Rules and Language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirement strength:

- **MUST / MUST NOT:** mandatory unless a higher-priority product, legal, safety, or accessibility requirement requires a documented exception.
- **SHOULD / SHOULD NOT:** strong default; exceptions require a clear reason.
- **MAY:** optional when it benefits the specific product.

Write instructions and implementation notes in plain, direct English so different AI systems, developers, and design tools can interpret them consistently. Avoid unexplained jargon. When technical terms are necessary, use them consistently.

Use the product's established user-facing language. Do not introduce a second language into the interface without a product requirement. Keep interface terminology consistent within each locale.

## 4. When to Apply This Skill

Apply this skill when a request includes any of the following intentions:

- Improve, redesign, modernize, polish, audit, or refactor UI/UX.
- Make an interface more minimal, professional, clean, consistent, or premium.
- Reduce interface text, simplify copy, or improve microcopy.
- Improve mobile, responsive, tablet, desktop, or PWA behavior.
- Create or update design tokens, typography, spacing, components, or design systems.
- Improve forms, dashboards, navigation, tables, dialogs, cards, menus, or empty states.
- Review visual hierarchy, accessibility, interaction states, or usability.
- Implement interface changes in an existing codebase.
- Prepare reusable standards for an AI coding or design agent.

For unrelated tasks, do not force UI/UX changes into the work.

## 5. Priority and Conflict Resolution

Apply requirements in this order:

1. User safety, privacy, security, and correctness.
2. Required product behavior and business rules.
3. Accessibility and applicable platform requirements.
4. Existing architecture and project conventions that must be preserved.
5. This skill's UI/UX and microcopy standards.
6. Optional visual preferences and polish.

If two requirements conflict, preserve the higher-priority requirement. Do not silently remove essential instructions, legal disclosures, consent text, safety warnings, pricing information, or error details simply to shorten the interface. Make necessary content concise instead.

Do not claim that a design, build, test, or audit succeeded unless it was actually performed and verified.

## 6. Project Inspection Before Changes

When editing an existing project, inspect the project before implementing visual changes.

### 6.1 Understand the project

Identify, when possible:

- Framework, language, package manager, and build system.
- Main application entry point and routing structure.
- Global layouts, shells, headers, sidebars, footers, and navigation.
- Shared UI components and existing design tokens.
- Typography, color, spacing, and icon systems.
- Styling method, such as CSS, CSS Modules, utility classes, or a component library.
- Responsive breakpoints and current mobile navigation.
- Existing accessibility patterns.
- Existing tests, lint rules, formatters, and build commands.
- Existing UI behavior that must remain unchanged.

### 6.2 Inspect before duplicating

Before adding a heading, breadcrumb, page action, wrapper, navigation element, or component, check whether a parent layout or shared component already provides it.

Use a single source of truth for global page titles, breadcrumbs, navigation, theme values, shared labels, and repeated components when practical.

Do not add a second implementation of a feature that already exists. Extend or reuse the existing component unless there is a strong technical reason not to.

### 6.3 Preserve behavior

Visual refactoring MUST preserve existing functionality unless the user explicitly requests a behavior change. Avoid unrelated architectural rewrites, dependency changes, route changes, data-model changes, and API changes.

If a requirement is ambiguous but implementation can reasonably proceed, make the safest assumption that preserves existing behavior. Explain a material assumption outside source code when needed.

## 7. Design Philosophy

### 7.1 Clarity over decoration

- Establish a clear focal point on every screen.
- Make the primary action easy to identify.
- Group related information together.
- Use whitespace to separate ideas.
- Prefer clean alignment and consistent rhythm over decorative shapes.
- Use color, borders, shadows, gradients, and animation only when they improve hierarchy or feedback.
- Avoid unnecessary cards, nested panels, dividers, badges, labels, and ornamental icons.
- Do not fill empty space with extra text or decorations merely because the page feels sparse.

### 7.2 One component, one primary purpose

Each card, panel, modal, section, form group, and toolbar SHOULD have one clear purpose. Avoid mixing unrelated actions or unrelated data inside a single component.

A component may contain supporting information and secondary actions, but these MUST NOT obscure its main purpose.

### 7.3 Calm visual hierarchy

Do not make every element visually prominent. Use a restrained hierarchy for primary content, secondary content, metadata, and supporting details. Reserve strong emphasis for genuinely important information and actions.

### 7.4 Real content first

Design with realistic content, including long names, long labels, empty values, translated strings, large numbers, long URLs, errors, and loading states. Do not optimize only for short placeholder data.

## 8. Minimal Interface Copy Standard

Concise interface copy is the default. Remove filler, repetition, vague wording, and unnecessary explanations.

### 8.1 Strict length targets

Use these defaults unless clarity, safety, accessibility, legal requirements, or the task requires more:

| Element | Default target | Rule |
|---|---|---|
| Page title | 1–3 words | Name the task or destination |
| Section heading | 1–4 words | Describe the group |
| Button label | 1–2 words | Start with a clear action when possible |
| Input placeholder | Maximum 1 word | Never replace a real input label |
| Helper text | One short sentence | Explain only what is needed |
| Subtitle | One short sentence | Use only when it adds information |
| Toast | 2–3 words | State the result or status |
| Error message | One short sentence | State what failed or what must change |
| Loading label | 1–2 words plus optional ellipsis | Name the active operation |
| Tooltip | One brief phrase or sentence | Explain a non-obvious control |
| Empty-state title | 2–4 words | State the absence clearly |
| Empty-state action | 1–2 words | Give the relevant next step |

These are strong design targets, not a reason to create confusing abbreviations. Use additional words whenever users need them to understand a critical action or avoid harm.

### 8.2 Remove UX filler

Avoid phrases such as:

- “Please click here to continue.”
- “In this section, you can…”
- “You are able to…”
- “The following is…”
- “For the purpose of…”
- “Please be advised that…”
- “Click the button below.”
- “Here you can manage…”

Prefer direct labels and actions such as “Continue,” “Settings,” “Save,” “Upload,” “Search,” and “Manage access,” when those labels accurately describe the action.

### 8.3 Zero repetition

Do not repeat the same meaning in a title, subtitle, button, helper text, badge, and nearby paragraph.

Bad pattern:

- Title: “Account Settings”
- Subtitle: “Manage your account settings.”
- Button: “Save account settings.”

Better pattern:

- Title: “Account”
- Optional helper: “Profile and security.”
- Button: “Save”

Remove any sentence that can be deleted without reducing comprehension, safety, or task success.

### 8.4 Use consistent terminology

Choose one term for each action or concept and use it everywhere in the same product and locale.

Examples:

- Use “Save” consistently instead of alternating among “Save,” “Apply,” and “Update” when they represent the same action.
- Use “Delete” consistently for the same destructive action.
- Use “Search” consistently for the same search function.
- Use “Copy” consistently for copying content.
- Use “Open” consistently when the action opens the same type of destination.

Use different labels only when the actions have meaningfully different outcomes. Do not translate some interface labels while leaving equivalent labels in another language without a product requirement.

### 8.5 Use direct, specific language

Prefer concrete nouns and verbs. Avoid ambiguous labels such as “Process,” “Proceed,” “Action,” or “Submit” when a more informative action exists and fits the context.

For example:

- Prefer “Create project” to “Proceed” when creating a project is the action.
- Prefer “Retry” to “Try again later” when retrying is immediately available.
- Prefer “Email is invalid” to “Something went wrong” when the validation issue is known.
- Prefer “Connection lost” to “An unexpected issue occurred” when the connection loss is known.

Never invent a cause that the system has not confirmed. When the cause is unknown, state the known failure plainly.

### 8.6 Capitalization and punctuation

- Use sentence case by default.
- Apply the same capitalization style across equivalent components.
- Avoid ALL CAPS for normal labels and long text.
- Do not add punctuation to every short label solely for visual consistency.
- Use punctuation in complete sentences where it improves readability.
- Use ellipses only for an active or ongoing state when the product's writing style supports them.
- Avoid multiple exclamation marks or excessive emoji in professional interfaces.

### 8.7 Placeholder rules

Placeholders MUST contain no more than one word by default. Examples include “Name,” “Email,” “Search,” “Address,” “Password,” and “Message.”

A placeholder is a hint, not a label. Every meaningful input MUST have a persistent, programmatically associated label, even if the visual design uses a compact treatment.

Do not rely on placeholder text as the only instruction because it disappears when users type and may have insufficient contrast. Put necessary format information in a short helper message or accessible hint.

### 8.8 Button rules

Button labels SHOULD contain one or two words and clearly express the result of activation.

Good examples:

- Save
- Cancel
- Delete
- Edit
- Search
- Upload
- Download
- Copy
- Continue
- Retry
- Preview
- Open project
- Send invite
- Copy link

Avoid long sentence-style button labels. If a button needs a paragraph to explain its action, revise the interaction or provide the explanation nearby.

Do not duplicate icon meaning in the text. An icon that already represents “Add” SHOULD accompany “Add,” not “+ Add.” A check icon SHOULD accompany “Done,” not “✓ Done.”

### 8.9 Titles and subtitles

- Keep titles short and descriptive.
- Use a subtitle only when it adds meaningful context.
- Do not use a subtitle to restate the title.
- Do not turn headings into paragraphs.
- Avoid multiple competing titles at the top of one page.
- Do not duplicate titles or breadcrumbs already rendered by a parent layout.

### 8.10 Helper text

Helper text SHOULD explain one thing and normally fit in one short sentence. Keep detailed technical guidance behind a help popover, tooltip, accordion, or dedicated documentation view when appropriate.

Do not hide information users must know before acting inside a tooltip. Important consequences, limitations, costs, permissions, and risks MUST be visible before the user commits to the action.

### 8.11 Labels and technical terms

Use familiar user language by default. Keep a technical term when the intended audience understands it or when changing it would make the concept inaccurate.

For API keys, IDs, tokens, code, file paths, URLs, hashes, and other machine-readable values:

- Preserve the complete underlying value where users need it.
- Allow long strings to wrap or scroll in a contained region.
- Do not let technical values widen the whole page.
- Mask sensitive values when appropriate.
- Provide explicit copy controls when copying is a common task.
- Keep accessible names for icon-only copy controls.

### 8.12 Maximum 1–2 Sentences Standard (Professional UI Density)

For dashboards, forms, control cards, settings panels, and developer-oriented interfaces:
- **Strict Limit**: Body copy, card descriptions, and section helpers MUST NOT exceed 1–2 short, direct sentences.
- **No Patronizing or AI Filler**: Never explain what is already obvious to a professional user.
- **Zero Bloat Paragraphs**: If explanatory text takes 3 or more sentences, it MUST be extracted out of the inline layout and placed into an interactive modal trigger.

### 8.13 Interactive `(!)` Hover Tooltip / Floating Popover Pattern (`InfoHint`)

Whenever secondary instructions, technical parameter lists, or deep contextual details are necessary:
- **Do Not Inline Paragraphs**: Never write long descriptive blocks directly under inputs, switches, or card headers.
- **Strictly Forbid Modal Dialogs**: NEVER open a centered modal dialog, fullscreen popup, or dim the screen backdrop for secondary hints. DO NOT add "Mengerti" or dismiss buttons.
- **Use the `(!)` Hover/Touch Trigger**: Place a compact circular exclamation badge (`InfoHint`) next to the title or label.
- **Restricted Floating Area**: On mouse hover (or touch on mobile), a small floating contextual card (~260–280px max width) appears immediately anchored right above or beside the `!` icon.
  - Clear, concise mini-title.
  - A 1-sentence executive overview.
  - Bulleted technical points/tips.
- **Auto Dismiss**: Disappears immediately when the mouse cursor leaves the icon.
- **Benefit**: Keeps the screen compact, high-density, and clean while keeping complete technical guidance instantly accessible on demand without interrupting the user's flow.

## 9. Progressive Disclosure

Show information in layers:

1. **Primary:** what users need to understand and act now.
2. **Secondary:** useful context that supports the task.
3. **Details:** advanced settings, technical explanations, and infrequent actions.

Use accordions, disclosure panels, help popovers, tooltips, secondary tabs, or detail pages when they meaningfully reduce visual clutter.

Do not overuse progressive disclosure. Content required to make an informed decision MUST remain visible. Avoid hiding common actions behind multiple layers of menus.

## 10. Information Architecture and Navigation

### 10.1 Page structure

A page SHOULD have a recognizable structure:

1. Global shell or navigation, when relevant.
2. One page title or equivalent primary heading.
3. The page's primary action, when applicable.
4. Main content grouped into clear sections.
5. Secondary actions and supporting detail.

Not every page needs every element. Do not add empty sections to match a template.

### 10.2 Navigation consistency

- Keep navigation labels short and predictable.
- Group destinations by users' tasks or mental model.
- Use the same icon, name, and position for the same destination.
- Distinguish current, selected, disabled, and unavailable states.
- Do not use an icon alone when its meaning is unclear.
- Keep navigation shallow when practical.
- Avoid redundant navigation that points to the same destination without a clear reason.

### 10.3 Headers and breadcrumbs

Use a single source of truth for global headers, page titles, and breadcrumbs. If the application shell already renders a page title or breadcrumb, child pages MUST NOT render the same element again.

Page content SHOULD focus on the content and actions specific to that page. Add a local “Back” action only when it improves navigation or is required by the flow.

Do not show breadcrumbs for very shallow structures when they add no value. Ensure breadcrumb labels are short, navigable where appropriate, and accessible.

### 10.4 Primary and secondary actions

- Make the primary action visually clear.
- Limit competing high-emphasis actions in the same area.
- Render destructive actions with appropriate distinction and confirmation when needed.
- Keep secondary actions visually quieter.
- Avoid styling every action as a primary button.
- Do not place an irreversible action where users can trigger it accidentally.

## 11. Visual Hierarchy

### 11.1 Recommended content priority

Use this order as a starting point:

1. Primary action or decision.
2. Primary information.
3. Section heading.
4. Supporting information.
5. Metadata or helper text.
6. Secondary actions.
7. Technical detail.

Adjust this order according to the task. A data-heavy analytical dashboard may prioritize key metrics; a form may prioritize task completion and validation.

### 11.2 Hierarchy tools

Use a small, consistent set of visual tools:

- Typography size and weight.
- Spacing and grouping.
- Alignment.
- Foreground and background contrast.
- Borders and dividers.
- Surface elevation, when useful.
- Color for meaning and state.
- Iconography when it helps recognition.

Do not use color, bold text, badges, shadows, and large type all at once to emphasize ordinary information.

### 11.3 Typography levels

Within a typical card or component, use no more than three meaningful text levels unless the content genuinely requires more:

- Main title or value.
- Supporting text or label.
- Metadata or helper text.

Avoid a design where every line uses a different size, weight, and color. Consistent type scales improve scanning and reduce visual noise.

### 11.4 Data display

For dashboard metrics, a useful default is:

**Value → Label → Context.**

Show the value prominently, name what it represents, and include context only when it aids interpretation. Use consistent number formatting, currency formatting, date formatting, units, and precision across the product.

Do not use color as the only way to communicate status. Pair it with text, a symbol, or another accessible indicator.

## 12. Design System and Tokens

Use a shared design system rather than designing every page independently.

### 12.1 Required token groups

Define reusable tokens for:

- Color: background, surface, elevated surface, text, muted text, border, primary, secondary, focus, success, warning, danger, and informational status.
- Typography: font families, size scale, weights, line heights, and letter spacing where needed.
- Spacing: a consistent scale for internal padding, group spacing, and section spacing.
- Layout: content width, page gutters, grid gaps, and breakpoint behavior.
- Radius: inputs, buttons, cards, popovers, and dialogs.
- Borders: width, style, and semantic color.
- Elevation: limited shadow levels where useful.
- Motion: duration, easing, and reduced-motion behavior.
- Layers: consistent stacking order for menus, popovers, dialogs, overlays, and notifications.
- Interaction sizes: minimum control dimensions and icon dimensions.

Use token names that describe purpose rather than appearance when possible. Semantic names such as `text-primary` and `surface-elevated` are easier to maintain than names tied to a single color.

### 12.2 Spacing scale

Prefer a small, repeatable spacing scale. A 4 px base unit is a practical default, but follow existing project conventions when a sound system already exists.

Use spacing to express relationships:

- Small spacing within a tightly related group.
- Medium spacing between related controls.
- Larger spacing between distinct groups.
- The largest spacing between major page sections.

Do not pick arbitrary spacing values independently for each component unless there is a real need.

### 12.3 Color system

- Use a restrained palette.
- Reserve strong color for primary actions, meaningful statuses, or intentional emphasis.
- Maintain readable contrast in every theme and state.
- Distinguish text, surfaces, borders, and disabled states consistently.
- Do not communicate success, failure, or warning by color alone.
- Avoid introducing near-duplicate colors without a design-system reason.

### 12.4 Light and dark themes

When themes are supported:

- Define semantic tokens for both themes.
- Do not invert colors mechanically without checking contrast and meaning.
- Check muted text, borders, disabled controls, focus indicators, charts, menus, dialogs, and toasts in both themes.
- Ensure logos and icons remain visible.
- Persist theme choice only according to the product's existing behavior and privacy requirements.

### 12.5 Component variants

Shared components SHOULD use a small, explicit set of variants, such as primary, secondary, tertiary, destructive, and text-only actions where appropriate.

Do not create a new variant for every page. Extend the system only when a real recurring use case exists.

## 13. Responsive and Mobile-First Design

Mobile-first design means starting from a narrow, touch-based viewport and expanding the layout as space and input capabilities allow. It does not mean shrinking a desktop layout until it fits.

### 13.1 General responsive rules

- Design for narrow phones, large phones, tablets, laptops, and wide desktop screens.
- Use content-driven breakpoints based on where the layout stops working, not solely on device names.
- Let content wrap naturally when appropriate.
- Use flexible widths, grids, and max-widths rather than fixed page dimensions.
- Avoid fixed heights around text unless truncation is intentional and safe.
- Prevent child elements from forcing the entire page wider than the viewport.
- Keep essential actions visible and reachable.
- Check both portrait and landscape layouts when relevant.
- Test long and translated content.

### 13.2 Mobile type scale

Recommended starting points, to be adjusted for the product and font:

| Role | Typical starting size | Guidance |
|---|---:|---|
| Main mobile heading | 24–32 px | Short, distinctive, and allowed to wrap |
| Section heading | 18–24 px | Clear but subordinate to page title |
| Body text | 16 px | Default for comfortable reading |
| Secondary text | 14 px | Use for supporting information, not critical instructions where it becomes hard to read |
| Small metadata | 12–14 px | Use sparingly and maintain sufficient contrast |
| Control text | Usually 16 px | Avoid unnecessarily tiny input and action labels |

These are starting guidelines, not universal laws. The final result depends on typeface, x-height, line length, contrast, zoom behavior, and content density.

### 13.3 Line height and readable wrapping

- Use comfortable line height, often around 1.45–1.6 for body text.
- Keep paragraph line length comfortable on large screens.
- Avoid very long lines on desktop and overly narrow text columns on mobile.
- Allow headings to wrap when needed.
- Put the most important words early in a heading or label.
- Use `overflow-wrap: anywhere` selectively for machine-generated identifiers, long URLs, and unbroken technical strings.
- Use normal word wrapping for ordinary prose.
- Do not use forced word breaks that make normal text hard to read.

### 13.4 Truncation and ellipsis

Truncation is allowed for secondary previews, compact rows, or deliberately constrained layouts. It MUST NOT make essential information unavailable.

- Do not truncate critical instructions, price details, legal text, error messages, account identifiers users must verify, or primary action labels.
- Provide an accessible way to view the full value when a preview is truncated.
- Do not assume hover tooltips are available on touch devices.
- Avoid multi-line clamping for content users must read to make a decision.

### 13.5 Mobile layout patterns

Use patterns suited to the available space:

- A single-column layout for forms and narrow content.
- Responsive grids when each item retains a usable minimum width.
- Collapsible side navigation or a drawer when a persistent sidebar is too wide.
- Bottom navigation for a small number of important top-level destinations when the app's structure supports it.
- Horizontal scrolling only for content that genuinely benefits from it, with visible affordance and clear boundaries.
- A dedicated scroll container for wide tables instead of forcing the whole page to overflow.
- Full-width controls when they improve mobile task completion.
- Sticky actions only when they do not obscure content or conflict with the keyboard or system insets.

Do not automatically add a bottom navigation bar, floating button, or sticky footer to every application. Choose the pattern based on the task and existing information architecture.

### 13.6 Touch targets and spacing

Make touch controls comfortably easy to activate. A target around 44 × 44 CSS pixels or larger is a strong practical default for primary controls and icon buttons. Applicable accessibility standards may permit smaller targets under defined conditions, but the design SHOULD prefer a comfortable target where space allows.

- Separate adjacent destructive and non-destructive actions.
- Do not rely on a tiny icon as the only way to trigger a critical action.
- Ensure the visible icon and the actual interactive hit area work together.
- Do not position important controls too close to device edges or other controls.
- Provide clear focus indicators for keyboard and assistive-technology users.

### 13.7 Mobile navigation

- Keep labels short and recognizable.
- Make the active destination visually and programmatically identifiable.
- Ensure navigation works with touch, keyboard, and assistive technology.
- Avoid too many primary destinations in a bottom navigation bar.
- Use a drawer, menu, or secondary navigation for less-used destinations.
- Account for safe areas and fixed navigation when placing bottom actions.
- Never hide the only route to a critical task behind an ambiguous icon.

### 13.8 Mobile forms

- Prefer a single-column layout.
- Keep labels visible when the user types.
- Use suitable input types and mobile keyboards.
- Use the correct autocomplete semantics when applicable.
- Keep validation messages near the relevant field and associate them programmatically.
- Avoid clearing valid data after an error.
- Make required and optional fields clear without unnecessary prose.
- Keep submit actions reachable above or around the virtual keyboard when practical.
- Do not rely on color alone to indicate an invalid field.
- Preserve entered data when validation fails unless a security or product requirement says otherwise.

### 13.9 Tables and dense data

Tables are often difficult on mobile. Choose the least confusing pattern for the content:

- A horizontally scrollable table inside a bounded container.
- A mobile-specific stacked row representation when relationships remain understandable.
- A list with clearly labeled values.
- A reduced set of visible columns with a reliable detail view.

Do not silently remove important columns or data. If a table scrolls horizontally, preserve context where possible and ensure users can discover the additional columns.

### 13.10 Dialogs and overlays

- Keep dialogs focused on one decision.
- Use concise titles and action labels.
- Ensure the dialog fits on small screens and at increased text sizes.
- Keep the primary and cancel actions easy to distinguish.
- Prevent important dialog actions from being hidden behind the virtual keyboard.
- Ensure focus enters the dialog, stays managed appropriately, and returns to the invoking control when closed.
- Allow an appropriate dismissal method without making accidental dismissal likely during a critical task.
- Use full-screen or bottom-sheet patterns only when they improve the task on mobile.

### 13.11 Safe areas and browser chrome

For mobile web and PWA layouts:

- Account for device safe-area insets where edge-to-edge content is used.
- Avoid placing fixed controls beneath system navigation or browser UI.
- Test the page with dynamic browser chrome and changing viewport height.
- Be careful with `100vh` on mobile browsers; use modern dynamic viewport units where supported and appropriate.
- Do not assume the virtual keyboard leaves the layout unchanged.
- Confirm sticky elements remain visible and do not cover fields or messages.

### 13.12 Zoom and text scaling

- Do not disable browser zoom.
- Avoid fixed-height text containers that break when font size increases.
- Test at increased browser zoom or text scaling where practical.
- Allow labels, buttons, navigation, and dialogs to grow or wrap.
- Ensure enlarged text does not hide primary actions or important information.

## 14. Accessibility Requirements

Accessibility is part of correct implementation, not optional polish.

### 14.1 Semantic structure

- Use the correct HTML or platform-native element for each purpose.
- Use headings in a meaningful hierarchy.
- Use real buttons for actions and links for navigation.
- Associate each form label with its input.
- Use lists and table semantics when the content represents lists and tables.
- Provide meaningful alternative text for informative images.
- Use empty alternative text for purely decorative images when appropriate.
- Do not use clickable generic containers when a semantic control exists.

### 14.2 Keyboard support

- All essential functionality MUST be usable with a keyboard when the platform supports keyboard input.
- Provide a visible focus indicator.
- Keep focus order logical.
- Do not create keyboard traps.
- Support expected keys for dialogs, menus, tabs, comboboxes, and other interactive patterns.
- Do not remove the browser focus outline without providing a clear replacement.

### 14.3 Color and contrast

Use WCAG-aligned contrast targets as the baseline:

- Normal text: at least 4.5:1 contrast against its background.
- Large text: at least 3:1 contrast against its background, following the applicable WCAG definition.
- Important graphical controls and visual indicators should meet applicable non-text contrast requirements, commonly 3:1 against adjacent colors.

Check actual rendered color pairs, including muted text, placeholders, disabled states, focus rings, badges, charts, and dark mode. Do not guess contrast from visual appearance alone.

Color MUST NOT be the only indication of error, success, selection, or status. Include text, shape, iconography, or another programmatically available signal as appropriate.

### 14.4 Accessible names

- Give every interactive control a clear accessible name.
- Icon-only buttons MUST have an appropriate accessible label.
- Decorative icons SHOULD be hidden from assistive technology when their meaning is already provided by adjacent text.
- Avoid repeating the same accessible text unnecessarily.
- Ensure status messages and validation errors can be discovered by assistive technologies.

### 14.5 Motion and animation

- Use animation to clarify state changes, orientation, or continuity.
- Avoid animation that delays a simple task or distracts from important information.
- Respect reduced-motion preferences.
- Do not rely on motion alone to communicate essential information.
- Avoid continuous decorative movement.
- Keep transitions short and consistent.

### 14.6 Accessible error handling

- Identify the field or action that failed.
- Explain the known issue in plain language.
- Suggest a correction when it is known and useful.
- Programmatically associate field errors with the corresponding inputs.
- Move focus to an error summary when appropriate for a long form.
- Do not erase entered content unnecessarily.
- Do not announce every minor visual update in a way that overwhelms screen-reader users.

### 14.7 Forms and consent

- Make required fields clear.
- Make validation instructions understandable before submission when practical.
- Distinguish errors from hints.
- Do not preselect sensitive or consequential options without a valid product reason.
- Keep important consent, privacy, payment, pricing, and destructive-action information visible before commitment.
- Do not shorten legally or ethically required disclosure to the point that its meaning changes.

## 15. Buttons and Actions

### 15.1 Action hierarchy

Use a consistent action hierarchy:

- Primary: the main task on the current screen.
- Secondary: a useful alternative or supporting action.
- Tertiary: a low-emphasis action such as a text link or compact control.
- Destructive: an action that deletes, revokes, removes, or irreversibly changes data.

Avoid placing multiple visually dominant actions next to each other unless the task genuinely requires equal choices.

### 15.2 States

Every interactive control SHOULD define relevant states:

- Default.
- Hover when a hover-capable pointer exists.
- Focus-visible.
- Pressed or active.
- Selected, when applicable.
- Disabled, when applicable.
- Loading, when an operation is in progress.
- Error or invalid, when relevant.
- Success, when a completed state needs to remain visible.

Do not imply that a button is disabled if it is still interactive. Do not leave users uncertain about whether an action has started or completed.

### 15.3 Loading actions

- Prevent duplicate submissions when needed.
- Preserve a clear indication of the action in progress.
- Use concise labels such as “Saving…,” “Uploading…,” or “Processing…” when they materially help.
- Keep layout shifts small during loading.
- Restore an actionable state after a failure.
- Do not show false success before the operation is confirmed.

### 15.4 Destructive actions

Use confirmation when the consequence is significant, irreversible, or easy to trigger accidentally.

Recommended pattern:

- Title: “Delete project?”
- Description: “This action cannot be undone.”
- Actions: “Cancel” and “Delete.”

Adapt the description to the real consequence. Do not add confirmation dialogs to harmless reversible actions when they only create friction.

### 15.5 Icon buttons

- Use an icon only when its meaning is recognizable in context.
- Provide an accessible name.
- Use consistent icon size and stroke style.
- Make the hit area larger than the visible glyph when needed.
- Do not duplicate symbols in the text label.
- Avoid using icons with conflicting meanings across the product.

## 16. Forms, Inputs, and Validation

### 16.1 Form structure

- Group fields by purpose.
- Keep labels visible.
- Use logical field order.
- Keep related controls together.
- Avoid excessive borders and nested cards around every field.
- Use concise grouping headings.
- Do not use placeholder-only forms.

### 16.2 Input behavior

- Use the most appropriate input type.
- Set autocomplete attributes where useful.
- Match the keyboard to the expected data on mobile.
- Preserve user-entered data across recoverable failures.
- Avoid forcing strict formatting while a user is still typing unless required by the input type.
- Communicate formatting requirements briefly.
- Provide a reveal/hide option for password fields only when appropriate to the product.

### 16.3 Validation timing

Validate at a time that helps users recover without unnecessary interruption. Do not show error messages before users have had a fair chance to enter the expected information unless immediate validation is useful for that field.

When submission fails, identify the exact fields or conditions that need attention. Keep the error close to the relevant control and provide a clear correction when possible.

### 16.4 Input text examples

Prefer:

- Label: “Email”
- Placeholder: “Email” only if the design requires a hint; do not repeat a visible label without a reason.
- Helper: “Use a work email.”
- Error: “Enter a valid email.”
- Success toast: “Saved!”

Do not use long placeholder sentences such as “Please enter your active email address here.”

## 17. Status Messages and Feedback

### 17.1 Toasts

Toasts SHOULD be short, specific, and temporary only when the information does not require persistent attention.

Examples:

- “Saved!”
- “Copied!”
- “Upload complete.”
- “Could not save.”
- “Link copied.”

Do not show a toast that repeats a large block of information already visible on the page. Ensure important feedback is announced accessibly and remains visible long enough to be perceived.

### 17.2 Errors

A useful error contains:

1. The known problem.
2. A correction or recovery action, when known and relevant.

Examples:

- “Email is invalid.”
- “File is too large.”
- “Format not supported.”
- “Connection lost. Retry.”
- “Could not save. Try again.”

Do not expose secrets, stack traces, internal identifiers, or implementation details to ordinary users. Keep diagnostic information in appropriate logs or developer tooling.

### 17.3 Empty states

Default pattern:

- Short title: “No projects yet.”
- Relevant action: “Create project.”

Add one concise explanation only if users would not understand why the content is empty or what to do next. Do not use large illustrations or paragraphs unless they serve a real product purpose.

### 17.4 Offline and connection states

When offline behavior matters:

- Tell users when a task cannot proceed because of connectivity.
- Preserve work where possible.
- Distinguish unsaved, queued, synced, and failed operations.
- Offer retry when retrying is possible.
- Do not imply that data was saved remotely when it was only saved locally.

## 18. Cards, Lists, and Content Groups

### 18.1 Cards

Use a card when it creates a meaningful grouping or interaction boundary. Do not wrap every section in a card by default.

A card SHOULD have a clear title or primary value, supporting information only when needed, and a small number of relevant actions.

Avoid multiple layers of nested cards. Avoid repeating card titles in nearby headings unless the levels represent different information.

### 18.2 Lists

- Align repeated labels and values consistently.
- Use consistent spacing between rows.
- Make the interactive area clear.
- Keep row actions predictable.
- Avoid placing many tiny icon controls in each row.
- Support long text without causing layout overflow.

### 18.3 Badges and status chips

Use badges for meaningful status, category, or compact metadata. Do not use badges as decorative headings, section labels, list numbers, or filler.

- Use neutral styling by default.
- Reserve strong colors for states that need attention.
- Keep badge text short.
- Pair status color with clear text.
- Do not create unnecessary badge variants.

## 19. Tables, Dashboards, and Data Visualization

### 19.1 Dashboards

- Prioritize the information that drives the user's next decision.
- Avoid filling the top of the page with redundant statistics.
- Keep metric labels concise and specific.
- Show trends only when the comparison period and meaning are clear.
- Keep filters, date ranges, and controls discoverable.
- Do not rely on color alone to explain chart series or states.

### 19.2 Tables

- Use real table semantics for tabular information.
- Keep column headings specific and concise.
- Align numbers consistently.
- Use consistent date, currency, and number formats.
- Avoid excessively dense tables when a list or detail view would be clearer.
- Support sorting and filtering with clear state indicators where those features exist.
- Make empty and error states explicit.
- Preserve all critical information across responsive layouts.

### 19.3 Charts

- Give each chart a clear title or accessible summary.
- Label units and axes when needed.
- Use distinguishable series and adequate contrast.
- Provide text or data alternatives when essential information would otherwise be inaccessible.
- Avoid decorative charts without a user purpose.
- Do not imply unsupported precision or causation.

## 20. Modals, Popovers, Menus, Tabs, and Disclosure Controls

### 20.1 Modals

A modal SHOULD support one focused decision or task. Keep its title short, content necessary, and actions clear. Do not use a modal when a normal page would be easier to understand or navigate.

### 20.2 Popovers and tooltips

Use them for brief secondary explanations, not essential instructions. Provide an equivalent accessible interaction for touch and keyboard users. Do not make important content hover-only.

### 20.3 Menus

- Group related actions.
- Keep labels concise.
- Use destructive styling for destructive choices.
- Avoid deep nested menus unless the information architecture requires them.
- Close menus predictably after selection when appropriate.
- Manage keyboard navigation and focus correctly.

### 20.4 Tabs

Use tabs to switch between related views at the same level. Do not use tabs as a substitute for unrelated navigation. Keep tab labels short and provide a clear selected state that is exposed semantically.

### 20.5 Accordions

Use accordions for secondary content that users may not need immediately. Make the control's state perceivable and keyboard-operable. Do not hide critical safety, payment, legal, or decision information solely to reduce visual height.

## 21. Icons, Images, and Visual Assets

- Use one coherent icon style where possible.
- Icons MUST improve recognition, orientation, or action clarity.
- Do not add icons to every label just for decoration.
- Use text with icons when the icon is ambiguous.
- Ensure decorative images do not distract from the primary task.
- Optimize image sizing and loading behavior.
- Reserve sufficient space for media to reduce layout shifts.
- Use appropriate alternative text for informative images.
- Do not use an image of text when real selectable text is practical.
- Maintain contrast for icons across themes and states.

## 22. Motion and Microinteractions

Use motion sparingly and purposefully to indicate state changes, confirm a result, communicate hierarchy, or preserve spatial context.

- Keep durations consistent and brief.
- Avoid animation that blocks interaction.
- Avoid excessive entrance animations and scroll-triggered decoration.
- Respect reduced-motion settings.
- Do not make critical actions depend on an animation completing.
- Ensure the interface remains understandable if animation is disabled.

## 23. Performance-Aware UI

A professional interface should feel responsive as well as look responsive.

- Avoid unnecessary dependencies for small visual improvements.
- Reuse existing components and libraries when they fit the project.
- Avoid large decorative assets that do not add meaningful value.
- Prevent avoidable layout shifts.
- Keep loading indicators proportional to the task.
- Use skeletons when they meaningfully clarify expected content shape; do not add skeletons to every component by default.
- Do not use animation as a substitute for real performance.
- Preserve functionality when data is slow, unavailable, or incomplete.

## 24. PWA and Installable Web Applications

For PWAs or mobile web apps, also review:

- Viewport configuration and safe-area behavior.
- Offline and reconnect states.
- Install prompts and installation explanations when present.
- App-like navigation without trapping users.
- Loading and update states when service workers are involved.
- Data persistence and clear sync status.
- Appropriate handling of back navigation.
- Touch targets and gesture alternatives.
- Responsive dialogs and system keyboard interactions.

Do not claim an app works offline unless its actual implementation and data behavior support offline use. Do not add install prompts or permission requests without a clear product reason.

## 25. Code Quality Standard

The implementation should be clean, focused, maintainable, and consistent with the existing codebase.

### 25.1 Zero-comments policy

For code created or edited under this skill, use a strict zero-comments policy by default:

- No single-line comments.
- No block comments.
- No docstrings.
- No JSDoc.
- No HTML, CSS, JavaScript, TypeScript, Python, PHP, or configuration comments.
- No comment banners or decorative comment separators.
- No TODO, FIXME, AI-generated, or explanatory markers inside code files.
- No comments inside code examples unless the user explicitly asks for them or the target language requires a specific comment syntax for correct operation.

This policy applies to source code, not to user-facing interface text. Keep necessary UI labels, validation feedback, safety information, accessible labels, and concise instructions.

Explain important implementation decisions outside the code when explanation is necessary. Use clear names and structure instead of inline comments.

### 25.2 Clean structure

- Use descriptive, self-documenting names.
- Keep functions and components focused.
- Separate responsibilities when the project structure benefits from it.
- Keep formatting and indentation consistent.
- Remove unused imports, variables, dead code, debug output, and abandoned styles.
- Avoid duplicate implementations.
- Avoid premature abstractions and overengineering.
- Use existing conventions where they are sound.
- Keep types and interfaces accurate when the language supports them.
- Preserve current behavior during refactoring.

### 25.3 CSS and styling

- Prefer design tokens and shared utilities to repeated arbitrary values.
- Avoid unnecessary specificity and excessive selector nesting.
- Remove overridden, unused, and duplicate style rules when safe.
- Use semantic class names or project-standard naming conventions.
- Use responsive layout systems rather than brittle pixel positioning.
- Avoid fixed heights for text-heavy components.
- Make focus states explicit.
- Support theme variants through semantic tokens.
- Do not introduce global styles that unintentionally alter unrelated pages.

### 25.4 Component reuse

Create or reuse shared components when a repeated pattern has consistent behavior and meaning. Do not abstract one-off content without a clear benefit. Avoid giant components that combine unrelated data loading, business logic, visual layout, and interaction handling when the existing architecture supports cleaner separation.

### 25.5 Dependencies

Do not add a package solely for a small effect that can be achieved safely with existing project capabilities. Before adding a dependency, check whether the project already has a suitable library and whether the new dependency is necessary, maintained, compatible, and proportionate to the benefit.

### 25.6 No fake functionality

Do not leave important buttons inert, fabricate success states, use dummy links as real navigation, or present mock data as live data. When backend support is absent, be transparent about the limitation and implement an appropriate disabled, unavailable, preview, or local-only state without misleading users.

## 26. Implementation Workflow for AI Agents

Follow this workflow for UI/UX implementation tasks.

### Step 1: Understand the request

Identify the intended outcome, target users, relevant pages, functional constraints, preferred visual direction, and whether the task is an audit, design proposal, or direct implementation.

Do not ask unnecessary questions when the codebase or context provides a safe answer. Ask only when a missing detail materially prevents correct implementation; otherwise state a reasonable assumption outside code and proceed.

### Step 2: Inspect the relevant files

Read the application shell, target pages, shared components, styling tokens, routing, package scripts, and relevant tests. Search for existing implementations before creating new ones.

### Step 3: Audit current experience

Identify issues in:

- Hierarchy and focus.
- Duplicate headings and navigation.
- Excessive text and filler.
- Inconsistent terminology.
- Spacing, typography, colors, and component variants.
- Mobile overflow and broken wrapping.
- Weak interaction feedback.
- Missing loading, error, empty, or disabled states.
- Accessibility defects.
- Repeated or unused code.

Prioritize problems by impact on task completion, correctness, accessibility, and responsive behavior rather than by visual novelty alone.

### Step 4: Define the smallest coherent change set

Establish the design rules and components that should be shared. Avoid piecemeal overrides when a shared token or component can solve the problem consistently. Do not redesign unrelated sections without a reason.

### Step 5: Implement systematically

A useful implementation order is:

1. Shared tokens and typography.
2. Global layout and navigation.
3. Common controls and repeated components.
4. Page-specific layout and content.
5. Responsive refinements.
6. Interaction and accessibility states.
7. Cleanup.

Adjust the order when the project architecture demands it. Keep commits or edits cohesive where applicable.

### Step 6: Audit interface copy

Apply the microcopy rules. Remove filler and duplication. Keep required instructions, meaningful context, and accessible labels. Verify that the copy uses consistent terminology and appropriate capitalization.

### Step 7: Verify behavior

Check navigation, buttons, forms, menus, dialogs, filters, state updates, validation, loading, error recovery, and data persistence as relevant. Do not assume that a visually correct component is functionally correct.

### Step 8: Test responsive behavior

Test representative narrow and wide viewports, long content, increased text size, and touch/keyboard interactions where possible. Check for overflow, clipped actions, overlapping sticky content, and mobile virtual-keyboard problems.

### Step 9: Run project checks

Use available project scripts for build, tests, linting, type checking, or formatting as appropriate. Report checks accurately. If a check could not run, state that clearly rather than implying it passed.

### Step 10: Final review

Confirm that:

- The result meets the request.
- Existing behavior remains intact.
- No duplicate header or breadcrumb was added.
- Interface copy is concise and consistent.
- Mobile layout works with realistic content.
- Critical accessibility behaviors are preserved.
- Code has no comments under the zero-comments policy.
- No unused imports, debug statements, or dead styles were introduced.
- The final report clearly states changes and any unverified areas.

## 27. UI/UX Audit Checklist

### 27.1 Visual design

- [ ] Every page has a clear primary purpose.
- [ ] Hierarchy is recognizable within a few seconds.
- [ ] Primary actions are easy to locate.
- [ ] Typography is consistent.
- [ ] Spacing follows a coherent scale.
- [ ] Colors serve a semantic purpose.
- [ ] Borders, shadows, badges, and cards are not overused.
- [ ] Repeated components share the same visual language.
- [ ] Empty space is not filled with unnecessary text or decoration.
- [ ] Content remains clear with realistic data.

### 27.2 Interface copy

- [ ] Page and section titles are short and meaningful.
- [ ] Buttons usually use one or two words.
- [ ] Placeholders contain at most one word by default.
- [ ] Every meaningful input has a persistent accessible label.
- [ ] Subtitle text adds information instead of repeating the title.
- [ ] Helper text is concise.
- [ ] Toast messages are brief and specific.
- [ ] Errors describe the known problem clearly.
- [ ] Terminology and capitalization are consistent.
- [ ] No UX filler or duplicate copy remains.
- [ ] Required legal, safety, pricing, and decision information remains available.

### 27.3 Responsive and mobile

- [ ] No unintended horizontal page overflow exists.
- [ ] Page content adapts to narrow and wide screens.
- [ ] Headings wrap without clipping.
- [ ] Long URLs and identifiers do not break the layout.
- [ ] Critical content is not hidden by truncation.
- [ ] Inputs and actions remain usable with a virtual keyboard open.
- [ ] Tables use a deliberate mobile strategy.
- [ ] Dialogs fit at narrow widths and increased text sizes.
- [ ] Sticky elements do not obscure content or controls.
- [ ] Safe areas are respected where needed.
- [ ] Controls have comfortable touch targets.
- [ ] Increased text size or browser zoom does not destroy the layout.

### 27.4 Interaction and states

- [ ] Buttons perform their advertised actions.
- [ ] Hover states do not replace keyboard or touch feedback.
- [ ] Focus indicators are visible.
- [ ] Loading states communicate real ongoing work.
- [ ] Success is shown only after confirmed success.
- [ ] Errors provide a sensible recovery path where possible.
- [ ] Empty states give a useful next action when applicable.
- [ ] Destructive actions are clear and appropriately protected.
- [ ] Disabled controls are genuinely unavailable.
- [ ] Menus, tabs, accordions, and dialogs expose their state accessibly.

### 27.5 Accessibility

- [ ] Semantic elements are used correctly.
- [ ] Keyboard operation is supported where applicable.
- [ ] Focus order is logical.
- [ ] Interactive controls have accessible names.
- [ ] Form labels and errors are associated correctly.
- [ ] Text and meaningful graphical elements have sufficient contrast.
- [ ] Color is not the only status signal.
- [ ] Informative images have appropriate alternatives.
- [ ] Motion respects reduced-motion preferences.
- [ ] Important messages can be perceived by assistive technologies.

### 27.6 Code quality

- [ ] Source code contains no comments under this skill's default policy.
- [ ] No unused imports, variables, or dependencies were introduced.
- [ ] No dead code or debug statements remain.
- [ ] Shared components and tokens are reused appropriately.
- [ ] No unnecessary abstractions were added.
- [ ] Existing application behavior is preserved.
- [ ] No fake functionality or misleading success state was introduced.
- [ ] Build, tests, lint, and type checks were run when available.
- [ ] Unrun or failing checks are reported honestly.

## 28. Common Anti-Patterns

Do NOT:

- Add more text to fill empty space.
- Repeat a page title already displayed by the application shell.
- Use a placeholder instead of a proper label.
- Write paragraphs inside buttons.
- Hide essential instructions in tooltips.
- Make all cards, buttons, and badges visually prominent.
- Use color as the only status indicator.
- Truncate essential information without a way to view the full content.
- Shrink desktop typography until the page barely fits on mobile.
- Fix text containers to a height that clips content at larger font sizes.
- Use hover-only interactions for touch interfaces.
- Make controls so small that users struggle to activate them.
- Add sticky footers that cover fields or page content.
- Add modals for every small action.
- Add animation merely for decoration.
- Add dependencies without a clear benefit.
- Rewrite unrelated parts of the application during a focused UI task.
- Replace working behavior with static visual mockups.
- Claim a test or build passed without running it.
- Add source-code comments, docstrings, banners, or TODO markers under this policy.

## 29. Decision Rules

Use these questions when choosing between alternatives:

1. **Can this text be removed without reducing understanding, safety, accessibility, or task success?** Remove it.
2. **Can the action label be one word without becoming ambiguous?** Use one word.
3. **Would two words communicate the action more clearly?** Use two words.
4. **Does the user need the explanation before acting?** Show a concise explanation beside the action.
5. **Is the detail technical and infrequently needed?** Consider progressive disclosure.
6. **Is the information critical to safety, price, consent, access, or an irreversible action?** Keep it visible before commitment.
7. **Is an icon's meaning immediately clear in context?** If not, pair it with text.
8. **Does this design work with a long label, small viewport, and increased text size?** If not, correct it before shipping.
9. **Does a shared component or token already solve this?** Reuse it before making another implementation.
10. **Will the proposed change preserve existing behavior?** Verify before finishing.
11. **Does the component still work without hover, animation, or color perception?** Ensure accessible alternatives.
12. **Is this visual treatment functional or merely decorative?** Remove it if it adds no value.

## 30. Completion and Reporting Standard

When completing an implementation task, provide a concise report outside the source code. The report SHOULD identify:

- The main UI/UX changes made.
- The shared components or design tokens changed, when relevant.
- The responsive and accessibility improvements made.
- The checks actually run and their outcomes.
- Any important limitation or unverified behavior.

Do not repeat the full implementation details unless the user asks. Do not claim complete accessibility compliance based on a superficial review. Describe the scope of the checks accurately.

## 31. Final Master Standard

Every interface produced or modified under this skill MUST aim to be:

- **Minimal:** no unnecessary text, duplicated content, decoration, or components.
- **Clear:** users can identify purpose, information, and actions quickly.
- **Consistent:** terminology, visual tokens, component variants, and behavior are predictable.
- **Responsive:** layouts adapt to real content and a range of viewports.
- **Mobile-first:** touch, keyboard, text wrapping, safe areas, and virtual-keyboard behavior are considered.
- **Accessible:** semantic structure, contrast, focus, labels, keyboard support, and assistive-technology behavior are considered.
- **Functional:** controls do what they promise and states reflect real application behavior.
- **Maintainable:** code is clean, reusable where appropriate, and free from unnecessary complexity.
- **Comment-free:** source code contains no comments or docstrings by default.
- **Honest:** no fake data, fake success states, or unverified claims.

The governing rule is simple:

**Keep every element that helps users understand or complete the task. Remove everything that only adds noise.**

---

## 32. Navigation Architecture & Anti-Duplicate Layout Rule

1. **Sidebar Exclusivity (Anti-Duplicate Sub-Menu)**:
   - When navigation sections, routes, or categories are already present in the primary application sidebar (e.g. accordion/dropdown sub-menus), you MUST NOT duplicate those same navigation links inside the page body or layout container as an inner sidebar (`<aside>`) or duplicate sub-navigation bar.
   - Secondary inner-nav sidebars next to the main sidebar confuse users, cause visual redundancy, and waste screen space.

2. **Full-Width Canvas (Maximized Content Area)**:
   - Page layouts whose sub-routes are handled by the main sidebar MUST allocate 100% of the content container width (`w-full min-w-0`) to the functional cards, forms, controls, and tables.
   - Never shrink page content into an artificial split column (e.g. `grid-cols-[240px_1fr]`) just to display duplicate navigation.

3. **Component Tabs vs. Route Navigation**:
   - Component-level tabs (e.g., `Tabs` for switching cURL / JavaScript / Python / PHP snippets) are for switching internal views or data modes within a single component.
   - Application route navigation belongs exclusively in the main sidebar.
