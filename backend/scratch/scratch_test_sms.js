const { sendOtp } = require('./Utils/SMSUtils');
const { logger } = require('./Utils/Logger');

// Read phone number from command line argument
const phoneNumber = process.argv[2];
const testOtp = "123456";

if (!phoneNumber) {
    console.error("\x1b[31mError: Please provide a phone number to test with.\x1b[0m");
    console.log("Usage: node test_sms.js <10_digit_mobile_number>");
    process.exit(1);
}

console.log(`🚀 Initiating live SMS test to: ${phoneNumber} using Pinnacle Teleservices...`);

sendOtp(phoneNumber, testOtp)
    .then(() => {
        console.log("\x1b[32m✅ Success! The API accepted the request and returned success. Check your phone!\x1b[0m");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\x1b[31m❌ SMS Send Failed!\x1b[0m");
        console.error("Status:", error.statusCode || error.status);
        console.error("Message:", error.message || error);
        process.exit(1);
    });
