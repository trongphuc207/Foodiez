# 📋 DANH SÁCH CÁC TÍNH NĂNG TRONG DỰ ÁN FOODSELL

## 🎯 TỔNG QUAN DỰ ÁN
**Foodsell** là một ứng dụng giao đồ ăn (Food Delivery App) với đầy đủ các tính năng cho 4 nhóm người dùng chính:
- 👤 **Customer** (Khách hàng)
- 🏪 **Seller** (Người bán/Merchant)
- 🚚 **Shipper** (Người giao hàng)
- 👨‍💼 **Admin** (Quản trị viên)

---

## 👤 TÍNH NĂNG CHO KHÁCH HÀNG (CUSTOMER)

### 🔐 Xác thực & Tài khoản
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập/Đăng xuất
- ✅ Đăng nhập bằng Google (Google OAuth)
- ✅ Quên mật khẩu / Reset mật khẩu
- ✅ Xem và chỉnh sửa thông tin cá nhân
- ✅ Upload ảnh đại diện (Avatar)
- ✅ Quản lý địa chỉ giao hàng

### 🛍️ Mua sắm & Sản phẩm
- ✅ Xem danh sách sản phẩm
- ✅ Tìm kiếm sản phẩm (Tìm kiếm cơ bản & nâng cao)
- ✅ Lọc sản phẩm theo danh mục (Category)
- ✅ Xem chi tiết sản phẩm
- ✅ Xem danh sách cửa hàng (Shop List)
- ✅ Xem chi tiết cửa hàng (Shop Detail)
- ✅ Xem sản phẩm theo cửa hàng

### 🛒 Giỏ hàng & Thanh toán
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Xem giỏ hàng
- ✅ Cập nhật số lượng sản phẩm trong giỏ
- ✅ Xóa sản phẩm khỏi giỏ hàng
- ✅ Khôi phục giỏ hàng đã lưu
- ✅ Thanh toán đơn hàng
- ✅ Chọn phương thức thanh toán
- ✅ Áp dụng mã giảm giá (Voucher)
- ✅ Xem trang xác nhận thanh toán thành công
- ✅ Xem trang hủy thanh toán

### 📦 Đơn hàng
- ✅ Xem danh sách đơn hàng của mình
- ✅ Xem chi tiết đơn hàng
- ✅ Theo dõi trạng thái đơn hàng
- ✅ Hủy đơn hàng (nếu được phép)

### ⭐ Đánh giá & Review
- ✅ Viết review cho sản phẩm sau khi mua
- ✅ Đánh giá sao (1-5 sao) cho sản phẩm
- ✅ Chỉnh sửa review của mình
- ✅ Xóa review của mình
- ✅ Xem tất cả review của sản phẩm/cửa hàng

### 💬 Chat & Hỗ trợ
- ✅ Chat với cửa hàng
- ✅ Chat với shipper
- ✅ Chatbot hỗ trợ bằng Gemini AI
  - Tìm kiếm sản phẩm qua chatbot
  - Tư vấn về cửa hàng
  - Trả lời câu hỏi về mua bán
  - Thêm sản phẩm vào giỏ hàng từ chatbot

### 🔔 Thông báo
- ✅ Xem thông báo
- ✅ Nhận thông báo về đơn hàng
- ✅ Nhận thông báo về khuyến mãi

### ❤️ Yêu thích
- ✅ Thêm sản phẩm vào danh sách yêu thích
- ✅ Xem danh sách sản phẩm yêu thích
- ✅ Xóa sản phẩm khỏi danh sách yêu thích

### 🎟️ Voucher
- ✅ Xem danh sách voucher có sẵn
- ✅ Áp dụng voucher khi thanh toán

---

## 🏪 TÍNH NĂNG CHO NGƯỜI BÁN (SELLER)

### 📊 Dashboard & Thống kê
- ✅ Dashboard tổng quan
- ✅ Thống kê doanh thu (tổng, hôm nay, theo ngày, theo tháng)
- ✅ Thống kê đơn hàng (tổng, hôm nay, theo trạng thái)
- ✅ Thống kê sản phẩm (tổng, đang bán, tạm ngừng, hết nguyên liệu)
- ✅ Thống kê khách hàng
- ✅ Top sản phẩm bán chạy
- ✅ Top khách hàng

### 📦 Quản lý đơn hàng
- ✅ Xem danh sách đơn hàng
- ✅ Lọc đơn hàng theo trạng thái
- ✅ Xem chi tiết đơn hàng
- ✅ Xác nhận đơn hàng
- ✅ Cập nhật trạng thái đơn hàng:
  - Pending → Confirmed
  - Confirmed → Preparing (đang nấu)
  - Preparing → Shipping (sẵn sàng giao)
