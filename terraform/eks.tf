module "eks" {

  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.1"

  cluster_name                   = local.name
  cluster_endpoint_public_access = true

  # Enable IAM Roles for Service Accounts (IRSA)
  enable_irsa = true

  cluster_addons = {

    coredns = {
      most_recent = true
    }

    kube-proxy = {
      most_recent = true
    }

    vpc-cni = {
      most_recent = true
    }

    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.ebs_csi_irsa_role.iam_role_arn
    }
  }

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.public_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  eks_managed_node_group_defaults = {

    instance_types = ["t3.small"]

    attach_cluster_primary_security_group = true
  }

  eks_managed_node_groups = {

  easyshop-ng = {

    min_size     = 2
    desired_size = 3
    max_size     = 4

    instance_types = ["t3.small"]

    capacity_type = "ON_DEMAND"

    disk_size = 35

    use_custom_launch_template = false

    tags = {
      Name        = "easyshop-ng"
      Environment = "dev"
      Project     = "EasyShop-DevSecOps"
    }
  }
}
}
#########################################################
# IAM Role for EBS CSI Driver (IRSA)
#########################################################

module "ebs_csi_irsa_role" {

  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name             = "${local.name}-ebs-csi-driver"
  attach_ebs_csi_policy = true

  oidc_providers = {

    eks = {

      provider_arn = module.eks.oidc_provider_arn

      namespace_service_accounts = [
        "kube-system:ebs-csi-controller-sa"
      ]
    }
  }
}

#########################################################
# Running EC2 Instances
#########################################################

data "aws_instances" "eks_nodes" {

  instance_tags = {
    "eks:cluster-name" = module.eks.cluster_name
  }

  filter {
    name   = "instance-state-name"
    values = ["running"]
  }

  depends_on = [module.eks]
}
