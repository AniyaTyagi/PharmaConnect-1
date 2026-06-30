# 💊 PharmaConnect

> **A Modern B2B Pharmaceutical Marketplace Platform connecting manufacturers, wholesalers, distributors, pharmacies, and healthcare organizations through a secure, scalable, and intelligent digital ecosystem.**

![License](https://img.shields.io/badge/License-Educational-blue)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black)
![Redis](https://img.shields.io/badge/Cache-Upstash%20Redis-red)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)

---

## 📖 Overview

**PharmaConnect** is a full-stack **B2B pharmaceutical marketplace** developed as a **Final Year Major Project** to modernize pharmaceutical procurement and supply chain management.

The platform connects **manufacturers, wholesalers, distributors, pharmacies, hospitals, and healthcare organizations** through a centralized digital marketplace, enabling businesses to discover suppliers, manage inventories, place bulk orders, communicate in real time, and leverage AI-powered assistance.

Designed with scalability, security, and real-world pharmaceutical workflows in mind, PharmaConnect simplifies procurement while improving transparency and operational efficiency.

---

## 🎯 Problem Statement

Traditional pharmaceutical procurement often depends on manual communication, fragmented inventory systems, and disconnected business networks, resulting in:

- Delayed procurement
- Poor inventory visibility
- Limited supplier discovery
- Inefficient communication
- Manual order processing
- Lack of centralized business management

PharmaConnect addresses these challenges by providing a unified digital B2B marketplace.

---

# ✨ Features

## 👤 User Management

- Secure User Authentication
- JWT Authorization
- Role-Based Access Control
- Business Verification
- Company Profiles
- Profile Management

---

## 🏢 Marketplace

- Manufacturer Listings
- Distributor Network
- Pharmacy Marketplace
- Supplier Discovery
- Business Profiles
- Advanced Search & Filters

---

## 💊 Product Management

- Medicine Listings
- Categories
- Inventory Management
- Stock Tracking
- Product Images
- Price Management
- Bulk Product Listings

---

## 🛒 Order Management

- Bulk Ordering
- Shopping Cart
- Order Tracking
- Purchase History
- Invoice Support
- Order Status Updates

---

## 💬 Real-Time Communication

- Instant Messaging
- Buyer-Seller Chat
- Read Receipts
- Real-time Notifications
- Conversation History

---

## 🤖 AI Assistant

Integrated Google Gemini AI to:

- Search medicines
- Answer user queries
- Help navigate the platform
- Provide intelligent assistance
- Improve user experience

---

## 📊 Dashboard & Analytics

- Revenue Analytics
- Sales Dashboard
- Inventory Overview
- Purchase Statistics
- Business Insights
- Performance Metrics

---

## 🔔 Notifications

- Order Updates
- Stock Alerts
- Chat Notifications
- Business Announcements
- System Notifications

---

## 🔒 Security

- JWT Authentication
- Password Encryption (bcrypt)
- Protected APIs
- Secure Routes
- Input Validation
- Role-Based Permissions

---

# 🛠 Tech Stack

### Frontend

- React.js
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios
- Framer Motion

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MongoDB
- Mongoose

### Caching

- Upstash Redis

### AI

- Google Gemini API

### Real-Time Communication

- Socket.io

### Cloud Storage

- Cloudinary

### Authentication

- JWT
- bcrypt

### Development Tools

- Git
- GitHub
- Postman
- VS Code

---

# 🏗 System Architecture

```text
                     React Frontend
                            │
                     REST API Calls
                            │
                   Express + Node.js
                            │
      ┌───────────────┬───────────────┬───────────────┐
      │               │               │               │
   MongoDB       Upstash Redis    Socket.io      Cloudinary
(Database)          (Cache)       (Realtime)    (Images)
                            │
                    Google Gemini AI
                            │
                     AI Assistant
```

---

# 📁 Project Structure

```text
PharmaConnect
│
├── client
│   ├── public
│   ├── src
│   └── package.json
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── sockets
│   ├── utils
│   └── package.json
│
├── README.md
└── .env
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/PharmaConnect-1.git

cd PharmaConnect-1
```

---

## Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

---

## Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=

CLIENT_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

REDIS_URL=

GEMINI_API_KEY=
```

---

## Run Backend

```bash
cd server
npm run dev
```

---

## Run Frontend

```bash
cd client
npm start
```

---

# 🌐 API Modules

- Authentication
- Users
- Marketplace
- Products
- Categories
- Orders
- Cart
- Chat
- Notifications
- Dashboard
- AI Assistant

---

# 🔄 Workflow

```text
Business Registration
          │
          ▼
Business Verification
          │
          ▼
Browse Marketplace
          │
          ▼
Search Medicines
          │
          ▼
Place Bulk Orders
          │
          ▼
Real-time Communication 
+ Invoice Generation
          │
          ▼
Order Processing
          │
          ▼
Delivery
```

---

# 🚀 Scalability

- Modular Architecture
- RESTful APIs
- Redis Caching
- Socket-based Communication
- Cloud Storage
- Reusable Components
- Secure Authentication
- Optimized Database Queries

---

# 🔮 Future Scope

- Payment Gateway Integration
- GST Invoice Generation
- OCR Medicine Upload
- AI Demand Forecasting
- Multi-language Support
- Shipment Tracking
- Recommendation System
- Advanced Admin Dashboard

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push to the branch

```bash
git push origin feature/feature-name
```

5. Open a Pull Request

---

## ⭐ If you found this project useful, consider giving it a **Star** on GitHub!
