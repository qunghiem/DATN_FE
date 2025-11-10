import React from "react";
import Banner from "../components/Banner";
import Features from "../components/Features";
import ProductCategories from "../components/ProductCategories";
import Vouchers from "../components/Vouchers";
import NewArrivals from "../components/Newarrivals";
import BestSeller from "../components/BestSeller";

const Home = () => {
    return (
        <div className="pt-16"> 
            <Banner />
            <Features />
            <ProductCategories />
            <Vouchers />
            <BestSeller />
            <NewArrivals />
        </div>
    )
}

export default Home;