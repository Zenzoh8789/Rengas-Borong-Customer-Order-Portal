# Related-product navigation feedback

Update from the latest 3D-icons version:
1. Back up your project.
2. Extract delivery-customer-web-detail-loading-patch.zip into your project root, preserving apps/web paths.
3. Replace these two files completely:
   - apps/web/src/pages/ProductDetailPage.tsx
   - apps/web/src/styles/commerce.css
4. Run npm run build, then npm run dev. Hard refresh with Ctrl+Shift+R.

Clicking a product card in More Products opens the selected product details at the top, with quantity reset to 1 and description collapsed. A brief 180ms Opening product indicator provides feedback even when the product data is cached. This is a UI transition, not a new backend request on every click. The loading state remains until data is ready. Error and missing-product states no longer display an endless loading message.

Only product-detail content remounts; the shared header, navigation, cart context, icons and existing design are retained. See more still opens the category listing. The small + button on a related card still adds to cart without navigating. Reduced-motion users get a stationary loading indicator.

Checks: production build passed. Browser test using sample data confirmed a related-product click changed the title, returned scrollY to 0, reset quantity to 1 and collapsed description after these values were changed on the previous product. The short loading interval is defined in code; it was not captured in the browser snapshot. Live backend and checkout were not tested.
