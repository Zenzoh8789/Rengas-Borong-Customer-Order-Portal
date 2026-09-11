# RENGAS Customer Portal

React customer ordering website, backed by the Rengas Admin API.

## Install and build

Use Node.js 22.12 or newer (Node 24 is recommended). From this directory:

```
npm ci
npm run dev
```

For a production build, set VITE_API_URL in the build environment to the real admin API URL before running npm run build. For this deployment the API base is https://rengatrading.in/api. The default is http://localhost:3000/api for local development only.

PowerShell:

```
$env:VITE_API_URL = 'https://rengatrading.in/api'
npm run build
```

Upload the contents of apps/web/dist, including .htaccess, to the customer site's document root. Nginx users should use the fallback route in docker/nginx.conf. Environment files are intentionally excluded; set values through your terminal or hosting configuration.

## Catalog fix

Deploy the accompanying rengas-admin backend first. GET /api/store/products now returns one entry per database product ID/SKU, preserving full pack descriptions, prices, images and category assignments. Cards show product codes, and category labels match admin names. Category counts and search operate on every SKU rather than one representative of a name group.

The homepage previews three products per category. Opening a category displays all its products. This preview is intentional.

Existing category assignments come from the database. Correct them in Admin using the authoritative product master list; this release does not guess or overwrite them. Empty categories are not listed in the customer portal.

## Authentication and orders

Customer registration, password login and OTP use the admin API. Configure the backend's existing OTP delivery settings as appropriate for the deployment. Cart lines submit the selected SKU's productId; the backend supplies the authoritative price.

## Package contents

Required source, dependency lockfile, styles, images and server configuration are retained. node_modules, old dist builds, caches, logs, old step-by-step change notes and all .env* files are excluded. Install dependencies and build again for your target host.