# Tubulu GCP Compute Engine (GCE) QA Setup Guide

This document specifies the architecture, VM specifications, Docker-Compose stack, and secure HTTPS reverse proxy configurations to deploy the isolated **Tubulu QA Environment** directly on a **Google Compute Engine (GCE)** virtual machine.

---

## 🏗️ Compute Engine VM QA Architecture

Instead of separate managed database and cache instances, we bundle the entire QA environment (Node.js API, PostgreSQL, Redis) into a single, isolated GCE Virtual Machine running Docker-Compose. This keeps the monthly operational cost extremely low while providing simple, single-server deployment control.

```mermaid
graph TD
    subgraph Public Internet
        A["📱 Emulator / QA Clients"] --> |HTTPS / Port 443| Nginx["Nginx Reverse Proxy (SSL)"]
    end

    subgraph Compute Engine VM (Ubuntu 22.04)
        Nginx --> |Internal Proxy / Port 3008| API["Node.js Express API Container"]
        API --> |Internal Network / Port 5432| DB["PostgreSQL Container <br/>(Volume Persisted)"]
        API --> |Internal Network / Port 6379| Redis["Redis Container"]
    end
    
    classDef vm fill:#e3f2fd,stroke:#90caf9,color:#0d47a1;
    classDef container fill:#f3e5f5,stroke:#ce93d8,color:#4a148c;
    class Nginx,API,DB,Redis container;
```

---

## 📋 VM Specifications & Sizing (Cost-Optimized)

For a highly responsive QA sandbox that operates 24/7 at a fraction of standard cloud costs:

* **Machine Type**: `e2-small` (2 vCPUs, 2 GB RAM)
  * *Cost*: **~$14 / month** (Extremely economical baseline).
  * *Alternative (Free Tier)*: `e2-micro` (2 vCPUs, 1 GB RAM) is free-tier eligible on GCP, but `e2-small` is highly recommended to comfortably support Node.js, Postgres, and Redis simultaneously.
* **Operating System**: **Ubuntu 22.04 LTS (x86/64)**.
* **Boot Disk**: `30 GB Balanced Persistent Disk` (Provides solid read/write speeds with ample space for test databases and logs).
* **Networking & Security**:
  * Allocate a **Static External IP Address** (ensures your domain / emulator settings don't break when the VM restarts).
  * Enable **HTTP (Port 80)** and **HTTPS (Port 443)** firewall traffic.

---

## 🐳 Core Docker-Compose Configuration

To spin up the entire isolated QA ecosystem with a single command, we use Docker-Compose. Here is the `docker-compose.yml` to place on the GCE virtual machine:

```yaml
version: '3.8'

services:
  # 1. PostgreSQL Database Service
  postgres-db:
    image: postgres:15-alpine
    container_name: tubulu-qa-postgres
    restart: always
    environment:
      POSTGRES_DB: tubulu_qa
      POSTGRES_USER: postgres_qa
      POSTGRES_PASSWORD: secure_qa_password_2026
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432" # Keep private, accessible only locally
    networks:
      - tubulu-network

  # 2. Redis Caching & Queue Service
  redis-cache:
    image: redis:7-alpine
    container_name: tubulu-qa-redis
    restart: always
    ports:
      - "127.0.0.1:6379:6379" # Keep private, accessible only locally
    networks:
      - tubulu-network

  # 3. Node.js Backend API Service
  backend-api:
    image: us-central1-docker.pkg.dev/YOUR_PROJECT_ID/qa-repo/tubulu-backend:latest
    container_name: tubulu-qa-backend
    restart: always
    environment:
      - PORT=3008
      - NODE_ENV=staging
      - DB_HOST=postgres-db
      - DB_NAME=tubulu_qa
      - DB_USER=postgres_qa
      - DB_PASS=secure_qa_password_2026
      - REDIS_HOST=redis-cache
      - JWT_SECRET=qa_secret_signature_key
      - BASE_URL=https://qa-api.yourdomain.com
    ports:
      - "127.0.0.1:3008:3008" # Accessed via Nginx reverse proxy
    depends_on:
      - postgres-db
      - redis-cache
    networks:
      - tubulu-network

networks:
  tubulu-network:
    driver: bridge

volumes:
  pgdata:
    driver: local
```

---

## 🔒 Nginx & Let's Encrypt SSL Configuration

Android and iOS Emulators strictly require secure HTTPS connections. We configure Nginx on the VM to act as an SSL termination proxy:

```nginx
server {
    listen 80;
    server_name qa-api.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name qa-api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/qa-api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qa-api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🚀 Step-by-Step Provisioning Script (gcloud CLI)

Execute these commands in your local terminal to create the VM, allocate a static IP, and enable firewall rules:

```bash
# 1. Set the target GCP Project ID
gcloud config set project tubulu-qa-env

# 2. Reserve a static public external IP address for the QA VM
gcloud compute addresses create tubulu-qa-static-ip --region=us-central1

# 3. Create the GCE Virtual Machine (e2-small, Ubuntu 22.04)
# (Attaches the reserved static IP address automatically)
gcloud compute instances create tubulu-qa-vm \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-small \
    --boot-disk-size=30GB \
    --boot-disk-type=pd-balanced \
    --address=tubulu-qa-static-ip \
    --zone=us-central1-a \
    --tags=http-server,https-server

# 4. Open Ports 80 (HTTP) and 443 (HTTPS) in the GCP Firewall
gcloud compute firewall-rules create allow-http-https \
    --allow=tcp:80,tcp:443 \
    --target-tags=http-server,https-server \
    --description="Open HTTP and HTTPS web traffic for Nginx"
```

---

## 🛠️ Step-by-Step Software Installation (Inside the VM)

SSH into your GCE VM instance and install Docker, Docker-Compose, and Nginx:

```bash
# 1. SSH into the newly created VM
gcloud compute ssh tubulu-qa-vm --zone=us-central1-a

# 2. Update Ubuntu repositories and install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# 3. Start and enable Docker services
sudo systemctl start docker
sudo systemctl enable docker

# 4. Request the free automated SSL certificate via Certbot
# (Ensure your domain DNS points to the VM's static IP first)
sudo certbot --nginx -d qa-api.yourdomain.com
```

---

## 💰 Total Monthly Cost Projection (All-Inclusive)

* **Google Compute Engine VM (`e2-small`)**: **~$14.20 / month** (Runs Node API + Postgres + Redis).
* **Balanced Persistent Disk (`30 GB`)**: **~$3.00 / month**.
* **Static IP Address**: **$0.00 / month** (Free when attached to a running VM).
* **SSL Certificate (Let's Encrypt)**: **$0.00** (Free, auto-renewing).
* **GCP Network Egress (Data transfer)**: **~$1 – $3 / month** (Depends on test volumes).
* **Vertex AI API (Gemini)**: **Pay-per-use** (~$1 - $3/month).

**Total Monthly QA Cost: ~$18 – $23 / month!** (The most cost-effective staging layout possible).
