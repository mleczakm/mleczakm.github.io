# Michał Mleczko — portfolio

Static Polish/English portfolio: business AI implementation, MCP integrations, commerce and WordPress-to-static migrations. Published by GitHub Pages from this repository.

- `/` — Polish portfolio.
- `/en/` — complete English portfolio; language switching preserves the section.
- `/platnosci-blik/` — existing BLIK landing page, with its permanent URL preserved. Includes BezReszty and its phone + mObywatel organizer verification process.

## Develop

```sh
python3 scripts/build.py
python3 scripts/check.py
python3 -m http.server 4173 --bind 127.0.0.1
```

Visit `http://127.0.0.1:4173/`. No JavaScript framework, package install or build service is needed to serve the site. `scripts/build.py` (Python standard library) is the source for both language pages; edit copy and markup there, then regenerate. Generated HTML is committed so GitHub Pages serves complete content without client rendering. Styling and behavior are shared in `assets/site.css` and `assets/site.js`.

The BLIK landing page is maintained directly in `platnosci-blik/index.html` and retains its existing styling and form behavior. Its pricing applies to the commerce offering; BezReszty's separate 0% application commission is explicitly distinguished.

## Interactions and verification

- AI workflow examples switch between sales, operations and engineering. They are clearly labeled illustrations and never call live business tools.
- The cost calculator uses visitor-entered monthly costs, handles empty/invalid values and additional costs, and excludes one-time migration. Defaults are examples, not quotes or measured performance.
- Contact: existing Formspree endpoint, native POST fallback, HTML validation, honeypot, 15-second request timeout, success/failure status and preserved input after errors. Preferred call time is optional and explicitly in Europe/Warsaw.
- Forms must be tested with a mocked HTTP response, without submitting test enquiries to the live inbox.
- Navigation, language links, project links and FAQs work without JavaScript. Motion respects `prefers-reduced-motion`.
- `scripts/check.py` checks internal files/fragments, duplicate IDs, PL/EN parity, canonical/hreflang, BLIK URL, form destination, structured data, assets and JavaScript syntax.

## Design references

Original lightweight HTML/CSS/JS adaptations of the requested interaction patterns; no React runtime or proprietary source is bundled:

- [21st.dev](https://21st.dev/community/components): split hero, project cards, compact navigation and CTA composition.
- [React Bits Spotlight Card](https://reactbits.dev/components/spotlight-card): pointer-following spotlight, implemented locally with CSS custom properties.
- [Magic UI Animated Beam](https://magicui.design/docs/components/animated-beam): connected nodes and animated SVG beam, reimplemented without React/Motion.
- [Uiverse buttons](https://uiverse.io/buttons): hover/arrow feedback and clear interactive states.
- [Mobbin](https://mobbin.com/): restrained hierarchy, segmented controls and progressive disclosure. Used as a public design reference, not as a component library.

Manrope is self-hosted under SIL OFL; see `assets/Manrope-OFL.txt`. Project artwork uses the owner's Ceramiza mark and cargo product photo, the public SprintSpaces demo screenshot, and original CSS compositions. The screenshot shows sample data. Project descriptions are grounded in the existing portfolio and corresponding project documentation. Verification copy follows BezReszty's `docs/VERIFICATION.md`: operator-controlled checking, not automated KYC.

The social preview PNGs are local assets. To regenerate them, run `python3 scripts/social-cards.py` with Pillow installed (optional authoring dependency, not needed to build/serve the site).
