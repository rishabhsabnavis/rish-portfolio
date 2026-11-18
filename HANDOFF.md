# Handoff Spec: RISH Portfolio ("CD Player")

Paste the "Kickoff prompt" section into Claude Code from the root of a new repo, with this whole folder copied into it.

## Kickoff prompt

> Build my portfolio site from `HANDOFF.md`. The visual reference is `reference/Main.dc.html` (a design-tool export: treat its markup, inline styles and the `renderVals()` logic as the source of truth for layout, copy, colors and behavior, but do not ship that file or its `support.js` runtime). Use Vite + React + TypeScript with plain CSS (CSS modules or one global stylesheet with custom properties, no Tailwind). Put images in `public/assets/`. Follow every section of this spec, then run the acceptance checklist at the bottom and report anything you could not meet.

## Folder contents

| Path | What it is |
|------|------------|
| `HANDOFF.md` | This spec |
| `reference/Main.dc.html` | The approved design, interactive. Logic class at the bottom holds the project data and state rules |
| `public/assets/background.png` | Full-page green flow artwork (912 x 1296, portrait) |
| `public/assets/cd-player.png` | Line-drawn CD player illustration (912 x 1296, player body cropped from it) |
| `public/assets/discs/` | EMPTY: export the six Cosmos images here (see Assets) |

## Overview

A one-page portfolio where projects are CDs. Visitors pick a disc from a rack, it flies into an illustrated CD player and spins, and a "liner notes" panel shows that project. The look is abstract and botanical: green line art, frosted glass panels, an editorial serif paired with a monospace.

Single route `/`. No backend. All content lives in one typed data file.

## Assets

1. `background.png` and `cd-player.png` are included. Convert both to WebP (quality ~82) at build or by hand; keep the PNG as fallback only if needed.
2. Disc art: six images from the Cosmos collection `cosmos.so/rish.s/portfolio`. Save them as `public/assets/discs/01.webp` to `06.webp`. Current pairing in the design (swap freely):

| Disc | Project | Cosmos image used in the design |
|------|---------|---------------------------------|
| 01 | emolog | cosmos_1956313768 (9:16) |
| 02 | Bookr | cosmos_2026317422 |
| 03 | GigCaller | cosmos_1793167515 |
| 04 | ContextOS | cosmos_1327235501 |
| 05 | CPU Gaussian Splatting | cosmos_410383049 |
| 06 | Urban Noise Classifier | cosmos_785630039 (square) |

Disc images are always shown cropped to a circle with `object-fit: cover`, so any aspect ratio works. Export at least 800 px on the short side.

## Design tokens

Define these as CSS custom properties on `:root`.

### Color

| Token | Value | Usage |
|-------|-------|-------|
| `--paper` | `#f7f9f5` | Page ground, disc center hole |
| `--ink` | `#0e2a14` | Headings, primary text, focus outline |
| `--ink-2` | `#1d3a23` | Body copy in panels |
| `--ink-3` | `#34503a` | Secondary text, mono labels (passes 4.5:1 on `--paper`) |
| `--link` | `#12501f` | Links; hover goes to `--ink` |
| `--accent` | `#1f6b2e` | Italic hero word, "+" bullets, "PLAYING" slot, "B-side" heading. Alternates: `#12501f`, `#2b7a3a`, `#0e2a14` |
| `--glass-bg` | `rgba(247,249,245,0.80)` | Frosted panels |
| `--glass-border` | `rgba(255,255,255,0.75)` | Panel border |
| `--glass-shadow` | `0 20px 50px rgba(14,42,20,0.10)` | Panel shadow |
| `--chip-border` | `rgba(14,42,20,0.25)` | Stack chips |
| `--ctrl-bg` / `--ctrl-bg-hover` / `--ctrl-border` / `--ctrl-fg` | `#0f3318` / `#174523` / `#1f4d28` / `#e6f4e2` | Play and eject buttons |
| `--lcd-bg` / `--lcd-fg` / `--lcd-dim` | `#082210` / `#a8e6a0` / `#8fb894` | Track readout |
| `--led-on` / `--led-off` | `#4fd15a` / `rgba(63,122,74,0.5)` | Status light on the player |

### Player tone (illustration recolor)

The player PNG is recolored with a CSS `filter` and blended with `mix-blend-mode: multiply` so its white paper disappears into the panel. Ship "Forest" as the default; keep the others in a `const` so it is a one-line change.

