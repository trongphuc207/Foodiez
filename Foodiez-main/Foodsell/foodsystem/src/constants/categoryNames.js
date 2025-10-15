// Category names constants
export const categoryNames = {
  1: "Phở",
  2: "Bánh Mì", 
  3: "Cơm",
  4: "Nước uống",
  5: "Pizza",
  6: "Bún",
  7: "Hải sản",
  8: "Thịt nướng",
  9: "Món lẩu",
  10: "Món chay"
};

// Alias for backward compatibility
export const CATEGORY_NAMES = categoryNames;

export const getCategoryName = (categoryId) => {
  return categoryNames[categoryId] || "Danh mục không xác định";
};