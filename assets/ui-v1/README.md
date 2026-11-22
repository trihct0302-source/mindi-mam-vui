# MINDI – Mầm Vui UI Kit V1

Reference: Cosy UI Kit – Soft Pixel Interface. Custom implementation for MINDI; no third-party sprites copied.

## Design rules
- Purple/Lavender identity; Deep Plum outlines; blush and butter accents.
- Modern kawaii soft-pixel UI, not medieval/retro RPG.
- SVG assets use native transparent canvas (no white matte or background removal).
- `shape-rendering: crispEdges` preserves pixel-style edges.
- Button labels are HTML text, not baked into images, for localization and accessibility.

## Contents
- buttons: primary normal/hover/pressed/disabled, secondary normal/pressed, danger normal.
- panels: 9-slice panel and popup header.
- dialogue: speech bubble.
- progress: track and fill.
- controls: toggle and checkbox states.
- icons: SVG symbol sprite; use `<svg><use href="sprite.svg#sprout"/></svg>`.

## Integration
Use these assets as CSS backgrounds or inline SVG references. Button state changes should be controlled by UI state; do not simulate hover on touch devices. Panel 9-slice suggested CSS: `border-image-source: url(panel-9slice.svg); border-image-slice: 12 fill; border-image-width: 12px; border-image-repeat: stretch;`.

## Transparency QA
All assets are SVG with transparent root canvas. No raster background was used, so there is no white matte/halo from background removal. For PNG exports, render to RGBA and inspect alpha channel on checkerboard and dark backgrounds before release.
