import React, { useState } from 'react';
import { ButtonInputSearch, AdvancedSearch, MobileSearch } from './index';
import './SearchDemo.css';

const SearchDemo = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [activeDemo, setActiveDemo] = useState('basic');

  const handleBasicSearch = (keyword) => {
    console.log('Basic search:', keyword);
    setSearchResults([`Kết quả tìm kiếm cho: "${keyword}"`]);
  };

  const handleAdvancedSearch = (searchParams) => {
    console.log('Advanced search:', searchParams);
    const results = [];
    if (searchParams.keyword) results.push(`Từ khóa: ${searchParams.keyword}`);
    if (searchParams.category) results.push(`Danh mục: ${searchParams.category}`);
    if (searchParams.priceRange.min) results.push(`Giá từ: ${searchParams.priceRange.min}`);
    if (searchParams.priceRange.max) results.push(`Giá đến: ${searchParams.priceRange.max}`);
    if (searchParams.sortBy) results.push(`Sắp xếp: ${searchParams.sortBy}`);
    setSearchResults(results);
  };

  const handleMobileSearch = (keyword) => {
    console.log('Mobile search:', keyword);
    setSearchResults([`Tìm kiếm mobile: "${keyword}"`]);
  };

  const categories = [
    { id: 1, name: "Món chính" },
    { id: 2, name: "Món phụ" },
    { id: 3, name: "Đồ uống" },
    { id: 4, name: "Tráng miệng" },
    { id: 5, name: "Đồ ăn nhanh" },
    { id: 6, name: "Món chay" },
    { id: 7, name: "Hải sản" }
  ];

  return (
    <div className="search-demo-container">
      <div className="demo-header">
        <h2>🔍 Search Components Demo</h2>
        <p>Demo các component tìm kiếm khác nhau</p>
      </div>

      <div className="demo-tabs">
        <button 
          className={`demo-tab ${activeDemo === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveDemo('basic')}
        >
          Basic Search
        </button>
        <button 
          className={`demo-tab ${activeDemo === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveDemo('advanced')}
        >
          Advanced Search
        </button>
        <button 
          className={`demo-tab ${activeDemo === 'mobile' ? 'active' : ''}`}
          onClick={() => setActiveDemo('mobile')}
        >
          Mobile Search
        </button>
      </div>

      <div className="demo-content">
        {activeDemo === 'basic' && (
          <div className="demo-section">
            <h3>Basic Search Component</h3>
            <p>Component tìm kiếm cơ bản với input và button</p>
            <div className="demo-search">
              <ButtonInputSearch
                placeholder="Tìm kiếm món ăn..."
                textButton="Tìm kiếm"
                size="large"
                onSearch={handleBasicSearch}
              />
            </div>
          </div>
        )}

        {activeDemo === 'advanced' && (
          <div className="demo-section">
            <h3>Advanced Search Component</h3>
            <p>Component tìm kiếm nâng cao với bộ lọc và gợi ý</p>
            <div className="demo-search">
              <AdvancedSearch
                placeholder="Tìm kiếm món ăn, nhà hàng..."
                onSearch={handleAdvancedSearch}
                showFilters={true}
                categories={categories}
              />
            </div>
          </div>
        )}

        {activeDemo === 'mobile' && (
          <div className="demo-section">
            <h3>Mobile Search Component</h3>
            <p>Component tìm kiếm tối ưu cho mobile</p>
            <div className="demo-search mobile-demo">
              <MobileSearch
                placeholder="Tìm kiếm..."
                showVoiceSearch={true}
                onSearch={handleMobileSearch}
              />
            </div>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h4>Kết quả tìm kiếm:</h4>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="demo-features">
        <h3>✨ Tính năng</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🔍 Basic Search</h4>
            <ul>
              <li>Input tìm kiếm đơn giản</li>
              <li>Button tìm kiếm</li>
              <li>Hỗ trợ Enter để tìm</li>
              <li>Clear button</li>
            </ul>
          </div>
          
          <div className="feature-card">
            <h4>🚀 Advanced Search</h4>
            <ul>
              <li>Autocomplete suggestions</li>
              <li>Bộ lọc danh mục</li>
              <li>Lọc theo khoảng giá</li>
              <li>Sắp xếp kết quả</li>
              <li>Responsive design</li>
            </ul>
          </div>
          
          <div className="feature-card">
            <h4>📱 Mobile Search</h4>
            <ul>
              <li>Thiết kế tối ưu mobile</li>
              <li>Voice search (demo)</li>
              <li>Compact layout</li>
              <li>Touch-friendly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDemo;
