import React, { useEffect, useState } from 'react';
import { fetchServerFavorites, removeServerFavorite } from '../../utils/favorites';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await fetchServerFavorites();
      if (data) {
        setFavorites(data);
      }
    } catch (err) {
      setError('Failed to load favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      const success = await removeServerFavorite(productId);
      if (success) {
        setFavorites(favorites.filter(f => f.id !== productId));
      }
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (loading) return <div className="favorites-loading">Loading favorites...</div>;
  if (error) return <div className="favorites-error">{error}</div>;
  if (favorites.length === 0) return <div className="favorites-empty">No favorite items yet</div>;

  return (
    <div className="favorites-container">
      <h2>Favorite Items</h2>
      <div className="favorites-grid">
        {favorites.map(product => (
          <div key={product.id} className="favorite-item">
            <div className="favorite-image">
              <img src={product.imageUrl} alt={product.name} />
              <button 
                className="remove-favorite"
                onClick={() => handleRemoveFavorite(product.id)}
                title="Remove from favorites"
              >
                <i className="bi bi-heart-fill"></i>
              </button>
            </div>
            <div className="favorite-details">
              <h3>{product.name}</h3>
              <p className="favorite-description">{product.description}</p>
              <div className="favorite-meta">
                <span className="price">${product.price.toFixed(2)}</span>
                <span className="shop-name">{product.shopName}</span>
              </div>
              <button className="add-to-cart">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;