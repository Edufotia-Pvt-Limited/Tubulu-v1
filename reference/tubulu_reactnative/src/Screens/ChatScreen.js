/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { FlashList } from '@shopify/flash-list';
import { Input } from 'native-base';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Clipboard,
    Dimensions,
    Keyboard,
    Image,
    KeyboardAvoidingView,
    LayoutAnimation,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { pick } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import ChatBubble from '../Components/ChatBubble';
import { ChatBubbleOptions } from '../Components/ChatBubbleOptions';
import TypingIndicator from '../Components/TypingIndicator';
import ChatHeader from '../Components/ChatHeader';
import ChatHeaderOptions from '../Components/ChatHeaderOptions';
import { ConfirmationPopup } from '../Components/ConfirmationPopup';
import { MessageNoteForm } from '../Components/MessageNoteForm';
import { chatContext } from '../Context/ChatContext';
import chatService from '../Services/Chat.service';
import {
    deleteBookmarkAction,
    deleteNoteAction,
    getBookmarksForChatRoom,
    getChatMessagesForChatRoom,
    getMessageNotesForChatRoom,
} from '../Store/chat.store/chat.actions';
import {
    addNewMessageNote,
    deleteBookmark,
    deleteNote,
    editNote,
    getBlockedIntegration,
    getOrderDetails,
    markActionPosted,
    newBlockedIntegration,
    newBookmark,
    removeBlockedIntegration,
    uploadUserDocumentFile,
    WelcomeUserToIntegration,
} from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';
import { getMediaType, requestCameraPermission } from '../Utils/Helper';
import OrderReceiptMessage from '../Components/CatalogueComponents/OrderReceiptMessage';
import PinnedOrderBanner from '../Components/CatalogueComponents/PinnedOrderBanner';
import { ORDER_STATUS_CONFIG } from '../Utils/Constants';


const orderTypesMap = {
    ORDER_ACCEPTED: true,
    ORDER_PACKING: true,
    ORDER_DISPATCHED: true,
    ORDER_DELIVERED: true,
    ORDER_CANCELED: true,
};


export function SuccessToast({ message, displayToast }) {
    if (displayToast) {
        return (
            <View
                style={{
                    position: 'absolute',
                    backgroundColor: '#00A400',
                    padding: 16,
                    borderRadius: 20,
                    bottom: 60,
                    left: '20%',
                }}>
                <Text
                    style={{
                        color: 'white',
                        fontStyle: 'normal',
                        fontSize: 17,
                        fontWeight: '400',
                    }}>
                    {message}
                </Text>
            </View>
        );
    }
    return null;
}

