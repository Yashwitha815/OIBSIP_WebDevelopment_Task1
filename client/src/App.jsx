import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Offers from "./pages/Offers";
import Wishlist from "./pages/Wishlist";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";

import FloatingCart from "./components/cart/FloatingCart";
import CustomizePizzaModal from "./components/pizza/CustomizePizzaModal";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* ==================================================
            PUBLIC PAGES
        ================================================== */}

        <Route path="/" element={<Home />} />

        <Route path="/menu" element={<Menu />} />

        <Route path="/offers" element={<Offers />} />

        {/* ==================================================
            USER AUTHENTICATION
        ================================================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ==================================================
            ADMIN LOGIN
        ================================================== */}

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin/orders" element={<AdminOrders />} />

        {/* ==================================================
            USER PROTECTED PAGES
        ================================================== */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ADMIN DASHBOARD
        ================================================== */}

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

      {/* ==================================================
          GLOBAL COMPONENTS
      ================================================== */}

      <CustomizePizzaModal />

      <FloatingCart />

      <Footer />
    </BrowserRouter>
  );
}

export default App;
