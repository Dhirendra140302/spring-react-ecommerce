import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ChevronRight, Star, Zap, Truck, Shield, RotateCcw, Tag } from 'lucide-react';
import { getProducts, getCategories, getByCategory, normalize } from '../api/fakestore';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'name',       label: 'Name A–Z' },
];

const CAT_DATA = [
  { value: "electronics",    label: "Electronics",      icon: "💻", color: "#dbeafe", text: "#1d4ed8", desc: "Gadgets & Devices" },
  { value: "jewelery",       label: "Jewellery",        icon: "💍", color: "#fce7f3", text: "#be185d", desc: "Gold, Silver & More" },
  { value: "men's clothing", label: "Men's Fashion",    icon: "👔", color: "#dcfce7", text: "#15803d", desc: "Shirts, Jackets & More" },
  { value: "women's clothing",label:"Women's Fashion",  icon: "👗", color: "#fef3c7", text: "#b45309", desc: "Tops, Dresses & More" },
];

const BANNERS = [
  { bg: "linear-gradient(135deg,#1e3a8a,#3b82f6)", tag: "NEW SEASON", title: "Men's Collection", sub: "Up to 40% off on premium clothing", cat: "men's clothing", cta: "Shop Men's", img: "👔" },
  { bg: "linear-gradient(135deg,#7c3aed,#ec4899)", tag: "TRENDING",   title: "Women's Fashion", sub: "Latest styles at unbeatable prices",  cat: "women's clothing", cta: "Shop Women's", img: "👗" },
  { bg: "linear-gradient(135deg,#0f766e,#06b6d4)", tag: "BEST DEALS", title: "Electronics",     sub: "Top gadgets, lowest prices",           cat: "electronics",      cta: "Shop Now",     img: "💻" },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all');
  const [search, setSearch]                 = useState(searchParams.get('q')   || '');
  const [sort, setSort]                     = useState(searchParams.get('sort') || 'default');
  const [products, setProducts]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeBanner, setActiveBanner]     = useState(0);

  // Auto-rotate banner
  useEffect(() => {
    const t = setInterval(() => setActiveBanner(b => (b + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const p = {};
    if (cat !== 'all') p.cat = cat;
    if (search) p.q = search;
    setSearchParams(p);
  };

  useEffect(() => {
    getCategories().then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const req = activeCategory === 'all' ? getProducts() : getByCategory(activeCategory);
    req.then(r => setProducts(Array.isArray(r.data) ? r.data.map(normalize) : []))
       .catch(() => setProducts([]))
       .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    const q   = searchParams.get('q')    || '';
    const cat = searchParams.get('cat')  || 'all';
    const s   = searchParams.get('sort') || 'default';
    setSearch(q);
    setSort(s);
    if (cat !== activeCategory) setActiveCategory(cat);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const displayed = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
      case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }, [products, search, sort]);

  const isFiltered = activeCategory !== 'all' || !!search;

  return (
    <div className="home">

      {/* ── Hero Banner Carousel ── */}
      <section className="hm-hero">
        <div className="hm-hero-slides">
          {BANNERS.map((b, i) => (
            <div key={i} className={`hm-hero-slide ${i === activeBanner ? 'active' : ''}`} style={{ background: b.bg }}>
              <div className="hm-hero-content">
                <span className="hm-hero-tag">{b.tag}</span>
                <h1 className="hm-hero-title">{b.title}</h1>
                <p className="hm-hero-sub">{b.sub}</p>
                <button className="hm-hero-cta" onClick={() => handleCategoryChange(b.cat)}>
                  {b.cta} <ChevronRight size={16} />
                </button>
              </div>
              <div className="hm-hero-img">{b.img}</div>
            </div>
          ))}
        </div>
        <div className="hm-hero-dots">
          {BANNERS.map((_, i) => (
            <button key={i} className={`hm-dot ${i === activeBanner ? 'active' : ''}`} onClick={() => setActiveBanner(i)} />
          ))}
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="hm-trust">
        {[
          [<Truck size={18} />, "Free Delivery", "On orders above $50"],
          [<RotateCcw size={18} />, "Easy Returns", "30-day return policy"],
          [<Shield size={18} />, "Secure Payment", "100% protected"],
          [<Tag size={18} />, "Best Prices", "Guaranteed lowest"],
          [<Zap size={18} />, "Fast Shipping", "2-5 business days"],
        ].map(([icon, title, sub]) => (
          <div key={title} className="hm-trust-item">
            <span className="hm-trust-icon">{icon}</span>
            <div>
              <div className="hm-trust-title">{title}</div>
              <div className="hm-trust-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Category Showcase ── */}
      <section className="hm-section">
        <div className="hm-section-header">
          <h2 className="hm-section-title">Shop by Category</h2>
          <button className="hm-see-all" onClick={() => handleCategoryChange('all')}>
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="hm-cat-grid">
          {CAT_DATA.map(c => (
            <button key={c.value} className="hm-cat-card" onClick={() => handleCategoryChange(c.value)}
              style={{ '--cat-bg': c.color, '--cat-text': c.text }}>
              <div className="hm-cat-icon">{c.icon}</div>
              <div className="hm-cat-label">{c.label}</div>
              <div className="hm-cat-desc">{c.desc}</div>
              <div className="hm-cat-arrow">Shop Now →</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Promo Banners Row ── */}
      <section className="hm-section">
        <div className="hm-promo-row">
          <div className="hm-promo hm-promo-blue" onClick={() => handleCategoryChange('electronics')}>
            <div>
              <div className="hm-promo-tag">Up to 30% off</div>
              <div className="hm-promo-title">Electronics</div>
              <div className="hm-promo-sub">Latest gadgets & devices</div>
            </div>
            <div className="hm-promo-emoji">💻</div>
          </div>
          <div className="hm-promo hm-promo-pink" onClick={() => handleCategoryChange('jewelery')}>
            <div>
              <div className="hm-promo-tag">New Collection</div>
              <div className="hm-promo-title">Jewellery</div>
              <div className="hm-promo-sub">Gold, silver & gemstones</div>
            </div>
            <div className="hm-promo-emoji">💍</div>
          </div>
          <div className="hm-promo hm-promo-green" onClick={() => { setSort('rating'); handleCategoryChange('all'); }}>
            <div>
              <div className="hm-promo-tag">Customer Picks</div>
              <div className="hm-promo-title">Top Rated</div>
              <div className="hm-promo-sub">Highest rated products</div>
            </div>
            <div className="hm-promo-emoji">⭐</div>
          </div>
        </div>
      </section>

      {/* ── Products Section ── */}
      <section className="hm-section">
        {/* Section header with filters */}
        <div className="hm-products-header">
          <div className="hm-products-title-row">
            <h2 className="hm-section-title" style={{ marginBottom: 0 }}>
              {activeCategory === 'all' ? '🛍️ All Products' : CAT_DATA.find(c => c.value === activeCategory)?.icon + ' ' + (CAT_DATA.find(c => c.value === activeCategory)?.label || activeCategory)}
            </h2>
            {!loading && <span className="hm-count">{displayed.length} products</span>}
          </div>

          {/* Category filter pills */}
          <div className="hm-filter-row">
            <div className="hm-filter-pills">
              <button className={`hm-pill ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => handleCategoryChange('all')}>
                All
              </button>
              {categories.map(cat => (
                <button key={cat} className={`hm-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}>
                  {CAT_DATA.find(c => c.value === cat)?.icon || '🏷️'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <div className="hm-sort-wrap">
              <SlidersHorizontal size={15} />
              <select className="hm-sort" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="hm-loading">
            {[...Array(8)].map((_, i) => <div key={i} className="hm-skeleton" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="hm-empty">
            <div className="hm-empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try a different search or category</p>
            <button className="btn btn-primary" onClick={() => { setSearch(''); handleCategoryChange('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="hm-products-grid">
            {displayed.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

    </div>
  );
}
