import admin from "firebase-admin";

// Path to the service account key JSON file
import  serviceAccount from "./wave-chat-2f232-firebase-adminsdk.json";
import { stringify } from "querystring";
const test={
    "private_key":process.env.FB_PRIVATE_KEY
}
// Initialize Firebase Admin SDK

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export const messaging = admin.messaging();


