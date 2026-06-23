# Tubulu Monolith-to-Microservices Migration Plan

This document outlines the strategic architectural blueprint, module divisions, network routing maps, and a 4-Phase execution schedule to successfully refactor the monolithic Tubulu backend (223 endpoints) into a modern **Modular Microservices Architecture** on Google Cloud Platform.

---

## 🏗️ Target Architectural Design

Rather than maintaining a single monolithic server process, the platform is divided into **4 isolated core services** coordinated via an **API Gateway**:

```mermaid
graph TD
    subgraph Clients
        A["📱 Mobile Flutter App"] --> |HTTPS / Port 443| Gateway["Nginx API Gateway"]
        B["💻 Merchant Admin Portal"] --> |HTTPS / Port 443| Gateway
    end

    subgraph API Gateway Routing Table
        Gateway --> |/api/v1/user/* <br/> Port 3011| AuthSvc["🔑 Auth & User Service"]
        Gateway --> |/api/v1/catalogue/* <br/> Port 3012| CatalogSvc["📦 Merchant & Catalog Service"]
        Gateway --> |/api/v1/cart/* <br/> Port 3013| CommerceSvc["💳 Commerce & Order Service"]
        Gateway --> |/api/v1/chatRoom/* <br/> Port 3014| ChatAISvc["🤖 AI Chatbot Service"]
    end

    subgraph Storage & Cache Layers
        AuthSvc & CatalogSvc & CommerceSvc & ChatAISvc --> DB[("PostgreSQL <br/> (Logical Schema Partition)")]
        CommerceSvc & ChatAISvc --> RedisCache[("Redis Cluster <br/> (Queues & Session)")]
    end
    
    classDef client fill:#eceff1,stroke:#b0bec5,color:#37474f;
    classDef gateway fill:#e8f5e9,stroke:#a5d6a7,color:#1b5e20;
    classDef service fill:#e3f2fd,stroke:#90caf9,color:#0d47a1;
    classDef storage fill:#fff8e1,stroke:#ffe082,color:#ff6f00;
    
    class A,B client;
    class Gateway gateway;
    class AuthSvc,CatalogSvc,CommerceSvc,ChatAISvc service;
    class DB,RedisCache storage;
```

---

## 🗂️ Service Module Divisions

---

### 1️⃣ Authentication & User Service (`auth-service`) — `Port 3011`
*Focuses strictly on customer identity management, security credentials, and device linkages.*

* **Encompassed Routes**:
  * `/api/v1/user/*` (Customer logins, OTP checks, PIN verification)
  * `/api/v1/userDevice/*` (Push notification mapping keys)
  * `/api/v1/address/*` (Delivery shipping addresses)
* **Active Tables**: `Users`, `UserDevices`, `UserAddresses`
* **Infrastructure**: Zero external calls; serves as the central identity verifier issuing standard JWT signatures.

---

### 2️⃣ Merchant & Catalog Service (`catalog-service`) — `Port 3012`
*Maintains physical storefront registries, KYC validation documents, product directories, and vertical specifications.*

* **Encompassed Routes**:
  * `/api/v1/integrations/*` (Store profiles, KYC file uploads, branch networks)
  * `/api/v1/catalogue/*` (Folder divisions, menu groups)
  * `/api/v1/products/*` (SKU parameters, variant configurations, Swiggy import scrapers)
  * `/api/v1/customization/*` (Admin portal UI elements styles)
  * `/api/v1/qrcode/*` (Dynamic store check-in QR codes)
* **Active Tables**: `Integrations`, `Catalogues`, `Products`, `Customizations`, `QRCodes`, `BlockedIntegrations`
* **Cross-Service Hook**: Communicates with the `auth-service` via internal HTTP calls to verify merchant-admin profile updates.

---

### 3️⃣ Commerce & Transaction Service (`commerce-service`) — `Port 3013`
*Powers checkout checkouts, coupon distributions, marketing banner slider slots, and payment gateways.*

* **Encompassed Routes**:
  * `/api/v1/cart/*` (Checkout shopping list calculations)
  * `/api/v1/orders/*` (Checkout bookings, Razorpay webhook processor)
  * `/api/v1/deal/*` (Coupon validations, dynamic promo rules)
  * `/api/v1/advertisement/*` (Ad banner scheduling indices)
  * `/api/v1/settlements/*` (Payout files audits)
  * `/api/v1/payment-connection/*` (Gateway API keys setups)
* **Active Tables**: `Carts`, `Orders`, `Deals`, `Advertisements`, `Settlements`, `UserDealUsages`
* **Infrastructure**: Standard webhook listeners listening to Razorpay servers, writing transaction results directly to database schemas.

---

