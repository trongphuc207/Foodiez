import React, { useEffect, useMemo, useRef, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { useNavigate } from 'react-router-dom';
import './admin.css';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  // Revenue explorer states
  const [mode, setMode] = useState('total'); // 'total' | 'day' | 'month'
  const todayISO = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7); // yyyy-MM
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedMonth, setSelectedMonth] = useState(thisMonth);
  const [showDetails, setShowDetails] = useState(false);
  const detailsRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [rep, ord] = await Promise.all([
          adminAPI.getReports().catch(() => null),
          adminAPI.getOrders().catch(() => []),
        ]);
        if (rep) {
          if (Array.isArray(rep)) {
            setReports({ type: 'array', items: rep });
          } else if (rep && typeof rep === 'object') {
            const kv = Object.entries(rep).map(([key, value]) => ({ key, value }));
            setReports({ type: 'object', items: kv, raw: rep });
          } else {
            setReports({ type: 'empty', items: [] });
          }
        } else {
          setReports({ type: 'empty', items: [] });
        }
        setOrders(Array.isArray(ord) ? ord : []);
      } catch (e) {
        console.error(e);
        setErr(e.message || 'Lỗi tải báo cáo');
      }
    })();
  }, []);

  const revenueStatuses = useMemo(() => new Set(['confirmed', 'paid', 'completed']), []);

  const ordersForSelection = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.filter(o => {
      const st = String(o.status || '').toLowerCase();
      if (!revenueStatuses.has(st)) return false;
      const dt = o.createdAt ? new Date(o.createdAt) : null;
      if (!dt) return false;
      if (mode === 'day') {
        const d = dt.toISOString().slice(0,10);
        return d === selectedDate;
      }
      if (mode === 'month') {
        const m = dt.toISOString().slice(0,7);
        return m === selectedMonth;
      }
      return true; // total
    });
  }, [orders, mode, selectedDate, selectedMonth, revenueStatuses]);

  const revenueValue = useMemo(() => {
    return ordersForSelection.reduce((sum, o) => sum + Number(o.total ?? o.totalAmount ?? 0), 0);
  }, [ordersForSelection]);

  // Smooth-scroll to details when it opens
  useEffect(() => {
    if (showDetails && detailsRef.current) {
      try { detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
    }
  }, [showDetails]);

  if (err) return <div className="alert alert-danger mt-3">{err}</div>;
  if (!reports) return <div className="text-center mt-3">Đang tải dữ liệu...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-title">📊 Báo cáo</h2>
      </div>

      {/* Revenue explorer */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <strong>Doanh thu</strong>
            <select className="form-select form-select-sm" style={{width:150}} value={mode} onChange={e=>setMode(e.target.value)}>
              <option value="total">Tổng</option>
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
            </select>
            {mode === 'day' && (
              <input type="date" className="form-control form-control-sm" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} />
            )}
            {mode === 'month' && (
              <input type="month" className="form-control form-control-sm" value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} />
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="m-0 text-danger">{revenueValue.toLocaleString('vi-VN')} ₫</h3>
            <button className="btn btn-sm btn-primary" onClick={()=>setShowDetails(v=>!v)}>{showDetails ? 'Ẩn chi tiết' : '🔍 Chi tiết'}</button>
          </div>
        </div>
      </div>

      {/* Inline details section (no popup) */}
      {showDetails && (
        <div ref={detailsRef} className="report-card" style={{ marginBottom: 16 }}>
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Chi tiết doanh thu ({mode === 'total' ? 'Tổng' : mode === 'day' ? selectedDate : selectedMonth})</h5>
            <div>
              <span className="me-2"><strong>Tổng:</strong> {revenueValue.toLocaleString('vi-VN')} ₫</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>setShowDetails(false)}>Đóng</button>
            </div>
          </div>
          <div className="table-responsive mt-2">
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người đặt</th>
                  <th>Tổng tiền</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {ordersForSelection.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customerName}</td>
                    <td>{(Number(o.total ?? o.totalAmount ?? 0)).toLocaleString('vi-VN')} ₫</td>
                    <td>{o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : ''}</td>
                    <td>{o.status}</td>
                  </tr>
                ))}
                {ordersForSelection.length === 0 && (
                  <tr><td colSpan="5" className="text-center">Không có đơn nào phù hợp</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Existing reports visualizations below */}
      {reports.type === 'array' && (
        (() => {
          const items = reports.items || [];
          if (items.length === 0) return <p>Chưa có dữ liệu báo cáo.</p>;
          const max = Math.max(1, ...items.map(x => Number(x.revenue ?? x.doanhThu ?? x.money ?? 0)));
          return (
            <div>
              <h3 className="mb-3">Báo cáo theo tháng</h3>
              <div className="report-grid">
                <div className="report-card">
                  <h5 className="mb-3">Biểu đồ cột đơn giản</h5>
                  <div style={{display:'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 8, alignItems: 'end', height: 160}}>
                    {items.map((r, i) => {
                      const revenue = Number(r.revenue ?? r.doanhThu ?? r.money ?? 0);
                      const h = max>0 ? Math.max(6, Math.round((revenue/max)*140)) : 6;
                      return (
                        <div key={i} title={`Tháng ${r.month ?? r.thang ?? r.label ?? i+1}: ${revenue.toLocaleString('vi-VN')} ₫`} style={{background:'#dc3545', height: h, borderRadius:4}} />
                      );
                    })}
                  </div>
                  <div className="d-flex justify-content-between mt-2 small text-muted">
                    {items.map((r,i)=>(<span key={i}>{r.month ?? r.thang ?? r.label ?? i+1}</span>))}
                  </div>
                </div>
                <div className="report-card">
                  <h5 className="mb-3">Bảng chi tiết</h5>
                  <table className="table table-sm table-striped">
                    <thead>
                      <tr><th>Tháng</th><th>Doanh thu</th><th>Đơn hàng</th></tr>
                    </thead>
                    <tbody>
                      {items.map((r, i) => (
                        <tr key={i}>
                          <td>{r.month ?? r.thang ?? r.label ?? `#${i + 1}`}</td>
                          <td>{(Number(r.revenue ?? r.doanhThu ?? r.money ?? 0)).toLocaleString('vi-VN')} ₫</td>
                          <td>{Number(r.orders ?? r.soDon ?? r.count ?? 0).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {reports.type === 'object' && (
        (() => {
          const d = reports.raw || {};
          return (
            <div>
              <h3 className="mb-3">Tổng hợp chỉ số</h3>
              <div className="stat-grid" style={{ marginTop: 12 }}>
                <div className="stat-card"><div className="icon">💵</div><div><h6>Doanh thu tháng</h6><h3>{(Number(d.monthlyRevenue ?? d.totalRevenue ?? 0)).toLocaleString('vi-VN')} ₫</h3></div></div>
                <div className="stat-card" role="button" onClick={()=>navigate('/admin/orders')} style={{cursor:'pointer'}}>
                  <div className="icon">🧾</div>
                  <div><h6>Tổng đơn</h6><h3>{Number(d.totalOrders ?? 0).toLocaleString('vi-VN')}</h3></div>
                </div>
                <div className="stat-card"><div className="icon">👤</div><div><h6>Tổng người dùng</h6><h3>{Number(d.totalUsers ?? 0).toLocaleString('vi-VN')}</h3></div></div>
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
                      <td>{typeof item.value === 'number' ? item.value.toLocaleString('vi-VN') : String(item.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()
      )}

      {reports.type === 'empty' && (
        <p>Chưa có dữ liệu báo cáo.</p>
      )}

      {/* Old modal removed; details now inline */}
    </div>
  );
}
