import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    // SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FAIcon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import ChatBubble from '../Components/ChatBubble';
import ISTextInput from '../Components/ISTextInput';
import { GetChatMessages } from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';

function ChatSearchHeader() {
    return (
        <View
            style={{
                backgroundColor: colors.backgroundWhite,
                borderBottomColor: colors.primaryColor,
                borderBottomWidth: 6,
                maxHeight: 64,
                flex: 1,
            }}>
            <SafeAreaView />
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Text
                    style={{
                        fontFamily: 'NotoSans',
                        fontSize: 24,
                        color: colors.primaryTextColor,
                        fontWeight: 'bold',
                    }}>
                    Search Messages
                </Text>
            </View>
        </View>
    );
}

function SearchMessage({ date, by, message, integrationName }) {
    const _timeZone = moment.tz.guess();
    return (
        <View
            style={{
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.textGrey,
                marginLeft: 16,
                paddingTop: 16,
            }}>
            <View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                {by === 'integration' ? (
                    <Text style={{ color: 'black', fontSize: 14, fontWeight: '400' }}>
                        {integrationName}
                    </Text>
                ) : (
                    <Text>{'User'}</Text>
                )}
                <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 16 }}>
                    <Text
                        style={{
                            color: colors.textGrey,
                            fontSize: 12,
                        }}>
                        {moment(date).tz(_timeZone).format('DD, MMM  hh:mm A')}
                    </Text>
                </View>
            </View>
            <Text
                style={{
                    marginTop: 8,
                    color: 'black',
                    fontSize: 14,
                    fontStyle: 'normal',
                }}>
                {message}
            </Text>
        </View>
    );
}

function ChatSearch(props) {
    const [displayLoading, setDisplayLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState('');
    const [online, isOnline] = useState(false);

    const userMessages = useSelector(state => state.chatState.userMessages);

    const { chatRoomId, chatRoomName, integrationItem } = props.route.params;

    useEffect(() => {
        NetInfo.addEventListener(state => {
            isOnline(state.isConnected);
            state.isConnected == false && setMessages(userMessages);
        });
    }, []);

    useEffect(() => {
        if (search?.trim() !== '') {
            if (online) {
                getChatMessages();
            } else {
                searchChatMessages();
            }
        }
    }, [search, online]);

    function getChatMessages() {
        setDisplayLoading(true);
        GetChatMessages(chatRoomId, search)
            .then(response => {
                setDisplayLoading(false);
                setMessages(response.data);
            })
            .catch(error => {
                setDisplayLoading(false);
                Alert.alert('Unable to get the search messages at the moment');
            });
    }

    function searchChatMessages() {
        setDisplayLoading(true);
        const _searchMessageResponse = userMessages?.filter(item =>
            item?.message?.toLowerCase()?.includes(search?.toLowerCase()?.trim?.()),
        );
        if (_searchMessageResponse?.length) {
            setDisplayLoading(false);
            setMessages(_searchMessageResponse);
        }
    }

    return (
        <View
            style={{ flex: 1, backgroundColor: '#ecf0fc', flexDirection: 'column' }}>
            <SafeAreaView style={{ backgroundColor: colors.backgroundWhite }} />
            <View
                style={{
                    paddingTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 16,
                    paddingBottom: 8,
                    backgroundColor: colors.backgroundWhite,
                }}>
                <TouchableOpacity
                    onPress={() => {
                        props.navigation.goBack();
                    }}>
                    <IonIcon
                        name="arrow-back"
                        style={{
                            fontSize: 20,
                            color: colors.textBlueColor,
                        }}
                    />
                </TouchableOpacity>
                <View
                    style={{
                        paddingHorizontal: 8,
                        flex: 1,
                    }}>
                    <ISTextInput
                        autoFocus={true}
                        placeholder={'Search...'}
                        value={search}
                        borderWidth={1}
                        leftIcon={<FAIcon name={'search'} style={{ fontSize: 22 }} />}
                        onChangeText={text => {
                            //TODO: Debounce the search
                            setSearch(text);
                        }}
                    />
                </View>
            </View>
            <View
                style={{
                    marginTop: 8,
                    flex: 1,
                }}>
                <View
                    style={{
                        marginTop: 8,
                        flex: 1,
                    }}>
                    {messages.length <= 0 ? (
                        <View
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: '400',
                                    paddingHorizontal: 16,
                                    textAlign: 'center',
                                    color: colors.textGrey,
                                }}>
                                Search for messages with {chatRoomName}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={messages}
                                renderItem={
                                    ({ item, index }) => {
                                        return (
                                            <ChatBubble
                                                chatMessage={item}
                                                integrationItem={integrationItem}
                                            />
                                        );
                                    }
                                    // <SearchMessage integrationName={chatRoomName} by={item.messageByIntegration ? 'integration' : 'user'} date={item.createdAt} message={item.message} />
                                }
                            />
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}

ChatSearch.propTypes = {
    chatRoomId: PropTypes.string.isRequired,
    chatRoomName: PropTypes.string.isRequired,
};

export default ChatSearch;
