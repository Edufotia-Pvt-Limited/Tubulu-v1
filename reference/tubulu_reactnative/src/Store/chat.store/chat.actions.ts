import {Store} from "../Store";
import {createAction, createAsyncAction} from "typesafe-actions";
import {IChatMessage} from "../../models/IChatMessage";
import {Dispatch} from "redux";
import {
    getBookmarksDetailsByChatroomId,
    GetChatMessages, getNotesDetailsByChatRoomId,
    syncUserBookmarks,
    syncUserMessages, syncUserNotes
} from "../../Utils/ApiActions";
import {IBookmark} from "../../models/IBookmark";
import {IMessageNote} from "../../models/IMessageNote";

function updateDownloadMessageQueue(chatMessageIds: string[], isLoading = false) {
    return async (dispatch: Dispatch) => {
        dispatch(updateDownloadMessageQueueAsync.request({
            chatMessageIds,
            isLoading
        }));
        try {
            // dispatch(updateDownloadMessageQueueAsync.success());
        } catch (error: any) {
            console.log('Unable to update the download message queue at the moment');
            console.log(error);
            dispatch(updateDownloadMessageQueueAsync.failure(error.message));
        }
    }
}

const updateDownloadMessageQueueAsync = createAsyncAction(
    'UPDATE_DOWNLOAD_QUEUE',
    'UPDATE_DOWNLOAD_QUEUE_SUCCESS',
    'UPDATE_DOWNLOAD_QUEUE_FAILURE',
)<{
    chatMessageIds: string[];
    isLoading: boolean;
}, IChatMessage[], string>();

const updateCategory = createAction('UPDATE_CATEGORIES')<any[]>();

function syncMessages() {
    return async (dispatch: Dispatch) => {
        dispatch(syncMessagesAsync.request());
        try {
            const response = await syncUserMessages();
            if (response.data) {
                dispatch(syncMessagesAsync.success(response.data));
            } else {
                dispatch(syncMessagesAsync.failure('Unable to get the user messages for sync'));
            }
        } catch (error: any) {
            console.log('Unable to get the user messages for sync');
            console.log(error);
            dispatch(syncMessagesAsync.failure('Unable to get the user messages for sync'));
        }
    }
}

function getChatMessagesForChatRoom(roomId: string, size = 40) {

    console.log("getchat mshsssssss")
    return async (dispatch: Dispatch) => {
        try {
            const response = await GetChatMessages(roomId);  
            console.log("chat messages response for receipt", response);
            if (response.data) {
                dispatch(getChatMessageAsync.success(response.data));
            } else {
                dispatch(getChatMessageAsync.failure('Unable to get the chat messages for the chat room'));
            }
        } catch (error: any) {
            console.log('Unable to get the chat messages for the chat room');
            console.log(error);
            dispatch(getChatMessageAsync.failure('Unable to get the messages for the chat room'));
        }
    }
}

function getBookmarksForChatRoom(roomId: string) {
    return async (dispatch: Dispatch) => {
        try {
            const response = await getBookmarksDetailsByChatroomId(roomId);
            if (response.data) {
                dispatch(getBookmarkAsync.success(response.data));
            } else {
                dispatch(getBookmarkAsync.failure('Unable to get the bookmarks for the room'));
            }
        } catch (error: any) {
            console.log('Unable to get the bookmarks for the room');
            console.log(error);
            dispatch(getBookmarkAsync.failure('Unable to get the bookmarks for the room'));
        }
    }
}

const deleteBookmarkAction = createAction('DELETE_BOOKMARK')<string>();

function getBookMarksForUser() {
    return async (dispatch: Dispatch) => {
        try {
            const response = await syncUserBookmarks();
            if (response.data) {
                dispatch(syncBookmarksAsync.success(response.data));
            } else {
                dispatch(syncBookmarksAsync.failure('Unable to get the bookmarks for the user at the moment'));
            }
        } catch (error: any) {
            console.log('Unable to get the bookmarks for the user');
            console.log(error);
            dispatch(syncBookmarksAsync.failure('Unable to sync the bookmarks for the user at the moment'));
        }
    }
}

const getChatMessageAsync = createAsyncAction(
    'GET_MESSAGES',
    'GET_MESSAGES_SUCCESS',
    'GET_MESSAGES_FAILURE',
)<void, IChatMessage[], string>();

