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

let products = [
    {
        id: 1,
        name: "Phở Bò Tái",
        description: "Phở bò tái truyền thống với thịt bò tươi ngon",
        price: 45000,
        categoryId: 1,
        shopId: 1,
        imageUrl: "/placeholder.jpg",
        is_available: true,
        status: "active",
        createdAt: "2025-01-15T10:00:00.000Z"
    },
    {
        id: 2,
        name: "Bánh Mì Thịt Nướng",
        description: "Bánh mì thịt nướng với pate và rau củ tươi",
        price: 25000,
        categoryId: 2,
        shopId: 1,
        imageUrl: "/placeholder.jpg",
        is_available: true,
        status: "active",
        createdAt: "2025-01-15T10:00:00.000Z"
    },
    {
        id: 3,
        name: "Cơm Tấm Sườn Nướng",
        description: "Cơm tấm sườn nướng thơm ngon với bì chả",
        price: 35000,
        categoryId: 3,
        shopId: 2,
        imageUrl: "/placeholder.jpg",
        is_available: true,
        status: "active",
        createdAt: "2025-01-15T10:00:00.000Z"
    },
    {
        id: 4,
        name: "Trà Sữa Trân Châu",
        description: "Trà sữa trân châu đen thơm ngon",
        price: 20000,
        categoryId: 4,
        shopId: 3,
        imageUrl: "/placeholder.jpg",
        is_available: true,
        status: "active",
        createdAt: "2025-01-15T10:00:00.000Z"
    },
    {
        id: 5,
        name: "Pizza Margherita",
        description: "Pizza Margherita với phô mai mozzarella và cà chua",
        price: 120000,
        categoryId: 5,
        shopId: 4,
        imageUrl: "/placeholder.jpg",
        is_available: true,
        status: "active",
        createdAt: "2025-01-15T10:00:00.000Z"
    },
    {
        id: 6,
        name: "Bún Bò Huế",
        description: "Bún bò Huế cay nồng với thịt bò và chả cua",
        price: 40000,
        categoryId: 6,
        shopId: 1,
        imageUrl: "/placeholder.jpg",
        is_available: true,
        status: "active",
        createdAt: "2025-01-15T10:00:00.000Z"
    }
];

let shops = [
    {
        id: 1,
        name: "Quán Phở Hà Nội",
        description: "Phở truyền thống Hà Nội",
        address: "123 Đường Láng, Hà Nội",
        phone: "0123456789",
        rating: 4.5,
        status: "active"
    },
    {
        id: 2,
        name: "Cơm Tấm Sài Gòn",
        description: "Cơm tấm Sài Gòn chính gốc",
        address: "456 Nguyễn Huệ, TP.HCM",
        phone: "0987654321",
        rating: 4.3,
        status: "active"
    },
    {
        id: 3,
        name: "Trà Sữa Gong Cha",
        description: "Trà sữa Đài Loan thơm ngon",
        address: "789 Lê Lợi, Hà Nội",
        phone: "0369258147",
        rating: 4.7,
        status: "active"
    },
    {
        id: 4,
        name: "Pizza Hut",
        description: "Pizza Ý chính gốc",
        address: "321 Trần Hưng Đạo, TP.HCM",
        phone: "0147258369",
        rating: 4.2,
        status: "active"
    }
];

let reviews = [
    {
        id: 1,
        productId: 1,
        shopId: 1,
        userId: 1,
        userName: "Nguyễn Văn A",
        rating: 5,
        comment: "Phở rất ngon, nước dùng đậm đà, thịt bò tươi. Sẽ quay lại!",
        createdAt: "2025-01-10T10:30:00.000Z"
    },
    {
        id: 2,
        productId: 1,
        shopId: 1,
        userId: 2,
        userName: "Trần Thị B",
        rating: 4,
        comment: "Phở ngon nhưng hơi mặn một chút. Nhân viên phục vụ nhiệt tình.",
        createdAt: "2025-01-09T14:20:00.000Z"
    },
    {
        id: 3,
        productId: 2,
        shopId: 1,
        userId: 3,
        userName: "Lê Văn C",
        rating: 5,
        comment: "Bánh mì thịt nướng tuyệt vời! Pate thơm, rau củ tươi ngon.",
        createdAt: "2025-01-08T08:15:00.000Z"
    },
    {
        id: 4,
        productId: 3,
        shopId: 2,
        userId: 4,
        userName: "Phạm Thị D",
        rating: 4,
        comment: "Cơm tấm sườn nướng ngon, sườn mềm thơm. Giá cả hợp lý.",
        createdAt: "2025-01-07T19:45:00.000Z"
    },
    {
        id: 5,
        productId: 4,
        shopId: 3,
        userId: 5,
        userName: "Hoàng Văn E",
        rating: 5,
        comment: "Trà sữa trân châu ngon lắm! Trân châu dai giòn, trà sữa thơm.",
        createdAt: "2025-01-06T16:30:00.000Z"
    },
    {
        id: 6,
        productId: 5,
        shopId: 4,
        userId: 6,
        userName: "Vũ Thị F",
        rating: 3,
        comment: "Pizza ổn nhưng không đặc biệt lắm. Phô mai có thể nhiều hơn.",
        createdAt: "2025-01-05T12:00:00.000Z"
    },
    {
        id: 7,
        productId: 6,
        shopId: 1,
        userId: 7,
        userName: "Đặng Văn G",
        rating: 5,
        comment: "Bún bò Huế cay nồng đúng vị! Thịt bò mềm, chả cua ngon.",
        createdAt: "2025-01-04T11:20:00.000Z"
    },
    {
        id: 8,
        productId: 1,
        shopId: 1,
        userId: 8,
        userName: "Bùi Thị H",
        rating: 4,
        comment: "Phở ngon, giá cả phải chăng. Quán sạch sẽ, thoáng mát.",
        createdAt: "2025-01-03T09:10:00.000Z"
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

// Products API endpoints
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        message: 'Lấy danh sách sản phẩm thành công',
        data: products
    });
});

