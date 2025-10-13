// Category names constants
export const categoryNames = {
  1: "Món chính",
  2: "Món phụ", 
  3: "Đồ uống",
  4: "Tráng miệng",
  5: "Đồ ăn nhanh",
  6: "Món chay",
  7: "Hải sản",
  8: "Thịt nướng",
  9: "Món lẩu",
  10: "Bánh mì"
};

export const getCategoryName = (categoryId) => {
  return categoryNames[categoryId] || "Danh mục không xác định";
};