const axios = require('axios');

async function runE2ETests() {
    console.log('🧪 ==================================================');
    console.log('🧪 Starting E2E Backend Testing for Admin & Mobile Portal');
    console.log('🧪 Target Server: http://34.135.72.28:3008/api/v1');
    console.log('🧪 ==================================================\n');

    const BASE_URL = 'http://34.135.72.28:3008/api/v1';
    let adminToken = null;
    let mainMerchantToken = null;
    let branchMerchantToken = null;
    let customerToken = null;
    
    const uniqueId = Date.now();
    const testMainPhone = `91888${Math.floor(10000 + Math.random() * 90000)}`;
    const testBranchPhone = `91889${Math.floor(10000 + Math.random() * 90000)}`;
    const testCustomerPhone = `91777${Math.floor(10000 + Math.random() * 90000)}`;
    
    let mainMerchantId = null;
    let branchMerchantId = null;
    let catalogueId = null;
    let productId = null;
    let cartId = null;
    let orderId = null;

    const results = [];
    
    function logTestResult(name, success, details = '') {
        const status = success ? '✅ PASS' : '❌ FAIL';
        console.log(`[${status}] ${name} ${details ? `- ${details}` : ''}`);
        results.push({ name, success, details });
    }

    try {
        // --- 1. ADMIN FLOWS ---
        console.log('--- Phase 1: Admin Portal Flows ---');
        try {
            const loginRes = await axios.post(`${BASE_URL}/integrations/admin/login`, {
                username: 'admin',
                password: '123456'
            });
            if (loginRes.data && loginRes.data.success) {
                adminToken = loginRes.data.data.authToken;
                logTestResult('Admin Login', true);
            } else {
                logTestResult('Admin Login', false, 'Response did not indicate success');
            }
        } catch (e) {
            logTestResult('Admin Login', false, e.message);
        }

        if (adminToken) {
            try {
                const statsRes = await axios.get(`${BASE_URL}/integrations/admin/stats`, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                logTestResult('Fetch Super Admin Stats', statsRes.data.success, `Active: ${statsRes.data.data?.activeMerchantsCount}`);
            } catch (e) {
                logTestResult('Fetch Super Admin Stats', false, e.message);
            }

            try {
                const healthRes = await axios.get(`${BASE_URL}/admin/modules/health`, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                logTestResult('Fetch Admin Modules Health Check', healthRes.data.success);
            } catch (e) {
                logTestResult('Fetch Admin Modules Health Check', false, e.message);
            }
        }

        // --- 2. MERCHANT ONBOARDING & AUTHENTICATION FLOW ---
        console.log('\n--- Phase 2: Merchant Portal Flows (Main Merchant) ---');
        try {
            // Verify/Onboard Main Merchant Number
            const reqOtpRes = await axios.post(`${BASE_URL}/integrations/verifyIntegrationPhoneNumber`, {
                phoneNumber: testMainPhone
            });
            
            // Confirm OTP using master bypass code
            const confirmOtpRes = await axios.post(`${BASE_URL}/integrations/confirmIntegrationPhoneAndCode`, {
                phoneNumber: testMainPhone,
                code: '000000'
            });

            if (confirmOtpRes.data && confirmOtpRes.data.success) {
                mainMerchantToken = confirmOtpRes.data.data.authToken;
                mainMerchantId = confirmOtpRes.data.data.merchantId || confirmOtpRes.data.user?.merchantId || confirmOtpRes.data.user?.id;
                logTestResult('Merchant Registration & OTP Auth', true, `Merchant ID: ${mainMerchantId}`);
            } else {
                logTestResult('Merchant Registration & OTP Auth', false, 'Failed to authenticate');
            }
        } catch (e) {
            logTestResult('Merchant Registration & OTP Auth', false, e.message);
        }

        if (mainMerchantToken) {
            // Onboard details
            try {
                const onboardRes = await axios.post(`${BASE_URL}/integrations/update/unregisteredIntegration`, {
                    integrationName: `Staging E2E Bakery ${uniqueId}`,
                    category: 'FOOD',
                    country: 'India',
                    state: 'Karnataka',
                    city: 'Bangalore',
                    email: `e2e_${uniqueId}@test.com`
                }, {
                    headers: { Authorization: `Bearer ${mainMerchantToken}` }
                });
                logTestResult('Merchant Complete Onboarding Info', onboardRes.data.success);
            } catch (e) {
                logTestResult('Merchant Complete Onboarding Info', false, e.message);
            }

            // Get My Details
            try {
                const detailsRes = await axios.get(`${BASE_URL}/integrations/myDetails`, {
                    headers: { Authorization: `Bearer ${mainMerchantToken}` }
                });
                if (detailsRes.data && detailsRes.data.success) {
                    mainMerchantId = detailsRes.data.data.id;
                    logTestResult('Fetch Merchant MyDetails', true, `Name: ${detailsRes.data.data?.integrationName}, ID: ${mainMerchantId}`);
                } else {
                    logTestResult('Fetch Merchant MyDetails', false);
                }
            } catch (e) {
                logTestResult('Fetch Merchant MyDetails', false, e.message);
            }

            // Approve the Merchant (Admin action)
            if (mainMerchantId && adminToken) {
                try {
                    const approveRes = await axios.post(`${BASE_URL}/admin/integration/approve`, {
                        integrationId: mainMerchantId,
                        isApproved: true
                    }, {
                        headers: { Authorization: `Bearer ${adminToken}` }
                    });
                    logTestResult('Admin Approve Merchant Store', approveRes.data.success);
                } catch (e) {
                    logTestResult('Admin Approve Merchant Store', false, e.message);
                }
            }

            // Activate the Merchant Store
            if (mainMerchantToken) {
                try {
                    const activeRes = await axios.patch(`${BASE_URL}/integrations/toggle-status`, {
                        isActive: true
                    }, {
                        headers: { Authorization: `Bearer ${mainMerchantToken}` }
                    });
                    logTestResult('Activate Merchant Store (Online)', activeRes.data.success);
                } catch (e) {
                    logTestResult('Activate Merchant Store (Online)', false, e.message);
                }
            }

            // Update Merchant settings
            try {
                const updateRes = await axios.patch(`${BASE_URL}/integrations/merchant/update`, {
                    openingHours: [
                        { day: 'Monday', open: '09:00', close: '22:00', isOpen: true }
                    ]
                }, {
                    headers: { Authorization: `Bearer ${mainMerchantToken}` }
                });
                logTestResult('Merchant Update Settings (Store Timings)', updateRes.data.success);
            } catch (e) {
                logTestResult('Merchant Update Settings (Store Timings)', false, e.message);
            }

            // Create catalogue
            try {
                const catRes = await axios.post(`${BASE_URL}/catalogue/create-catalogue`, {
                    name: `Signature Desserts ${uniqueId}`,
                    description: 'Specially baked daily'
                }, {
                    headers: { Authorization: `Bearer ${mainMerchantToken}` }
                });
                if (catRes.status === 201 && catRes.data.data?.catalogue) {
                    catalogueId = catRes.data.data.catalogue.id;
                    logTestResult('Create Catalogue', true, `Catalogue ID: ${catalogueId}`);
                } else {
                    logTestResult('Create Catalogue', false, `Status: ${catRes.status}, Msg: ${catRes.data?.message}`);
                }
            } catch (e) {
                logTestResult('Create Catalogue', false, e.message);
            }

            if (catalogueId) {
                // Create product
                try {
                    const prodRes = await axios.post(`${BASE_URL}/products/create/${catalogueId}`, {
                        name: 'E2E Chocolate Mousse Cup',
                        price: 150,
                        quantity: 100,
                        sku: `MOUSSE-${uniqueId}`,
                        currency: 'INR',
                        category: 'Bakery'
                    }, {
                        headers: { Authorization: `Bearer ${mainMerchantToken}` }
                    });
                    if (prodRes.status === 201 && prodRes.data.data?.product) {
                        productId = prodRes.data.data.product.id;
                        logTestResult('Create Product in Catalogue', true, `Product ID: ${productId}`);
                    } else {
                        logTestResult('Create Product in Catalogue', false, `Status: ${prodRes.status}`);
                    }
                } catch (e) {
                    logTestResult('Create Product in Catalogue', false, e.message);
                }
            }

            // --- 3. BRANCH CREATION & PARENT VERIFICATION FLOW ---
            console.log('\n--- Phase 3: Branch & Catalogue Auto-copy Flows ---');
            try {
                const branchRes = await axios.post(`${BASE_URL}/integrations/branch/create`, {
                    integrationName: `Staging E2E Branch ${uniqueId}`,
                    phoneNumber: testBranchPhone,
                    city: 'Mysore',
                    state: 'Karnataka',
                    country: 'India',
                    category: 'FOOD'
                }, {
                    headers: { Authorization: `Bearer ${mainMerchantToken}` }
                });

                if (branchRes.data && branchRes.data.success) {
                    branchMerchantId = branchRes.data.data.id;
                    logTestResult('Create Branch (Parent -> Branch)', true, branchRes.data.message);
                } else {
                    logTestResult('Create Branch (Parent -> Branch)', false);
                }
            } catch (e) {
                logTestResult('Create Branch (Parent -> Branch)', false, e.message);
            }

            if (branchMerchantId) {
                // Log in as branch merchant
                try {
                    await axios.post(`${BASE_URL}/integrations/verifyIntegrationPhoneNumber`, {
                        phoneNumber: testBranchPhone
                    });
                    const branchAuthRes = await axios.post(`${BASE_URL}/integrations/confirmIntegrationPhoneAndCode`, {
                        phoneNumber: testBranchPhone,
                        code: '000000'
                    });

                    if (branchAuthRes.data && branchAuthRes.data.success) {
                        branchMerchantToken = branchAuthRes.data.data.authToken;
                        logTestResult('Branch Merchant Login & Auth', true);
                    } else {
                        logTestResult('Branch Merchant Login & Auth', false);
                    }
                } catch (e) {
                    logTestResult('Branch Merchant Login & Auth', false, e.message);
                }

                if (branchMerchantToken) {
                    // Check Branch Parent identity API
                    try {
                        const parentInfoRes = await axios.get(`${BASE_URL}/integrations/branch/parent`, {
                            headers: { Authorization: `Bearer ${branchMerchantToken}` }
                        });
                        logTestResult('Branch Parent Identity API', parentInfoRes.data.success, `Parent: ${parentInfoRes.data.data?.integrationName}`);
                    } catch (e) {
                        logTestResult('Branch Parent Identity API', false, e.message);
                    }
                }
            }
        }

        // --- 4. MOBILE PORTAL CUSTOMER FLOWS ---
        console.log('\n--- Phase 4: Mobile Portal / Customer Flows ---');
        try {
            // Customer Register
            await axios.post(`${BASE_URL}/user/register`, {
                phoneNumber: testCustomerPhone
            });
            // Confirm OTP using standard customer code or mock bypass
            const custAuthRes = await axios.post(`${BASE_URL}/user/verifyOtp`, {
                phoneNumber: testCustomerPhone,
                otp: '123456'
            }).catch(async err => {
                return await axios.post(`${BASE_URL}/user/verifyOtp`, {
                    phoneNumber: testCustomerPhone,
                    otp: '000000'
                });
            });

            if (custAuthRes.data && custAuthRes.data.success) {
                customerToken = custAuthRes.data.authToken || custAuthRes.data.data?.authToken;
                logTestResult('Customer Registration & Login', true);
            } else {
                logTestResult('Customer Registration & Login', false);
            }
        } catch (e) {
            logTestResult('Customer Registration & Login', false, e.message);
        }

        if (customerToken) {
            // App Discovery
            try {
                const discoveryRes = await axios.get(`${BASE_URL}/integrations/discovery`, {
                    headers: { Authorization: `Bearer ${customerToken}` }
                });
                logTestResult('App Discovery Store Listing', discoveryRes.data.success, `Stores Found: ${discoveryRes.data.data?.length}`);
            } catch (e) {
                logTestResult('App Discovery Store Listing', false, e.message);
            }

            // Create Order
            if (productId) {
                try {
                    const orderRes = await axios.post(`${BASE_URL}/orders/create`, {
                        integrationId: mainMerchantId,
                        deliveryType: 'DELIVERY',
                        paymentMethod: 'COD',
                        items: [
                            { productId, quantity: 2 }
                        ]
                    }, {
                        headers: { Authorization: `Bearer ${customerToken}` }
                    });

                    if (orderRes.status === 201 && orderRes.data.data?.order) {
                        orderId = orderRes.data.data.order.id || orderRes.data.data.order?._id;
                        logTestResult('Place Customer Order (COD)', true, `Order ID: ${orderId}`);
                    } else {
                        logTestResult('Place Customer Order (COD)', false, `Status: ${orderRes.status}`);
                    }
                } catch (e) {
                    logTestResult('Place Customer Order (COD)', false, e.message);
                }

                if (orderId && mainMerchantToken) {
                    // Update Order Status
                    try {
                        const statusRes = await axios.put(`${BASE_URL}/orders/update-order-status`, {
                            orderId,
                            status: 'accepted'
                        }, {
                            headers: { Authorization: `Bearer ${mainMerchantToken}` }
                        });
                        logTestResult('Merchant Accept Order', statusRes.status === 200, `Status: ${statusRes.status}`);
                    } catch (e) {
                        logTestResult('Merchant Accept Order', false, e.message);
                    }
                }
            }
        }

    } catch (globalErr) {
        console.error('Fatal execution error:', globalErr);
    } finally {
        console.log('\n======================================================');
        console.log('📊           E2E BACKEND TEST SUMMARY REPORT          ');
        console.log('======================================================');
        const passedCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;
        console.log(`Total Run: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
        console.log('======================================================');
        
        if (failedCount > 0) {
            console.log('❌ Some tests failed. Please review the log output above.');
            process.exit(1);
        } else {
            console.log('🎉 ALL BACKEND PORTAL TEST FLOWS PASSED SUCCESSFULLY!');
            process.exit(0);
        }
    }
}

runE2ETests();
