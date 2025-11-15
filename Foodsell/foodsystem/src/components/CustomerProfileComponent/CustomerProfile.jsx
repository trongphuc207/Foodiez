import React, { useState, useEffect, useCallback } from 'react';
import './CustomerProfile.css';
import { isAuthenticated, authAPI } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import AvatarUpload from '../AvatarUpload/AvatarUpload';
import ChangePasswordModal from '../ChangePasswordModal/ChangePasswordModal';
import { fetchServerFavorites, removeServerFavorite, loadFavoritesForUser, saveFavoritesForUser } from '../../utils/favorites';
import FavoriteItems from './FavoriteItems';
import { productAPI } from '../../api/product';
import { addressAPI } from '../../api/address';

// Utility function to convert MM/DD/YYYY to ISO date string
const formatDateToISO = (dateString) => {
  if (!dateString) return '';
  const [month, day, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Utility function to convert ISO date to MM/DD/YYYY
const formatISOToDisplay = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const CustomerProfile = () => {
  const { changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
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
  // Application form state
  const [applicationStatus, setApplicationStatus] = useState({
    seller: 'not-applied',
    shipper: 'not-applied'
  });
  const [errors, setErrors] = useState({});

  // Application handlers
  const handleApplicationSubmit = async (type) => {
    try {
      // Here you would typically make an API call to submit the application
      // For now, we'll just update the status
      setApplicationStatus(prev => ({
        ...prev,
        [type]: 'pending'
      }));
      // Example API call (commented out for now):
      // await authAPI.submitApplication({ type });
    } catch (error) {
      console.error(`Error submitting ${type} application:`, error);
    }
  };

  // State for addresses
  const [addresses, setAddresses] = useState([]);

  // Fetch addresses and orders
  const fetchAddresses = async () => {
    try {
      const data = await addressAPI.getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };



  // Address management functions
  const handleAddAddress = async (addressData) => {
    try {
      await addressAPI.addAddress(addressData);
      fetchAddresses(); // Refresh addresses after adding
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleUpdateAddress = async (addressId, addressData) => {
    try {
      await addressAPI.updateAddress(addressId, addressData);
      fetchAddresses(); // Refresh addresses after updating
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await addressAPI.deleteAddress(addressId);
      fetchAddresses(); // Refresh addresses after deleting
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await addressAPI.setDefaultAddress(addressId);
      fetchAddresses(); // Refresh addresses after setting default
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };



  // Fetch data when component mounts
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Favorites state (loaded from server if authenticated, otherwise from localStorage)
  const [favorites, setFavorites] = useState([]);
  const [favoriteDetails, setFavoriteDetails] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Load favorites when user is loaded (try server first, fallback to localStorage)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoadingFavorites(true);
        if (user && (user.id || user._id)) {
          const serverFavs = await fetchServerFavorites();
          if (!mounted) return;
          if (serverFavs && Array.isArray(serverFavs)) {
            const mapped = serverFavs.map(p => (typeof p === 'number' ? { id: p } : p));
            setFavorites(mapped);
            // Save ids locally for offline use
            try { saveFavoritesForUser(user, mapped.map(m => m.id)); } catch (e) { /* ignore */ }
            
            // Fetch details for each favorite item
            const details = await Promise.all(
              mapped.map(async (item) => {
                try {
                  const { data } = await productAPI.getProductById(item.id);
                  return {
                    ...data,
                    id: item.id
                  };
                } catch (e) {
                  console.warn(`Failed to fetch details for product ${item.id}`, e);
                  return item;
                }
              })
            );
            if (mounted) setFavoriteDetails(details.filter(Boolean));
            return;
          }
        }

        const local = loadFavoritesForUser(user);
        if (!mounted) return;
        const mappedLocal = (Array.isArray(local) ? local : []).map(id => (typeof id === 'number' ? { id } : id));
        setFavorites(mappedLocal);
      } catch (e) {
        console.warn('Failed to load favorites', e);
      } finally {
        if (mounted) setLoadingFavorites(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      const arr = e && e.detail ? e.detail : [];
      const mapped = (Array.isArray(arr) ? arr : []).map(id => (typeof id === 'number' ? { id } : id));
      setFavorites(mapped);
    };
    window.addEventListener('favoritesUpdated', handler);
    return () => window.removeEventListener('favoritesUpdated', handler);
  }, []);

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
        dateOfBirth: formatISOToDisplay(userData.dateOfBirth) || '',
        gender: userData.gender || '',
        idNumber: userData.idNumber || '',
        role: userData.role || 'buyer'
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      // Show error message and reset form
      setUser(null);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        idNumber: '',
        role: 'buyer'
      });
    }
  }, []); // No dependencies needed since we're just setting initial state

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
    
    if (name === 'dateOfBirth') {
      // Format input as user types
      const numbersOnly = value.replace(/[^\d]/g, '');
      let formattedDate = numbersOnly;
      
      if (numbersOnly.length > 4) {
        formattedDate = numbersOnly.slice(0,2) + '/' + numbersOnly.slice(2,4) + '/' + numbersOnly.slice(4,8);
      } else if (numbersOnly.length > 2) {
        formattedDate = numbersOnly.slice(0,2) + '/' + numbersOnly.slice(2);
      }
      
      setForm(prev => ({
        ...prev,
        [name]: formattedDate
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      newErrors.phone = 'Số điện thoại phải có 10 chữ số';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    } else if (form.address.trim().length < 10) {
      newErrors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    if (form.dateOfBirth) {
      const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})$/;
      if (!datePattern.test(form.dateOfBirth)) {
        newErrors.dateOfBirth = 'Ngày sinh không hợp lệ (MM/DD/YYYY)';
      } else {
        const [month, day, year] = form.dateOfBirth.split('/').map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        // Check if date is valid
        if (birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
          newErrors.dateOfBirth = 'Ngày không hợp lệ';
        } else if (age < 16) {
          newErrors.dateOfBirth = 'Bạn phải từ 16 tuổi trở lên';
        } else if (birthDate > today) {
          newErrors.dateOfBirth = 'Ngày sinh không thể ở tương lai';
        }
      }
    }

    if (form.idNumber && !/^[0-9]{9,12}$/.test(form.idNumber.trim())) {
      newErrors.idNumber = 'CMND/CCCD phải có 9-12 chữ số';
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
      // Format date to ISO string if exists
      const formData = {
        ...form,
        dateOfBirth: form.dateOfBirth ? formatDateToISO(form.dateOfBirth) : form.dateOfBirth
      };

      console.log('Sending profile update:', formData);
      const response = await authAPI.updateProfile(formData);
      const updatedUser = response.data || response.user;
      
      if (response.errors || (response.data && response.data.errors)) {
        const serverErrors = response.errors || response.data.errors;
        setErrors(prev => ({
          ...prev,
          ...Object.keys(serverErrors).reduce((acc, key) => {
            acc[key] = serverErrors[key].join(', ');
            return acc;
          }, {})
        }));
        throw new Error('Validation failed');
      }
      
      setUser(updatedUser);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error saving profile:', error);
      if (!Object.keys(errors).length) { // Only show alert if no field errors
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin: ' + error.message);
      }
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

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      // Check if user is authenticated before proceeding
      if (!isAuthenticated()) {
        alert('Bạn cần đăng nhập để đổi mật khẩu!');
        return;
      }

      // Show loading state
      setLoading(true);
      
      // Call the API to change password
      const response = await authAPI.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        alert('Mật khẩu đã được thay đổi thành công!');
        setShowChangePasswordModal(false);
      } else {
        alert(response.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
    if (!currentPassword) {
      throw new Error('Vui lòng nhập mật khẩu hiện tại');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    if (currentPassword === newPassword) {
      throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại');
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      alert('Đổi mật khẩu thành công!');
      setShowChangePasswordModal(false);
    } catch (error) {
      // Handle specific error cases
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('current password')) {
        throw new Error('Mật khẩu hiện tại không chính xác');
      } else if (errorMessage.includes('validation')) {
        throw new Error('Mật khẩu mới không hợp lệ. ' + errorMessage);
      } else {
        throw new Error('Có lỗi xảy ra khi đổi mật khẩu: ' + errorMessage);
      }
    }
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
      const backendUrl = process.env.REACT_APP_ORDER_URL || 'http://localhost:8080';
      const url = `${backendUrl}/${profileImage}?t=${Date.now()}`;
      console.log('✅ Uploads path detected, creating full URL with cache busting:', url);
      return url;
    }
    
    // If it's just a filename, construct the full URL with cache busting
    const backendUrl = process.env.REACT_APP_ORDER_URL || 'http://localhost:8080';
    const url = `${backendUrl}/uploads/profile-images/${profileImage}?t=${Date.now()}`;
    console.log('✅ Filename detected, creating full URL with cache busting:', url);
    return url;
  };

  const renderApplicationsTab = () => (
    <div className="applications-tab">
      <h3>Become a Partner</h3>
      <div className="applications-container">
        {/* Seller Application */}
        <div className="application-card seller-card">
          <div className="card-header">
            <h4>🏪 Become a Seller</h4>
            <span className="card-badge">Business</span>
          </div>
          <div className="card-content">
            <p>Start selling your products and reach thousands of customers.</p>
            <ul className="benefits-list">
              <li>✅ Create and manage your shop</li>
              <li>✅ List your products</li>
              <li>✅ Set your own prices</li>
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
            <span className={`status-value ${applicationStatus.seller}`}>
              {applicationStatus.seller.replace('-', ' ')}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Shipper Application:</span>
            <span className={`status-value ${applicationStatus.shipper}`}>
              {applicationStatus.shipper.replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

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
              type="text"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleInputChange}
              placeholder="MM/DD/YYYY"
              className={errors.dateOfBirth ? 'error' : ''}
              maxLength="10"
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
            <button className="change-password-btn" onClick={() => setShowChangePasswordModal(true)}>
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
        <button 
          className="add-btn" 
          onClick={() => handleAddAddress({
            label: 'New Address',
            address: '',
            isDefault: addresses.length === 0
          })}
        >
          Add New Address
        </button>
      </div>
      
      <div className="addresses-list">
        {addresses.map(address => (
          <div key={address.id} className="address-card">
            <div className="address-header">
              <span className="address-label">{address.label}</span>
              {address.isDefault && <span className="default-badge">Default</span>}
            </div>
            <div className="address-text">{address.address}</div>
            <div className="address-actions">
              <button 
                className="edit-address-btn" 
                onClick={() => handleUpdateAddress(address.id, address)}
              >
                Edit
              </button>
              <button 
                className="delete-address-btn"
                onClick={() => handleDeleteAddress(address.id)}
              >
                Delete
              </button>
              {!address.isDefault && (
                <button 
                  className="set-default-btn"
                  onClick={() => handleSetDefaultAddress(address.id)}
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Orders tab removed as it's now handled by separate component

  // Remove favorite handler (optimistic)
    const handleAddToCart = (item) => {
    // Dispatch event to cart context
    const event = new CustomEvent('addToCart', { 
      detail: { 
        productId: item.id,
        quantity: 1
      }
    });
    window.dispatchEvent(event);
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      // update local state
      const updated = favorites.filter(f => f.id !== productId);
      const updatedDetails = favoriteDetails.filter(f => f.id !== productId);
      setFavorites(updated);
      setFavoriteDetails(updatedDetails);
      
      // update localStorage
      try {
        saveFavoritesForUser(user, updated.map(f => f.id));
      } catch (e) {
        console.warn('Failed to update localStorage', e);
      }
      
      // request server removal if logged in
      if (user && (user.id || user._id)) {
        await removeServerFavorite(productId);
      }
    } catch (e) {
      console.warn('Failed to remove favorite', e);
    }
  };

  const renderFavoritesTab = () => (
    <div>
      <div className="tab-header">
        <h3>Món ăn yêu thích</h3>
      </div>
      
      <div className="favorites-container">
        {loadingFavorites ? (
          <div className="loading-favorites">
            <span>Đang tải danh sách món ăn yêu thích...</span>
          </div>
        ) : (
          <FavoriteItems 
            items={favoriteDetails}
            onRemove={handleRemoveFavorite}
            onAddToCart={handleAddToCart}
          />
        )}
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
};

export default CustomerProfile;