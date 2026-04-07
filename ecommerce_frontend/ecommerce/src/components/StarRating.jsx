export default function StarRating({ rating, count }) {
  return (
    <div className="product-card-rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>
        ))}
      </div>
      <span>{rating?.toFixed(1)}</span>
      {count != null && <span>({count})</span>}
    </div>
  );
}
