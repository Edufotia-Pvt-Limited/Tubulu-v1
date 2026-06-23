const axios = require('axios');
const ErrorBody = require('../Utils/ErrorBody');

// In-memory token cache and credentials store for automatic retries
const tokenCache = {};
const credentialsStore = {}; // cacheKey -> password
const tokenToUserMap = {};   // token -> { username, env }

function getBaseUrl(env) {
    return env === 'production' ? 'https://api.pidge.in' : 'https://store.dev.pidge.in';
}

function getTrackingBaseUrl(env) {
    return env === 'production' ? 'https://track.pidge.in' : 'https://track.dev.pidge.in';
}

function cleanMobile(mobile) {
    if (!mobile) return '9876543210';
    // Remove all non-digits
    let cleaned = mobile.toString().replace(/\D/g, '');
    // If it has country code prefix 91 and is 12 digits, strip 91
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        cleaned = cleaned.substring(2);
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    // Keep last 10 digits if still longer
    if (cleaned.length > 10) {
        cleaned = cleaned.slice(-10);
    }
    return cleaned;
}

async function authenticate(username, password, env) {
    const baseUrl = getBaseUrl(env);
    const cacheKey = `${username}_${env}`;

    // Return cached token if valid
    if (tokenCache[cacheKey]) {
        return tokenCache[cacheKey];
    }

    try {
        console.log(`Pidge: Authenticating for user ${username} on env ${env}`);
        const response = await axios.post(`${baseUrl}/v1.0/store/channel/vendor/login`, {
            username,
            password
        });

        if (response.data && response.data.data && response.data.data.token) {
            const token = response.data.data.token;
            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            tokenCache[cacheKey] = formattedToken;
            
            // Store credentials/mappings for automatic 401 retries
            credentialsStore[cacheKey] = password;
            tokenToUserMap[formattedToken] = { username, env };
            
            return formattedToken;
        } else {
            throw new Error(response.data?.message || 'Login failed, no token returned');
        }
    } catch (error) {
        console.error('Pidge Authentication Error:', error.response?.data || error.message);
        throw new ErrorBody(error.response?.status || 500, `Pidge Authentication Failed: ${error.response?.data?.message || error.message}`);
    }
}

async function pidgeRequest(token, env, requestConfig) {
    const config = {
        ...requestConfig,
        headers: {
            ...requestConfig.headers,
            Authorization: token,
            'Content-Type': 'application/json'
        }
    };

    try {
        return await axios(config);
    } catch (error) {
        if (error.response?.status === 401) {
            console.warn(`Pidge: Request failed with 401. Attempting token refresh...`);
            const mapped = tokenToUserMap[token];
            if (mapped) {
                const { username, env: mappedEnv } = mapped;
                const cacheKey = `${username}_${mappedEnv}`;
                const password = credentialsStore[cacheKey];
                if (password) {
                    try {
                        // Invalidate token cache
                        invalidateToken(username, mappedEnv);
                        // Re-authenticate
                        const newToken = await authenticate(username, password, mappedEnv);
                        console.log(`Pidge: Token refreshed successfully. Retrying request...`);
                        
                        config.headers.Authorization = newToken;
                        return await axios(config);
                    } catch (retryError) {
                        console.error('Pidge: Failed to re-authenticate or retry request:', retryError.message);
                        throw retryError;
                    }
                }
            }
        }
        throw error;
    }
}

async function createPidgeOrder(token, env, order, user, integration, userAddress) {
    const baseUrl = getBaseUrl(env);
    
    // Normalize coordinates and fields
    const senderLat = parseFloat(integration.latitude);
    const senderLng = parseFloat(integration.longitude);
    const receiverLat = parseFloat(userAddress.lat || userAddress.latitude);
    const receiverLng = parseFloat(userAddress.lng || userAddress.longitude);

    if (isNaN(senderLat) || isNaN(senderLng)) {
        throw new ErrorBody(400, 'Sender integration has invalid coordinates (latitude/longitude)');
    }
    if (isNaN(receiverLat) || isNaN(receiverLng)) {
        throw new ErrorBody(400, 'Receiver address has invalid coordinates (latitude/longitude)');
    }

    const payload = {
        channel: 'website',
        poc_detail: {
            name: integration.integrationName || 'Store Manager',
            mobile: cleanMobile(integration.phoneNumber)
        },
        sender_detail: {
            name: integration.integrationName || 'Tubulu Store',
            mobile: cleanMobile(integration.phoneNumber),
            address: {
                address_line_1: integration.addressLine || 'Store Address',
                city: integration.city || 'Delhi',
                state: integration.state || 'Delhi',
                pincode: integration.pincode || '110022',
                latitude: senderLat,
                longitude: senderLng
            }
        },
        trips: [{
            receiver_detail: {
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer',
                mobile: cleanMobile(user.phoneNumber),
                address: {
                    address_line_1: userAddress.line1 || userAddress.addressLine || userAddress.address || 'Customer Address',
                    city: userAddress.city || 'Delhi',
                    state: userAddress.state || 'Delhi',
                    pincode: userAddress.pincode || '110022',
                    latitude: receiverLat,
                    longitude: receiverLng
                }
            },
            packages: [{
                label: 'Package',
                quantity: order.totalQuantity || 1,
                dead_weight: 0.5,
                length: 15,
                breadth: 15,
                height: 15
            }],
            source_order_id: order.id,
            cod_amount: order.paymentMethod?.toLowerCase() === 'cod' ? parseFloat(order.totalPrice) : 0.00,
            bill_amount: parseFloat(order.totalPrice)
        }]
    };

    try {
        console.log('Pidge: Creating order payload:', JSON.stringify(payload, null, 2));
        const response = await pidgeRequest(token, env, {
            method: 'post',
            url: `${baseUrl}/v1.0/store/channel/vendor/order`,
            data: payload
        });

        if (response.data && response.data.data) {
            const pidgeOrderId = response.data.data[order.id];
            if (pidgeOrderId) {
                return pidgeOrderId;
            }
            const keys = Object.keys(response.data.data);
            if (keys.length > 0) {
                return response.data.data[keys[0]];
            }
        }
        throw new Error(response.data?.message || 'Order creation failed, no Pidge order ID returned');
    } catch (error) {
        console.error('Pidge Create Order Error:', error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message);
        throw new ErrorBody(error.response?.status || 500, `Pidge Create Order Failed: ${error.response?.data?.message || error.message}`);
    }
}

