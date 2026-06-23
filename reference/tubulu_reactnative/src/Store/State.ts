import {defaultChatState, IChatState} from './chat.store/chat.state';
import {defaultCartState, ICartState} from './cart.store/cart.state';
import {
  defaultIntegrationState,
  IIntegrationState,
} from './integrations.store/integrations.state';
import {
  defaultNotificationState,
  INotificationState,
} from './notification.store/notification.state';
import {defaultQTMState, IQTMState} from './qtm.store/qtm.state';
import { AddressState, defaultAddressState } from './UserAddressStore/address.state';

export interface IAppState {
  integrationState: IIntegrationState;
  chatState: IChatState;
  qtmState: IQTMState;
  notificationState: INotificationState;
  cartState : ICartState
  userAddressState : AddressState
}

export const defaultAppState: IAppState = {
  integrationState: defaultIntegrationState,
  chatState: defaultChatState,
  qtmState: defaultQTMState,
  notificationState: defaultNotificationState,
  cartState : defaultCartState,
  userAddressState : defaultAddressState
};
