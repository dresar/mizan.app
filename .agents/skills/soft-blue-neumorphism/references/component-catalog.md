# Component Catalog

This catalog defines the baseline reusable UI kit. Adapt component names to the project's conventions. Build only what the product needs, but use the same visual and interaction rules everywhere.

## 1. App shell

### `AppShell`
- Owns desktop sidebar, top header, main content, and responsive mobile navigation.
- Exposes slots/regions for primary navigation, page actions, and page content.
- Handles viewport height, safe areas, and content offsets.

### `Sidebar`
- Desktop: fixed left rail, `232–264px` wide; optional collapsed state `72–80px`.
- Contains brand, grouped navigation, active route, and account area.
- Uses short one-word navigation labels.
- Must remain stationary while only the main region scrolls.
- If content overflows, scroll the navigation region independently without moving the logo and footer where possible.

### `MobileDrawer`
- Opened by a hamburger button.
- Uses a backdrop, clear close action, focus management, escape/back handling, and scroll locking.
- Closes after selecting a route unless the flow requires otherwise.
- Drawer width usually `min(86vw, 340px)`.

### `TopHeader`
- Desktop: `56–64px`, minimal, sticky/fixed.
- Mobile: `52–60px`, hamburger + short title + one or two key actions.
- Avoid multiple rows, oversized logos, or large decorative headers.

### `BottomNavigation`
- Mobile only by default. Use for 3–5 primary routes.
- Icon plus concise label. Active item must be clear beyond color alone.
- Respect `env(safe-area-inset-bottom)` on web and native safe-area APIs on apps.
- Reserve matching space below content so the bar never covers the last card or button.

### `Breadcrumbs`
- Desktop: show only when route hierarchy helps orientation.
- Mobile: shorten or omit intermediate levels rather than wrapping into several lines.

## 2. Actions and controls

### `Button`
Variants: `primary`, `secondary`, `soft`, `ghost`, `danger`, `link`.
Sizes: `sm`, `md`, `lg`, and full-width on mobile where appropriate.
States: default, hover, focus-visible, pressed, disabled, loading.

- Primary: blue gradient, white text, restrained raised shadow.
- Secondary/soft: light surface with subtle raised or inset treatment.
- Ghost/link: no heavy shadow.
- Danger: semantic danger color; never use blue for destructive confirmation.
- Labels should usually be one word.
- Do not use more than one visually dominant primary action in a small panel.

### `IconButton`
- Square or circular, minimum `44 × 44px` hit target.
- Requires accessible name and optional tooltip.
- Use the chosen icon library or custom SVG only.

### `Link`
- Text link for navigation or inline reference.
- Must have a visible hover/focus style and must not look like a disabled label.

### `Tabs` and `SegmentedControl`
- Use only for a small number of mutually exclusive views.
- Keep labels concise. Horizontal scroll is preferable to wrapping into multiple rows on narrow mobile.
- Provide a clear selected state and keyboard support.

### `Badge`
Variants: neutral, primary, success, warning, danger, info.
- Use for status or compact metadata, not for decoration or headings.
- Keep text short.

### `Tooltip`
- Use for icon-only controls or truncated labels where the meaning is not otherwise visible.
- Must be available to keyboard and touch users; do not make essential information hover-only.

## 3. Forms

### `FormField`
- Wraps a visible label, control, optional hint, and validation message.
- Label remains visible when the field has a value.
- Error text is concise and connected to the input programmatically.

### `TextInput`
- Variants for standard, search, password, and numeric where needed.
- Use a calm inset surface, clear border/focus ring, and visible disabled/error state.
- Avoid excessive inner shadow that reduces contrast.

### `Select`
- Prefer native accessible select behavior on web unless a custom list is necessary.
- Custom dropdown must support keyboard navigation, typeahead where practical, escape, and focus return.

### `Checkbox`, `Radio`, `Switch`
- Use native semantic controls or accessible wrappers.
- Do not rely only on a tiny visual mark; make the full label clickable.
- Switch is for immediate on/off settings; checkbox is for selection or confirmation.

