import React, { useState } from 'react'

const ButtonInputSearch = (props) => {
    const { placeholder, textButton, onSearch } = props
    const [keyword, setKeyword] = useState('')

    const handleSearch = () => {
        if (typeof onSearch === 'function') {
            onSearch(keyword.trim())
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className="search-wrapper">
            <input 
                type="text"
                className="search-input"
                placeholder={placeholder || "Tìm kiếm món ăn..."} 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button 
                className="search-button"
                onClick={handleSearch}
            >
                🔍 {textButton || "Tìm kiếm"}
            </button>
        </div>
    )
}

export default ButtonInputSearch