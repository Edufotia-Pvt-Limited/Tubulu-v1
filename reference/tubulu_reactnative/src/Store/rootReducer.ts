// import {combineReducers} from 'redux';

import { combineReducers } from "@reduxjs/toolkit";
import {chatReducer} from './chat.store/chat.reducer';
import {integrationReducer} from './integrations.store/integrations.reducer';
import {loginReducer} from './login.store/login.reducer';
import {notificationReducer} from './notification.store/notification.reducer';
import {qtmReducer} from './qtm.store/qtm.reducer';
import cartReducer from './cart.store/Cart.slice'
import addressReducer from './UserAddressStore/address.slice'

export default combineReducers({
  integrationState: integrationReducer,
  loginState: loginReducer,
  chatState: chatReducer,
  qtmState: qtmReducer,
  notificationState: notificationReducer,
  cartState : cartReducer,
  userAddressState : addressReducer
});
