# 🚀 Computer Bazaar VPS Deployment & Maintenance Guide

Complete guide for deploying and maintaining **COMPUTER BAZAAR** on your Ubuntu VPS alongside other projects (PC Doctor on `5000`, WorkDreamPulse on `5001`).

---

## 📋 Architecture & Port Configuration

| Application | Domain | Port | PM2 Process Name | VPS Directory |
| :--- | :--- | :--- | :--- | :--- |
| **PC Doctor** | `pcdoctor...` | `5000` | `pcdoctor-backend` | `/var/www/pcdoctor/...` |
| **WorkDreamPulse** | `...` | `5001` | `workdreampulse-backend` | `/var/www/workdreampulse/...` |
| **Computer Bazaar (Backend)** | `computerbazaar.dreambill.tech/api` | `5002` | `computerbazaar-backend` | `/var/www/computerbazaar/backend/computer-bazar-backend` |
| **Computer Bazaar (Frontend)** | `computerbazaar.dreambill.tech` | `80/443` (Nginx Static) | N/A (Nginx Serves `dist`) | `/var/www/computerbazaar/frontend/compute-bazar-frontend` |

---

## 🛠️ Step-by-Step VPS Deployment Instructions

### 1. Update Frontend Code and Rebuild

SSH into your VPS and pull the latest `main` branch for the frontend:

```bash
cd /var/www/computerbazaar/frontend/compute-bazar-frontend
git pull origin main
npm install
npm run build
```

> The built files will be generated in `/var/www/computerbazaar/frontend/compute-bazar-frontend/dist`.

---

### 2. Update Backend Code and Environment

Navigate to the backend directory, pull changes, ensure `.env` is configured for port 5002, and restart PM2:

```bash
cd /var/www/computerbazaar/backend/computer-bazar-backend
git pull origin main
npm install
```

Verify/edit `/var/www/computerbazaar/backend/computer-bazar-backend/.env`:
```env
PORT=5002
NODE_ENV=production
MONGODB_URI=mongodb+srv://sntavels_db_user:reqSHlu6I4foFO5g@cluster0.bdzeeev.mongodb.net/computer_bazaar?retryWrites=true&w=majority
CLIENT_URL=https://computerbazaar.dreambill.tech
```

Restart or start the backend process with PM2:
```bash
# If process already exists:
pm2 restart computerbazaar-backend

# If process is not yet registered:
pm2 start server.js --name "computerbazaar-backend" --env production
pm2 save
```

Verify backend health:
```bash
curl http://127.0.0.1:5002/api/health
```
*(Should return status `online` and system `COMPUTER BAZAAR`)*

---

### 3. Verify Nginx Configuration for `computerbazaar.dreambill.tech`

Check your Nginx site configuration in `/etc/nginx/sites-available/computerbazaar`:

```nginx
server {
    server_name computerbazaar.dreambill.tech;

    client_max_body_size 25M;

    # 1. React SPA Frontend
    location / {
        root /var/www/computerbazaar/frontend/compute-bazar-frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;

        location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp)$ {
            expires 1y;
            add_header Cache-Control "public, max-age=31536000, immutable";
            access_log off;
        }
    }

    # 2. Express Backend API Proxy (Port 5002)
    location /api {
        proxy_pass http://127.0.0.1:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # 3. Uploads Static Directory
    location /uploads {
        alias /var/www/computerbazaar/backend/computer-bazar-backend/uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 4. SSL Certificate (HTTPS)

If SSL is not yet configured for `computerbazaar.dreambill.tech`:
```bash
sudo certbot --nginx -d computerbazaar.dreambill.tech
```

---

## 🔄 Quick Update Command (Future Deployments)

```bash
# Update Frontend
cd /var/www/computerbazaar/frontend/compute-bazar-frontend && git pull origin main && npm run build

# Update Backend
cd /var/www/computerbazaar/backend/computer-bazar-backend && git pull origin main && pm2 restart computerbazaar-backend
```
