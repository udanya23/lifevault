# LifeVault Deployment Guide

This guide covers deploying LifeVault to production using Docker, Render, or Railway.

---

## Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Cloudinary account configured
- [ ] SMTP provider ready (SendGrid, Resend, etc.)
- [ ] Strong JWT secrets generated (`openssl rand -hex 64`)
- [ ] Production domain decided (e.g. `lifevault.app`)

---

## Environment Variables

### Backend (required)

| Variable | Example | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | Set by host if using PaaS |
| `CLIENT_URL` | `https://lifevault.app` | Frontend URL for CORS + QR links |
| `MONGODB_URI` | `mongodb+srv://...` | Atlas connection string |
| `JWT_ACCESS_SECRET` | random 64-char hex | **Never reuse dev secrets** |
| `JWT_REFRESH_SECRET` | random 64-char hex | Different from access secret |
| `CLOUDINARY_*` | from dashboard | Cloud name, API key, secret |
| `EMAIL_*` | SMTP credentials | Production mail provider |

Copy from `backend/.env.example` and fill all values.

### Frontend

| Variable | Production Value |
|----------|-----------------|
| `VITE_API_URL` | `/api/v1` if nginx proxies API, OR `https://api.lifevault.app/api/v1` if separate domains |

---

## Option 1: Docker Compose (VPS / VM)

Best for: DigitalOcean Droplet, AWS EC2, Hetzner

```bash
# On your server
git clone <your-repo> lifevault
cd lifevault
cp backend/.env.example backend/.env
nano backend/.env  # fill production values

docker compose up -d --build
```

Put Nginx or Caddy in front with SSL (Let's Encrypt):

```nginx
# /etc/nginx/sites-available/lifevault
server {
    listen 443 ssl http2;
    server_name lifevault.app;

    ssl_certificate /etc/letsencrypt/live/lifevault.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lifevault.app/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Update `CLIENT_URL=https://lifevault.app` in backend `.env`.

---

## Option 2: Render

**Use the full step-by-step guide:** [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)

Summary (avoids common failures):

1. Deploy **backend** as a Node Web Service (`rootDir: backend`, health `/health`)
2. Deploy **frontend** as a **Static Site** (`rootDir: frontend`, publish `dist`) — not Docker
3. Set frontend build env: `VITE_API_URL=https://YOUR-API.onrender.com/api/v1`
4. Add SPA rewrite: `/*` → `/index.html`
5. Set backend `CLIENT_URL` + `FRONTEND_URL` to your Static Site URL (no trailing slash)

Do **not** use the frontend Dockerfile on Render — its nginx proxies to hostname `backend`, which only works with docker-compose.

---

## Option 3: Railway

### Backend

1. New Project → Deploy from GitHub
2. Set root to `backend/`
3. Railway auto-detects Node.js
4. Add environment variables
5. Generate domain: `https://lifevault-api.up.railway.app`

### Frontend

1. New service → `frontend/`
2. Use Dockerfile or Nixpacks with build command `npm run build`
3. Serve `dist` with `npx serve -s dist` OR use the provided `frontend/Dockerfile`

Set `CLIENT_URL` to your frontend Railway URL.

---

## MongoDB Atlas Setup

1. Create free M0 cluster
2. Database Access → create user with read/write
3. Network Access → add deployment IP (or `0.0.0.0/0` for testing)
4. Connect → Drivers → copy connection string
5. Replace `<password>` and set database name: `lifevault`

```
mongodb+srv://user:pass@cluster.mongodb.net/lifevault?retryWrites=true&w=majority
```

---

## Cloudinary Setup

1. Create account at cloudinary.com
2. Dashboard → copy Cloud Name, API Key, API Secret
3. Folders auto-created: `lifevault/profile-photos`, `lifevault/documents`

---

## Email (Production)

Replace Mailtrap with a production provider:

**SendGrid example:**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
EMAIL_FROM_ADDRESS=noreply@lifevault.app
```

---

## Post-Deployment Verification

1. `GET https://your-api.com/health` → `{ success: true }`
2. Register a new account → verification email received
3. Login → dashboard loads
4. Upload document → appears in vault
5. Open QR emergency URL in incognito → only safe fields visible
6. Promote admin user in MongoDB → admin panel accessible

---

## Security Hardening (Production)

- Use unique JWT secrets (64+ characters)
- Set `NODE_ENV=production` (enables secure cookies)
- Restrict MongoDB Atlas IP whitelist
- Enable Cloudinary signed URLs if needed
- Set up uptime monitoring on `/health`
- Configure log aggregation (Render/Railway logs or Datadog)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Verify `CLIENT_URL` matches exact frontend origin |
| Cookies not persisting | Ensure HTTPS in production; `secure: true` cookies |
| MongoDB connection failed | Check Atlas IP whitelist and credentials |
| Cloudinary upload fails | Verify API secret and folder permissions |
| 404 on page refresh | SPA must serve `index.html` for all routes (nginx `try_files`) |

---

## CI/CD (Optional)

Add GitHub Actions to run lint + build on push:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci
      - run: cd frontend && npm ci && npm run build
```
