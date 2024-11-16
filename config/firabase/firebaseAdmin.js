const admin = require("firebase-admin");

// Path to the service account key JSON file
const serviceAccount = require("./wave-chat-2f232-firebase-adminsdk.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

module.exports = messaging;
