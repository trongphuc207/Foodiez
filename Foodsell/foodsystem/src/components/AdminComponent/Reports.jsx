import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await adminAPI.getReports();
        // data có thể là Array (danh sách theo tháng) hoặc Object (map các chỉ số)
        // → Chuẩn hoá thành 1 trong 2 UI:
        if (Array.isArray(data)) {
          setReports({ type: 'array', items: data });
        } else if (data && typeof data === 'object') {
          // Ví dụ backend (theo file bạn gửi) trả:
          // { monthlyRevenue: number, totalOrders: number, totalUsers: number, ... }
          const kv = Object.entries(data).map(([key, value]) => ({ key, value }));
          setReports({ type: 'object', items: kv, raw: data });
        } else {
          setReports({ type: 'empty', items: [] });
        }
      } catch (e) {
        console.error(e);
        setErr(e.message || 'Lỗi tải báo cáo');
      }
    })();
  }, []);

  if (err) return <div style={{ color: '#b00020' }}>{err}</div>;
  if (!reports) return <p>Đang tải dữ liệu...</p>;

  // ====== UI khi BE trả danh sách theo tháng ======
  if (reports.type === 'array') {
    const items = reports.items || [];
    if (items.length === 0) return <p>Chưa có dữ liệu báo cáo.</p>;
    // Kỳ vọng mỗi phần tử có { month, revenue, orders } (hoặc tương tự)
    return (
      <div>
        <h2>Báo cáo theo tháng</h2>
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Tháng</th>
              <th>Doanh thu</th>
              <th>Đơn hàng</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={i}>
                <td>{r.month ?? r.thang ?? r.label ?? `#${i + 1}`}</td>
                <td>{r.revenue ?? r.doanhThu ?? r.money ?? 0}</td>
                <td>{r.orders ?? r.soDon ?? r.count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ====== UI khi BE trả object map (monthlyRevenue, totalOrders, totalUsers, ...) ======
  if (reports.type === 'object') {
    const d = reports.raw || {};
    return (
      <div>
        <h2>Tổng hợp chỉ số</h2>

        <div className="stat-grid" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <div className="stat-icon">💵</div>
            <div className="stat-info">
              <h5>Doanh thu tháng</h5>
              <h3>{d.monthlyRevenue ?? 0}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧾</div>
            <div className="stat-info">
              <h5>Tổng đơn</h5>
              <h3>{d.totalOrders ?? 0}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <h5>Tổng người dùng</h5>
              <h3>{d.totalUsers ?? 0}</h3>
            </div>
          </div>
        </div>

        <h4 className="mt-4">Chi tiết (key–value)</h4>
        <table className="table table-striped mt-2">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
            </tr>
          </thead>
          <tbody>
            {reports.items.map((item, i) => (
              <tr key={i}>
                <td>{item.key}</td>
                <td>{String(item.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ====== fallback ======
  return <p>Chưa có dữ liệu báo cáo.</p>;
}
