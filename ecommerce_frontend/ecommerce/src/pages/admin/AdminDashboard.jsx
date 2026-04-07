import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(res => setAnalytics(res.data));
  }, []);

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      {analytics && (
        <div className="analytics-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{analytics.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{analytics.totalProducts}</div>
            <div className="stat-label">Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-value">{analytics.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{analytics.totalRevenue?.toLocaleString()}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>
      )}
      <div className="admin-nav">
        <Link to="/admin/products" className="admin-nav-card">📦 Manage Products</Link>
        <Link to="/admin/orders" className="admin-nav-card">🛒 Manage Orders</Link>
        <Link to="/admin/users" className="admin-nav-card">👥 Manage Users</Link>
      </div>
    </div>
  );
}
