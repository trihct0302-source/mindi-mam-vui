# MINDI — Mầm Vui V4 / Phase06

Public playtest: https://trihct0302-source.github.io/mindi-mam-vui/

## Release contents
48 character forms, 240 GIFs, 4 time-of-day backgrounds, 16 collectible props. The 20 Aries GIFs use V8; all four source character PNGs match V4 byte for byte. Other characters retain V4 animation.

## Gameplay
One care per Vietnam calendar day. Evolution at 7, 21 and 45 accumulated care days. At most one reward per weekend/week. No currency or gacha. Progress stays in this browser and is not synced between devices.

## Prototype limitations
Whole-body animation remains provisional; independent facial expressions and rigging across all forms are unfinished. Accessory anchors are approximate. Art is not approved as final production art.

## Deployment fixes
Pages is enabled with GitHub Actions in repository settings. Corrected the over-escaped saved-date regular expression in the supplied V4 archive, which discarded care history on reload.

Original archive QA reports describe pre-deployment checks and are historical, not current deployment status.
