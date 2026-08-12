# RENGAS Customer Portal

Mobile-first React customer ordering portal. Product, category, image, UOM, price, login and order data come from the RENGAS admin NestJS API.

## Local development

1. Start the admin backend at `http://localhost:3002`.
2. Copy `.env.example` to `.env` if the API URL is different.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

## Docker web build

Run `docker compose up --build -d`, then open `http://localhost:5173`.

For production, change `VITE_API_URL` in `docker-compose.yml` to the deployed admin API URL before rebuilding.

The admin API must provide:

- `POST /api/auth/login`
- `GET /api/store/products`
- `GET /api/store/orders`
- `POST /api/store/orders`
- `/uploads/*` static product images

Customer login sends the `CUSTOMER` role. The admin backend `Role` enum and MySQL `users.role` enum must therefore include `CUSTOMER`.
