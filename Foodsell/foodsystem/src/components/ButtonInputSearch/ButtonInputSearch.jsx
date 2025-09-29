import { Button, Input } from 'antd';
import React, { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons'; 

const ButtonInputSearch = ({ size, placeholder, textButton, onSearch }) => {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (onSearch) onSearch(keyword.trim());
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Input 
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={placeholder || "Tìm kiếm..."} 
        size={size || "middle"} 
        onPressEnter={handleSearch}   
      />
      <Button 
        size={size || "large"} 
        icon={<SearchOutlined />} 
        onClick={handleSearch}     
      >
        {textButton || "Search"}
      </Button>
    </div>
  );
};

export default ButtonInputSearch;
