import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../api/auth';

// Query keys
export const authKeys = {
  all: ['auth'],
  profile: () => [...authKeys.all, 'profile'],
  users: () => [...authKeys.all, 'users'],
};

// Auth queries
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authAPI.getProfile,
    enabled: !!authAPI.getAuthToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: authAPI.getAllUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Auth mutations
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      // Update profile cache
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authAPI.uploadAvatar,
    onSuccess: (data) => {
      // Update profile cache
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authAPI.removeAvatar,
    onSuccess: (data) => {
      // Update profile cache
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authAPI.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ resetToken, newPassword }) => 
      authAPI.resetPassword(resetToken, newPassword),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authAPI.changePassword,
  });
};
