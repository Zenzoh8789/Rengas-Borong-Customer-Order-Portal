# Approved 3D category icons

## Update from the previous color-icons ZIP
1. Back up your project.
2. Extract delivery-customer-web-3d-icons-patch.zip into your project root, preserving its apps/web folder paths.
3. This updates only:
   - apps/web/src/components/CategoryIcon.tsx
   - apps/web/src/styles/storefront.css
   - apps/web/public/category-icons/categories-3d.png (new, required)
4. Run npm run build and npm run dev. Hard refresh with Ctrl+Shift+R.

Alternatively use the full delivery-customer-web-3d-icons.zip. Run npm ci for a fresh extraction and preserve your own API/environment settings. Do not copy the previous CSS over this version.

## Behavior
Custom rendered artwork replaces emoji on Home and Category pages. Eight approved designs cover All, Barber, Canned Food, Coffee/Tea/Malt, Dairy, Flour & Sugar, Fresh Produce, and Hygiene. Cleaning reuses the soap design. Categories without dedicated artwork use shopping bags, not a box. Matching uses the existing category-name helper.

Artwork is a local 4-by-2 sprite sheet on a white background, with small rounded image corners. No runtime generation, third-party image service, new dependencies, or device-specific emoji fonts are required. Icons are 28px in the Home strip and 40px on the Category page; existing card layouts and typography are retained. Gray product placeholders remain unchanged.

## Checks
- TypeScript and Vite production build passed.
- Eleven category-name matching cases passed.
- Mobile Home and Category page visually inspected with local sample data.
- Desktop Category page checked at 1368px: no horizontal overflow.
- No live backend or order submission tested.

## Artwork provenance
Generated with the built-in image-generation tool, based on the user-approved 3D preview. The first sprite attempt had a checkerboard baked into the image and was not shipped. The final asset uses a clean white backdrop.

Final edit prompt:
Edit this exact 4x2 sprite sheet. Keep every object in exactly the same position, size, colors and style. Remove the entire checkerboard background. Replace it with a perfectly uniform pure white #FFFFFF background with NO checker pattern, NO gray squares, NO gradients, NO vignette. Keep the same 2:1 canvas and exact 4 columns x 2 rows layout. No text or labels. All blank space must be clean pure white. Do not change the objects or their arrangement. Production UI icon sprite sheet.
