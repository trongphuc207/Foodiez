import React, { useState } from 'react';
import { FiSearch, FiX, FiMic } from 'react-icons/fi';
import './MobileSearch.css';

const MobileSearch = ({ 
  onSearch, 
  placeholder = "Tìm kiếm...", 
  showVoiceSearch = false 
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

  const handleVoiceSearch = () => {
    // Voice search functionality would be implemented here
    console.log('Voice search activated');
  };

  const clearSearch = () => {
    setKeyword("");
  };

  return (
    <div className="mobile-search-wrapper">
      <div className={`mobile-search-container ${isFocused ? 'focused' : ''}`}>
        <div className="search-icon-wrapper">
          <FiSearch className="search-icon" />
        </div>
        
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="mobile-search-input"
        />
        
        {keyword && (
          <button 
            className="clear-button"
            onClick={clearSearch}
          >
            <FiX />
          </button>
        )}
        
        {showVoiceSearch && (
          <button 
            className="voice-button"
            onClick={handleVoiceSearch}
          >
            <FiMic />
          </button>
        )}
      </div>
      
      <button 
        className={`mobile-search-button ${!keyword.trim() ? 'disabled' : ''}`}
        onClick={handleSearch}
        disabled={!keyword.trim()}
      >
        <FiSearch />
      </button>
    </div>
  );
};

export default MobileSearch;
