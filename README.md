# RISH / Portfolio

A one-page portfolio where projects are CDs: pick a disc from the rack, it flies into an illustrated CD player, spins, and the liner notes panel shows the project.

Vite + React + TypeScript, plain CSS. Built from `HANDOFF.md` (spec) and `reference/Main.dc.html` (design reference, not shipped).

## Develop

```sh
npm install
npm run dev      # local dev server
npm run build    # tsc --noEmit + eslint + vite build
```

## Editing content

Everything lives in `src/data/projects.ts`:

- `projects`: title, blurb, notes, stack, optional `links.github` / `links.demo`. Missing links are not rendered.
- `contact`: footer email and profile URLs. Missing entries are not rendered.
- `PLAYER_TONE`: one of `Forest`, `Leaf`, `Moss`, `Ink`.

Disc art lives in `public/assets/discs/NN.webp` (800px) and `NN-sm.webp` (264px, rack thumbnails).
