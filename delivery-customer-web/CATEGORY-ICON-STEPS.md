# Automatic category icons

The Home strip and Category page now share category-name matching and SVG icons from the existing lucide-react dependency. No image generation service or new dependency is needed.

Examples: Barber -> scissors; Canned Food -> soup bowl; Coffee/Tea/Malt -> cup; Dairy -> milk; Flour & Sugar -> wheat; Fresh Produce -> apple; Hygiene -> sparkles. Recognized names are matched case-insensitively with punctuation normalized. Unknown names use a neutral grid, not a box. Extend src/utils/categoryIcon.ts to support more category keywords.

Update from the previous gray-details ZIP:
1. Back up your project.
2. Extract this ZIP into a separate folder.
3. Copy these five files into the matching locations in your existing project:
   - apps/web/src/components/CategoryIcon.tsx (new)
   - apps/web/src/utils/categoryIcon.ts (new)
   - apps/web/src/pages/HomePage.tsx
   - apps/web/src/pages/CategoriesPage.tsx
   - apps/web/src/styles/storefront.css
4. Run npm run build, then npm run dev. Hard refresh with Ctrl+Shift+R.

Mobile-first layout, original fonts, and gray default product images are retained. Existing environment settings should remain unchanged. Fresh setup: npm ci first.

Checks: production build passed; 11 category-name test cases passed; Home icons visually inspected on mobile and Category page navigation checked with local sample data. No live backend or checkout tested.

