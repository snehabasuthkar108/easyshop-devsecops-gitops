# EasyShop DevSecOps GitOps Platform - Terraform

This folder provisions the infrastructure required for the EasyShop DevSecOps platform.

## Resources Created

- VPC
- Public and Private Subnets
- NAT Gateway
- Amazon EKS Cluster
- EKS Managed Node Group

## Connect to the Cluster

```bash
aws eks --region us-east-1 update-kubeconfig --name easyshop-eks-cluster
