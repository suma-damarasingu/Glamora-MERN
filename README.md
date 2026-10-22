# 🌸 GLAMORA — Luxury Beauty & Services Booking Platform

A full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** web application engineered for modern beauty salons and spa centers. Glamora delivers a seamless experience across two dedicated portals: **Admin Control Center** and **Customer Studio**, equipped with two-step email authentication (OTP), intelligent slot conflict detection, and smart recommendations.

---

## 🎯 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Axios, Context API, Lucide React, react-hot-toast |
| **Backend** | Node.js, Express.js (RESTful architecture) |
| **Database** | MongoDB Atlas / Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing, 2-Step OTP via Nodemailer |
| **Media Storage** | Multer file processing + Cloudinary SDK (with local disk fallback) |
| **Analytics** | Recharts (Line Charts, Pie Charts, Bar Charts) |
| **Deployment** | Vercel (Frontend Client) + Render (Backend Server) |

---

## 📁 Project Structure

```text
glamora/
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── api/                # Axios instance & token interceptors
│   │   ├── components/
│   │   │   ├── admin/          # AnalyticsCharts, StatCard, ServiceModal, CategoryModal
│   │   │   ├── common/         # Navbar, Sidebar, Footer, Modal, Skeleton, StatusBadge
│   │   │   └── customer/       # BookingModal, ServiceCard, RecommendedSection
│   │   ├── context/            # AuthContext (OTP 2-Step state, sessions, role checks)
│   │   ├── layouts/            # PublicLayout, CustomerLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── admin/          # AdminDashboard, BookingsManagement, ServicesManagement, CustomersPage, AdminSettingsPage
│   │   │   ├── customer/       # CustomerDashboard, MyBookingsPage, FavoritesPage, SettingsPage
│   │   │   └── public/         # HomePage, ServicesPage, LoginPage, RegisterPage, ForgotPasswordPage
│   │   ├── routes/             # ProtectedRoute guard
│   │   ├── App.jsx             # Router configuration & toast notifications
│   │   ├── main.jsx            # React root entrypoint
│   │   └── index.css           # Tailwind directives & luxury styling
│   ├── tailwind.config.js      # Palette (rose, pink, champagne, dark accents)
│   ├── vite.config.js          # Vite config & development proxy
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/
│   │   ├── db.js               # MongoDB Mongoose connection
│   │   ├── email.js            # Nodemailer transporter & branded HTML OTP emails
│   │   └── cloudinary.js       # Cloudinary SDK & local disk fallback
│   ├── controllers/
│   │   ├── adminController.js  # Feature #1: Analytics engine & customer directory
│   │   ├── authController.js   # 2-step OTP registration, login, profile, password reset
│   │   ├── bookingController.js# Booking lifecycle & Feature #2 slot conflict detection
│   │   ├── categoryController.js# Categories CRUD
│   │   ├── favoriteController.js# Customer favorites toggling & listing
│   │   ├── recommendationController.js # Feature #3: Smart rule-based recommendations
│   │   ├── serviceController.js# Services catalog CRUD & search
│   │   └── slotController.js   # Feature #2: Dynamic slot availability
│   ├── middleware/
│   │   ├── auth.js             # JWT verification, requireAdmin, requireCustomer
│   │   └── upload.js           # Multer disk upload with 5MB validation
│   ├── models/
│   │   ├── Booking.js          # Bookings schema with slot indexes
│   │   ├── Category.js         # Category taxonomy schema
│   │   ├── Favorite.js         # Customer favorites schema
│   │   ├── Service.js          # Services schema with category reference
│   │   └── User.js             # User accounts schema with bcrypt & OTP
│   ├── routes/                 # Express API routes
│   ├── uploads/                # Local uploads fallback directory
│   ├── seed.js                 # Seeding script (1 Admin, 5 Categories, 15 Services, Bookings)
│   ├── server.js               # Express application initialization
│   └── package.json
│
├── .env.example                # Unified environment variables template
└── README.md                   # Full documentation & setup guide
```

---

## 👤 User Roles & Access Control

