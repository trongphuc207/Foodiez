import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './CustomerProfile.css';
import { isAuthenticated, authAPI } from '../../api/auth';
import AvatarUpload from '../AvatarUpload/AvatarUpload';

const CustomerProfile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationType, setApplicationType] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    idNumber: '',
    role: 'buyer'
  });
  const [applicationForm, setApplicationForm] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    idNumber: '',
    
    // Documents
    idCardFront: null,
    idCardBack: null,
    drivingLicense: null,
    vehicleRegistration: null,
    insurance: null,
    householdBook: null,
    productSafetyCertificate: null,
    
    // Additional Info
    bankAccount: '',
    bankName: '',
    vehicleType: '',
    vehicleNumber: '',
    experience: '',
    reason: ''
  });
  const [errors, setErrors] = useState({});
  const [applicationErrors, setApplicationErrors] = useState({});

  // Mock data - replace with actual API calls
  const mockUser = useMemo(() => ({
    id: 1,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main Street, City, State 12345',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    idNumber: '123456789',
    avatar: '',
    joinDate: '2023-01-15',
    role: 'buyer',
    isVerified: true,
    profileImage: null
  }), []);

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

  const loadUserData = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      console.log('📥 API Response:', response);
      const userData = response.data || response.user;
      console.log('👤 User data from API:', userData);
      
      setUser(userData);
      setForm({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        idNumber: userData.idNumber || '',
        role: userData.role || 'buyer'
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to mock data if API fails
      setUser(mockUser);
      setForm({
        fullName: mockUser.fullName,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address,
        dateOfBirth: mockUser.dateOfBirth,
        gender: mockUser.gender,
        idNumber: mockUser.idNumber,
        role: mockUser.role
      });
    }
  }, [mockUser]);

  useEffect(() => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/';
      return;
    }

    // Load user data
    loadUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      const updatedUser = response.data || response.user;
      
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

  const handleAvatarChange = (newAvatarPath) => {
    console.log('🔄 handleAvatarChange called with:', newAvatarPath);
    setUser(prev => {
      const updatedUser = {
        ...prev,
        profileImage: newAvatarPath
      };
      console.log('👤 Updated user:', updatedUser);
      return updatedUser;
    });
    
    // Force reload user data to get fresh data from backend
    setTimeout(() => {
      console.log('🔄 Force reloading user data...');
      loadUserData();
    }, 500);
  };

  const getAvatarUrl = (profileImage) => {
    console.log('🔍 getAvatarUrl input:', profileImage);
    
    if (!profileImage) {
      console.log('❌ No profileImage, returning placeholder');
      return '/placeholder-user.jpg';
    }
    
    // If it's already a full URL, use it with cache busting
    if (profileImage.startsWith('http')) {
      const url = `${profileImage}?t=${Date.now()}`;
      console.log('✅ Full URL detected, adding cache busting:', url);
      return url;
    }
    
    // If it's already a full path, use it
    if (profileImage.startsWith('/')) {
      console.log('✅ Full path detected:', profileImage);
      return profileImage;
    }
    
    // If it's a path like "uploads/profile-images/filename.jpg", create full URL with cache busting
    if (profileImage.startsWith('uploads/')) {
      const url = `http://localhost:8080/${profileImage}?t=${Date.now()}`;
      console.log('✅ Uploads path detected, creating full URL with cache busting:', url);
      return url;
    }
    
    // If it's just a filename, construct the full URL with cache busting
    const url = `http://localhost:8080/uploads/profile-images/${profileImage}?t=${Date.now()}`;
    console.log('✅ Filename detected, creating full URL with cache busting:', url);
    return url;
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

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleInputChange}
              className={errors.dateOfBirth ? 'error' : ''}
            />
            {errors.dateOfBirth && <div className="error-message">{errors.dateOfBirth}</div>}
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleInputChange}
              className={errors.gender ? 'error' : ''}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <div className="error-message">{errors.gender}</div>}
          </div>

          <div className="form-group">
            <label>ID Number (CMND/CCCD)</label>
            <input
              type="text"
              name="idNumber"
              value={form.idNumber}
              onChange={handleInputChange}
              className={errors.idNumber ? 'error' : ''}
              placeholder="Enter your ID number"
            />
            {errors.idNumber && <div className="error-message">{errors.idNumber}</div>}
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleInputChange}
              disabled
              className="disabled-field"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="shipper">Shipper</option>
              <option value="admin">Admin</option>
            </select>
            <small className="field-note">Role can only be changed by admin</small>
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
            <label>Date of Birth:</label>
            <span>{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
          </div>
          <div className="info-item">
            <label>Gender:</label>
            <span>{user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not provided'}</span>
          </div>
          <div className="info-item">
            <label>ID Number:</label>
            <span>{user?.idNumber || 'Not provided'}</span>
          </div>
          <div className="info-item">
            <label>Role:</label>
            <span className={`role-badge ${user?.role}`}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Buyer'}
            </span>
          </div>
          <div className="info-item">
            <label>Verification Status:</label>
            <span className={`verification-status ${user?.isVerified ? 'verified' : 'unverified'}`}>
              {user?.isVerified ? '✅ Verified' : '❌ Unverified'}
            </span>
          </div>
          <div className="info-item">
            <label>Member Since:</label>
            <span>{user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Unknown'}</span>
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

  const handleApplicationSubmit = (role) => {
    // Check if user has complete profile
    if (!user.fullName || !user.phone || !user.address) {
      alert('Vui lòng cập nhật đầy đủ thông tin cá nhân trước khi đăng ký!');
      setActiveTab('info');
      setIsEditing(true);
      return;
    }
    
    // Open application modal
    setApplicationType(role);
    setShowApplicationModal(true);
    
    // Pre-fill form with user data
    setApplicationForm(prev => ({
      ...prev,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address
    }));
  };

  const handleApplicationFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!applicationForm.fullName) newErrors.fullName = 'Họ tên là bắt buộc';
    if (!applicationForm.phone) newErrors.phone = 'Số điện thoại là bắt buộc';
    if (!applicationForm.address) newErrors.address = 'Địa chỉ là bắt buộc';
    if (!applicationForm.dateOfBirth) newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    if (!applicationForm.idNumber) newErrors.idNumber = 'Số CMND/CCCD là bắt buộc';
    if (!applicationForm.bankAccount) newErrors.bankAccount = 'Số tài khoản ngân hàng là bắt buộc';
    
    if (applicationType === 'shipper') {
      if (!applicationForm.drivingLicense) newErrors.drivingLicense = 'Giấy phép lái xe là bắt buộc';
      if (!applicationForm.vehicleRegistration) newErrors.vehicleRegistration = 'Giấy đăng ký xe là bắt buộc';
      if (!applicationForm.vehicleType) newErrors.vehicleType = 'Loại xe là bắt buộc';
    }
    
    if (applicationType === 'seller') {
      if (!applicationForm.reason) newErrors.reason = 'Lý do đăng ký là bắt buộc';
      if (!applicationForm.productSafetyCertificate) newErrors.productSafetyCertificate = 'Giấy chứng nhận sản phẩm an toàn là bắt buộc';
    }
    
    setApplicationErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    // Submit application
    const applicationData = {
      userId: user.id,
      role: applicationType,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      formData: applicationForm
    };
    
    console.log('Application submitted:', applicationData);
    alert(`Đơn đăng ký ${applicationType === 'seller' ? 'bán hàng' : 'giao hàng'} đã được gửi thành công! Admin sẽ xem xét và phản hồi trong vòng 3-5 ngày làm việc.`);
    
    // Close modal and reset form
    setShowApplicationModal(false);
    setApplicationType(null);
    setApplicationForm({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      idNumber: '',
      idCardFront: null,
      idCardBack: null,
      drivingLicense: null,
      vehicleRegistration: null,
      insurance: null,
      householdBook: null,
      productSafetyCertificate: null,
      bankAccount: '',
      bankName: '',
      vehicleType: '',
      vehicleNumber: '',
      experience: '',
      reason: ''
    });
  };

  const renderApplicationsTab = () => (
    <div className="applications-tab">
      <div className="tab-header">
        <h3>Role Applications</h3>
        <p className="applications-description">
          Apply to become a seller or shipper to expand your opportunities on our platform.
        </p>
      </div>
      
      <div className="application-cards">
        {/* Seller Application */}
        <div className="application-card seller-card">
          <div className="card-header">
            <h4>🏪 Become a Seller</h4>
            <span className="card-badge">Earn Money</span>
          </div>
          <div className="card-content">
            <p>Start selling your products and reach thousands of customers.</p>
            <ul className="benefits-list">
              <li>✅ Create and manage your shop</li>
              <li>✅ Upload unlimited products</li>
              <li>✅ Track sales and analytics</li>
              <li>✅ Get paid directly</li>
            </ul>
            <button 
              className="apply-btn seller-btn"
              onClick={() => handleApplicationSubmit('seller')}
            >
              Apply as Seller
            </button>
          </div>
        </div>

        {/* Shipper Application */}
        <div className="application-card shipper-card">
          <div className="card-header">
            <h4>🚚 Become a Shipper</h4>
            <span className="card-badge">Flexible Work</span>
          </div>
          <div className="card-content">
            <p>Deliver orders and earn money on your own schedule.</p>
            <ul className="benefits-list">
              <li>✅ Flexible working hours</li>
              <li>✅ Choose your delivery area</li>
              <li>✅ Earn per delivery</li>
              <li>✅ Real-time order tracking</li>
            </ul>
            <button 
              className="apply-btn shipper-btn"
              onClick={() => handleApplicationSubmit('shipper')}
            >
              Apply as Shipper
            </button>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className="application-status">
        <h4>Application Status</h4>
        <div className="status-list">
          <div className="status-item">
            <span className="status-label">Seller Application:</span>
            <span className="status-value pending">Pending Review</span>
          </div>
          <div className="status-item">
            <span className="status-label">Shipper Application:</span>
            <span className="status-value not-applied">Not Applied</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  console.log('👤 Current user data:', user);
  console.log('🖼️ User profileImage:', user.profileImage);
  console.log('🔍 getAvatarUrl result:', getAvatarUrl(user.profileImage));

  return (
    <div className="customer-profile">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
              <div className="profile-avatar-section">
                {(() => {
                  const avatarUrl = getAvatarUrl(user.profileImage);
                  console.log('🖼️ Final avatar URL:', avatarUrl);
                  return (
                    <img
                      key={user.profileImage || 'default'} // Force re-render when profileImage changes
                      src={avatarUrl}
                      alt="Profile"
                      className="profile-avatar-large"
                      onError={(e) => {
                        console.error('❌ Image load error for URL:', avatarUrl);
                        e.target.src = '/placeholder-user.jpg';
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', avatarUrl);
                      }}
                    />
                  );
                })()}
           <button 
             className="change-avatar-btn"
             onClick={() => setShowAvatarUpload(true)}
           >
             Thay đổi Avatar
           </button>
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
            <button
              className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              Applications
            </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'info' && renderInfoTab()}
          {activeTab === 'addresses' && renderAddressesTab()}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'favorites' && renderFavoritesTab()}
          {activeTab === 'applications' && renderApplicationsTab()}
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <AvatarUpload
          currentAvatar={user.profileImage}
          onAvatarChange={handleAvatarChange}
          onClose={() => setShowAvatarUpload(false)}
        />
      )}

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="application-modal-overlay" onClick={() => setShowApplicationModal(false)}>
          <div className="application-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {applicationType === 'seller' ? '🏪 Đăng ký trở thành Người bán hàng' : '🚚 Đăng ký trở thành Shipper'}
              </h2>
              <button className="close-btn" onClick={() => setShowApplicationModal(false)}>×</button>
            </div>

            <form onSubmit={handleApplicationFormSubmit} className="application-form">
              {/* Personal Information */}
              <div className="form-section">
                <h3>📋 Thông tin cá nhân</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      value={applicationForm.fullName}
                      onChange={(e) => setApplicationForm(prev => ({...prev, fullName: e.target.value}))}
                      className={applicationErrors.fullName ? 'error' : ''}
                    />
                    {applicationErrors.fullName && <span className="error-text">{applicationErrors.fullName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm(prev => ({...prev, email: e.target.value}))}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input
                      type="tel"
                      value={applicationForm.phone}
                      onChange={(e) => setApplicationForm(prev => ({...prev, phone: e.target.value}))}
                      className={applicationErrors.phone ? 'error' : ''}
                    />
                    {applicationErrors.phone && <span className="error-text">{applicationErrors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label>Ngày sinh *</label>
                    <input
                      type="date"
                      value={applicationForm.dateOfBirth}
                      onChange={(e) => setApplicationForm(prev => ({...prev, dateOfBirth: e.target.value}))}
                      className={applicationErrors.dateOfBirth ? 'error' : ''}
                    />
                    {applicationErrors.dateOfBirth && <span className="error-text">{applicationErrors.dateOfBirth}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số CMND/CCCD *</label>
                    <input
                      type="text"
                      value={applicationForm.idNumber}
                      onChange={(e) => setApplicationForm(prev => ({...prev, idNumber: e.target.value}))}
                      className={applicationErrors.idNumber ? 'error' : ''}
                    />
                    {applicationErrors.idNumber && <span className="error-text">{applicationErrors.idNumber}</span>}
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ *</label>
                    <input
                      type="text"
                      value={applicationForm.address}
                      onChange={(e) => setApplicationForm(prev => ({...prev, address: e.target.value}))}
                      className={applicationErrors.address ? 'error' : ''}
                    />
                    {applicationErrors.address && <span className="error-text">{applicationErrors.address}</span>}
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="form-section">
                <h3>🧾 Giấy tờ cần thiết</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>CMND/CCCD mặt trước *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setApplicationForm(prev => ({...prev, idCardFront: e.target.files[0]}))}
                    />
                  </div>
                  <div className="form-group">
                    <label>CMND/CCCD mặt sau *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setApplicationForm(prev => ({...prev, idCardBack: e.target.files[0]}))}
                    />
                  </div>
                </div>

                {applicationType === 'shipper' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Giấy phép lái xe A1/A2 *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setApplicationForm(prev => ({...prev, drivingLicense: e.target.files[0]}))}
                          className={applicationErrors.drivingLicense ? 'error' : ''}
                        />
                        {applicationErrors.drivingLicense && <span className="error-text">{applicationErrors.drivingLicense}</span>}
                      </div>
                      <div className="form-group">
                        <label>Giấy đăng ký xe *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setApplicationForm(prev => ({...prev, vehicleRegistration: e.target.files[0]}))}
                          className={applicationErrors.vehicleRegistration ? 'error' : ''}
                        />
                        {applicationErrors.vehicleRegistration && <span className="error-text">{applicationErrors.vehicleRegistration}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Bảo hiểm xe máy</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setApplicationForm(prev => ({...prev, insurance: e.target.files[0]}))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Sổ hộ khẩu/Giấy tạm trú</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setApplicationForm(prev => ({...prev, householdBook: e.target.files[0]}))}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bank Information */}
              <div className="form-section">
                <h3>🏦 Thông tin ngân hàng</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Số tài khoản ngân hàng *</label>
                    <input
                      type="text"
                      value={applicationForm.bankAccount}
                      onChange={(e) => setApplicationForm(prev => ({...prev, bankAccount: e.target.value}))}
                      className={applicationErrors.bankAccount ? 'error' : ''}
                    />
                    {applicationErrors.bankAccount && <span className="error-text">{applicationErrors.bankAccount}</span>}
                  </div>
                  <div className="form-group">
                    <label>Tên ngân hàng</label>
                    <input
                      type="text"
                      value={applicationForm.bankName}
                      onChange={(e) => setApplicationForm(prev => ({...prev, bankName: e.target.value}))}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {applicationType === 'shipper' && (
                <div className="form-section">
                  <h3>🛵 Thông tin phương tiện</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Loại xe *</label>
                      <select
                        value={applicationForm.vehicleType}
                        onChange={(e) => setApplicationForm(prev => ({...prev, vehicleType: e.target.value}))}
                        className={applicationErrors.vehicleType ? 'error' : ''}
                      >
                        <option value="">Chọn loại xe</option>
                        <option value="motorcycle">Xe máy</option>
                        <option value="bicycle">Xe đạp</option>
                        <option value="car">Ô tô</option>
                      </select>
                      {applicationErrors.vehicleType && <span className="error-text">{applicationErrors.vehicleType}</span>}
                    </div>
                    <div className="form-group">
                      <label>Biển số xe</label>
                      <input
                        type="text"
                        value={applicationForm.vehicleNumber}
                        onChange={(e) => setApplicationForm(prev => ({...prev, vehicleNumber: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {applicationType === 'seller' && (
                <div className="form-section">
                  <h3>🏪 Thông tin bổ sung</h3>
                  
                  <div className="form-group">
                    <label>Giấy chứng nhận sản phẩm an toàn *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setApplicationForm(prev => ({...prev, productSafetyCertificate: e.target.files[0]}))}
                      className={applicationErrors.productSafetyCertificate ? 'error' : ''}
                    />
                    <small className="field-note">Upload giấy chứng nhận sản phẩm an toàn (JPG, PNG, PDF)</small>
                    {applicationErrors.productSafetyCertificate && <span className="error-text">{applicationErrors.productSafetyCertificate}</span>}
                  </div>

                  <div className="form-group">
                    <label>Lý do muốn trở thành người bán hàng *</label>
                    <textarea
                      value={applicationForm.reason}
                      onChange={(e) => setApplicationForm(prev => ({...prev, reason: e.target.value}))}
                      className={applicationErrors.reason ? 'error' : ''}
                      rows={4}
                      placeholder="Hãy chia sẻ lý do bạn muốn trở thành người bán hàng trên nền tảng của chúng tôi..."
                    />
                    {applicationErrors.reason && <span className="error-text">{applicationErrors.reason}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Kinh nghiệm bán hàng</label>
                    <textarea
                      value={applicationForm.experience}
                      onChange={(e) => setApplicationForm(prev => ({...prev, experience: e.target.value}))}
                      rows={3}
                      placeholder="Chia sẻ kinh nghiệm bán hàng của bạn (nếu có)..."
                    />
                  </div>
                </div>
              )}

              {/* Requirements Info */}
              <div className="requirements-info">
                <h4>📋 Yêu cầu cơ bản:</h4>
                <ul>
                  <li>✅ Tuổi từ 18-60 tuổi</li>
                  <li>✅ Không có tiền án, tiền sự</li>
                  <li>✅ Có giấy tờ tùy thân hợp lệ</li>
                  <li>✅ Có tài khoản ngân hàng</li>
                  {applicationType === 'shipper' && (
                    <>
                      <li>✅ Có giấy phép lái xe phù hợp</li>
                      <li>✅ Có phương tiện hợp pháp</li>
                      <li>✅ Có điện thoại smartphone hỗ trợ GPS</li>
                    </>
                  )}
                  {applicationType === 'seller' && (
                    <>
                      <li>✅ Hàng hóa hợp pháp, không thuộc danh mục cấm</li>
                      <li>✅ Có giấy chứng nhận sản phẩm an toàn</li>
                      <li>✅ Cam kết tuân thủ quy định của nền tảng</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowApplicationModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  Gửi đơn đăng ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;