### `Textarea`
- Resizable only when helpful. Provide sensible minimum height.

### `DatePicker` / `TimePicker`
- Use platform-native controls where they improve accessibility and expected behavior.
- Keep displayed formats localized and validation explicit.

## 4. Data and content

### `Card`
Variants: `default`, `raised`, `inset`, `interactive`, `flat`.
- Use raised treatment selectively. Dense information should use flat or lightly bordered surfaces.
- Interactive cards need hover, focus, and pressed states and one clear action target.

### `StatCard`
- Short label, prominent value, optional concise trend.
- Desktop dashboard grid: 4 columns by default.
- Mobile dashboard grid: 2 columns by default.
- Allow a full-width span for long descriptions or charts.

### `ListRow`
- Consistent alignment, clear title, optional supporting detail, and trailing action/status.
- On mobile, allow the row to wrap naturally; do not squeeze text beside too many controls.

### `Table`
- Desktop: clear column headers, alignment, sorting, pagination, and row hover.
- Mobile: transform into summary cards when the task is better represented that way; otherwise use an intentional horizontal scroller with an accessible label.
- Never shrink table text to unreadable sizes just to fit.

### `Pagination`
- On mobile, show compact previous/next and current page context.
- On desktop, show page numbers when useful.

### `FilterBar` and `SortControl`
- Keep the most-used filter visible. Move secondary controls into a filter drawer on mobile.
- Show active filter count and an obvious clear action.

### `ChartCard`
- Chart must resize with its container, use legible labels, and include a textual summary where the data matters.
- Use blue as the primary data color and use semantic status colors only when meaning requires them.

## 5. Feedback and overlays

### `Dialog`
- Use for focused tasks and confirmations, not entire complex workflows on small screens.
- Trap focus while open, close on escape when safe, and return focus to the trigger.
- On mobile, use a sheet or near-full-screen layout when that is easier to use.

### `ConfirmationDialog`
- State the effect clearly. Keep actions precise: `Batal`, `Hapus`.
- Destructive action uses danger styling and must not be the default focused action without good reason.

### `Drawer` / `BottomSheet`
- Use for navigation, filters, and mobile secondary flows.
- Respect safe areas and allow a clear dismissal gesture/control.

### `Toast` / `Snackbar`
- Short messages: `Tersimpan`, `Gagal`, `Dikirim`.
- Include a retry/undo action only when it is safe and meaningful.
- Do not use toast as the only place for critical or persistent errors.

### `Alert`
- Use for persistent important information, with an icon from the approved icon family and concise text.

### `Skeleton` and `Spinner`
- Use skeletons when layout is known and data is loading.
- Use spinners for short local actions. Include accessible loading text for assistive technology.

### `EmptyState` and `ErrorState`
- Say what is missing or what failed and provide one useful action.
- Avoid generic illustrations that add no meaning. Use a simple original SVG illustration only when it improves comprehension.

## 6. Layout primitives

### `PageContainer`
- Owns page width, horizontal padding, and responsive content width.
- Suggested max width: `1440px` for admin/dashboard workspaces; narrower for reading or form-focused pages.

### `PageHeader`
- One clear title, optional short description, and a small number of actions.
- On mobile, stack actions only when necessary; avoid a tall header.

### `SectionHeader`
- Short title plus optional one-word action such as `Lihat` or `Tambah`.

### `ResponsiveGrid`
- Default 2 columns on mobile, 3 on tablet, and 4 on desktop.
- Supports item spans and content-driven single-column fallbacks.

### `Stack`, `Inline`, `Divider`
- Shared spacing primitives that keep layouts consistent.
- Avoid arbitrary margins scattered across page components.

## 7. Required states for all components

For each applicable component, explicitly design and implement:

- Default.
- Hover for pointer devices.
- Focus-visible for keyboard.
- Pressed/active.
- Disabled.
- Loading/pending.
- Error/invalid.
- Success/selected.

A state may be omitted only when it does not make semantic sense for that component.
