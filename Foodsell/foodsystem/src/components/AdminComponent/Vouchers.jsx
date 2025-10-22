import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    adminAPI.getVouchers().then(setVouchers).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Quản lý Voucher</h2>
      <table className="table table-hover mt-3">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Giảm giá</th>
            <th>Ngày hết hạn</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr key={v.id}>
              <td>{v.code}</td>
              <td>{v.discount}%</td>
              <td>{v.expiryDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
