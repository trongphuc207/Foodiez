import React from 'react';
// Tái sử dụng Header làm Navbar cho khu vực Admin
import Header from './Header';

export default function Navbar(props) {
	return <Header {...props} />;
}

