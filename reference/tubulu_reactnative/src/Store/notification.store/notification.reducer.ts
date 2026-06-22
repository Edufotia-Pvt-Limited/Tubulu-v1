import {ActionType, getType} from 'typesafe-actions';
import * as NotificationActions from './notification.actions';
import {
  defaultNotificationState,
  INotificationState,
} from './notification.state';

const {setNotificationRouteAsync, setNotificationAsync} = NotificationActions;

type INotificationActions = ActionType<typeof NotificationActions>;

export const notificationReducer = (
  state: INotificationState = defaultNotificationState,
  action: INotificationActions,
): INotificationState => {
  switch (action.type) {
    case getType(setNotificationRouteAsync):
      return {
        ...state,
        route: action.payload,
      };
    case getType(setNotificationAsync):
      console.log(
        '\x1b[37m',
        '\x1b[42m',
        '🚀 ~ isNotification ~ 🚀',
        action.payload,
        '\x1b[0m',
      );
      return {
        ...state,
        isNotification: action.payload,
      };
    default:
      return state;
  }
};
