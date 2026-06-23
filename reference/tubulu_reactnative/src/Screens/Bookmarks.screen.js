import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image, FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {colors} from "../Utils/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import {getBookmarksDetailsByChatroomId} from "../Utils/ApiActions";
import FAIcon from "react-native-vector-icons/FontAwesome";
import moment from "moment";

function BookMarkItem({messageText, messageSender, time}) {
    return (
        <View style={{marginTop: 16, marginLeft: 10, marginRight: 10,}}>
            <View style={{
                flexDirection: 'row'
            }}>
                <FAIcon name={'sticky-note'} style={{fontSize: 12, color: '#000e4d4d'}}/>
                <Text style={{
                    fontSize: 11,
                    marginLeft: 8,
                    fontWeight: '400',
                    fontStyle: 'normal',
                    color: '#000e4d4d',
                    flex: 1,
                }}>{messageSender}</Text>
                <Text style = {{
                    color: '#000e4d4d',
                    fontStyle: 'normal',
                    fontSize: 11,
                }}>{time}</Text>
            </View>
            <View style={{
                marginTop: 8,
                paddingHorizontal: 16,
                paddingVertical: 16,
                backgroundColor: colors.backgroundWhite,
                borderRadius: 8
            }}>
                <Text style = {{
                    color: 'black',
                    fontSize: 15,
                    fontWeight: '400',
                    fontStyle: 'normal'
                }}>{messageText}</Text>
            </View>
        </View>
    )
}

export function BookmarksScreen({navigation, route}) {

    const [bookMarks, setBookmarks] = useState([]);

    const integrationItem = route?.params?.integrationItem;
    const chatRoomId = route?.params?.chatRoomId ?? undefined;

    useEffect(() => {
        getBookmarkDetails();
    }, []);

    async function getBookmarkDetails() {
        try {
            const response = await getBookmarksDetailsByChatroomId(chatRoomId);
            if (response.success) {
                const bookmarkList = response.data;
                const resultBookmarkList = [];
                bookmarkList.forEach(item => {
                    resultBookmarkList.push(item.chatMessages[0]);
                })
                console.log(`The book mark details::`);
                console.log(resultBookmarkList);
                setBookmarks(resultBookmarkList);
            }
        } catch (error) {
            console.log(`Error occurred for chat room, ${error.message}`);
        }
    }

    function renderBookmarkList() {
        if (bookMarks.length) {
            return (
                <View style={{ paddingBottom: 140}}>
                    <FlatList data={bookMarks} renderItem={({item, index}) => {
                        return (
                            <View>
                                <BookMarkItem
                                    time = {moment(item.createdAt).format('DD MMM')}
                                    messageSender={item.messageByIntegration ? integrationItem.integrationName : 'You'}
                                    messageText={item.message}/>
                            </View>
                        )
                    }}/>
                </View>
            )
        }
        return null;
    }

    function renderHeader() {
        return (
            <View style={{
                backgroundColor: colors.backgroundWhite,
                height: 120,
            }}>
                  <SafeAreaView style={{flex: 1}} edges={['top']}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{justifyContent: 'center', alignItems: 'center', paddingLeft: 8, paddingRight: 8}}>
                        <TouchableOpacity onPress={() => {
                            navigation.goBack();
                        }}>
                            <Icon name='arrow-back' style={{color: '#2355C4', fontSize: 24}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{justifyContent: 'center'}}>
                        <Image
                            style={{height: 40, width: 40, borderRadius: 50,}}
                            source={{uri: integrationItem?.logo}}/>
                    </View>
                    <View style={{
                        flex: 1,
                        paddingLeft: 12,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                    }}>
                        <Text style={{
                            fontFamily: "NotoSans",
                            fontSize: 16,
                            fontWeight: '400',
                            color: colors.primaryTextColor
                        }}>
                            {integrationItem?.integrationName}
                        </Text>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '400',
                            color: '#8E8E93',
                        }}>Business Account</Text>
                    </View>
                </View>
                </SafeAreaView>
            </View>
        )
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#ecf0fc', 
                   
            }}>
          
                {renderHeader()}
                {renderBookmarkList()}
        </View>
    );
}
