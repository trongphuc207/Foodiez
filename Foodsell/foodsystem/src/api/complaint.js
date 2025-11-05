const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('authToken');

export const complaintAPI = {
  // User endpoints
  
  // Create new complaint
  createComplaint: async (complaintData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(complaintData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create complaint');
    }
    
    return response.json();
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
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch complaints');
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
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add response');
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
