import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const originalPrice = (product.price * 1.25).toFixed(2);
  const discount = 20;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { toast.error('Please login to add items to cart'); return; }
    setAdding(true);
    try {
      await addToCart(product.id);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally { setAdding(false); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { toast.error('Please login first'); return; }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${product.id}`);
        setWishlisted(true);
        toast.success('Added to wishlist!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Already in wishlist');
    }
  };

  const stars = Math.round(product.rating || 0);

  return (
    <div className="pc">
      <Link to={`/product/${product.id}`} className="pc-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" className="pc-img" />

        {/* Discount badge */}
        <div className="pc-discount-badge">{discount}% OFF</div>

        {/* Wishlist */}
        <button className={`pc-wish ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} title="Wishlist">
          <Heart size={16} fill={wishlisted ? '#ef4444' : 'none'} />
        </button>

        {/* Quick add overlay */}
        <div className="pc-overlay">
          <button className="pc-add-btn" onClick={handleAddToCart} disabled={adding}>
            <ShoppingCart size={15} />
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </Link>

      <div className="pc-body">
        <div className="pc-brand">{product.category}</div>
        <Link to={`/product/${product.id}`} className="pc-name">{product.name}</Link>

        {/* Rating */}
        <div className="pc-rating">
          <div className="pc-stars">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`pc-star ${s <= stars ? 'on' : ''}`}>★</span>
            ))}
          </div>
          <span className="pc-rating-num">{product.rating?.toFixed(1)}</span>
          <span className="pc-rating-count">({product.ratingCount})</span>
        </div>

        {/* Price */}
        <div className="pc-price-row">
          <span className="pc-price">${product.price?.toFixed(2)}</span>
          <span className="pc-original">${originalPrice}</span>
          <span className="pc-off">{discount}% off</span>
        </div>

        {/* Free delivery tag */}
        <div className="pc-delivery">🚚 Free Delivery</div>
      </div>
    </div>
  );
}
