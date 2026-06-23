import {getType, ActionType} from "typesafe-actions";
import * as ChatActions from './chat.actions';
import {IChatState, defaultChatState} from './chat.state';
import {
    addMessageToUnSynced,
    deleteNoteAction,
    getMessageNotesAsync,
    removeMessageFromUnSynced,
    syncMessageNotesAsync
} from "./chat.actions";
import {IChatMessage} from "../../models/IChatMessage";
import {IBookmark} from "../../models/IBookmark";
import {IMessageNote} from "../../models/IMessageNote";

const {
    deleteBookmarkAction,
    getBookmarkAsync,
    updateCategory,
    resetChatState,
    syncBookmarksAsync,
    syncMessagesAsync,
    getChatMessageAsync,
    updateNonInteractedMessage,
    clearUnsyncedQueue,
    addChatMessageToStore,
    updateDownloadMessageQueueAsync
} = ChatActions;

type IChatActions = ActionType<typeof ChatActions>;

export const chatReducer = (state: IChatState = defaultChatState, action: IChatActions): IChatState => {
    switch (action.type) {
        case getType(updateDownloadMessageQueueAsync.request):
            return {
                ...state,
                downloadingMessages: action.payload.chatMessageIds,
            };
        case getType(updateNonInteractedMessage):
            return {
                ...state,
                nonInteractedIntegrations: action.payload,
            };
        case getType(addMessageToUnSynced):
            return {
                ...state,
                unSyncedChatMessages: state.unSyncedChatMessages?.length ? [...state.unSyncedChatMessages, action.payload] : [action.payload],
            };
        case getType(removeMessageFromUnSynced):
            const unsyncedMessages = [...state.unSyncedChatMessages];
            const messageIndex = state.unSyncedChatMessages.findIndex(item => {
                if (item.localUUID === action.payload) {
                    return 1
                }
                return 0
            });
            if (messageIndex >= 0) {
                unsyncedMessages.splice(messageIndex, 1);
            }
            return {
                ...state,
                unSyncedChatMessages: unsyncedMessages
            }
        case getType(updateCategory):
            return {
                ...state,
                categories: action.payload,
            };
        case getType(resetChatState):
            return defaultChatState;
        case getType(syncBookmarksAsync.request):
            return {
                ...state,
                bookmarkLoading: true,
                bookmarkFailure: undefined,
            };
        case getType(syncBookmarksAsync.success):
            return {
                ...state,
                bookmarkLoading: false,
                bookmarks: action.payload,
            };
        case getType(syncBookmarksAsync.failure):
            return {
                ...state,
                bookmarkLoading: false,
                bookmarkFailure: action.payload,
            }
        case getType(syncMessagesAsync.request):
            return {
                ...state,
                loading: true,
                failure: undefined
            }
        case getType(syncMessagesAsync.failure):
            return {
                ...state,
                loading: false,
                failure: action.payload
            }
        case getType(syncMessagesAsync.success):
            return {
                ...state,
                loading: false,
                userMessages: action.payload
            }
        case getType(syncMessageNotesAsync.request):
            return {
                ...state,
                messageNoteLoading: true,
                messageNoteFailure: undefined
            };
        case getType(syncMessageNotesAsync.failure):
            return {
                ...state,
                messageNoteLoading: false,
                messageNoteFailure: action.payload
            };
        case getType(syncMessageNotesAsync.success):
            return {
                ...state,
                messageNotes: action.payload,
                messageNoteLoading: false,
            }
        case getType(getMessageNotesAsync.success):
            const apiNotes = action.payload;
            const allNotes = state.messageNotes.map(item => item._id);
            const newNotes: IMessageNote[] = [];
            apiNotes.forEach(noteItem => {
                if (!allNotes.includes(noteItem._id)) {
                    newNotes.push(noteItem)
                }
            })
            return {
                ...state,
                messageNotes: [...state.messageNotes, ...newNotes],
            }
        // case getType(getChatMessageAsync.success):
        //     const apiMessages = action.payload;
        //     console.log('API Messages Fetched+++++++++++++++++++++++++++++++++++++++++++++++++++:', apiMessages);
        //     const newMessages: IChatMessage[] = [];
        //     const allMessages = state.userMessages.map(mItem => mItem.uuid);
        //     console.log('All Existing Messages UUIDs:', allMessages);
        //     apiMessages.forEach(messageItem => {
        //         if (!allMessages.includes(messageItem.uuid)) {
        //             newMessages.push(messageItem);
        //         }
        //     });
        //     return {
        //         ...state,
        //         userMessages: [...state.userMessages, ...newMessages]
        //     }

        case getType(getChatMessageAsync.success): {

            console.log("inside getmsg success")
  const apiMessages = action.payload;

  console.log("inside get msg succ", action.payload)

  const updatedMessages = [...state.userMessages];

  apiMessages.forEach(apiMsg => {
    const index = updatedMessages.findIndex(
      m => m.uuid === apiMsg.uuid
    );

    if (index >= 0) {
      // 🔥 replace old message with new one
      updatedMessages[index] = {
        ...updatedMessages[index],
        ...apiMsg,
      };
    } else {
      updatedMessages.push(apiMsg);
    }
  });

  return {
    ...state,
    userMessages: updatedMessages,
  };
}

        case getType(deleteNoteAction):
            const notes = [...state.messageNotes];
            const notesIndex = notes.findIndex(item => {
                if (item._id === action.payload) {
                    return 1
                }
                return 0;
            })
            if (notesIndex >= 0) {
                notes.splice(notesIndex, 1);
            }
            return {
                ...state,
                messageNotes: notes
            }
        case getType(deleteBookmarkAction):
            const bookmarks = [...state.bookmarks];
            const index = bookmarks.findIndex(item => {
                if (item._id === action.payload) {
                    return 1;
                }
                return 0;
            })
            if (index >= 0) {
                bookmarks.splice(index, 1);
            }
            return {
                ...state,
                bookmarks
            }
        case getType(getBookmarkAsync.success):
            const apiBookmarks = action.payload;
            const allBookmarks = state.bookmarks.map(bookmarkItem => {
                return bookmarkItem._id
            });
            const newBookmarks: IBookmark[] = [];
            apiBookmarks.forEach(bItem => {
                if (!allBookmarks.includes(bItem._id)) {
                    newBookmarks.push(bItem);
                }
            });
            return {
                ...state,
                bookmarks: [...state.bookmarks, ...newBookmarks],
            }
        case getType(addChatMessageToStore):
            return {
                ...state,
                userMessages: [...state.userMessages, action.payload],
            }
        case getType(clearUnsyncedQueue):
            return {
                ...state,
                unSyncedChatMessages: []
            }
        case getType(getChatMessageAsync.request):
        case getType(getBookmarkAsync.request):
        case getType(getBookmarkAsync.failure):
        case getType(getChatMessageAsync.failure):
        case getType(getMessageNotesAsync.request):
        case getType(getMessageNotesAsync.failure):
        default:
            return state;
    }
}
