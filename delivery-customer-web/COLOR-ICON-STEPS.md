# Color category icons

Category icons now use colorful native emoji artwork instead of monochrome outlines. Barber: barber pole; canned food: can; coffee/tea/malt: cup; dairy: milk; flour/sugar: wheat; produce: apple; hygiene: lotion. Category-name matching is unchanged. Unknown categories use a shopping cart, not a box.

These are emoji-style icons, not custom 3D renders. Their artwork varies with the device and operating system.

If you already installed the previous category-icons ZIP, replace only:
- apps/web/src/components/CategoryIcon.tsx
- apps/web/src/styles/storefront.css

Then run npm run build and npm run dev; hard refresh your browser.
For a fresh extraction run npm ci first and preserve your existing API/environment configuration.

The ZIP includes all previous mobile-first and gray product-placeholder changes. Production build passed and mobile Home icons were visually checked with sample data.
