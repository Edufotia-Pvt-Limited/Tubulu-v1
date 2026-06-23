import {NavigationContainerRef, StackActions} from '@react-navigation/native';

interface INavigationService {
  readonly assignNavigator: (ref: NavigationContainerRef<any>) => void;
  readonly push: (screeName: string, params?: Record<string, unknown>) => void;
  readonly getCurrentScreenName: () => string;
}

class NavigatonService implements INavigationService {
  static instance: NavigatonService;
  static navigator?: NavigationContainerRef<any>;

  static getInstance(): NavigatonService {
    if (!NavigatonService.instance) {
      NavigatonService.instance = new NavigatonService();
    }
    return NavigatonService.instance;
  }

  assignNavigator(ref: NavigationContainerRef<any>): void {
    NavigatonService.navigator = ref;
  }

  push(screeName: string, params?: Record<string, unknown> | undefined): void {
    if (NavigatonService.navigator) {
      NavigatonService.navigator.dispatch(StackActions.push(screeName, params));
    }
  }

  replace(screeName: string, params?: Record<string, unknown> | undefined): void {
    if (NavigatonService.navigator) {
      NavigatonService.navigator.dispatch(StackActions.replace(screeName, params));
    }
  }

  getCurrentScreenName(): string{
    if(NavigatonService.navigator){
        return NavigatonService.navigator.getCurrentRoute?.()?.name ?? '';
    }
    return ''
  }
}

export default NavigatonService.getInstance();
