import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { useApp } from "./context/AppContext";

const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage").then((module) => ({ default: module.CategoriesPage })));
const CartPage = lazy(() => import("./pages/CartPage").then((module) => ({ default: module.CartPage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then((module) => ({ default: module.OrdersPage })));

const loading = <div className="empty">Loading...</div>;

function Protected() {
  const { authenticated } = useApp();
  if (!authenticated) return <Navigate to="/login" replace />;

  return (
    <AppShell>
      <Suspense fallback={loading}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export default function App() {
  return (
    <Suspense fallback={loading}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<Protected />} />
      </Routes>
    </Suspense>
  );
}