1. **Admin** (`role: 'admin'`)
   - Strictly **ONE** seeded admin account exists in the system.
   - Has full control over Categories CRUD, Services CRUD, Booking fulfillment, Customer history, and Salon Analytics.
   - Protected route: `/admin/*`
2. **Customer** (`role: 'customer'`)
   - Unlimited client registrations.
   - Can explore services, book appointments with real-time slot conflict detection, manage favorites, view live booking statuses, cancel pending appointments, and receive personalized "For You" recommendations.
   - Protected route: `/dashboard/*`

---

## 🔐 2-Step Authentication Flow (Both Roles)

- **Registration**:
  1. Client submits Name, Email, Phone Number, Password.
  2. Nodemailer generates a cryptographically secure 6-digit OTP and dispatches a branded HTML email (also logged to server console in development).
  3. Client enters OTP &rarr; verified &rarr; account created &rarr; JWT token issued.
- **Login (Two-Step Verification)**:
  1. User enters Email + Password &rarr; bcrypt validates credentials.
  2. Server generates a 6-digit OTP valid for 10 minutes and emails it.
  3. User enters OTP &rarr; verified &rarr; JWT token issued &rarr; redirects to `/admin` or `/dashboard`.
- **Forgot Password**:
  1. User enters registered email &rarr; OTP dispatched.
  2. User enters OTP + New Password &rarr; password hashed and updated.

---

## ⭐ 3 Unique Differentiating Features

### 1. Admin Analytics Dashboard (Data-Driven Insights)
- Built using **Recharts**.
- **Line Chart**: Daily booking volume over the last 7 days.
- **Pie Chart**: Proportional distribution of appointment statuses (Pending, Accepted, Completed, Declined, Cancelled).
- **Bar Chart**: Top 5 most-booked beauty services with total volume and prices.
- **Financial Metric Cards**: Realized salon revenue (sum of completed bookings), total volume, active requests, and verified clients.

### 2. Slot Availability & Conflict Detection
- Salon operates on standard fixed time slots: `10:00 AM`, `12:00 PM`, `02:00 PM`, `04:00 PM`, and `06:00 PM`.
- **Customer Side**: When selecting an appointment date, the frontend queries `GET /api/slots/available?date=YYYY-MM-DD`. Only **unoccupied slots** are selectable. Booked slots are disabled and badged as "Booked". If a concurrent request attempts double booking, the server rejects it with HTTP 409 Conflict.
- **Admin Side**: When accepting a booking, the system verifies that no other accepted booking exists on that date and slot. If a conflict occurs, admin receives a conflict warning with the existing client's details.

### 3. Smart Recommendations ("For You" Section)
- Personalized, rule-based recommendation engine (`GET /api/recommendations`):
  - **Category affinity**: Analyzes the customer's past booking history and suggests services from their most frequently booked categories.
  - **Favorite affinity**: If history is sparse, examines the customer's favorited services and suggests top treatments from those categories.
  - **New user fallback**: For brand new accounts with no history, displays top trending treatments across the entire platform.

---

## 🛠️ Environment Variables Configuration

Copy `.env.example` in both `server/` and `client/` directories:

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/glamora?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=glamora_jwt_secret_key_production_ready_2026
JWT_EXPIRE=7d

