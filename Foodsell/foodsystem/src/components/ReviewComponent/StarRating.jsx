import React from 'react';
import './StarRating.css';

const StarRating = ({ rating = 0, onRatingChange, readOnly = false, size = 'medium' }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleStarClick = (starRating) => {
    if (!readOnly && onRatingChange) onRatingChange(starRating);
  };
  const handleStarHover = (starRating) => { if (!readOnly) setHoverRating(starRating); };
  const handleStarLeave = () => { if (!readOnly) setHoverRating(0); };

  const renderStar = (index) => {
    const starValue = index + 1;

    if (readOnly) {
      const full = Math.floor(rating || 0);
      const fraction = (Number(rating) || 0) - full;
      const isFull = index < full;
      const isHalf = !isFull && index === full && fraction >= 0.25 && fraction < 0.75;
      const cls = isFull ? 'filled' : (isHalf ? 'half' : 'empty');
      return (
        <span key={index} className={`star ${cls} ${size}`}>{'\u2605'}</span>
      );
    }

    const isFilled = starValue <= (hoverRating || rating);
    return (
      <span
        key={index}
        className={`star ${isFilled ? 'filled' : 'empty'} ${size} clickable`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        onMouseLeave={handleStarLeave}
      >
        {'\u2605'}
      </span>
    );
  };

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => renderStar(index))}
      {!readOnly && (
        <span className="rating-text">{hoverRating || rating || 0}/5</span>
      )}
    </div>
  );
};

export default StarRating;

