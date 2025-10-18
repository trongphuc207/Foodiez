import React, { useState } from "react";
import FoodCategories from "../../components/CatogeryComponent/Foodcatogery";
import FoodProduct from "../../components/FoodProductComponent/ProductList";
import Banner from "../../components/BannerComponent/Banner";
import Navigation from "../../components/NavigationComponent/Navigation";
import VoucherSection from "../../components/VoucherComponent/VoucherSection";
import CartCheckComponent from "../../components/CartCheckComponent/CartCheckComponent";
import "./HomePage.css";

export default function HomePage() {
  const [showVoucherSection, setShowVoucherSection] = useState(false);

  return (
    <div className="container py-4">
      <CartCheckComponent />
      <Navigation />
      <Banner />
      
      {/* Voucher Section */}
      <div className="voucher-section-container">
        <div className="voucher-toggle">
          <button 
            className="voucher-toggle-btn"
            onClick={() => setShowVoucherSection(!showVoucherSection)}
          >
            🎫 {showVoucherSection ? 'Ẩn' : 'Nhận voucher'} 
          </button>
        </div>
        
        {showVoucherSection && (
          <div className="voucher-content">
            <VoucherSection 
              userId={1} // TODO: Lấy từ authentication context
              orderAmount={0} // Không cần cho việc claim voucher
              onVoucherApplied={() => {}} // Không cần cho claim
              appliedVoucher={null}
              onRemoveVoucher={() => {}}
            />
          </div>
        )}
      </div>
      
      <FoodCategories />
      <FoodProduct />
    </div>
  );
}
