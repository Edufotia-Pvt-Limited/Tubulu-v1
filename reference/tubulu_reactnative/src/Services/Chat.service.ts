import RNFetchBlob from 'react-native-blob-util';
import {IBookmark} from '../models/IBookmark';
import {IChatMessage} from '../models/IChatMessage';
import {IIntegration} from '../models/IIntegration';
import {IMessageNote} from '../models/IMessageNote';
import {Store} from '../Store/Store';

const savingDir = RNFetchBlob.fs.dirs.DownloadDir;

interface IChatService {
  readonly getChatMessagesForTheChatRoom: (roomId: string) => IChatMessage[];
  readonly getChatBookmarksForChatRoom: (roomId: string) => IBookmark[];
  readonly downloadChatMessageMedia: (
    chatMessage: IChatMessage,
  ) => Promise<IChatMessage>;
  readonly getChatRoomIdFromIntegrationId: (integrationId: string) => string;
  readonly getIntegrationFromChatRoom: (chatRoom: string) => IIntegration;
}

class ChatService implements IChatService {
  static instance: ChatService;

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  getChatMessagesForTheChatRoom(roomId: string): IChatMessage[] {
    const allMessages = Store.getState().chatState.userMessages;
    console.log("all messages from store receipt", allMessages);
    const unsyncedMessages = Store.getState().chatState.unSyncedChatMessages;
    let result: IChatMessage[] = [];
    let sentMessages: IChatMessage[] = [];
    let unMessages: IChatMessage[] = [];
    if (allMessages.length) {
      sentMessages = allMessages.filter(item => {
        if (item.chatRoom === roomId) {
          return item;
        }
      });
    }
    if (unsyncedMessages.length) {
      unMessages = unsyncedMessages.filter(item => {
        if (item.chatRoom === roomId) {
          return item;
        }
      });
    }
    return [...sentMessages, ...unMessages];
  }

  getChatBookmarksForChatRoom(roomId: string): IBookmark[] {
    const allBookmarks = Store.getState().chatState.bookmarks;
    if (allBookmarks.length) {
      return allBookmarks.filter(item => {
        if (item.chatRoomId === roomId) {
          return item;
        }
      });
    }
    return [];
  }

  getMessageNotesForChatRoom(roomId: string): IMessageNote[] {
    const allNotes = Store.getState().chatState.messageNotes;
    if (allNotes.length) {
      return allNotes.filter(item => {
        if (item.chatRoomId === roomId) {
          return item;
        }
      });
    }
    return [];
  }

  async downloadChatMessageMedia(
    chatMessage: IChatMessage,
  ): Promise<IChatMessage> {
    if (!!chatMessage.fileLocalPath) {
      //We don't need to process again if the chat message already exists
      return chatMessage;
    }
    if (
      chatMessage.type === 'IMAGE' ||
      chatMessage.type === 'AUDIO' ||
      chatMessage.type === 'VIDEO' ||
      chatMessage.type === 'DOCUMENT'
    ) {
      const payload = chatMessage.payload;
      const {documentUrl = '', documentName} = payload;
      const fileResponse = await RNFetchBlob.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: false,
          path: `${savingDir}/${documentName}`,
          description: 'Download file',
        },
      }).fetch('GET', documentUrl);
      console.log(fileResponse.path());
      chatMessage.fileLocalPath = fileResponse.path();
      return chatMessage;
    }
    return chatMessage;
  }

  getChatRoomIdFromIntegrationId(integrationId: string): string {
    const allMessages = Store.getState().chatState.userMessages;
    const allIntegrationMessages = allMessages.filter(
      item => item.integrationId === integrationId,
    );
    return allIntegrationMessages?.[0]?.chatRoom ?? '';
  }

  getIntegrationFromChatRoom(chatroom: string): IIntegration {
    const allMessages = Store.getState().chatState.userMessages;
    const allIntegrationMessages = allMessages?.filter(
      item => item.chatRoom === chatroom,
    );
    const _integrationId = allIntegrationMessages?.[0]?.integrationId;
    const allIntegrations = Store.getState().integrationState;
    const integration = allIntegrations?.integrations?.filter(
      _integration => _integration?._id === _integrationId,
    );
    return integration[0];
  }
}

export default ChatService.getInstance();
