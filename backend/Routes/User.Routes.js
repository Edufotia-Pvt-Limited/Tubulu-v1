const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const UserController = require('../Controllers/User.controller');
const { verifyToken } = require('../MiddleWare/VerifyToken.Middleware');
const ErrorBody = require('../Utils/ErrorBody');
const { config } = require('../config');

router.post('/register', [
  body('phoneNumber').notEmpty(),
], UserController.registerUser);

router.post('/verifyOtp', [
  body('phoneNumber').notEmpty(),
  body('otp').notEmpty(),
], UserController.verifyOtp)

router.post('/set-pin', verifyToken, [
  body('pin').isLength({ min: 4, max: 6 }),
], UserController.setPin);

router.post('/verify-pin', [
  body('phoneNumber').notEmpty(),
  body('pin').notEmpty(),
], UserController.verifyPin);


router.post('/refreshToken', [
  body('refreshToken').notEmpty()
], UserController.refreshUserToken)

router.post('/onboard', verifyToken, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('email').custom((value) => {
    if (!value || value.trim() === '') return true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('Invalid email format');
    }
    return true;
  }),
  body('phoneNumber').isEmpty()
], UserController.onboardUser);

router.get("/checkOnboarded", verifyToken, UserController.checkUserOnboarded)

router.get('/selfDetails', verifyToken, UserController.getUserDetails);



router.get('/all-users-qtm', (req, res, next) => {
  const authorization = req.headers['authorization'];
  if (!authorization) {
    next(new ErrorBody(401, 'Invalid api key'))
    return;
  }
  if (authorization !== config.qtmKey) {
    next(new ErrorBody(401, 'Invalid api key'))
    return;
  }
  next();
}, UserController.getAllUsers);

router.post('/user-devices', (req, res, next) => {
  const authorization = req.headers['authorization'];
  if (!authorization) {
    next(new ErrorBody(401, 'Invalid api key'));
    return;
  }
  if (authorization !== config.qtmKey) {
    next(new ErrorBody(401, 'Invalid api key'));
    return;
  }
  next();
}, [
  body('userIds').isArray(),
], UserController.getAllUserDevicesFromUserIds);

router.delete('/delete', verifyToken, UserController.deleteUser)

router.post('/reactivate', UserController.reactivateUser);

router.put('/status', verifyToken, [
  body('status').isIn(['online', 'offline']),
], UserController.updateUserStatus);

