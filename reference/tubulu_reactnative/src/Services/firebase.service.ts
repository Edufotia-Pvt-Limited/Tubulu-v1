// import {ReactNativeFirebase} from '@react-native-firebase/app';
import firebase from '@react-native-firebase/app';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Dispatch} from 'redux';
import {Store} from '../Store/Store';
import {setNotificationRouteAsync} from '../Store/notification.store/notification.actions';
import ChatService from './Chat.service';
import navigationService from './navigation.service';


interface IFirebaseService {
  readonly initializeMessageHandlers: () => void;
}

export enum NOTIFICATION_TYPES {
  TEXT = 'TEXT',
  QTM_CHAT = 'QTM_CHAT',
}

class FirebaseService implements IFirebaseService {
  static instance: FirebaseService;
  // static app: ReactNativeFirebase.FirebaseApp;
  static app = firebase.app();

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  
  async initializeMessageHandlers(): Promise<void> {
    try {
      messaging().setBackgroundMessageHandler(this.handleMessage);
      messaging().onNotificationOpenedApp(event => {
        this.handleMessage(event, true);
      });
      const notification = await messaging().getInitialNotification();
      // notification && Store.dispatch(setNotificationAsync(true));
      notification && this.handleMessage(notification, true, true);
    } catch (error: any) {
      console.log(error, 'Error while getting the notification');
    }
  }

  private async handleMessage(
    message: FirebaseMessagingTypes.RemoteMessage,
    openScreen?: boolean,
    useTimeout: boolean = false,
  ): Promise<void> {
    const messageType = message?.data?.type as NOTIFICATION_TYPES;
    const dispatch: Dispatch = Store.dispatch;
    switch (messageType) {
      case 'TEXT':
        const _integration =
          message?.data?.chatRoom &&
          ChatService.getIntegrationFromChatRoom(String(message?.data?.chatRoom));
        await dispatch(
          setNotificationRouteAsync({
            screenName: 'ChatScreen',
            params: {
              integrationItem: {
                ..._integration,
                chatRoomId: message?.data?.chatRoom,
              },
            },
          }),
        );
        if (openScreen) {
          if (useTimeout) {
            setTimeout(() => {
              message?.data?.chatRoom &&
                navigationService.push('ChatScreen', {
                  integrationItem: {
                    ..._integration,
                    chatRoomId: message?.data?.chatRoom,
                  },
                });
            }, 5000);
            return;
          }
          message?.data?.chatRoom &&
            navigationService.push('ChatScreen', {
              integrationItem: {
                ..._integration,
                chatRoomId: message?.data?.chatRoom,
              },
            });
        }
        break;
      case 'QTM_CHAT':
        const taskId = message?.data?.taskId;
        await dispatch(
          setNotificationRouteAsync({
            screenName: 'QTMGroupChatScreen',
            params: {taskId},
          }),
        );
        if (openScreen) {
          if (useTimeout) {
            setTimeout(() => {
              taskId && navigationService.push('QTMGroupChatScreen', {taskId});
            }, 5000);
            return;
          }
          taskId && navigationService.push('QTMGroupChatScreen', {taskId});
        }
        break;
    }
  }
}

export default FirebaseService.getInstance();
