import "./FoodCatogery.css"

const FoodCategories = () => {
  const categories = [
    {
      id: 1,
      name: "Pizza",
      image: "/delicious-pizza-slice.jpg",
      description: "Pizza Ý thơm ngon",
    },
    {
      id: 2,
      name: "Burger",
      image: "/juicy-hamburger-with-fries.jpg",
      description: "Burger tươi ngon",
    },
    {
      id: 3,
      name: "Sushi",
      image: "/fresh-sushi-rolls-and-sashimi.jpg",
      description: "Sushi Nhật Bản",
    },
    {
      id: 4,
      name: "Món Việt",
      image: "/vietnamese-pho.png",
      description: "Ẩm thực Việt Nam",
    },
    {
      id: 5,
      name: "Dessert",
      image: "/colorful-desserts-and-cakes.jpg",
      description: "Tráng miệng ngọt ngào",
    },
    {
      id: 6,
      name: "Đồ uống",
      image: "/refreshing-drinks.png",
      description: "Thức uống giải khát",
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
          {categories.map((category) => (
            <div key={category.id} className="category-card">
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
