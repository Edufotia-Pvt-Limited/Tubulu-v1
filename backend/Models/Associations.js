function setupAssociations(models) {
  const {
    User,
    Integration,
    Catalogue,
    Product,
    ChatRoom,
    ChatMessage,
    Cart,
    Deal,
    Order,
    Customization,
    UserDevice,
    PhoneBook,
    MerchantMembership,
    Settlement,
    VendorAIConfig,
    IntegrationDocument,
    BlockedIntegration,
    PhoneBookGroup,
    PhoneBookGroupRelation,
    Advertisement,
    Review,
    UserContact,
    MessageNote,
    MessageBookmark,
    Country,
    State,
    City,
    IntegrationFB,
    IntegrationGrocery,
    IntegrationRetail,
    SupportTicket,
    FriendRecommendation,
    ServiceProvider,
    StateServiceConfig,
    EnablerOnboarding,
    StoreFeed
  } = models;

  // EnablerOnboarding Associations
  EnablerOnboarding.belongsTo(User, { foreignKey: 'enablerId', as: 'enabler' });
  EnablerOnboarding.belongsTo(User, { foreignKey: 'reviewedByUserId', as: 'reviewer' });
  EnablerOnboarding.belongsTo(Integration, { foreignKey: 'integrationId', as: 'merchant' });
  EnablerOnboarding.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

  User.hasMany(EnablerOnboarding, { foreignKey: 'enablerId', as: 'submissions' });
  Integration.hasOne(EnablerOnboarding, { foreignKey: 'integrationId', as: 'onboardingRecord' });

  // FriendRecommendation
  FriendRecommendation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  FriendRecommendation.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  User.hasMany(FriendRecommendation, { foreignKey: 'userId', as: 'friendRecommendations' });
  Integration.hasMany(FriendRecommendation, { foreignKey: 'integrationId', as: 'friendRecommendations' });

  // Review
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Review.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
  Integration.hasMany(Review, { foreignKey: 'integrationId', as: 'reviews' });

  // UserContact
  UserContact.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Cart
  Cart.belongsTo(User, { foreignKey: 'userId' });
  Cart.belongsTo(Integration, { foreignKey: 'integrationId' });

  // Catalogue
  Integration.hasMany(Catalogue, { foreignKey: 'integrationId', as: 'catalogues' });
  Catalogue.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  Catalogue.hasMany(Product, { foreignKey: 'catalogueId', as: 'products' });
  Product.belongsTo(Catalogue, { foreignKey: 'catalogueId', as: 'catalogue' });

  // Chat
  ChatRoom.hasMany(ChatMessage, { foreignKey: 'chatRoomId', as: 'messages' });
  ChatMessage.belongsTo(ChatRoom, { foreignKey: 'chatRoomId' });
  
  User.hasMany(ChatRoom, { foreignKey: 'userId', as: 'chatRooms' });
  ChatRoom.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  Integration.hasMany(ChatRoom, { foreignKey: 'integrationId', as: 'chatRooms' });
  ChatRoom.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });

  // Customization
  Integration.hasMany(Customization, { foreignKey: 'integrationId' });
  Customization.belongsTo(Integration, { foreignKey: 'integrationId' });
  Customization.hasMany(Product, { foreignKey: 'customizationId', as: 'products' });
  Product.belongsTo(Customization, { foreignKey: 'customizationId', as: 'customization' });

  // Deal
  Deal.belongsTo(Integration, { foreignKey: 'integrationId' });

  // Order
  Order.belongsTo(User, { foreignKey: 'userId' });
  Order.belongsTo(Integration, { foreignKey: 'integrationId' });
  SupportTicket.belongsTo(Order, { foreignKey: 'orderId' });
  Order.hasMany(SupportTicket, { foreignKey: 'orderId' });

  // PhoneBook
  PhoneBook.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  PhoneBook.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });

  // PhoneBookGroup & Relation
  PhoneBookGroup.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  PhoneBookGroup.hasMany(PhoneBookGroupRelation, { foreignKey: 'groupId', as: 'relations' });
  PhoneBookGroupRelation.belongsTo(PhoneBookGroup, { foreignKey: 'groupId', as: 'group' });
  PhoneBook.hasMany(PhoneBookGroupRelation, { foreignKey: 'phoneBookId', as: 'phonebookgrouprelation' });
  PhoneBookGroupRelation.belongsTo(PhoneBook, { foreignKey: 'phoneBookId', as: 'phoneBook' });

  // IntegrationDocument
  Integration.hasMany(IntegrationDocument, { foreignKey: 'integrationId', as: 'integrationDocuments' });
  IntegrationDocument.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });

  // BlockedIntegration
  BlockedIntegration.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  BlockedIntegration.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  Integration.hasMany(BlockedIntegration, { foreignKey: 'integrationId', as: 'blockedInstances' });
  User.hasMany(BlockedIntegration, { foreignKey: 'userId', as: 'blockedIntegrations' });

  // Product
  Integration.hasMany(Product, { foreignKey: 'integrationId' });
  Product.belongsTo(Integration, { foreignKey: 'integrationId' });

  // Settlement
  Integration.hasMany(Settlement, { foreignKey: 'integrationId' });
  Settlement.belongsTo(Integration, { foreignKey: 'integrationId' });

  // UserDevice
  UserDevice.belongsTo(User, { foreignKey: 'userId' });

  // MerchantMembership
  User.hasMany(MerchantMembership, { foreignKey: 'userId', as: 'memberships' });
  MerchantMembership.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Integration.hasMany(MerchantMembership, { foreignKey: 'integrationId', as: 'memberships' });
  MerchantMembership.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });

  // Vendor AI Config
  VendorAIConfig.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  Integration.hasOne(VendorAIConfig, { foreignKey: 'integrationId', as: 'aiConfig' });

  // Branches
  Integration.hasMany(Integration, { as: 'branches', foreignKey: 'parentId' });
  Integration.belongsTo(Integration, { as: 'parent', foreignKey: 'parentId' });

  // Advertisement
  Advertisement.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  Integration.hasMany(Advertisement, { foreignKey: 'integrationId', as: 'advertisements' });

  // MessageNote
  MessageNote.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  MessageNote.belongsTo(ChatMessage, { foreignKey: 'chatMessageId', as: 'chatMessage' });
  ChatMessage.hasMany(MessageNote, { foreignKey: 'chatMessageId', as: 'notes' });
  MessageNote.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });
  ChatRoom.hasMany(MessageNote, { foreignKey: 'chatRoomId', as: 'notes' });

  // MessageBookmark
  MessageBookmark.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  MessageBookmark.belongsTo(ChatMessage, { foreignKey: 'chatMessageId', as: 'chatMessage' });
  ChatMessage.hasMany(MessageBookmark, { foreignKey: 'chatMessageId', as: 'bookmarks' });

  // Location Hierarchy
  Country.hasMany(State, { foreignKey: 'countryId', as: 'states' });
  State.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

  State.hasMany(City, { foreignKey: 'stateId', as: 'cities' });
  City.belongsTo(State, { foreignKey: 'stateId', as: 'state' });

  City.hasMany(Integration, { foreignKey: 'cityId', as: 'integrations' });
  Integration.belongsTo(City, { foreignKey: 'cityId', as: 'city_detail' });
  Integration.belongsTo(State, { foreignKey: 'stateId', as: 'state_detail' });
  Integration.belongsTo(Country, { foreignKey: 'countryId', as: 'country_detail' });

  // User Scoping Locations
  User.belongsTo(City, { foreignKey: 'scopedCityId', as: 'city_detail' });
  User.belongsTo(State, { foreignKey: 'scopedStateId', as: 'state_detail' });
  User.belongsTo(Country, { foreignKey: 'scopedCountryId', as: 'country_detail' });

  // Class Table Inheritance 1:1 Associations
  Integration.hasOne(IntegrationFB, { foreignKey: 'integrationId', as: 'fbDetails', onDelete: 'CASCADE' });
  IntegrationFB.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });

  Integration.hasOne(IntegrationGrocery, { foreignKey: 'integrationId', as: 'groceryDetails', onDelete: 'CASCADE' });
  IntegrationGrocery.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });

  Integration.hasOne(IntegrationRetail, { foreignKey: 'integrationId', as: 'retailDetails', onDelete: 'CASCADE' });
  IntegrationRetail.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });

  // Service Provider Associations
  State.hasMany(StateServiceConfig, { foreignKey: 'stateId', as: 'serviceConfigs', onDelete: 'CASCADE' });
  StateServiceConfig.belongsTo(State, { foreignKey: 'stateId', as: 'state' });

  ServiceProvider.hasMany(StateServiceConfig, { foreignKey: 'serviceProviderId', as: 'stateConfigs', onDelete: 'CASCADE' });
  StateServiceConfig.belongsTo(ServiceProvider, { foreignKey: 'serviceProviderId', as: 'provider' });

  // StoreFeed Associations
  Integration.hasMany(StoreFeed, { foreignKey: 'integrationId', as: 'feeds', onDelete: 'CASCADE' });
  StoreFeed.belongsTo(Integration, { foreignKey: 'integrationId', as: 'store' });
  StoreFeed.belongsTo(Product, { foreignKey: 'actionProductId', as: 'linkedProduct' });

  // AITokenLog
  if (models.AITokenLog) {
    models.AITokenLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    models.AITokenLog.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
    User.hasMany(models.AITokenLog, { foreignKey: 'userId', as: 'tokenLogs' });
    Integration.hasMany(models.AITokenLog, { foreignKey: 'integrationId', as: 'tokenLogs' });
  }

  // SubscriptionPlan & MerchantSubscription
  if (models.SubscriptionPlan && models.MerchantSubscription) {
    models.SubscriptionPlan.hasMany(models.MerchantSubscription, { foreignKey: 'planId', as: 'subscriptions' });
    models.MerchantSubscription.belongsTo(models.SubscriptionPlan, { foreignKey: 'planId', as: 'plan' });
    Integration.hasMany(models.MerchantSubscription, { foreignKey: 'integrationId', as: 'subscriptions' });
    models.MerchantSubscription.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  }

  // MerchantWallet
  if (models.MerchantWallet) {
    Integration.hasOne(models.MerchantWallet, { foreignKey: 'integrationId', as: 'wallet' });
    models.MerchantWallet.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  }

  // PaymentTransaction
  if (models.PaymentTransaction) {
    Integration.hasMany(models.PaymentTransaction, { foreignKey: 'integrationId', as: 'paymentTransactions' });
    models.PaymentTransaction.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
  }

  // DeliveryTransaction
  if (models.DeliveryTransaction) {
    Integration.hasMany(models.DeliveryTransaction, { foreignKey: 'integrationId', as: 'deliveryTransactions' });
    models.DeliveryTransaction.belongsTo(Integration, { foreignKey: 'integrationId', as: 'integration' });
    Order.hasMany(models.DeliveryTransaction, { foreignKey: 'orderId', as: 'deliveryTransactions' });
    models.DeliveryTransaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  }
}

module.exports = { setupAssociations };
