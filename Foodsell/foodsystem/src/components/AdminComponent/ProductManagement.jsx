import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', price: '', category: '', stock: '', image: '' });
  const [isEdit, setIsEdit] = useState(false);

  const loadProducts = async () => {
    const data = await adminAPI.getProducts();
    setProducts(data);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await adminAPI.updateProduct(form.id, form);
      } else {
        await adminAPI.addProduct(form);
      }
      await loadProducts();
      setForm({ id: null, name: '', price: '', category: '', stock: '', image: '' });
      setIsEdit(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (p) => {
    setForm(p);
    setIsEdit(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này không?')) return;
    await adminAPI.deleteProduct(id);
    await loadProducts();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3 text-center">📦 Quản lý sản phẩm</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <input
              type="text"
              placeholder="Tên sản phẩm"
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              placeholder="Giá"
              className="form-control"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="text"
              placeholder="Danh mục"
              className="form-control"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              placeholder="Tồn kho"
              className="form-control"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              placeholder="URL ảnh"
              className="form-control"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </div>
        </div>
        <div className="text-center mt-3">
          <button type="submit" className="btn btn-success px-4">
            {isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}
          </button>
          {isEdit && (
            <button
              type="button"
              className="btn btn-secondary ms-2 px-4"
              onClick={() => {
                setForm({ id: null, name: '', price: '', category: '', stock: '', image: '' });
                setIsEdit(false);
              }}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Giá (VNĐ)</th>
            <th>Tồn kho</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan="7" className="text-center">Không có sản phẩm nào</td></tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><img src={p.image} alt={p.name} style={{ width: 60, height: 60, objectFit: 'cover' }} /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price.toLocaleString()}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(p)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