export function AttachementSheet(props) {
    const [bottomVal] = useState(new Animated.Value(-200));

    useEffect(() => {
        Animated.spring(bottomVal, {
            toValue: props.isOpen ? (10 + (props.toggleHeightFlow || 0)) : -200,
            tension: 65,
            friction: 11,
            useNativeDriver: false,
        }).start();
    }, [props.isOpen, props.toggleHeightFlow, bottomVal]);

    return (
        <Animated.View
            style={{
                backgroundColor: '#F2F6FE',
                height: 120,
                width: '100%',
                position: 'absolute',
                bottom: bottomVal,
                paddingLeft: 16,
                paddingRight: 8,
                paddingBottom: 16,
                paddingTop: 8,
                zIndex: 100,
                flexDirection: 'row',
                alignItems: 'center',

            }}>
            <ScrollView horizontal style={{ flex: 1, overflow: 'scroll' }}>
                <TouchableOpacity
                    onPress={props.onCamera}
                    style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        style={{ height: 52, width: 52 }}
                        source={require('../assets/cam_icon.png')}
                    />
                    <Text style={{ marginTop: 4, fontWeight: '400', color: 'black' }}>
                        Camera
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={props.onVideo}
                    style={{
                        marginLeft: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Image
                        style={{ height: 52, width: 52 }}
                        source={require('../assets/video_icon.png')}
                    />
                    <Text style={{ marginTop: 4, fontWeight: '400', color: 'black' }}>
                        Video
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={props.onDocument}
                    style={{
                        marginLeft: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Image
                        style={{ height: 52, width: 52 }}
                        source={require('../assets/aud_icon.png')}
                    />
                    <Text style={{ marginTop: 4, fontWeight: '400', color: 'black' }}>
                        Audio
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={props.onDocument}
                    style={{
                        marginLeft: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Image
                        style={{ height: 52, width: 52 }}
                        source={require('../assets/doc_icon.png')}
                    />
                    <Text style={{ marginTop: 4, fontWeight: '400', color: 'black' }}>
                        Document
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        props.onGallery();
                    }}
                    style={{
                        marginLeft: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Image
                        style={{ height: 52, width: 52 }}
                        source={require('../assets/gallery_icon.png')}
                    />
                    <Text style={{ marginTop: 4, fontWeight: '400', color: 'black' }}>
                        Gallery
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </Animated.View>
    );
}

function ChatScreen(props) {
    const [chatMessage, setChatMessage] = useState('');
    const chat = useContext(chatContext)
    const scrollRef = useRef();
    const [documentLoading, setDocumentLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [chatInputHeight, setChatInputHeight] = useState(45);
    const [kavKey, setKavKey] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [chatRoomId, setChatRoomId] = useState('');
    const [chatOptionsTop, setChatOptionsTop] = useState(undefined);
    const [chatOptionsRight, setChatOptionsRight] = useState(undefined);
    const [selectedChatMessage, setSelectedChatMessage] = useState(undefined);
    const [showNote, setShowNote] = useState(false);
    const [notesList, setNotesList] = useState([]);
    const [noteToEdit, setNoteToEdit] = useState(undefined);
    const [selectedNoteIdToDelete, setSelectedNoteIdToDelete] =
        useState(undefined);
    const [bookmarkList, setBookmarkList] = useState([]);
    const [selectedBookmarkIdToDelete, setSelectedBookmarkIdToDelete] =
        useState(undefined);
    const [showChatHeaderOptions, setShowChatHeaderOptions] = useState(false);
    const [selectedIntegrationToBlock, setSelectedIntegrationToBlock] =
        useState(undefined);
    const [isIntegrationBlocked, setIsIntegrationBlocked] = useState(undefined);
    const [successCopiedMessage, setSuccessCopiedMessage] = useState(undefined);
    const [isCatalogueEnabled, setIsCatalogueEnabled] = useState(false);
    const [showPinnedOrder, setShowPinnedOrder] = useState(true);
    const [dismissedOrderIds, setDismissedOrderIds] = useState(new Set());
    const userMessages = useSelector(state => state.chatState.userMessages);
    const notesInState = useSelector(state => state.chatState.messageNotes);
    const insets = useSafeAreaInsets();
    const integrations = useSelector(
        state => state.integrationState.integrations,
    );

    // console.log("Selected Integration Item: ", props.route?.params?.integrationItem);
    // console.log("Chat Screen Integration ID: ", props.route?.params?.integrationItem?._id);

    const chatListRef = useRef();

    console.log(chat)

    useMemo(() => {
        setNotesList(notesInState);
    }, [notesInState]);

    useMemo(() => {
        chat.actions.getChatMessages(
            props?.route?.params?.integrationItem?.chatRoomId,
        );
    }, [userMessages]);

    const dispatch = useDispatch();

    useEffect(() => {
        scrollFlashListToEnd(false);
    }, [chat.state?.chatmessages]);

    // Show banner if new active orders appear
    useEffect(() => {
        if (getActiveOrders && Array.isArray(getActiveOrders) && getActiveOrders.length > 0 && !showPinnedOrder) {
            setShowPinnedOrder(true);
        }
    }, [getActiveOrders, showPinnedOrder]);

    // Handle keyboard show/hide to close attachment sheet and fix Android layout
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                // Close attachment sheet when keyboard opens
                setKeyboardVisible(true);
                setIsOpen(false);
            }
        );

        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                // Ensure attachment sheet stays closed when keyboard closes
                setKeyboardVisible(false);
                setIsOpen(false);

                // On Android with RN 0.78.2, force KeyboardAvoidingView reset
                if (Platform.OS === 'android') {
                    // Use LayoutAnimation for smooth transition
                    LayoutAnimation.configureNext(
                        LayoutAnimation.create(
                            200,
                            LayoutAnimation.Types.easeInEaseOut,
                            LayoutAnimation.Properties.opacity
                        )
                    );
                    // Wait for keyboard animation, then remount to reset
                    setTimeout(() => {
                        setKavKey(prev => prev + 1);
                    }, 150);
                }
            }
        );

        return () => {
            keyboardWillShowListener?.remove();
            keyboardWillHideListener?.remove();
        };
    }, []);


    useEffect(() => {
        const integrationItem = props?.route?.params?.integrationItem;

        if (integrationItem?.catalogues?.length > 0) {
            console.log("Checking catalogue status for integration:", integrationItem);
            const catalogues = integrationItem.catalogues;
            const isEnabled = catalogues.some(catalogue => catalogue.isActive === true);
            setIsCatalogueEnabled(isEnabled);
        } else {
            setIsCatalogueEnabled(false);
        }
    }, [props?.route?.params?.integrationItem]);


    // Helper function to extract orderId from message
    const extractOrderIdFromMessage = (message) => {
        if (!message) return null;
        const boldMatches = Array.from(message.matchAll(/<b>(.*?)<\/b>/g), m => m[1]);
        return boldMatches[1] || null;
    };

    const onViewDetails = (orderId, type) => {

        props.navigation.navigate("OrderSummary", { orderId,type });

    }

    // Extract active orders from chat messages
    // Only show orders that are NOT delivered, dispatched, canceled, or refunded
    const getActiveOrders = useMemo(() => {
        if (!chat.state?.chatmessages) return [];

        const excludedStatuses = ['ORDER_DELIVERED', 'ORDER_CANCELED', 'ORDER_REFUND'];
        const orderMessages = chat.state.chatmessages.filter(msg =>
            ORDER_STATUS_CONFIG[msg?.type] && !excludedStatuses.includes(msg?.type)
        );

        // Group by orderId and get the latest status for each order
        const orderMap = new Map();

        orderMessages.forEach(msg => {
            const orderId = msg.orderId || extractOrderIdFromMessage(msg.message);
            if (!orderId) return;

            // Skip dismissed orders
            if (dismissedOrderIds.has(orderId)) return;

            const existing = orderMap.get(orderId);
            if (!existing || new Date(msg.createdAt) > new Date(existing.createdAt)) {
                orderMap.set(orderId, msg);
            }
        });

        // Convert to array and sort by most recent
        const activeOrders = Array.from(orderMap.values()).sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return activeOrders;
    }, [chat.state?.chatmessages, dismissedOrderIds]);



    useEffect(() => {
        chat.actions.resetChatMessages();
        requestCameraPermission();
        // Reset dismissed orders when chat room changes
        setDismissedOrderIds(new Set());
        setShowPinnedOrder(true);
        if (props?.route?.params?.integrationItem?.chatRoomId) {
            chat.actions.setChatRoom(
                props?.route?.params?.integrationItem?.chatRoomId,
                () => {
                    // scrollRef?.current?.scrollToTop?.({animated: true});
                },
            );
            dispatch(
                getChatMessagesForChatRoom(
                    props?.route?.params?.integrationItem?.chatRoomId,
                    40,
                ),
            );
            dispatch(
                getBookmarksForChatRoom(
                    props?.route?.params?.integrationItem?.chatRoomId,
                ),
            );
            dispatch(
                getMessageNotesForChatRoom(
                    props?.route?.params?.integrationItem?.chatRoomId,
                ),
            );
            fetchBookmarks(props?.route?.params?.integrationItem?.chatRoomId);
            fetchNotes(props?.route?.params?.integrationItem?.chatRoomId);
            setChatRoomId(props?.route?.params?.integrationItem?.chatRoomId);
            checkIsIntegrationBlocked();
        }
        // GetChatRoom(props?.route?.params?.integrationItem?._id)
        //     .then(response => {
        //         chat.actions.setChatRoom(response.data?._id);
        //         dispatch(getChatMessagesForChatRoom(response.data?._id, 40));
        //         dispatch(getBookmarksForChatRoom(response.data?._id));
        //         dispatch(getMessageNotesForChatRoom(response.data?._id));
        //         fetchBookmarks(response.data?._id);
        //         fetchNotes(response.data?._id);
        //         initiateWelcomMessage();
        //         setChatRoomId(response.data?._id);
        //     })
        //     .catch(error => {
        //         console.log(error);
        //     });
    }, []);

    async function checkIsIntegrationBlocked() {
        try {
            const { success } = await getBlockedIntegration(
                props?.route?.params?.integrationItem?._id,
            );
            setIsIntegrationBlocked(success);
        } catch (error) { }
    }

    async function fetchBookmarks(chatRoomId) {
        try {
            const data = chatService.getChatBookmarksForChatRoom(chatRoomId);
            setBookmarkList(data);
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchNotes(chatRoomId) {
        try {
            const data = chatService.getMessageNotesForChatRoom(chatRoomId);
            setNotesList(data);
        } catch (error) {
            console.log(error);
        }
    }

    const initiateWelcomMessage = () => {
        if (
            props?.route?.params?.integrationItem?._id &&
            props?.route?.params?.sendWelcome
        ) {
            let _integrationId = props?.route?.params?.integrationItem?._id;
            WelcomeUserToIntegration(_integrationId)
                .then(_ => { })
                .catch(_ => { });
        }
    };

    async function markActionPostedApiCall(messageId, title) {
        try {
            await markActionPosted(messageId, title);
        } catch (error) {
            console.log('Unable to update the message action');
            console.log(error);
        }
    }

    const renderChatMessages = () => {
        return (
            <chatContext.Consumer>
                {({ state, actions }) => {
                    return state?.chatmessages?.map(chatMessage => {
                        if (
                            chatMessage?.message
                                ?.toLowerCase?.()
                                ?.indexOf?.(searchText.toLowerCase()) >= 0
                        ) {
                            return (
                                <ChatBubble
                                    hasBookmark={
                                        bookmarkList.findIndex(bookmarkItem => {
                                            if (bookmarkItem.chatMessageId === chatMessage?._id) {
                                                return 1;
                                            }
                                            return 0;
                                        }) >= 0
                                    }
                                    hasNote={
                                        notesList.findIndex(noteItem => {
                                            if (noteItem.chatMessageId === chatMessage?._id) {
                                                return 1;
                                            }
                                            return 0;
                                        }) >= 0
                                    }
                                    onLongPress={(x, y, height, width, event) => {
                                        // const size= y <= Dimensions.get('screen').height / 2 ? (y / 2) + height : y - 20
                                        // setChatOptionsTop(y <= Dimensions.get('screen').height / 2 ? (y / 2) + height : y - 20);
                                        const locationY =
                                            event.nativeEvent.pageY >=
                                                Dimensions.get('screen').height / 2
                                                ? event.nativeEvent.pageY - 250
                                                : event.nativeEvent.pageY - 50;
                                        setChatOptionsTop(locationY);
                                        setChatOptionsRight(60);
                                        setSelectedChatMessage(chatMessage);
                                        return;
                                    }}
                                    integrationItem={props.route?.params?.integrationItem}
                                    onListItemSendMessage={message => {
                                        scrollFlashListToEnd();
                                        scrollRef?.current?.scrollToTop?.({ animated: true });
                                        chat?.actions?.sendChatMessage(
                                            message,
                                            'TEXT',
                                            props?.route?.params?.integrationItem?._id,
                                            {},
                                            {},
                                        );
                                        scrollRef?.current?.scrollToTop?.({ animated: true });
                                    }}
                                    onQuickActionPress={actionItem => {
                                        if (actionItem.type === 'CALL_TO_ACTION') {
                                            Linking.canOpenURL(actionItem.actionApi)
                                                .then(result => {
                                                    Linking.openURL(actionItem.actionApi);
                                                })
                                                .catch(error => {
                                                    console.log(error);
                                                });
                                        } else {
                                            scrollFlashListToEnd();
                                            scrollRef?.current?.scrollToTop?.({ animated: true });
                                            chat?.actions?.sendChatMessage(
                                                actionItem.title,
                                                'TEXT',
                                                props?.route?.params?.integrationItem?._id,
                                                {},
                                                { ...actionItem, repliedMessageUUID: chatMessage.uuid },
                                            );
                                            scrollRef?.current?.scrollToTop?.({ animated: true });
                                            markActionPostedApiCall(
                                                chatMessage.uuid,
                                                actionItem.title,
                                            );
                                        }
                                    }}
                                    navigation={props.navigation}
                                    chatMessage={chatMessage}
                                />
                            );
                        }
                    });
                }}
            </chatContext.Consumer>
        );
    };

    const handleDocFile = async file => {
        setDocumentLoading(true);
        const { size, fileSize } = file;
        if (size < 10485760 || fileSize < 10485760) {
            console.log('File taken to upload');
            let _base64 = await RNFS.readFile(file.uri, 'base64');
            uploadUserDocumentFile(file.fileName, _base64, file.type)
                .then(response => {
                    if (response?.success) {
                        scrollFlashListToEnd();
                        scrollRef?.current?.scrollToTop?.({ animated: true });
                        setDocumentLoading(false);
                        chat.actions.sendChatMessage(
                            'MEDIA',
                            getMediaType(file.type),
                            props?.route?.params?.integrationItem?._id,
                            {
                                ...response?.data,
                                mimeType: file.type,
                            },
                        );
                    } else {
                        setDocumentLoading(false);
                        Alert.alert(
                            'Unable to upload the file at the moment due to server error',
                        );
                    }
                })
                .catch(error => {
                    console.log(error);
                    setDocumentLoading(false);
                    Alert.alert(
                        'Unable to upload the file at the moment ' + error.message,
                    );
                });
        } else {
            setDocumentLoading(false);
            Alert.alert('File Size exceeds 10mb.');
        }
    };

    function getNoteIdByChatMessageId(chatMessageId) {
        if (chatMessageId) {
            let existingNoteId;
            const noteIndex = notesList.findIndex(noteItem => {
                if (noteItem.chatMessageId === chatMessageId) {
                    return 1;
                }
                return 0;
            });
            existingNoteId = notesList?.[noteIndex]?._id;
            return existingNoteId ?? undefined;
        }
        return undefined;
    }

    async function deleteExistingNote(noteId) {
        try {
            const deleteNoteResponse = await deleteNote(noteId);
            dispatch(deleteNoteAction(noteId));
            if (deleteNoteResponse.data) {
                const noteList = Object.assign([], notesList);
                const noteIndex = noteList.findIndex(noteItem => {
                    return noteItem._id === noteId ? 1 : 0;
                });
                noteList.splice(noteIndex, 1);
                setNotesList(noteList);
                setSelectedNoteIdToDelete(undefined);
            } else {
                Alert.alert('Unable to delete the note at the moment');
            }
            setChatOptionsTop(undefined);
            setChatOptionsRight(undefined);
            setSelectedChatMessage(undefined);
        } catch (error) {
            Alert.alert('Unable to delete the note at the moment');
        }
    }

    async function newBookmarkFunc() {
        try {
            const { data } = await newBookmark(
                selectedChatMessage._id,
                selectedChatMessage.chatRoom,
            );
            const _bookmarkList = Object.assign([], bookmarkList);
            _bookmarkList.push(data);
            setBookmarkList(_bookmarkList);
            setChatOptionsRight(undefined);
            setChatOptionsTop(undefined);
            dispatch(
                getBookmarksForChatRoom(
                    props?.route?.params?.integrationItem?.chatRoomId,
                ),
            );
        } catch (error) {
            console.log(error);
            alert('Unable to save the bookmark at the moment');
        }
    }

    function getBookmarkIdByChatMessageId(chatMessageId) {
        if (chatMessageId) {
            let existingBookmarkId;
            const bookmarkIndex = bookmarkList.findIndex(bookmarkItem => {
                if (bookmarkItem.chatMessageId === chatMessageId) {
                    return 1;
                }
                return 0;
            });
            existingBookmarkId = bookmarkList?.[bookmarkIndex]?._id;
            return existingBookmarkId ?? undefined;
        }
        return undefined;
    }

    async function deleteExistingBookmark() {
        try {
            const deleteResponse = await deleteBookmark(selectedBookmarkIdToDelete);
            if (deleteResponse.success) {
                dispatch(deleteBookmarkAction(selectedBookmarkIdToDelete));
                const _bookmarkList = Object.assign([], bookmarkList);
                const bookMarkIndex = _bookmarkList.findIndex(bookmarkitem => {
                    if (bookmarkitem.chatMessageid === selectedChatMessage._id) {
                        return 1;
                    }
                    return 0;
                });
                _bookmarkList.splice(bookMarkIndex, 1);
                setBookmarkList(_bookmarkList);
                setSelectedBookmarkIdToDelete(undefined);
                return;
            }
            alert('Unable to remove the bookmark at the moment');
        } catch (error) {
            alert('Unable to remove the bookmark at the moment');
        }
    }

    async function unblockThisBusiness() {
        try {
            await removeBlockedIntegration(
                props?.route?.params?.integrationItem?._id,
            );
            setSelectedIntegrationToBlock(undefined);
            setIsIntegrationBlocked(false);
        } catch (error) {
            console.log(error);
            Alert.alert('Unable to block the business at the moment');
        }
    }

    async function blockThisBusiness() {
        try {
            await newBlockedIntegration(props?.route?.params?.integrationItem?._id);
            setSelectedIntegrationToBlock(undefined);
            setIsIntegrationBlocked(true);
        } catch (error) {
            console.log(error);
            Alert.alert('Unable to block the business at the moment');
        }
    }

    function goToBookmarksScreen() {
        props.navigation.navigate('BookmarksScreen', {
            bookmarkList,
            integrationItem: props?.route?.params?.integrationItem,
            chatRoomId,
        });
    }

    function goToNotesScreen() {
        props.navigation.navigate('ViewNotes', {
            integrationItem: props?.route?.params?.integrationItem,
            chatRoomId,
        });
    }

    function isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
        const paddingToBottom = 120;
        return (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        );
    }

    function estimateMessageSize(chatMessage) {
        return 200;
    }

    function scrollFlashListToEnd(animated) {
        if (chatListRef && chatListRef.current) {
            try {
                // chatListRef.current.scrollToEnd({
                //     animated: animated ?? true,
                // });
            } catch (error) {
                console.log('Unable to scroll the message to end');
            }
        }
    }

    function renderChatMessagesV2() {

        const animation = useRef(null);
        useEffect(() => {
            animation.current?.play();
        }, []);

        // Calculate dynamic padding based on banner visibility
        // Since FlashList is inverted: paddingTop affects visual bottom, paddingBottom affects visual top
        // Add extra padding when banner is visible to allow proper scrolling to older messages
        const hasBanner = showPinnedOrder && getActiveOrders && getActiveOrders.length > 0;
        const bannerPaddingTop = hasBanner ? 50 : 0;
        const bannerPaddingBottom = hasBanner ? 90 : 40; // Extra padding at visual top to allow scrolling to older messages when banner is visible

        return (
            <View
                style={{
                    flex: 1,
                }}>
                <chatContext.Consumer>
                    {({ state, actions }) => {
                        return (
                            <FlashList
                                keyboardShouldPersistTaps={Platform.OS === 'ios' ? 'never' : 'always'}
                                inverted={true}
                                ref={chatListRef}
                                data={[...(state?.chatmessages ?? [])].reverse()}
                                estimatedItemSize={estimateMessageSize()}
                                scrollEnabled={true}
                                nestedScrollEnabled={true}
                                contentContainerStyle={{
                                    paddingTop: 50 + bannerPaddingTop,
                                    paddingBottom: bannerPaddingBottom,
                                }}
                                showsVerticalScrollIndicator={true}
                                overScrollMode="always"


                                renderItem={({ item, index }) => {

                                    const isOrderReceipt = !!ORDER_STATUS_CONFIG[item?.type];
                                    return (
                                        <>
                                            <View>
                                                {isOrderReceipt ? (
                                                    <OrderReceiptMessage data={item} onViewDetails={onViewDetails} />
                                                ) : (
                                                    <ChatBubble
                                                        chatMessage={item}
                                                        hasBookmark={
                                                            bookmarkList.findIndex(bookmarkItem => {
                                                                if (bookmarkItem.chatMessageId === item?._id) {
                                                                    return 1;
                                                                }
                                                                return 0;
                                                            }) >= 0
                                                        }
                                                        hasNote={
                                                            notesList.findIndex(noteItem => {
                                                                if (noteItem.chatMessageId === item?._id) {
                                                                    return 1;
                                                                }
                                                                return 0;
                                                            }) >= 0
                                                        }
                                                        onLongPress={(x, y, height, width, event) => {
                                                            const locationY =
                                                                event.nativeEvent.pageY >= Dimensions.get('screen').height / 2
                                                                    ? event.nativeEvent.pageY - 250
                                                                    : event.nativeEvent.pageY - 50;
                                                            setChatOptionsTop(locationY);
                                                            setChatOptionsRight(60);
                                                            setSelectedChatMessage(item);
                                                            return;
                                                        }}
                                                        integrationItem={props.route?.params?.integrationItem}
                                                        onListItemSendMessage={message => {
                                                            scrollRef?.current?.scrollToTop?.({ animated: true });
                                                            chat?.actions?.sendChatMessage(
                                                                message,
                                                                'TEXT',
                                                                props?.route?.params?.integrationItem?._id,
                                                                {},
                                                                {},
                                                            );
                                                            scrollRef?.current?.scrollToTop?.({ animated: true });
                                                            scrollFlashListToEnd();
                                                        }}
                                                        onQuickActionPress={actionItem => {
                                                            if (actionItem.type === 'CALL_TO_ACTION') {
                                                                Linking.canOpenURL(actionItem.actionApi)
                                                                    .then(result => {
                                                                        Linking.openURL(actionItem.actionApi);
                                                                    })
                                                                    .catch(error => {
                                                                        console.log(error);
                                                                    });
                                                            } else {
                                                                scrollFlashListToEnd();
                                                                scrollRef?.current?.scrollToTop?.({
                                                                    animated: true,
                                                                });
                                                                chat?.actions?.sendChatMessage(
                                                                    actionItem.title,
                                                                    'TEXT',
                                                                    props?.route?.params?.integrationItem?._id,
                                                                    {},
                                                                    {
                                                                        ...actionItem,
                                                                        repliedMessageUUID: item.uuid,
                                                                    },
                                                                );
                                                                scrollRef?.current?.scrollToTop?.({
                                                                    animated: true,
                                                                });
                                                                markActionPostedApiCall(item.uuid, actionItem.title);
                                                            }
                                                        }}
                                                        navigation={props.navigation}
                                                    />
                                                )}
                                            </View>

                                            {index === 0 &&
                                                state.typingIntegration === props?.route?.params?.integrationItem?._id && (
                                                    <View
                                                        style={{
                                                            height: 40,
                                                            width: 80,
                                                            marginLeft: 32,
                                                            borderBottomRightRadius: 10,
                                                            borderBottomLeftRadius: 10,
                                                            borderTopRightRadius: 10,
                                                            paddingBottom: 16,
                                                        }}>
                                                        <TypingIndicator />
                                                    </View>
                                                )}
                                        </>
                                    );
                                }}


                            />

                        );
                    }}
                </chatContext.Consumer>


            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#ecf0fc' }}>
            <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
            <View
                style={{
                    flex: 1,
                    // marginTop: 68,
                }}>

                <KeyboardAvoidingView
                    key={Platform.OS === 'android' ? `kav-${kavKey}` : 'kav-ios'}
                    enabled={true}
                    behavior={Platform.OS === 'ios' ? 'position' : 'height'}
                    keyboardVerticalOffset={0}
                    style={{ flex: 1 }}>
                    <View style={{ flex: 1, paddingTop: showPinnedOrder && getActiveOrders && getActiveOrders.length > 0 ? 116 : 90 }}>
                        <View
                            style={{
                                flex: 1,
                            }}>
                            {renderChatMessagesV2()}
                        </View>

                        <AttachementSheet
                            isOpen={isOpen}
                            toggleHeightFlow={Platform.OS === 'ios' ? chatInputHeight + 20 : chatInputHeight}
                            onClose={() => setIsOpen(false)}
                            onCamera={() => {
                                setIsOpen(false);
                                launchCamera({
                                    mediaType: 'mixed',
                                    cameraType: 'back',
                                    includeBase64: true,
                                })
                                    .then(response => {
                                        let _assets = response.assets;
                                        if (_assets?.length) {
                                            handleDocFile(_assets?.[0]);
                                        }
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                            }}
                            onDocument={async () => {
                                setIsOpen(false);
                                try {
                                    const [file] = await pick({
                                        type: ['*/*'],
                                        presentationStyle: 'fullScreen'
                                    });

                                    if (file) {
                                        const fileInfo = await RNFS.stat(file.uri);
                                        const asset = {
                                            uri: file.uri,
                                            type: file.type || 'application/octet-stream',
                                            fileSize: fileInfo.size,
                                            fileName: file.name || 'document',
                                            height: 0,
                                            width: 0
                                        };
                                        handleDocFile(asset);
                                    }
                                } catch (error) {
                                    if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
                                        console.log('Document picker error:', error);
                                    }
                                }
                            }}
                            onVideo={() => {
                                setIsOpen(false);
                                launchImageLibrary({
                                    mediaType: 'video',
                                    selectionLimit: 1,
                                    videoQuality: 'medium',
                                    includeBase64: true,
                                })
                                    .then(response => {
                                        let _assets = response.assets;
                                        handleDocFile(_assets[0]);
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                            }}
                            onGallery={() => {
                                setIsOpen(false);
                                launchImageLibrary({
                                    mediaType: 'photo',
                                    selectionLimit: 1,
                                    videoQuality: 'medium',
                                    includeBase64: true,
                                })
                                    .then(response => {
                                        let _assets = response.assets;
                                        handleDocFile(_assets[0]);
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                            }}
                        />

                        <View
                            onLayout={event => {
                                const { height } = event.nativeEvent.layout;
                                setChatInputHeight(height);
                            }}
                            style={{
                                flexDirection: 'row',
                                backgroundColor: colors.backgroundWhite,
                                zIndex: 1000,
                                paddingHorizontal: 8,
                                paddingTop: 8,
                                paddingBottom: Platform.OS === 'ios' ? 30 : Math.max(insets.bottom, 8),
                            }}>
                            {isIntegrationBlocked === true && (
                                <Text
                                    style={{
                                        fontSize: 14,
                                        textAlign: 'center',
                                        marginTop: 8,
                                        marginBottom: 8,
                                        marginLeft: 16,
                                        marginRight: 16,
                                        fontWeight: '400',
                                        color: colors.textColorGray,
                                    }}>
                                    This Business is blocked. Please unblock to send messages.
                                </Text>
                            )}
                            {!isIntegrationBlocked && (
                                <View
                                    onLayout={event => {
                                        const { height } = event.nativeEvent.layout;
                                        setChatInputHeight(height);
                                    }}
                                    style={{
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        flex: 5,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: '#ECEBEB',
                                        backgroundColor: colors.backgroundWhite,
                                        maxHeight: 90,
                                        paddingHorizontal: 8,
                                        paddingRight: 16,
                                    }}>
                                    <Input
                                        borderColor={'transparent'}
                                        backgroundColor={'transparent'}
                                        borderWidth={0}
                                        borderRadius={50}
                                        underlineColorAndroid={'transparent'}
                                        style={{
                                            borderColor: colors.merchantChatBubble,
                                            borderRadius: 50,
                                            minHeight: 30,
                                            fontSize: 16,
                                            paddingRight: 25,
                                        }}
                                        multiline={true}
                                        placeholder="Message"
                                        value={chatMessage}
                                        onChangeText={text => {
                                            setChatMessage(text);
                                        }}
                                    />
                                    <TouchableOpacity
                                        style={{
                                            position: 'absolute',
                                            right: 20,
                                        }}
                                        onPress={() => {
                                            setIsOpen(!isOpen);
                                        }}>
                                        <MaterialCommunityIcon
                                            name="attachment"
                                            style={{ fontSize: 24, color: '#8E8E93' }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {!isIntegrationBlocked && (
                                <View style={{ flex: 1, marginLeft: 0, alignItems: 'flex-end' }}>
                                    <TouchableOpacity
                                        style={{}}
                                        onPress={() => {
                                            if (!documentLoading && chatMessage?.trim?.() !== '') {
                                                scrollFlashListToEnd();
                                                scrollRef?.current?.scrollToTop?.({ animated: true });
                                                chat.actions.sendChatMessage(
                                                    chatMessage,
                                                    'TEXT',
                                                    props?.route?.params?.integrationItem?._id,
                                                );
                                                setChatMessage('');
                                                scrollRef?.current?.scrollToTop?.({ animated: true });
                                            }
                                        }}>
                                        <View
                                            style={{
                                                height: 40,
                                                width: 40,
                                                borderRadius: 50,
                                                backgroundColor: colors.userChatBubble,
                                                right: 8,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                // left: 0,
                                            }}>
                                            {!documentLoading && (
                                                <FAIcon
                                                    style={{ fontSize: 16, color: 'white' }}
                                                    name="send"
                                                />
                                            )}
                                            {documentLoading && <ActivityIndicator color="white" />}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>

                {!!chatOptionsTop && !!chatOptionsRight && (
                    <ChatBubbleOptions
                        chatMessageType={selectedChatMessage?.type}
                        onCopyMessage={() => {
                            console.log(
                                '🚀 ~ ChatScreen ~ selectedChatMessage:',
                                selectedChatMessage,
                            );
                            Clipboard.setString(selectedChatMessage?.message);
                            setChatOptionsTop(undefined);
                            setSuccessCopiedMessage('Message copied successfully');
                            setTimeout(() => {
                                setSuccessCopiedMessage(undefined);
                            }, 1500);
                        }}
                        onEditNote={() => {
                            setShowNote(true);
                            const noteIndex = notesList.findIndex(noteItem => {
                                if (noteItem.chatMessageId === selectedChatMessage?._id) {
                                    return 1;
                                }
                                return 0;
                            });
                            setNoteToEdit({ ...notesList[noteIndex] });
                            setChatOptionsTop(undefined);
                            setChatOptionsRight(undefined);
                        }}
                        onNewBookmark={newBookmarkFunc}
                        onDeleteNote={noteId => {
                            setChatOptionsTop(undefined);
                            setChatOptionsRight(undefined);
                            setSelectedNoteIdToDelete(noteId);
                        }}
                        onClose={() => {
                            setChatOptionsTop(undefined);
                            setChatOptionsRight(undefined);
                        }}
                        existingBookmarkId={getBookmarkIdByChatMessageId(
                            selectedChatMessage?._id,
                        )}
                        existingNoteId={getNoteIdByChatMessageId(selectedChatMessage?._id)}
                        onNewNote={() => {
                            setShowNote(true);
                            setChatOptionsTop(undefined);
                            setChatOptionsRight(undefined);
                        }}
                        top={chatOptionsTop}
                        onDeleteBookmark={bookmarkId => {
                            setSelectedBookmarkIdToDelete(bookmarkId);
                            setChatOptionsRight(undefined);
                            setChatOptionsTop(undefined);
                        }}
                        right={chatOptionsRight}
                    />
                )}
                {!!selectedChatMessage && showNote && (
                    <MessageNoteForm
                        defaultNote={noteToEdit}
                        onClose={() => {
                            setShowNote(false);
                            setNoteToEdit(undefined);
                        }}
                        onSave={async note => {
                            try {
                                if (noteToEdit) {
                                    await editNote(
                                        selectedChatMessage._id,
                                        selectedChatMessage.chatRoom,
                                        note,
                                        noteToEdit._id,
                                    );
                                    setNoteToEdit(undefined);
                                } else {
                                    await addNewMessageNote(
                                        selectedChatMessage._id,
                                        selectedChatMessage.chatRoom,
                                        note,
                                    );
                                }
                                setShowNote(false);
                                dispatch(
                                    getMessageNotesForChatRoom(
                                        props?.route?.params?.integrationItem?.chatRoomId,
                                    ),
                                );
                            } catch (error) {
                                console.log(error);
                                alert('Unable to save the note at the moment');
                            }
                        }}
                        integrationName={
                            props.route?.params?.integrationItem?.integrationName
                        }
                        message={selectedChatMessage.message}
                    />
                )}
                {!!selectedNoteIdToDelete && (
                    <ConfirmationPopup
                        title={'Delete Note'}
                        subTitle={'Do you really want to delete this note?'}
                        onCancel={() => {
                            setSelectedNoteIdToDelete(false);
                        }}
                        onSave={() => {
                            deleteExistingNote(selectedNoteIdToDelete);
                        }}
                    />
                )}
                {!!selectedBookmarkIdToDelete && (
                    <ConfirmationPopup
                        title={'Delete Bookmark'}
                        subTitle={'Do you really want to delete this bookmark?'}
                        onCancel={() => {
                            setSelectedBookmarkIdToDelete(undefined);
                        }}
                        onSave={deleteExistingBookmark}
                    />
                )}
                {!!selectedIntegrationToBlock && (
                    <ConfirmationPopup
                        title={isIntegrationBlocked ? 'Unblock Business' : 'Block Business'}
                        subTitle={`Are you sure, you want to ${isIntegrationBlocked ? 'unblock' : 'block'
                            } this business?`}
                        onCancel={() => {
                            setSelectedIntegrationToBlock(undefined);
                        }}
                        yesText={isIntegrationBlocked ? 'Unblock' : 'Block'}
                        onSave={() => {
                            if (isIntegrationBlocked) {
                                //call the unblock business
                                unblockThisBusiness();
                                return;
                            }
                            blockThisBusiness();
                        }}
                    />
                )}
            </View>
            <View
                style={{
                    position: 'absolute',
                    width: '100%',
                    // zIndex: 10 
                }}>
                <SafeAreaView style={{ backgroundColor: colors.backgroundWhite }}>
                    <ChatHeader
                        isFromQrCode={props.isFromQrCode}
                        onOptionsPressed={() => {
                            setShowChatHeaderOptions(!showChatHeaderOptions);
                        }}
                        navigation={props.navigation}
                        chatRoomId={chatRoomId}
                        onSearchChange={text => {
                            setSearchText(text);
                        }}
                        integrationItem={props.route?.params?.integrationItem}
                        isCatalogueEnabled={isCatalogueEnabled}
                    />
                    {showPinnedOrder && getActiveOrders && getActiveOrders.length > 0 && (
                        <PinnedOrderBanner
                            activeOrders={getActiveOrders}
                            onViewDetails={onViewDetails}
                            onClose={() => {
                                const currentOrderId = getActiveOrders[0]?.orderId ||
                                    extractOrderIdFromMessage(getActiveOrders[0]?.message);
                                if (currentOrderId) {
                                    setDismissedOrderIds(prev => new Set([...prev, currentOrderId]));
                                }
                                // If no more orders, hide banner
                                if (getActiveOrders && getActiveOrders.length <= 1) {
                                    setShowPinnedOrder(false);
                                }
                            }}
                        />
                    )}
                </SafeAreaView>
            </View>
            {showChatHeaderOptions && (

                <ChatHeaderOptions
                    onBlockBusiness={() => {
                        setShowChatHeaderOptions(false);
                        setSelectedIntegrationToBlock(
                            props?.route?.params?.integrationItem?._id,
                        );
                    }}
                    onCancel={() => {
                        setShowChatHeaderOptions(false);
                    }}
                    onViewNotesPressed={goToNotesScreen}
                    onViewBookmarksPressed={goToBookmarksScreen}
                    isBusinessBlocked={isIntegrationBlocked}
                />
            )}
            <SuccessToast
                displayToast={!!successCopiedMessage}
                message={successCopiedMessage}
            />

        </View>
    );
}

export default ChatScreen;