async function fulfillPidgeOrder(token, env, pidgeOrderId) {
    const baseUrl = getBaseUrl(env);
    const payload = {
        ids: [pidgeOrderId]
    };

    try {
        console.log(`Pidge: Fulfilling order ${pidgeOrderId}`);
        await pidgeRequest(token, env, {
            method: 'post',
            url: `${baseUrl}/v1.0/store/channel/vendor/order/fulfill/smart`,
            data: payload
        });

        // Construct tracking URL
        const trackingBaseUrl = getTrackingBaseUrl(env);
        const trackingUrl = `${trackingBaseUrl}/T/${pidgeOrderId}`;
        return trackingUrl;
    } catch (error) {
        console.error('Pidge Fulfill Order Error:', error.response?.data || error.message);
        throw new ErrorBody(error.response?.status || 500, `Pidge Fulfill Order Failed: ${error.response?.data?.message || error.message}`);
    }
}

async function cancelPidgeOrder(token, env, pidgeOrderId) {
    const baseUrl = getBaseUrl(env);
    const payload = {
        ids: [pidgeOrderId]
    };

    try {
        console.log(`Pidge: Cancelling order ${pidgeOrderId}`);
        const response = await pidgeRequest(token, env, {
            method: 'post',
            url: `${baseUrl}/v1.0/store/channel/vendor/order/cancel`,
            data: payload
        });
        return response.data;
    } catch (error) {
        console.error('Pidge Cancel Order Error:', error.response?.data || error.message);
        throw new ErrorBody(error.response?.status || 500, `Pidge Cancel Order Failed: ${error.response?.data?.message || error.message}`);
    }
}

async function getDeliveryQuote(token, env, pickupLat, pickupLng, dropLat, dropLng) {
    const baseUrl = getBaseUrl(env);
    
    // Coordinates validation
    const pLat = parseFloat(pickupLat);
    const pLng = parseFloat(pickupLng);
    const dLat = parseFloat(dropLat);
    const dLng = parseFloat(dropLng);
    
    if (isNaN(pLat) || isNaN(pLng) || isNaN(dLat) || isNaN(dLng)) {
        console.error('Pidge: Invalid coordinates passed to getDeliveryQuote');
        return null;
    }
    
    const payload = {
        pickup: {
            coordinates: {
                latitude: pLat,
                longitude: pLng
            }
        },
        drop: [
            {
                ref: "quote_ref",
                location: {
                    coordinates: {
                        latitude: dLat,
                        longitude: dLng
                    }
                }
            }
        ]
    };
    
    try {
        console.log(`Pidge: Requesting quote from ${baseUrl}`);
        const response = await pidgeRequest(token, env, {
            method: 'post',
            url: `${baseUrl}/v1.0/store/channel/vendor/quote`,
            data: payload
        });
        
        if (response.data && response.data.data && Array.isArray(response.data.data.items)) {
            const validQuotes = response.data.data.items.filter(item => 
                item.quote && 
                typeof item.quote.price === 'number' && 
                item.quote.price > 0 && 
                !item.error
            );
            
            if (validQuotes.length > 0) {
                const bestQuote = validQuotes.reduce((min, q) => q.quote.price < min.quote.price ? q : min, validQuotes[0]);
                
                let distanceKm = null;
                if (response.data.data.distance && response.data.data.distance.length > 0) {
                    distanceKm = parseFloat((response.data.data.distance[0].distance / 1000).toFixed(2));
                } else if (typeof bestQuote.quote.distance === 'number') {
                    distanceKm = parseFloat(bestQuote.quote.distance.toFixed(2));
                }
                
                return {
                    estimatedFare: bestQuote.quote.price,
                    distanceKm: distanceKm,
                    currency: 'INR'
                };
            }
        }
        
        console.warn('Pidge: No serviceable quotes returned by Pidge API.');
        return null;
    } catch (error) {
        console.error('Pidge Get Quote Error:', error.response?.data || error.message);
        return null;
    }
}

function invalidateToken(username, env) {
    const cacheKey = `${username}_${env}`;
    const token = tokenCache[cacheKey];
    if (token) {
        delete tokenToUserMap[token];
    }
    delete tokenCache[cacheKey];
    delete credentialsStore[cacheKey];
}

module.exports = {
    authenticate,
    cleanMobile,
    createPidgeOrder,
    fulfillPidgeOrder,
    cancelPidgeOrder,
    getDeliveryQuote,
    invalidateToken,
    _test: {
        tokenCache,
        credentialsStore,
        tokenToUserMap
    }
};
