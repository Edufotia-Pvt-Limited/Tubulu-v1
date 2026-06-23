import {AppState, Linking} from 'react-native';
import {getIntegrationById, scanQRCode} from '../Utils/ApiActions';
import navigationService from './navigation.service';
import {Store} from '../Store/Store';
import {getTokenPair} from '../Utils/StorageUtils';
import { base_url } from '../Config/apiEnv';

interface IAppUIStateService {
  readonly initializeAppState: () => void;
  readonly handleQRCodeURL: (url: string) => Promise<void>;
}

class AppUIStateService implements IAppUIStateService {
  static instance: AppUIStateService;
  static getInstance(): AppUIStateService {
    if (!AppUIStateService.instance) {
      AppUIStateService.instance = new AppUIStateService();
    }
    return AppUIStateService.instance;
  }

  async handleQRCodeURL(url: string): Promise<void> {
    try {
      const tokenPair = await getTokenPair();
      if (!tokenPair.authToken) {
        console.log(
          'User is not logged in, hence not able to handle the QR code',
        );
        return;
      }
      if (url.indexOf(`${base_url}/api/v1/qrCode/`) < 0) {
        return;
      }
      const urlSplit = url.split(`${base_url}/api/v1/qrCode/`);
      const integrationId = urlSplit?.[1];
      if (!integrationId) {
        return;
      }
      const integrationdetails = await scanQRCode(integrationId);
      setTimeout(
        () => {
          navigationService.replace('ChatScreen', {
            integrationItem: integrationdetails.data,
            isFromQrCode: true
          });
        },
        navigationService.getCurrentScreenName() === 'SplashScreen'
          ? 4000
          : 500,
      );
    } catch (error: any) {
      console.log('Unable to handle the QR code link at the moment');
      console.log(error);
    }
  }

  private async initializeDeepLink(): Promise<void> {
    try {
      const url = await Linking.getInitialURL();
      Linking.addEventListener('url', ({url: urlString}) => {
        this.handleQRCodeURL(urlString);
      });
      url && this.handleQRCodeURL(url);
    } catch (error: any) {
      console.log('Unable to handle the deep link at the moment');
      console.log(error);
    }
  }

  async initializeAppState(): Promise<void> {
    this.initializeDeepLink();
    AppState.addEventListener('change', state => {
      switch (state) {
        case 'active':
          break;
        case 'background':
        case 'extension':
        case 'inactive':
        case 'unknown':
          break;
      }
    });
  }
}

export default AppUIStateService.getInstance();
