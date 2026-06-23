import {createAction} from 'typesafe-actions';

export interface NotificationParams {
  screenName: string;
  params?: any;
}

const setNotificationRouteAsync =
  createAction('SET_SCREEN_ROUTE')<NotificationParams>();

const setNotificationAsync = createAction('SET_NOTIFICATION')<boolean>();

export {setNotificationAsync, setNotificationRouteAsync};
