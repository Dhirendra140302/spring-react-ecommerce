# 🛒 E-Commerce Full Stack Application

A complete **E-Commerce web application** built using **Spring Boot (Backend)** and **React.js (Frontend)**.
This project demonstrates real-world full-stack development with authentication, product management, cart system, and order processing.

---

## 🚀 Features

### 👤 User Features

* User Registration & Login (JWT Authentication)
* Browse Products
* View Product Details
* Add to Cart / Remove from Cart
* Wishlist Management ❤️
* Place Orders 📦
* Order History Tracking

### 🛠️ Admin Features

* Manage Products (Add / Update / Delete)
* View All Orders
* Manage Users
* Admin Dashboard

---

## 🧰 Tech Stack

### 🔹 Frontend

* React.js
* Vite
* Axios
* Context API (State Management)
* CSS

### 🔹 Backend

* Java
* Spring Boot
* Spring Security (JWT)
* Hibernate (JPA)
* REST APIs

### 🔹 Database

* MySQL

---

## 🔐 Authentication

* Implemented using **JWT (JSON Web Tokens)**
* Secure login and role-based authorization (USER / ADMIN)

---

## 💳 Payment Integration

* Razorpay Integration (Test Mode)
* Order creation & payment verification supported

---

## 📁 Project Structure

```
E-Commerce_Full_Stack_Project/
│
├── ecommerce_backend/        # Spring Boot Backend
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   └── security/
│
├── ecommerce_frontend/       # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── api/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 🔹 Backend (Spring Boot)

```bash
cd ecommerce_backend
mvn clean install
mvn spring-boot:run
```

* Runs on: `http://localhost:8080`

---

### 🔹 Frontend (React)

```bash
cd ecommerce_frontend/ecommerce
npm install
npm run dev
```

* Runs on: `http://localhost:5173`

---

## 🔗 API Endpoints (Sample)

* `/api/auth/login`
* `/api/auth/register`
* `/api/products`
* `/api/cart`
* `/api/orders`

---

## 📸 Screenshots


 <img width="1911" height="862" alt="image" src="https://github.com/user-attachments/assets/5581f139-f63c-4081-9010-adf867d1d30b" />
 

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/905437cd-9512-4f9d-9dd0-3f4327d66f0d" />


<img width="1920" height="1008" alt="image" src="https://github.com/user-attachments/assets/7cc73dfc-7cea-47d8-ab82-247f92fb3e78" />


<img width="1920" height="1008" alt="image" src="https://github.com/user-attachments/assets/4e49f632-6879-4817-857f-261c61ef7ca2" />


<img width="1920" height="1008" alt="image" src="https://github.com/user-attachments/assets/88ad9d7c-926f-468c-b58c-ec65a6b2a613" />



---

## 🌍 Future Enhancements

* Live Deployment (AWS / Render / Vercel)
* Email Notifications
* Product Reviews & Ratings
* Order Tracking System
* Advanced Search & Filters

---

## 👨‍💻 Author

**Dhirendra Yadav**

* Full Stack Developer (Java + React)

---

## 💡 Key Highlights (For Recruiters)

* Full-stack project with real-world architecture
* Secure authentication using JWT
* RESTful API design
* Clean code structure (MVC pattern)
* Integrated frontend and backend
* Scalable and production-ready approach

---

## ⭐ How to Run (Quick Start)

```bash
# Clone repository
git clone https://github.com/Dhirendra140302/spring-react-ecommerce.git

# Backend
cd ecommerce_backend
mvn spring-boot:run

# Frontend
cd ../ecommerce_frontend/ecommerce
npm install
npm run dev
```
