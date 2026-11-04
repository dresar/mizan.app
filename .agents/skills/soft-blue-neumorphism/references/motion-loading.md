# Motion, Animation, and Backend Loading

Animation is a required part of the Soft Blue experience, but it must be purposeful, short, accessible, and performant. The rule is **motion across meaningful states**, not motion on every pixel.

## 1. Motion principles

- Motion should explain hierarchy, navigation, cause and effect, or the result of an action.
- Prefer `opacity` and `transform`; animate shadow and color sparingly. Avoid repeatedly animating layout dimensions, blur filters, or large painted areas.
- Use the design tokens from `design-system.md`. Keep timing consistent across the product.
- Do not add constant floating, bouncing, pulsing, blinking, rotating decorations, or animated gradient backgrounds.
- Keep content readable and usable while transitions run.
- Do not animate a page in a way that delays access to important content or causes layout shift.
- Every animation must have a reduced-motion alternative.

## 2. Required motion map

| UI area | Expected motion | Notes |
|---|---|---|
| Page/route content | Brief opacity and small vertical entrance | Animate the main content group once; do not cascade dozens of children |
| Button | Hover/press feedback and quick state transition | Touch users need a pressed state; keyboard focus remains visible |
| Card/list item | Small hover lift or surface shift on pointer devices | Do not imply that a non-clickable card is interactive |
| Sidebar collapse | Short width/opacity transition | Preserve layout state and avoid route-change bouncing |
| Mobile drawer | Slide in with backdrop fade | Lock background scroll, handle escape/back, restore focus |
| Dialog/bottom sheet | Fade + small translate/scale | Trap focus and restore focus on close |
| Dropdown/popover | Short fade/translate | Avoid large zoom effects |
| Tabs/segmented control | Selected indicator/surface transition | Selection must also be programmatically exposed |
| Toast/snackbar | Brief entry/exit | Keep readable long enough; do not hide critical errors automatically |
| Skeleton | Optional soft shimmer | Shimmer must be subtle and disabled/reduced for reduced-motion users |
| Chart/data refresh | Small progress or content transition | Never animate fake data values to imply real measurements |
| Form validation | Immediate border/state update; optional short fade | Do not shake repeatedly or rely on red color alone |

## 3. Motion tokens

Use existing project tokens where present. Suggested web defaults:

