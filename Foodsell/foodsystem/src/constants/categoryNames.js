// Category names constants - đồng bộ với backend
export const categoryNames = {
  1: "Phở",
  2: "Bánh Mì", 
  3: "Cơm",
  4: "Nước uống",
  5: "Pizza",
  6: "Bún"
};

export const getCategoryName = (categoryId) => {
  return categoryNames[categoryId] || "Danh mục không xác định";
};