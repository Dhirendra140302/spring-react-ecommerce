import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, ChevronDown, LogOut, Package, LayoutDashboard, MapPin, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  { label: "Electronics",     value: "electronics",      icon: "💻" },
  { label: "Jewellery",       value: "jewelery",         icon: "💍" },
  { label: "Men's Fashion",   value: "men's clothing",   icon: "👔" },
  { label: "Women's Fashion", value: "women's clothing", icon: "👗" },
];

export default function Navbar({ onSearch }) {
  const { user, logout, isLoggedIn } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch ? onSearch(query) : navigate(`/?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => { logout(); setDropOpen(false); navigate('/'); };

  return (
    <>
      {/* ── Top bar ── */}
      <div className="nb-top">
        <div className="nb-top-inner">
          <span>🎉 Free shipping on orders over $50 — Limited time offer!</span>
          <div className="nb-top-links">
            <a href="#">Sell on SmartCart</a>
            <span>|</span>
            <a href="#">Help</a>
          </div>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <nav className="nb">
        <div className="nb-inner">
          {/* Brand */}
          <Link to="/" className="nb-brand">
            <span className="nb-brand-icon">🛒</span>
            <span>Smart<span className="nb-brand-accent">Cart</span></span>
          </Link>

          {/* Deliver to */}
          <div className="nb-deliver">
            <MapPin size={14} className="nb-deliver-icon" />
            <div>
              <div className="nb-deliver-label">Deliver to</div>
              <div className="nb-deliver-loc">India</div>
            </div>
          </div>

          {/* Search bar */}
          <form className="nb-search" onSubmit={handleSearch}>
            <select className="nb-search-cat" defaultValue="">
              <option value="">All</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search products, brands and more..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="nb-search-btn">
              <Search size={18} />
            </button>
          </form>

          {/* Right actions */}
          <div className="nb-actions">
            {/* Account */}
            <div className="nb-relative" ref={dropRef}>
              <div className="nb-action-btn" onClick={() => isLoggedIn ? setDropOpen(o => !o) : navigate('/login')}>
                <div className="nb-action-top">
                  {isLoggedIn ? `Hello, ${user?.name?.split(' ')[0]}` : 'Hello, Sign in'}
                </div>
                <div className="nb-action-main">
                  Account <ChevronDown size={12} />
                </div>
              </div>
              {dropOpen && isLoggedIn && (
                <div className="nb-dropdown">
                  <div className="nb-dropdown-header">
                    <div className="nb-dd-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="nb-dd-name">{user?.name}</div>
                      <div className="nb-dd-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="nb-dropdown-body">
                    <Link to="/orders" onClick={() => setDropOpen(false)}><Package size={14} /> My Orders</Link>
                    <Link to="/wishlist" onClick={() => setDropOpen(false)}><Heart size={14} /> Wishlist</Link>
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}><LayoutDashboard size={14} /> Admin Panel</Link>
                    )}
                    <div className="nb-dd-divider" />
                    <button onClick={handleLogout}><LogOut size={14} /> Sign Out</button>
                  </div>
                </div>
              )}
            </div>

            {/* Orders */}
            <Link to="/orders" className="nb-action-btn">
              <div className="nb-action-top">Returns &</div>
              <div className="nb-action-main">Orders</div>
            </Link>

            {/* Wishlist */}
            {isLoggedIn && (
              <Link to="/wishlist" className="nb-action-icon">
                <Heart size={22} />
                <span className="nb-action-label">Wishlist</span>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="nb-cart-btn">
              <div className="nb-cart-icon-wrap">
                <ShoppingCart size={26} />
                <span className="nb-cart-count">{cartCount}</span>
              </div>
              <span className="nb-action-main">Cart</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="nb-mobile-toggle" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Category nav strip ── */}
        <div className="nb-cats">
          <div className="nb-cats-inner">
            <button className="nb-cat-link nb-cat-all" onClick={() => navigate('/')}>
              <Menu size={14} /> All
            </button>
            {CATEGORIES.map(c => (
              <button key={c.value} className="nb-cat-link" onClick={() => navigate(`/?cat=${encodeURIComponent(c.value)}`)}>
                {c.icon} {c.label}
              </button>
            ))}
            <button className="nb-cat-link nb-cat-deal" onClick={() => navigate('/?sort=price-asc')}>
              🔥 Today's Deals
            </button>
            <button className="nb-cat-link" onClick={() => navigate('/?sort=rating')}>
              ⭐ Top Rated
            </button>
            <button className="nb-cat-link" onClick={() => navigate('/?sort=price-desc')}>
              💎 Premium
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="nb-mobile-menu">
          <form className="nb-mobile-search" onSubmit={handleSearch}>
            <Search size={16} />
            <input placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit">Go</button>
          </form>
          <div className="nb-mobile-links">
            {isLoggedIn ? (
              <>
                <Link to="/orders" onClick={() => setMobileOpen(false)}>My Orders</Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
                {user?.role === 'ADMIN' && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
              </>
            )}
            <div className="nb-mobile-divider" />
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => { navigate(`/?cat=${encodeURIComponent(c.value)}`); setMobileOpen(false); }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
