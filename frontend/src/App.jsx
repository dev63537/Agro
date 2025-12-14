import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import MasterDashboard from "./pages/master/MasterDashboard";
import ShopManagement from "./pages/shops/ShopManagement";

import ShopDashboard from "./pages/shopadmin/ShopDashboard";
import CreateShop from "./pages/master/CreateShop";
import Products from "./pages/shopadmin/Products";
import ProductForm from "./pages/shopadmin/ProductForm";
import StockBatches from "./pages/shopadmin/StockBatches";
import StockForm from "./pages/shopadmin/StockForm";
import Farmers from "./pages/shopadmin/Farmers";
import FarmerForm from "./pages/shopadmin/FarmerForm";
import Billing from "./pages/shopadmin/Billing";
import InvoiceView from "./pages/shopadmin/InvoiceView";
import Ledger from "./pages/shopadmin/Ledger";
import Reports from "./pages/shopadmin/Reports";

import MasterLayout from "./layouts/MasterLayout";
import ShopLayout from "./layouts/ShopLayout";

import { useAuth } from "./hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // ✅ WAIT until auth is restored
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  // not logged in
  if (!user) return <Navigate to="/login" replace />;

  // role check
  if (role && user.role !== role && user.role !== "master") {
    return <div className="p-6 text-red-600">Forbidden</div>;
  }

  return children;
};


export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Master Admin */}
      <Route
        path="/master"
        element={
          <ProtectedRoute role="master">
            <MasterLayout>
              <MasterDashboard />
            </MasterLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/master/shops"
        element={
          <ProtectedRoute role="master">
            <MasterLayout>
              <ShopManagement />
            </MasterLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/master/shops/create"
        element={
          <ProtectedRoute role="master">
            <MasterLayout>
              <CreateShop />
            </MasterLayout>
          </ProtectedRoute>
        }
      />

      {/* Shop Admin */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <ShopDashboard />
            </ShopLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shop/products"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <Products />
            </ShopLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/products/new"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <ProductForm />
            </ShopLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shop/stock"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <StockBatches />
            </ShopLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/stock/new"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <StockForm />
            </ShopLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shop/farmers"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <Farmers />
            </ShopLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/farmers/new"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <FarmerForm />
            </ShopLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shop/billing"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <Billing />
            </ShopLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shop/invoice/:id"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <InvoiceView />
            </ShopLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shop/ledger"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <Ledger />
            </ShopLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shop/reports"
        element={
          <ProtectedRoute role="shop_admin">
            <ShopLayout>
              <Reports />
            </ShopLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