app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (product) {
        res.json({
            success: true,
            message: 'Lấy thông tin sản phẩm thành công',
            data: product
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Sản phẩm không tồn tại'
        });
    }
});

app.get('/api/products/shop/:shopId', (req, res) => {
    const shopId = parseInt(req.params.shopId);
    const shopProducts = products.filter(p => p.shopId === shopId);
    
    res.json({
        success: true,
        message: 'Lấy sản phẩm theo shop thành công',
        data: shopProducts
    });
});

app.get('/api/products/search', (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.json({
            success: true,
            message: 'Lấy danh sách sản phẩm thành công',
            data: products
        });
    }
    
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        p.description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    res.json({
        success: true,
        message: 'Tìm kiếm sản phẩm thành công',
        data: filteredProducts
    });
});

// Shops API endpoints
app.get('/api/shops', (req, res) => {
    res.json({
        success: true,
        message: 'Lấy danh sách cửa hàng thành công',
        data: shops
    });
});

app.get('/api/shops/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const shop = shops.find(s => s.id === id);
    
    if (shop) {
        res.json({
            success: true,
            message: 'Lấy thông tin cửa hàng thành công',
            data: shop
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Cửa hàng không tồn tại'
        });
    }
});

app.get('/api/shops/search', (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.json({
            success: true,
            message: 'Lấy danh sách cửa hàng thành công',
            data: shops
        });
    }
    
    const filteredShops = shops.filter(s => 
        s.name.toLowerCase().includes(keyword.toLowerCase()) ||
        s.description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    res.json({
        success: true,
        message: 'Tìm kiếm cửa hàng thành công',
        data: filteredShops
    });
});

// Reviews API endpoints
app.get('/api/reviews', (req, res) => {
    res.json({
        success: true,
        message: 'Lấy danh sách đánh giá thành công',
        data: reviews
    });
});

app.get('/api/reviews/product/:productId', (req, res) => {
    const productId = parseInt(req.params.productId);
    const productReviews = reviews.filter(r => r.productId === productId);
    
    res.json({
        success: true,
        message: 'Lấy đánh giá theo sản phẩm thành công',
        data: productReviews
    });
});

app.get('/api/reviews/shop/:shopId', (req, res) => {
    const shopId = parseInt(req.params.shopId);
    const shopReviews = reviews.filter(r => r.shopId === shopId);
    
    res.json({
        success: true,
        message: 'Lấy đánh giá theo cửa hàng thành công',
        data: shopReviews
    });
});

app.post('/api/reviews', (req, res) => {
    const { productId, shopId, userId, userName, rating, comment } = req.body;
    
    const newReview = {
        id: reviews.length + 1,
        productId,
        shopId,
        userId,
        userName,
        rating,
        comment,
        createdAt: new Date().toISOString()
    };
    
    reviews.push(newReview);
    
    res.json({
        success: true,
        message: 'Tạo đánh giá thành công',
        data: newReview
    });
});

app.delete('/api/reviews/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = reviews.findIndex(r => r.id === id);
    
    if (index !== -1) {
        reviews.splice(index, 1);
        res.json({
            success: true,
            message: 'Xóa đánh giá thành công',
            data: 'Đánh giá đã được xóa'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Đánh giá không tồn tại'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Mock server running on http://localhost:${PORT}`);
    console.log(`📋 Categories API available at http://localhost:${PORT}/api/categories`);
    console.log(`🛍️ Products API available at http://localhost:${PORT}/api/products`);
    console.log(`🏪 Shops API available at http://localhost:${PORT}/api/shops`);
    console.log(`⭐ Reviews API available at http://localhost:${PORT}/api/reviews`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/api/health`);
});


