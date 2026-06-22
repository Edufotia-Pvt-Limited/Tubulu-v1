export interface IChatMessage {
    uuid?: string;
    chatRoom?: string;
    type?: string;
    message?: string;
    messageMetaData?: any;
    payload?: any;
    integrationId?: string;
    messageActions?: any;
    messageByUser?: string;
    messageByIntegration?: boolean;
    isSentToServer?: boolean;
    localUUID: string;
    room: any[];
    fileLocalPath: string;
    productNames?: string[]
    orderId?: string;
}
