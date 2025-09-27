import { useState } from "react"
import "./DieuHuong.css"
const DieuHuong= () =>
{
return (
<div className="DieuHuong-menu">
 <a href="/" className="navbar-link">🏠 Trang chủ</a>
 <a href="/products" className="navbar-link">🍕 Sản phẩm</a>
 <a href="/orders" className="navbar-link">📋 Đơn hàng</a>
 <a href="/about" className="navbar-link">ℹ️ Giới thiệu</a>
</div>
)
}
export default DieuHuong