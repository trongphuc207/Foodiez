import FoodCategories from "../../components/CatogeryComponent/Foodcatogery";
import DieuHuong from "../../components/DieuHuongComponent/DieuHuong";
import Banner from "../../components/BannerComponent/Banner";

export default function HomePage() {
  return (
    <div className="container py-4">
      <DieuHuong/>
      <Banner />
      <FoodCategories />
    </div>
  );
}