### 4️⃣ AI Chatbot & Messaging Service (`chat-ai-service`) — `Port 3014`
*Coordinates Gemini LLM plays, BullMQ broadcast queues, real-time WebSockets, and SMS networks.*

* **Encompassed Routes**:
  * `/api/v1/chatRoom/*` (WebSocket channels directories)
  * `/api/v1/chatMessage/*` (Messaging exchange, S3 uploads routing)
  * `/api/v1/ai-playbooks/*` (LLM instructions guidelines registers)
  * `/api/v1/ai/*` (Gemini API completions calls)
  * `/api/v1/whatsapp/*` (Meta API channels integrations)
  * `/api/v1/campaign/*` (BullMQ mass broadcast scheduler)
* **Active Tables**: `ChatRooms`, `ChatMessages`, `AICategoryPlaybooks`, `VendorAIConfigs`, `Campaigns`, `CampaignTemplates`, `MessageBookmarks`, `MessageNotes`
* **Infrastructure**: Requires high computational/networking bandwidth; heavily bound to standard **Redis memory queues** and **Vertex AI APIs**.

---

## 🛠️ The Implementation & Migration Roadmap

To transition smoothly without disrupting your current QA timelines, we execute a **4-Phase Roadmap**:

```mermaid
gantt
    title Monolith to Microservices Refactoring Roadmap (8 Weeks)
    dateFormat  YYYY-MM-DD
    section Phase 1: Workspace Decoupling
    Setup npm monorepo workspaces     :active, p1, 2026-06-01, 7d
    Build shared/ package (JWT, logger) :active, p2, after p1, 7d
    section Phase 2: Schema Isolation
    Segregate SQL models & schemas    :p3, after p2, 10d
    Refactor JOINs to internal APIs   :p4, after p3, 4d
    section Phase 3: Nginx Gateway Setup
    Configure Nginx Routing Tables     :p5, after p4, 7d
    Port-bind Auth, Catalog, Commerce  :p6, after p5, 7d
    section Phase 4: Staging Deployment
    Containerize services (Dockerfiles):p7, after p6, 7d
    Deploy and Auto-scale on GCP      :p8, after p7, 7d
```

### 📅 Phase 1: Repository Workspace Decoupling (Weeks 1-2)
* Restructure the codebase into a **Monorepo** using **npm workspaces**.
* Create a dedicated `shared/` directory to house common utilities:
  * [Postgres.js Connection Utils](file:///Users/pradeep/Desktop/Tubulu-v1/backend/Utils/Postgres.js)
  * [VerifyToken.Middleware](file:///Users/pradeep/Desktop/Tubulu-v1/backend/MiddleWare/VerifyToken.Middleware.js)
  * Logging structures, configurations, and baseline validators.

### 📅 Phase 2: Database Schema & Query Isolation (Weeks 3-4)
* Enforce **logical database schema partition** (e.g. Auth tables under schema `auth`, products tables under schema `inventory`).
* **Crucial Step**: Refactor SQL `JOIN` statements that cross service boundaries. Instead of joining `Products` with `Integrations` via a direct SQL query, the `inventory-service` queries the `catalog-service` over a lightweight internal HTTP `/internal/integrations/:id` API call.

### 📅 Phase 3: Nginx API Gateway Setup (Weeks 5-6)
* Place Nginx in front of all services. Nginx listens on Port `80`/`443` and handles SSL termination.
* Configure Nginx routing rules:
  ```nginx
  location /api/v1/user/ { proxy_pass http://127.0.0.1:3011; }
  location /api/v1/integrations/ { proxy_pass http://127.0.0.1:3012; }
  location /api/v1/catalogue/ { proxy_pass http://127.0.0.1:3012; }
  location /api/v1/products/ { proxy_pass http://127.0.0.1:3012; }
  location /api/v1/cart/ { proxy_pass http://127.0.0.1:3013; }
  location /api/v1/orders/ { proxy_pass http://127.0.0.1:3013; }
  location /api/v1/chatRoom/ { proxy_pass http://127.0.0.1:3014; }
  location /api/v1/ai/ { proxy_pass http://127.0.0.1:3014; }
  ```

### 📅 Phase 4: Dynamic Autoscaling on GCP Staging (Weeks 7-8)
* Containerize all four services separately using lightweight Alpine Dockerfiles.
* **The Magic of GCP**: You can easily keep standard database CRUD services (`auth`, `catalog`, `commerce`) running inside your cost-efficient **Compute Engine QA VM**, while deploying the high-intensity `chat-ai-service` to **Google Cloud Run (Serverless)**!
* This gives you instant autoscaling for LLM chat operations without paying for idling servers during testing off-hours!
