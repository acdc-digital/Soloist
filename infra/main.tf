// INFRASTRUCTURE FOR DEPLAYMENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/infra/main.tf

// INFRASTRUCTURE FOR DEPLOYMENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/infra/main.tf

terraform {
  required_version = ">= 1.6"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }

  # Uncomment and point to a backend if/when you move state off-disk
  # backend "remote" {}
}

provider "vercel" {
  api_token = var.vercel_api_token   # export TF_VAR_vercel_api_token in CI
  team      = "my-team-slug"         # omit if using a personal account
}

# ───────────────────────────
# 1. Project
# ───────────────────────────
resource "vercel_project" "renderer" {
  name       = "soloist-dashboard"
  framework  = "nextjs"

  # GitHub repo details (object is required by provider schema)
  git_repository = {
    type              = "github"
    repo              = "your-org/soloist"  # org_or_user/repo
    production_branch = "main"
  }

  # Path inside the mono-repo that Vercel should build
  root_directory = "renderer"

  # Example: skip building Convex functions when Vercel runs `yarn install`
  ignore_command = "echo 'convex functions are built separately'"
}

# ───────────────────────────
# 2. Environment variables
# ───────────────────────────
resource "vercel_project_environment_variable" "convex_url" {
  project_id = vercel_project.renderer.id
  key        = "CONVEX_URL"
  value      = var.convex_url
  target     = ["production", "preview", "development"]
}

# repeat for CONVEX_DEPLOY_KEY, NEXT_PUBLIC_API_URL, etc.

# ───────────────────────────
# 3. Domain
# ───────────────────────────
resource "vercel_project_domain" "primary" {
  project_id = vercel_project.renderer.id
  domain     = "app.example.com"
  redirect   = false
  git_branch = "main"
}

# ───────────────────────────
# 4. Optional log drain
# ───────────────────────────
# resource "vercel_log_drain" "datadog" {
#   project_id  = vercel_project.renderer.id
#   endpoint    = "https://http-intake.logs.datadoghq.com/v1/input"
#   provider    = "datadog"
#   name        = "datadog-drain"
# }

# ───────────────────────────
# 5. Variables
# ───────────────────────────
variable "vercel_api_token" {
  type        = string
  description = "API token from your Vercel account or team"
}

variable "convex_url" {
  type        = string
  description = "Convex deployment URL, e.g. https://original-skunk-47.convex.cloud"
}