import { registerAs } from '@nestjs/config';

export default registerAs('appwrite', () => ({
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || '',
  apiKey: process.env.APPWRITE_API_KEY || '',
  databaseId: process.env.APPWRITE_DATABASE_ID || 'main',
  userCollectionId: process.env.APPWRITE_USER_COLLECTION_ID || 'users',
//   chatCollectionId: process.env.APPWRITE_CHAT_COLLECTION_ID || 'chats',
//   messageCollectionId: process.env.APPWRITE_MESSAGE_COLLECTION_ID || 'messages',
//   subscriptionCollectionId: process.env.APPWRITE_SUBSCRIPTION_COLLECTION_ID || 'subscriptions',
}));