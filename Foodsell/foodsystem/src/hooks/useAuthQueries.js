import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, setAuthToken, getAuthToken } from '../api/auth';

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
    enabled: !!getAuthToken(),
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
      // Set token and user data
      setAuthToken(data.token);
      // Invalidate and refetch profile to update UI immediately
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      // Force refetch profile data
      queryClient.refetchQueries({ queryKey: authKeys.profile() });
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('authSuccess', { detail: data }));
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      // Set token and user data
      setAuthToken(data.token);
      // Invalidate and refetch profile to update UI immediately
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      // Force refetch profile data
      queryClient.refetchQueries({ queryKey: authKeys.profile() });
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('authSuccess', { detail: data }));
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

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authAPI.verifyOTP,
    onSuccess: (data) => {
      // Set token and user data
      setAuthToken(data.token);
      // Invalidate and refetch profile to update UI immediately
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      // Force refetch profile data
      queryClient.refetchQueries({ queryKey: authKeys.profile() });
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('authSuccess', { detail: data }));
    },
  });
};

export const useSendOTP = () => {
  return useMutation({
    mutationFn: authAPI.sendOTP,
  });
};