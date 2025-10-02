import React, { useState, useEffect } from 'react';
import './CustomerProfile.css';
import { getAuthToken, isAuthenticated, authAPI } from '../../api/auth';

const CustomerProfile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  // Mock data - replace with actual API calls
  const mockUser = {
    id: 1,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main Street, City, State 12345',
    avatar: '',
    joinDate: '2023-01-15',
    role: 'buyer'
  };

  const mockAddresses = [
    {
      id: 1,
      label: 'Home',
      address: '123 Main Street, City, State 12345',
      isDefault: true
    },
    {
      id: 2,
      label: 'Office',
      address: '456 Business Ave, City, State 12345',
      isDefault: false
    }
  ];

  const mockOrders = [
    {
      id: 1,
      date: '2024-01-15',
      status: 'delivered',
      total: 45.99,
      items: 3
    },
    {
      id: 2,
      date: '2024-01-10',
      status: 'shipping',
      total: 32.50,
      items: 2
    }
  ];

  const mockFavorites = [
    {
      id: 1,
      name: 'Delicious Pizza',
      shop: 'Pizza Palace',
      price: 15.99,
      rating: 4.5,
      image: 'https://via.placeholder.com/300x200'
    },
    {
      id: 2,
      name: 'Fresh Salad',
      shop: 'Healthy Bites',
      price: 8.99,
      rating: 4.2,
      image: 'https://via.placeholder.com/300x200'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/';
      return;
    }

    // Load user data
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.user;
      
      setUser(userData);
      setForm({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to mock data if API fails
      setUser(mockUser);
      setForm({
        fullName: mockUser.fullName,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.updateProfile(form);
      const updatedUser = response.user;
      
      setUser(updatedUser);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // TODO: Implement change password functionality
    alert('Change password functionality will be implemented');
  };

  const renderInfoTab = () => (
    <div className="info-form">
      <div className="tab-header">
        <h3>Personal Information</h3>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleInputChange}
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <div className="error-message">{errors.fullName}</div>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleInputChange}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>

          <div className="edit-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-display">
          <div className="info-item">
            <label>Full Name:</label>
            <span>{user?.fullName}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
          <div className="info-item">
            <label>Phone:</label>
            <span>{user?.phone}</span>
          </div>
          <div className="info-item">
            <label>Address:</label>
            <span>{user?.address}</span>
          </div>
          <div className="info-item">
            <label>Member Since:</label>
            <span>{new Date(user?.joinDate).toLocaleDateString()}</span>
          </div>
          
          <div className="password-section">
            <button className="change-password-btn" onClick={handleChangePassword}>
              Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddressesTab = () => (
    <div>
      <div className="tab-header">
        <h3>Addresses</h3>
        <button className="add-btn">Add New Address</button>
      </div>
      
      <div className="addresses-list">
        {mockAddresses.map(address => (
          <div key={address.id} className="address-card">
            <div className="address-header">
              <span className="address-label">{address.label}</span>
              {address.isDefault && <span className="default-badge">Default</span>}
            </div>
            <div className="address-text">{address.address}</div>
            <div className="address-actions">
              <button className="edit-address-btn">Edit</button>
              <button className="delete-address-btn">Delete</button>
              {!address.isDefault && (
                <button className="set-default-btn">Set as Default</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div>
      <div className="tab-header">
        <h3>Order History</h3>
      </div>
      
      <div className="orders-list">
        {mockOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h4>Order #{order.id}</h4>
                <p className="order-date">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <span className={`order-status status-${order.status}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="order-body">
              <p>{order.items} items</p>
              <p className="order-total">Total: ${order.total}</p>
            </div>
            <div className="order-actions">
              <button className="view-detail-btn">View Details</button>
              <button className="reorder-btn">Reorder</button>
              {order.status === 'delivered' && (
                <button className="review-btn">Write Review</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFavoritesTab = () => (
    <div>
      <div className="tab-header">
        <h3>Favorite Items</h3>
      </div>
      
      <div className="favorites-grid">
        {mockFavorites.map(item => (
          <div key={item.id} className="favorite-card">
            <img src={item.image} alt={item.name} className="favorite-image" />
            <div className="favorite-info">
              <h4>{item.name}</h4>
              <p className="favorite-shop">{item.shop}</p>
              <div className="favorite-footer">
                <span className="favorite-price">${item.price}</span>
                <span className="favorite-rating">★ {item.rating}</span>
              </div>
              <div className="favorite-actions">
                <button className="add-to-cart-btn">Add to Cart</button>
                <button className="remove-favorite-btn">♡</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="customer-profile">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <img 
              src={user.avatar || 'https://via.placeholder.com/120x120'} 
              alt="Profile" 
              className="profile-avatar-large"
            />
            <button className="change-avatar-btn">Change Avatar</button>
          </div>
          <div className="profile-info-header">
            <h2>{user.fullName}</h2>
            <p className="profile-email">{user.email}</p>
            <p className="profile-phone">{user.phone}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Personal Info
          </button>
          <button 
            className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Addresses
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'info' && renderInfoTab()}
          {activeTab === 'addresses' && renderAddressesTab()}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'favorites' && renderFavoritesTab()}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
