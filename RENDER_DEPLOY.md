# Deploy LifeVault to Render (Frontend + Backend)

This guide uses the **reliable Render setup**:

| Service | Type | Why |
|---------|------|-----|
| `lifevault-api` | Web Service (Node) | Runs Express on port assigned by Render |
| `lifevault-web` | Static Site | Serves Vite `dist`; no broken Docker nginx proxy |

> Do **not** deploy the frontend Docker image on Render. Its nginx proxies to hostname `backend`, which only exists in `docker-compose`, not on Render.

---

## Before you start (checklist)

- [ ] Code pushed to GitHub: `https://github.com/udanya23/lifevault`
- [ ] MongoDB Atlas cluster ready (`lifevault` database)
- [ ] Atlas **Network Access** allows `0.0.0.0/0` (or Render IPs)
- [ ] Cloudinary Cloud Name + API Key + API Secret
- [ ] Gmail App Password (or other SMTP) for OTP emails
- [ ] Render account (free plan is fine)

---

## Step 1 — Deploy Backend first

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect repo `udanya23/lifevault`
3. Settings:

| Field | Value |
|-------|-------|
| Name | `lifevault-api` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |
| Health Check Path | `/health` |

4. Add **Environment** variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_ACCESS_SECRET` | long random string (Generate) |
| `JWT_REFRESH_SECRET` | different long random string |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | leave blank for now — fill after frontend deploys |
| `FRONTEND_URL` | leave blank for now — same as CLIENT_URL later |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | your Gmail |
| `EMAIL_PASS` | Gmail App Password |
| `EMAIL_FROM_NAME` | `LifeVault` |
| `EMAIL_FROM_ADDRESS` | your Gmail |

5. Click **Create Web Service** and wait until it is **Live**.
6. Open: `https://lifevault-api-XXXX.onrender.com/health`  
   Expect: `{ "success": true, ... }`
7. **Copy the backend URL** (example: `https://lifevault-api-xxxx.onrender.com`)

---

## Step 2 — Deploy Frontend (Static Site)

1. Render → **New** → **Static Site**
2. Same repo `udanya23/lifevault`
3. Settings:

| Field | Value |
|-------|-------|
| Name | `lifevault-web` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

4. Add environment variable (**critical — baked into the build**):

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://lifevault-api-XXXX.onrender.com/api/v1` |

Use your real backend URL from Step 1. No trailing slash after `v1`.

5. After deploy, open **Redirects/Rewrites** (or Routes) and add:

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | **Rewrite** |

This is required so `/dashboard`, `/emergency/:token`, etc. work on refresh.

6. Copy the frontend URL (example: `https://lifevault-web-xxxx.onrender.com`)

---

## Step 3 — Connect Backend ↔ Frontend (CORS + QR)

1. Open **lifevault-api** → Environment
2. Set both (exact frontend URL, **https**, **no trailing slash**):

| Key | Value |
|-----|--------|
| `CLIENT_URL` | `https://lifevault-web-xxxx.onrender.com` |
| `FRONTEND_URL` | `https://lifevault-web-xxxx.onrender.com` |

3. **Save** → Render will redeploy the API automatically.
4. Open **QR Code Access** in the live app and refresh so QR links use the public frontend URL.

---

## Step 4 — Verify everything

1. `GET https://YOUR-API.onrender.com/health` → success  
2. Open frontend → Register with OTP email  
3. Login → Dashboard loads  
4. Add medical profile + emergency contact  
5. Open emergency URL in phone browser → styled page (not JSON)  
6. Activity Logs → QR Scans shows a new scan  

---

## Common errors & fixes

| Error | Cause | Fix |
|-------|--------|-----|
| CORS blocked | `CLIENT_URL` wrong | Must match frontend origin exactly (https, no trailing `/`) |
| Login works then session dies | Cookie / CORS | Confirm `NODE_ENV=production`, `CLIENT_URL` set, `VITE_API_URL` points to API |
| Frontend calls `localhost` or `/api/v1` and fails | `VITE_API_URL` missing at build | Set env var, then **Clear build cache & redeploy** frontend |
| MongoDB connection failed | Atlas network | Allow `0.0.0.0/0` in Network Access |
| OTP email not sent | Gmail password | Use App Password, not normal password; enable 2FA |
| Page refresh 404 on `/dashboard` | No SPA rewrite | Add `/*` → `/index.html` rewrite |
| Free tier “sleeping” | Render spins down | First request after idle can take ~30–60s — wait and retry |
| QR still opens localhost | Old QR / env | Set `FRONTEND_URL`, redeploy API, open QR page again |

---

## Optional: Blueprint deploy

If `render.yaml` is on `main`, you can use **New → Blueprint** and select this repo. You still must fill `sync: false` secrets and set `VITE_API_URL` / `CLIENT_URL` after URLs exist.

---

## After deploy — phone QR scans work

Because QR links use `FRONTEND_URL` / `CLIENT_URL` (your public `onrender.com` site), phones can open them from any network — no LAN IP needed.
