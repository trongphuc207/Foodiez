// Mapping tên category từ ID sang tên thật
export const CATEGORY_NAMES = {
  1: "Phở",
  2: "Bánh mì", 
  3: "Cơm",
  4: "Nước uống"
};

// Function để lấy tên category theo ID
export const getCategoryName = (categoryId) => {
  return CATEGORY_NAMES[categoryId] || `Category ${categoryId}`;
};
