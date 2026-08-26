import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { useApp } from "./context/AppContext";
import { BrandLogo } from "./components/BrandLogo";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

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
  import("./pages/ProductDetailPage").then((module) => ({ default: module.ProductDetailPage }))
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

const loading = (
  <main
    className="route-loading"
    role="status"
    aria-label="Loading page"
  >
    <BrandLogo size={76} />
    <span className="route-loading-spinner" />
    <p>Loading Rengas Borong…</p>
  </main>
);

function Protected() {
  const { authenticated } = useApp();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Suspense fallback={loading}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
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
    }, 2000);

    return () => window.clearTimeout(timer);
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
          <span className="logo-ring" />
          <BrandLogo size={128} />
        </div>

        <p className="welcome-label">
          Welcome to Rengas Borong
        </p>

        <div className="welcome-progress">
          <span />
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
