# 🛍️ EasyShop — DevSecOps & GitOps Platform on AWS EKS

[![Terraform](https://img.shields.io/badge/Terraform-%3E%3D1.5-7B42BC?style=flat-square&logo=terraform)](https://www.terraform.io/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=flat-square&logo=jenkins)](https://www.jenkins.io/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS-326CE5?style=flat-square&logo=kubernetes)](https://kubernetes.io/)
[![ArgoCD](https://img.shields.io/badge/ArgoCD-GitOps-EF7B4D?style=flat-square&logo=argo)](https://argo-cd.readthedocs.io/)
[![SonarQube](https://img.shields.io/badge/SonarQube-SAST-4E9BCD?style=flat-square&logo=sonarqube)](https://www.sonarqube.org/)
[![Trivy](https://img.shields.io/badge/Trivy-CVE%20Scan-1904DA?style=flat-square&logo=aquasecurity)](https://trivy.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

EasyShop is a production-grade full-stack e-commerce application built with **Next.js 14**, **TypeScript**, and **MongoDB 7.0**, deployed on **Amazon EKS** using a fully automated DevSecOps and GitOps pipeline.

**What this project demonstrates end-to-end:**
- 🔄 **10-stage Jenkins CI pipeline** — clean workspace → unit tests → SonarQube SAST → Trivy FS scan → Docker build → Trivy image scan → DockerHub push → manifest update → GitOps commit
- 🔒 **Security at every layer** — code analysis, filesystem scan, image CVE scan, non-root containers, Kubernetes Secrets
- ☸️ **GitOps via ArgoCD** — manifest in Git is the single source of truth; every Jenkins build auto-commits the new image tag and ArgoCD syncs EKS with no manual intervention
- ☁️ **Terraform IaC on AWS** — EKS cluster (`easyshop-eks-cluster`) in `us-east-1` with VPC, public/private/intra subnets across 2 AZs, SPOT node group (`t3.small`)
- 🐳 **Two Docker images** — multi-stage app image + dedicated TypeScript migration image, both run as non-root user
- 📦 **13 Kubernetes manifests** — Namespace, PVC (gp3, 5Gi), ConfigMap, Secret, StatefulSet, Services, Deployment (with startup/readiness/liveness probes), HPA (1–3 replicas, 70% CPU), Job, Ingress (AWS ALB)

> 🔗 **Repo:** [github.com/snehabasuthkar108/easyshop-devsecops-gitops](https://github.com/snehabasuthkar108/easyshop-devsecops-gitops)
> 🐳 **DockerHub:** [hub.docker.com/u/sneha108](https://hub.docker.com/u/sneha108)

---

## 📌 Table of Contents

- [Application Features](#-application-features)
- [Repository Structure](#-repository-structure)
- [Architecture Overview](#-architecture-overview)
- [Jenkins CI Pipeline — All 10 Stages](#-jenkins-ci-pipeline--all-10-stages)
- [Docker Images](#-docker-images)
- [Terraform Infrastructure](#-terraform-infrastructure)
- [Kubernetes Manifests](#-kubernetes-manifests)
- [Security Implementation](#-security-implementation)
- [Prerequisites](#-prerequisites)
- [Setup Guide](#-setup-guide)
  - [1. Provision Infrastructure with Terraform](#1-provision-infrastructure-with-terraform)
  - [2. Jenkins CI Setup](#2-jenkins-ci-setup)
  - [3. ArgoCD GitOps CD Setup](#3-argocd-gitops-cd-setup)
  - [4. AWS Load Balancer Controller](#4-aws-load-balancer-controller)
- [Local Development with Docker Compose](#-local-development-with-docker-compose)
- [Terraform Outputs](#-terraform-outputs)
- [Deployment](#-deployment)

---

## ✨ Application Features

| Feature | Details |
|---|---|
| 🎨 UI | Responsive design with Dark / Light mode |
| 🔐 Auth | JWT + NextAuth — stateless, token-based sessions |
| 🛒 Cart | Real-time cart management with Redux |
| 📱 Mobile-first | Tailwind CSS responsive layout |
| 🔍 Search | Advanced product search and filtering |
| 👤 Profile | User profiles and order history |
| 📦 Categories | Electronics, clothing, grocery, medicine, furniture, books, beauty, snacks, bakery, bags |
| 💳 Checkout | Secure checkout process |

---

## 📁 Repository Structure

```
easyshop-devsecops-gitops/
├── src/                        # Next.js 14 application source
├── public/                     # Static assets
├── .db/
│   └── db.json                 # Seed data for DB migration
├── scripts/
│   ├── Dockerfile.migration    # Migration container image
│   ├── migrate-data.ts         # TypeScript migration script
│   └── tsconfig.json           # TS config for migration scripts
├── kubernetes/                 # All K8s manifests (ArgoCD source)
│   ├── 00-cluster-issuer.yml
│   ├── 01-namespace.yaml
│   ├── 03-mongodb-pvc.yaml
│   ├── 04-configmap.yaml
│   ├── 05-secrets.yaml
│   ├── 06-mongodb-service.yaml
│   ├── 07-mongodb-statefulset.yaml
│   ├── 08-easyshop-deployment.yaml  ← Jenkins updates image tag here
│   ├── 09-easyshop-service.yaml
│   ├── 10-ingress.yaml
│   ├── 11-hpa.yaml
│   └── 12-migration-job.yaml
├── terraform/
│   ├── provider.tf             # Providers, locals, region, VPC CIDRs
│   ├── eks.tf                  # EKS cluster + managed node group
│   └── outputs.tf              # region, vpc_id, cluster name/endpoint, node IPs
├── Dockerfile                  # App image (multi-stage, non-root)
├── Dockerfile.dev              # Dev image
├── docker-compose.yml          # Local dev: mongodb + migration + app
├── Jenkinsfile                 # 10-stage CI pipeline
└── JENKINS.md                  # Jenkins setup reference
```

---

## 🏗️ Architecture Overview

### Application — Three-Tier

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Tier                     │
│      Next.js 14 │ Redux │ Tailwind CSS │ TypeScript     │
├─────────────────────────────────────────────────────────┤
│                   Application Tier                      │
│    Next.js API Routes │ NextAuth │ JWT │ Validation     │
├─────────────────────────────────────────────────────────┤
│                     Data Tier                           │
│         MongoDB 7.0 │ Mongoose ODM │ StatefulSet        │
└─────────────────────────────────────────────────────────┘
```

### DevSecOps + GitOps Flow

```
Developer pushes to main
         │
         ▼ (GitHub webhook)
    Jenkins CI — 10 stages
         │
         ├─ 1. Clean Workspace
         ├─ 2. Checkout Code (main branch)
         ├─ 3. Install Dependencies  (npm install)
         ├─ 4. Run Unit Tests        (npm test)
         ├─ 5. SonarQube Analysis    (sonar-scanner, project: easyshop)
         ├─ 6. Trivy FS Scan         (HIGH,CRITICAL — pre-build)
         ├─ 7. Build Docker Image    (sneha108/easy-shop-app:<BUILD_NUMBER>)
         ├─ 8. Trivy Image Scan      (HIGH,CRITICAL — post-build)
         ├─ 9. Push to DockerHub     (:<BUILD_NUMBER> + :latest)
         └─10. Update kubernetes/08-easyshop-deployment.yaml
               git commit + push → main
                        │
                        ▼ (ArgoCD detects Git change)
               Amazon EKS — easyshop-eks-cluster (us-east-1)
               Auto-sync → rolling deploy of new image
```

---

## 🔄 Jenkins CI Pipeline — All 10 Stages

Defined in [`Jenkinsfile`](./Jenkinsfile). Self-contained — no shared libraries required.

| # | Stage | Command / Tool | Detail |
|---|---|---|---|
| 1 | **Clean Workspace** | `cleanWs()` | Fresh workspace every build |
| 2 | **Checkout Code** | `git` | Clones `main` branch |
| 3 | **Install Dependencies** | `npm install` | Installs Node packages |
| 4 | **Run Unit Tests** | `npm test` | Non-blocking (`\|\| true`) |
| 5 | **SonarQube Analysis** | `sonar-scanner` | Project key: `easyshop`, uses `$SONAR_HOST_URL` + `$SONAR_AUTH_TOKEN` |
| 6 | **Trivy FS Scan** | `trivy fs .` | Scans filesystem — HIGH, CRITICAL only |
| 7 | **Build App Image** | `docker build` | Tags as `sneha108/easy-shop-app:<BUILD_NUMBER>` |
| 8 | **Trivy Image Scan** | `trivy image` | Scans built image — HIGH, CRITICAL only |
| 9 | **Push to DockerHub** | `docker push` | Pushes `:<BUILD_NUMBER>` and `:latest` |
| 10 | **Update K8s Manifest** | `sed` + `git push` | Updates `kubernetes/08-easyshop-deployment.yaml`; commits as `Jenkins CI` (snehabasuthkar108@gmail.com) |

### Jenkins Environment Variables

| Variable | Value |
|---|---|
| `DOCKER_IMAGE_NAME` | `sneha108/easy-shop-app` |
| `DOCKER_MIGRATION_IMAGE_NAME` | `sneha108/easy-shop-migration` |
| `IMAGE_TAG` | `${BUILD_NUMBER}` |
| `DOCKER_CREDENTIALS` | `docker-hub-credentials` (Jenkins credential ID) |
| `SONARQUBE_SERVER` | `sonarqube` (Jenkins SonarQube server name) |
| `GIT_REPO` | `https://github.com/snehabasuthkar108/easyshop-devsecops-gitops.git` |

---

## 🐳 Docker Images

### Image 1 — App (`sneha108/easy-shop-app`)

[`Dockerfile`](./Dockerfile) — **two-stage build**:

```
Stage 1: builder (node:18-alpine)
  ├── apk add python3 make g++   # native build deps
  ├── npm ci                      # clean install from lockfile
  └── npm run build               # Next.js standalone output

Stage 2: runner (node:18-alpine)
  ├── addgroup appgroup / adduser appuser
  ├── COPY .next/standalone, .next/static, public
  ├── chown -R appuser:appgroup /app
  ├── USER appuser                # non-root execution
  ├── ENV NODE_ENV=production, PORT=3000
  ├── EXPOSE 3000
  └── CMD ["node", "server.js"]
```

### Image 2 — Migration (`sneha108/easy-shop-migration`)

[`scripts/Dockerfile.migration`](./scripts/Dockerfile.migration) — single stage:

```
FROM node:18-alpine
  ├── apk add python3 make g++
  ├── npm ci + copy tsconfig.json
  ├── COPY scripts/ and .db/      # TypeScript migration + seed data
  ├── addgroup appgroup / adduser appuser (non-root)
  ├── chown + USER appuser
  └── CMD ["npx", "ts-node", "--project", "scripts/tsconfig.json",
             "scripts/migrate-data.ts"]
```

**What `migrate-data.ts` does:**
- Connects to MongoDB via `MONGODB_URI` (from ConfigMap)
- Reads product seed data from `.db/db.json`
- Clears existing `products` collection
- Normalises image paths by category (`electronics→gadgetsImages`, `grocery→groceryImages`, etc.)
- Inserts all products with zero-padded unique `_id`s
- Disconnects cleanly — Job exits 0 on success

### Docker Compose — Local Dev

[`docker-compose.yml`](./docker-compose.yml) — 3 services on `easyshop-network`:

| Service | Image | Port | Start Condition |
|---|---|---|---|
| `mongodb` | `mongo:7.0` | `27017` | Health check: `mongosh ping` (10s interval, 5 retries) |
| `migration` | Built from `scripts/Dockerfile.migration` | — | After `mongodb` is **healthy** |
| `app` | Built from `Dockerfile` | `3000` | After `migration` **completes successfully** |

Data persisted in named volume: `mongodb_data`.

---

## ☁️ Terraform Infrastructure

All infrastructure is in [`/terraform`](./terraform/) — version-controlled, reproducible.

### Providers & Versions (`provider.tf`)

| Provider | Version |
|---|---|
| `hashicorp/aws` | `~> 5.100` |
| `hashicorp/kubernetes` | `~> 2.30` |
| `hashicorp/tls` | `~> 4.0` |
| `hashicorp/cloudinit` | `~> 2.3` |
| `hashicorp/time` | `~> 0.12` |
| Terraform | `>= 1.5` |

### Network Layout (`provider.tf` locals)

| Setting | Value |
|---|---|
| Region | `us-east-1` |
| Cluster name | `easyshop-eks-cluster` |
| VPC CIDR | `10.0.0.0/16` |
| Availability Zones | `us-east-1a`, `us-east-1b` |
| Public subnets | `10.0.1.0/24`, `10.0.2.0/24` |
| Private subnets | `10.0.3.0/24`, `10.0.4.0/24` |
| Intra subnets (control plane) | `10.0.5.0/24`, `10.0.6.0/24` |

### EKS Cluster (`eks.tf`)

| Setting | Value |
|---|---|
| Terraform module | `terraform-aws-modules/eks/aws` v19.15.1 |
| Public endpoint | Enabled |
| Cluster addons | `coredns`, `kube-proxy`, `vpc-cni` (all latest) |
| Node group name | `easyshop-ng` |
| Instance type | `t3.small` |
| Capacity type | **SPOT** |
| Node count | min: 1 / desired: 1 / max: 1 |
| Disk size | 35 GB |
| Subnets | Public subnets (worker nodes) + intra subnets (control plane) |

### Resource Tags

```
Project     = "EasyShop-DevSecOps"
Owner       = "Sneha"
Environment = "Dev"
ManagedBy   = "Terraform"
Repository  = "easyshop-devsecops-gitops"
```

### Terraform Outputs (`outputs.tf`)

| Output | Description |
|---|---|
| `region` | AWS region |
| `vpc_id` | VPC ID |
| `eks_cluster_name` | EKS cluster name |
| `eks_cluster_endpoint` | EKS API server endpoint |
| `eks_node_group_public_ips` | Public IPs of running worker nodes |

---

## ☸️ Kubernetes Manifests

All manifests are in [`/kubernetes`](./kubernetes/) — ArgoCD watches this path.
Namespace: `easyshop` | Labels: `managed-by: argocd`, `environment: dev`

### 00 — ClusterIssuer (`00-cluster-issuer.yml`)
- **Type:** `cert-manager.io/v1` ClusterIssuer
- **Name:** `letsencrypt-prod`
- **ACME server:** `https://acme-v02.api.letsencrypt.org/directory`
- **Challenge solver:** HTTP01 via Nginx ingress class

### 01 — Namespace (`01-namespace.yaml`)
- **Name:** `easyshop`
- **Labels:** `app: easyshop`, `environment: dev`, `managed-by: argocd`

### 03 — MongoDB PVC (`03-mongodb-pvc.yaml`)
- **Name:** `mongodb-pvc`
- **Storage class:** `gp3` (AWS EBS)
- **Access mode:** `ReadWriteOnce`
- **Size:** `5Gi`

### 04 — ConfigMap (`04-configmap.yaml`)
- **Name:** `easyshop-config`

| Key | Value |
|---|---|
| `MONGODB_URI` | `mongodb://mongodb-service:27017/easyshop` |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `http://easyshop-service/api` |
| `NEXTAUTH_URL` | `http://easyshop-service` |

### 05 — Secret (`05-secrets.yaml`)
- **Name:** `easyshop-secrets` | **Type:** `Opaque`
- Keys: `JWT_SECRET`, `NEXTAUTH_SECRET`

### 06 — MongoDB Service (`06-mongodb-service.yaml`)
- **Name:** `mongodb-service` | **Type:** ClusterIP (default)
- Port `27017` → targetPort `27017`
- Selector: `app: mongodb`

### 07 — MongoDB StatefulSet (`07-mongodb-statefulset.yaml`)
- **Image:** `mongo:7.0` | **Replicas:** 1
- **Volume:** mounts `mongodb-pvc` at `/data/db`
- **Resources:** requests 256Mi/250m CPU → limits 512Mi/500m CPU
- **Liveness probe:** `tcpSocket :27017` (delay 30s, period 10s)
- **Readiness probe:** `tcpSocket :27017` (delay 10s, period 5s)

### 08 — App Deployment (`08-easyshop-deployment.yaml`) ← Jenkins updates this
- **Image:** `sneha108/easyshop-app:latest` (Jenkins replaces tag on every build)
- **Replicas:** 1 (scaled by HPA up to 3)
- **Env from:** `easyshop-config` (ConfigMap) + `easyshop-secrets` (Secret)
- **Explicit env vars:** `NEXTAUTH_URL` (ConfigMap), `NEXTAUTH_SECRET` + `JWT_SECRET` (Secrets)
- **Resources:** requests 256Mi/200m → limits 512Mi/500m
- **Startup probe:** `GET / :3000` — failureThreshold 30, period 10s
- **Readiness probe:** `GET / :3000` — delay 20s, period 15s
- **Liveness probe:** `GET / :3000` — delay 25s, period 20s

### 09 — App Service (`09-easyshop-service.yaml`)
- **Name:** `easyshop-service` | **Type:** `ClusterIP`
- Port `80` → targetPort `3000`
- Selector: `app: easyshop`

### 10 — Ingress (`10-ingress.yaml`)
- **Name:** `easyshop-ingress`
- **Controller:** AWS ALB (`kubernetes.io/ingress.class: alb`)
- **Scheme:** `internet-facing`
- **Target type:** `ip`
- Routes all traffic (`/`) to `easyshop-service:80`

### 11 — HPA (`11-hpa.yaml`)
- **Name:** `easyshop-hpa`
- **Target:** `easyshop` Deployment
- **Min replicas:** 1 | **Max replicas:** 3
- **Scale trigger:** CPU utilization > **70%** (autoscaling/v2)

### 12 — Migration Job (`12-migration-job.yaml`)
- **Image:** `sneha108/easy-shop-migration:latest`
- **Restart policy:** `OnFailure`
- **Env:** `MONGODB_URI` injected from `easyshop-config` ConfigMap
- **Resources:** requests 128Mi/100m → limits 256Mi/250m

---

## 🔒 Security Implementation

| Layer | Control | Detail |
|---|---|---|
| Code | **SAST** | SonarQube — project key `easyshop`; bugs, smells, coverage |
| Code | **Dependency scan** | Trivy FS scan before Docker build (HIGH, CRITICAL) |
| Image | **CVE scan** | Trivy image scan after build (HIGH, CRITICAL) |
| Container (app) | **Non-root** | `appuser` in `appgroup`; runs `node server.js` |
| Container (migration) | **Non-root** | Same `appuser`/`appgroup` pattern |
| Container | **Minimal image** | Multi-stage build — no source, dev tools, or build deps in final image |
| Kubernetes | **Secrets** | `JWT_SECRET` + `NEXTAUTH_SECRET` in K8s Secret (Opaque) |
| Kubernetes | **Resource limits** | All pods have requests + limits defined |
| Kubernetes | **Probes** | Startup, readiness, liveness on app; liveness + readiness on MongoDB |
| TLS | **Let's Encrypt** | ClusterIssuer `letsencrypt-prod` via cert-manager (HTTP01 challenge) |
| Auth | **Stateless tokens** | JWT + NextAuth |

---

## 📋 Prerequisites

> [!IMPORTANT]
> Install and configure all tools below before starting.

| Tool | Purpose | Required Version |
|---|---|---|
| Terraform | AWS infrastructure | `>= 1.5` |
| AWS CLI | AWS API access | v2.x |
| kubectl | Kubernetes management | v1.28+ |
| Docker | Build and run containers | v24+ |
| Helm | Install Nginx, cert-manager | v3.x |
| Node.js | Local development | v18+ |
| Git | Source control | v2.x |

---

## 🚀 Setup Guide

### 1. Provision Infrastructure with Terraform

#### Install Terraform (Linux)

```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
terraform -v   # Must be >= 1.5
```

#### Configure AWS CLI

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install unzip && unzip awscliv2.zip && sudo ./aws/install
aws configure
# Enter: Access Key ID, Secret Access Key, region: us-east-1, format: json
```

> [!NOTE]
> IAM user needs: `AmazonEKSFullAccess`, `AmazonEC2FullAccess`, `AmazonVPCFullAccess`, `IAMFullAccess`

#### Deploy Infrastructure

```bash
git clone https://github.com/snehabasuthkar108/easyshop-devsecops-gitops.git
cd easyshop-devsecops-gitops/terraform

terraform init
terraform plan
terraform apply    # Type 'yes' when prompted
```

Terraform provisions: VPC (`10.0.0.0/16`), 6 subnets across `us-east-1a`/`us-east-1b`, EKS cluster `easyshop-eks-cluster`, and node group `easyshop-ng` (SPOT `t3.small`).

#### Connect kubectl to EKS

```bash
aws eks --region us-east-1 update-kubeconfig --name easyshop-eks-cluster
kubectl get nodes   # Verify worker node is Ready
```

#### View Terraform Outputs

```bash
terraform output
# region, vpc_id, eks_cluster_name, eks_cluster_endpoint, eks_node_group_public_ips
```

---

### 2. Jenkins CI Setup

#### Check Jenkins

```bash
sudo systemctl status jenkins
# If not running:
sudo systemctl enable jenkins && sudo systemctl restart jenkins
```

Access UI: `http://<jenkins-ip>:8080`

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### Install Plugins

**Manage Jenkins → Plugins → Available Plugins** — install:
- ✅ Docker Pipeline
- ✅ SonarQube Scanner
- ✅ Pipeline View

#### Add Credentials

**Manage Jenkins → Credentials → (Global) → Add Credentials**

| Credential | Kind | ID |
|---|---|---|
| GitHub token | Username with password | `github-credentials` |
| DockerHub | Username with password | `docker-hub-credentials` |
| SonarQube token | Secret Text | (used by SonarQube server config) |

#### Configure SonarQube Server

**Manage Jenkins → Configure System → SonarQube Servers**
- Name: `sonarqube`
- URL: `http://<sonarqube-ip>:9000`

#### Create Pipeline Job

1. **New Item → Pipeline** → Name: `EasyShop`
2. **General:** ✅ GitHub project → `https://github.com/snehabasuthkar108/easyshop-devsecops-gitops`
3. **Triggers:** ✅ `GitHub hook trigger for GITScm polling`
4. **Pipeline:**
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repo URL: `https://github.com/snehabasuthkar108/easyshop-devsecops-gitops`
   - Credentials: `github-credentials`
   - Branch: `main`
   - Script Path: `Jenkinsfile`

#### Setup GitHub Webhook

**GitHub repo → Settings → Webhooks → Add webhook**
- Payload URL: `http://<jenkins-ip>:8080/github-webhook/`
- Content type: `application/json`
- Event: `Just the push event`

---

### 3. ArgoCD GitOps CD Setup

#### Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

watch kubectl get pods -n argocd   # Wait until all pods are Running
```

#### Expose ArgoCD UI

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address=0.0.0.0 &
# Access at https://<node-public-ip>:8080
```

#### Get Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo
```

#### Create ArgoCD Application

**New App** in UI:

| Field | Value |
|---|---|
| Application Name | `easyshop` |
| Project | `default` |
| Sync Policy | `Automatic` |
| Repo URL | `https://github.com/snehabasuthkar108/easyshop-devsecops-gitops` |
| Revision | `main` |
| Path | `kubernetes` |
| Cluster URL | `https://kubernetes.default.svc` |
| Namespace | `easyshop` |

Click **Create** — ArgoCD applies all 13 manifests in order and keeps them in sync with Git.

> From this point, every Jenkins build auto-commits a new image tag to `kubernetes/08-easyshop-deployment.yaml` and ArgoCD rolls out the update automatically — zero manual deploys.

---

### 4. AWS Load Balancer Controller

The Ingress uses `alb` class — the AWS Load Balancer Controller must be installed:

```bash
# Create IAM policy
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json

# Associate OIDC provider
eksctl utils associate-iam-oidc-provider \
  --region us-east-1 \
  --cluster easyshop-eks-cluster \
  --approve

# Create service account
eksctl create iamserviceaccount \
  --cluster easyshop-eks-cluster \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn arn:aws:iam::<ACCOUNT-ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve \
  --region us-east-1

# Install controller via Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=easyshop-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Verify
kubectl get deployment -n kube-system aws-load-balancer-controller
```

After the controller is running, apply the Ingress manifest — the ALB is provisioned automatically:

```bash
kubectl apply -f kubernetes/10-ingress.yaml
kubectl get ingress -n easyshop   # Note the ALB DNS name
```

---

## 💻 Local Development with Docker Compose

```bash
git clone https://github.com/snehabasuthkar108/easyshop-devsecops-gitops.git
cd easyshop-devsecops-gitops

# Configure environment
cp .env.local.example .env.local
# Edit .env.local — set MONGODB_URI, NEXTAUTH_SECRET, JWT_SECRET

# Generate secrets
openssl rand -base64 32   # → NEXTAUTH_SECRET
openssl rand -hex 32      # → JWT_SECRET

# Start all services
docker compose up --build
```

Startup order:
1. **MongoDB 7.0** starts → health checked via `mongosh ping`
2. **Migration** runs `migrate-data.ts` → seeds product data from `.db/db.json` → exits 0
3. **App** starts → available at `http://localhost:3000`

---

## 🧹 Teardown

```bash
# Destroy all AWS resources
cd terraform
terraform destroy   # Type 'yes' when prompted
```

> [!CAUTION]
> This deletes the EKS cluster, VPC, all subnets, and associated resources. Ensure you have no critical data in the cluster before running.

---

## 📸 Deployment

![EasyShop Deployed on AWS EKS](./public/Deployed.png)

---

## ✅ Summary — What This Project Demonstrates

| Area | Specifics |
|---|---|
| CI/CD | 10-stage Jenkins pipeline, GitHub webhook, non-blocking tests |
| SAST | SonarQube (project key: `easyshop`) |
| Container Security | Trivy FS + image scan (HIGH/CRITICAL), non-root user in both images |
| GitOps | ArgoCD auto-sync from `kubernetes/` path on `main` branch |
| IaC | Terraform `>= 1.5`, AWS provider `~> 5.100`, EKS module v19.15.1 |
| AWS | EKS (`easyshop-eks-cluster`), SPOT `t3.small`, VPC `10.0.0.0/16`, `us-east-1` |
| Kubernetes | 13 manifests — StatefulSet, Deployment, HPA (1–3 pods, 70% CPU), ALB Ingress, Job, PVC (gp3 5Gi), ClusterIssuer |
| Docker | 2 images — multi-stage app + TypeScript migration, both non-root |
| Local Dev | Docker Compose with health-checked startup ordering |

---

## 👩‍💻 Author

**Sneha Basuthkar**
Cloud & Infrastructure Engineer | DevOps Practitioner
🔗 [GitHub](https://github.com/snehabasuthkar108) | 📍 Hyderabad, India

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
