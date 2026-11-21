# Panel & Popup V2 – reusable UI system

## Design principle
One shared panel shell and component vocabulary, five content templates. Character, item, message, progress and action data are runtime content; they are not baked into the panel artwork.

## Tokens
- Primary: lavender #8064A8
- Deep outline: #594668
- Surface: #FFFCFF / #F6EEFC
- Accent: #F6C978
- Soft border: #CBB5E2
- Pixel treatment: stepped corners and crisp SVG edges

## Components
- `panels/modal-frame-v2.svg`: reusable 9-slice modal frame (viewBox 360x420; in CSS use border-image-slice: 30 fill; border-width: 30px; border-image-repeat: stretch)
- `panels/title-ribbon-v2.svg`: title ribbon background
- `panels/item-slot-v2.svg`: reusable inventory/collection slot
- `panels/divider-v2.svg`: section divider
- `icons/close-v2.svg`, `icons/sparkle-v2.svg`: reusable icon assets
- `popup-v2.css`: tokens, modal shell, buttons, cards, slots, badges, progress and responsive rules
- `popup-v2-demo.html`: interactive five-template gallery

## Five templates
1. Reward received – item art, rarity, short description, equip/close actions.
2. Care confirmation – character identity, care action summary, confirm/cancel.
3. Wardrobe – category tabs, item grid, owned/equipped/locked states, preview and equip.
4. Collection – completion summary, filter tabs, item grid and locked states.
5. Character notice – character portrait, contextual message, level/status and one CTA.

## 12-character compatibility
The templates accept a character object (id, displayName, portrait, level, stage, message) and item objects (id, name, image, rarity, owned, equipped). Do not hardcode zodiac-specific visual colors or text into the shared components. Use character art as content inside the shared frame.

## Transparency
SVGs use vector fills and no raster cutout or white-matte removal. Keep assets as SVG/PNG RGBA; never JPEG. Validate with light/dark checkerboard backgrounds when exporting raster versions.

## Integration boundary
This is a visual/component prototype only. It does not change game logic, Supabase, localStorage, or production index.html. The demo uses sample data and existing character art paths for visual testing.