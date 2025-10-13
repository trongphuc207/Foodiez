import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import categoryAPI from '../../api/category';
import './CategoryFilter.css';

const CategoryFilter = ({ onCategorySelect, selectedCategoryId, showAll = true }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

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

  const categories = searchKeyword.length > 0 
    ? (searchResponse?.data || [])
    : (categoriesResponse?.data || []);

  const handleCategoryClick = (category) => {
    onCategorySelect(category);
    setIsExpanded(false);
  };

  const handleShowAll = () => {
    onCategorySelect(null);
    setIsExpanded(false);
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const clearSearch = () => {
    setSearchKeyword('');
  };

  if (isLoading) {
    return (
      <div className="category-filter">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-filter">
        <div className="error">
          <p>Lỗi khi tải categories: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-filter">
      <div className="filter-header">
        <h3>Danh mục</h3>
        <button 
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="search-section">
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchKeyword}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchKeyword && (
              <button 
                className="clear-search"
                onClick={clearSearch}
              >
                ✕
              </button>
            )}
          </div>

          <div className="category-list">
            {showAll && (
              <div 
                className={`category-item ${selectedCategoryId === null ? 'active' : ''}`}
                onClick={handleShowAll}
              >
                <span className="category-icon">🍽️</span>
                <span className="category-name">Tất cả</span>
                <span className="category-count">{categoriesResponse?.data?.length || 0}</span>
              </div>
            )}

            {categories.map((category) => (
              <div 
                key={category.id} 
                className={`category-item ${selectedCategoryId === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                <span className="category-icon">📂</span>
                <span className="category-name">{category.name}</span>
                <span className="category-description">{category.description}</span>
              </div>
            ))}
          </div>

          {categories.length === 0 && searchKeyword && (
            <div className="no-results">
              <p>Không tìm thấy danh mục nào</p>
              <button 
                className="btn btn-primary"
                onClick={clearSearch}
              >
                Xóa tìm kiếm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
