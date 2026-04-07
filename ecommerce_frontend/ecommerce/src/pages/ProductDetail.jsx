import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronRight, Shield, Truck, RotateCcw } from 'lucide-react';
import { getProduct, getByCategory, normalize } from '../api/fakestore';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    setLoading(true);
    setQty(1);
    // Fetch from backend (which has the correct DB id)
    getProduct(id)
      .then(r => {
        const p = normalize(r.data);
        setProduct(p);
        return getByCategory(p.category);
      })
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : [];
        setRelated(list.map(normalize).filter(p => String(p.id) !== String(id)).slice(0, 4));
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await addToCart(product.id, qty);
      toast.success(`${qty} item(s) added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await addToCart(product.id, qty);
      navigate('/cart');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed');
    }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await api.post(`/wishlist/${product.id}`);
      toast.success('Added to wishlist!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Already in wishlist');
    }
  };

  if (loading) return (
    <div className="loading-wrap" style={{ minHeight: '60vh' }}>
      <div className="spinner" /><span>Loading product...</span>
    </div>
  );
  if (!product) return (
    <div className="empty-state page">
      <h2>Product not found</h2>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );

  const originalPrice = (product.price * 1.2).toFixed(2);

  return (
    <div className="detail-page">
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={13} className="breadcrumb-sep" />
        <Link to={`/?cat=${product.category}`}>{product.category}</Link>
        <ChevronRight size={13} className="breadcrumb-sep" />
        <span style={{ color: 'var(--text)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </span>
      </nav>

      <div className="detail-grid">
        <div className="detail-img-col">
          <div className="detail-img-main">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        <div className="detail-info">
          <div className="detail-cat">{product.category}</div>
          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-rating-row">
            <StarRating rating={product.rating} />
            <span className="detail-rating-score">{product.rating?.toFixed(1)}</span>
            <span className="detail-rating-count">{product.ratingCount} reviews</span>
            <span className="badge badge-success">Verified</span>
          </div>

          <div className="detail-divider" />

          <div className="detail-price-row">
            <span className="detail-price">${product.price?.toFixed(2)}</span>
            <span className="detail-original">${originalPrice}</span>
            <span className="detail-discount">17% OFF</span>
          </div>

          <div className="detail-divider" />

          <p className="detail-desc">{product.description}</p>

          <div className={`detail-stock ${product.stock > 0 ? 'in' : 'out'}`}>
            {product.stock > 0 ? '✓ In Stock — Ready to ship' : '✗ Out of Stock'}
          </div>

          <div className="qty-row">
            <span className="qty-label">Quantity:</span>
            <div className="qty-ctrl">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>+</button>
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0}>
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button className="btn btn-accent btn-lg" onClick={handleBuyNow} disabled={product.stock === 0}>
              Buy Now
            </button>
            <button className="btn btn-outline" onClick={handleWishlist} title="Add to wishlist">
              <Heart size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '.5rem' }}>
            {[[<Truck size={15} />, 'Free Shipping'], [<Shield size={15} />, 'Secure Payment'], [<RotateCcw size={15} />, '30-Day Return']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.8rem', color: 'var(--muted)' }}>
                <span style={{ color: 'var(--primary)' }}>{icon}</span> {text}
              </div>
            ))}
          </div>

          <div className="detail-divider" />

          <div className="detail-meta">
            {[['Category', product.category], ['SKU', `SC-${String(product.id).padStart(5, '0')}`], ['Availability', 'In Stock']].map(([label, value]) => (
              <div key={label} className="detail-meta-row">
                <span className="detail-meta-label">{label}</span>
                <span className="detail-meta-value" style={label === 'Availability' ? { color: 'var(--success)' } : {}}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Related Products</h2>
            <Link to={`/?cat=${product.category}`} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="products-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
