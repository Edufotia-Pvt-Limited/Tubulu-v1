import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image, FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";
import {getNotesDetailsByChatRoomId} from "../Utils/ApiActions";
import {colors} from "../Utils/Colors";
import moment from "moment";

function NotesItem({noteMessage, chatMessage, time, senderText}) {
    return (
        <View style={{
            marginLeft: 10,
            marginRight: 10,
            marginTop: 12,
        }}>
            <View style={{flexDirection: 'row'}}>
                <Text style={{
                    fontSize: 13,
                    fontStyle: 'normal',
                    fontWeight: '700',
                    flex: 1,
                    color: '#000e4d4d'
                }}>{senderText}</Text>
                <Text style={{
                    color: '#000e4d4d',
                    fontWeight: '400',
                    fontSize: 13
                }}>{time}</Text>
            </View>
            <View style={{
                marginTop: 8,
                borderTopRightRadius: 12,
                backgroundColor: '#FFF6C8',
                borderLeftWidth: 3,
                borderLeftColor: '#FFC93E',
                paddingLeft: 16,
                paddingTop: 16,
                paddingBottom: 16

            }}>
                <Text style={{
                    color: '#84793F',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    fontSize: 16
                }}>
                    {chatMessage}
                </Text>
            </View>
            <View style={{
                backgroundColor: colors.backgroundWhite,
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 10,
                paddingRight: 16,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 12,
            }}>
                <Text style={{
                    color: 'black',
                    fontWeight: '400',
                    fontSize: 12,

                }}>{noteMessage}</Text>
            </View>
        </View>
    )
}

export function ViewNotesScreen({navigation, route}) {

    const integrationItem = route?.params?.integrationItem;
    const chatRoomId = route?.params?.chatRoomId;

    const [notes, setNotes] = useState([]);

    useEffect(() => {
        getNotes();
    }, [])

    async function getNotes() {
        try {
            const response = await getNotesDetailsByChatRoomId(chatRoomId);
            if (response.success) {
                const chatMessagesNotes = [];
                response.data.forEach(item => {
                    console.log(item)
                    chatMessagesNotes.push({...item.chatMessage[0], noteMessage: item.noteMessage});
                })
                setNotes(chatMessagesNotes);
            }
        } catch (error) {
            console.log(`Unable to get the notes ${error.message}`);
        }
    }

    function renderHeader() {
        return (
            <View
                style={{
                    backgroundColor: colors.backgroundWhite,
                    height: 120,
                }}
            >
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{justifyContent: 'center', alignItems: 'center', paddingLeft: 8, paddingRight: 8}}>
                        <TouchableOpacity onPress={navigation.goBack}>
                            <Icon name='arrow-back' style={{color: '#2355C4', fontSize: 24}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{justifyContent: 'center'}}>
                        <Image
                            style={{height: 40, width: 40, borderRadius: 50,}}
                            source={{uri: integrationItem?.logo}}
                        />
                    </View>
                    <View style={{
                        flex: 1,
                        paddingLeft: 12,
                        alignItems: 'flex-start',
                        justifyContent: 'center'
                    }}>
                        <Text style={{
                            fontFamily: 'NotoSans',
                            fontSize: 16,
                            fontWeight: '400',
                            color: colors.primaryTextColor,
                        }}>{integrationItem?.integrationName}</Text>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '400',
                            color: '#8E8E93'
                        }}>Business Account</Text>
                    </View>
                </View>
                  </SafeAreaView>
            </View>
        )
    }

    function renderNotesList() {
        if (notes.length) {
            return (
                <View style={{ paddingBottom: 140}}>
                    <FlatList data={notes} renderItem={({item, index}) => {
                        console.log(item);
                        return (
                            <NotesItem
                                chatMessage={item.message}
                                noteMessage={item.noteMessage}
                                time={moment(item.createdAt).format('DD MMM')}
                                senderText={item.messageByIntegration ? integrationItem.integrationName : 'You'}
                            />
                        )
                    }}/>
                </View>
            )
        }
        return null;
    }

    return (
        <View style={{
            flex: 1,
            backgroundColor: '#EBF0FD',
        }}>
            
                {renderHeader()}
                {renderNotesList()}
          
        </View>
    )
}
