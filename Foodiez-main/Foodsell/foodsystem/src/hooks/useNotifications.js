import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../api/notification';

export const notificationKeys = {
  all: ['notifications'],
  mine: () => [...notificationKeys.all, 'me'],
  user: (userId) => [...notificationKeys.all, 'user', userId],
  role: (userRole) => [...notificationKeys.all, 'role', userRole],
  userType: (userId, type) => [...notificationKeys.all, 'user', userId, 'type', type],
  roleType: (userRole, type) => [...notificationKeys.all, 'role', userRole, 'type', type],
  unreadCount: (userId) => [...notificationKeys.all, 'unreadCount', userId],
  unreadCountByRole: (userRole) => [...notificationKeys.all, 'unreadCount', 'role', userRole],
  admin: {
    log: () => [...notificationKeys.all, 'admin', 'log'],
  },
};

// ========== USER NOTIFICATIONS ==========

export const useMyNotifications = (params) => {
  return useQuery({
    queryKey: notificationKeys.mine(),
    queryFn: () => notificationAPI.getMyNotifications(params),
    staleTime: 30 * 1000,
  });
};

export const useUserNotifications = (userId) => {
  return useQuery({
    queryKey: notificationKeys.user(userId),
    queryFn: () => notificationAPI.getUserNotifications(userId),
    staleTime: 30 * 1000,
    enabled: !!userId,
  });
};

export const useNotificationsByRole = (userRole) => {
  return useQuery({
    queryKey: notificationKeys.role(userRole),
    queryFn: () => notificationAPI.getNotificationsByRole(userRole),
    staleTime: 30 * 1000,
    enabled: !!userRole,
  });
};

export const useNotificationsByUserAndType = (userId, type) => {
  return useQuery({
    queryKey: notificationKeys.userType(userId, type),
    queryFn: () => notificationAPI.getNotificationsByUserAndType(userId, type),
    staleTime: 30 * 1000,
    enabled: !!userId && !!type,
  });
};

export const useNotificationsByRoleAndType = (userRole, type) => {
  return useQuery({
    queryKey: notificationKeys.roleType(userRole, type),
    queryFn: () => notificationAPI.getNotificationsByRoleAndType(userRole, type),
    staleTime: 30 * 1000,
    enabled: !!userRole && !!type,
  });
};

// ========== UNREAD COUNTS ==========

export const useUnreadCount = (userId) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId),
    queryFn: () => notificationAPI.getUnreadCount(userId),
    staleTime: 10 * 1000,
    enabled: !!userId,
  });
};

export const useUnreadCountByRole = (userRole) => {
  return useQuery({
    queryKey: notificationKeys.unreadCountByRole(userRole),
    queryFn: () => notificationAPI.getUnreadCountByRole(userRole),
    staleTime: 10 * 1000,
    enabled: !!userRole,
  });
};

// ========== NOTIFICATION ACTIONS ==========

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};

export const useMarkAllAsRead = (userId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};

export const useMarkAllAsReadByRole = (userRole) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllAsReadByRole(userRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};

// ========== ADMIN NOTIFICATION MANAGEMENT ==========

export const useNotificationLog = () => {
  return useQuery({
    queryKey: notificationKeys.admin.log(),
    queryFn: notificationAPI.getNotificationLog,
    staleTime: 30 * 1000,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notification }) => notificationAPI.updateNotification(id, notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};

// ========== NOTIFICATION CREATION HELPERS ==========

export const useCreateOrderNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, userRole, orderStatus, orderId }) => 
      notificationAPI.createOrderNotification(userId, userRole, orderStatus, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};

export const useCreatePromotionNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, userRole, promotionTitle }) => 
      notificationAPI.createPromotionNotification(userId, userRole, promotionTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};

export const useCreateDeliveryNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, userRole, deliveryStatus, orderId }) => 
      notificationAPI.createDeliveryNotification(userId, userRole, deliveryStatus, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};

export const useCreateSystemNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, userRole, title, message }) => 
      notificationAPI.createSystemNotification(userId, userRole, title, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
};








