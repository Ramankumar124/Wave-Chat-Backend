const express=require("express");
const  messaging  = require("../config/firabase/firebaseAdmin");
module.exports.sendFirebaseMessage = async (message, receiverFBToken,reciverName) => {
    const FBmessage = {
      notification: {
        title: reciverName, // Notification title
        body: message,     // Notification body
        image:"https://www.citypng.com/public/uploads/preview/outline-whatsapp-wa-watsup-green-logo-icon-symbol-sign-png-701751695124303npsmzlcjyh.png",
      // Notification sound
      },
   
      token: receiverFBToken // Target device token
    };  
  
    try {
      const response = await messaging.send(FBmessage); // Send the FCM message
      console.log("Message sent successfully", response);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  