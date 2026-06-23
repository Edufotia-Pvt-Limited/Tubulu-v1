const { DataTypes } = require('sequelize');
const { sequelize } = require('../Utils/Postgres');

const Integration = sequelize.define('Integration', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    mongoId: {
        type: DataTypes.STRING, // To track migration from Mongo
        allowNull: true,
    },
    logo: {
        type: DataTypes.TEXT,
    },
    integrationName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    apiUrl: {
        type: DataTypes.STRING,
    },
    chatBaseUrl: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT,
    },
    webhookUrl: {
        type: DataTypes.STRING,
    },
    apiAuthKey: {
        type: DataTypes.STRING,
    },
    welcomeMessagePayLoad: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    phoneNumber: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'AI',
    },
    verticalType: {
        type: DataTypes.ENUM('FB', 'RETAIL', 'TICKETING', 'SERVICES', 'GROCERY', 'GOVT', 'TECH', 'AI', 'Hotel'),
        defaultValue: 'FB',
    },
    capabilities: {
        type: DataTypes.JSONB,
        defaultValue: {
            hasInventory: true,
            hasDelivery: true,
            hasTableBooking: false,
            hasSeatSelection: false
        },
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isOnboarded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isSuspended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // Address fields flattened for better querying
    addressLine: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    pincode: { type: DataTypes.STRING },
    landmark: { type: DataTypes.STRING },
    latitude: { type: DataTypes.DECIMAL(10, 8) },
    longitude: { type: DataTypes.DECIMAL(11, 8) },
    openingHours: {
        type: DataTypes.JSONB,
        defaultValue: {
            monday: { open: '09:00', close: '22:00', isOpen: true },
            tuesday: { open: '09:00', close: '22:00', isOpen: true },
            wednesday: { open: '09:00', close: '22:00', isOpen: true },
            thursday: { open: '09:00', close: '22:00', isOpen: true },
            friday: { open: '09:00', close: '22:00', isOpen: true },
            saturday: { open: '09:00', close: '22:00', isOpen: true },
            sunday: { open: '09:00', close: '22:00', isOpen: true },
        }
    },
    bannerImage: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    minimumOrderValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    estimatedDeliveryTime: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 30,
    },
    website: { type: DataTypes.STRING },
    isDocumentsUploaded: { type: DataTypes.BOOLEAN, defaultValue: false },
    isTubuluAppSetupDone: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: { 
        type: DataTypes.ENUM(
            'super_admin',
            'merchant_admin',
            'ops_admin',
            'onboarding_specialist',
            'content_moderator',
            'finance_admin',
            'regional_partner'
        ), 
        defaultValue: 'merchant_admin' 
    },
    assignedCity: { type: DataTypes.STRING, allowNull: true },
    commissionRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
    
    // Business Registration
    gstNumber: { type: DataTypes.STRING },
    receiptSettings: {
        type: DataTypes.JSONB,
        defaultValue: {
            primaryColor: '#007bff',
            logoUrl: null,
            headerNote: '',
            footerNote: 'Powered by Tubulu',
            gstNumber: ''
        }
    },
    panNumber: { type: DataTypes.STRING },
    aadharNumber: { type: DataTypes.STRING },
    trustScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    isGstVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    isPanVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    isAadharVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // External Integrations
    razorpay: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    upi: {
        type: DataTypes.JSONB,
        defaultValue: {
            connected: false,
            vpa: '',
            merchantName: ''
        },
    },
    pidge: {
        type: DataTypes.JSONB,
        defaultValue: {
            enabled: false,
            username: '',
            password: '',
            environment: 'sandbox'
        },
        allowNull: true
    },
    cdpAccessToken: {
        type: DataTypes.STRING,
    },
    shopEstablishmentNumber: { type: DataTypes.STRING },
    
    // KYC Documents
    documents: {
        type: DataTypes.JSONB,
        defaultValue: [], // Array of { type: string, url: string, fileName: string }
    },
    
    // Auth & Verification
    phoneNumberOtp: { type: DataTypes.STRING },
    phoneVerificationExpiry: { type: DataTypes.DATE },
    emailOtp: { type: DataTypes.STRING },
    emailVerificationExpiry: { type: DataTypes.DATE },
    
    // PSTN & Sarvam Voice-AI Shopping Settings
    pstnDID: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sarvamApiKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    geminiApiKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    
    parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Integrations',
            key: 'id'
        }
    },
    countryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Countries', key: 'id' },
    },
    stateId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'States', key: 'id' },
    },
    cityId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Cities', key: 'id' },
    },
}, {
    timestamps: true,
    indexes: [
        { fields: ['phoneNumber'] },
        { fields: ['integrationName'] },
        { fields: ['mongoId'] }
    ]
});

module.exports = Integration;
