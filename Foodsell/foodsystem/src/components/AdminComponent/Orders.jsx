import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    adminAPI.getOrders().then(setOrders).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Quản lý đơn hàng</h2>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Người đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customerName}</td>
              <td>{o.total} đ</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