| Tone | `filter` | Disc ring color |
|------|----------|-----------------|
| Forest (default) | `saturate(1.6) brightness(0.82) contrast(1.25)` | `#12501f` |
| Leaf | `saturate(1.1) contrast(1.05)` | `#2b7a3a` |
| Moss | `sepia(0.35) hue-rotate(25deg) saturate(1.3) brightness(0.9) contrast(1.15)` | `#4a5a1f` |
| Ink | `grayscale(1) brightness(0.7) contrast(1.6)` | `#0e2a14` |

### Type

Load from Google Fonts with `display=swap`: Instrument Serif (400, 400 italic), Space Mono (400, 700), Inter (400, 500, 600).

| Token | Spec | Usage |
|-------|------|-------|
| `--font-display` | Instrument Serif 400, `clamp(56px, 9vw, 132px)`, line-height 0.92, tracking -0.02em | Hero h1 |
| `--font-title` | Instrument Serif 400, `clamp(48px, 6vw, 84px)`, lh 0.95 | Project title (h2) |
| `--font-quote` | Instrument Serif italic, 44px, lh 1.05 | Empty-state line, "B-side" (48px) |
| `--font-body-lg` | Inter 400, 17px, lh 1.6 | Project blurb, about copy |
| `--font-body` | Inter 400, 15 to 16px, lh 1.5 to 1.6 | Notes, hero intro |
| `--font-label` | Space Mono 400, 12px, tracking 0.2em, uppercase | Section labels ("LINER NOTES", "THE RACK") |
| `--font-nav` | Space Mono 400, 13px, tracking 0.08em | Nav, footer links |
| `--font-lcd` | Space Mono 400, 13px, tracking 0.12em | Readout |

### Spacing and shape

| Token | Value |
|-------|-------|
| `--space-1..8` | 4, 8, 12, 16, 24, 32, 48, 56 px |
| `--radius-panel` | 32px (hero 36px) |
| `--radius-pill` | 999px (nav, footer, chips) |
| `--radius-ctrl` | 14px |
| Content max width | 1280px, side padding 40px (20px under 640px) |

## Layout (top to bottom)

All content sits in a centered `max-width: 1280px` column over two fixed decorative layers.

1. **Background layer** (`aria-hidden`, `pointer-events: none`, absolutely positioned to cover the full page height):
   - `background.png`, `object-fit: cover`, full bleed.
   - Loaded-disc wash: the current disc's image, inset -10%, `filter: blur(80px) saturate(1.2)`, opacity 0.22, `mix-blend-mode: multiply`. Only present when a disc is loaded; crossfades on change.
   - Two drifting outline circles (1px `rgba(14,42,20,0.14)` and `0.10`), 720px at right -220px / top 120px and 420px at left -140px / top 640px.
   - Readability wash on top: `linear-gradient(180deg, rgba(247,249,245,.10) 0%, rgba(247,249,245,.35) 45%, rgba(247,249,245,.70) 100%)`.
2. **Nav**: glass pill, margin-top 24px, padding 16px 28px. Left "RISH" (Space Mono 700, 14px, 0.2em). Right links WORK, ABOUT, CONTACT jumping to `#work`, `#about`, `#contact`.
3. **Hero** (`#top`): 72px vertical padding around a glass card (padding 48px, radius 36px). Flex row, wraps: h1 `flex: 1 1 560px`, intro paragraph `flex: 0 1 320px` aligned to the bottom.
4. **Work** (`#work`): flex row, wraps, gap 48px.
   - Player column: `flex: 1 1 440px; max-width: 520px`.
   - Liner notes: glass panel, `flex: 1 1 420px`, padding 40px.
5. **Rack**: glass panel, padding 40px, `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))`, gap 28px. Header row with "THE RACK" left and "06 DISCS" right (derive the count from data).
6. **About** (`#about`): glass panel, padding 48px. "B-side" heading `flex: 0 1 280px`, copy `flex: 1 1 480px`, max 640px.
7. **Footer** (`#contact`): glass pill, padding 22px 32px. Email left, GitHub / LinkedIn / SoundCloud right.

Glass panel recipe: `background: var(--glass-bg); backdrop-filter: blur(16px) saturate(1.2)` (with `-webkit-` prefix), border, shadow. Add an `@supports not (backdrop-filter: blur(1px))` fallback of `rgba(247,249,245,0.94)`.

## The CD player (the key component)

Structure: a glass card (padding 20px, radius 32px, background `rgba(247,249,245,0.92)`) containing a crop box, then the readout row.

**Crop box**: `position: relative; aspect-ratio: 767 / 980; overflow: hidden; border-radius: 12px`. Inside, the illustration is absolutely positioned so only the player body shows:

