import FoodCategories from "../../components/CatogeryComponent/Foodcatogery";
import Banner from "../../components/BannerComponent/Banner";
import Navigation from "../../components/NavigationComponent/Navigation";

export default function HomePage() {
  return (
    <div className="container py-4">
      <Navigation/>
      <Banner />
      <FoodCategories />
    </div>
  );
}


