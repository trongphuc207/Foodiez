# Session Summary – 11 Nov 2025

## Chủ đề chính
Thiết kế và triển khai logic phí vận chuyển cho nhiều cửa hàng (multi-shop), hiển thị COD, voucher và tổng tiền khi đơn hàng bị tách thành nhiều đơn.

## Các quyết định quan trọng
1. Base fee 15.000đ chỉ áp dụng cho cửa hàng đầu tiên.
2. Các cửa hàng tiếp theo chỉ tính distanceFee (km * pricePerKm).
3. Đơn giá theo km theo tổng số sản phẩm trong phiên:
   - 1–2 sản phẩm: 1.000đ/km
   - 3–6 sản phẩm: 2.000đ/km
   - >6 sản phẩm: 3.000đ/km
4. Phí ship tổng = (Base + distance shop đầu) + Σ(distanceFee các shop sau).
5. Lưu phiên checkout (lastCheckoutSession) vào localStorage để hiển thị lại COD và phân bổ ship khi xem chi tiết đơn tách.
6. Một đơn được đánh dấu thu COD (collector); các đơn còn lại hiển thị ghi chú: “Phí ship & COD đã gộp ở đơn #X”.

## File đã chỉnh
- `foodsystem/src/config/shippingConfig.js`: thêm hàm `computeMultiShopShipping(distancesKm, totalItems)` trả về breakdown multi-shop.
- `foodsystem/src/Page/OrderPage/OrderDetailPage.jsx`: làm sạch component, thêm đọc `lastCheckoutSession` từ localStorage, hiển thị:
  - Tiền hàng
  - Voucher (mã hoặc "Không có")
  - Phí vận chuyển (có hoặc ghi chú nếu gộp ở đơn khác)
  - Số tiền cần thu (COD) nếu là đơn collector.

## Còn tồn đọng (Backend)
- Thêm phân bổ shipping & COD ở server: mở rộng `Order` / `OrderDTO` với các trường:
  - `shippingAllocated`
  - `isCodCollect`
  - `codCollectAmount`
- Tính toán breakdown tại thời điểm tạo nhiều đơn (hiện tại logic tạo đơn chưa hỗ trợ multi-shop thực sự).
- API trả về `checkout_session` (hoặc group id) thay vì chỉ dựa vào localStorage.

## Gợi ý bước tiếp theo
1. Cập nhật `Order` entity + migration DB.
2. Viết service tạo nhiều `Order` khi giỏ có nhiều shop.
3. Trả về JSON checkoutSession cho frontend thay vì tự dựng.
4. Đồng bộ hiển thị ở trang danh sách đơn (Order List) – đánh dấu đơn collector.

## Mẫu JSON phiên checkout đề xuất
```json
{
  "sessionId": "abc123",
  "grandTotal": 24300,
  "shippingTotal": 24300,
  "pricePerKm": 1000,
  "baseFee": 15000,
  "orders": [
    {"orderId": 42, "shippingAllocated": 18500, "isCodCollect": true},
    {"orderId": 43, "shippingAllocated": 5800, "isCodCollect": false}
  ],
  "codCollectOrderId": 42
}
```

## Cách khôi phục sau khi quay lại
1. Mở file này để nhớ logic.
2. Kiểm tra localStorage có `lastCheckoutSession` hay không.
3. Hoàn thiện backend phân bổ ship & COD.

## Ghi chú
Nếu muốn thêm phụ thu cho shop thứ 3 trở lên: bổ sung extraPickupFee vào hàm computeMultiShopShipping.

Chúc bạn ngủ ngon – quay lại chỉ cần đọc phần “Các quyết định quan trọng” để tiếp tục! 😴