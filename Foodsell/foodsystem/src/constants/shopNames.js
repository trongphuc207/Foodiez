// Shop names constants - mapping với database thật
export const shopNames = {
  1: "Phở Delicious",
  2: "Bánh Mì King", 
  3: "Mì Quảng 123",
  4: "Cơm Gà Bà Buội",
  5: "Bún Chả Cá 109",
  6: "Pizza Zone",
  7: "Coffee & Chill"
};

export const getShopName = (shopId) => {
  return shopNames[shopId] || "Cửa hàng không xác định";
};