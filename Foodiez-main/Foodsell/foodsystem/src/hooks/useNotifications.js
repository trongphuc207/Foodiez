import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../api/notification';

export const notificationKeys = {
  all: ['notifications'],
  mine: () => [...notificationKeys.all, 'me'],
  unreadCount: () => [...notificationKeys.all, 'unreadCount'],
};

export const useMyNotifications = (params) => {
  return useQuery({
    queryKey: notificationKeys.mine(),
    queryFn: () => notificationAPI.getMyNotifications(params),
    staleTime: 30 * 1000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.mine() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    }
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.mine() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    }
  });
};





