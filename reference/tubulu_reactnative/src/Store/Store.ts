import {configureStore} from '@reduxjs/toolkit';
import {persistReducer} from 'redux-persist';
import FilesystemStorage from 'redux-persist-filesystem-storage';
import rootReducer from './rootReducer';

const rootReducerPersist = persistReducer(
  {
    key: 'root',
    storage: FilesystemStorage,
    whitelist: [
      'integrationState',
      'loginState',
      'chatState',
      'qtmState',
      'notificationState',
      "cartState", 
      "userAddressState"
    ],
  },
  rootReducer,
);

// export const Store = configureStore({
//   middleware: [ThunkMiddleware],
//   reducer: rootReducerPersist,
// });

export const Store = configureStore({
  reducer: rootReducerPersist,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
         immutableCheck: false,
    }),
});



export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;