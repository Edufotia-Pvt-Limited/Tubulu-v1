import AsyncStorage from '@react-native-async-storage/async-storage';
import Storage from 'react-native-storage';

export const storage = new Storage({
  size: 9999,
  storageBackend: AsyncStorage,
  defaultExpires: null,
});

export function storeTokenPair(tokenPair) {
  return storage.save({
    key: storageKeys.TOKEN_PAIR,
    data: tokenPair,
  });
}
export function getTokenPair() {
  return storage.load({
    key: storageKeys.TOKEN_PAIR,
  });
}

export function removeTokenPair() {
  return storage.remove({
    key: storageKeys.TOKEN_PAIR,
  });
}

export const storageKeys = {
  TOKEN_PAIR: 'TOKENPAIR',
  YELO_USER: 'YELOUSER',
};
