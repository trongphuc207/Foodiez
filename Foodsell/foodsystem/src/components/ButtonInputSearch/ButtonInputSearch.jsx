import React, { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons'; 
import './ButtonInputSearch.css';

const ButtonInputSearch = ({ size, placeholder, textButton, onSearch }) => {
  const [keyword, setKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (onSearch) onSearch(keyword.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`modern-search-wrapper ${size || 'large'}`}>
      <div className={`modern-search-container ${isFocused ? 'focused' : ''}`}>
        <div className="search-icon-wrapper">
          <SearchOutlined className="search-icon" />
        </div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || "Tìm kiếm món ăn, nhà hàng..."}
          className="modern-search-input"
        />
        {keyword && (
          <button 
            className="clear-button"
            onClick={() => setKeyword("")}
          >
            ×
          </button>
        )}
      </div>
      <button 
        className={`modern-search-button ${!keyword.trim() ? 'disabled' : ''}`}
        onClick={handleSearch}
        disabled={!keyword.trim()}
      >
        <SearchOutlined className="button-icon" />
        <span className="button-text">{textButton || "Tìm kiếm"}</span>
      </button>
    </div>
  );
};

export default ButtonInputSearch;
