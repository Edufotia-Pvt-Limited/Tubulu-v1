import {NotificationParams} from './notification.actions';

export interface INotificationState {
  route: NotificationParams;
  isNotification: boolean;
}

export const defaultNotificationState: INotificationState = {
  route: {
    screenName: '',
    params: undefined,
  },
  isNotification: false,
};
