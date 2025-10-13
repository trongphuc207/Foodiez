import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryAPI from '../../api/category';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesResponse, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryAPI.getAllCategories,
    refetchOnWindowFocus: false
  });

  // Search categories
  const { data: searchResponse, isLoading: isSearching } = useQuery({
    queryKey: ['categories', 'search', searchKeyword],
    queryFn: () => categoryAPI.searchCategories(searchKeyword),
    enabled: searchKeyword.length > 0
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: categoryAPI.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
    }
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryAPI.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: categoryAPI.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    }
  });

  // Seed data mutation
  const seedMutation = useMutation({
    mutationFn: categoryAPI.seedData,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    }
  });

  const categories = searchKeyword.length > 0 
    ? (searchResponse?.data || [])
    : (categoriesResponse?.data || []);

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        name: category.name,
        description: category.description
      });
    } else {
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa category này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSeedData = () => {
    if (window.confirm('Bạn có chắc chắn muốn tạo dữ liệu mẫu? Điều này sẽ thêm các categories mẫu vào hệ thống.')) {
      seedMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="category-management">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-management">
        <div className="error">
          <p>Lỗi khi tải categories: {error.message}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-management">
      <div className="category-header">
        <h2>Quản lý Categories</h2>
        <div className="category-actions">
          <button 
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
          >
            ➕ Thêm Category
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleSeedData}
            disabled={seedMutation.isPending}
          >
            🌱 Tạo dữ liệu mẫu
          </button>
        </div>
      </div>

      <div className="category-search">
        <input
          type="text"
          placeholder="Tìm kiếm categories..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="search-input"
        />
        {searchKeyword && (
          <button 
            className="clear-search"
            onClick={() => setSearchKeyword('')}
          >
            ✕
          </button>
        )}
      </div>

      <div className="category-stats">
        <div className="stat-item">
          <span className="stat-label">Tổng số:</span>
          <span className="stat-value">{categories.length}</span>
        </div>
        {searchKeyword && (
          <div className="stat-item">
            <span className="stat-label">Kết quả tìm kiếm:</span>
            <span className="stat-value">{categories.length}</span>
          </div>
        )}
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-info">
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
              <div className="category-meta">
                <span className="category-id">ID: {category.id}</span>
                <span className="category-date">
                  {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
            <div className="category-actions">
              <button 
                className="btn btn-edit"
                onClick={() => handleOpenModal(category)}
              >
                ✏️ Sửa
              </button>
              <button 
                className="btn btn-delete"
                onClick={() => handleDelete(category.id)}
                disabled={deleteMutation.isPending}
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="no-categories">
          <p>Không có categories nào</p>
          {searchKeyword && (
            <button 
              className="btn btn-primary"
              onClick={() => setSearchKeyword('')}
            >
              Xem tất cả categories
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Sửa Category' : 'Thêm Category Mới'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Tên Category *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nhập tên category"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả category"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
