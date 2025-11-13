const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to handle API errors
const handleApiError = async (response, defaultMessage) => {
  const status = response.status;
  try {
    const errorData = await response.json();
    console.log('🔍 API Error Response:', { status, errorData });
    
    // Handle 401 Unauthorized
    if (status === 401) {
      const errorMsg = errorData.error || errorData.message || '';
      
      // Check for "No token provided"
      if (errorMsg.includes('No token provided') || errorMsg.includes('token') || errorMsg.includes('Unauthorized')) {
        console.log('🔍 Token issue detected, checking localStorage...');
        const currentToken = localStorage.getItem('authToken');
        console.log('🔍 Current token in localStorage:', currentToken ? `Exists (${currentToken.length} chars)` : 'NULL');
        
        if (!currentToken) {
          throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
        }
        
        // Token exists but server rejects it
        localStorage.removeItem('authToken');
        throw new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      // Check if user is banned
      if (errorMsg.includes('banned') || errorMsg.includes('bị cấm') || errorMsg.includes('ban')) {
        localStorage.removeItem('authToken');
        throw new Error('Tài khoản của bạn đã bị cấm. Vui lòng liên hệ admin để biết thêm chi tiết.');
      }
      
      // Generic token error
      localStorage.removeItem('authToken');
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    // Handle 403 Forbidden
    if (status === 403) {
      throw new Error('Bạn không có quyền thực hiện hành động này. Tài khoản có thể đã bị hạn chế.');
    }
    
    // Return custom error message from server
    throw new Error(errorData.message || errorData.error || defaultMessage);
  } catch (e) {
    // If error already thrown or JSON parsing failed
    if (e.message.includes('đăng nhập') || 
        e.message.includes('bị cấm') || 
        e.message.includes('không có quyền') ||
        e.message.includes('chưa đăng nhập')) {
      throw e;
    }
    throw new Error(`${defaultMessage}: ${status} - ${response.statusText}`);
  }
};

export const complaintAPI = {
  // User endpoints
  
  // Create new complaint
  createComplaint: async (complaintData) => {
    const token = getAuthToken();
    
    console.log('🔍 CreateComplaint - Debug Info:');
    console.log('  - Token exists:', token ? 'YES' : 'NO');
    console.log('  - Token length:', token?.length || 0);
    console.log('  - Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('  - LocalStorage keys:', Object.keys(localStorage));
    
    if (!token || token.trim() === '') {
      console.warn('⚠️ No token found - checking for banned user scenario');
      
      // Try to get user info from localStorage (for banned users)
      const userInfoStr = localStorage.getItem('user');
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          console.log('📋 User info found - using banned-user endpoint:', { id: userInfo.id });
          
          // Use banned-user endpoint (no auth required)
          const bannedUserData = {
            ...complaintData,
            complainantId: userInfo.id,
            complainantType: 'user',
            category: complaintData.category || 'account_ban',
            priority: 'high'
          };
          
          const response = await fetch(`${API_BASE_URL}/complaints/banned-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bannedUserData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể gửi khiếu nại');
          }
          
          const result = await response.json();
          console.log('✅ Complaint created via banned-user endpoint');
          return result;
        } catch (error) {
          console.error('❌ Error with banned-user endpoint:', error);
          throw error;
        }
      }
      
      // No user info at all - need to login
      console.error('❌ No token or user info found');
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để gửi khiếu nại.');
    }
    
    try {
      console.log('📤 Sending complaint request...');
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(complaintData),
      });
      
      console.log('� Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        await handleApiError(response, 'Lỗi khi tạo khiếu nại');
      }
      
      const result = await response.json();
      console.log('✅ Complaint created successfully');
      return result;
    } catch (error) {
      console.error('❌ CreateComplaint - Error:', error);
      throw error;
    }
  },

  // Get my complaints
  getMyComplaints: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/complaints/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      await handleApiError(response, 'Không thể tải danh sách khiếu nại');
    }
    
    return response.json();
  },

  // Get complaints against me
  getComplaintsAgainstMe: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/complaints/against-me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch complaints');
    }
    
    return response.json();
  },

  // Get complaint detail
  getComplaintDetail: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch complaint detail');
    }
    
    return response.json();
  },

  // Add response to complaint
  addResponse: async (id, message) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/complaints/${id}/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'Không thể thêm phản hồi');
    }
    
    return response.json();
  },

  // Upload image
  uploadImage: async (id, file, imageType, description) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    if (imageType) formData.append('imageType', imageType);
    if (description) formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/complaints/${id}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }
    
    return response.json();
  },

  // Delete complaint
  deleteComplaint: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete complaint');
    }
    
    return response.json();
  },

  // Search complaints
  searchComplaints: async (keyword) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/complaints/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search complaints');
    }
    
    return response.json();
  },

  // Admin endpoints

  // Get all complaints (admin)
  adminGetAllComplaints: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/complaints`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch complaints');
    }
    
    return response.json();
  },

  // Get pending complaints (admin)
  adminGetPendingComplaints: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/complaints/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch pending complaints');
    }
    
    return response.json();
  },

  // Get complaint detail (admin)
  adminGetComplaintDetail: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch complaint detail');
    }
    
    return response.json();
  },

  // Assign complaint (admin)
  adminAssignComplaint: async (id, adminId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ adminId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to assign complaint');
    }
    
    return response.json();
  },

  // Update status (admin)
  adminUpdateStatus: async (id, status) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update status');
    }
    
    return response.json();
  },

  // Make decision (admin)
  adminMakeDecision: async (id, decision, reason, adminNote) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ decision, reason, adminNote }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to make decision');
    }
    
    return response.json();
  },

  // Add internal note (admin)
  adminAddInternalNote: async (id, note) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}/note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ note }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add note');
    }
    
    return response.json();
  },

  // Get statistics (admin)
  adminGetStatistics: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/complaints/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch statistics');
    }
    
    return response.json();
  },
};
