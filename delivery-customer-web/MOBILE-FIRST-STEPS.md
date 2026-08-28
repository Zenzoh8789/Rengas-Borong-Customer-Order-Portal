# Mobile-first UI — same design on all screens

This version supersedes the earlier desktop redesign.

## Changes
- Removed the entire desktop product-detail grid, including `grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr)`.
- Removed desktop cart columns and the two-column category list.
- Removed desktop-only fonts, card sizes, image sizes, spacing, hover effects, and floating navigation styling.
- Retained the original mobile typography and component styles on every screen.
- At 700px and above, only the outer frame is centered and limited to 540px. Header, content, navigation and product actions share that frame.
- Retained image containment and clearance for the fixed action/navigation bars.
- Duplicate CSS cleanup from the previous version remains.

## Apply
1. Back up your current project.
2. Extract delivery-customer-web-mobile-first.zip.
3. If you already applied the previous fixed ZIP, replace only `apps/web/src/styles/responsive.css` with the new version. Replace the whole file; do not append.
4. If updating directly from your original ZIP, also replace `apps/web/src/styles/storefront.css` and remove the unused files directly under `apps/web/src`: auth.css, checkout.css, dynamic.css, home-layout.css. Keep `apps/web/src/styles/auth.css`.
5. Run `npm run build`, then `npm run dev` from the project root. On a fresh extraction, run `npm ci` first. Keep your existing API/environment configuration.
6. Hard refresh with Ctrl+Shift+R.

## Checks
- Production build passed.
- All 127 original mobile typography declarations remain unchanged.
- Browser checks with local sample data at 320, 390, 768, 1368 and 1920px: product details stacked, original font sizes retained, no horizontal document overflow.
- Desktop product detail visually inspected at 1368px.
- No live backend or order submission tested.

No HTML tables exist in the supplied source, so no speculative table styles were added. Tablet screens use the same mobile design, with the centered frame where space permits.
