/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import dynamicLink from '@react-native-firebase/dynamic-links';
import messaging from '@react-native-firebase/messaging';
import { CommonActions } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DotsLoader from '../Components/CustomDotsLoader';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { default as Icon, default as IonIcons } from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { ConfirmationPopup } from '../Components/ConfirmationPopup';
import IntegrationListItem from '../Components/IntegrationListItem';
import { InternetStatusBar } from '../Components/InternetStatusBar';
import { QTMTopicAddModal } from '../Components/QTMComponents/QTMTopicAddModal';
import { envType } from '../Config/apiEnv';
import {
    getBookMarksForUser,
    syncMessageNotesAction,
    syncMessages,
    updateNonInteractedMessage,
} from '../Store/chat.store/chat.actions';
import {
    getAllIntegrationsAction,
    getIntegrationAction,
} from '../Store/integrations.store/integrations.actions';
import { setUserOnboarded } from '../Store/login.store/login.actions';
import { registerQTMUserAction, resetQTMState } from '../Store/qtm.store/qtm.actions';
import {
    AddFcmToken,
    LogOut,
    RemoveFcmToken,
    deleteAllCarts,
    deleteCartItems,
    getAllCarts,
    getIntegrationById,
    getIntegrationCategory,
    getNonInteractedIntegrations,
} from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';
import { requestContactPermission, requestNotificationPermission } from '../Utils/Helper';
import useMessageSync from '../hooks/useMessageSync';
import ExploreScreen from './ExploreScreen';
import { QTMHomeScreen } from './QTM/QTMHome.screen';
import { SettingsScreen } from './SettingsScreen';
import CatalogueChip from '../Components/CatalogueComponents/CatalogueChip';
import IntegrationListItemSkeleton, { SkeletonBox } from '../Components/Skeletons/IntegrationListItemSkeleton';
import CartsBottomSheet from '../Components/CatalogueComponents/CartsBottomSheet';
import { clearProductView } from '../Utils/ProductViewStorage';

function TSBottomBar({ selectedTab, onChangeTab, setCartSheetVisible, cartsCount }) {

    return (
        <View
            style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: Platform.OS === 'ios' ? 80 : 60,
                backgroundColor: 'white',
                paddingHorizontal: Platform.OS === 'ios' ? 10 : 0,
            }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    // onPress={() => setSelectedTab(0)}>
                    onPress={() => onChangeTab(0)}>
                    <IonIcons
                        name="briefcase"
                        style={{
                            color:
                                selectedTab === 0 ? colors.textBlueColor : colors.textColorGray,
                            fontSize: 24,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: '400',
                            color:
                                selectedTab === 0 ? colors.textBlueColor : colors.textColorGray,
                        }}>
                        {'My Business'}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    // onPress={() => setSelectedTab(1)}
                    onPress={() => onChangeTab(1)}>

                    <MaterialIcon
                        name={'dashboard'}
                        style={{
                            color:
                                selectedTab === 1 ? colors.textBlueColor : colors.textColorGray,
                            fontSize: 24,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: '400',
                            color:
                                selectedTab === 1 ? colors.textBlueColor : colors.textColorGray,
                        }}>
                        {'Explore'}
                    </Text>
                </TouchableOpacity>
            </View>


            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    onPress={() => {
                        onChangeTab(2)

                        setCartSheetVisible(true)

                    }

                    }
                >
                    <View style={{ position: 'relative' }}>
                        <Ionicons
                            name={selectedTab === 2 ? 'cart' : 'cart-outline'}
                            size={26}
                            color={
                                selectedTab === 2 ? colors.textBlueColor : colors.textColorGray
                            }
                        />

                        {cartsCount > 0 && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: -6,
                                    right: -10,
                                    backgroundColor: 'red',
                                    borderRadius: 10,
                                    minWidth: 16,
                                    height: 16,
                                    paddingHorizontal: 3,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontSize: 10,
                                        fontWeight: '700',
                                    }}
                                >
                                    {cartsCount}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: '400',
                            color:
                                selectedTab === 2
                                    ? colors.textBlueColor
                                    : colors.textColorGray,
                        }}>
                        All Carts
                    </Text>
                </TouchableOpacity>
            </View>


            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    // onPress={() => setSelectedTab(3)}>
                    onPress={() => onChangeTab(3)}
                >
                    <IonIcons
                        name="settings"
                        style={{
                            color:
                                selectedTab === 3 ? colors.textBlueColor : colors.textColorGray,
                            fontSize: 24,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: '400',
                            color:
                                selectedTab === 3 ? colors.textBlueColor : colors.textColorGray,
                        }}>
                        {'Settings'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export const SkeletonChip = () => {
    return (
        <SkeletonBox
            style={{
                width: 90,
                height: 34,
                borderRadius: 20,
            }}
        />
    );
};


const ChipSkeletonRow = () => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                paddingHorizontal: 15,
                marginTop: 25,
                marginBottom: 15,
                gap: 10,
            }}
        >
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
                <SkeletonChip key={i} />
            ))}
        </ScrollView>
    );
};


