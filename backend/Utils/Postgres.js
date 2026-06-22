const { Sequelize } = require('sequelize');
const { config } = require('../config');

const sequelize = new Sequelize(
    config.POSTGRES.database,
    config.POSTGRES.user,
    config.POSTGRES.password,
    {
        host: config.POSTGRES.host,
        dialect: 'postgres',
        port: config.POSTGRES.port,
        logging: false,
    }
);

const connectPostgres = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connection has been established successfully.');
        // Sync models
        // Sync models — use drop:false to never remove columns not in the model.
        // This is critical for the pgvector 'embedding' column on EmbeddingChunks
        // which is managed via raw SQL and not declared in the Sequelize model.
        await sequelize.sync({ alter: { drop: false } });

        // Seed default locations
        const CountryModel = require('../Models/Country.pg.js');
        const StateModel = require('../Models/State.pg.js');
        const CityModel = require('../Models/City.pg.js');

        let india = await CountryModel.findOne({ where: { name: 'India' } });
        if (!india) {
            console.log('Seeding country: India');
            india = await CountryModel.create({ name: 'India', code: 'IN' });
        }

        const statesList = [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
            'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
            'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
            'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
            'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
            'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
        ];

        console.log('Seeding states of India...');
        for (const stateName of statesList) {
            const [stateObj, created] = await StateModel.findOrCreate({
                where: { name: stateName, countryId: india.id }
            });
            if (created && stateName === 'Karnataka') {
                await CityModel.findOrCreate({ where: { name: 'Mysuru', stateId: stateObj.id } });
                await CityModel.findOrCreate({ where: { name: 'Bengaluru', stateId: stateObj.id } });
            }
        }
        console.log('States seeding complete.');
    } catch (error) {
        console.error('Unable to connect to the PostgreSQL database:', error);
    }
};

// Export base first
module.exports.sequelize = sequelize;
module.exports.connectPostgres = connectPostgres;

// Load Models
const User = require('../Models/User.pg.model.js');
const Integration = require('../Models/Integration.pg.js');
const Catalogue = require('../Models/Catalogue.pg.js');
const Product = require('../Models/Product.pg.js');
const ChatRoom = require('../Models/ChatRoom.pg.js');
const ChatMessage = require('../Models/ChatMessage.pg.js');
const Cart = require('../Models/Cart.pg.js');
const Deal = require('../Models/Deal.pg.js');
const Order = require('../Models/Order.pg.js');
const UserDealUsage = require('../Models/UserDealUsage.pg.js');
const Settlement = require('../Models/Settlement.pg.js');
const Customization = require('../Models/Custmization.pg.js');
const UserDevice = require('../Models/UserDevice.pg.js');
const Advertisement = require('../Models/Advertisement.pg.js');
const Campaign = require('../Models/Campaign.pg.js');
const CampaignTemplate = require('../Models/CampaignTemplate.pg.js');
const QRCategory = require('../Models/QRCategory.pg.js');
const QRCode = require('../Models/QRCode.pg.js');
const PhoneBook = require('../Models/PhoneBook.pg.js');
const PhoneBookGroup = require('../Models/PhoneBookGroup.pg.js');
const PhoneBookGroupRelation = require('../Models/PhoneBookGroupRelation.pg.js');
const BlockedIntegration = require('../Models/BlockedIntegration.pg.js');
const AICategoryPlaybook = require('../Models/AICategoryPlaybook.pg.js');
const MerchantMembership = require('../Models/MerchantMembership.pg.js');
const VendorAIConfig = require('../Models/VendorAIConfig.pg.js');
const SystemSetting = require('../Models/SystemSetting.pg.js');
const Review = require('../Models/Review.pg.js');
const FriendRecommendation = require('../Models/FriendRecommendation.pg.js');
const UserContact = require('../Models/UserContact.pg.js');
const MessageBookmark = require('../Models/MessageBookmark.pg.js');
const MessageNote = require('../Models/MessageNotes.pg.js');
const ChatDocument = require('../Models/ChatDocument.pg.js');
const IntegrationDocument = require('../Models/IntegrationDocument.pg.js');
const EmbeddingChunk = require('../Models/EmbeddingChunk.pg.js');
const AdminStaff = require('../Models/AdminStaff.pg.js');
const AuditLog = require('../Models/AuditLog.pg.js');
const Wallet = require('../Models/Wallet.pg.js');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction.pg.js');
const SupportTicket = require('../Models/SupportTicket.pg.js');
const Country = require('../Models/Country.pg.js');
const State = require('../Models/State.pg.js');
const City = require('../Models/City.pg.js');
const IntegrationFB = require('../Models/IntegrationFB.pg.js');
const IntegrationGrocery = require('../Models/IntegrationGrocery.pg.js');
const IntegrationRetail = require('../Models/IntegrationRetail.pg.js');
const ServiceProvider = require('../Models/ServiceProvider.pg.js');
const StateServiceConfig = require('../Models/StateServiceConfig.pg.js');
const EnablerOnboarding = require('../Models/EnablerOnboarding.pg.js');
const StoreFeed = require('../Models/StoreFeed.pg.js');
const AITokenLog = require('../Models/AITokenLog.pg.js');
const SubscriptionPlan = require('../Models/SubscriptionPlan.pg.js');
const MerchantSubscription = require('../Models/MerchantSubscription.pg.js');
const MerchantWallet = require('../Models/MerchantWallet.pg.js');
const PaymentTransaction = require('../Models/PaymentTransaction.pg.js');
const DeliveryTransaction = require('../Models/DeliveryTransaction.pg.js');

