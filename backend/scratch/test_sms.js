require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { config } = require('../config');
const { sendOtp, sendIntegrationOtp } = require('../Utils/SMSUtils');

async function runTests() {
    const targetPhone = process.argv[2];
    if (!targetPhone) {
        console.error("Please provide a phone number to test: node test_sms.js <phone_number>");
        process.exit(1);
    }

    console.log(`📡 [SMS Test] Using configuration:`);
    console.log(` - API URL: ${config.smsApiUrl}`);
    console.log(` - Sender ID: ${config.smsSender}`);
    console.log(` - DLT Entity ID: ${config.smsDltEntityId}`);
    console.log(` - DLT Template ID: ${config.smsTemplateId}`);
    console.log(` - API Key: ${config.smsApiKey ? '***' + config.smsApiKey.slice(-4) : 'undefined'}`);

    // Generate a random 6 digit OTP like the system does
    const { generateOtp } = require('../Utils/Helper');
    const loginOtp = generateOtp();

    console.log(`\n1️⃣ Testing User Login OTP (using sendOtp):`);
    console.log(` - Generated OTP: ${loginOtp}`);
    await sendOtp(targetPhone, loginOtp);

    const merchantOtp = generateOtp();
    console.log(`\n2️⃣ Testing Merchant Login OTP (using sendIntegrationOtp):`);
    console.log(` - Generated OTP: ${merchantOtp}`);
    await sendIntegrationOtp(targetPhone, merchantOtp);
}

runTests();
