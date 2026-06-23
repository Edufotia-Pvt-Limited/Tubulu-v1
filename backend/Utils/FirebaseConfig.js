var admin = require('firebase-admin');

var serviceAccount = require('./tubulu-firebase-adminsdk-e4us7-aa1eeb08e0.json');
const { default: axios } = require('axios');
const { config } = require('../config');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};


function pushNotification(req, res) {
    const fcmToken = req.body.fcmToken;
    const message = req.body.message;
    const options = notification_options;

    admin.messaging().sendToDevice(fcmToken, message, options).then(response => {
        res.status(200);
        res.json({
            success: true,
            message: "Notification sent successfully"
        })
    }).catch(error => {
        console.log(error)
    })
}

async function sendPushNotificationToMultipleDevices(tokens, data, notification) {
    await axios({
        method: 'POST',
        url: 'https://fcm.googleapis.com/fcm/send',
        headers: {
            "Authorization": config.fcmNotificationAuthKey,
        },
        data: {
            registration_ids: tokens,
            data,
            notification,
            priority: "high",
            content_available: true,
        }
    });
}

module.exports = {
    pushNotification,
    sendPushNotificationToMultipleDevices
}