const models = {
    User,
    Integration,
    Catalogue,
    Product,
    IntegrationFB,
    IntegrationGrocery,
    IntegrationRetail,
    EnablerOnboarding,
    ChatRoom,
    ChatMessage,
    Cart,
    Deal,
    Order,
    UserDealUsage,
    Settlement,
    Customization,
    UserDevice,
    Advertisement,
    Campaign,
    CampaignTemplate,
    QRCategory,
    QRCode,
    PhoneBook,
    PhoneBookGroup,
    PhoneBookGroupRelation,
    BlockedIntegration,
    AICategoryPlaybook,
    MerchantMembership,
    VendorAIConfig,
    SystemSetting,
    Review,
    FriendRecommendation,
    UserContact,
    MessageBookmark,
    MessageNote,
    ChatDocument,
    IntegrationDocument,
    EmbeddingChunk,
    AdminStaff,
    AuditLog,
    Wallet,
    LoyaltyTransaction,
    SupportTicket,
    Country,
    State,
    City,
    ServiceProvider,
    StateServiceConfig,
    StoreFeed,
    AITokenLog,
    SubscriptionPlan,
    MerchantSubscription,
    MerchantWallet,
    PaymentTransaction,
    DeliveryTransaction,
};

// Setup Associations
const { setupAssociations } = require('../Models/Associations');
setupAssociations(models);

// Attach to exports
module.exports.User = User;
module.exports.Integration = Integration;
module.exports.Catalogue = Catalogue;
module.exports.Product = Product;
module.exports.ChatRoom = ChatRoom;
module.exports.ChatMessage = ChatMessage;
module.exports.Cart = Cart;
module.exports.Deal = Deal;
module.exports.Order = Order;
module.exports.UserDealUsage = UserDealUsage;
module.exports.Settlement = Settlement;
module.exports.Customization = Customization;
module.exports.UserDevice = UserDevice;
module.exports.Advertisement = Advertisement;
module.exports.Campaign = Campaign;
module.exports.CampaignTemplate = CampaignTemplate;
module.exports.QRCategory = QRCategory;
module.exports.QRCode = QRCode;
module.exports.PhoneBook = PhoneBook;
module.exports.PhoneBookGroup = PhoneBookGroup;
module.exports.PhoneBookGroupRelation = PhoneBookGroupRelation;
module.exports.BlockedIntegration = BlockedIntegration;
module.exports.AICategoryPlaybook = AICategoryPlaybook;
module.exports.MerchantMembership = MerchantMembership;
module.exports.VendorAIConfig = VendorAIConfig;
module.exports.SystemSetting = SystemSetting;
module.exports.Review = Review;
module.exports.FriendRecommendation = FriendRecommendation;
module.exports.UserContact = UserContact;
module.exports.MessageBookmark = MessageBookmark;
module.exports.MessageNote = MessageNote;
module.exports.ChatDocument = ChatDocument;
module.exports.IntegrationDocument = IntegrationDocument;
module.exports.EmbeddingChunk = EmbeddingChunk;
module.exports.AdminStaff = AdminStaff;
module.exports.AuditLog = AuditLog;
module.exports.Wallet = Wallet;
module.exports.LoyaltyTransaction = LoyaltyTransaction;
module.exports.SupportTicket = SupportTicket;
module.exports.Country = Country;
module.exports.State = State;
module.exports.City = City;
module.exports.IntegrationFB = IntegrationFB;
module.exports.IntegrationGrocery = IntegrationGrocery;
module.exports.IntegrationRetail = IntegrationRetail;
module.exports.ServiceProvider = ServiceProvider;
module.exports.StateServiceConfig = StateServiceConfig;
module.exports.EnablerOnboarding = EnablerOnboarding;
module.exports.StoreFeed = StoreFeed;
module.exports.AITokenLog = AITokenLog;
module.exports.SubscriptionPlan = SubscriptionPlan;
module.exports.MerchantSubscription = MerchantSubscription;
module.exports.MerchantWallet = MerchantWallet;
module.exports.PaymentTransaction = PaymentTransaction;
module.exports.DeliveryTransaction = DeliveryTransaction;