function HomeScreen(props) {

    const [integrationCategories, setIntegrationCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [displayQTMAddOptions, setDisplayQTMAddOptions] = useState(false);
    const [viewMoreTopics, setViewMoreTopics] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [cartsList, setCartsList] = useState([])
    const [cartSheetVisible, setCartSheetVisible] = useState(false);

    const { integrations, loading } = useSelector(state => state.integrationState);

    const isFetchingMoreRef = useRef(false);

    const nonInteractedIntegrations = useSelector(
        state => state.chatState.nonInteractedIntegrations,
    );

    const [redirceted, setRedirected] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [cartsLoading, setCartsLoading] = useState(false)
    const [selectedTab, setSelectedTab] = useState(0);
    const [routes] = useState([
        {
            key: 'recent',
            title: 'Recent',
        },
        {
            key: 'integrations',
            title: 'Explore',
        },
    ]);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
    const dispatch = useDispatch();

    const [mode, setMode] = useState('VIEW');

    const isSyncing = useMessageSync();

    useEffect(() => {
        if (props?.isFromTaskDetails) {
            setSelectedTab(2);
        }
    }, [props]);



    useEffect(() => {
        // dispatch(getIntegrationAction(0, 10, '', true));
        dispatch(syncMessages());
        dispatch(syncMessageNotesAction());
        dispatch(getBookMarksForUser());
        dispatch(setUserOnboarded(true));
    }, []);


    useEffect(() => {
        dispatch(getAllIntegrationsAction());
    }, []);



    useEffect(() => {
        const fetchData = async () => {
            try {


                dispatch(getIntegrationAction(0, 10, '', true));

                const categories = await getIntegrationCategory();

                if (categories && categories.length > 0)
                setIntegrationCategories(categories);

            } catch (error) {
                console.log('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };


        const unsubscribe = props.navigation.addListener('focus', fetchData);

        fetchData();

        return unsubscribe;

    }, [props.navigation, dispatch]);


    async function fetchAllCarts() {

        try {
            setCartsLoading(true)
            const res = await getAllCarts()
            console.log("res", res.data)
            setCartsList(res.data)

        } catch (err) {
            console.err(err.message)
        } finally {
            setCartsLoading(false)
        }

    }


    useEffect(() => {

        const unsubscribe = props.navigation.addListener('focus', fetchAllCarts);

        fetchAllCarts()

        return unsubscribe;
    }, [props.navigation]);



    const handleCategoryPress = (category) => {
        setSelectedCategory(category);
        setCategoryLoading(true);
        dispatch(getIntegrationAction(0, 10, '', true, category));

    };



    const _handleDynamicLinks = async () => {
        if (props.route.params?.linkedIntegrationId) {
            let _integrationId = props.route.params?.linkedIntegrationId;
            let integrationDetails;
            getIntegrationById(_integrationId)
                .then(response => {
                    integrationDetails = response.data;
                    if (!redirceted && integrationDetails !== undefined) {
                        props.navigation.navigate('ChatScreen', {
                            sendWelcome: true,
                            integrationItem: {
                                ...integrationDetails,
                            },
                        });
                        setRedirected(true);
                    }
                })
                .catch(error => { });
        } else {
            dynamicLink().onLink(link => {
                if (link.url.indexOf('http://tubulu.in/') >= 0) {
                    let _integrationId = link.url.replace('http://tubulu.in/', '');
                    let integrationDetails;
                    getIntegrationById(_integrationId)
                        .then(response => {
                            integrationDetails = response.data;
                            if (!redirceted && integrationDetails !== undefined) {
                                props.navigation.navigate('ChatScreen', {
                                    sendWelcome: true,
                                    integrationItem: {
                                        ...integrationDetails,
                                    },
                                });
                                setRedirected(true);
                            }
                        })
                        .catch(error => { });
                }
            });
        }
    };

    useEffect(() => {
        _fetchNonInteractedIntegrationList();
    }, []);

    useEffect(() => {
        dispatch(registerQTMUserAction());
        requestContactPermission();
    }, []);

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    useEffect(() => {
        if (integrations.length > 0) {
            _handleDynamicLinks();
        }
    }, [integrations]);

    useEffect(() => {
        props.navigation.addListener('focus', e => {
            setCurrentPage(0);
        });
        requestUserPermission();
    }, []);

    const _fetchNonInteractedIntegrationList = async () => {
        try {
            const integrationList = await getNonInteractedIntegrations(0, 9);
            dispatch(updateNonInteractedMessage(integrationList?.data));
        } catch (error) {
            console.log(error);
        }
    };

    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
            messaging()
                .getToken()
                .then(token => {
                    console.log(token);
                    return AddFcmToken(token);
                })
                .then(() => {
                    console.log('FCM token added successfully.');
                })
                .catch(error => { });
        }
    };

    const renderIntegration = item => {
        return <IntegrationListItem navigation={props.navigation} item={item} integrationList={integrations[1]?.catalogues ?? []} />;
    };



    async function onLogout() {
        try {
            // 1. Get current FCM token
            const currentToken = await messaging().getToken();

            // console.log("Current FCM token:", currentToken);


            // // // 2. Remove from backend
            await RemoveFcmToken(currentToken);


            // // console.log("Local FCM token deleted");
            await clearProductView();


            LogOut();

            // 4. Reset navigation
            props.navigation?.dispatch?.(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Registration' }],
                })
            );

        } catch (error) {
            console.log(error);
            alert('Unable to logout at the moment');
        }



    }


    return (
        <View style={{
            flex: 1,
            backgroundColor: colors.backgroundWhite
        }}>
            {/* Remove spacer; SafeAreaView will wrap header below */}
            <StatusBar
                barStyle={selectedTab === 3 ? 'dark-content' : 'default'}
                backgroundColor={
                    selectedTab === 3 ? 'white' : colors.backgroundColorHeader
                }
                translucent={false}
            />
            {selectedTab !== 3 && (
                <>
                    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.backgroundColorHeader }}>
                        <View
                            style={{
                                backgroundColor: colors.backgroundColorHeader,
                                height: 60,
                                display: 'flex',
                                flexDirection: 'row',
                                paddingLeft: 14,
                                paddingRight: 8,
                                alignItems: 'center',
                            }}>

                            {viewMoreTopics ?
                                <TouchableOpacity
                                    style={{ justifyContent: 'center', alignItems: 'center', height: 32, width: 32, borderRadius: 40, borderColor: colors.backgroundWhite, borderWidth: 1 }}
                                    onPress={() => { setViewMoreTopics(!viewMoreTopics); }}>
                                    <Icon name="arrow-back" style={{ color: colors.backgroundWhite, fontSize: 24 }} />
                                </TouchableOpacity>
                                :
                                (
                                    <>
                                        {selectedTab === 2 || selectedTab === 6 && (
                                            <View
                                                style={{
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: 32,
                                                    width: 32,
                                                    borderRadius: 40,
                                                    borderColor: colors.backgroundWhite,
                                                    borderWidth: 1,
                                                    marginRight: 8
                                                }}>
                                                <TouchableOpacity
                                                    onPress={() => setSelectedTab(3)}>

                                                    <Icon
                                                        name="arrow-back"
                                                        style={{ color: colors.backgroundWhite, fontSize: 24 }}
                                                    />
                                                </TouchableOpacity>
                                            </View>)}

                                        <View
                                            style={{
                                                backgroundColor: 'white',
                                                borderColor: 'transparent',
                                                borderRadius: 100,
                                                borderWidth: 1,
                                                padding: 6,
                                            }}>
                                            <Image
                                                source={require('../assets/splash_logo.png')}
                                                style={{ height: 24, width: 24 }}
                                                resizeMode="contain"
                                            />
                                        </View></>)
                            }
                            <Text
                                style={{
                                    marginLeft: 8,
                                    color: colors.textWhite,
                                    fontSize: 28,
                                    fontWeight: '500',
                                }}>
                                {viewMoreTopics ? 'All Tasks' : selectedTab == 6 ? 'Tubulu QTM' : 'Tubulu'}
                            </Text>
                             <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <View
                                    style={{
                                        padding: 8,
                                        height: 38,
                                        width: 38,
                                        marginLeft: 8,
                                        borderColor: colors.backgroundWhite,
                                        borderWidth: 1,
                                        borderRadius: 100,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            props.navigation.navigate('Assistant');
                                        }}>
                                        <IonIcons
                                            name="chatbubble-ellipses"
                                            style={{ fontSize: 20, color: 'white' }}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View
                                    style={{
                                        padding: 8,
                                        height: 38,
                                        width: 38,
                                        marginLeft: 8,
                                        borderColor: colors.backgroundWhite,
                                        borderWidth: 1,
                                        borderRadius: 100,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            props.navigation.navigate('QRScanner');
                                        }}>
                                        <FontAwesomeIcon
                                            name="qrcode"
                                            style={{ fontSize: 20, color: 'white' }}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View
                                    style={{
                                        padding: 8,
                                        height: 38,
                                        width: 38,
                                        marginLeft: 8,
                                        borderColor: colors.backgroundWhite,
                                        borderWidth: 1,
                                        borderRadius: 100,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <TouchableOpacity
                                        onLongPress={() => {
                                            envType === 'STAGING' && props.navigation.navigate('NetworkLoggerScreen');
                                        }}
                                        onPress={() => {
                                            selectedTab !== 2 && props.navigation.navigate('IntegrationSearch');
                                        }}>
                                        <FontAwesomeIcon
                                            name="search"
                                            style={{ fontSize: 16, color: 'white' }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {selectedTab === 2 && (
                                <TouchableOpacity
                                    onLongPress={() => {
                                        envType === 'STAGING' && props.navigation.navigate('NetworkLoggerScreen');
                                    }}
                                    onPress={() => {
                                        // props.navigation.navigate('QTMNewTaskScreen');
                                        setDisplayQTMAddOptions(!displayQTMAddOptions);
                                    }}>
                                    <View
                                        style={{
                                            padding: 8,
                                            height: 38,
                                            width: 38,
                                            marginLeft: 8,
                                            borderColor: colors.backgroundWhite,
                                            borderWidth: 1,
                                            borderRadius: 100,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <FontAwesomeIcon
                                            name="plus"
                                            style={{ fontSize: 16, color: 'white' }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </SafeAreaView>
                    <InternetStatusBar />
                </>
            )}
            {selectedTab === 0 && (
                <>


                    <FlatList
                        data={loading ? [1, 2, 3, 4, 5, 6] : integrations}
                        keyExtractor={(item, index) => item._id?.toString() ?? index.toString()}
                        renderItem={({ item }) =>
                            loading ? (
                                <IntegrationListItemSkeleton />
                            ) : (
                                renderIntegration({ item })
                            )
                        }
                        ListEmptyComponent={
                            loading ? (
                                <>
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <IntegrationListItemSkeleton key={i} />
                                    ))}
                                </>
                            ) : (
                                <Text style={{ textAlign: 'center', marginTop: 20 }}>No Integrations Found</Text>
                            )
                        }


                        onEndReached={() => {



                            if (loading || isFetchingMoreRef.current || integrations.length < 10) return;

                            isFetchingMoreRef.current = true;

                            const nextPage = currentPage + 1;

                            dispatch(getIntegrationAction(nextPage, 10, searchText, false))
                                .finally(() => {
                                    isFetchingMoreRef.current = false;
                                    setCurrentPage(nextPage);
                                });

                        }
                        }
                        onEndReachedThreshold={0.01}
                        ListFooterComponent={
                            isFetchingMore ? <IntegrationListItemSkeleton /> : null
                        }



                        ListHeaderComponent={
                            loadingCategories ? (
                                <ChipSkeletonRow />
                            ) : integrationCategories.length > 0 ? (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{
                                        paddingHorizontal: 15,
                                        marginTop: 25,
                                        marginBottom: 15,
                                        gap: 10,
                                    }}
                                >
                                    {integrationCategories.map((category, i) => (
                                        <CatalogueChip
                                            key={i}
                                            label={category}
                                            onPress={() => handleCategoryPress(category)}
                                            selected={selectedCategory === category}
                                        />
                                    ))}
                                </ScrollView>
                            )
                                :
                                null

                        }

                    />
                </>

            )}
            {selectedTab === 1 && (
                <ExploreScreen
                    navigation={props.navigation}
                    discoverData={nonInteractedIntegrations}
                    integrationList={integrations[1]?.catalogues ?? []}
                />
            )}
            {selectedTab === 6 && (
                <QTMHomeScreen
                    navigation={props.navigation}
                    displayOptions={displayQTMAddOptions}
                    setDisplayOptions={setDisplayQTMAddOptions}
                    viewMore={viewMoreTopics}
                    setViewMore={setViewMoreTopics}
                    setTopicMode={setMode}
                />
            )
            }
            {selectedTab === 2 && (

                <CartsBottomSheet
                    carts={cartsList}
                    loading={cartsLoading}
                    onBrowse={() => setSelectedTab(0)}
                    onViewMenu={(cart) => {

                        props.navigation.navigate('CatalogueScreen', {
                            integrationItem: { ...cart, _id: cart.integrationId },
                        });

                    }}
                    onOpenCart={(cart) => {
                        props.navigation.navigate('CatalogCartScreen', {
                            integrationId: cart.integrationId,
                            catalogId: cart.catalogueId,
                            integrationName: cart.integrationName
                        });

                    }
                    }
                    onRemove={async (item) => {
                        try {
                            if (!item.integrationId || !item.catalogueId) return;
                            await deleteCartItems(item.integrationId, item.catalogueId, "all");
                            fetchAllCarts()
                            dispatch(getIntegrationAction(0, 10, '', true));
                        } catch (err) {
                            console.error(err.message, "error deleting cart")

                        }
                    }
                    }
                    onClearAll={async () => {
                        try {
                            await deleteAllCarts()
                            fetchAllCarts()
                            dispatch(getIntegrationAction(0, 10, '', true));
                        } catch (err) {
                            console.error(err.message, "Error deleting all carts")
                        }
                    }}
                />
            )}
            {selectedTab === 3 && (
                <SettingsScreen
                    navigation={props.navigation}
                    setSelectedTab={setSelectedTab}
                    onLogout={() => {
                        setShowLogoutConfirmation(true);
                    }}
                />
            )}
            {false && (
                <View
                    style={{
                        paddingBottom: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <DotsLoader color={colors.primaryColor} />
                </View>
            )}



            {selectedTab !== 6 && (
                <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'white', borderTopWidth: 0, borderTopColor: 'transparent' }}>
                    <TSBottomBar cartsCount={cartsList?.length} setCartSheetVisible={setCartSheetVisible} selectedTab={selectedTab} onChangeTab={tab => setSelectedTab(tab)} />
                </SafeAreaView>
            )}

            {showLogoutConfirmation && (
                <ConfirmationPopup
                    title={'Logout?'}
                    subTitle={'Are you sure, you want to logout?'}
                    onCancel={() => {
                        setShowLogoutConfirmation(false);
                    }}
                    yesText={'Logout'}
                    onSave={() => {
                        setShowLogoutConfirmation(false);
                        dispatch(resetQTMState());
                        onLogout();
                    }}
                />
            )}
            <QTMTopicAddModal
                visible={viewMoreTopics}
                setModalClose={() => { setViewMoreTopics(false); setMode('VIEW'); }}
                mode={mode}
            />
        </View>
    );

}

export default HomeScreen;
