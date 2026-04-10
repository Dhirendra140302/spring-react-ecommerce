# 🛒 SmartCart — Full Stack E-Commerce Platform

A production-ready e-commerce application built with **Spring Boot** + **React**, featuring JWT authentication, Razorpay payments, and a real product catalog from FakeStore API.

![Java](https://img.shields.io/badge/Java-17-orange?logo=java)

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-green?logo=springboot)

![React](https://img.shields.io/badge/React-19-blue?logo=react)

![MySQL](https://img.shields.io/badge/MySQL-8-blue?logo=mysql)
![Razorpay](https://img.shields.io/badge/Razorpay-Payment-blue)

---

## ✨ Features

### User Side
- Register / Login with JWT Authentication
- Browse 20+ products from FakeStore API (auto-seeded)
- Search & filter by category, price, rating
- Add to Cart / Wishlist
- Checkout with Razorpay payment gateway
- Order history with status tracking

### Admin Side
- Add / Update / Delete products (with image upload)
- Manage all orders & update status
- View all users
- Analytics dashboard (revenue, orders, users, products)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios |
| Backend | Spring Boot 3.2, Spring Security, JWT |
| Database | MySQL 8 + Hibernate JPA |
| Payment | Razorpay |
| Deployment | Vercel (frontend) + Railway (backend + DB) |

---

## 🚀 Local Setup

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8

### Backend
```bash
cd ecommerce_backend

# Set your MySQL credentials in application.properties
# spring.datasource.username=root
# spring.datasource.password=root

./mvnw spring-boot:run
```
On first run, Hibernate creates all tables and the **FakestoreSeeder** auto-populates 20 products.

### Frontend
```bash
cd ecommerce_frontend/ecommerce
npm install
npm run dev
```
Open http://localhost:5173

---

## 🌐 Deployment

### Backend → Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set root directory: `ecommerce_backend`
3. Add MySQL plugin
4. Set environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Railway MySQL JDBC URL |
| `DATABASE_USERNAME` | Railway MySQL user |
| `DATABASE_PASSWORD` | Railway MySQL password |
| `JWT_SECRET` | Random 64-char string |
| `DDL_AUTO` | `create` (first deploy), then `update` |
| `ALLOWED_ORIGINS` | Your Vercel frontend URL |
| `RAZORPAY_KEY_ID` | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import repo
2. Set root directory: `ecommerce_frontend/ecommerce`
3. Add environment variable: `VITE_API_URL` = your Railway backend URL
4. Deploy

---

## 📦 Database Schema

| Table | Description |
|---|---|
| `users` | id, name, email, password (BCrypt), role |
| `products` | id, name, price, description, image, category, stock, rating, fakestoreId |
| `cart_items` | id, user_id, product_id, quantity |
| `orders` | id, user_id, total_amount, status, payment_id, address, phone |
| `order_items` | id, order_id, product_id, quantity, price |
| `wishlist` | id, user_id, product_id |

---

## 🔐 API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
```

### Products (public)
```
GET  /api/products
GET  /api/products/{id}
GET  /api/products/search?q=
GET  /api/products/category/{category}
GET  /api/products/categories-list
```

### Cart (authenticated)
```
GET    /api/cart
POST   /api/cart
PUT    /api/cart/{itemId}
DELETE /api/cart/{itemId}
```

### Orders (authenticated)
```
POST /api/orders/create
POST /api/orders/verify
GET  /api/orders/my
```

### Admin (ADMIN role only)
```
POST   /api/admin/products
PUT    /api/admin/products/{id}
DELETE /api/admin/products/{id}
GET    /api/admin/orders
PUT    /api/admin/orders/{id}/status
GET    /api/admin/users
GET    /api/admin/analytics
```

---

## 👤 Make Yourself Admin

After registering, run this SQL:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## 📸 Screenshots

> Home page with Amazon/Myntra-style design, category filters, hero carousel, and product grid.

---

## 📄 License

MIT License — free to use for personal and commercial projects.
