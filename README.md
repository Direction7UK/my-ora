# MyOra - AI-Powered Digital Health Platform

MyOra is a comprehensive digital health prediction and LifeScore platform built with Next.js and AWS serverless architecture.

## Features

- 🤖 **AI Chat Assistant** - GPT-4 powered health assistant
- 🏥 **Symptom Checker** - AI-powered symptom analysis
- 📊 **LifeScore Dashboard** - Track Move, Fuel, and Recharge scores
- 📝 **Lifestyle Logging** - Log meals, activities, sleep, and stress
- 🔮 **Health Predictions** - AI-powered risk scoring
- 💬 **WhatsApp Integration** - Chat via WhatsApp
- 🔔 **Notifications & Reminders** - Stay on track with health goals
- 👁️ **Vision AI** - Meal image analysis using GPT-4 Vision

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- Recharts
- Zustand

### Backend
- AWS Lambda (Node.js + TypeScript)
- API Gateway
- DynamoDB
- S3
- EventBridge
- OpenAI GPT-4
- WhatsApp Cloud API
- Cognito

## Project Structure

```
my-ora/
├── web/                 # Next.js frontend
│   ├── app/            # App Router pages
│   ├── components/     # React components
│   └── lib/           # Utilities and API client
├── backend/            # Serverless backend
│   ├── modules/       # Feature modules
│   │   ├── chat/
│   │   ├── symptom-checker/
│   │   ├── lifescore/
│   │   ├── lifestyle/
│   │   ├── predictions/
│   │   ├── notifications/
│   │   ├── auth/
│   │   └── integrations/
│   └── src/           # Shared utilities and models
└── PROMPT.md          # Project requirements
```

## Getting Started

### Prerequisites

- Node.js 20+
- AWS CLI configured
- Serverless Framework installed globally: `npm install -g serverless`
- OpenAI API key
- WhatsApp Cloud API credentials (optional)

### Frontend Setup

```bash
cd web
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=your_openai_api_key
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_ACCESS_TOKEN=your_access_token
```

Run locally with Serverless Offline:

```bash
npm run dev
```

Deploy to AWS:

```bash
npm run deploy
```

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_REGION=us-east-1
```

### Backend (serverless.yml or .env)

```env
OPENAI_API_KEY=your_key
WHATSAPP_VERIFY_TOKEN=your_token
WHATSAPP_ACCESS_TOKEN=your_token
```

## Development

### Running Locally

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd web
   npm run dev
   ```

### Module Structure

Each backend module follows this structure:

```
modules/{module-name}/
├── handlers/        # Lambda handlers
├── services/        # Business logic
├── dto/            # Data transfer objects (optional)
└── utils/          # Module-specific utilities (optional)
```

## Deployment

### Backend Deployment

```bash
cd backend
serverless deploy
```

### Frontend Deployment

The frontend can be deployed to Vercel, Netlify, or any static hosting service:

```bash
cd web
npm run build
```

## API Endpoints

### Chat
- `POST /chat` - Send a message
- `GET /chat/conversations` - Get conversations
- `GET /chat/conversations/{id}/messages` - Get messages

### Symptoms
- `POST /symptoms/check` - Check symptoms
- `GET /symptoms/history` - Get symptom history

### LifeScore
- `GET /lifescore/current` - Get current score
- `GET /lifescore/history` - Get score history

### Lifestyle
- `POST /lifestyle/meals` - Log a meal
- `POST /lifestyle/activities` - Log activity
- `POST /lifestyle/sleep` - Log sleep
- `POST /lifestyle/stress` - Log stress
- `GET /lifestyle/{type}` - Get logs

### Predictions
- `GET /predictions/current` - Get current prediction
- `GET /predictions/history` - Get prediction history

### Notifications
- `GET /notifications` - Get notifications
- `POST /notifications/{id}/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read

### Profile
- `GET /profile` - Get profile
- `PUT /profile` - Update profile

### WhatsApp
- `GET /whatsapp/webhook` - Webhook verification
- `POST /whatsapp/webhook` - Receive messages

## DynamoDB Tables

The following tables are created automatically on deployment:

- `my-ora-backend-users-{stage}`
- `my-ora-backend-messages-{stage}`
- `my-ora-backend-symptoms-{stage}`
- `my-ora-backend-predictions-{stage}`
- `my-ora-backend-lifescore-{stage}`
- `my-ora-backend-lifestyle-{stage}`
- `my-ora-backend-admin-{stage}`

## Security & HIPAA Compliance

- All user data is encrypted at rest in DynamoDB
- S3 bucket has public access blocked
- API Gateway uses CORS with proper headers
- Authentication via AWS Cognito (to be fully implemented)
- All API endpoints require authentication

## Next Steps

1. Implement full Cognito authentication
2. Complete WhatsApp integration
3. Enhance LifeScore calculation algorithm
4. Add admin dashboard
5. Implement notification system fully
6. Add comprehensive error handling and logging
7. Set up CI/CD pipeline
8. Add unit and integration tests

## License

Private - All rights reserved

