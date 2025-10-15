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
      // Optional: implement update flow if backend supports editing user's own review
      // Skipping for now to match minimal requirements
      setEditingReview(null);
      return;
    }
    createReview.mutate({ productId, ...payload });
  };

  const handleDeleteReview = (reviewId) => {
    deleteReview.mutate(reviewId);
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
        <h3>Đánh giá</h3>
        <ReviewForm initialValue={editingReview} onSubmit={handleSubmitReview} submitting={createReview.isLoading} />
        {reviewLoading ? (
          <div>Đang tải đánh giá...</div>
        ) : reviewError ? (
          <div>Lỗi tải đánh giá</div>
        ) : (
          <ReviewList reviews={reviews} onDelete={handleDeleteReview} onEdit={setEditingReview} />
        )}
      </section>
    </div>
  );
}





