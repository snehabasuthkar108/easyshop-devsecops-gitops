terraform {

  required_version = ">= 1.5"

  required_providers {

    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }

    time = {
      source  = "hashicorp/time"
      version = "~> 0.12"
    }

    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }

    cloudinit = {
      source  = "hashicorp/cloudinit"
      version = "~> 2.3"
    }
  }
}

locals {

  region          = "us-east-1"
  name            = "easyshop-eks-cluster"
  vpc_cidr        = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]

  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
  intra_subnets   = ["10.0.5.0/24", "10.0.6.0/24"]

  tags = {
    Project     = "EasyShop-DevSecOps"
    Owner       = "Sneha"
    Environment = "Dev"
    ManagedBy   = "Terraform"
    Repository  = "easyshop-devsecops-gitops"
  }
}

provider "aws" {

  region = local.region

  default_tags {
    tags = local.tags
  }
}
