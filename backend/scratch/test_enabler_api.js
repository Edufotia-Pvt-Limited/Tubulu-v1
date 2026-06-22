const jwt = require('jsonwebtoken');
const axios = require('axios');
const { config } = require('../config');
const { sequelize, User, Integration, EnablerOnboarding, City, State, Country } = require('../Utils/Postgres');

const BASE_URL = 'http://localhost:3008';

async function runTests() {
    console.log('=== STARTING ENABLER API INTEGRATION TESTS ===');
    
    try {
        // 1. Ensure test location scope exists
        console.log('1. Setting up test locations (Country, State, City)...');
        const [country] = await Country.findOrCreate({ where: { name: 'TestCountry', code: 'TC' } });
        const [state] = await State.findOrCreate({ where: { name: 'TestState', countryId: country.id } });
        const [city1] = await City.findOrCreate({ where: { name: 'ScopeCity', stateId: state.id } });
        const [city2] = await City.findOrCreate({ where: { name: 'OtherCity', stateId: state.id } });
        console.log(`- ScopeCity ID: ${city1.id}`);
        console.log(`- OtherCity ID: ${city2.id}`);

        // 2. Setup City Manager User
        console.log('2. Creating test City Manager...');
        const managerPhone = '8888888888';
        // Clean existing test user if any
        await User.destroy({ where: { phoneNumber: managerPhone } });
        const cityManager = await User.create({
            uuid: 'd3b07384-d113-4a1e-84d4-4a413d3170e8',
            firstName: 'Test',
            lastName: 'Manager',
            phoneNumber: managerPhone,
            role: 'city_manager',
            userName: 'testmanager',
            password: 'Password123!',
            userVerified: true,
            scopedCountryId: country.id,
            scopedStateId: state.id,
            scopedCityId: city1.id,
        });

        // 3. Generate City Manager Token
        console.log('3. Generating token for City Manager...');
        const managerToken = jwt.sign(
            { id: cityManager.id, phoneNumber: cityManager.phoneNumber, role: 'city_manager' },
            config.integrationDashboardAuthKey
        );
        const managerHeaders = { Authorization: `Bearer ${managerToken}` };

        // 4. City Manager creates an Enabler
        console.log('4. Testing: City Manager creating an Enabler...');
        const enablerPhone = '7777777777';
        // Clean existing
        await User.destroy({ where: { phoneNumber: enablerPhone } });
        
        const createEnablerRes = await axios.post(`${BASE_URL}/api/v1/admin/users/create`, {
            firstName: 'John',
            lastName: 'Field',
            phoneNumber: enablerPhone,
            role: 'enabler',
            password: 'PinPassword123'
        }, { headers: managerHeaders });

        if (createEnablerRes.data.success) {
            console.log('✅ Success: Enabler account created by City Manager!');
        } else {
            throw new Error('Failed to create enabler account');
        }

        const enablerUser = await User.findOne({ where: { phoneNumber: enablerPhone } });
        if (!enablerUser || enablerUser.scopedCityId !== city1.id || enablerUser.createdByUserId !== cityManager.id) {
            throw new Error('Failed: Enabler scope or creator link not assigned correctly in database');
        }
        console.log('✅ Success: Enabler inherits scopes correctly!');

        // 5. Generate Token for the Enabler
        console.log('5. Generating token for Enabler...');
        const enablerToken = jwt.sign(
            { id: enablerUser.id, phoneNumber: enablerUser.phoneNumber, role: 'enabler' },
            config.integrationDashboardAuthKey
        );
        const enablerHeaders = { Authorization: `Bearer ${enablerToken}` };

        // 6. Test: Enabler submits merchant inside scoped city (Should Succeed)
        console.log('6. Testing: Enabler submits merchant in scoped city...');
        const submitMerchantRes = await axios.post(`${BASE_URL}/api/v1/enabler/submit`, {
            integrationName: 'Johns Cafe',
            verticalType: 'FB',
            phoneNumber: '9111111111',
            cityId: city1.id,
            addressLine: '123 Food Street',
            pincode: '570001',
            gpsLatitude: 12.2958,
            gpsLongitude: 76.6394,
            fieldNotes: 'Physically verified',
            upiVpa: 'johnscafe@okaxis',
            upiMerchantName: 'Johns Cafe LLC',
            documents: [{ type: 'PAN Card', url: 'https://scan.url/pan.pdf', fileName: 'pan.pdf' }]
        }, { headers: enablerHeaders });

        let onboardingId = '';
        if (submitMerchantRes.data.success) {
            onboardingId = submitMerchantRes.data.data.onboardingId;
            console.log(`✅ Success: Merchant onboarding submission accepted! (ID: ${onboardingId})`);
        } else {
            throw new Error('Failed: Merchant onboarding request rejected');
        }

        // 7. Test: Enabler submits merchant in a different city (Should fail with 403)
        console.log('7. Testing: Enabler submits merchant outside scoped city...');
        try {
            await axios.post(`${BASE_URL}/api/v1/enabler/submit`, {
                integrationName: 'Out of Bounds Store',
                verticalType: 'RETAIL',
                phoneNumber: '9222222222',
                cityId: city2.id,
                addressLine: '456 Outpost Lane',
                pincode: '110001'
            }, { headers: enablerHeaders });
            throw new Error('FAIL: Server allowed enabler to submit merchant outside their scoped city!');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('✅ Success: City-lock successfully blocked out-of-scope submission (403 Forbidden)!');
            } else {
                throw err;
            }
        }

        // 8. Test: Fetch Enabler submissions
        console.log('8. Testing: Fetching submissions portfolio...');
        const getSubsRes = await axios.get(`${BASE_URL}/api/v1/enabler/my-submissions`, { headers: enablerHeaders });
        if (getSubsRes.data.success && getSubsRes.data.data.length > 0) {
            console.log(`✅ Success: Retrieved ${getSubsRes.data.data.length} submissions!`);
        } else {
            throw new Error('Failed to retrieve submissions');
        }

        // 9. Test: City Manager reviews submission (Approve)
        console.log('9. Testing: City Manager approving submission...');
        const reviewRes = await axios.post(`${BASE_URL}/api/v1/enabler/review`, {
            submissionId: onboardingId,
            action: 'approve'
        }, { headers: managerHeaders });

        if (reviewRes.data.success) {
            console.log('✅ Success: Submission approved by City Manager!');
        } else {
            throw new Error('Failed to approve submission');
        }

        // 10. Verify Integration is active and approved in DB
        console.log('10. Verifying active status in DB...');
        const onboardingRecord = await EnablerOnboarding.findByPk(onboardingId);
        const integrationRecord = await Integration.findByPk(onboardingRecord.integrationId);
        if (onboardingRecord.status === 'approved' && integrationRecord.isApproved && integrationRecord.isActive) {
            console.log('✅ Success: Integration approved & activated in Database!');
        } else {
            throw new Error('Database status mismatch after approval');
        }

        console.log('=== ALL ENABLER API INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
    } catch (e) {
        console.error('❌ Integration Test Failed:', e.message);
        if (e.response) {
            console.error('Response data:', e.response.data);
            console.error('Response status:', e.response.status);
        }
    } finally {
        // Clean up test data
        console.log('Cleaning up test records...');
        await EnablerOnboarding.destroy({ where: { gpsLatitude: 12.2958 } });
        await Integration.destroy({ where: { phoneNumber: '9111111111' } });
        await User.destroy({ where: { phoneNumber: ['8888888888', '7777777777'] } });
        await City.destroy({ where: { name: ['ScopeCity', 'OtherCity'] } });
        await State.destroy({ where: { name: 'TestState' } });
        await Country.destroy({ where: { name: 'TestCountry' } });
        console.log('Done.');
    }
}

runTests();
