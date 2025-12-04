# CI/CD Setup Guide

This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### 1. **Backend Deploy** (`.github/workflows/backend-deploy.yml`)
- **Triggers:**
  - Push to `main` or `develop` branches (backend changes)
  - Pull requests to `main` or `develop`
  - Manual workflow dispatch
- **Jobs:**
  - Lint & Type Check
  - Deploy to Dev (on `develop` branch)
  - Deploy to Staging (manual)
  - Deploy to Production (on `main` branch)

### 2. **Frontend Build** (`.github/workflows/frontend-build.yml`)
- **Triggers:**
  - Push to `main` or `develop` branches (frontend changes)
  - Pull requests to `main` or `develop`
- **Jobs:**
  - Lint & Build
  - (Tests - commented out, ready to enable)

### 3. **PR Checks** (`.github/workflows/pr-checks.yml`)
- **Triggers:**
  - Pull requests to `main` or `develop`
- **Jobs:**
  - Backend checks (lint, type check, serverless config)
  - Frontend checks (lint, type check, build)

### 4. **Security Scan** (`.github/workflows/security-scan.yml`)
- **Triggers:**
  - Push to `main` or `develop`
  - Pull requests
  - Weekly schedule (Mondays at 00:00 UTC)
- **Jobs:**
  - NPM security audit for backend and frontend

### 5. **Manual Deploy** (`.github/workflows/manual-deploy.yml`)
- **Triggers:**
  - Manual workflow dispatch
- **Options:**
  - Deploy backend, frontend, or both
  - Choose stage: dev, staging, or prod

## Required GitHub Secrets

Configure these secrets in your GitHub repository:
**Settings > Secrets and variables > Actions > New repository secret**

### AWS Credentials (Required for Backend Deployment)
```
AWS_ACCESS_KEY_ID          # AWS IAM user access key
AWS_SECRET_ACCESS_KEY      # AWS IAM user secret key
```

### Backend Environment Variables

#### Dev Environment
```
OPENAI_API_KEY
WHATSAPP_VERIFY_TOKEN          # Webhook verification token
WHATSAPP_ACCESS_TOKEN          # WhatsApp API access token
WHATSAPP_PHONE_NUMBER_ID       # Phone Number ID (not Business Account ID)
NEXTAUTH_SECRET
```

**Note:** `WHATSAPP_PHONE_NUMBER_ID` is the Phone Number ID (found in WhatsApp > API Setup), not the Business Account ID. The Business Account ID is not needed for basic messaging and webhooks.

#### Staging Environment (Optional)
```
OPENAI_API_KEY_STAGING
WHATSAPP_VERIFY_TOKEN_STAGING
WHATSAPP_ACCESS_TOKEN_STAGING
WHATSAPP_PHONE_NUMBER_ID_STAGING  # Phone Number ID, not Business Account ID
NEXTAUTH_SECRET_STAGING
```

#### Production Environment
```
OPENAI_API_KEY_PROD
WHATSAPP_VERIFY_TOKEN_PROD
WHATSAPP_ACCESS_TOKEN_PROD
WHATSAPP_PHONE_NUMBER_ID_PROD  # Phone Number ID, not Business Account ID
NEXTAUTH_SECRET_PROD
```

**WhatsApp Business Account ID:** Not required for current implementation. The Business Account ID is automatically included in webhook payloads but is not used by our code. Only the Phone Number ID is needed for sending messages.

### Frontend Environment Variables (Optional)
```
NEXT_PUBLIC_API_URL        # API Gateway URL (defaults to current endpoint)
NEXT_PUBLIC_COGNITO_USER_POOL_ID  # AWS Cognito User Pool ID
NEXT_PUBLIC_COGNITO_CLIENT_ID     # AWS Cognito Client ID
```

### Frontend Deployment Platform Secrets

**For Vercel:**
```
VERCEL_TOKEN              # Vercel API token
VERCEL_ORG_ID            # Vercel organization ID
VERCEL_PROJECT_ID        # Vercel project ID
```

**For Netlify:**
```
NETLIFY_AUTH_TOKEN       # Netlify authentication token
NETLIFY_SITE_ID          # Netlify site ID
```

