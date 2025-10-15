import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewAPI } from '../api/review';

export const reviewKeys = {
  all: ['reviews'],
  byProduct: (productId) => [...reviewKeys.all, 'product', productId],
  mine: () => [...reviewKeys.all, 'me'],
};

export const useProductReviews = (productId, params) => {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId),
    queryFn: () => reviewAPI.getReviewsByProduct(productId, params),
    enabled: !!productId,
  });
};

export const useMyReviews = (params) => {
  return useQuery({
    queryKey: reviewKeys.mine(),
    queryFn: () => reviewAPI.getMyReviews(params),
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewAPI.createReview,
    onSuccess: (data, variables) => {
      if (variables?.productId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.byProduct(variables.productId) });
      }
    }
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, payload }) => reviewAPI.updateReview(reviewId, payload),
    onSuccess: (_data, variables) => {
      const productId = variables?.payload?.productId;
      if (productId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
      } else {
        queryClient.invalidateQueries({ queryKey: reviewKeys.mine() });
      }
    }
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewAPI.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    }
  });
};



