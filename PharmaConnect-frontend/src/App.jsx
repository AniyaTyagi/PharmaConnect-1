import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatbotWidget from "./components/ChatbotWidget";
import IntroSplash from "./pages/IntroSplash";
import HomePage from "./pages/HomePage";
import Login from "./pages/login";
import BuyerDashboard from "./pages/BuyerDashboard";
import CartPage from "./pages/CartPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import InvoicesPage from "./pages/InvoicesPage";
import WishlistPage from "./pages/WishlistPage";
import SettingsPage from "./pages/SettingsPage";
import { SellerProvider } from "./seller/context/SellerContext";
import SellerDashboard from "./seller/pages/SellerDashboard";
import SellerProductsPage from "./seller/pages/SellerProductsPage";
import SellerInventoryPage from "./seller/pages/SellerInventoryPage";
import SellerOrdersPage from "./seller/pages/SellerOrdersPage";
import SellerAnalyticsPage from "./seller/pages/SellerAnalyticsPage";
import SellerSettingsPage from "./seller/pages/SellerSettingsPage";
import { AdminProvider } from "./admin/context/AdminContext";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminVerificationsPage from "./admin/pages/AdminVerificationsPage";
import AdminUsersPage from "./admin/pages/AdminUsersPage";
import AdminCatalogPage from "./admin/pages/AdminCatalogPage";
import AdminTransactionsPage from "./admin/pages/AdminTransactionsPage";
import AdminReportsPage from "./admin/pages/AdminReportsPage";
import AdminSettingsPage from "./admin/pages/AdminSettingsPage";

function App() {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <CartProvider>
      <WishlistProvider>
        <Router>
        <Routes>
          {/* Intro Splash */}
          <Route path="/" element={<IntroSplash />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />

          {/* Buyer */}
          <Route path="/buyer-dashboard" element={<ProtectedRoute allowedRoles={["buyer"]}><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/cart"     element={<ProtectedRoute allowedRoles={["buyer"]}><CartPage /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute allowedRoles={["buyer"]}><ProductsPage /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute allowedRoles={["buyer"]}><OrdersPage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute allowedRoles={["buyer"]}><InvoicesPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute allowedRoles={["buyer"]}><WishlistPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={["buyer", "seller", "manufacturer"]}><SettingsPage /></ProtectedRoute>} />

          {/* Seller */}
          <Route path="/seller/*" element={
            <ProtectedRoute allowedRoles={["seller", "manufacturer"]}>
              <SellerProvider>
                <Routes>
                  <Route path="dashboard"  element={<SellerDashboard />} />
                  <Route path="products"   element={<SellerProductsPage />} />
                  <Route path="inventory"  element={<SellerInventoryPage />} />
                  <Route path="orders"     element={<SellerOrdersPage />} />
                  <Route path="analytics"  element={<SellerAnalyticsPage />} />
                  <Route path="settings"   element={<SellerSettingsPage />} />
                </Routes>
              </SellerProvider>
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProvider>
                <Routes>
                  <Route path="dashboard"     element={<AdminDashboard />} />
                  <Route path="verifications" element={<AdminVerificationsPage />} />
                  <Route path="users"         element={<AdminUsersPage />} />
                  <Route path="catalog"       element={<AdminCatalogPage />} />
                  <Route path="transactions"  element={<AdminTransactionsPage />} />
                  <Route path="reports"       element={<AdminReportsPage />} />
                  <Route path="settings"      element={<AdminSettingsPage />} />
                </Routes>
              </AdminProvider>
            </ProtectedRoute>
          } />
        </Routes>
        {isLoggedIn && <ChatbotWidget />}
      </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