**For AWS Amplify:**
```
AMPLIFY_APP_ID           # AWS Amplify App ID (get from Amplify console)
```

**Note:** Frontend deployment is configured for AWS Amplify. See `AMPLIFY_SETUP.md` for detailed setup instructions.

## Setup Instructions

### 1. Configure AWS IAM User

Create an IAM user with deployment permissions:

```bash
# Create IAM user
aws iam create-user --user-name github-actions-deploy

# Attach policies (or create custom policy with minimal permissions)
aws iam attach-user-policy \
  --user-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess  # For dev, use more restrictive policy in prod
```

**For Production:** Create a custom IAM policy with only the necessary permissions:
- CloudFormation (create, update, delete stacks)
- Lambda (create, update, delete functions)
- API Gateway (create, update, delete APIs)
- DynamoDB (create, update tables)
- S3 (create, update buckets)
- IAM (create roles for Lambda)
- CloudWatch Logs (create log groups)

### 2. Generate Access Keys

```bash
aws iam create-access-key --user-name github-actions-deploy
```

Save the `AccessKeyId` and `SecretAccessKey` - you'll add them to GitHub secrets.

### 3. Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Add each secret listed above

### 4. Test the Workflow

1. Make a small change to the backend (e.g., add a comment)
2. Push to `develop` branch
3. Go to **Actions** tab in GitHub
4. Watch the workflow run

## Deployment Flow

### Automatic Deployments

1. **Develop Branch:**
   - Push to `develop` → Auto-deploys to `dev` stage
   - PR to `develop` → Runs checks only (no deploy)

2. **Main Branch:**
   - Push to `main` → Auto-deploys to `prod` stage
   - PR to `main` → Runs checks only (no deploy)

### Manual Deployments

1. Go to **Actions** tab
2. Select **Manual Deploy** workflow
3. Click **Run workflow**
4. Choose:
   - Component: backend, frontend, or both
   - Stage: dev, staging, or prod
5. Click **Run workflow**

## Branch Protection (Recommended)

Set up branch protection rules:

1. Go to **Settings > Branches**
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - Select: `backend-checks`, `frontend-checks`

## Monitoring Deployments

### View Deployment Status

1. Go to **Actions** tab in GitHub
2. Click on a workflow run
3. View logs for each job

### Get Deployment Info

After deployment, the workflow uploads deployment info as an artifact:
1. Go to the workflow run
2. Scroll to **Artifacts** section
3. Download `deployment-info-{stage}.txt`

## Troubleshooting

### Deployment Fails

1. **Check AWS Credentials:**
   - Verify secrets are set correctly
   - Check IAM user has necessary permissions

2. **Check Environment Variables:**
   - Ensure all required secrets are set
   - Verify secret names match exactly (case-sensitive)

3. **Check Logs:**
   - View workflow logs in GitHub Actions
   - Check CloudWatch logs in AWS

### Build Fails

1. **Type Errors:**
   - Run `npm run type-check` locally
   - Fix TypeScript errors

2. **Lint Errors:**
   - Run `npm run lint` locally
   - Fix ESLint errors

3. **Dependency Issues:**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` locally
   - Commit updated `package-lock.json`

## Customization

### Add Tests

1. Create test files in `backend/__tests__` or `web/__tests__`
2. Add test script to `package.json`
3. Uncomment test job in workflow files

### Add Notifications

Add notification steps to workflows:

```yaml
- name: Notify on Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Deployment Approvals

For production deployments, add approval step:

```yaml
- name: Wait for approval
  uses: trstringer/manual-approval@v1
  with:
    secret: ${{ github.TOKEN }}
    approvers: your-github-username
    minimum-approvals: 1
```

## Security Best Practices

1. ✅ Use separate AWS credentials for each environment
2. ✅ Rotate secrets regularly
3. ✅ Use least-privilege IAM policies
4. ✅ Enable branch protection
5. ✅ Review workflow logs regularly
6. ✅ Use environment-specific secrets
7. ✅ Never commit secrets to repository

## Next Steps

1. ✅ Configure GitHub secrets
2. ✅ Set up AWS IAM user
3. ✅ Test deployment to dev
4. ✅ Set up branch protection
5. ✅ Configure production deployment
6. ✅ Add monitoring/alerting (optional)

