import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = () => {
    api.get('/wishlist')
      .then(res => setWishlist(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await addToCart(productId);
      await api.delete(`/wishlist/${productId}`);
      toast.success('Moved to cart!');
      fetchWishlist();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>Loading wishlist...</span></div>;

  if (wishlist.length === 0) {
    return (
      <div className="empty-state page">
        <Heart size={64} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
        <h2>Your wishlist is empty</h2>
        <p>Save items you love and come back to them later</p>
        <Link to="/" className="btn btn-primary btn-lg">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="section-title">My Wishlist <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 400 }}>({wishlist.length} items)</span></h1>
      <div className="wishlist-grid">
        {wishlist.map(item => {
          const p = item.product;
          const imgSrc = p?.image?.startsWith('http') ? p.image : `http://localhost:8080${p?.image}`;
          return (
            <div key={item.id} className="product-card">
              <Link to={`/product/${p?.id}`} className="product-card-img-wrap">
                <img src={imgSrc} alt={p?.name} loading="lazy" />
              </Link>
              <div className="product-card-body">
                <div className="product-card-cat">{p?.category}</div>
                <Link to={`/product/${p?.id}`} className="product-card-name">{p?.name}</Link>
                {p?.rating != null && <StarRating rating={p.rating} />}
                <div className="product-card-price-row">
                  <span className="product-card-price">${p?.price?.toFixed(2)}</span>
                </div>
              </div>
              <div className="product-card-footer">
                <button className="btn btn-primary" onClick={() => handleMoveToCart(p?.id)}>
                  <ShoppingCart size={14} /> Move to Cart
                </button>
                <button className="btn btn-icon" onClick={() => handleRemove(p?.id)} title="Remove">
                  <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
