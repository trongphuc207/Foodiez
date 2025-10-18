import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiFilter, FiChevronDown } from 'react-icons/fi';
import './AdvancedSearch.css';

const AdvancedSearch = ({ 
  onSearch, 
  placeholder = "Tìm kiếm món ăn, nhà hàng...", 
  showFilters = true,
  categories = [],
  onCategoryChange 
}) => {
  const [keyword, setKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("relevance");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Mock suggestions data (in real app, this would come from API)
  const mockSuggestions = [
    "Phở bò", "Bánh mì", "Cơm tấm", "Pizza", "Bún bò", 
    "Gà rán", "Sushi", "Lẩu", "Chả cá", "Bún chả"
  ];

  useEffect(() => {
    if (keyword.length > 1) {
      const filtered = mockSuggestions.filter(item =>
        item.toLowerCase().includes(keyword.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const searchParams = {
      keyword: keyword.trim(),
      category: selectedCategory,
      priceRange,
      sortBy
    };
    
    if (onSearch) {
      onSearch(searchParams);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setKeyword(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setKeyword("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortBy("relevance");
  };

  const toggleFilters = () => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  return (
    <div className="advanced-search-wrapper" ref={suggestionsRef}>
      <div className="advanced-search-container">
        <div className={`search-input-container ${isFocused ? 'focused' : ''}`}>
          <div className="search-icon-wrapper">
            <FiSearch className="search-icon" />
          </div>
          
          <input
            ref={searchRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="search-input"
          />
          
          {keyword && (
            <button 
              className="clear-button"
              onClick={() => setKeyword("")}
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="search-actions">
          {showFilters && (
            <button 
              className={`filter-button ${showFiltersPanel ? 'active' : ''}`}
              onClick={toggleFilters}
            >
              <FiFilter />
              <span>Bộ lọc</span>
              <FiChevronDown className={`chevron ${showFiltersPanel ? 'rotated' : ''}`} />
            </button>
          )}
          
          <button 
            className={`search-button ${!keyword.trim() ? 'disabled' : ''}`}
            onClick={handleSearch}
            disabled={!keyword.trim()}
          >
            <FiSearch />
            <span>Tìm kiếm</span>
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <FiSearch className="suggestion-icon" />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFiltersPanel && (
        <div className="filters-panel">
          <div className="filters-content">
            <div className="filter-group">
              <label>Danh mục</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Khoảng giá</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Từ"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Đến"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sắp xếp theo</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="relevance">Liên quan</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
                <option value="rating">Đánh giá cao</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>

            <div className="filter-actions">
              <button className="clear-filters" onClick={clearSearch}>
                Xóa bộ lọc
              </button>
              <button className="apply-filters" onClick={handleSearch}>
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
