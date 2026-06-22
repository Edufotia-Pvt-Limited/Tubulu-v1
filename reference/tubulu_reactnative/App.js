/* eslint-disable prettier/prettier */
import NetInfo from '@react-native-community/netinfo';
import {
    NavigationContainer,
    useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from 'react-native-toast-message';
import { NativeBaseProvider } from 'native-base';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import persistStore from 'redux-persist/es/persistStore';
import { PersistGate } from 'redux-persist/integration/react';
import { ChatForm } from './src/Components/ChatForm';
import ContextMenu from './src/Components/ContextMenu';
import ISImageViewer from './src/Components/ISImageViewer';
import ISVideoPlayer from './src/Components/ISVideoPlayer';
import QRScanner from './src/Components/QRCodeScanner';
import AppContext from './src/Context/AppContext';
import ChatContext from './src/Context/ChatContext';
import { BookmarksScreen } from './src/Screens/Bookmarks.screen';
import { CategoryDetailsScreen } from './src/Screens/CategoryDetailsScreen';
import ChatScreen from './src/Screens/ChatScreen';
import ChatSearch from './src/Screens/ChatSearch';
import { DeleteAccountScreen } from './src/Screens/DeleteAccount.screen';
import HomeScreen from './src/Screens/HomeScreen';
import IntegrationSearch from './src/Screens/IntegrationsSearch';
import ManageBusiness from './src/Screens/ManageBusiness';
import NetworkLoggerScreen from './src/Screens/NetworkLogger';
import OnboardingScreen from './src/Screens/OnboardingScreen';
import { PrivacyPolicyScreen } from './src/Screens/PrivacyPolicyScreen';
import { QTMAttachmentScreen } from './src/Screens/QTM/QTMAttachmentScreens/QTMAttachmentScreen';
import { QTMGroupChatScreen } from './src/Screens/QTM/QTMGroupChatScreens/QTMGroupChatScreen';
import { QTMAllContactScreen } from './src/Screens/QTM/QTMMemberScreens/QTMAllContacts.screen';
import { QTMMemberDetailsScreen } from './src/Screens/QTM/QTMMemberScreens/QTMMemberDetails.screen';
import { QTMNewSubTaskScreen } from './src/Screens/QTM/QTMSubTaskScreens/QTMNewSubTask.screen';
import { QTMSubTaskDetailsScreen } from './src/Screens/QTM/QTMSubTaskScreens/QTMSubTaskDetails.screen';
import { QTMViewSubTaskDetailsScreen } from './src/Screens/QTM/QTMSubTaskScreens/QTMViewSubTaskDetails.screen';
import { QTMAllTasksScreen } from './src/Screens/QTM/QTMTaskScreens/QTMAllTasks.screen';
import { QTMNewTaskScreen } from './src/Screens/QTM/QTMTaskScreens/QTMNewTaskScreen';
import { QTMTaskDetailsScreen } from './src/Screens/QTM/QTMTaskScreens/QTMTaskDetails.screen';
import { QTMNewTopicScreen } from './src/Screens/QTM/QTMTopicScreens/QTMNewTopicScreen';
import { QTMTopicDetailsScreen } from './src/Screens/QTM/QTMTopicScreens/QTMTopicDetails.screen';
import { QTMTopicDetailsV2 } from './src/Screens/QTM/QTMTopicScreens/QTMTopicDetailsV2.screen';
import Registration from './src/Screens/Registration';
import RegistrationOtp from './src/Screens/RegistrationOtp';
import CatalogueScreen from './src/Screens/CatalogueScreen';
import SplashScreen from './src/Screens/SplashScreen';
import { ViewNotesScreen } from './src/Screens/ViewNotes.screen';
import Assistant from './src/Screens/Assistant';
import appUiStateService from './src/Services/app-ui-state.service';
import firebaseService from './src/Services/firebase.service';
import navigationService from './src/Services/navigation.service';
import { Store } from './src/Store/Store';
import CatalogCartScreen from './src/Screens/CatalogCartScreen';
import OrderPlacedScreen from './src/Screens/OrderPlacedScreen';
import IntegrationProfileDetails from './src/Screens/IntegrationProfileDetails'
import CouponsScreen from './src/Screens/CouponsScreen'
import OrderSummary from './src/Screens/OrderSummary'

const Stack = createNativeStackNavigator();

const persistor = persistStore(Store);

function App(props) {
    const [isInternetEnabled, setIsInternetEnabled] = useState(false);

    const navigationRef = useNavigationContainerRef();




    useEffect(() => {
        appUiStateService.initializeAppState();
        firebaseService.initializeMessageHandlers();
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsInternetEnabled(state.isConnected);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <Provider store={Store}>
            <PersistGate persistor={persistor} loading={null}>
                <AppContext>
                    <ChatContext>
                        <NativeBaseProvider>
                             <SafeAreaProvider>
                                <GestureHandlerRootView style={{ flex: 1 }}>
                            <NavigationContainer ref={navigationService.assignNavigator}>
                               
                                <Stack.Navigator initialRouteName="SplashScreen">
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="SplashScreen"
                                        component={SplashScreen}
                                    />
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="Registration"
                                        component={Registration}
                                    />
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="RegistrationOtp"
                                        component={RegistrationOtp}
                                    />
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="HomeScreen"
                                        component={HomeScreen}
                                    />
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="OnboardingScreen"
                                        component={OnboardingScreen}
                                    />
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="ChatScreen"
                                        component={ChatScreen}
                                    />
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="IntegrationSearch"
                                        component={IntegrationSearch}
                                    />
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="ChatSearch"
                                        component={ChatSearch}
                                    />
                                    <Stack.Screen
                                        name="NetworkLoggerScreen"
                                        component={NetworkLoggerScreen}
                                    />
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="ISImageViewer"
                                        component={ISImageViewer}
                                    />
                                    <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="ISVideoViewer"
                                        component={ISVideoPlayer}
                                    />
                                    <Stack.Screen
                                        options={{ headerShown: false }}
                                        name="QRScanner"
                                        component={QRScanner}
                                    />
                                    <Stack.Screen
                                        options={{ headerShown: false }}
                                        name="CategoryDetailsScreen"
                                        component={CategoryDetailsScreen}
                                    />
                                    <Stack.Screen
                                        name="ManageBusiness"
                                        options={{ headerShown: false }}
                                        component={ManageBusiness}
                                    />
                                    <Stack.Screen
                                        name="BookmarksScreen"
                                        options={{ headerShown: false }}
                                        component={BookmarksScreen}
                                    />
                                    <Stack.Screen
                                        name={'ViewNotes'}
                                        options={{ headerShown: false }}
                                        component={ViewNotesScreen}
                                    />
                                    <Stack.Screen
                                        name={'ChatForm'}
                                        options={{ headerShown: false }}
                                        component={ChatForm}
                                    />
                                    <Stack.Screen
                                        name={'OrderSummary'}
                                        options={{ headerShown: false }}
                                        component={OrderSummary}
                                    />
                                    <Stack.Screen
                                        name={'Assistant'}
                                        options={{ headerShown: false }}
                                        component={Assistant}
                                    />
                                    <Stack.Screen
                                        name={'LegalScreen'}
                                        options={{
                                            headerShown: false,
                                        }}
                                        component={PrivacyPolicyScreen}
                                    />
                                    <Stack.Screen
                                        name={'QTMHomeScreen'}
                                        options={{ headerShown: false }}
                                        component={HomeScreen}
                                    />
                                    <Stack.Screen
                                        name={'QTMNewTopicScreen'}
                                        options={{ headerShown: false }}
                                        component={QTMNewTopicScreen}
                                    />
                                    <Stack.Screen
                                        name={'QTMNewTaskScreen'}
                                        options={{ headerShown: false }}
                                        component={QTMNewTaskScreen}
                                    />
                                    <Stack.Screen
                                        name={'QTMTopicDetailsScreen'}
                                        options={{ headerShown: false }}
                                        component={QTMTopicDetailsScreen}
                                    />
                                    <Stack.Screen
                                        name={'QTMTaskDetailsScreen'}
                                        options={{ headerShown: false }}
                                        component={QTMTaskDetailsScreen}
                                    />
                                    <Stack.Screen
                                        name={'QTMAllContactScreen'}
                                        options={{ headerShown: false }}
                                        component={QTMAllContactScreen}
                                    />
                                    <Stack.Screen
                                        name={'QTMMemberDetailsScreen'}
                                        options={{ headerShown: false }}
                                        component={QTMMemberDetailsScreen}
                                    />
                                    <Stack.Screen
                                        name={'QTMNewSubTaskScreen'}
                                        options={{ headerShown: false }}
                                        component={QTMNewSubTaskScreen}
                                    />
                                    <Stack.Screen
                                        name="QTMSubTaskDetailsScreen"
                                        options={{ headerShown: false }}
                                        component={QTMSubTaskDetailsScreen}
                                    />
                                    <Stack.Screen
                                        name="QTMViewSubTaskDetailsScreen"
                                        options={{ headerShown: false }}
                                        component={QTMViewSubTaskDetailsScreen}
                                    />
                                    <Stack.Screen
                                        name="QTMAttachmentScreen"
                                        options={{ headerShown: false }}
                                        component={QTMAttachmentScreen}
                                    />
                                    <Stack.Screen
                                        name="QTMAllTasksScreen"
                                        options={{ headerShown: false }}
                                        component={QTMAllTasksScreen}
                                    />
                                    <Stack.Screen
                                        name="QTMTopicDetailsV2"
                                        options={{ headerShown: false }}
                                        component={QTMTopicDetailsV2}
                                    />
                                    <Stack.Screen
                                        name="QTMGroupChatScreen"
                                        options={{ headerShown: false }}
                                        component={QTMGroupChatScreen}
                                    />
                                    <Stack.Screen
                                        name="DeleteAccountScreen"
                                        options={{ headerShown: false }}
                                        component={DeleteAccountScreen}
                                    />
                                      <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="CatalogueScreen"
                                        component={CatalogueScreen}
                                    />
                                       <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="CatalogCartScreen"
                                        component={CatalogCartScreen}
                                    />
                                     
                                     <Stack.Screen
                                        options={{
                                            headerShown: false,
                                        }}
                                        name="OrderPlacedScreen"
                                        component={OrderPlacedScreen}
                                    />

                                    <Stack.Screen
    name="IntegrationProfileDetails"
    component={IntegrationProfileDetails}
    options={{ headerShown: false }}
/>

                                    <Stack.Screen
    name="CouponsScreen"
    component={CouponsScreen}
    options={{ headerShown: false }}
/>

                                    
                                </Stack.Navigator>
                            </NavigationContainer>
                            </GestureHandlerRootView>
                              <Toast />
                            <ContextMenu navigation={navigationRef.current} />
                            </SafeAreaProvider>
                        </NativeBaseProvider>
                    </ChatContext>
                </AppContext>
            </PersistGate>
        </Provider>
    );
}

export default App;