```
img.player-art {
  position: absolute;
  left: -8.87%; top: -14.8%;
  width: 118.9%; height: 132.2%;
  max-width: none;
  mix-blend-mode: multiply;
  filter: var(--player-filter);
  transition: filter .6s ease;
}
```

These numbers come from the source image: player body spans x 68 to 835 and y 145 to 1125 of 912 x 1296.

**Disc slot** (over the printed disc): `position: absolute; left: 6.65%; top: 11.9%; width: 79.8%; height: 62.4%`. Printed disc center is (425, 568) with diameter about 612 px in source pixels. Verify alignment visually at 3 widths and nudge these four numbers if the loaded disc does not sit exactly on the printed rim.

**Loaded disc** (inside the slot), two nested elements so the two animations do not fight over `transform`:
- Outer `.disc-in`: runs the insert animation once on mount.
- Inner `.spinner`: circle, `overflow: hidden`, `box-shadow: 0 0 0 3px var(--ring), 0 16px 34px rgba(14,42,20,.35)`. Contains, in order:
  1. disc image, cover
  2. sheen: `conic-gradient(from 30deg, transparent 0deg, rgba(255,255,255,.28) 40deg, transparent 90deg, transparent 200deg, rgba(255,255,255,.2) 240deg, transparent 290deg)`, `mix-blend-mode: overlay`
  3. clamp ring: 32% circle centered, `rgba(247,249,245,.35)`, 2px `--ring` border, `backdrop-filter: blur(6px)`
  4. spindle hole: 10% circle centered, `--paper`, 2px `--ring` ring
- Key the disc element on project id so switching projects remounts it and replays the insert.

**Status LED**: on the printed knob. `left: 5%; top: 23.1%; width: 2.2%; aspect-ratio: 1`, round, `--led-off` when empty, `--led-on` plus `0 0 10px` glow while a disc is loaded, pulsing.

**Empty state**: no overlay. The printed disc in the illustration is the idle state; the readout says "INSERT DISC".

**Readout row** (below the crop box, gap 12px):
- LCD: flex 1, `--lcd-bg`, 1px `--ctrl-border`, radius 14px, padding 14px 18px. Left: `"{num}  {TITLE}"` or `INSERT DISC` in `--lcd-fg`, single line with ellipsis. Right: `PLAY`, `PAUSE` or `--:--` in `--lcd-dim`.
- Play/Pause button and Eject button: 52px wide, full row height, `--ctrl-*` colors, inline stroke SVG icons (2px stroke, 18px). No emoji.

## Data model

`src/data/projects.ts`. Copy titles, blurbs, notes and stacks verbatim from the `base` array in `reference/Main.dc.html`.

```ts
export type Project = {
  id: string;          // 'emolog' | 'bookr' | 'gigcaller' | 'contextos' | 'splat' | 'noise'
  num: string;         // '01'..'06', zero-padded, derived from order is fine
  kind: string;        // 'SDK', 'VOICE AGENT', 'MIDDLEWARE', 'GRAPHICS', 'AUDIO ML'
  title: string;
  img: string;         // '/assets/discs/01.webp'
  blurb: string;
  notes: string[];     // 2 to 4 short lines
  stack: string[];
  links?: { github?: string; demo?: string };
};
```

Links are not filled in yet. When a link is missing, do not render that link (the design shows `[GITHUB LINK]` / `[DEMO LINK]` placeholders only as markers).

## State and interactions

State: `{ loadedId: string | null, playing: boolean }`, initial `{ null, true }`.

| Element | Trigger | Behavior |
|---------|---------|----------|
| Rack disc | Click / Enter / Space | If it is not loaded: load it, set `playing: true`. If it is already loaded: eject (`loadedId: null`) |
| Rack disc | Hover | Disc lifts 10px and rotates 24deg, 500ms `cubic-bezier(.2,.85,.25,1)` |
| Rack disc slot | While its disc is loaded | Disc replaced by a 132px dashed `--accent` circle reading "PLAYING" (Space Mono 11px, 0.18em) |
| Play/Pause | Click | Toggles `playing`; disabled visually and functionally when nothing is loaded |
| Eject | Click | `loadedId: null`. Disabled when nothing is loaded |
| Player disc | `playing` false | `animation-play-state: paused` (freezes where it is, does not reset) |
| Liner notes | `loadedId` changes | Swap content with the fade-in; empty state shows the "Six discs on the rack" copy |
| Nav links | Click | Smooth scroll to section (`scroll-behavior: smooth`, honor reduced motion) |
| Links | Hover | `--link` to `--ink` |

