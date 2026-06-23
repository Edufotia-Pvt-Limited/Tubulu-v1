const nodemailer = require('nodemailer');

// Set up transporter. Can load SMTP credentials from environment variables.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'fake_user@ethereal.email',
        pass: process.env.SMTP_PASS || 'fake_pass'
    }
});

async function sendLoginCredentialsEmail(toEmail, firstName, role, username, password) {
    try {
        let testAccount;
        let activeTransporter = transporter;

        // If using default Ethereal credentials, create a dynamic test account so emails actually send and provide a preview URL
        if (transporter.options.host === 'smtp.ethereal.email' && transporter.options.auth.user === 'fake_user@ethereal.email') {
            testAccount = await nodemailer.createTestAccount();
            activeTransporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        }

        const mailOptions = {
            from: '"Tubulu Admin Support" <noreply@tubulu.com>',
            to: toEmail,
            subject: 'Your Tubulu Staff Account Has Been Provisioned',
            text: `Hello ${firstName},\n\nYour account as a ${role.replace('_', ' ')} has been created on the Tubulu Admin Portal.\n\nHere are your login credentials:\nUsername/Email: ${username}\nPassword: ${password}\n\nPlease keep these details secure.\n\nRegards,\nTubulu Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #3f51b5; border-bottom: 2px solid #3f51b5; padding-bottom: 10px;">Account Created</h2>
                    <p>Hello <strong>${firstName}</strong>,</p>
                    <p>Your account as a <strong>${role.replace('_', ' ')}</strong> has been created on the Tubulu Admin Portal.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Login Credentials</h3>
                        <p style="margin: 5px 0;"><strong>Username / Email:</strong> ${username}</p>
                        <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px; font-weight: bold;">${password}</code></p>
                    </div>
                    <p>Please keep these credentials safe and change your password upon your first login.</p>
                    <br/>
                    <p>Regards,<br/><strong>Tubulu Team</strong></p>
                </div>
            `
        };

        const info = await activeTransporter.sendMail(mailOptions);
        console.log(`✉️ [MAIL] Credentials email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
        if (testAccount) {
            console.log(`✉️ [MAIL TEST LINK] View test email: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return info;
    } catch (e) {
        console.error('❌ [MAIL ERROR] Failed to send credentials email:', e);
    }
}

module.exports = { sendLoginCredentialsEmail };
