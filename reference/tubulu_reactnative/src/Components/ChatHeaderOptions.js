import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../Utils/Colors';

export default function ChatHeaderOptions({
    onBlockBusiness,
    onCancel,
    isBusinessBlocked,
    onViewBookmarksPressed,
    onViewNotesPressed,
}) {
    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onCancel}
            style={{
                height: '100%',
                width: '100%',
                backgroundColor: '#00000044',
                position: 'absolute',
                top: 40,
                left: 0,
            }}>
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    borderRadius: 10,
                    width: 200,
                    backgroundColor: colors.backgroundWhite,
                    position: 'absolute',
                    right: 8,
                    top: Platform.OS === 'ios' ? 60 : 20,
                    padding: 10,
                    paddingBottom: 8,
                }}>
                <TouchableOpacity
                    onPress={onViewBookmarksPressed}
                    style={{
                        flexDirection: 'row',
                        height: 45,
                        borderBottomColor: '#00000022',
                        borderBottomWidth: 1,
                        alignItems: 'center',
                    }}>
                    <FontAwesome
                        name={'bookmark'}
                        style={{ fontSize: 16, color: '#2355C4' }}
                    />
                    <Text
                        style={{
                            marginLeft: 8,
                            fontSize: 16,
                            fontWeight: '400',
                            color: '#2355C4',
                        }}>
                        {'View Bookmarks'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onViewNotesPressed}
                    style={{
                        flexDirection: 'row',
                        height: 45,
                        borderBottomColor: '#00000022',
                        borderBottomWidth: 1,
                        alignItems: 'center',
                    }}>
                    <FontAwesome
                        name={'sticky-note'}
                        style={{ fontSize: 16, color: '#2355C4' }}
                    />
                    <Text
                        style={{
                            marginLeft: 8,
                            fontSize: 16,
                            fontWeight: '400',
                            color: '#2355C4',
                        }}>
                        {'View Notes'}
                    </Text>
                </TouchableOpacity>
                <View
                    style={{
                        flexDirection: 'row',
                        height: 45,
                        borderBottomColor: '#00000022',
                        borderBottomWidth: 1,
                        alignItems: 'center',
                    }}>
                    <FontAwesome
                        name={'sticky-note'}
                        style={{ fontSize: 16, color: '#2355C4' }}
                    />
                    <Text
                        style={{
                            marginLeft: 8,
                            fontSize: 16,
                            fontWeight: '400',
                            color: '#2355C4',
                        }}>
                        {'All Media'}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={onBlockBusiness}
                    style={{
                        flexDirection: 'row',
                        height: 45,
                        borderBottomColor: '#00000022',
                        borderBottomWidth: 0,
                        alignItems: 'center',
                    }}>
                    <MaterialCommunityIcon
                        name={'cancel'}
                        style={{ fontSize: 16, color: colors.errorRed }}
                    />
                    <Text
                        style={{
                            marginLeft: 8,
                            fontSize: 16,
                            fontWeight: '400',
                            color: colors.errorRed,
                        }}>
                        {isBusinessBlocked ? 'Unblock Business' : 'Block Business'}
                    </Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}
