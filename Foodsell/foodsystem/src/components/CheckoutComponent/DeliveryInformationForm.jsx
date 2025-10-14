import React, { useState } from 'react';
import './DeliveryInformationForm.css';

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

  const cities = [
    'Hà Nội',
    'Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái'
  ];

  const districts = {
    'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân', 'Sóc Sơn', 'Đông Anh', 'Gia Lâm', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Mê Linh', 'Hà Đông', 'Sơn Tây', 'Ba Vì', 'Phúc Thọ', 'Đan Phượng', 'Hoài Đức', 'Quốc Oai', 'Thạch Thất', 'Chương Mỹ', 'Thanh Oai', 'Thường Tín', 'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức'],
    'Hồ Chí Minh': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Thủ Đức', 'Gò Vấp', 'Bình Thạnh', 'Tân Bình', 'Tân Phú', 'Phú Nhuận', 'Bình Tân', 'Củ Chi', 'Hóc Môn', 'Bình Chánh', 'Nhà Bè', 'Cần Giờ'],
    'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang', 'Hoàng Sa'],
    'Hải Phòng': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', 'Đồ Sơn', 'Dương Kinh', 'Thuỷ Nguyên', 'An Dương', 'An Lão', 'Kiến Thuỵ', 'Tiên Lãng', 'Vĩnh Bảo', 'Cát Hải', 'Bạch Long Vĩ'],
    'Cần Thơ': ['Ninh Kiều', 'Ô Môn', 'Bình Thuỷ', 'Cái Răng', 'Thốt Nốt', 'Vĩnh Thạnh', 'Cờ Đỏ', 'Phong Điền', 'Thới Lai'],
    'An Giang': ['Long Xuyên', 'Châu Đốc', 'An Phú', 'Tân Châu', 'Phú Tân', 'Châu Phú', 'Tịnh Biên', 'Tri Tôn', 'Châu Thành', 'Chợ Mới', 'Thoại Sơn'],
    'Bà Rịa - Vũng Tàu': ['Vũng Tàu', 'Bà Rịa', 'Châu Đức', 'Xuyên Mộc', 'Long Điền', 'Đất Đỏ', 'Côn Đảo', 'Tân Thành'],
    'Bắc Giang': ['Bắc Giang', 'Yên Thế', 'Tân Yên', 'Lạng Giang', 'Lục Nam', 'Lục Ngạn', 'Sơn Động', 'Yên Dũng', 'Việt Yên', 'Hiệp Hòa'],
    'Bắc Kạn': ['Bắc Kạn', 'Pác Nặm', 'Ba Bể', 'Ngân Sơn', 'Bạch Thông', 'Chợ Đồn', 'Chợ Mới', 'Na Rì'],
    'Bạc Liêu': ['Bạc Liêu', 'Hồng Dân', 'Phước Long', 'Vĩnh Lợi', 'Giá Rai', 'Đông Hải', 'Hoà Bình'],
    'Bắc Ninh': ['Bắc Ninh', 'Yên Phong', 'Quế Võ', 'Tiên Du', 'Từ Sơn', 'Gia Bình', 'Lương Tài'],
    'Bến Tre': ['Bến Tre', 'Châu Thành', 'Chợ Lách', 'Mỏ Cày Bắc', 'Mỏ Cày Nam', 'Giồng Trôm', 'Bình Đại', 'Ba Tri', 'Thạnh Phú'],
    'Bình Định': ['Quy Nhon', 'An Lão', 'Hoài Ân', 'Hoài Nhơn', 'Phù Mỹ', 'Vĩnh Thạnh', 'Tây Sơn', 'Phù Cát', 'Vân Canh', 'An Nhơn', 'Tuy Phước'],
    'Bình Dương': ['Thủ Dầu Một', 'Dĩ An', 'Thuận An', 'Tân Uyên', 'Bến Cát', 'Dầu Tiếng', 'Phú Giáo', 'Bàu Bàng', 'Bắc Tân Uyên'],
    'Bình Phước': ['Đồng Xoài', 'Bình Long', 'Lộc Ninh', 'Bù Đăng', 'Bù Đốp', 'Hớn Quản', 'Đồng Phú', 'Chơn Thành', 'Bù Gia Mập'],
    'Bình Thuận': ['Phan Thiết', 'La Gi', 'Tuy Phong', 'Bắc Bình', 'Hàm Thuận Bắc', 'Hàm Thuận Nam', 'Tánh Linh', 'Đức Linh', 'Hàm Tân', 'Phú Quí'],
    'Cà Mau': ['Cà Mau', 'U Minh', 'Thới Bình', 'Trần Văn Thời', 'Cái Nước', 'Đầm Dơi', 'Ngọc Hiển', 'Năm Căn', 'Phú Tân'],
    'Cao Bằng': ['Cao Bằng', 'Bảo Lạc', 'Bảo Lâm', 'Hạ Lang', 'Hà Quảng', 'Hoà An', 'Nguyên Bình', 'Phục Hoà', 'Quảng Uyên', 'Thạch An', 'Thông Nông', 'Trà Lĩnh', 'Trùng Khánh'],
    'Đắk Lắk': ['Buôn Ma Thuột', 'Buôn Hồ', 'Ea H\'Leo', 'Ea Súp', 'Buôn Đôn', 'Cư M\'gar', 'Krông Búk', 'Krông Năng', 'Ea Kar', 'M\'Đrắk', 'Krông Bông', 'Krông Pắk', 'Krông A Na', 'Lắk', 'Cư Kuin'],
    'Đắk Nông': ['Gia Nghĩa', 'Đắk Glong', 'Cư Jút', 'Đắk Mil', 'Krông Nô', 'Đắk Song', 'Đắk R\'Lấp', 'Tuy Đức'],
    'Điện Biên': ['Điện Biên Phủ', 'Mường Lay', 'Mường Nhé', 'Mường Chà', 'Tủa Chùa', 'Tuần Giáo', 'Điện Biên', 'Điện Biên Đông', 'Mường Ảng', 'Nậm Pồ'],
    'Đồng Nai': ['Biên Hòa', 'Long Khánh', 'Cẩm Mỹ', 'Định Quán', 'Long Thành', 'Nhơn Trạch', 'Tân Phú', 'Thống Nhất', 'Vĩnh Cửu', 'Xuân Lộc', 'Trảng Bom'],
    'Đồng Tháp': ['Cao Lãnh', 'Sa Đéc', 'Hồng Ngự', 'Tân Hồng', 'Tam Nông', 'Thanh Bình', 'Lấp Vò', 'Lai Vung', 'Châu Thành', 'Tháp Mười', 'Cao Lãnh'],
    'Gia Lai': ['Pleiku', 'An Khê', 'Ayun Pa', 'KBang', 'Đăk Đoa', 'Đăk Pơ', 'Đức Cơ', 'Chư Păh', 'Chư Prông', 'Chư Sê', 'Ia Grai', 'Ia Pa', 'Krông Pa', 'Mang Yang', 'Kông Chro', 'Phú Thiện'],
    'Hà Giang': ['Hà Giang', 'Đồng Văn', 'Mèo Vạc', 'Yên Minh', 'Quản Bạ', 'Vị Xuyên', 'Bắc Mê', 'Hoàng Su Phì', 'Xín Mần', 'Bắc Quang', 'Quang Bình'],
    'Hà Nam': ['Phủ Lý', 'Duy Tiên', 'Kim Bảng', 'Lý Nhân', 'Thanh Liêm', 'Bình Lục'],
    'Hà Tĩnh': ['Hà Tĩnh', 'Hồng Lĩnh', 'Hương Sơn', 'Đức Thọ', 'Vũ Quang', 'Nghi Xuân', 'Can Lộc', 'Hương Khê', 'Thạch Hà', 'Cẩm Xuyên', 'Kỳ Anh', 'Lộc Hà'],
    'Hải Dương': ['Hải Dương', 'Chí Linh', 'Nam Sách', 'Kinh Môn', 'Kim Thành', 'Thanh Hà', 'Cẩm Giàng', 'Bình Giang', 'Gia Lộc', 'Tứ Kỳ', 'Ninh Giang', 'Thanh Miện'],
    'Hậu Giang': ['Vị Thanh', 'Ngã Bảy', 'Châu Thành', 'Châu Thành A', 'Long Mỹ', 'Phụng Hiệp', 'Vị Thủy'],
    'Hòa Bình': ['Hòa Bình', 'Đà Bắc', 'Kỳ Sơn', 'Lương Sơn', 'Kim Bôi', 'Cao Phong', 'Tân Lạc', 'Mai Châu', 'Lạc Sơn', 'Yên Thủy', 'Lạc Thủy'],
    'Hưng Yên': ['Hưng Yên', 'Văn Lâm', 'Văn Giang', 'Yên Mỹ', 'Mỹ Hào', 'Ân Thi', 'Khoái Châu', 'Kim Động', 'Tiên Lữ', 'Phù Cừ', 'Trấn Yên'],
    'Khánh Hòa': ['Nha Trang', 'Cam Ranh', 'Cam Lâm', 'Diên Khánh', 'Khánh Sơn', 'Khánh Vĩnh', 'Ninh Hòa', 'Trường Sa', 'Vạn Ninh'],
    'Kiên Giang': ['Rạch Giá', 'Hà Tiên', 'Kiên Lương', 'Hòn Đất', 'Tân Hiệp', 'Châu Thành', 'Giồng Riềng', 'Gò Quao', 'An Biên', 'An Minh', 'Vĩnh Thuận', 'Phú Quốc', 'Kiên Hải', 'U Minh Thượng', 'Giang Thành'],
    'Kon Tum': ['Kon Tum', 'Đắk Glei', 'Ngọc Hồi', 'Đắk Tô', 'Kon Plông', 'Kon Rẫy', 'Đắk Hà', 'Sa Thầy', 'Tu Mơ Rông', 'Ia H\'Drai'],
    'Lai Châu': ['Lai Châu', 'Tam Đường', 'Mường Tè', 'Sìn Hồ', 'Phong Thổ', 'Than Uyên', 'Tân Uyên', 'Nậm Nhùn'],
    'Lâm Đồng': ['Đà Lạt', 'Bảo Lộc', 'Đơn Dương', 'Lạc Dương', 'Đức Trọng', 'Di Linh', 'Bảo Lâm', 'Cát Tiên', 'Đạ Huoai', 'Đạ Tẻh', 'Lâm Hà'],
    'Lạng Sơn': ['Lạng Sơn', 'Tràng Định', 'Bình Gia', 'Văn Lãng', 'Cao Lộc', 'Văn Quan', 'Bắc Sơn', 'Hữu Lũng', 'Chi Lăng', 'Đình Lập', 'Lộc Bình'],
    'Lào Cai': ['Lào Cai', 'Bát Xát', 'Mường Khương', 'Si Ma Cai', 'Bắc Hà', 'Bảo Thắng', 'Bảo Yên', 'Sa Pa', 'Văn Bàn'],
    'Long An': ['Tân An', 'Kiến Tường', 'Tân Hưng', 'Vĩnh Hưng', 'Mộc Hóa', 'Tân Thạnh', 'Thạnh Hóa', 'Đức Huệ', 'Đức Hòa', 'Bến Lức', 'Thủ Thừa', 'Tân Trụ', 'Cần Đước', 'Cần Giuộc', 'Châu Thành'],
    'Nam Định': ['Nam Định', 'Mỹ Lộc', 'Vụ Bản', 'Ý Yên', 'Nghĩa Hưng', 'Nam Trực', 'Trực Ninh', 'Xuân Trường', 'Giao Thủy', 'Hải Hậu'],
    'Nghệ An': ['Vinh', 'Cửa Lò', 'Quỳnh Lưu', 'Diễn Châu', 'Yên Thành', 'Đô Lương', 'Anh Sơn', 'Con Cuông', 'Tân Kỳ', 'Quỳ Hợp', 'Nghĩa Đàn', 'Quỳ Châu', 'Kỳ Sơn', 'Tương Dương', 'Nam Đàn', 'Hưng Nguyên', 'Nghi Lộc', 'Nghi Xuân', 'Thanh Chương', 'Đô Lương', 'Lục Nam', 'Lục Ngạn', 'Sơn Động', 'Yên Dũng', 'Việt Yên', 'Hiệp Hòa'],
    'Ninh Bình': ['Ninh Bình', 'Tam Điệp', 'Nho Quan', 'Gia Viễn', 'Hoa Lư', 'Yên Khánh', 'Kim Sơn', 'Yên Mô'],
    'Ninh Thuận': ['Phan Rang-Tháp Chàm', 'Bác Ái', 'Ninh Sơn', 'Ninh Hải', 'Ninh Phước', 'Thuận Bắc', 'Thuận Nam'],
    'Phú Thọ': ['Việt Trì', 'Phú Thọ', 'Đoan Hùng', 'Hạ Hoà', 'Thanh Ba', 'Phù Ninh', 'Yên Lập', 'Cẩm Khê', 'Tam Nông', 'Lâm Thao', 'Thanh Sơn', 'Yên Lập'],
    'Phú Yên': ['Tuy Hòa', 'Sông Cầu', 'Đồng Xuân', 'Tuy An', 'Sơn Hòa', 'Sông Hinh', 'Tây Hòa', 'Phú Hòa', 'Đông Hòa'],
    'Quảng Bình': ['Đồng Hới', 'Minh Hóa', 'Tuyên Hóa', 'Quảng Trạch', 'Bố Trạch', 'Quảng Ninh', 'Lệ Thủy'],
    'Quảng Nam': ['Tam Kỳ', 'Hội An', 'Thăng Bình', 'Tiên Phước', 'Hiệp Đức', 'Núi Thành', 'Phú Ninh', 'Duy Xuyên', 'Đại Lộc', 'Điện Bàn', 'Quế Sơn', 'Nam Giang', 'Phước Sơn', 'Hiệp Đức', 'Bắc Trà My', 'Nam Trà My', 'Tây Giang', 'Đông Giang'],
    'Quảng Ngãi': ['Quảng Ngãi', 'Bình Sơn', 'Trà Bồng', 'Sơn Tịnh', 'Tư Nghĩa', 'Sơn Hà', 'Sơn Tây', 'Minh Long', 'Nghĩa Hành', 'Mộ Đức', 'Đức Phổ', 'Ba Tơ', 'Lý Sơn'],
    'Quảng Ninh': ['Hạ Long', 'Móng Cái', 'Cẩm Phả', 'Uông Bí', 'Quảng Yên', 'Đông Triều', 'Hoành Bồ', 'Tiên Yên', 'Cô Tô', 'Vân Đồn', 'Ba Chẽ', 'Bình Liêu', 'Đầm Hà', 'Hải Hà'],
    'Quảng Trị': ['Đông Hà', 'Quảng Trị', 'Vĩnh Linh', 'Hướng Hóa', 'Gio Linh', 'Đa Krông', 'Cam Lộ', 'Triệu Phong', 'Hải Lăng', 'Cồn Cỏ'],
    'Sóc Trăng': ['Sóc Trăng', 'Châu Thành', 'Kế Sách', 'Mỹ Tú', 'Cù Lao Dung', 'Long Phú', 'Mỹ Xuyên', 'Ngã Năm', 'Thạnh Trị', 'Vĩnh Châu', 'Trần Đề'],
    'Sơn La': ['Sơn La', 'Quỳnh Nhai', 'Mường La', 'Thuận Châu', 'Mường Sơn', 'Sông Mã', 'Sốp Cộp', 'Yên Châu', 'Mai Sơn', 'Mộc Châu', 'Vân Hồ'],
    'Tây Ninh': ['Tây Ninh', 'Tân Biên', 'Tân Châu', 'Dương Minh Châu', 'Châu Thành', 'Hòa Thành', 'Gò Dầu', 'Bến Cầu', 'Trảng Bàng'],
    'Thái Bình': ['Thái Bình', 'Quỳnh Phụ', 'Hưng Hà', 'Đông Hưng', 'Thái Thụy', 'Tiền Hải', 'Kiến Xương', 'Vũ Thư'],
    'Thái Nguyên': ['Thái Nguyên', 'Sông Công', 'Định Hóa', 'Phú Lương', 'Đồng Hỷ', 'Võ Nhai', 'Đại Từ', 'Phú Bình', 'Phổ Yên'],
    'Thanh Hóa': ['Thanh Hóa', 'Bỉm Sơn', 'Sầm Sơn', 'Mường Lát', 'Quan Hóa', 'Bá Thước', 'Quan Sơn', 'Lang Chánh', 'Ngọc Lặc', 'Cẩm Thủy', 'Thạch Thành', 'Hà Trung', 'Vĩnh Lộc', 'Yên Định', 'Thọ Xuân', 'Thường Xuân', 'Triệu Sơn', 'Thiệu Hóa', 'Hoằng Hóa', 'Hậu Lộc', 'Nga Sơn', 'Như Xuân', 'Như Thanh', 'Nông Cống', 'Đông Sơn', 'Quảng Xương', 'Tĩnh Gia'],
    'Thừa Thiên Huế': ['Huế', 'Phong Điền', 'Quảng Điền', 'Phú Vang', 'Hương Thủy', 'Hương Trà', 'A Lưới', 'Phú Lộc', 'Nam Đông'],
    'Tiền Giang': ['Mỹ Tho', 'Gò Công', 'Cai Lậy', 'Tân Phước', 'Cái Bè', 'Châu Thành', 'Chợ Gạo', 'Gò Công Tây', 'Gò Công Đông', 'Tân Phú Đông'],
    'Trà Vinh': ['Trà Vinh', 'Càng Long', 'Cầu Kè', 'Tiểu Cần', 'Châu Thành', 'Cầu Ngang', 'Trà Cú', 'Duyên Hải'],
    'Tuyên Quang': ['Tuyên Quang', 'Lâm Bình', 'Na Hang', 'Chiêm Hóa', 'Hàm Yên', 'Yên Sơn', 'Sơn Dương'],
    'Vĩnh Long': ['Vĩnh Long', 'Long Hồ', 'Mang Thít', 'Tam Bình', 'Trà Ôn', 'Vũng Liêm', 'Bình Tân'],
    'Vĩnh Phúc': ['Vĩnh Yên', 'Phúc Yên', 'Lập Thạch', 'Sông Lô', 'Bình Xuyên', 'Yên Lạc', 'Vĩnh Tường', 'Tam Dương', 'Tam Đảo'],
    'Yên Bái': ['Yên Bái', 'Nghĩa Lộ', 'Lục Yên', 'Văn Yên', 'Mù Cang Chải', 'Trấn Yên', 'Trạm Tấu', 'Văn Chấn', 'Yên Bình']
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
      onSubmit(formData);
    }
  };

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setFormData(prev => ({
      ...prev,
      city: selectedCity,
      district: '' // Reset district when city changes
    }));
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
              onChange={handleInputChange}
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
        <button type="submit" className="continue-btn">
          Tiếp tục
        </button>
      </form>
    </div>
  );
};

export default DeliveryInformationForm;
