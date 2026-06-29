# 🛍️ EasyShop — DevSecOps & GitOps Platform on AWS EKS

[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=flat-square&logo=terraform)](https://www.terraform.io/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=flat-square&logo=jenkins)](https://www.jenkins.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS-326CE5?style=flat-square&logo=kubernetes)](https://kubernetes.io/)
[![ArgoCD](https://img.shields.io/badge/ArgoCD-GitOps-EF7B4D?style=flat-square&logo=argo)](https://argo-cd.readthedocs.io/)
[![SonarQube](https://img.shields.io/badge/SonarQube-Code%20Quality-4E9BCD?style=flat-square&logo=sonarqube)](https://www.sonarqube.org/)
[![Trivy](https://img.shields.io/badge/Trivy-Security%20Scan-1904DA?style=flat-square&logo=aquasecurity)](https://trivy.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

EasyShop is a full-stack e-commerce application built with **Next.js 14**, **TypeScript**, and **MongoDB** — enhanced with a production-grade **DevSecOps and GitOps pipeline** on **Amazon EKS**.

The project demonstrates:
- 🔄 **10-stage Jenkins CI pipeline** with automated unit tests, code quality, security scanning, image build/push, and GitOps manifest update
- 🔒 **Security-first**: Trivy filesystem scan + Docker image scan, SonarQube static analysis, non-root container execution
- ☸️ **GitOps delivery**: ArgoCD watches the repo and auto-syncs Kubernetes manifests to EKS on every merge
- ☁️ **Infrastructure as Code**: Full AWS stack provisioned with Terraform (EKS, VPC, subnets, NAT Gateway, security groups)
- 🐳 **Local dev**: Docker Compose with 3 services, health checks, and automatic DB migration

> 🔗 **Repo:** [github.com/snehabasuthkar108/easyshop-devsecops-gitops](https://github.com/snehabasuthkar108/easyshop-devsecops-gitops)
> 🐳 **DockerHub:** [hub.docker.com/u/sneha108](https://hub.docker.com/u/sneha108)

---

## 📌 Table of Contents

- [Application Features](#-application-features)
- [Architecture Overview](#-architecture-overview)
- [Jenkins CI Pipeline — All 10 Stages](#-jenkins-ci-pipeline--all-10-stages)
- [Docker Setup](#-docker-setup)
- [Infrastructure — Terraform on AWS](#-infrastructure--terraform-on-aws)
- [Kubernetes Resources](#-kubernetes-resources)
- [Security Implementation](#-security-implementation)
- [Prerequisites](#-prerequisites)
- [Setup Guide](#-setup-guide)
  - [1. Provision Infrastructure with Terraform](#1-provision-infrastructure-with-terraform)
  - [2. Jenkins CI Setup](#2-jenkins-ci-setup)
  - [3. ArgoCD GitOps CD Setup](#3-argocd-gitops-cd-setup)
  - [4. Nginx Ingress Controller](#4-nginx-ingress-controller)
  - [5. TLS with Cert-Manager](#5-tls-with-cert-manager)
- [Local Development with Docker Compose](#-local-development-with-docker-compose)
- [Deployment](#-deployment)

---

## ✨ Application Features

| Feature | Details |
|---|---|
| 🎨 Modern UI | Responsive design with Dark / Light mode toggle |
| 🔐 Authentication | JWT + NextAuth — stateless, secure sessions |
| 🛒 Cart | Real-time cart management with Redux state |
| 📱 Mobile-first | Tailwind CSS responsive layout |
| 🔍 Search | Advanced product search and filtering |
| 👤 Profile | User profiles and order history |
| 📦 Categories | Multi-category product catalog |
| 💳 Checkout | Secure checkout process |

---

## 🏗️ Architecture Overview

### Application — Three-Tier Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Presentation Tier                       │
│       Next.js 14 Components │ Redux │ Tailwind CSS         │
├────────────────────────────────────────────────────────────┤
│                    Application Tier                        │
│  Next.js API Routes │ NextAuth │ JWT │ Request Validation  │
├────────────────────────────────────────────────────────────┤
│                       Data Tier                            │
│          MongoDB 7.0 │ Mongoose ODM │ CRUD Operations      │
└────────────────────────────────────────────────────────────┘
```

### DevSecOps + GitOps Flow

```
 Developer pushes code
         │
         ▼
      GitHub (main branch)
         │
         │  Webhook trigger
         ▼
      Jenkins (CI — 10 stages)
         │
         ├─ Clean Workspace
         ├─ Checkout Code
         ├─ Install Dependencies (npm install)
         ├─ Run Unit Tests (npm test)
         ├─ SonarQube Analysis (static code scan)
         ├─ Trivy FS Scan (filesystem vulnerabilities)
         ├─ Docker Build (sneha108/easy-shop-app:<BUILD_NUMBER>)
         ├─ Trivy Image Scan (image CVE scan — HIGH/CRITICAL)
         ├─ Push to DockerHub (tagged + latest)
         └─ Update K8s Manifest + Git Commit + Push
                   │
                   │  Git change detected
                   ▼
               ArgoCD (GitOps sync)
                   │
                   ▼
           Amazon EKS Cluster
           (kubernetes/08-easyshop-deployment.yaml updated)
```

---

## 🔄 Jenkins CI Pipeline — All 10 Stages

The pipeline is defined in [`Jenkinsfile`](./Jenkinsfile). Every stage is explicitly defined — no shared libraries or external Groovy scripts needed.

| # | Stage | What It Does |
|---|---|---|
| 1 | **Clean Workspace** | Wipes Jenkins workspace before every build |
| 2 | **Checkout Code** | Clones `main` branch from this repo |
| 3 | **Install Dependencies** | Runs `npm install` |
| 4 | **Run Unit Tests** | Runs `npm test` (non-blocking — pipeline continues on failure) |
| 5 | **SonarQube Analysis** | Static code analysis via `sonar-scanner` (project key: `easyshop`) |
| 6 | **Trivy FS Scan** | Scans filesystem for HIGH/CRITICAL vulnerabilities before build |
| 7 | **Build Application Image** | Builds `sneha108/easy-shop-app:<BUILD_NUMBER>` |
| 8 | **Trivy Image Scan** | Scans the built Docker image for HIGH/CRITICAL CVEs |
| 9 | **Push Image to DockerHub** | Pushes both `:<BUILD_NUMBER>` and `:latest` tags |
| 10 | **Update K8s Manifest + Commit** | Updates `kubernetes/08-easyshop-deployment.yaml` with new image tag and pushes to GitHub — ArgoCD picks this up automatically |

### Environment Variables Used in Pipeline

| Variable | Value |
|---|---|
| `DOCKER_IMAGE_NAME` | `sneha108/easy-shop-app` |
| `DOCKER_MIGRATION_IMAGE_NAME` | `sneha108/easy-shop-migration` |
| `IMAGE_TAG` | `${BUILD_NUMBER}` (auto-increments) |
| `DOCKER_CREDENTIALS` | `docker-hub-credentials` (Jenkins credential ID) |
| `SONARQUBE_SERVER` | `sonarqube` (Jenkins SonarQube server name) |
| `GIT_REPO` | `https://github.com/snehabasuthkar108/easyshop-devsecops-gitops.git` |

---

## 🐳 Docker Setup

### Multi-Stage Dockerfile

The [`Dockerfile`](./Dockerfile) uses a **two-stage build** to keep the production image lean and secure:

```
Stage 1 — Builder (node:18-alpine)
  ├── Install build dependencies (python3, make, g++)
  ├── npm ci (clean install from lockfile)
  └── npm run build (Next.js production build)

Stage 2 — Runner (node:18-alpine)
  ├── Create non-root user: appuser (group: appgroup)
  ├── Copy only built artifacts (.next/standalone, static, public)
  ├── chown to appuser
  ├── Switch USER to appuser
  └── CMD: node server.js (port 3000)
```

> **Security note:** The final image runs as a non-root user (`appuser`) and contains no source code, dev dependencies, or build tools — only the compiled Next.js standalone output.

### Docker Compose — Local Development

[`docker-compose.yml`](./docker-compose.yml) spins up the full stack locally with 3 services:

| Service | Image | Port | Notes |
|---|---|---|---|
| `mongodb` | `mongo:7.0` | `27017` | Health check via `mongosh ping`; data persisted in `mongodb_data` volume |
| `migration` | Built from `scripts/Dockerfile.migration` | — | Runs DB migrations; starts only after MongoDB is healthy |
| `app` | Built from `Dockerfile` | `3000` | Starts only after migration completes successfully |

All services share the `easyshop-network` bridge network.

#### Run locally

```bash
# Copy and configure your environment
cp .env.local.example .env.local
# Edit .env.local with your MONGODB_URI, NEXTAUTH_SECRET, JWT_SECRET

# Start all services
docker compose up --build

# App available at http://localhost:3000
```

---

## ☁️ Infrastructure — Terraform on AWS

All infrastructure is provisioned using **Terraform** — version-controlled, reproducible, and auditable. Terraform files are in [`/terraform`](./terraform/).

### AWS Resources

```
AWS Cloud (eu-west-1)
└── VPC
    ├── Public Subnets   → NAT Gateway │ Bastion Host (EC2)
    ├── Private Subnets  → EKS Managed Node Group
    └── Security Groups  → Controlled ingress/egress rules
         │
         └── Amazon EKS Cluster: tws-eks-cluster
                  └── Managed Node Group (EC2 worker nodes)
```

| Resource | Purpose |
|---|---|
| Amazon EKS | Managed Kubernetes control plane |
| VPC | Isolated network for the entire stack |
| Public Subnets | NAT Gateway and Bastion Host |
| Private Subnets | EKS worker nodes (not publicly accessible) |
| NAT Gateway | Outbound internet for private subnet nodes |
| Security Groups | Port-level access control |

---

## ☸️ Kubernetes Resources

Application is deployed via ArgoCD to EKS. Manifests are in [`/kubernetes`](./kubernetes/).

| Manifest | Resource | Purpose |
|---|---|---|
| `00-cluster-issuer.yaml` | ClusterIssuer | Let's Encrypt TLS issuer |
| `01-namespace.yaml` | Namespace | `easyshop` isolation |
| `02-mongodb-statefulset.yaml` | StatefulSet | MongoDB with stable storage |
| `03-mongodb-service.yaml` | Service | Internal MongoDB access |
| `04-configmap.yaml` | ConfigMap | Non-sensitive environment config |
| `05-secret.yaml` | Secret | JWT secret, MongoDB credentials |
| `06-migration-job.yaml` | Job | One-time DB schema migration |
| `07-hpa.yaml` | HorizontalPodAutoscaler | Auto-scale on CPU/memory |
| `08-easyshop-deployment.yaml` | Deployment | App pods — **image tag updated by Jenkins** |
| `09-easyshop-service.yaml` | Service | Internal ClusterIP routing |
| `10-ingress.yaml` | Ingress | External HTTPS via Nginx + TLS |

---

## 🔒 Security Implementation

| Layer | Control | Implementation |
|---|---|---|
| Code | Static Analysis | SonarQube — bugs, code smells, coverage |
| Code | Dependency Scan | Trivy FS scan before Docker build |
| Container | Image Scan | Trivy image scan — HIGH/CRITICAL CVEs blocked |
| Container | Non-root execution | `appuser` (non-root) runs the app process |
| Container | Minimal image | Multi-stage build — no dev tools in production image |
| Kubernetes | Secrets | JWT secret and DB credentials in K8s Secrets |
| Network | TLS/HTTPS | Cert-Manager + Let's Encrypt on Ingress |
| Auth | Stateless tokens | JWT + NextAuth-based authentication |

---

## 📋 Prerequisites

> [!IMPORTANT]
> Ensure the following tools are installed before you begin.

| Tool | Purpose | Min Version |
|---|---|---|
| Terraform | AWS infrastructure provisioning | v1.5+ |
| AWS CLI | AWS API interaction | v2.x |
| kubectl | Kubernetes cluster management | v1.28+ |
| Docker | Container build and local dev | v24+ |
| Helm | Kubernetes package manager (Nginx, Cert-Manager) | v3.x |
| Git | Source control | v2.x |
| Node.js | Local development | v18+ |

---

## 🚀 Setup Guide

### 1. Provision Infrastructure with Terraform

#### Install Terraform

```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
terraform -v
```

#### Configure AWS CLI

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install unzip && unzip awscliv2.zip
sudo ./aws/install
aws configure
```

> [!NOTE]
> `aws configure` will prompt for:
> - **AWS Access Key ID**
> - **AWS Secret Access Key**
> - **Default region:** `eu-west-1`
> - **Default output format:** `json`
>
> Your IAM user needs permissions for EKS, EC2, VPC, and IAM.

#### Clone Repo & Deploy Infrastructure

```bash
git clone https://github.com/snehabasuthkar108/easyshop-devsecops-gitops.git
cd easyshop-devsecops-gitops/terraform

# Generate SSH key for EC2 Bastion access
ssh-keygen -f terra-key
chmod 400 terra-key

# Provision AWS infrastructure
terraform init
terraform plan
terraform apply        # Type 'yes' when prompted
```

#### Connect to Bastion & Configure EKS Access

```bash
# SSH into Bastion Host
ssh -i terra-key ubuntu@<bastion-public-ip>

# Configure AWS CLI on Bastion
aws configure

# Update kubeconfig to connect to EKS
aws eks --region eu-west-1 update-kubeconfig --name tws-eks-cluster

# Verify cluster connectivity
kubectl get nodes
```

---

### 2. Jenkins CI Setup

#### Check Jenkins Service

```bash
sudo systemctl status jenkins
# If not running:
sudo systemctl enable jenkins && sudo systemctl restart jenkins
```

#### Access Jenkins UI

```
http://<jenkins-public-ip>:8080
```

Retrieve the initial admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### Install Required Plugins

**Manage Jenkins → Plugins → Available Plugins** — search and install:
- ✅ Docker Pipeline
- ✅ SonarQube Scanner
- ✅ Pipeline View

#### Configure Credentials

**Manage Jenkins → Credentials → (Global) → Add Credentials**

| Credential | Kind | Credential ID |
|---|---|---|
| GitHub | Username with password | `github-credentials` |
| DockerHub | Username with password | `docker-hub-credentials` |

#### Configure SonarQube Server

**Manage Jenkins → Configure System → SonarQube Servers**

- **Name:** `sonarqube`
- **Server URL:** `http://<sonarqube-ip>:9000`
- **Token:** Add as Secret Text credential

#### Create Jenkins Pipeline Job

1. **New Item → Pipeline** → Name it `EasyShop` → OK
2. **General:**
   - ✅ GitHub project
   - URL: `https://github.com/snehabasuthkar108/easyshop-devsecops-gitops`
3. **Build Triggers:** ✅ `GitHub hook trigger for GITScm polling`
4. **Pipeline:**
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/snehabasuthkar108/easyshop-devsecops-gitops`
   - Credentials: `github-credentials`
   - Branch: `main`
   - Script Path: `Jenkinsfile`

#### Setup GitHub Webhook

In your GitHub repo — **Settings → Webhooks → Add webhook:**
- Payload URL: `http://<jenkins-ip>:8080/github-webhook/`
- Content type: `application/json`
- Event: `Just the push event`

Click **Build Now** to trigger the first run.

---

### 3. ArgoCD GitOps CD Setup

#### Install ArgoCD on EKS

```bash
kubectl create namespace argocd

kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Monitor pod startup
watch kubectl get pods -n argocd
```

#### Expose ArgoCD UI

```bash
# Expose as NodePort
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

# Port-forward to access locally
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address=0.0.0.0 &
```

Access at: `https://<bastion-ip>:8080`

#### Get Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo
```

Login: **Username:** `admin` | **Password:** output from above

#### Create ArgoCD Application

**New App** in ArgoCD UI:

| Field | Value |
|---|---|
| Application Name | `easyshop` |
| Project | `default` |
| Sync Policy | `Automatic` |
| Repo URL | `https://github.com/snehabasuthkar108/easyshop-devsecops-gitops` |
| Path | `kubernetes` |
| Cluster URL | `https://kubernetes.default.svc` |
| Namespace | `easyshop` |

Click **Create** — ArgoCD will sync and deploy automatically. On every Jenkins pipeline run, the manifest is updated in Git and ArgoCD redeploys without any manual trigger.

---

### 4. Nginx Ingress Controller

```bash
kubectl create namespace ingress-nginx

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer

# Verify
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

---

### 5. TLS with Cert-Manager

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.12.0 \
  --set installCRDs=true

kubectl get pods -n cert-manager
```

#### Get LoadBalancer DNS & Configure Domain

```bash
kubectl get svc nginx-ingress-ingress-nginx-controller -n ingress-nginx \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Create a **CNAME record** in your DNS provider pointing your domain to this hostname.

#### Update ConfigMap with Your Domain

In `kubernetes/04-configmap.yaml`:

```yaml
NEXT_PUBLIC_API_URL: "https://<your-domain>/api"
NEXTAUTH_URL: "https://<your-domain>/"
```

#### Apply HTTPS Manifests

```bash
kubectl apply -f kubernetes/00-cluster-issuer.yaml
kubectl apply -f kubernetes/04-configmap.yaml
kubectl apply -f kubernetes/10-ingress.yaml
```

#### Verify TLS Certificate

```bash
kubectl get certificate -n easyshop
kubectl describe certificate easyshop-tls -n easyshop
kubectl get challenges -n easyshop
kubectl logs -n cert-manager -l app=cert-manager
```

---

## 💻 Local Development with Docker Compose

```bash
# Clone the repo
git clone https://github.com/snehabasuthkar108/easyshop-devsecops-gitops.git
cd easyshop-devsecops-gitops

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local — set MONGODB_URI, NEXTAUTH_SECRET, JWT_SECRET

# Build and start all services
docker compose up --build
```

Services started:
1. **MongoDB 7.0** — waits until healthy (mongosh ping check)
2. **Migration** — runs DB seed/migration, exits on success
3. **App (EasyShop)** — starts after migration completes, available at `http://localhost:3000`

---

## 📸 Deployment

![EasyShop Deployed on EKS](./public/Deployed.png)

---

## ✅ What This Project Demonstrates

| Area | Capability |
|---|---|
| CI/CD | 10-stage Jenkins pipeline with webhook trigger |
| Security | Trivy FS + image scan, SonarQube, non-root containers |
| GitOps | ArgoCD auto-sync from Git — zero manual deploys |
| IaC | Full AWS stack via Terraform |
| Kubernetes | 10+ K8s resource types, HPA, StatefulSet, Ingress, TLS |
| Containers | Multi-stage Docker build, Docker Compose local dev |
| Cloud | AWS EKS, VPC, ALB, EBS, NAT Gateway |

---

## 👩‍💻 Author

**Sneha Basuthkar**  
Cloud & Infrastructure Engineer
🔗 [GitHub](https://github.com/snehabasuthkar108) | 📍 Hyderabad, India

---

