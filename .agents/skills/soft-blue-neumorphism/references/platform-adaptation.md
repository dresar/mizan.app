# Platform Adaptation Guide

The Soft Blue design language should remain recognizable across web, PWA, Android, and iOS. Do not force identical controls when platform conventions differ.

## 1. Web application

- Use semantic HTML, responsive CSS, and accessible component primitives.
- Use CSS variables for design tokens.
- Use CSS Grid for dashboard layouts: 2 columns on mobile, 3 on tablet, 4 on desktop by default.
- Use a fixed desktop sidebar and a stable header with a separately scrolling main area.
- Replace the sidebar with a hamburger drawer on mobile and add a bottom bar for the primary routes when appropriate.
- Use `position: sticky` or `fixed` only with deliberate content offsets and stacking contexts.
- Use `100dvh` where supported for viewport-height layouts, with sensible fallbacks.
- Respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` for installed PWAs on devices with display cutouts.
- Use `prefers-reduced-motion` and `:focus-visible`.

## 2. PWA

A PWA is a web application with installability and optional offline capabilities. It is not automatically equivalent to a native Android or iOS app.

Implement deliberately:

- A valid web app manifest with name, short name, start URL, scope, theme color, background color, display mode, and icon sizes.
- Appropriate PNG or SVG source icons plus generated platform sizes, including maskable icons where needed.
- A service worker only when caching/offline behavior is specified and tested.
- Clear offline, update-available, and installation states when those features are implemented.
- Secure HTTPS hosting.

Do not cache authenticated/private responses carelessly. Define what is safe to cache and how stale data is invalidated.

## 3. React Native with Expo

- Use `react-native-safe-area-context` for safe areas where appropriate.
- Use `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `Modal`, and native accessibility props rather than web-only elements.
- Use `StyleSheet` or the project's existing styling system with shared theme tokens.
- Use `lucide-react-native` or `@phosphor-icons/react-native` if already compatible with the project; these packages commonly use `react-native-svg`.
- Use `react-native-reanimated` only when a more complex animation is justified. Simple transitions should stay simple.
- Use a suitable navigation library already in the project, such as Expo Router or React Navigation.
- Account for the on-screen keyboard, Android back button, status bar, notch, and bottom gesture area.
- Use native bottom tabs where they fit the app, and a drawer or modal route menu for secondary navigation.
- Use platform-specific shadows carefully: Android elevation and iOS shadow properties do not behave identically. Keep the same perceived elevation rather than copying CSS shadow numbers literally.
- Test on small Android devices, a current iPhone-size viewport, and at least one device with a display cutout.

### Build outputs

- Android internal testing: build an APK when the distribution path requires a directly installable file.
- Google Play: build an AAB for store distribution.
- iOS testing/distribution: use the appropriate signed build and TestFlight/App Store path. An Apple Developer account and signing configuration are generally required for distribution to physical devices beyond local simulator work.
- Do not promise a finished APK/IPA unless the necessary SDK, credentials, signing, and build pipeline are available.

## 4. Flutter

- Use `ThemeData` and `ColorScheme` to centralize colors and component themes.
- Use `MediaQuery`, `LayoutBuilder`, and adaptive layout decisions for responsive behavior.
- Use `SafeArea` for cutouts and system UI regions.
- Use `NavigationBar` for a concise mobile primary navigation and `NavigationDrawer` for secondary navigation where suitable.
- Use `lucide_icons` or another single icon package. Use `flutter_svg` for original SVG assets when required.
- Keep the shared tokens in one theme module and use reusable widgets for buttons, fields, cards, navigation, and feedback.
- Use platform-aware shadow/elevation settings and test on both Android and iOS.
- Handle keyboard insets and scroll-to-focused-field behavior on forms.

## 5. Native Android

- Use the project's existing UI toolkit, preferably Jetpack Compose for a modern Compose-based application.
- Put colors, typography, shapes, and spacing into a shared theme.
- Use `Scaffold`, `NavigationBar`, and `ModalNavigationDrawer` where appropriate.
- Keep navigation and page state stable; do not rebuild the whole screen unnecessarily when switching tabs.
- Use a consistent vector icon set or original vector drawables. Do not use emoji or random text symbols.
- Respect system bars, edge-to-edge layout, back navigation, keyboard insets, and accessibility semantics.

## 6. Native iOS

- Use the project's existing UI toolkit, preferably SwiftUI for a modern SwiftUI-based application.
- Put colors, typography, shapes, and spacing into a central theme.
- Use `safeAreaInset`, `NavigationStack`, `TabView`, and sheets where appropriate.
- Maintain a minimal header and concise labels, while respecting iOS navigation and gesture behavior.
- Use a consistent custom icon asset family. SF Symbols may be used only when the product accepts native glyphs and they remain visually consistent with the selected icon style.
- Support Dynamic Type, VoiceOver, safe areas, keyboard behavior, and reduced motion.

## 7. Cross-platform parity

The following should remain consistent across platforms:

- Semantic color roles and overall Soft Blue palette.
- Typography hierarchy and concise UI copy.
- Card and control radius hierarchy.
- Spacing scale and responsive content priorities.
- Icon family and icon meanings.
- Button variants and status semantics.
- Navigation information architecture.
- Loading, empty, error, success, and disabled states.

The following may vary to respect platform conventions:

- Navigation transitions and gestures.
- Native keyboard and form controls.
- Dialog versus bottom sheet behavior.
- Shadow/elevation implementation.
- System status/navigation bars.
- Permission prompts and platform settings routes.

## 8. Platform validation matrix

| Target | Minimum validation |
|---|---|
| Mobile web | 360px and 390px viewport, touch navigation, soft keyboard, safe-area behavior where applicable |
| Tablet web | 768px and 1024px, navigation state, grid transition, table behavior |
| Desktop web | 1280px and 1440px, fixed sidebar/header, independent content scrolling, keyboard focus |
| PWA | Install prompt/flow, manifest icons, launch mode, update/offline behavior if implemented |
| Android | Small screen, back button, status/navigation bars, keyboard, APK/AAB build if requested |
| iOS | Safe areas, Dynamic Type, keyboard, VoiceOver basics, simulator/device build and signing where available |
