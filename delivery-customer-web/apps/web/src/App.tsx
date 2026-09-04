import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { BrandLogo } from "./components/BrandLogo";
import { useApp } from "./context/AppContext";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

const SPLASH_DURATION_MS = 1500;

const HomePage = lazy(() =>
  import("./pages/HomePage").then((module) => ({
    default: module.HomePage,
  }))
);

const CategoriesPage = lazy(() =>
  import("./pages/CategoriesPage").then((module) => ({
    default: module.CategoriesPage,
  }))
);

const ProductDetailPage = lazy(() =>
  import("./pages/ProductDetailPage").then((module) => ({
    default: module.ProductDetailPage,
  }))
);

const CartPage = lazy(() =>
  import("./pages/CartPage").then((module) => ({
    default: module.CartPage,
  }))
);

const OrdersPage = lazy(() =>
  import("./pages/OrdersPage").then((module) => ({
    default: module.OrdersPage,
  }))
);

const AccountPage = lazy(() =>
  import("./pages/AccountPage").then((module) => ({
    default: module.AccountPage,
  }))
);

function Protected() {
  const { authenticated } = useApp();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />

          <Route
            path="/products/:productId"
            element={<ProductDetailPage />}
          />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setInitialLoading(false);
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (initialLoading) {
    return (
      <main
        className="welcome"
        role="status"
        aria-live="polite"
        aria-label="Loading Rengas Borong"
      >
        <div className="logo-wrap">
          <span className="logo-ring" aria-hidden="true" />
          <BrandLogo size={128} />
        </div>

        <p className="welcome-label">
          Welcome to <br/>RENGAS BORONG
        </p>

        <div
          className="welcome-progress"
          role="progressbar"
          aria-label="Loading application"
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            aria-hidden="true"
            style={{
              animationDuration: `${SPLASH_DURATION_MS}ms`,
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/*" element={<Protected />} />
    </Routes>
  );
}