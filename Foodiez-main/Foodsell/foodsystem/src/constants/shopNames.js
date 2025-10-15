// Shop names constants
export const shopNames = {
  1: "Nhà hàng ABC",
  2: "Quán ăn XYZ", 
  3: "Cửa hàng đồ ăn nhanh",
  4: "Nhà hàng hải sản",
  5: "Quán cơm bình dân",
  6: "Cửa hàng bánh mì",
  7: "Nhà hàng lẩu",
  8: "Quán phở",
  9: "Cửa hàng pizza",
  10: "Nhà hàng BBQ"
};

export const getShopName = (shopId) => {
  return shopNames[shopId] || "Cửa hàng không xác định";
};