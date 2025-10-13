import React, { useState } from "react";
import FoodCategories from "../../components/CatogeryComponent/Foodcatogery";
import FoodProduct from "../../components/FoodProductComponent/ProductList";
import Banner from "../../components/BannerComponent/Banner";
import Navigation from "../../components/NavigationComponent/Navigation";
import "./HomePage.css";

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null = "Tất cả"

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <div className="container py-4">
      <Navigation />
      <Banner />
      <FoodCategories 
        onCategorySelect={handleCategorySelect}
        selectedCategoryId={selectedCategoryId}
      />
      <FoodProduct category={selectedCategoryId} />
    </div>
  );
}
