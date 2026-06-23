const request = require('supertest');
const app = require('../../index'); // Import the Express app
const { sequelize } = require('../../Utils/Postgres');

describe('Auth Integration Tests', () => {
    // Generate a random test phone number so we don't collide
    const testPhone = `9999${Math.floor(100000 + Math.random() * 900000)}`;

    it('should register a new user successfully', async () => {
        const response = await request(app)
            .post('/api/v1/user/register')
            .send({
                phoneNumber: testPhone
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        // It might return hasPin or generate an OTP.
    });

    it('should verify OTP and return a JWT auth token', async () => {
        const response = await request(app)
            .post('/api/v1/user/verifyOtp')
            .send({
                phoneNumber: testPhone,
                otp: '000000' // Master OTP
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.authToken).toBeDefined();
        expect(typeof response.body.authToken).toBe('string');
    });

    it('should reject invalid OTP', async () => {
        const response = await request(app)
            .post('/api/v1/user/verifyOtp')
            .send({
                phoneNumber: testPhone,
                otp: '111111' // Invalid OTP
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
