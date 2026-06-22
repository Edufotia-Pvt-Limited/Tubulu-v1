import {IChatMessage} from "../../models/IChatMessage";
import {IBookmark} from "../../models/IBookmark";
import {IMessageNote} from "../../models/IMessageNote";

export interface IChatState {
    userMessages: IChatMessage[];
    loading: boolean;
    failure?: string;
    bookmarks: IBookmark[];
    bookmarkLoading: boolean;
    bookmarkFailure?: string;
    messageNotes: IMessageNote[];
    messageNoteLoading: boolean;
    messageNoteFailure?: string;
    unSyncedChatMessages: IChatMessage[];
    unSyncedChatMessagesLoading: IChatMessage[];
    downloadingMessages: string[];
    categories: any[];
    categoriesLoading: boolean;
    categoriesFailure?: string;
    nonInteractedIntegrations: any[];
}

export const defaultChatState: IChatState = {
    failure: undefined,
    loading: false,
    userMessages: [],
    bookmarkFailure: undefined,
    bookmarkLoading: false,
    bookmarks: [],
    messageNoteLoading: false,
    messageNoteFailure: undefined,
    messageNotes: [],
    nonInteractedIntegrations: [],
    categoriesLoading: false,
    categoriesFailure: undefined,
    unSyncedChatMessages: [],
    categories: [],
    unSyncedChatMessagesLoading: [],
    downloadingMessages: [],
}
