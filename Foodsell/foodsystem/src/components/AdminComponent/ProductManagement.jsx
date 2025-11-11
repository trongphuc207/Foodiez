import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  // Filters
  const [keyword, setKeyword] = useState('');
  const [catText, setCatText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [form, setForm] = useState({
    id: null,
    name: '',
    price: '',
    categoryId: '',
    shopId: '1',
    description: '',
    available: true,
    image: ''
  });
  // Create uses top form; Edit will use modal
  // Image input mode: 'url' | 'file'
  const [imageMode, setImageMode] = useState('url');
  const [imageFile, setImageFile] = useState(null);

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    name: '',
    price: '',
    categoryId: '',
    shopId: '1',
    description: '',
    available: true,
    image: ''
  });
  const [editImageMode, setEditImageMode] = useState('url');
  const [editImageFile, setEditImageFile] = useState(null);

  // Delete modal state
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProducts = async () => {
    const data = await adminAPI.getProducts();
    setProducts(data);
  };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => {
    (async () => {
      const cats = await adminAPI.getCategories();
      setCategories(cats);
    })();
  }, []);

  const resetForm = () => {
    setForm({ id: null, name: '', price: '', categoryId: '', shopId: '1', description: '', available: true, image: '' });
    setImageMode('url');
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create flow only (edit moved to modal)
      if (imageMode === 'file' && imageFile) {
        const { data, id, ID } = await adminAPI.addProduct({ ...form, image: '' });
        const newId = (data && (data.id || data.ID)) || id || ID;
        if (!newId) throw new Error('Không lấy được ID sản phẩm mới tạo để upload ảnh');
        await adminAPI.uploadProductImage(newId, imageFile);
      } else {
        await adminAPI.addProduct(form);
      }
      await loadProducts();
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (p) => {
    setEditForm({
      id: p.id ?? null,
      name: p.name ?? '',
      price: p.price ?? '',
      categoryId: p.categoryId ?? p.category_id ?? '',
      shopId: p.shopId ?? p.shop_id ?? '1',
      description: p.description ?? '',
      available: p.available ?? true,
      image: p.image ?? p.imageUrl ?? p.image_url ?? ''
    });
    setEditImageMode('url');
    setEditImageFile(null);
    setShowEdit(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editForm };
      if (editImageMode === 'file') delete payload.image;
      await adminAPI.updateProduct(editForm.id, payload);
      if (editImageMode === 'file' && editImageFile) {
        await adminAPI.uploadProductImage(editForm.id, editImageFile);
      }
      await loadProducts();
      setShowEdit(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const openDelete = (p) => { setDeleteTarget(p); setShowDelete(true); };
  const confirmDelete = async () => {
    if (!deleteTarget) return setShowDelete(false);
    try {
      await adminAPI.deleteProduct(deleteTarget.id, deleteTarget);
      await loadProducts();
    } finally {
      setShowDelete(false);
      setDeleteTarget(null);
    }
  };

  // Toggle availability (có sẵn)
  const toggleAvailability = async (product) => {
    try {
      // adminAPI.updateProduct expects a full product payload in many backends
      // so preserve existing fields to avoid sending empty/default values
      const payload = {
        name: product.name,
        description: product.description ?? '',
        price: product.price ?? 0,
        categoryId: product.categoryId ?? product.category_id ?? 0,
        shopId: product.shopId ?? product.shop_id ?? 1,
        available: !product.available,
        status: product.status ?? 'active',
        image: product.image || product.imageUrl || product.image_url || ''
      };
      await adminAPI.updateProduct(product.id, payload);
      await loadProducts();
    } catch (err) {
      // Show more helpful error if available
      alert(err?.message || 'Lỗi khi thay đổi tình trạng sản phẩm');
    }
  };

  const filteredProducts = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const c = catText.trim().toLowerCase();
    const min = minPrice !== '' ? Number(minPrice) : null;
    const max = maxPrice !== '' ? Number(maxPrice) : null;
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const price = Number(p.price || 0);
      const matchK = !k || name.includes(k) || `${p.id}`.includes(k);
      const matchC = !c || cat.includes(c);
      const matchMin = min === null || price >= min;
      const matchMax = max === null || price <= max;
      return matchK && matchC && matchMin && matchMax;
    });
  }, [products, keyword, catText, minPrice, maxPrice]);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-title">📦 Quản lý sản phẩm</h2>
      </div>

      <div className="admin-card">
        <h3 className="card-title">🔍 Tìm kiếm và lọc</h3>
      {/* Top search bar */}
      <div className="mb-2">
        <input
          className="form-control"
          placeholder="Tìm kiếm nhanh theo ID, tên, danh mục"
          value={keyword}
          onChange={(e)=>setKeyword(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input className="form-control" placeholder="Từ khóa (ID, tên)" value={keyword} onChange={(e)=>setKeyword(e.target.value)} />
        </div>
        <div className="col-md-3">
          {/* Ô lọc danh mục: đổi thành dropdown chọn danh mục */}
          <select
            className="form-select"
            value={catText}
            onChange={(e)=>setCatText(e.target.value)}
          >
            <option value="">-- Tất cả danh mục --</option>
            {Array.isArray(categories) && categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <input type="number" min="0" className="form-control" placeholder="Giá từ" value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} />
        </div>
        <div className="col-md-2">
          <input type="number" min="0" className="form-control" placeholder="Giá đến" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-outline-secondary" onClick={()=>{ setKeyword(''); setCatText(''); setMinPrice(''); setMaxPrice(''); }}>Xóa lọc</button>
        </div>
      </div>

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
            {categories && categories.length > 0 ? (
              <select
                className="form-select"
                value={String(form.categoryId || '')}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                placeholder="Category ID"
                className="form-control"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              />
            )}
          </div>
          <div className="col-md-2">
            <input
              type="number"
              placeholder="Shop ID"
              className="form-control"
              value={form.shopId}
              onChange={(e) => setForm({ ...form, shopId: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            {/* Image mode selector */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" id="imgModeUrl" name="imgMode" value="url" checked={imageMode==='url'} onChange={()=>setImageMode('url')} />
                <label className="form-check-label" htmlFor="imgModeUrl">URL ảnh</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" id="imgModeFile" name="imgMode" value="file" checked={imageMode==='file'} onChange={()=>setImageMode('file')} />
                <label className="form-check-label" htmlFor="imgModeFile">Tải ảnh (JPG)</label>
              </div>
            </div>
            {imageMode === 'url' ? (
              <input
                type="text"
                placeholder="URL ảnh"
                className="form-control"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            ) : (
              <input
                type="file"
                accept="image/jpeg,image/jpg"
                className="form-control"
                onChange={(e)=> setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              />
            )}
          </div>
        </div>
        <div className="row g-2 mt-2">
          <div className="col-md-8">
            <input
              type="text"
              placeholder="Mô tả"
              className="form-control"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="availableCheck"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="availableCheck">
                Có sẵn (available)
              </label>
            </div>
          </div>
        </div>
        <div className="text-center mt-3">
          <button type="submit" className="btn btn-success px-4">➕ Thêm sản phẩm</button>
          <button type="button" className="btn btn-secondary ms-2 px-4" onClick={resetForm}>🔄 Làm mới</button>
        </div>
      </form>
      </div>

      <div className="admin-card">
        <h3 className="card-title">📋 Danh sách sản phẩm</h3>
        <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Shop</th>
            <th>Giá (VNĐ)</th>
            <th>Tình trạng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr><td colSpan="8" className="text-center">Không có sản phẩm nào</td></tr>
          ) : (
            filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><img src={p.image || 'https://via.placeholder.com/60'} alt={p.name} style={{ width: 60, height: 60, objectFit: 'cover' }} /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.shopId ?? p.shop_id ?? '-'}</td>
                <td>{p.price.toLocaleString()}</td>
                <td>
                  {p.available ? (
                    <span className="badge bg-success">Có</span>
                  ) : (
                    <span className="badge bg-secondary">Hết</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-info btn-sm me-2" onClick={() => toggleAvailability(p)}>{p.available ? 'Đổi sang hết' : 'Đổi sang có'}</button>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => openEdit(p)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => openDelete(p)}>Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal-backdrop" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1050}}>
          <div className="card" style={{width:'min(900px, 95vw)'}}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Sửa sản phẩm #{editForm.id}</strong>
              <button className="btn btn-sm btn-light" onClick={()=>setShowEdit(false)}>×</button>
            </div>
            <form onSubmit={submitEdit}>
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label">Tên sản phẩm</label>
                    <input className="form-control" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name:e.target.value})} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Giá</label>
                    <input type="number" className="form-control" value={editForm.price} onChange={(e)=>setEditForm({...editForm, price:e.target.value})} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Danh mục</label>
                    {categories && categories.length > 0 ? (
                      <select className="form-select" value={String(editForm.categoryId || '')} onChange={(e)=>setEditForm({...editForm, categoryId:e.target.value})} required>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    ) : (
                      <input type="number" className="form-control" value={editForm.categoryId} onChange={(e)=>setEditForm({...editForm, categoryId:e.target.value})} required />
                    )}
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Shop ID</label>
                    <input type="number" className="form-control" value={editForm.shopId} onChange={(e)=>setEditForm({...editForm, shopId:e.target.value})} required />
                  </div>
                </div>
                <div className="row g-2 mt-2">
                  <div className="col-md-8">
                    <label className="form-label">Mô tả</label>
                    <input className="form-control" value={editForm.description} onChange={(e)=>setEditForm({...editForm, description:e.target.value})} />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="editAvailable" checked={editForm.available} onChange={(e)=>setEditForm({...editForm, available:e.target.checked})} />
                      <label className="form-check-label" htmlFor="editAvailable">Có sẵn (available)</label>
                    </div>
                  </div>
                </div>
                <div className="row g-2 mt-2">
                  <div className="col-md-6">
                    <label className="form-label">Ảnh hiện tại</label>
                    <div>
                      <img src={editForm.image || 'https://via.placeholder.com/120'} alt="preview" style={{width:120, height:120, objectFit:'cover', borderRadius:6}} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Cập nhật ảnh</label>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" id="editImgModeUrl" name="editImgMode" value="url" checked={editImageMode==='url'} onChange={()=>setEditImageMode('url')} />
                        <label className="form-check-label" htmlFor="editImgModeUrl">URL ảnh</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" id="editImgModeFile" name="editImgMode" value="file" checked={editImageMode==='file'} onChange={()=>setEditImageMode('file')} />
                        <label className="form-check-label" htmlFor="editImgModeFile">Tải ảnh (JPG)</label>
                      </div>
                    </div>
                    {editImageMode === 'url' ? (
                      <input className="form-control" placeholder="URL ảnh mới" value={editForm.image} onChange={(e)=>setEditForm({...editForm, image:e.target.value})} />
                    ) : (
                      <input type="file" accept="image/jpeg,image/jpg" className="form-control" onChange={(e)=> setEditImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                    )}
                  </div>
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={()=>setShowEdit(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="modal-backdrop" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1050}}>
          <div className="card" style={{width:'min(520px, 95vw)'}}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Xóa sản phẩm</strong>
              <button className="btn btn-sm btn-light" onClick={()=>setShowDelete(false)}>×</button>
            </div>
            <div className="card-body">
              <p>Bạn có chắc muốn xóa sản phẩm sau?</p>
              {deleteTarget && (
                <div className="d-flex align-items-center gap-3">
                  <img src={deleteTarget.image || 'https://via.placeholder.com/60'} alt="thumb" style={{width:60, height:60, objectFit:'cover', borderRadius:6}} />
                  <div>
                    <div><strong>#{deleteTarget.id}</strong> - {deleteTarget.name}</div>
                    <div>Danh mục: {deleteTarget.category}</div>
                    <div>Giá: {Number(deleteTarget.price||0).toLocaleString()} VNĐ</div>
                  </div>
                </div>
              )}
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              <button className="btn btn-light" onClick={()=>setShowDelete(false)}>Hủy</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
