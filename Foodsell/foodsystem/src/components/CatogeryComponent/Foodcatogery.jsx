import React from "react"
import "./FoodCatogery.css"

const FoodCategories = ({ onCategorySelect, selectedCategoryId }) => {
  const categories = [
    {
      id: 1,
      name: "Phở",
      image: "/vietnamese-pho.png",
      description: "Vietnamese noodle soup, ready-to-eat",
    },
    {
      id: 2,
      name: "Bánh Mì",
      image: "/banh-mi-sandwich.jpg",
      description: "Vietnamese sandwich, ready-to-eat",
    },
    {
      id: 3,
      name: "Cơm",
      image: "/com.jpg",
      description: "Rice dishes, ready-to-eat",
    },
    {
      id: 4,
      name: "Nước uống",
      image: "/refreshing-drinks.png",
      description: "Beverages including coffee, tea, and soft drinks",
    },
    {
      id: 5,
      name: "Pizza",
      image: "/delicious-pizza-slice.jpg",
      description: "Món pizza phong cách Ý, nhiều loại topping đa dạng",
    },
    {
      id: 6,
      name: "Bún",
      image: "/bun.png",
      description: "Món bún Việt Nam truyền thống, dùng với thịt, chả",
    },
  ]

  return (
    <section className="categories">
      <div className="categories-container">
        <div className="categories-header">
          <h2 className="categories-title">Danh mục món ăn</h2>
          <p className="categories-subtitle">Khám phá đa dạng các loại món ăn từ khắp nơi trên thế giới</p>
        </div>

        <div className="categories-grid">
          {/* Nút "Tất cả" */}
          <div 
            className={`category-card ${selectedCategoryId === null ? 'active' : ''}`}
            onClick={() => onCategorySelect && onCategorySelect(null)}
          >
            <div className="category-content">
              <div className="category-image-wrapper">
                <div className="category-image-placeholder">
                  🍽️
                </div>
              </div>
              <h3 className="category-name">Tất cả</h3>
              <p className="category-description">Xem tất cả món ăn</p>
            </div>
          </div>

          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`category-card ${selectedCategoryId === category.id ? 'active' : ''}`}
              onClick={() => onCategorySelect && onCategorySelect(category.id)}
            >
              <div className="category-content">
                <div className="category-image-wrapper">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="category-image"
                  />
                </div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FoodCategories
