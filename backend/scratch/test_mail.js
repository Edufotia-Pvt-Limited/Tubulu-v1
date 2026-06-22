const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sendLoginCredentialsEmail } = require('../Utils/Mailer');

async function test() {
    console.log('--- SMTP Connectivity Verification ---');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '********' : 'NOT SET');
    console.log('\nAttempting to send credentials email to: pradeepface1@gmail.com...');
    
    const res = await sendLoginCredentialsEmail(
        'pradeepface1@gmail.com',
        'Pradeep',
        'regional_manager',
        'pradeepface1@gmail.com',
        'TempPass123!'
    );
    
    if (res) {
        console.log('\n✅ Connection Verification Successful! Email sent.');
    } else {
        console.log('\n❌ Verification Failed. See error details above.');
    }
    process.exit(0);
}
test();