- ✅ Tạo đơn vận chuyển (Shipping Order)
- ✅ Gán shipper cho đơn hàng
- ✅ Xem lịch sử đơn hàng

### 🍽️ Quản lý sản phẩm
- ✅ Xem danh sách sản phẩm của cửa hàng
- ✅ Thêm sản phẩm mới
- ✅ Chỉnh sửa thông tin sản phẩm
- ✅ Xóa sản phẩm
- ✅ Upload ảnh sản phẩm
- ✅ Quản lý trạng thái sản phẩm:
  - Active (đang bán)
  - Inactive (tạm ngừng)
  - Out of stock (hết nguyên liệu)
- ✅ Bật/tắt sản phẩm (is_available)

### 🏬 Quản lý cửa hàng
- ✅ Đăng ký cửa hàng mới
- ✅ Xem thông tin cửa hàng
- ✅ Chỉnh sửa thông tin cửa hàng
- ✅ Upload ảnh cửa hàng
- ✅ Quản lý danh mục sản phẩm

### 💰 Quản lý doanh thu
- ✅ Xem doanh thu tổng quan
- ✅ Xem doanh thu theo ngày
- ✅ Xem doanh thu theo tháng
- ✅ Xem doanh thu theo năm
- ✅ Biểu đồ doanh thu

### 👥 Quản lý khách hàng
- ✅ Xem danh sách khách hàng
- ✅ Xem thông tin chi tiết khách hàng
- ✅ Xem top khách hàng
- ✅ Xem lịch sử mua hàng của khách

### ⭐ Quản lý Review
- ✅ Xem tất cả review của cửa hàng/sản phẩm
- ✅ Trả lời review của khách hàng
- ✅ Chỉnh sửa reply
- ✅ Xóa reply

### ⚙️ Cài đặt
- ✅ Cài đặt thông tin cửa hàng
- ✅ Cài đặt giờ mở cửa/đóng cửa
- ✅ Cài đặt thông báo

---

## 🚚 TÍNH NĂNG CHO SHIPPER (NGƯỜI GIAO HÀNG)

### 📊 Dashboard & Thống kê
- ✅ Dashboard tổng quan
- ✅ Thống kê đơn hàng đã giao
- ✅ Thống kê thu nhập
- ✅ Thống kê đánh giá
- ✅ Xem tổng quan hoạt động

### 📦 Quản lý đơn hàng
- ✅ Xem danh sách đơn hàng có sẵn để nhận
- ✅ Nhận đơn hàng để giao (Accept Order)
- ✅ Xem danh sách đơn hàng đang giao
- ✅ Xem chi tiết đơn hàng
- ✅ Cập nhật trạng thái giao hàng:
  - Picked up (đã lấy hàng)
  - On the way (đang giao)
  - Delivered (đã giao)
- ✅ Xem lịch sử giao hàng

### 🗺️ Quản lý tuyến đường
- ✅ Xem tuyến đường giao hàng
- ✅ Xem bản đồ giao hàng
- ✅ Tối ưu hóa tuyến đường

### 💰 Quản lý thu nhập
- ✅ Xem thống kê thu nhập
- ✅ Xem thu nhập theo ngày/tuần/tháng
- ✅ Xem lịch sử thanh toán

### 👤 Quản lý Profile
- ✅ Tạo profile shipper
- ✅ Xem thông tin profile
- ✅ Cập nhật thông tin
- ✅ Cập nhật trạng thái sẵn sàng (Available/Unavailable)

---

## 👨‍💼 TÍNH NĂNG CHO ADMIN

### 📊 Dashboard & Thống kê
- ✅ Dashboard tổng quan
- ✅ Thống kê tổng số người dùng
- ✅ Thống kê tổng số đơn hàng
- ✅ Thống kê tổng số sản phẩm
- ✅ Thống kê tổng số voucher
- ✅ Thống kê doanh thu tổng
- ✅ Thống kê sản phẩm đang hoạt động

### 👥 Quản lý người dùng
- ✅ Xem danh sách tất cả người dùng
- ✅ Xem thông tin chi tiết người dùng
- ✅ Khóa/Mở khóa tài khoản
- ✅ Phân quyền người dùng
- ✅ Quản lý role (Customer, Seller, Shipper, Admin)

