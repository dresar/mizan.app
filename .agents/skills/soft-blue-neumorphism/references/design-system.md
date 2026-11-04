# Soft Blue Design System

## 1. Color tokens

Use these as the default light theme. Keep tokens centralized and expose them through CSS variables, a theme object, or typed constants.

| Token | Hex | Use |
|---|---|---|
| `primary` | `#315BE8` | Main action, active state, links |
| `primary-strong` | `#2448CB` | Pressed state, strong emphasis |
| `primary-soft` | `#E8EEFF` | Selected backgrounds, soft highlights |
| `primary-light` | `#5279F5` | Gradient accent |
| `background` | `#EDF1FC` | App background |
| `surface` | `#F4F6FF` | Main cards and panels |
| `surface-raised` | `#F8F9FF` | Raised controls |
| `surface-inset` | `#EAF0FC` | Inputs, search wells, inset areas |
| `text` | `#1B2943` | Primary text |
| `text-muted` | `#778399` | Secondary text |
| `border` | `#DCE4F3` | Quiet boundaries |
| `success` | `#219B70` | Success |
| `warning` | `#C58A2A` | Warning |
| `danger` | `#D94B5B` | Destructive/error |
| `info` | `#3974D8` | Informational state |

Do not use the palette blindly if text contrast fails. Adjust the foreground or surface token while preserving the overall color character.

## 2. Gradient tokens

Use gradients sparingly:

```css
:root {
  --gradient-primary: linear-gradient(135deg, #5279F5 0%, #315BE8 58%, #2448CB 100%);
  --gradient-page: radial-gradient(circle at 8% 0%, rgba(255,255,255,.92), transparent 32%), linear-gradient(135deg, #EAF0FF 0%, #F5F7FF 55%, #E9EEFB 100%);
  --gradient-glow: radial-gradient(circle, rgba(91,129,245,.12), transparent 68%);
}
```

Primary gradient is for the main call to action and a few selected accents. Page gradient should be very low contrast. Do not apply gradients to every card or every label.

## 3. Elevation and neumorphic shadows

```css
:root {
  --shadow-raised: 7px 7px 16px rgba(194, 204, 225, .72), -7px -7px 16px rgba(255, 255, 255, .94);
  --shadow-raised-sm: 4px 4px 10px rgba(194, 204, 225, .58), -4px -4px 10px rgba(255, 255, 255, .9);
  --shadow-inset: inset 3px 3px 7px rgba(197, 207, 228, .68), inset -3px -3px 7px rgba(255, 255, 255, .95);
  --shadow-floating: 0 14px 36px rgba(63, 83, 130, .13);
  --shadow-focus: 0 0 0 3px rgba(49, 91, 232, .2);
}
```

Rules:

- Raised shadow for a small set of interactive surfaces and cards.
- Inset shadow for inputs, pressed surfaces, and recessed wells.
- Floating shadow for menus, dialogs, and mobile drawers.
- Prefer a quiet 1px border on dense surfaces instead of adding another shadow.
- Never use strong double shadows behind long text blocks or large tables.

## 4. Radius tokens

| Token | Value | Use |
|---|---:|---|
| `radius-xs` | `8px` | Small tags, compact controls |
| `radius-sm` | `12px` | Inputs, icon buttons |
| `radius-md` | `16px` | Buttons, list rows |
| `radius-lg` | `20px` | Cards, menus |
| `radius-xl` | `26px` | Main panels, mobile sheets |
| `radius-pill` | `999px` | Pills, status chips |

Use a consistent radius hierarchy. Avoid mixing unrelated radii on the same screen.

## 5. Spacing and sizing

Use a 4px base rhythm:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- Mobile page padding: `16px`.
- Tablet page padding: `24px`.
- Desktop page padding: `28–40px`.
- Mobile card padding: `16px`.
- Desktop card padding: `20–24px`.
- Mobile grid gap: `12–16px`.
- Desktop grid gap: `16–24px`.
- Form field vertical gap: `16–20px`.
- Touch target: minimum `44 × 44px`.

## 6. Typography

Use the product's existing typeface when appropriate. Otherwise prefer a clean system sans such as Inter, Geist, or the platform system font.

| Style | Default |
|---|---|
| Page title | `24–32px`, 700–800 |
| Section title | `17–20px`, 650–750 |
| Card title | `14–16px`, 600–700 |
| Body | `14–16px`, 400–500 |
| Supporting | `12–13px`, 400–500 |
| Button | `14–15px`, 600–700 |

Keep line height comfortable. Avoid ultra-light font weights for essential text. Do not reduce text size just to fit a fixed-height card.

## 7. Motion tokens

```css
:root {
  --ease-soft: cubic-bezier(.2, .7, .2, 1);
  --motion-fast: 140ms;
  --motion-normal: 200ms;
  --motion-panel: 260ms;
}
```

Prefer transitions on `transform`, `opacity`, `box-shadow`, and `background-color`. Do not animate layout dimensions continuously. Add a reduced-motion override.

## 8. Web CSS starter

```css
:root {
  color-scheme: light;
  --color-primary: #315BE8;
  --color-primary-strong: #2448CB;
  --color-primary-soft: #E8EEFF;
  --color-background: #EDF1FC;
  --color-surface: #F4F6FF;
  --color-surface-inset: #EAF0FC;
  --color-text: #1B2943;
  --color-muted: #778399;
  --color-border: #DCE4F3;
  --gradient-primary: linear-gradient(135deg, #5279F5, #315BE8 58%, #2448CB);
  --shadow-raised: 7px 7px 16px rgba(194,204,225,.72), -7px -7px 16px rgba(255,255,255,.94);
  --shadow-inset: inset 3px 3px 7px rgba(197,207,228,.68), inset -3px -3px 7px rgba(255,255,255,.95);
  --radius-card: 20px;
  --radius-control: 14px;
  --motion-normal: 200ms;
  --ease-soft: cubic-bezier(.2,.7,.2,1);
}

* { box-sizing: border-box; }
body {
  margin: 0;
  color: var(--color-text);
  background: var(--color-background);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (min-width: 768px) {
  .dashboard-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
}

@media (min-width: 1024px) {
  .dashboard-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

## 9. Theme consistency

- Keep a light theme as the default visual reference unless the project explicitly requires dark mode.
- If dark mode is requested, create a deliberate dark palette; do not just invert the light theme.
- Status colors must remain recognizable in both themes.
- Use the same semantic tokens across all pages and app platforms.
