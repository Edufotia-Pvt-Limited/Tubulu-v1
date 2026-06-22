export interface IIntegration {
    _id?: string;
    logo?: string;
    integrationName?: string;
    isCartExist?: any;
    cartItemQuantity?: any;
    apiUrl?: string;
    chatBaseUrl?: string;
    description?: string;
    webhookUrl?: string;
    welcomeMessagePayLoad?: string;
    category?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
