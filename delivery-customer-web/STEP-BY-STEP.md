# Desktop alignment and CSS cleanup

## What was wrong

- At 700px and above, the header had a narrow width but no automatic horizontal margins. The content was centered separately.
- `display: flex` on the desktop header disabled its three-column grid layout.
- Repeated 700px and 1024px rules were overridden again by a final "mobile-sized" desktop block.
- Desktop content padding shrank to 40px even though fixed bottom navigation needed more clearance.
- The product action bar and main navigation occupied the same bottom position.
- Four legacy stylesheets were not imported anywhere in the source.

## What changed

Only two active CSS files changed; no React components, API logic, dependencies, or authentication behavior changed.

1. `apps/web/src/styles/responsive.css`: one centered frame, maximum width 1120px, with consistent 24px inner padding. Kept three product columns. Consolidated tablet/desktop styles. Kept enough bottom space for fixed navigation. Product actions sit 12px above navigation. Cart/detail columns start at 1024px so tablet layouts have enough space. Constrained desktop image grid rows to prevent cropping.
2. `apps/web/src/styles/storefront.css`: merged the duplicate `.category-tiles` block. Moved the existing full-width add-button and price rules from the responsive file into their base definitions, preserving mobile values.
3. Removed unused `apps/web/src/auth.css`, `checkout.css`, `dynamic.css`, and `home-layout.css`. These are the files directly under `src`, NOT files under `src/styles`. Keep `src/styles/auth.css`.

## Step by step: update your existing project

1. Stop your frontend dev server with Ctrl+C and back up your current project.
2. Extract `delivery-customer-web-fixed.zip` to a separate folder first.
3. From the extracted folder, replace these two files in your existing project:
   - `apps/web/src/styles/responsive.css`
   - `apps/web/src/styles/storefront.css`
   Replace the contents completely; do not append the new CSS below the old rules.
4. Remove these four unused files from `apps/web/src`: `auth.css`, `checkout.css`, `dynamic.css`, `home-layout.css`. If you have made newer local changes since the supplied ZIP, check that those files are still unreferenced first.
5. Keep `apps/web/src/styles.css` unchanged; it already imports the correct styles in the correct order. Do not change your API URL or environment files.
6. From the project root (the folder containing the main package.json), run:

   ```powershell
   npm run build
   npm run dev
   ```

   If using the extracted source as a fresh project, run `npm ci` first. The ZIP intentionally excludes node_modules, dist, and TypeScript build caches; these are regenerated locally.
7. Open your normal development URL and hard refresh with Ctrl+Shift+R. Confirm the desktop header and navigation are centered, product images fit, and the final product row can scroll above the navigation.
8. Check Home, Category, Cart, and product details on a phone and desktop. No order submission is needed for a layout check.

## Optional width adjustment

In `responsive.css`, change `1120px` in `--frame-width` to adjust the desktop width. This single value controls the header, content frame, and navigation together. Below 700px, the mobile frame stays unchanged. Avoid shrinking the frame below the space required for the desktop cart/detail columns without also changing those grids.

## Verification performed

- `npm run build`: passed (TypeScript and Vite production build). Vite emitted dependency warnings about ignored React Router "use client" directives; these did not fail the build.
- Actual production UI tested with an isolated local sample-data server; no customer credentials were used and no orders were submitted.
- Home checked at viewport widths 320, 390, 699, 700, 768, 1024, and 1920px: no document horizontal overflow.
- At 1440px: header, main frame, and navigation each measured 1120px wide with the same horizontal position.
- Desktop image and its container each measured 210px high after the image fix.
- Mobile 390px visually inspected: existing three-column cards and bottom navigation retained.
- Sample add-to-cart and cart page checked at 1920px: no horizontal overflow.
- Product details checked at 700, 768, 1024, and 1920px: action bar remains 12px above main navigation with no horizontal overflow.
- Live backend, real customer data, checkout submission, and every possible page/data combination were not tested.

Your original ZIP and project on E: were not modified.
