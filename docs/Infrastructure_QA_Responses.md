# Tubulu GCP Infrastructure: Q&A Response Document

This document provides detailed answers to the 6 critical infrastructure, sizing, managed services, cost estimation, and maintenance questions regarding the GCP cloud setup for the Tubulu Platform.

---

### 1. VM Specifications and Sizing Details Planned for the Setup
We are **not using raw Virtual Machines** (Compute Engine VMs) to host the backend API server. Instead, we have adopted a **modern serverless container architecture using Google Cloud Run**.
* **Instance Sizing Specifications**:
  * **CPU**: `1 vCPU`
  * **Memory**: `1 GB RAM` (scalable to `2 GB` under analytical stress).
  * **Autoscaling Boundaries**:
    * **QA/UAT Environment**: Minimum Instances = `0` (scales to zero when idle, completely eliminating compute billing overnight and during weekends), Maximum Instances = `3`.
    * **Production Environment**: Minimum Instances = `1` (guarantees warm starts, eliminating any "cold start" latency), Maximum Instances = `10`.
* **Why this approach?** Cloud Run eliminates the overhead of VM operating system updates, kernel patches, SSH keys management, and manual server configurations, while providing dynamic horizontal scaling out-of-the-box.

---

### 2. Managed Services Specifications (PostgreSQL, Redis, File Storage, etc.)
Yes, we are heavily leveraging Google Cloud's fully managed services to ensure maximum reliability and a zero-operations overhead database ecosystem.

* **Database (PostgreSQL)**: **Google Cloud SQL for PostgreSQL (Version 15+)**
  * *QA Specifications*: Tier `db-f1-micro` (Shared core, 1 vCPU, 0.6 GB RAM), `10 GB SSD` storage (with auto-increase enabled), Single Zone.
  * *Production Specifications*: Custom Tier `db-custom-2-7680` (2 vCPU, 7.5 GB RAM), `50 GB SSD` storage, Multi-Zone High Availability (HA) failover enabled.
* **Cache & Queue Broker (Redis)**: **Google Cloud Memorystore for Redis**
  * *QA Specifications*: Basic Tier (Single node), `1 GB` memory capacity.
  * *Production Specifications*: Standard Tier (High Availability with primary/replica automatic failover), `2 GB` memory capacity.
* **Media & File Storage**: **Google Cloud Storage (GCS)**
  * *Specifications*: Regional Standard Bucket (e.g. `us-central1`). Serving logos, product catalogs, and documents via Google's edge CDN networks with custom CORS filters.
* **AI Conversational Core**: **Vertex AI Platform**
  * *Specifications*: Connects backend agents directly to managed Gemini 1.5 Flash/Pro APIs, completely bypassing the need to manage expensive GPU virtual machines.

---

### 3. Rough Costing Estimates
By adopting a Serverless scale-to-zero compute and shared-core DB instances, the monthly GCP operational costs are highly optimized:

* **QA / UAT Environment (Estimated: ~$25 – $40 / month)**:
  * *Google Cloud Run (Backend)*: ~$5/month (bills only when active; scales to $0 when idle).
  * *Cloud SQL Database*: ~$10 - $15/month.
  * *Memorystore Redis*: ~$15/month.
  * *Cloud Storage & Vertex AI API*: Pay-per-use, negligible (<$5/month).
* **Production Environment (Estimated: ~$150 – $250 / month)**:
  * *Google Cloud Run (Backend)*: ~$30 - $60/month (depends on baseline persistent traffic).
  * *Cloud SQL Database (Custom HA)*: ~$80 - $100/month.
  * *Memorystore Redis (HA Tier)*: ~$40/month.
  * *Cloud Storage, CDN & Vertex AI*: ~$20 - $50/month (varies based on customer transaction volumes).

---

### 4. Who will be Responsible for Managing and Maintaining the Setup?
* **Initial Setup & Provisioning**: Can be executed easily in minutes by your lead backend developer or system administrator using the step-by-step `gcloud` CLI commands we provided.
* **Ongoing Operations & Maintenance**: **Extremely minimal to none**. Because 90% of the stack utilizes serverless or managed services, Google Cloud automatically handles OS security patches, hardware failures, physical backups, database replication, and internal network routing. The only active task for the development team is merging pull requests to trigger automated deployments (handled easily by **GCP Cloud Build**).

---

### 5. Is this Environment Planned for QA/UAT or Production?
We have designed and documented **both** environments:
* **QA/UAT**: Configured strictly for functional validation, scaling down to zero when idle to minimize cloud spending.
* **Production**: Configured for high availability, automatic scaling, data replication, and high resilience.
* **Isolation**: The QA and Production environments will live in **completely isolated GCP projects** (`tubulu-qa-env` and `tubulu-prod-env`) with separate database keys and secret credentials to prevent database leakage.

---

### 6. Can this Setup be Handled In-House?
**Yes, 100%!** 
Because the architecture is built on top of high-level managed services rather than raw linux VMs (which require complex Kubernetes setups, load-balancers, and cluster configuration), **any in-house software developer or system administrator can easily manage, scale, and update this setup**. You do not need to contract a dedicated third-party DevOps agency.
