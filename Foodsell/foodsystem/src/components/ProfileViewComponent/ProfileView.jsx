import React, { useState, useEffect } from 'react';
import './ProfileView.css';

import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const ProfileView = ({ onClose, user = null }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    birthday: '',
    address: '',
    phone: '',
    avatar: ''
  });
  const [errors, setErrors] = useState({});

  // Mock user data - replace with actual user data from props or context
  const mockUser = {
    username: 'john_doe',
    email: 'john.doe@example.com',
    birthday: '1990-05-15',
    address: '123 Main Street, City, State',
    phone: '+1 234 567 8900',
    avatar: '',
    joinDate: '2023-01-15'
  };

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        password: '',
        birthday: user.birthday || '',
        address: user.address || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    } else {
      setForm({
        username: mockUser.username,
        email: mockUser.email,
        password: '',
        birthday: mockUser.birthday,
        address: mockUser.address,
        phone: mockUser.phone,
        avatar: mockUser.avatar
      });
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const err = {};
    if (!form.username.trim()) err.username = 'Username is required';
    if (!form.email.trim()) err.email = 'Email is required';
    if (isEditing && form.password && form.password.length < 6) err.password = 'Min 6 characters';
    if (!form.birthday) err.birthday = 'Birthday is required';
    if (!form.address.trim()) err.address = 'Address is required';
    if (!form.phone.trim()) err.phone = 'Phone is required';
    return err;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    console.log('Profile update payload:', form);
    setIsEditing(false);
    // Here you would typically make an API call to update the profile
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form to original values
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        password: '',
        birthday: user.birthday || '',
        address: user.address || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    } else {
      setForm({
        username: mockUser.username,
        email: mockUser.email,
        password: '',
        birthday: mockUser.birthday,
        address: mockUser.address,
        phone: mockUser.phone,
        avatar: mockUser.avatar
      });
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Here you would typically handle logout logic
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Delete account clicked');
      // Here you would typically make an API call to delete the account
    }
  };

  const currentUser = user || mockUser;

  return (
    <div className="profile-card">
      {/* Close button */}
      {onClose && (
        <button className="profile-close" onClick={onClose} aria-label="Close">×</button>
      )}

      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt="Profile" />
          ) : (
            <div className="profile-avatar-placeholder">
              <img src={user_icon} alt="user" />
            </div>
          )}
        </div>
        <div className="profile-title">Profile</div>
        <div className="profile-underline"></div>
      </div>

      {/* Profile Information */}
      <div className="profile-content">
        {isEditing ? (
          <form onSubmit={handleSave} noValidate>
            <div className="profile-inputs">
              <div className={`profile-input ${errors.username ? 'is-error' : ''}`}>
                <img src={user_icon} alt="user" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={onChange}
                />
              </div>
              {errors.username && <div className="profile-field-error">{errors.username}</div>}

              <div className={`profile-input ${errors.email ? 'is-error' : ''}`}>
                <img src={email_icon} alt="email" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={onChange}
                />
              </div>
              {errors.email && <div className="profile-field-error">{errors.email}</div>}

              <div className={`profile-input ${errors.password ? 'is-error' : ''}`}>
                <img src={password_icon} alt="password" />
                <input
                  type="password"
                  name="password"
                  placeholder="New Password (leave blank to keep current)"
                  value={form.password}
                  onChange={onChange}
                />
              </div>
              {errors.password && <div className="profile-field-error">{errors.password}</div>}

              <div className={`profile-input ${errors.birthday ? 'is-error' : ''}`}>
                <span className="profile-icon">📅</span>
                <input
                  type="date"
                  name="birthday"
                  value={form.birthday}
                  onChange={onChange}
                />
              </div>
              {errors.birthday && <div className="profile-field-error">{errors.birthday}</div>}

              <div className={`profile-input ${errors.phone ? 'is-error' : ''}`}>
                <span className="profile-icon">📞</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={onChange}
                />
              </div>
              {errors.phone && <div className="profile-field-error">{errors.phone}</div>}

              <div className={`profile-input ${errors.address ? 'is-error' : ''}`}>
                <span className="profile-icon">🏠</span>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  onChange={onChange}
                />
              </div>
              {errors.address && <div className="profile-field-error">{errors.address}</div>}
            </div>

            <div className="profile-actions">
              <button type="button" className="profile-cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="profile-save-btn">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-info-item">
              <span className="profile-label">Username:</span>
              <span className="profile-value">{currentUser.username}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{currentUser.email}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-label">Birthday:</span>
              <span className="profile-value">{new Date(currentUser.birthday).toLocaleDateString()}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-label">Phone:</span>
              <span className="profile-value">{currentUser.phone}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-label">Address:</span>
              <span className="profile-value">{currentUser.address}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-label">Member Since:</span>
              <span className="profile-value">{new Date(currentUser.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isEditing && (
        <div className="profile-buttons">
          <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
          <button className="profile-logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <button className="profile-delete-btn" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
