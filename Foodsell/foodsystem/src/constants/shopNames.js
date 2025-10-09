// Mapping tên shop từ ID sang tên thật
export const SHOP_NAMES = {
  1: "Pho Delicious",
  2: "Banh Mi King", 
  3: "Mì Quảng 123",
  4: "Cơm Gà Bà Buội",
  5: "Bún Chả Cá 109",
  6: "Pizza Zone",
  7: "Coffee & Chill"
};

// Function để lấy tên shop theo ID
export const getShopName = (shopId) => {
  return SHOP_NAMES[shopId] || `Shop ${shopId}`;
};
