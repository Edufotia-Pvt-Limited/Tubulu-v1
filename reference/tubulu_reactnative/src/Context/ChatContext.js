/* eslint-disable prettier/prettier */
import messaging from '@react-native-firebase/messaging';
import { Component, createContext } from 'react';
import { Animated, Text } from 'react-native';
import uuid from 'react-native-uuid';
import ChatService from '../Services/Chat.service';
import { Store } from '../Store/Store';
import {
    addChatMessageToStore,
    addMessageToUnSyncedAction,
    getChatMessagesForChatRoom
} from '../Store/chat.store/chat.actions';
import { getIntegrationAction } from '../Store/integrations.store/integrations.actions';
import { getChatMessageDetailsByIdAction, UpdateQTMByFCMTokenAction } from '../Store/qtm.store/qtm.actions';
import { GetChatMessages, getMessageById, SendChatMessage } from '../Utils/ApiActions';

export const chatContext = createContext({});



class ChatContext extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatmessages: [],
            currentChatRoom: null,
            chatLoader: true,
            animatePosition: new Animated.Value(-60),
            messageText: '',
            typingIntegration: '',
            page: 0,
        };
    }

    componentDidMount() {
        messaging().onMessage(async remoteMessage => {
            this.processMessage(remoteMessage);
        });
    }

    processMessage = async remoteMessage => {
        let _messageData = remoteMessage.data;
        console.log('\x1b[37m', '\x1b[42m', '🚀 ~ _messageData ~ 🚀', _messageData, '\x1b[0m');
        this.setTypingIntegration(undefined);
        _messageData.message = _messageData?.body;
        if (_messageData?.type === 'QTM_CHAT') {
            const taskId = Store.getState()?.qtmState?.selectedTask?.id;
            const subType = 'SUBTASK';
            /// TEMP: REMOVE ONCE API UPDATED
            console.log('UPDATING THE TASKS:::');
            Store.dispatch(UpdateQTMByFCMTokenAction(subType, taskId));
            if (taskId == _messageData?.taskId) {
                Store.dispatch(getChatMessageDetailsByIdAction(_messageData?.id));
                Store.dispatch(UpdateQTMByFCMTokenAction('MEMBER', taskId));
            }
        }
        if (_messageData?.type == 'ACTIVITY') {
            console.log('\x1b[37m', '\x1b[42m', '🚀 ~ HELLO THIS IS ACTIVITY FOR YOUUUUUU ~ 🚀', '\x1b[0m');
        }

        if (this.state.currentChatRoom === _messageData?.chatRoomId) {

console.log("inside the if else contxt")
         
              Store.dispatch(getChatMessagesForChatRoom(_messageData?.chatRoomId,40))
                    
        
            // try {
            //     const response = await GetChatMessages(_messageData?.chatRoomId);  
            //     console.log("chat msg new for recipet called------------>========", response);

            //     //     case getType(getChatMessageAsync.success): {
            //     //   const apiMessages = action.payload;

            //     //   const updatedMessages = [...state.userMessages];

            //     //   apiMessages.forEach(apiMsg => {
            //     //     const index = updatedMessages.findIndex(
            //     //       m => m.uuid === apiMsg.uuid
            //     //     );

            //     //     if (index >= 0) {
            //     //       // 🔥 replace old message with new one
            //     //       updatedMessages[index] = {
            //     //         ...updatedMessages[index],
            //     //         ...apiMsg,
            //     //       };
            //     //     } else {
            //     //       updatedMessages.push(apiMsg);
            //     //     }
            //     //   });

            //     //   return {
            //     //     ...state,
            //     //     userMessages: updatedMessages,
            //     //   };
            //     // }
            //     // if (response.data) {
            //     //     dispatch(getChatMessageAsync.success(response.data));
            //     // } 
            // } catch (error) {
            //     console.log('Unable to get the chat messages for the chat room');
            //     console.log(error);
            // }
        }

        if (this.state.currentChatRoom === _messageData?.chatRoom) {
            try {
                _messageData = await getMessageById(_messageData?.messageId);
                console.log('the message data');
                console.log(JSON.stringify(_messageData));
            } catch (exception) {
                _messageData = {
                    message: 'Unable to load the message details',
                    type: 'TEXT',
                };
            }
            let _messages = Object.assign([], this.state.chatmessages);
            _messages.push({
                ..._messageData,
            });
            Store.dispatch(addChatMessageToStore(_messageData));
            this.setState({
                chatmessages: _messages,
            });
        } else {
            this.setState({
                messageText: remoteMessage?.notification?.title,
            });
            Animated.timing(this.state.animatePosition, {
                toValue: 0,
                duration: 500,
                useNativeDriver: false,
            }).start(() => {
                Animated.timing(this.state.animatePosition, {
                    toValue: -60,
                    duration: 500,
                    delay: 2000,
                    useNativeDriver: false,
                }).start();
            });
        }
        Store.dispatch(getIntegrationAction(0, 30));
    };

    incrementPage = () => {
        this.setState(
            {
                page: this.state.page + 1,
            },
            () => {
                this.getChatMessages(this.state.currentChatRoom, undefined);
            },
        );
    };

    getChatMessages = (chatRoom, callBack) => {
        this.setState({
            chatLoader: true,
        });
        const messages = ChatService.getChatMessagesForTheChatRoom(chatRoom);
        console.log('Messages Loaded from service', messages);
        console.log(messages.length);
        this.setState({
            chatmessages: messages,
        });
        setTimeout(() => {
            callBack?.();
        }, 200);
    };

    resetChatMessages = () => {
        this.setState({
            chatmessages: [],
            page: 0,
        });
    };

    setTypingIntegration = integrationId => {
        this.setState({
            typingIntegration: integrationId,
        });
    };

    updateMessageToSyncByLocalUUID = uuid => {
        const index = this.state.chatmessages.findIndex(item => {
            if (item.localUUID === uuid) {
                return 1;
            }
            return 0;
        });
        if (index >= 0) {
            const _chatMessages = [...this.state.chatmessages];
            _chatMessages[index].isSentToServer = false;
            this.setState({
                chatmessages: _chatMessages,
            });
        }
    };

    sendChatMessage = (
        chatMessgae,
        type,
        integationId,
        payload,
        messageActions,
        allowSync = true,
    ) => {
        let _chatMessageData = {
            chatRoom: this.state.currentChatRoom,
            type: type || 'TEXT',
            message: chatMessgae,
            integrationId: integationId,
            payload: payload,
            messageActions: messageActions,
        };
        this.setTypingIntegration(integationId);
        setTimeout(() => {
            this.setTypingIntegration(undefined);
        }, 60 * 1000);
        const localUUID = uuid.v4();
        if (allowSync) {
            let _chatMessages = Object.assign([], this.state.chatmessages);
            _chatMessages.push({ ..._chatMessageData, messageByUser: true, localUUID });
            this.setState({ chatmessages: _chatMessages });
        }
        SendChatMessage(_chatMessageData)
            .then(response => {
                Store.dispatch(getIntegrationAction(0, 30));
                Store.dispatch(addChatMessageToStore(response.data));
            })
            .catch(error => {
                if (allowSync) {
                    addMessageToUnSyncedAction({
                        ..._chatMessageData,
                        localUUID,
                        isSentToServer: false,
                        messageByUser: uuid.v4(),
                    });
                    this.updateMessageToSyncByLocalUUID(localUUID);
                }
                console.log('Failed to send the chat message here');
                console.log(error);
            });
    };
    setChatRoom = (chatRoom, callBack = null) => {
        console.log(
            '🚀 ~ file: ChatContext.js:172 ~ ChatContext ~ chatRoom:',
            chatRoom,
        );
        this.getChatMessages(chatRoom, callBack);
        this.setState({
            currentChatRoom: chatRoom,
        });
    };

    render() {
        return (
            <chatContext.Provider
                value={{
                    state: this.state,
                    actions: {
                        setChatRoom: this.setChatRoom,
                        sendChatMessage: this.sendChatMessage,
                        setTypingIntegration: this.setTypingIntegration,
                        resetChatMessages: this.resetChatMessages,
                        incrementPage: this.incrementPage,
                        getChatMessages: this.getChatMessages,
                    },
                }}>
                {this.props.children}
                <Animated.View
                    style={{
                        backgroundColor: 'black',
                        height: 60,
                        width: '100%',
                        position: 'absolute',
                        top: this.state.animatePosition,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Text style={{ fontSize: 16, color: 'white' }}>
                        {this.state.messageText}
                    </Text>
                </Animated.View>
            </chatContext.Provider>
        );
    }
}

export default ChatContext;
