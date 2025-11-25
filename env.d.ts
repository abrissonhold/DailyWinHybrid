import 'react-native-paper';

declare module '@env' {
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
}

declare global {
  namespace ReactNativePaper {
    interface MD3Colors {
      streak: string;
      success: string;
      notification: string;
      priorityHigh: string;
      priorityMedium: string;
      priorityLow: string;
    }
  }
}