router.post('/reviews', verifyToken, async (req, res, next) => {
  try {
    const { Review, FriendRecommendation } = require('../Utils/Postgres');
    const { integrationId, rating, reviewText } = req.body;
    const userId = req.id;
    
    if (!integrationId || !rating) {
      return res.status(400).json({ success: false, message: 'Missing integrationId or rating' });
    }

    const review = await Review.create({
      userId,
      integrationId,
      rating: parseInt(rating),
      reviewText: reviewText || '',
      isPublicToContacts: true
    });

    if (parseInt(rating) >= 3) {
      const recText = (reviewText && reviewText.trim().length > 0) ? reviewText.trim() : 'Recommended';
      const existingRec = await FriendRecommendation.findOne({
        where: { userId, integrationId }
      });
      if (existingRec) {
        existingRec.rating = parseInt(rating);
        existingRec.reviewText = recText;
        await existingRec.save();
      } else {
        await FriendRecommendation.create({
          userId,
          integrationId,
          rating: parseInt(rating),
          reviewText: recText
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Recommendation added successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reviews/:integrationId', verifyToken, async (req, res, next) => {
  try {
    const { Review, User } = require('../Utils/Postgres');
    const { integrationId } = req.params;
    const reviews = await Review.findAll({
      where: { integrationId },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

const WalletController = require('../Controllers/Wallet.controller');
router.get('/wallet', verifyToken, WalletController.getWallet);
router.post('/wallet/redeem', verifyToken, WalletController.redeemPoints);
router.get('/referral-code', verifyToken, WalletController.getReferralCode);

// Helper functions for friend recommendations
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

function isSameCity(city1, city2) {
  if (!city1 || !city2) return false;
  const c1 = city1.trim().toLowerCase();
  const c2 = city2.trim().toLowerCase();
  if (c1 === c2) return true;
  if ((c1 === 'bangalore' || c1 === 'bengaluru') && (c2 === 'bangalore' || c2 === 'bengaluru')) return true;
  if ((c1 === 'mysore' || c1 === 'mysuru') && (c2 === 'mysore' || c2 === 'mysuru')) return true;
  return false;
}

router.get('/friend-recommendations', verifyToken, async (req, res, next) => {
  try {
    const { FriendRecommendation, UserContact, User, City, Integration } = require('../Utils/Postgres');
    const { Op } = require('sequelize');
    const userId = req.id;
    const { lat, lng } = req.query;

    // 1. Get current user profile to verify phone contacts mutually
    const currentUser = await User.findByPk(userId);
    if (!currentUser || !currentUser.phoneNumber) {
      return res.status(200).json({
        success: true,
        data: {
          carousel: [],
          vibeContext: []
        }
      });
    }

    const cleanUserPhone = currentUser.phoneNumber.replace(/[^0-9]/g, '');
    const last10UserPhone = cleanUserPhone.length >= 10 ? cleanUserPhone.substring(cleanUserPhone.length - 10) : cleanUserPhone;

    // 2. Fetch viewing user's contacts
    const contacts = await UserContact.findAll({ where: { userId } });
    if (contacts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          carousel: [],
          vibeContext: []
        }
      });
    }

    const phoneNumbers = [];
    contacts.forEach(c => {
      const clean = c.contactPhoneNumber.replace(/[^0-9]/g, '');
      const last10 = clean.length >= 10 ? clean.substring(clean.length - 10) : clean;
      if (last10) {
        phoneNumbers.push(last10);
        phoneNumbers.push(`+91${last10}`);
        phoneNumbers.push(`91${last10}`);
      }
    });

    // 3. Find registered friends
    const friends = await User.findAll({ where: { phoneNumber: { [Op.in]: phoneNumbers } } });
    const friendIds = friends.map(f => f.id).filter(id => id !== userId);
    if (friendIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          carousel: [],
          vibeContext: []
        }
      });
    }

    // 4. Verify mutual contacts: friends must have current user's number in their contacts
    const mutualContacts = await UserContact.findAll({
      where: {
        userId: { [Op.in]: friendIds },
        contactPhoneNumber: {
          [Op.or]: [
            { [Op.like]: `%${last10UserPhone}` }
          ]
        }
      }
    });

    const mutualFriendIds = [];
    for (const mc of mutualContacts) {
      const cleanPhone = mc.contactPhoneNumber.replace(/[^0-9]/g, '');
      if (cleanPhone.endsWith(last10UserPhone)) {
        mutualFriendIds.push(mc.userId);
      }
    }

    if (mutualFriendIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          carousel: [],
          vibeContext: []
        }
      });
    }

    // 5. Fetch all recommendations from mutual friends (include user and integration details)
    const recs = await FriendRecommendation.findAll({
      where: {
        userId: { [Op.in]: mutualFriendIds }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'phoneNumber']
        },
        {
          model: Integration,
          as: 'integration',
          attributes: ['city', 'assignedCity', 'cityId']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // 6. Location Filtering (if coordinates provided)
    let filteredRecs = recs;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      const cities = await City.findAll({
        where: {
          isActive: true,
          latitude: { [Op.ne]: null },
          longitude: { [Op.ne]: null }
        }
      });

      if (cities.length > 0) {
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
        if (minDistance <= radius) {
          filteredRecs = recs.filter(r => {
            const integration = r.integration;
            if (!integration) return false;
            return (integration.cityId === closestCity.id) ||
                   isSameCity(integration.city, closestCity.name) ||
                   isSameCity(integration.assignedCity, closestCity.name);
          });
        } else {
          // Outside any active city's radius
          filteredRecs = [];
        }
      } else {
        filteredRecs = [];
      }
    }

    // 7. Format the output
    const formatted = filteredRecs.map(r => {
      const friend = r.user;
      const contactRel = contacts.find(c => {
        if (!friend) return false;
        const cPhone = c.contactPhoneNumber.replace(/[^0-9]/g, '');
        const fPhone = friend.phoneNumber.replace(/[^0-9]/g, '');
        return cPhone.endsWith(fPhone.substring(fPhone.length - 10));
      });
      const displayName = (friend ? `${friend.firstName || ''} ${friend.lastName || ''}`.trim() : null) || 
                          contactRel?.contactName || 
                          friend?.phoneNumber || 
                          "Your friend";

      return {
        integrationId: r.integrationId,
        rating: r.rating,
        reviewText: r.reviewText,
        friendName: displayName,
        createdAt: r.updatedAt || r.createdAt
      };
    });

    // Group by integrationId
    const groupedByMerchant = {};
    formatted.forEach(item => {
      if (!groupedByMerchant[item.integrationId]) {
        groupedByMerchant[item.integrationId] = [];
      }
      groupedByMerchant[item.integrationId].push(item);
    });

    const sortedIntegrationIds = Object.keys(groupedByMerchant).sort((a, b) => {
      return groupedByMerchant[b].length - groupedByMerchant[a].length;
    });

    const carousel = [];
    const vibeContext = [];

    for (const integrationId of sortedIntegrationIds) {
      const merchantRecs = groupedByMerchant[integrationId];
      const top3 = merchantRecs.slice(0, 3);
      const rest = merchantRecs.slice(3);

      carousel.push({
        integrationId,
        recommendations: top3
      });

      vibeContext.push(...rest);
    }

    res.status(200).json({
      success: true,
      data: {
        carousel,
        vibeContext
      }
    });
  } catch (error) {
    next(error);
  }
});
router.post('/contacts/sync', verifyToken, async (req, res, next) => {
  try {
    const { UserContact } = require('../Utils/Postgres');
    const userId = req.id;
    const { contacts } = req.body;

    if (!Array.isArray(contacts)) {
      return res.status(400).json({ success: false, message: 'contacts must be an array' });
    }

    // 1. Delete existing contacts for this user
    await UserContact.destroy({ where: { userId } });

    // 2. Format and sanitize contacts
    const contactsToCreate = [];
    for (const c of contacts) {
      const name = c.name || '';
      let phone = c.phoneNumber || '';
      // Clean phone number (keep digits only)
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        contactsToCreate.push({
          userId,
          contactName: name.trim(),
          contactPhoneNumber: cleanPhone
        });
      }
    }

    // 3. Bulk insert new contacts
    if (contactsToCreate.length > 0) {
      await UserContact.bulkCreate(contactsToCreate, { ignoreDuplicates: true });
    }

    res.status(200).json({
      success: true,
      message: `Successfully synchronized ${contactsToCreate.length} contacts`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;