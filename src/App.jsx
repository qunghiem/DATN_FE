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
// import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products"
// import AdminOrders  from "./pages/admin/Orders"
// import AdminCustomers   from "./pages/admin/Customers"
// import AdminRevenue   from "./pages/admin/Revenue"
import AdminBrands from "./pages/admin/Brands";
import AdminCategories from "./pages/admin/Categories";
// import AdminLabels from "./pages/admin/Labels";

const App = () => {
  const location = useLocation();
  const hideLayout = location.pathname.startsWith("/admin");
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
        <Route path="/product/:productId" element={<Product />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* <Route index element={<Dashboard />} /> */}
          <Route path="products" element={<AdminProducts />} />
          {/* <Route path="orders" element={<AdminOrders />} /> */}
          {/* <Route path="customers" element={<AdminCustomers />} /> */}
          {/* <Route path="revenue" element={<AdminRevenue />} /> */}
          <Route path="brands" element={<AdminBrands />} />
          <Route path="categories" element={<AdminCategories />} />
          {/* <Route path="labels" element={<AdminLabels />} /> */}
        </Route>
      </Routes>
      {!hideLayout && <Footer />}

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
