import React from 'react';
import './StarRating.css';

const StarRating = ({ rating, onRatingChange, readOnly = false, size = 'medium' }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleStarClick = (starRating) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating) => {
    if (!readOnly) {
      setHoverRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const renderStar = (index) => {
    const starRating = index + 1;
    const isFilled = starRating <= (hoverRating || rating);
    
    return (
      <span
        key={index}
        className={`star ${isFilled ? 'filled' : 'empty'} ${size} ${!readOnly ? 'clickable' : ''}`}
        onClick={() => handleStarClick(starRating)}
        onMouseEnter={() => handleStarHover(starRating)}
        onMouseLeave={handleStarLeave}
      >
        ★
      </span>
    );
  };

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => renderStar(index))}
      {!readOnly && (
        <span className="rating-text">
          {hoverRating || rating || 0}/5
        </span>
      )}
    </div>
  );
};

export default StarRating;
