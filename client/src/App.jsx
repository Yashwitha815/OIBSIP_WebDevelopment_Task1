import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Offers from "./pages/Offers";
import Wishlist from "./pages/Wishlist";

import FloatingCart from "./components/cart/FloatingCart";
import CustomizePizzaModal from "./components/pizza/CustomizePizzaModal";
function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>

      {/* Global Modal */}
      <CustomizePizzaModal />

      <FloatingCart />

      <Footer />
    </BrowserRouter>
  );
}

export default App;
