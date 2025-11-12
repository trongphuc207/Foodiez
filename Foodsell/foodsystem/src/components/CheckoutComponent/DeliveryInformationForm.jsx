import React, { useState, useEffect } from 'react';
import './DeliveryInformationForm.css';
import { calculateShippingFee, inferDistrictFromAddress, STREET_TO_DISTRICT } from '../../config/shippingConfig';

const DeliveryInformationForm = ({ onSubmit, initialData = {}, restaurantDistrict = null }) => {
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
      // If user types address and district is empty, try to infer district and auto-set it
      if (name === 'address') {
        try {
          // Try to detect a street -> district mapping specifically, but DO NOT auto-set the district.
          // Instead record the inferredStreetDistrict and show a warning at selection/submit time.
          const norm = removeDiacritics(value || '');
          let mapped = null;
          for (const sk of Object.keys(STREET_TO_DISTRICT)) {
            // Normalize the mapping key first so it matches the normalized address
            const skNorm = removeDiacritics(sk || '');
            const escaped = skNorm.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
            const pattern = '\\b' + escaped.replace(/\s+/g, '\\s+') + '\\b';
            const re = new RegExp(pattern, 'i');
            if (re.test(norm)) { mapped = STREET_TO_DISTRICT[sk]; break; }
          }
          if (mapped) {
            setInferredStreetDistrict(mapped);
            console.log('[handleInputChange] detected street-mapped district:', mapped, 'for address:', value, 'addrNorm=', norm);
            // update shipping preview only when user has chosen a district matching the mapping
            if (formData.district && removeDiacritics(formData.district) === removeDiacritics(mapped)) {
              const details = calculateShippingFee((restaurantDistrict || 'Hải Châu'), mapped);
              setShippingDetails(details);
              setMismatchWarning('');
            } else {
              setMismatchWarning(`Địa chỉ chứa đường thuộc quận ${mapped} — vui lòng chọn quận tương ứng.`);
            }
          } else {
            // No street-specific mapping found, try the general inference function
            const inferred = inferDistrictFromAddress(value || '');
            if (inferred) {
              setInferredStreetDistrict(inferred);
              console.log('[handleInputChange] inferred district from address:', inferred, 'for address:', value);
              if (formData.district && removeDiacritics(formData.district) === removeDiacritics(inferred)) {
                const details = calculateShippingFee((restaurantDistrict || 'Hải Châu'), inferred);
                setShippingDetails(details);
                setMismatchWarning('');
              } else {
                setMismatchWarning(`Địa chỉ có thể thuộc quận ${inferred} — vui lòng chọn quận tương ứng.`);
              }
            } else {
              setInferredStreetDistrict(null);
              setMismatchWarning('');
            }
          }
        } catch (err) {
          console.warn('Error inferring district from address:', err);
        }
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
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Danh sách từ khóa thường xuất hiện trong địa chỉ cụ thể
  const streetKeywords = ['duong', 'đường', 'pho', 'phố', 'hem', 'hẻm', 'ngo', 'ngõ', 'so', 'số', 'khu', 'khu vuc', 'khu vực', 'toa', 'tổ'];

  // Danh sách quận để kiểm tra
  const districtList = districts['Đà Nẵng'] || [];

  // Danh sách các đường chính phổ biến ở Đà Nẵng (mẫu) - dùng để kiểm tra đầu vào
  // Bạn có thể mở rộng hoặc thay đổi danh sách này theo dữ liệu thực tế của cửa hàng
  const mainStreetList = [
    // Common main streets in Đà Nẵng (accented + ascii variants)
    'lê duẩn','le duan',
    'trần phú','tran phu',
    'nguyễn văn linh','nguyen van linh',
    'nguyễn chí thanh','nguyen chi thanh',
    'phạm văn đồng','pham van dong',
    'hùng vương','hung vuong',
    'hoàng diệu','hoang dieu',
    'ngô quyền','ngo quyen',
    'nguyễn văn thọ','nguyen van thoai',
    'đặng thị nho','dang thi nho',
    'quang trung','quang trung',
    'phan đình phùng','phan dinh phung',
    'lý tự trọng','ly tu trong',
    'lê văn hiến','le van hien',
    'nguyễn hữu thọ','nguyen huu tho',
    'trường chinh','truong chinh',
    'trần hưng đạo','tran hung dao',
    'trưng nữ vương','trung nu vuong',
    'nguyễn tất thành','nguyen tat thanh',
    'hoàng văn thái','hoang van thai',
    'phan chu trinh','phan chu trinh',
    'nguyễn tri phương','nguyen tri phuong',
    'nguyễn công trứ','nguyen cong tru',
    'võ nguyên giáp','vo nguyen giap',
    'hoàng sa','hoang sa',
    'trường sa','truong sa',
    'hai bà trưng','hai ba trung',
    'phan châu trinh','phan chau trinh',
    'nguyễn tường quảng','nguyen tuong quang',
    'nguyễn hoàng','nguyen hoang',
    'võ thị sáu','vo thi sau',
    'nguyễn minh thức','nguyen minh thuc',
    'ngô gia tự','ngo gia tu'
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

  // Helper: check if address contains any street that maps to given district
  const addressContainsStreetForDistrict = (address, district) => {
    if (!address || !district) return false;
    const norm = removeDiacritics(address || '');
  console.log('[addressContainsStreetForDistrict] addrNorm=', norm, 'district=', district);
    for (const [streetKey, d] of Object.entries(STREET_TO_DISTRICT)) {
      if (d === district) {
        // Normalize mapping key to match normalized address
        const keyNorm = removeDiacritics(streetKey || '');
        const escaped = keyNorm.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
        const pattern = '\\b' + escaped.replace(/\s+/g, '\\s+') + '\\b';
        const re = new RegExp(pattern, 'i');
  const ok = re.test(norm);
  console.log('[addressContainsStreetForDistrict] testing key=', keyNorm, 'pattern=', pattern, 'match=', ok);
        if (ok) return true;
      }
    }
    return false;
  }

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

    // Enforce street->district mapping: if address contains a street mapped to a district,
    // require the selected district to be that district.
    try {
      const addrNorm = removeDiacritics(formData.address || '');
      let mappedDistrict = null;
      for (const [sk, d] of Object.entries(STREET_TO_DISTRICT)) {
        // Normalize mapping key so it matches the normalized address string
        const skNorm = removeDiacritics(sk || '');
        const escaped = skNorm.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
        const pattern = '\\b' + escaped.replace(/\s+/g, '\\s+') + '\\b';
        const re = new RegExp(pattern, 'i');
        if (re.test(addrNorm)) { mappedDistrict = d; break; }
      }
  // DEBUG: log address normalization and mapped district for troubleshooting
  console.log('[validateForm] addrNorm=', addrNorm, 'mappedDistrict=', mappedDistrict, 'selectedDistrict=', formData.district);
      if (mappedDistrict) {
        // Compare normalized district names to avoid mismatches caused by diacritics/encoding
  const selectedNorm = removeDiacritics(formData.district || '');
  const mappedNorm = removeDiacritics(mappedDistrict || '');
  console.log('[validateForm] selectedNorm=', selectedNorm, 'mappedNorm=', mappedNorm);
        // If mapped district exists but user selected a different district, block submit
        if (formData.district && selectedNorm !== mappedNorm) {
          newErrors.district = `Địa chỉ chứa đường thuộc quận ${mappedDistrict} — vui lòng chọn quận tương ứng.`;
          setMismatchWarning(`Địa chỉ chứa đường thuộc quận ${mappedDistrict} — vui lòng chọn quận tương ứng.`);
        }
      }
    } catch (err) {
      console.warn('Error enforcing street->district mapping during validation:', err);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Block submit if there's a mismatch warning present (prevents Enter or other bypass)
    if (mismatchWarning) {
      setErrors(prev => ({ ...prev, district: prev.district || mismatchWarning }));
      console.log('[handleSubmit] blocked due to mismatchWarning:', mismatchWarning);
      return;
    }
    // Extra guard: re-check street->district mapping right before submit to
    // ensure transient UI state or race conditions can't bypass validation.
    try {
      const addrNorm = removeDiacritics(formData.address || '');
      let mappedDistrict = null;
      for (const [sk, d] of Object.entries(STREET_TO_DISTRICT)) {
        const skNorm = removeDiacritics(sk || '');
        const escaped = skNorm.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
        const pattern = '\\b' + escaped.replace(/\s+/g, '\\s+') + '\\b';
        const re = new RegExp(pattern, 'i');
        if (re.test(addrNorm)) { mappedDistrict = d; break; }
      }
      if (mappedDistrict) {
        const selNorm = removeDiacritics(formData.district || '');
        const mapNorm = removeDiacritics(mappedDistrict || '');
        if (selNorm !== mapNorm) {
          setErrors(prev => ({ ...prev, district: `Địa chỉ chứa đường thuộc quận ${mappedDistrict} — vui lòng chọn quận tương ứng.` }));
          setMismatchWarning(`Địa chỉ chứa đường thuộc quận ${mappedDistrict} — vui lòng chọn quận tương ứng.`);
          return; // block submit
        }
      }

    } catch (err) {
      console.warn('Error during submit guard check:', err);
    }

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

  // Inferred district based on street keywords in the address
  const [inferredStreetDistrict, setInferredStreetDistrict] = useState(null);
  // Warning when district and address-derived district mismatch
  const [mismatchWarning, setMismatchWarning] = useState('');

  // Fallback quận của cửa hàng nếu chưa suy luận được (tránh khoảng cách = 0 do fromDistrict = null)
  // Đặt trước khi dùng trong useEffect để tránh ReferenceError trong TDZ.
  const RESTAURANT_DISTRICT = restaurantDistrict || 'Hải Châu';

  // Ensure validations and shipping details are computed when component mounts
  // or when initialData provides prefilled address/district values.
  useEffect(() => {
    try {
      // If district is selected, compute shipping details
      if (formData.district) {
        const details = calculateShippingFee(RESTAURANT_DISTRICT, formData.district);
        if (!details.breakdown.isResolved) {
          console.log('[Shipping] distance unresolved (from/to not matched). from=', RESTAURANT_DISTRICT, 'to=', formData.district, 'breakdown=', details.breakdown);
        }
        setShippingDetails(details);
      }

      // Re-run mapping inference to set mismatch warning if needed
      if (formData.address) {
        const addrNorm = removeDiacritics(formData.address || '');
        let mapped = null;
        for (const [sk, d] of Object.entries(STREET_TO_DISTRICT)) {
          const skNorm = removeDiacritics(sk || '');
          const escaped = skNorm.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
          const pattern = '\\b' + escaped.replace(/\s+/g, '\\s+') + '\\b';
          const re = new RegExp(pattern, 'i');
          if (re.test(addrNorm)) { mapped = d; break; }
        }
        setInferredStreetDistrict(mapped);
        if (mapped && formData.district && formData.district !== mapped) {
          setMismatchWarning(`Địa chỉ chứa đường thuộc quận ${mapped} — vui lòng chọn quận tương ứng.`);
        } else if (mapped) {
          setMismatchWarning('');
        }
      }
    } catch (err) {
      console.warn('Error during initial mapping/shipping computation:', err);
    }
  }, [formData.address, formData.district, RESTAURANT_DISTRICT]);

  // RESTAURANT_DISTRICT đã được định nghĩa phía trên với fallback

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

    // If address contains a street mapped to a different district, warn the user
    try {
      if (formData.address) {
  console.log('[handleDistrictChange] selectedDistrict=', selectedDistrict, 'address=', formData.address);
  const containsForSelected = addressContainsStreetForDistrict(formData.address, selectedDistrict);
  console.log('[handleDistrictChange] containsForSelected=', containsForSelected);
        if (!containsForSelected) {
          // If address contains a street mapped to another district, show mismatch
          let mappedOther = null;
          const norm = removeDiacritics(formData.address || '');
          for (const [sk, d] of Object.entries(STREET_TO_DISTRICT)) {
            const skNorm = removeDiacritics(sk || '');
            const escaped = skNorm.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
            const pattern = '\\b' + escaped.replace(/\s+/g, '\\s+') + '\\b';
            const re = new RegExp(pattern, 'i');
            const ok = re.test(norm);
            console.log('[handleDistrictChange] testing sk=', skNorm, 'pattern=', pattern, 'match=', ok, 'mapsTo=', d);
            if (ok && d !== selectedDistrict) { mappedOther = d; break; }
          }
          if (mappedOther) {
            setMismatchWarning(`Địa chỉ chứa đường thuộc quận ${mappedOther} — quận bạn chọn là ${selectedDistrict}. Vui lòng kiểm tra lại.`);
            setErrors(prev => ({ ...prev, district: '' }));
          } else {
            setMismatchWarning('');
          }
        } else {
          setMismatchWarning('');
        }
      } else {
        setMismatchWarning('');
      }
    } catch (err) {
      console.warn('Error checking district/street match:', err);
    }
  };

  return (
    <div className="delivery-form-container">
      <div className="delivery-form-header">
        <h2>Thông tin giao hàng</h2>
        <p>Vui lòng điền đầy đủ thông tin để nhận hàng</p>
      </div>

  <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && mismatchWarning) { e.preventDefault(); console.log('[form] prevented Enter submit due to mismatchWarning'); } }} className="delivery-form">
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
            {mismatchWarning && <span className="error-message">{mismatchWarning}</span>}
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
        <button
          type="submit"
          className="delivery-continue-btn"
          disabled={Boolean(mismatchWarning)}
          title={mismatchWarning || 'Tiếp tục để sang bước thanh toán'}
        >
          Tiếp tục
        </button>
      </form>
    </div>
  );
};

export default DeliveryInformationForm;