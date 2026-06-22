import {IChatMessage} from "../models/IChatMessage";

interface IChatDownloadService {
    addMessageToDownloadQueue: (chatMessage: IChatMessage) => Promise<void>;
    processDownloadQueue: () => Promise<void>;
}

class ChatDownloadService implements IChatDownloadService {
    static instance: ChatDownloadService;

    static downloadQueue: IChatMessage[];

    static getInstance(): ChatDownloadService {
        if (!ChatDownloadService.instance) {
            ChatDownloadService.instance = new ChatDownloadService();
        }
        return ChatDownloadService.instance;
    }

    async addMessageToDownloadQueue(chatMessage: IChatMessage): Promise<void> {
        ChatDownloadService.downloadQueue.push(chatMessage);
    }

    async processDownloadQueue(): Promise<void> {

    }

}

export default ChatDownloadService.getInstance();
