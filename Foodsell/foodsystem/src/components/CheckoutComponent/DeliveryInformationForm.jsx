import React, { useState } from 'react';
import './DeliveryInformationForm.css';
import { calculateShippingFee } from '../../config/shippingConfig';

const DeliveryInformationForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    address: initialData.address || '',
    city: initialData.city || '',
    district: initialData.district || '',
    notes: initialData.notes || ''
  });

  const [errors, setErrors] = useState({});
const cities = ['Đà Nẵng'];

const districts = {
  'Đà Nẵng': [
    'Hải Châu',
    'Thanh Khê',
    'Sơn Trà',
    'Ngũ Hành Sơn',
    'Liên Chiểu',
    'Cẩm Lệ',
    'Hòa Vang'
  ]
};



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Danh sách các từ khóa không hợp lệ
  const invalidKeywords = [
    'hà nội', 'ha noi', 'hcm', 'hồ chí minh', 'ho chi minh', 'sài gòn', 'sai gon',
    'huế', 'hue', 'quảng nam', 'quang nam', 'quảng ngãi', 'quang ngai'
  ];

  // Kiểm tra địa chỉ có chứa từ khóa không hợp lệ
  const containsInvalidLocation = (address) => {
    address = address.toLowerCase();
    return invalidKeywords.some(keyword => address.includes(keyword));
  };
  // Loại bỏ dấu để so sánh chuỗi một cách linh hoạt
  const removeDiacritics = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  // Danh sách từ khóa thường xuất hiện trong địa chỉ cụ thể
  const streetKeywords = ['duong', 'đường', 'pho', 'phố', 'hem', 'hẻm', 'ngo', 'ngõ', 'so', 'số', 'khu', 'khu vuc', 'khu vực', 'toa', 'tổ'];

  // Danh sách quận để kiểm tra
  const districtList = districts['Đà Nẵng'] || [];

  // Danh sách các đường chính phổ biến ở Đà Nẵng (mẫu) - dùng để kiểm tra đầu vào
  // Bạn có thể mở rộng hoặc thay đổi danh sách này theo dữ liệu thực tế của cửa hàng
  const mainStreetList = [
    'lê duẩn','le duan','trần phú','tran phu','nguyễn văn linh','nguyen van linh','nguyễn chí thanh','nguyen chi thanh',
    'phạm văn đồng','pham van dong','hùng vương','hung vuong','hoàng diệu','hoang dieu','ngô quyền','ngo quyen',
    'nguyễn văn thọ','nguyen van thoai','đặng thị nho','dang thi nho','quang trung','quang trung','phan đình phùng','phan dinh phung',
    'lý tự trọng','ly tu trong','lê văn hiến','le van hien','nguyễn hữu thọ','nguyen huu tho','trường chinh','truong chinh'
  ];

  const isValidAddress = (address) => {
    if (!address) return false;
    const addr = removeDiacritics(address.trim().toLowerCase());
// Kiểm tra độ dài tối thiểu
    if (addr.length < 6) return false;

    // Không cho phép nhập "Đà Nẵng" trong địa chỉ vì đã có ở dropdown
    const cityNormalized = removeDiacritics('Đà Nẵng').toLowerCase();
    if (addr === cityNormalized || addr.includes('danang') || addr.includes('da nang')) {
      return false;
    }
    
    // Kiểm tra xem địa chỉ có chứa tên đường không
    const containsStreetName = mainStreetList.some(street => 
      addr.includes(removeDiacritics(street).toLowerCase())
    );

    // Kiểm tra xem địa chỉ có chứa từ khóa chung về đường không
    const containsGenericStreet = streetKeywords.some(keyword => 
      addr.includes(removeDiacritics(keyword).toLowerCase())
    );

    // Địa chỉ hợp lệ khi:
    // 1. Có tên đường cụ thể hoặc từ khóa về đường
    // 2. Không chứa tên thành phố khác
    return (containsStreetName || containsGenericStreet) && !containsInvalidLocation(address);

    return false;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    } else if (containsInvalidLocation(formData.address)) {
      newErrors.address = 'Địa chỉ phải thuộc khu vực Đà Nẵng';
    } else if (!isValidAddress(formData.address)) {
      newErrors.address = 'Địa chỉ không hợp lệ hoặc không rõ ràng — vui lòng nhập địa chỉ cụ thể ở Đà Nẵng';
    }

    if (!formData.city) {
      newErrors.city = 'Vui lòng chọn thành phố';
    }

    if (!formData.district) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Pass both form data and shipping details to parent
      onSubmit({
        ...formData,
        shippingDetails
      });
    }
  };

  const [shippingDetails, setShippingDetails] = useState({
    fee: 0,
    distance: 0,
    breakdown: {
      baseFee: 0,
      distanceFee: 0,
      pricePerKm: 0
    }
  });

  // Giả sử nhà hàng ở Hải Châu
  const RESTAURANT_DISTRICT = "Hải Châu";

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setFormData(prev => ({
      ...prev,
      city: selectedCity,
      district: '' // Reset district when city changes
    }));
  };
const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setFormData(prev => ({
      ...prev,
      district: selectedDistrict
    }));

    // Tính phí ship khi chọn quận
    if (selectedDistrict) {
      const details = calculateShippingFee(RESTAURANT_DISTRICT, selectedDistrict);
      setShippingDetails(details);
    }
  };

  return (
    <div className="delivery-form-container">
      <div className="delivery-form-header">
        <h2>Thông tin giao hàng</h2>
        <p>Vui lòng điền đầy đủ thông tin để nhận hàng</p>
      </div>

      <form onSubmit={handleSubmit} className="delivery-form">
        {/* Full Name and Phone */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nguyễn Văn A"
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="0912345678"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="email@example.com"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address">Địa chỉ nhận hàng *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Số nhà, tên đường"
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        {/* City and District */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">Thành phố *</label>
            <select
              id="city"
              name="city"
value={formData.city}
              onChange={handleCityChange}
              className={errors.city ? 'error' : ''}
            >
              <option value="">Chọn thành phố</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="district">Quận/Huyện *</label>
            <select
              id="district"
              name="district"
              value={formData.district}
              onChange={handleDistrictChange}
              className={errors.district ? 'error' : ''}
              disabled={!formData.city}
            >
              <option value="">Chọn quận/huyện</option>
              {formData.city && districts[formData.city]?.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            {errors.district && <span className="error-message">{errors.district}</span>}
          </div>
        </div>

        {/* Hiển thị thông tin phí giao hàng */}
        {formData.district && (
          <div className="shipping-fee-details">
            <h3>Chi phí giao hàng:</h3>
            <div className="fee-breakdown">
              <p>Khoảng cách: {shippingDetails.distance} km</p>
              <p>Phí cơ bản: {shippingDetails.breakdown.baseFee.toLocaleString()}đ</p>
              <p>Phí theo khoảng cách ({shippingDetails.breakdown.pricePerKm}đ/km): {shippingDetails.breakdown.distanceFee.toLocaleString()}đ</p>
              <p className="total-fee">Tổng phí: {shippingDetails.fee.toLocaleString()}đ</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Ghi chú</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Ghi chú thêm về đơn hàng (tùy chọn)"
            rows="4"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="delivery-continue-btn">
          Tiếp tục
        </button>
      </form>
    </div>
  );
};

export default DeliveryInformationForm;