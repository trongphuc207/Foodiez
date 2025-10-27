// Khoảng cách thực tế giữa các quận (km)
export const DISTRICT_DISTANCES = {
  "Hải Châu": {
    "Hải Châu": 1.2,    // Trong nội quận
    "Thanh Khê": 3.5,   // Khoảng cách thực từ trung tâm Hải Châu đến Thanh Khê
    "Sơn Trà": 4.2,     // Đến Sơn Trà
    "Ngũ Hành Sơn": 5.8, // Đến Ngũ Hành Sơn
    "Cẩm Lệ": 4.7,      // Đến Cẩm Lệ
    "Liên Chiểu": 8.3,  // Đến Liên Chiểu
    "Hòa Vang": 15.2    // Đến Hòa Vang
  },
  "Thanh Khê": {
    "Thanh Khê": 1.5,
    "Hải Châu": 3.5,
    "Sơn Trà": 5.6,
    "Ngũ Hành Sơn": 7.2,
    "Cẩm Lệ": 6.1,
    "Liên Chiểu": 4.8,
    "Hòa Vang": 16.5
  },
  "Sơn Trà": {
    "Sơn Trà": 1.3,
    "Hải Châu": 4.2,
    "Thanh Khê": 5.6,
    "Ngũ Hành Sơn": 4.9,
    "Cẩm Lệ": 7.8,
    "Liên Chiểu": 9.4,
    "Hòa Vang": 18.3
  },
  "Ngũ Hành Sơn": {
    "Ngũ Hành Sơn": 1.4,
    "Hải Châu": 5.8,
    "Thanh Khê": 7.2,
    "Sơn Trà": 4.9,
    "Cẩm Lệ": 6.3,
    "Liên Chiểu": 11.5,
    "Hòa Vang": 17.8
  },
  "Cẩm Lệ": {
    "Cẩm Lệ": 1.3,
    "Hải Châu": 4.7,
    "Thanh Khê": 6.1,
    "Sơn Trà": 7.8,
    "Ngũ Hành Sơn": 6.3,
    "Liên Chiểu": 9.2,
    "Hòa Vang": 12.4
  },
  "Liên Chiểu": {
    "Liên Chiểu": 1.6,
    "Hải Châu": 8.3,
    "Thanh Khê": 4.8,
    "Sơn Trà": 9.4,
    "Ngũ Hành Sơn": 11.5,
    "Cẩm Lệ": 9.2,
    "Hòa Vang": 14.7
  },
  "Hòa Vang": {
    "Hòa Vang": 2.1,
    "Hải Châu": 15.2,
    "Thanh Khê": 16.5,
    "Sơn Trà": 18.3,
    "Ngũ Hành Sơn": 17.8,
    "Cẩm Lệ": 12.4,
    "Liên Chiểu": 14.7
  }
};

export const calculateShippingFee = (fromDistrict, toDistrict) => {
  // Phí cơ bản
  const BASE_FEE = 15000; // VND
  
  // Phí theo km
  const PRICE_PER_KM = 1000; // 1000đ/km
  
  // Lấy khoảng cách
  const distance = DISTRICT_DISTANCES[fromDistrict][toDistrict];
  
  // Tính tổng phí
  const distanceFee = Math.round(distance * PRICE_PER_KM);
  const totalFee = BASE_FEE + distanceFee;
  
  return {
    fee: totalFee,
    distance: distance,
    breakdown: {
      baseFee: BASE_FEE,
      distanceFee: distanceFee,
      pricePerKm: PRICE_PER_KM
    }
  };
};