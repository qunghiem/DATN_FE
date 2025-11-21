import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import PlaceOrder from "./pages/PlaceOrder";
import Product from "./pages/Product";
import Navbar from "./components/Navbar";
import Collection from "./pages/Collection";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Profile from "./pages/Profile";
import AdminLayout from "./layouts/AdminLayout";
import AdminProducts from "./pages/admin/Products"
import AdminBrands from "./pages/admin/Brands";
import AdminCategories from "./pages/admin/Categories";
import AdminVoucher from "./pages/admin/Vouchers";
import Wishlist from "./pages/Wishlist";
import PaymentReturn from './pages/PaymentReturn';
import EmployeeChat from './pages/EmployeeChat';
import ChatWidget from './components/ChatWidget';
import { useSelector } from 'react-redux';
import AdminOrders from './pages/admin/Orders';
import AdminReviews from './pages/admin/AdminReviews';

const App = () => {
  const location = useLocation();
  const hideLayout = location.pathname.startsWith("/admin") || location.pathname === "/employee/chat";
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Show ChatWidget only for authenticated CUSTOMER users on customer pages
  const showChatWidget = isAuthenticated && 
                        user?.role === 'CUSTOMER' && 
                        !hideLayout;

  return (
    <div className="">
      {!hideLayout && <Navbar />}
      <ScrollToTop />
      {/* customer  */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/payment-return" element={<PaymentReturn />} />
        
        {/* Employee Chat Route */}
        <Route path="/employee/chat" element={<EmployeeChat />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<AdminProducts />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="vouchers" element={<AdminVoucher />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
      {!hideLayout && <Footer />}

      {/* Chat Widget for CUSTOMER */}
      {showChatWidget && <ChatWidget />}

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default App;