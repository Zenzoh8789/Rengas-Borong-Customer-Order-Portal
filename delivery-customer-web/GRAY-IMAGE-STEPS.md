# Gray default product-list image

Based on the latest mobile-first version. The UI layout and font sizes are unchanged.

The default/fallback logo in product cards is now grayscale with 45% opacity, matching the light gray reference. Actual product photos and logos outside product cards are unaffected. Missing and failed product images use the same fallback styling.

If you already applied the mobile-first ZIP, replace only apps/web/src/styles/storefront.css with the supplied storefront.css, rebuild and hard refresh. Do not replace responsive.css with an older version.

For a fresh setup, extract the ZIP, keep your existing environment configuration, run npm ci, then npm run build and npm run dev.

Verification: production build passed; mobile product-list screenshot and computed fallback styles checked using local sample data. No live backend or checkout tested.
