const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Helper functions
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user?.id || '1';
};

const getUserName = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user?.fullName || user?.name || 'Người dùng';
};

const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'User-Id': getUserId(),
    'User-Name': getUserName()
  };
};

// Complaint API functions
export const complaintAPI = {
  // Tạo khiếu nại mới
  createComplaint: async (reviewId, complaintData) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/complaint`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(complaintData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create complaint');
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Lấy tất cả khiếu nại (Admin)
  getAllComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/complaints`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaints');
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Lấy khiếu nại chưa xử lý
  getUnresolvedComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/complaints/unresolved`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch unresolved complaints');
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Lấy khiếu nại theo trạng thái
  getComplaintsByStatus: async (status) => {
    const response = await fetch(`${API_BASE_URL}/reviews/complaints/status/${status}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaints by status');
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Lấy khiếu nại theo review ID
  getComplaintsByReviewId: async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/complaints`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaints by review');
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Lấy khiếu nại của user
  getMyComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/complaints/my-complaints`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch my complaints');
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Giải quyết khiếu nại (Admin)
  resolveComplaint: async (complaintId, resolutionData) => {
    const response = await fetch(`${API_BASE_URL}/reviews/complaints/${complaintId}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(resolutionData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to resolve complaint');
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Cập nhật trạng thái khiếu nại
  updateComplaintStatus: async (complaintId, status) => {
    const response = await fetch(`${API_BASE_URL}/reviews/complaints/${complaintId}/status?status=${status}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to update complaint status');
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Xóa khiếu nại (Admin)
  deleteComplaint: async (complaintId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/complaints/${complaintId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete complaint');
    }
    
    const result = await response.json();
    return result;
  },

  // Tìm kiếm khiếu nại
  searchComplaints: async (keyword) => {
    const response = await fetch(`${API_BASE_URL}/reviews/complaints/search?keyword=${encodeURIComponent(keyword)}`);
    
    if (!response.ok) {
      throw new Error('Failed to search complaints');
    }
    
    const result = await response.json();
    return result.data || result;
  },

  // Lấy thống kê khiếu nại
  getComplaintStats: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/complaints/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaint stats');
    }
    
    const result = await response.json();
    return result.data || result;
  }
};

export default complaintAPI;
