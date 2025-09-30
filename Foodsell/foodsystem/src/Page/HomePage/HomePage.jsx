import React from "react";
import FoodCategories from "../../components/CatogeryComponent/Foodcatogery";
import FoodProduct from "../../components/FoodProductComponent/ProductList";
import Banner from "../../components/BannerComponent/Banner";
import Navigation from "../../components/NavigationComponent/Navigation";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="container py-4">
      <Navigation />
      <Banner />
      <FoodCategories />
      <FoodProduct />
    </div>
  );
}
