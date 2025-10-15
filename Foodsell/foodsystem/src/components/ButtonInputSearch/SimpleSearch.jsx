import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SimpleSearch.css';

const SimpleSearch = ({ 
  placeholder = "Tìm kiếm món ăn, nhà hàng...", 
  onSearch 
}) => {
  const [keyword, setKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (onSearch && keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setKeyword("");
  };

  return (
    <div className="simple-search-wrapper">
      <div className={`simple-search-container ${isFocused ? 'focused' : ''}`}>
        <FiSearch className="search-icon" />
        
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="search-input"
        />
        
        {keyword && (
          <button 
            className="clear-button"
            onClick={clearSearch}
            type="button"
          >
            <FiX />
          </button>
        )}
      </div>
      
      <button 
        className={`search-button ${!keyword.trim() ? 'disabled' : ''}`}
        onClick={handleSearch}
        disabled={!keyword.trim()}
        type="button"
      >
        Tìm kiếm
      </button>
    </div>
  );
};

export default SimpleSearch;
