# Signup-only header

Header now displays only the authenticated customer's businessName and address. There is no Current Location, RENGAS, Delivery location, or View delivery address fallback text in the header. If profile data is missing, those text fields remain empty. The clickable signup-details panel and working notification bell are retained.

If you installed the previous header-fixed version, replace only apps/web/src/components/HeaderStatus.tsx with the supplied HeaderStatus.tsx. Run npm run build and npm run dev, then hard refresh.

The full ZIP includes the earlier header fix and this adjustment, based on your latest uploaded frontend. Backend source inspection confirmed signup maps businessName to companyName and saves address, and customer responses map those fields back to businessName/address. No backend changes or live database queries were performed. Missing actual data still requires runtime/API investigation; removing placeholders does not create missing data.

Checks: production build passed; sample-data browser check showed shop name/address, and missing-profile check showed empty header text instead of placeholders.
