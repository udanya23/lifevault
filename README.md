# LifeVault

**Your life. One secure vault. Ready in every emergency.**

LifeVault is a production-grade MERN SaaS application for storing emergency medical information, documents, and contacts — accessible via a privacy-controlled QR code in emergencies.

## Features

- JWT authentication with refresh token rotation
- Personal profile, medical info, emergency contacts
- Secure document vault (Cloudinary)
- QR emergency access with field whitelisting
- Activity logs and scan analytics
- Admin panel with user management
- Dark mode, responsive UI, accessibility support

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, Redux Toolkit, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Services | Cloudinary, Nodemailer, JWT, bcrypt |

## Project Structure

```
lifevault/
├── backend/          # Express API (port 5000)
├── frontend/         # React SPA (port 5173 dev)
├── docker-compose.yml
├── README.md
└── DEPLOYMENT.md
```

## Quick Start (Development)

Run the app from **two terminals** (or use one command to run both — see below).

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Mailtrap (or SMTP) for emails

### Install dependencies

```bash
# From project root — installs backend + frontend + root tools
npm run install:all
```

Or install each folder separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Run the app

**Terminal 1 — Backend** (from `backend/` or project root):

```bash
# From backend folder:
cd backend
npm start

# OR from project root:
npm start
```

**Terminal 2 — Frontend** (from `frontend/` or project root):

```bash
# From frontend folder:
cd frontend
npm run dev

# OR from project root:
npm run dev
```

**Both at once** (from project root):

```bash
npm install          # first time only — installs concurrently
npm run dev:all
```

| Command | Where | What it does |
|---------|-------|--------------|
| `npm start` | `backend/` or root | Starts API on port **5000** |
| `npm run dev` | `frontend/` or root | Starts Vite on port **5173** |
| `npm run dev:all` | root only | Starts backend + frontend together |

### Environment setup (first time)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with MongoDB, JWT, Cloudinary, and email credentials

cp frontend/.env.example frontend/.env.local
# Optional — defaults work with Vite proxy in dev
```

API health check: `GET http://localhost:5000/health`  
### Create an admin user

Register normally, then in MongoDB:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin", isEmailVerified: true } }
)
```

## Docker (Production Simulation)

```bash
cp backend/.env.example backend/.env
# Fill in backend/.env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| **root** | `npm start` | Start backend API |
| **root** | `npm run dev` | Start frontend (Vite) |
| **root** | `npm run dev:all` | Start backend + frontend together |
| **root** | `npm run install:all` | Install all dependencies |
| `backend/` | `npm start` | Start API (`node server.js`) |
| `backend/` | `npm run dev` | Start API with nodemon (auto-reload) |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Production build |

## API Overview

All authenticated routes use `Authorization: Bearer <accessToken>`.

| Prefix | Description |
|--------|-------------|
| `/api/v1/auth` | Register, login, password reset |
| `/api/v1/users` | Account settings |
| `/api/v1/profile` | Personal profile |
| `/api/v1/medical` | Medical information |
| `/api/v1/documents` | Document vault |
| `/api/v1/qr` | QR code management |
| `/api/v1/activity` | Activity logs |
| `/api/v1/admin` | Admin panel (admin only) |
| `/emergency/:token` | Public emergency page (no auth) |

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens + httpOnly refresh cookies
- Helmet, CORS, rate limiting
- Input validation on all endpoints
- QR public endpoint returns whitelisted fields only

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for MongoDB Atlas, Render, Railway, and Docker deployment guides.

## License

MIT