Nice to have (only if cheap): sync `loadedId` to the URL hash (`#/emolog`) so a project is shareable and back/forward works.

## Animation

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Loaded disc (outer) | Mount | From `translate(-30%,-140%) scale(.55) rotate(-140deg)`, opacity 0 (reaches 1 at 55%) to rest | 950ms | `cubic-bezier(.2,.85,.25,1)` |
| Loaded disc (inner) | While loaded | `rotate(360deg)` loop | 4.8s / turn | linear |
| Liner notes, bg disc wash | Content change | Opacity 0 to 1, scale 1.12 to 1 | 1.4s | ease |
| Outline circles | Always | Translate (24px, -18px) and rotate 8deg, back | 14s loop (second offset -6s) | ease-in-out |
| LED | Always | Opacity .35 to 1 to .35 | 1.6s loop | ease-in-out |
| Player tone | Change | `filter` transition | 600ms | ease |

`prefers-reduced-motion: reduce`: no insert flight (disc just fades in over 200ms), no spin, no drift, no LED pulse, no hover rotation, instant scroll.

## Responsive behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop (>1024px) | As designed: player and liner notes side by side, rack 6 across at 1280 |
| Tablet (640 to 1024px) | Player stacks above liner notes (natural wrap from the flex basis). Player max 520px, centered. Rack wraps to 3 or 4 across |
| Mobile (<640px) | Side padding 20px. Panels padding 24px. Hero card padding 28px, h1 hits its 56px clamp floor. Nav links wrap under the logo. Rack discs shrink to 104px, grid `minmax(120px, 1fr)`. Footer pill becomes a 24px-radius block and stacks |

On mobile, after loading a disc from the rack, scroll the player into view (`scrollIntoView({ block: 'center' })`) since the rack sits below it. Skip if the player is already visible.

## Edge cases

- **Long titles**: readout truncates with ellipsis; h2 wraps naturally. "CPU Gaussian Splatting" and "Urban Noise Classifier" are the longest and must not overflow at 360px width.
- **Many stack chips**: chips wrap; no limit.
- **Missing disc image**: fall back to a `--ink` circle with the disc number centered in Space Mono, so the rack never shows a broken image.
- **Slow connection**: give the player crop box and rack discs fixed aspect ratios so nothing shifts. `background.png` and `cd-player.png` load eagerly with `fetchpriority="high"` on the player; disc images lazy-load except the first row.
- **Count**: rack and "06 DISCS" label derive from `projects.length`. Layout must hold for 3 to 12 projects.
- **No JS**: not required.

## Accessibility

- Landmarks: `header` with `nav aria-label="Primary"`, `main`, sections with headings, `footer`.
- Rack discs are real `<button type="button">` with `aria-label="Load {title} into the player"` and `aria-pressed` reflecting loaded state.
- Play/Pause has a dynamic `aria-label` ("Play" / "Pause"); Eject `aria-label="Eject disc"`; both use `disabled` when empty.
- Announce changes: an `aria-live="polite"` visually hidden region that says "Now playing: {title}" or "Disc ejected".
- Decorative layers, disc art, sheen, LED, outline circles: `aria-hidden` / empty `alt`. Player illustration: `alt="Line-drawn green CD player"`.
- Focus order: nav, hero, player controls, liner notes links, rack (left to right), about, footer.
- Focus ring: 2px `--ink`, offset 2px (6px on rack discs).
- Contrast: all text colors above pass 4.5:1 on the glass panels. Do not put body text directly on the background art outside a panel.
- Touch targets at least 44px.

## Content still needed from Rish

- Email, GitHub, LinkedIn, SoundCloud URLs (footer).
- Per-project GitHub and demo links.
- The six disc images exported from Cosmos.
- Optional: page title and meta description, OG image (a screenshot of the player with a disc loaded works well).

## Acceptance checklist

- [ ] Matches `reference/Main.dc.html` at 1440, 1024, 768 and 390 px wide.
- [ ] Loaded disc sits exactly on the printed disc rim at all four widths.
- [ ] Switching discs replays the insert animation every time; clicking the loaded disc's slot ejects it.
- [ ] Pause freezes the spin in place; play resumes from the same angle.
- [ ] Reduced motion fully respected.
- [ ] Keyboard only: every disc and control reachable and operable, visible focus.
- [ ] Lighthouse: Accessibility 100, Performance 90+ on desktop.
- [ ] No placeholder text or dead `#` links ship; missing links are omitted.
- [ ] Deployed to Vercel with a production build passing `tsc --noEmit` and lint.
