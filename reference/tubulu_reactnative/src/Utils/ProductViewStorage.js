import AsyncStorage from '@react-native-async-storage/async-storage';

const PRODUCT_VIEW_KEY = 'PRODUCT_VIEW';

export async function saveProductView(isListView) {
  try {
    await AsyncStorage.setItem(
      PRODUCT_VIEW_KEY,
      isListView ? 'list' : 'grid'
    );
  } catch (e) {
    // optional: log error
  }
}

export async function getProductView() {
  try {
    return await AsyncStorage.getItem(PRODUCT_VIEW_KEY);
  } catch (e) {
    return null;
  }
}

export async function clearProductView() {
  try {
    await AsyncStorage.removeItem(PRODUCT_VIEW_KEY);
  } catch (e) {}
}
