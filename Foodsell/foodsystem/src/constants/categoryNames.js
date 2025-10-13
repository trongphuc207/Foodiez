// Mapping tên category từ ID sang tên thật (theo database)
export const CATEGORY_NAMES = {
  1: "Phở",
  2: "Bánh Mì", 
  3: "Cơm",
  4: "Nước uống",
  5: "Pizza",
  6: "Bún"
};

// Function để lấy tên category theo ID
export const getCategoryName = (categoryId) => {
  return CATEGORY_NAMES[categoryId] || `Category ${categoryId}`;
};