# Nodemailer OTP Settings (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary Image Uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client Application URL
CLIENT_URL=http://localhost:5173
```
> **Note on Nodemailer & Cloudinary**: If you do not have an active Gmail App Password or Cloudinary account yet, the application gracefully logs the OTP directly to the server terminal and stores uploaded images in `server/uploads/` so you can test end-to-end immediately without configuration blockers!

### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 How to Run Locally

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/glamora.git
cd glamora

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Seed Database

The seed script initializes the **single administrator account**, a demo customer, 5 beauty categories (Hair, Makeup, Skin, Nails, Spa), 15 services, and sample bookings for analytics:

```bash
cd server
npm run seed
```

#### Seeded Credentials:
- **Admin Account**:
  - Email: `admin@glamora.com`
  - Password: `AdminPassword123!`
  - Role: `admin`
- **Customer Demo Account**:
  - Email: `customer@glamora.com`
  - Password: `CustomerPassword123!`
  - Role: `customer`

*(Both demo accounts can also be autofilled with 1 click directly on the login page via the quick test buttons).*

### 3. Start Backend & Frontend

In Terminal 1 (Backend):
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

In Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Vite runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment Guide

### Deploy Backend to Render:
1. Create a **Web Service** on [Render.com](https://render.com).
2. Connect your repository and set Root Directory to `server`.
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Add Environment Variables from `server/.env` (including your MongoDB Atlas URI).
6. Run `node seed.js` in Render Shell to seed the database.

### Deploy Frontend to Vercel:
1. Import the repository on [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Framework Preset: **Vite**.
4. Set Environment Variable:
   - `VITE_API_URL` = `https://your-render-backend-url.onrender.com/api`
5. Deploy!

---

## 🔌 API Route Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Submit info & send registration OTP |
| **POST** | `/api/auth/verify-otp` | Public | Verify OTP and activate account |
| **POST** | `/api/auth/login` | Public | Validate credentials & send login OTP |
| **POST** | `/api/auth/verify-login-otp` | Public | Verify 2FA OTP & issue JWT |
| **POST** | `/api/auth/resend-otp` | Public | Resend OTP code |
| **POST** | `/api/auth/forgot-password` | Public | Send password reset OTP |
| **POST** | `/api/auth/reset-password` | Public | Reset password with OTP |
| **GET** | `/api/auth/me` | Protected | Current user session profile |
| **PUT** | `/api/profile` | Protected | Update profile & profile picture upload |
| **PUT** | `/api/change-password` | Protected | Verify old password and set new |
| **GET** | `/api/categories` | Public | List categories with service counts |
| **POST** | `/api/categories` | Admin | Create new category (Multer/Cloudinary) |
| **PUT** | `/api/categories/:id` | Admin | Update category details/image |
| **DELETE** | `/api/categories/:id` | Admin | Delete category (checks dependencies) |
| **GET** | `/api/services` | Public | Browse services (filter by category/search) |
| **POST** | `/api/services` | Admin | Create service |
| **PUT** | `/api/services/:id` | Admin | Update service (price, image, duration, active) |
| **DELETE** | `/api/services/:id` | Admin | Delete service |
| **GET** | `/api/slots/available` | Public | **Feature #2**: Available time slots for date |
| **POST** | `/api/bookings` | Customer | **Feature #2**: Place booking with conflict check |
| **GET** | `/api/bookings/my` | Customer | List customer bookings |
| **PUT** | `/api/bookings/:id/cancel` | Customer | Cancel pending booking |
| **GET** | `/api/bookings` | Admin | List all bookings with status filter |
| **PUT** | `/api/bookings/:id/status` | Admin | **Feature #2**: Accept/Decline/Complete with conflict guard |
| **GET** | `/api/admin/analytics` | Admin | **Feature #1**: Recharts statistics & charts |
| **GET** | `/api/users` | Admin | Registered customers with booking history |
| **GET** | `/api/recommendations` | Public/Customer | **Feature #3**: Rule-based "For You" services |
| **POST** | `/api/favorites/:serviceId`| Customer | Toggle favorite status |
| **GET** | `/api/favorites` | Customer | Get customer favorite services |

---

## 🎓 Academic Evaluation Checklist

- [x] Full-Stack MERN Architecture (clean separation of client & server)
- [x] Only ONE Admin seeded in DB
- [x] Complete 2-Step OTP Authentication via Nodemailer for registration & login
- [x] Feature #1: Admin Analytics Dashboard with Recharts (Line, Pie, Bar)
- [x] Feature #2: Slot Availability & Real-Time Conflict Detection
- [x] Feature #3: Smart Rule-Based Recommendations ("For You" section)
- [x] Categories & Services CRUD with image upload
- [x] Customer bookings management & live status tracking
- [x] Responsive luxury UI with Tailwind CSS and Poppins/Inter typography
- [x] Production-ready `.env.example`, seed script, and thorough setup instructions