```css
:root {
  --ease-soft: cubic-bezier(.2, .7, .2, 1);
  --motion-micro: 140ms;
  --motion-normal: 200ms;
  --motion-panel: 260ms;
  --motion-page: 220ms;
}

.interactive-surface {
  transition: transform var(--motion-normal) var(--ease-soft),
    box-shadow var(--motion-normal) var(--ease-soft),
    background-color var(--motion-normal) var(--ease-soft);
}

.interactive-surface:active {
  transform: translateY(1px) scale(.99);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

Do not duplicate global animation rules if the project already has a robust motion system. Keep native animation durations within a similarly calm range and honor iOS/Android accessibility settings.

## 4. Async state contract

Any action that waits on a real asynchronous operation must communicate its state. This includes API requests, backend database operations, uploads, downloads, file processing, search, filters that query a server, authentication, and AI requests.

Each async operation should define the applicable states:

1. **Idle:** normal content and available action.
2. **Pending:** spinner, skeleton, progress, or an inline status appropriate to the operation.
3. **Success:** updated content and concise confirmation when useful.
4. **Empty:** request succeeded but returned no results.
5. **Error:** clear explanation and a safe next action.
6. **Retry:** retry only when the operation is safe to repeat; use idempotency for sensitive writes where supported.
7. **Stale/refreshing:** preserve usable existing content while showing a small refresh indicator when appropriate.
8. **Disabled:** prevent duplicate submission while a non-repeatable operation is pending.

Do not invent API endpoints or backend state. Inspect the existing API client, data-fetching library, schemas, and auth contracts. If the backend does not exist, implement an explicit adapter/interface and document the missing integration rather than simulating a real server result.

## 5. Choose the right loading pattern

| Situation | Pattern |
|---|---|
| Initial dashboard or page data | Skeletons matching the final layout |
| List/table results | Row/card skeletons with stable dimensions |
| Button mutation or form submit | Spinner inside the button; disable duplicate submit |
| Small icon action | Compact spinner or pending icon with accessible status |
| Search request | Preserve typed query; show inline pending state and empty/error results |
| Pagination | Keep current content stable and show local list/page loading state |
| File upload/download | Measurable progress only when the transport exposes real progress; otherwise indeterminate pending state |
| Long-running server job | Server-backed job status and polling/subscription with cancel/timeout behavior if supported |
| Background refresh | Small nonblocking indicator; do not replace the entire page with a skeleton |
| Lazy image | Reserved aspect-ratio box and image placeholder until load/error |
| Route transition | Keep shell stable; show route-level progress only when a real wait occurs |

Use `aria-busy="true"` on the region that is actually updating. Announce meaningful updates through a concise `role="status"` or `aria-live="polite"` region. Use `role="alert"` for urgent errors, not for routine loading. Ensure spinner-only controls still have an accessible name and loading text.

## 6. Skeleton rules

- Match the final content's approximate dimensions and spacing to prevent layout shift.
- Use skeletons only when a real request is pending and the final layout is known.
- Prefer neutral low-contrast blue-gray surfaces; keep shimmer low amplitude and slow.
- Do not put text or fake numbers inside skeletons that could be mistaken for real data.
- If cached content exists, prefer keeping it visible and marking it as refreshing rather than replacing it with skeletons.
- On timeout or failure, transition out of skeleton state into an error or retry UI.

## 7. Backend request lifecycle

- Use the application's established server-state library or request abstraction when available.
- Cancel obsolete requests on route/query changes when supported. Prevent stale responses from overwriting newer results.
- Debounce high-frequency search requests where appropriate, without making the UI feel unresponsive.
- Preserve user input and safe unsaved state across recoverable failures.
- For mutations, prevent accidental double submission and communicate whether the operation completed.
- Use optimistic UI only when rollback and conflict behavior are clearly defined. Prefer pessimistic updates for destructive, financial, permission, or irreversible operations.
- Handle authentication expiry, forbidden responses, validation errors, network loss, rate limits, and server failures distinctly where the backend exposes those cases.
- Never expose tokens, stack traces, SQL errors, or internal hostnames in user-facing messages.
- Use timeout and retry policies that match the operation. Avoid blindly retrying non-idempotent mutations.
- Do not keep a loader running after the operation has resolved or been cancelled.

## 8. Native application adaptation

- React Native: use native activity indicators or a consistent small spinner, accessible state labels, and Reanimated only for motion that benefits from it.
- Flutter: use theme-controlled progress indicators and implicit animations for simple transitions; avoid excessive rebuilds.
- Android Compose: use `AnimatedVisibility`, `animate*AsState`, and Material progress APIs where suitable; honor system animation settings.
- SwiftUI: use transitions and animation modifiers sparingly; respect Reduce Motion and Dynamic Type.
- Native safe areas, keyboard insets, navigation gestures, and system back behavior must remain functional during overlays and transitions.

## 9. Performance safeguards

- Animate only `transform` and `opacity` by default; use compositor-friendly properties where possible.
- Avoid `backdrop-filter` and large shadow animations on low-end devices.
- Keep shimmer and skeleton animation off under reduced motion or low-power constraints when detectable.
- Avoid mounting expensive off-screen animated components unnecessarily.
- Do not introduce a large animation framework for simple CSS transitions.
- Keep motion consistent across pointer, touch, keyboard, and screen-reader interactions.

## 10. Motion and async acceptance checklist

- [ ] Meaningful page, navigation, control, and overlay transitions exist.
- [ ] Motion is restrained and consistent with Soft Blue visual language.
- [ ] Reduced-motion users can complete every task without required animation.
- [ ] Every real backend/network operation has an explicit pending state.
- [ ] Skeletons reserve layout space and match the final content shape.
- [ ] Mutations prevent accidental duplicate submissions.
- [ ] Empty, error, retry, success, and stale-data states exist where relevant.
- [ ] Loading feedback is accessible to assistive technology.
- [ ] No fake percentages, false success, or indefinite loading loops are present.
- [ ] Existing content remains usable during non-blocking background refreshes.
