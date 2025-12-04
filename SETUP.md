# MyOra Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd web
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Configure Environment Variables

#### Frontend (web/.env.local)

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_REGION=us-east-1
```

#### Backend

Set environment variables in `backend/serverless.yml` or use AWS Systems Manager Parameter Store:

```yaml
environment:
  OPENAI_API_KEY: ${env:OPENAI_API_KEY}
  WHATSAPP_VERIFY_TOKEN: ${env:WHATSAPP_VERIFY_TOKEN}
  WHATSAPP_ACCESS_TOKEN: ${env:WHATSAPP_ACCESS_TOKEN}
```

Or create a `.env` file in the backend directory (not committed to git).

### 3. Install Serverless Framework Globally

```bash
npm install -g serverless
```

### 4. Run Development Servers

#### Terminal 1 - Backend (Serverless Offline)

```bash
cd backend
npm run dev
```

Backend API will be available at `http://localhost:3001`

#### Terminal 2 - Frontend (Next.js)

```bash
cd web
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Deployment

### Deploy Backend to AWS

```bash
cd backend
serverless deploy
```

This will:
- Create DynamoDB tables
- Create S3 bucket
- Deploy Lambda functions
- Set up API Gateway endpoints
- Configure IAM roles

### Deploy Frontend

The frontend can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- Any static hosting service

```bash
cd web
npm run build
```

Then deploy the `.next` folder to your hosting service.

## Project Structure

```
my-ora/
├── web/                    # Next.js frontend
│   ├── app/               # App Router pages
│   │   ├── auth/          # Authentication pages
│   │   └── dashboard/     # Dashboard pages
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── dashboard/    # Dashboard-specific components
│   └── lib/              # Utilities and API client
├── backend/               # Serverless backend
│   ├── modules/          # Feature modules
│   │   ├── chat/
│   │   ├── symptom-checker/
│   │   ├── lifescore/
│   │   ├── lifestyle/
│   │   ├── predictions/
│   │   ├── notifications/
│   │   ├── auth/
│   │   └── integrations/
│   ├── src/              # Shared code
│   │   ├── models/       # Data models
│   │   └── utils/        # Utilities
│   └── serverless.yml    # Serverless configuration
└── README.md
```

## Key Features Implemented

✅ **Frontend**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query for data fetching
- Recharts for visualizations
- Responsive design
- All major pages (Dashboard, Chat, Symptoms, LifeScore, Lifestyle, Predictions, Notifications, Profile)

✅ **Backend**
- Serverless architecture with AWS Lambda
- DynamoDB for data storage
- S3 for file uploads
- OpenAI integration (GPT-4 + Vision)
- WhatsApp webhook handler
- EventBridge scheduled tasks
- All API endpoints implemented
- TypeScript throughout

## Next Steps

1. **Authentication**: Implement full AWS Cognito integration
2. **Meal Upload**: Complete multipart form data parsing for meal images
3. **LifeScore Calculation**: Enhance algorithm with real lifestyle data
4. **Notifications**: Complete notification system implementation
5. **Admin Dashboard**: Build admin interface
6. **Testing**: Add unit and integration tests
7. **CI/CD**: Set up deployment pipeline

## Troubleshooting

### Backend won't start

- Ensure Serverless Framework is installed: `npm install -g serverless`
- Check that all environment variables are set
- Verify AWS credentials are configured: `aws configure`

### Frontend can't connect to backend

- Ensure backend is running on `http://localhost:3001`
- Check `NEXT_PUBLIC_API_URL` in `web/.env.local`
- Verify CORS is enabled in serverless.yml

### DynamoDB errors

- Tables are created automatically on first deployment
- For local development, use DynamoDB Local or ensure tables exist in AWS

## Support

For issues or questions, refer to the main README.md file.

