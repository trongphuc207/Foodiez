const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let categories = [
    {
        id: 1,
        name: "Phở",
        description: "Vietnamese noodle soup, ready-to-eat",
        createdAt: "2025-09-30T19:54:50.1633333"
    },
    {
        id: 2,
        name: "Bánh Mì",
        description: "Vietnamese sandwich, ready-to-eat",
        createdAt: "2025-09-30T19:54:50.1633333"
    },
    {
        id: 3,
        name: "Cơm",
        description: "Rice dishes, ready-to-eat",
        createdAt: "2025-09-30T19:54:50.1633333"
    },
    {
        id: 4,
        name: "Nước uống",
        description: "Beverages including coffee, tea, and soft drinks",
        createdAt: "2025-10-09T07:32:55.2700000"
    },
    {
        id: 5,
        name: "Pizza",
        description: "Món pizza phong cách Ý, nhiều loại topping đa dạng",
        createdAt: "2025-10-10T15:57:31.6000000"
    },
    {
        id: 6,
        name: "Bún",
        description: "Món bún Việt Nam truyền thống, dùng với thịt, chả",
        createdAt: "2025-10-10T15:57:31.6000000"
    }
];

// Routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

app.get('/api/test/categories', (req, res) => {
    res.json({ message: 'Categories endpoint is accessible!' });
});

app.get('/api/categories', (req, res) => {
    res.json({
        success: true,
        message: 'Lấy danh sách categories thành công',
        data: categories
    });
});

app.get('/api/categories/seed', (req, res) => {
    res.json({
        success: true,
        message: `Đã tạo ${categories.length} categories mẫu thành công!`,
        data: 'Seed data completed'
    });
});

app.post('/api/categories', (req, res) => {
    const { name, description } = req.body;
    const newCategory = {
        id: categories.length + 1,
        name,
        description,
        createdAt: new Date().toISOString()
    };
    categories.push(newCategory);
    
    res.json({
        success: true,
        message: 'Tạo category thành công',
        data: newCategory
    });
});

app.get('/api/categories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const category = categories.find(c => c.id === id);
    
    if (category) {
        res.json({
            success: true,
            message: 'Lấy thông tin category thành công',
            data: category
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Category không tồn tại'
        });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = categories.findIndex(c => c.id === id);
    
    if (index !== -1) {
        categories.splice(index, 1);
        res.json({
            success: true,
            message: 'Xóa category thành công',
            data: 'Category đã được xóa'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Category không tồn tại'
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Mock server running on http://localhost:${PORT}`);
    console.log(`📋 Categories API available at http://localhost:${PORT}/api/categories`);
});






