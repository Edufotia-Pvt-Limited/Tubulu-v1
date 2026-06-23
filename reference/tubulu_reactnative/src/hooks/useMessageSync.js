import {useContext, useEffect, useRef, useState} from "react";
import NetInfo, {NetInfoStateType, useNetInfo} from "@react-native-community/netinfo";
import {chatContext} from "../Context/ChatContext";
import {useDispatch, useSelector} from "react-redux";
import {clearUnsyncedQueue, syncMessages} from "../Store/chat.store/chat.actions";
import {SendChatMessage} from "../Utils/ApiActions";
import {Store} from "../Store/Store";

const useMessageSync = () => {

    const [isMessagesSyncing, setIsMessagesSyncing] = useState(false);
    const chat = useContext(chatContext);
    const dispatch = useDispatch();
    const {isConnected} = useNetInfo();

    const messageSyncingRef = useRef(false);

    async function performSync() {
        try {
            const unsyncedMessages = Store.getState().chatState.unSyncedChatMessages;
            if (unsyncedMessages?.length && !messageSyncingRef.current) {
                messageSyncingRef.current = true;
                console.log('Syncing');
                console.log(unsyncedMessages);
                const allSyncPromise = unsyncedMessages.map(async (messageItem) => {
                    console.log('The sending message: ');
                    console.log(messageItem);
                    // return await chat.actions.sendChatMessage(messageItem.message, messageItem.type, messageItem.integrationId, messageItem.payload, messageItem.messageActions, false);
                    return await SendChatMessage(messageItem);
                })
                await Promise.all(allSyncPromise);
                dispatch(clearUnsyncedQueue());
                dispatch(syncMessages());
            }
            messageSyncingRef.current = false;
        } catch (e) {
            console.log('Error in sync');
            console.log(error);
        }
    }

    useEffect(() => {
        if (isConnected) {
            void performSync();
        }
    }, [isConnected])

    return isMessagesSyncing;
}

export default useMessageSync;
