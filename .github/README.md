# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for automated testing, building, and deployment.

## Quick Start

1. **Configure Secrets** - See [CICD_SETUP.md](./CICD_SETUP.md) for required secrets
2. **Push to develop** - Auto-deploys to dev environment
3. **Merge to main** - Auto-deploys to production

## Workflows

- **backend-deploy.yml** - Deploys backend to AWS (dev/staging/prod)
- **frontend-build.yml** - Builds and tests frontend
- **pr-checks.yml** - Runs checks on pull requests
- **security-scan.yml** - Scans for security vulnerabilities
- **manual-deploy.yml** - Manual deployment workflow

## Documentation

See [CICD_SETUP.md](./CICD_SETUP.md) for detailed setup instructions.

