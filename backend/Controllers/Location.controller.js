const { Country, State, City, StateServiceConfig, ServiceProvider } = require('../Utils/Postgres');
const ErrorBody = require('../Utils/ErrorBody');

// COUNTRIES
async function getCountries(req, res, next) {
    try {
        const countries = await Country.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
        res.json({ success: true, data: countries });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}
async function createCountry(req, res, next) {
    try {
        const country = await Country.create({ name: req.body.name, code: req.body.code });
        res.status(201).json({ success: true, data: country });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}
async function updateCountry(req, res, next) {
    try {
        await Country.update(req.body, { where: { id: req.params.id } });
        res.json({ success: true, data: await Country.findByPk(req.params.id) });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}
async function deleteCountry(req, res, next) {
    try {
        await Country.update({ isActive: false }, { where: { id: req.params.id } });
        res.json({ success: true, message: 'Country deactivated' });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}

// STATES
async function getStates(req, res, next) {
    try {
        const where = { isActive: true };
        if (req.query.countryId) where.countryId = req.query.countryId;
        const states = await State.findAll({
            where,
            include: [{
                model: StateServiceConfig,
                as: 'serviceConfigs',
                include: [{
                    model: ServiceProvider,
                    as: 'provider',
                    where: { isActive: true }
                }]
            }],
            order: [['name', 'ASC']]
        });
        const mapped = states.map(s => {
            const plain = s.get({ plain: true });
            
            let sarvamApiKey = null;
            let geminiApiKey = null;
            let geminiBackupApiKey = null;
            let voiceProvider = null;
            let chatProvider = null;
            
            if (plain.serviceConfigs) {
                for (const cfg of plain.serviceConfigs) {
                    if (cfg.provider) {
                        if (cfg.provider.serviceType === 'STT_TTS') {
                            voiceProvider = cfg.provider.serviceProvider;
                            sarvamApiKey = cfg.config?.apiKey || null;
                        } else if (cfg.provider.serviceType === 'LLM') {
                            chatProvider = cfg.provider.serviceProvider;
                            geminiApiKey = cfg.config?.apiKey || null;
                            geminiBackupApiKey = cfg.config?.backupApiKey || null;
                        }
                    }
                }
            }
            
            plain.voiceProvider = voiceProvider;
            plain.chatProvider = chatProvider;
            plain.sarvamApiKey = sarvamApiKey;
            plain.geminiApiKey = geminiApiKey;
            plain.geminiBackupApiKey = geminiBackupApiKey;

            if (plain.sarvamApiKey) {
                plain.sarvamApiKey = '••••••••' + plain.sarvamApiKey.slice(-6);
            }
            if (plain.geminiApiKey) {
                plain.geminiApiKey = '••••••••' + plain.geminiApiKey.slice(-6);
            }
            if (plain.geminiBackupApiKey) {
                plain.geminiBackupApiKey = '••••••••' + plain.geminiBackupApiKey.slice(-6);
            }
            return plain;
        });
        res.json({ success: true, data: mapped });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}
async function createState(req, res, next) {
    try {
        const state = await State.create({ name: req.body.name, countryId: req.body.countryId });
        res.status(201).json({ success: true, data: state });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}
async function updateState(req, res, next) {
    try {
        const userRole = req.user?.role;
        const stateId = req.params.id;
        
        let updateData = {};
        let keysToUpdate = {};
        
        if (userRole === 'regional_manager') {
            if (stateId !== req.user.scopedStateId) {
                return next(new ErrorBody(403, 'Forbidden: You can only update your assigned state'));
            }
            // Only allow updating sarvamApiKey, geminiApiKey, voiceProvider, and chatProvider
            if ('sarvamApiKey' in req.body) keysToUpdate.sarvamApiKey = req.body.sarvamApiKey;
            if ('geminiApiKey' in req.body) keysToUpdate.geminiApiKey = req.body.geminiApiKey;
            if ('geminiBackupApiKey' in req.body) keysToUpdate.geminiBackupApiKey = req.body.geminiBackupApiKey;
            if ('voiceProvider' in req.body) keysToUpdate.voiceProvider = req.body.voiceProvider;
            if ('chatProvider' in req.body) keysToUpdate.chatProvider = req.body.chatProvider;
        } else if (userRole === 'super_admin' || userRole === 'SuperAdmin') {
            // Extract core state fields for State table
            if ('name' in req.body) updateData.name = req.body.name;
            if ('countryId' in req.body) updateData.countryId = req.body.countryId;
            if ('isActive' in req.body) updateData.isActive = req.body.isActive;
            
            // Service provider fields go to junction table
            if ('sarvamApiKey' in req.body) keysToUpdate.sarvamApiKey = req.body.sarvamApiKey;
            if ('geminiApiKey' in req.body) keysToUpdate.geminiApiKey = req.body.geminiApiKey;
            if ('geminiBackupApiKey' in req.body) keysToUpdate.geminiBackupApiKey = req.body.geminiBackupApiKey;
            if ('voiceProvider' in req.body) keysToUpdate.voiceProvider = req.body.voiceProvider;
            if ('chatProvider' in req.body) keysToUpdate.chatProvider = req.body.chatProvider;
        } else {
            return next(new ErrorBody(403, 'Forbidden: Insufficient permissions'));
        }

        // 1. Update State table if there is any core field
        if (Object.keys(updateData).length > 0) {
            await State.update(updateData, { where: { id: stateId } });
        }

        // 2. Handle Service Provider updates
        // For STT_TTS
        if ('voiceProvider' in keysToUpdate || 'sarvamApiKey' in keysToUpdate) {
            let currentVoiceProvider = 'sarvam'; // default fallback
            
            const existingConfig = await StateServiceConfig.findOne({
                where: { stateId },
                include: [{
                    model: ServiceProvider,
                    as: 'provider',
                    where: { serviceType: 'STT_TTS' }
                }]
            });
            
            if (existingConfig && existingConfig.provider) {
                currentVoiceProvider = existingConfig.provider.serviceProvider;
            }
            
            const targetVoiceProvider = keysToUpdate.voiceProvider !== undefined ? keysToUpdate.voiceProvider : currentVoiceProvider;
            
            const [providerObj] = await ServiceProvider.findOrCreate({
                where: {
                    serviceType: 'STT_TTS',
                    serviceProvider: targetVoiceProvider
                }
            });
            
            let newApiKey = keysToUpdate.sarvamApiKey;
            if (newApiKey === undefined && existingConfig) {
                newApiKey = existingConfig.config?.apiKey;
            }
            
            if (existingConfig) {
                await existingConfig.destroy();
            }
            
            if (providerObj) {
                await StateServiceConfig.create({
                    stateId,
                    serviceProviderId: providerObj.id,
                    config: { apiKey: newApiKey || null }
                });
            }
        }
        
        // For LLM
        if ('chatProvider' in keysToUpdate || 'geminiApiKey' in keysToUpdate || 'geminiBackupApiKey' in keysToUpdate) {
            let currentChatProvider = 'gemini'; // default fallback
            
            const existingConfig = await StateServiceConfig.findOne({
                where: { stateId },
                include: [{
                    model: ServiceProvider,
                    as: 'provider',
                    where: { serviceType: 'LLM' }
                }]
            });
            
            if (existingConfig && existingConfig.provider) {
                currentChatProvider = existingConfig.provider.serviceProvider;
            }
            
            const targetChatProvider = keysToUpdate.chatProvider !== undefined ? keysToUpdate.chatProvider : currentChatProvider;
            
            const [providerObj] = await ServiceProvider.findOrCreate({
                where: {
                    serviceType: 'LLM',
                    serviceProvider: targetChatProvider
                },
                defaults: { isActive: true }
            });
            
            let newApiKey = keysToUpdate.geminiApiKey;
            if (newApiKey === undefined && existingConfig) {
                newApiKey = existingConfig.config?.apiKey;
            }

            let newBackupApiKey = keysToUpdate.geminiBackupApiKey;
            if (newBackupApiKey === undefined && existingConfig) {
                newBackupApiKey = existingConfig.config?.backupApiKey;
            }
            
            if (existingConfig) {
                await existingConfig.destroy();
            }
            
            if (providerObj) {
                await StateServiceConfig.create({
                    stateId,
                    serviceProviderId: providerObj.id,
                    config: { 
                        apiKey: newApiKey || null,
                        backupApiKey: newBackupApiKey || null
                    }
                });
            }
        }

        const updated = await State.findByPk(stateId, {
            include: [{
                model: StateServiceConfig,
                as: 'serviceConfigs',
                include: [{
                    model: ServiceProvider,
                    as: 'provider',
                    where: { isActive: true }
                }]
            }]
        });
        if (!updated) {
            return next(new ErrorBody(404, 'State not found'));
        }
        
        const plain = updated.get({ plain: true });
        let sarvamApiKey = null;
        let geminiApiKey = null;
        let geminiBackupApiKey = null;
        let voiceProvider = null;
        let chatProvider = null;
        
        if (plain.serviceConfigs) {
            for (const cfg of plain.serviceConfigs) {
                if (cfg.provider) {
                    if (cfg.provider.serviceType === 'STT_TTS') {
                        voiceProvider = cfg.provider.serviceProvider;
                        sarvamApiKey = cfg.config?.apiKey || null;
                    } else if (cfg.provider.serviceType === 'LLM') {
                        chatProvider = cfg.provider.serviceProvider;
                        geminiApiKey = cfg.config?.apiKey || null;
                        geminiBackupApiKey = cfg.config?.backupApiKey || null;
                    }
                }
            }
        }
        
        plain.voiceProvider = voiceProvider;
        plain.chatProvider = chatProvider;
        plain.sarvamApiKey = sarvamApiKey;
        plain.geminiApiKey = geminiApiKey;

        if (plain.sarvamApiKey) {
            plain.sarvamApiKey = '••••••••' + plain.sarvamApiKey.slice(-6);
        }
        if (plain.geminiApiKey) {
            plain.geminiApiKey = '••••••••' + plain.geminiApiKey.slice(-6);
        }
        res.json({ success: true, data: plain });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}
async function deleteState(req, res, next) {
    try {
        await State.update({ isActive: false }, { where: { id: req.params.id } });
        res.json({ success: true, message: 'State deactivated' });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}

// CITIES
async function getCities(req, res, next) {
    try {
        const where = { isActive: true };
        if (req.query.stateId) where.stateId = req.query.stateId;
        res.json({ success: true, data: await City.findAll({ where, order: [['name', 'ASC']] }) });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}
async function createCity(req, res, next) {
    try {
        const city = await City.create({
            name: req.body.name,
            stateId: req.body.stateId,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            radius: req.body.radius,
            themeConfig: req.body.themeConfig,
        });
        res.status(201).json({ success: true, data: city });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}
async function updateCity(req, res, next) {
    try {
        const userRole = req.user?.role?.toLowerCase();
        if (userRole === 'city_manager') {
            if (req.params.id !== req.user.scopedCityId) {
                return next(new ErrorBody(403, 'Access denied: You can only update your own city configuration'));
            }
        }
        await City.update(req.body, { where: { id: req.params.id } });
        res.json({ success: true, data: await City.findByPk(req.params.id) });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}
async function deleteCity(req, res, next) {
    try {
        await City.update({ isActive: false }, { where: { id: req.params.id } });
        res.json({ success: true, message: 'City deactivated' });
    } catch (e) { next(new ErrorBody(500, e.message)); }
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

async function resolveLocation(req, res, next) {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return next(new ErrorBody(400, 'lat and lng parameters are required'));
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        const { Op } = require('sequelize');
        const cities = await City.findAll({
            where: {
                isActive: true,
                latitude: { [Op.ne]: null },
                longitude: { [Op.ne]: null }
            }
        });

        if (cities.length === 0) {
            return res.json({ success: true, data: null });
        }

        let closestCity = null;
        let minDistance = Infinity;

        for (const city of cities) {
            const cityLat = parseFloat(city.latitude);
            const cityLng = parseFloat(city.longitude);
            const distance = getDistance(userLat, userLng, cityLat, cityLng);

            if (distance < minDistance) {
                minDistance = distance;
                closestCity = city;
            }
        }

        const radius = closestCity.radius ? parseFloat(closestCity.radius) : 20.0;
        const isWithinRadius = minDistance <= radius;

        res.json({
            success: true,
            data: {
                city: closestCity.name,
                distanceKm: minDistance,
                isWithinRadius,
                themeConfig: closestCity.themeConfig || {}
            }
        });
    } catch (e) {
        next(new ErrorBody(500, e.message));
    }
}

module.exports = {
    getCountries, createCountry, updateCountry, deleteCountry,
    getStates, createState, updateState, deleteState,
    getCities, createCity, updateCity, deleteCity,
    resolveLocation,
};
