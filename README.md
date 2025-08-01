# 🧩 Full Stack Project

This is a full-stack web application consisting of:

- **Backend** (Nest) in the `api/` folder  
- **Frontend** (React) in the `frontend/` folder  
- **Database**: MongoDB (local or MongoDB Atlas)

---

## 📁 Project Structure

```
root/
├── api/         # Backend API 
└── frontend/    # Frontend application

---
```
## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/azizmejri1/appointmentSystem.git
cd appointmentSystem
```

---

### 2. Set Up MongoDB

This project requires a running MongoDB instance.

#### Option A: Local MongoDB

- [Download MongoDB](https://www.mongodb.com/try/download/community)
- Start MongoDB locally:

```bash
mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Whitelist your IP and create a DB user
4. Get the connection URI (e.g. `mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>`)
5. Paste it in the `.env` file as shown below

---

### 3. Configure Environment Variables

Create a `.env` file inside the `api/` folder with the following:

```env
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=your_frontend_url
PORT=8080
NODE_ENV=development
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=your_zoho_email
SMTP_PASSWORD=your_zoho_email_password
EMAIL_FROM=your_zoho_email
EMAIL_FROM_NAME=MedSchedule Team

Create a `.env` file inside the `frontend/` folder with the following:
NEXT_PUBLIC_API_URL=backend_url
NEXT_PUBLIC_FRONTEND_URL=frontend_url

# Environment
NODE_ENV=development
```
### 4. Run the Backend

```bash
cd api
npm install
npm run start
```

> The backend will start on `http://localhost:8080`

---

### 5. Run the Frontend

Open a new terminal tab or window:

```bash
cd frontend
npm install
npm run dev
```

> The frontend will start on `http://localhost:3000` 

---

## 📦 Requirements

- Node.js v16 or later
- npm
- MongoDB (local or Atlas)

---

## 🛠️ Technologies Used

- **Frontend**: React / next.js
- **Backend**: NestJS
- **Database**: MongoDB
- **Authentication**: JWT 