### 📦 Quản lý đơn hàng
- ✅ Xem tất cả đơn hàng trong hệ thống
- ✅ Xem chi tiết đơn hàng
- ✅ Phân phối đơn hàng cho seller
- ✅ Phân phối đơn hàng cho shipper
- ✅ Xem lịch sử đơn hàng
- ✅ Xử lý khiếu nại đơn hàng

### 🍽️ Quản lý sản phẩm
- ✅ Xem tất cả sản phẩm trong hệ thống
- ✅ Xem chi tiết sản phẩm
- ✅ Duyệt/Xóa sản phẩm không phù hợp
- ✅ Quản lý danh mục sản phẩm

### 🏬 Quản lý cửa hàng
- ✅ Xem danh sách tất cả cửa hàng
- ✅ Duyệt đăng ký cửa hàng mới
- ✅ Khóa/Mở khóa cửa hàng
- ✅ Xem thống kê cửa hàng

### 🎟️ Quản lý Voucher
- ✅ Xem danh sách tất cả voucher
- ✅ Tạo voucher mới
- ✅ Chỉnh sửa voucher
- ✅ Xóa voucher
- ✅ Quản lý voucher theo cửa hàng

### ⭐ Quản lý Review
- ✅ Xem tất cả review trong hệ thống
- ✅ Xóa review không phù hợp
- ✅ Quản lý reply của merchant
- ✅ Xử lý khiếu nại về review

### 📈 Báo cáo & Phân tích
- ✅ Xem báo cáo tổng quan
- ✅ Báo cáo doanh thu
- ✅ Báo cáo đơn hàng
- ✅ Báo cáo người dùng
- ✅ Xuất báo cáo

### 🚚 Quản lý Shipper
- ✅ Xem danh sách shipper
- ✅ Duyệt đăng ký shipper
- ✅ Xem thống kê shipper
- ✅ Quản lý shipper có sẵn

---

## 🌐 TÍNH NĂNG CHUNG

### 🎨 Giao diện người dùng
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Header với navigation
- ✅ Footer
- ✅ Banner quảng cáo
- ✅ Sidebar navigation
- ✅ Loading states
- ✅ Error handling
- ✅ Not found page (404)
- ✅ Unauthorized page

### 🔍 Tìm kiếm & Lọc
- ✅ Tìm kiếm sản phẩm cơ bản
- ✅ Tìm kiếm nâng cao (Advanced Search)
- ✅ Tìm kiếm trên mobile
- ✅ Lọc theo danh mục
- ✅ Lọc theo giá
- ✅ Lọc theo cửa hàng

### 🔐 Bảo mật & Phân quyền
- ✅ Route Guard (bảo vệ route)
- ✅ Role-based access control
- ✅ JWT Authentication
- ✅ Authorization middleware

### 📱 Tích hợp AI
- ✅ Gemini Chatbot
  - Tìm kiếm sản phẩm thông minh
  - Tư vấn mua hàng
  - Trả lời câu hỏi
  - Thêm sản phẩm vào giỏ từ chatbot

### 💬 Hệ thống Chat
- ✅ Chat real-time với cửa hàng
- ✅ Chat với shipper
- ✅ Chat sidebar
- ✅ Chat window
- ✅ Lịch sử chat

### 🔔 Hệ thống thông báo
- ✅ Notification bell
- ✅ Real-time notifications
- ✅ Thông báo đơn hàng
- ✅ Thông báo khuyến mãi

### 🗄️ Quản lý dữ liệu
- ✅ Context API (Cart Context)
- ✅ React Query (Data fetching)
- ✅ Local Storage (Lưu giỏ hàng, auth token)

### 📄 Trang thông tin
- ✅ Trang thông tin (Information Page)
- ✅ Trang chủ (Home Page)
- ✅ Trang sản phẩm (Product Page)
- ✅ Trang checkout
- ✅ Trang thanh toán thành công/hủy

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Frontend
- React.js
- React Router
- Bootstrap
- CSS3
- Context API
- React Query
- Google OAuth

### Backend
- Spring Boot (Java)
- SQL Server
- JWT Authentication
- RESTful API

### AI Integration
- Google Gemini AI

---

## 📝 GHI CHÚ

- Dự án sử dụng mô hình **Food Delivery** (không phải E-commerce với tồn kho)
- Sản phẩm sử dụng `is_available` và `status` thay vì `stock_quantity`
- Hệ thống hỗ trợ đa ngôn ngữ (tiếng Việt)
- Tất cả các tính năng đã được implement đầy đủ

---

**Cập nhật lần cuối:** 2024

