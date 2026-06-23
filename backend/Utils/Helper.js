const otp = require('otp-generator');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { default: axios } = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('./tubulu-firebase-adminsdk-e4us7-174698b3e9.json');

// const TUBULU_API_URL = 'http://192.168.1.11:3008';
const TUBULU_API_URL = 'http://159.65.148.194:3008';

const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

function generateOtp() {
    return otp.generate(6, {
        lowerCaseAlphabets: false,
        specialChars: false,
        upperCaseAlphabets: false,
        digits: true,
    })
}

function generateUUID() {
    return uuid();
}

function generateAuthPairs(payload, refreshPayload) {
    return new Promise((resolve, reject) => {
        const jwtKey = config.jwtKey
        const refreshKey = config.refreshKey
        const authToken = jwt.sign(payload, jwtKey, {
            expiresIn: config.tokenValidity
        })
        const refreshToken = jwt.sign(refreshPayload, refreshKey)
        resolve({
            authToken: authToken,
            refreshToken: refreshToken
        })
    })
}

function generateIntegrationDashboardAuthPairs(payload, refreshPayload) {
    return new Promise((resolve, reject) => {
        const jwtKey = config.integrationDashboardAuthKey
        const refreshKey = config.integrationDashboardRefreshKey
        const authToken = jwt.sign(payload, jwtKey)
        const refreshToken = jwt.sign(refreshPayload, refreshKey)
        resolve({
            authToken: authToken,
            refreshToken: refreshToken
        })
    })
}

function validateAuthTokenIntegration(token, tokenType = 0) {


 const authToken = token.startsWith("Bearer ")
        ? token.split(" ")[1]
        : token;

    // 0 for auth token , 1 for refresh token
    return new Promise(function (resolve, reject) {
        const jwtKey = config.integrationDashboardAuthKey
        const refreshKey = config.integrationDashboardRefreshKey
        jwt.verify(
            authToken,
            tokenType === 0 ? jwtKey : refreshKey,
            (err, decoded) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(decoded)
                }
            }
        )
    })
}

function validateAuthToken(token, tokenType = 0) {
    const authToken = token.startsWith("Bearer ")
        ? token.split(" ")[1]
        : token;
    // 0 for auth token , 1 for refresh token
    return new Promise(function (resolve, reject) {
        const jwtKey = config.jwtKey
        const refreshKey = config.refreshKey
        jwt.verify(
            authToken,
            tokenType === 0 ? jwtKey : refreshKey,
            (err, decoded) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(decoded)
                }
            }
        )
    })
}

// async function sendPushNotificationV2(fcmToken, data, notification) {
//     console.log("🚀 ~ sendPushNotificationV2 ~ fcmToken:", fcmToken)
//     console.log(data);
//     try {
//         await firebaseApp.messaging().send({
//             token: fcmToken,
//             data,
//             notification,            
//         })
//         return;
//     } catch (error) {
//         console.log('Unable to send the push notification to the token: ', fcmToken);
//         console.log(error);
//         return;
//     }
// }


async function sendPushNotificationV2(fcmToken, data, notification) {
 
  try {
    await firebaseApp.messaging().send({
      token: fcmToken,
      data,
      notification,
    });

    return { success: true };

  } catch (error) {
    console.log('Unable to send push notification to token:', fcmToken);
   
    const errorCode = error?.errorInfo?.code || "";
    const message = error?.message || "";

    // Detect invalid or unregistered FCM tokens
    const invalidToken =
      errorCode === "messaging/registration-token-not-registered" ||
      errorCode === "messaging/invalid-registration-token" ||
      message.includes("UNREGISTERED") ||
      message.includes("NOT_FOUND");

    return {
      success: false,
      invalidToken,
      token: fcmToken,
      rawError: error
    };
  }
}


async function sendPushNotification(fcmToken, data, notification) {
    return await sendPushNotificationV2(fcmToken, data, notification)
    // return new Promise(function (resolve, reject) {
    //     try {
    //         axios({
    //             method: 'POST',
    //             url: 'https://fcm.googleapis.com/fcm/send',
    //             headers: {
    //                 "Authorization": config.fcmNotificationAuthKey,
    //             },
    //             data: {
    //                 to: fcmToken,
    //                 data: data,
    //                 notification: notification,
    //                 content_available: true,
    //                 priority: "high",
    //             }
    //         }).then(response => {
    //             console.log(response.data);
    //             resolve(response.data);
    //         }).catch(error => {
    //             console.log("Unable to send the push notification because::");
    //             console.log("Token that failed:::");
    //             console.log(fcmToken);
    //             console.log(error);
    //             reject(error);
    //         })
    //     } catch (exception) {
    //         console.log("Unable to send the push notification because:::");
    //         console.log(exception);
    //         reject(new Error(exception));
    //     }
    // })
}

function sendChatMessageAsIntegration(payLoad) {
    return axios({
        method: 'POST',
        url: TUBULU_API_URL + '/api/v1/chatMessage/integrationSend',
        data: payLoad
    })
}

function getMessageTypeFromMimeType(mimeType) {
    const MIME_TYPES = {
        "IMAGE": {
            "JPG": "image/jpg",
            "JPEG": "image/jpeg",
            "PNG": "image/png",
        },
        "VIDEO": {
            "MP4": "video/mp4",
            "AVI": "video/x-msvideo",
        },
        "AUDIO": {
            "MP3": "audio/mpeg",
            "WAV": "audio/x-wav"
        }
    }
    switch (mimeType) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/jpg':
            return 'IMAGE'
        case 'video/mp4':
        case 'video/x-msvideo':
            return 'VIDEO';
        case 'audio/mpeg':
        case "audio/x-wav":
            return "AUDIO";
        default:
            return undefined;
    }
}

module.exports = {
    generateOtp,
    generateUUID,
    sendChatMessageAsIntegration,
    generateAuthPairs,
    generateIntegrationDashboardAuthPairs,
    validateAuthToken,
    validateAuthTokenIntegration,
    sendPushNotification,
    getMessageTypeFromMimeType
}