const syncMessagesAsync = createAsyncAction(
    'SYNC_MESSAGES',
    'SYNC_MESSAGES_SUCCESS',
    'SYNC_MESSAGES_FAILURE'
)<void, IChatMessage[], string>();

const syncBookmarksAsync = createAsyncAction(
    'SYNC_BOOKMARKS',
    'SYNC_BOOKMARKS_SUCCESS',
    'SYNC_BOOKMARKS_FAILURE'
)<void, IBookmark[], string>();

const getBookmarkAsync = createAsyncAction(
    'GET_BOOKMARKS',
    'GET_BOOKMARKS_SUCCESS',
    'GET_BOOKMARKS_FAILURE',
)<void, IBookmark[], string>();

function syncMessageNotesAction() {
    return async (dispatch: Dispatch) => {
        dispatch(syncMessageNotesAsync.request());
        try {
            const response = await syncUserNotes();
            if (response.data) {
                dispatch(syncMessageNotesAsync.success(response.data));
            } else {
                dispatch(syncMessageNotesAsync.failure('Unable to sync the message notes at the moment'));
            }
        } catch (error) {
            console.log('Unable to sync the message notes at the moment');
            console.log(error);
            dispatch(syncMessageNotesAsync.failure('Unable to sync the message notes at the moment'));
        }
    }
}

const syncMessageNotesAsync = createAsyncAction(
    'SYNC_MESSAGE_NOTES',
    'SYNC_MESSAGE_NOTES_SUCCESS',
    'SYNC_MESSAGE_NOTES_FAILURE',
)<void, IMessageNote[], string>();

function getMessageNotesForChatRoom(roomId: string) {
    return async (dispatch: Dispatch) => {
        dispatch(getMessageNotesAsync.request());
        try {
            const response = await getNotesDetailsByChatRoomId(roomId);
            if (response.data) {
                dispatch(getMessageNotesAsync.success(response.data));
            } else {
                dispatch(getMessageNotesAsync.failure('Unable to get the message notes for the chat room'));
            }
        } catch (error: any) {
            console.log('Unable to get the message notes for the chat room');
            console.log(error);
            dispatch(getMessageNotesAsync.failure('Unable to get the message notes for the chat room'));
        }
    }
}

const getMessageNotesAsync = createAsyncAction(
    'GET_MESSAGE_NOTES',
    'GET_MESSAGE_NOTES_SUCCESS',
    'GET_MESSAGE_NOTES_FAILURE',
)<void, IMessageNote[], string>();

const resetChatState = createAction('RESET_CHAT_STATE')<void>();

const deleteNoteAction = createAction('DELETE_NOTE')<string>();

function addMessageToUnSyncedAction(chatMessage: IChatMessage) {
    Store.dispatch(addMessageToUnSynced(chatMessage));
}

const addMessageToUnSynced = createAction('ADD_MESSAGE_TO_UNSYNCED')<IChatMessage>();

const removeMessageFromUnSynced = createAction('REMOVE_MESSAGE_FROM_ASYNCED')<string>();

const clearUnsyncedQueue = createAction('CLEAR_UNSYNCED_QUEUE')<void>();

const addChatMessageToStore = createAction('ADD_MESSAGE_TO_STORE')<IChatMessage>();

const updateNonInteractedMessage = createAction('UPDATE_NON_INTERACTED_INTEGRATIONS')<any[]>();

export {
    syncMessagesAsync,
    syncMessages,
    getChatMessagesForChatRoom,
    getChatMessageAsync,
    deleteBookmarkAction,
    addMessageToUnSyncedAction,
    removeMessageFromUnSynced,
    getBookMarksForUser,
    syncBookmarksAsync,
    addChatMessageToStore,
    resetChatState,
    getBookmarksForChatRoom,
    updateNonInteractedMessage,
    getBookmarkAsync,
    syncMessageNotesAction,
    syncMessageNotesAsync,
    updateCategory,
    getMessageNotesAsync,
    getMessageNotesForChatRoom,
    deleteNoteAction,
    addMessageToUnSynced,
    clearUnsyncedQueue,
    updateDownloadMessageQueue,
    updateDownloadMessageQueueAsync,
};
