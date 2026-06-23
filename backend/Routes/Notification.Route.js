const express =require('express');
const router = express.Router();
const {pushNotification} = require('../Utils/FirebaseConfig');


router.post('/firebase/notification', pushNotification);



module.exports = router; 