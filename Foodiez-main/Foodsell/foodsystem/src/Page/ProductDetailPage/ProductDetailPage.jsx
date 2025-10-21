import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../../api/product';
import { useProductReviews, useCreateReview, useDeleteReview } from '../../hooks/useReviews';
import ReviewList from '../../components/ReviewComponent/ReviewList';
import ReviewForm from '../../components/ReviewComponent/ReviewForm';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = useMemo(() => Number(id), [id]);
  const [editingReview, setEditingReview] = useState(null);

  const { data: productData, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productAPI.getProductById(productId),
    enabled: !!productId,
  });

  const { data: reviewData, isLoading: reviewLoading, error: reviewError } = useProductReviews(productId, { page: 0, size: 20 });
  const createReview = useCreateReview();
  const deleteReview = useDeleteReview();

  const product = productData?.data || productData || null;
  const reviews = reviewData?.data || reviewData?.reviews || [];

  const handleSubmitReview = (payload) => {
    if (editingReview) {
      // Update existing review
      createReview.mutate({ 
        reviewId: editingReview.id, 
        ...payload,
        isUpdate: true 
      });
      setEditingReview(null);
      return;
    }
    createReview.mutate({ 
      productId, 
      shopId: product?.shopId || 1, // Default shop ID
      ...payload 
    });
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      deleteReview.mutate(reviewId);
    }
  };

  const handleReplyToReview = (reviewId, replyText) => {
    // Implement reply to review API call
    createReview.mutate({ 
      reviewId, 
      content: replyText,
      isReply: true 
    });
  };

  if (productLoading) return <div className="product-detail">Đang tải sản phẩm...</div>;
  if (productError) return <div className="product-detail">Không tải được sản phẩm</div>;

  return (
    <div className="product-detail">
      {product && (
        <div className="product-card">
          <div className="product-media">
            {product.imageUrl || product.image_url || product.image ? (
              <img src={product.imageUrl || product.image_url || product.image} alt={product.name} />
            ) : (
              <div className="placeholder" />
            )}
          </div>
          <div className="product-info">
            <h2>{product.name}</h2>
            <div className="price">{product.price?.toLocaleString()} ₫</div>
            {product.description && <p className="desc">{product.description}</p>}
          </div>
        </div>
      )}

      <section className="product-reviews">
        <h3>Đánh giá sản phẩm</h3>
        <ReviewForm 
          initialValue={editingReview} 
          onSubmit={handleSubmitReview} 
          submitting={createReview.isLoading}
          productId={productId}
          shopId={product?.shopId}
        />
        {reviewLoading ? (
          <div className="loading-reviews">Đang tải đánh giá...</div>
        ) : reviewError ? (
          <div className="error-reviews">Lỗi tải đánh giá</div>
        ) : (
          <ReviewList 
            reviews={reviews} 
            onDelete={handleDeleteReview} 
            onEdit={setEditingReview}
            onReply={handleReplyToReview}
          />
        )}
      </section>
    </div>
  );
}








