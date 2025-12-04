/**
 * AWS Amplify configuration
 * Configure Cognito User Pool and authentication
 */

import { Amplify } from 'aws-amplify'

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
      region: process.env.NEXT_PUBLIC_REGION || 'us-east-1',
    },
  },
}

// Only configure Amplify if credentials are provided
if (amplifyConfig.Auth.Cognito.userPoolId && amplifyConfig.Auth.Cognito.userPoolClientId) {
  Amplify.configure(amplifyConfig, { ssr: true })
}

export default amplifyConfig

