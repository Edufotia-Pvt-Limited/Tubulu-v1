import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../Utils/Colors';

interface Props {
  onPress: () => void;
  unreadCount?: number;
}

export function QTMGroupChatButton({onPress, unreadCount}: Props): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        height: 70,
        width: 70,
        borderRadius: 50,
        elevation: 10,
        shadowColor: 'rgba(0, 0, 0, 0.8)',
        shadowOpacity: 0.8,
        shadowOffset: {width: 0, height: 0},
        shadowRadius: 3,
      }}>
      <Image
        style={{height: 68, width: 68, borderRadius: 50}}
        source={require('../../assets/qtm_group_chat.png')}
      />
      {unreadCount !== undefined && (
        <View
          style={{
            minWidth: 24,
            minHeight: 24,
            backgroundColor: colors.errorRed,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'absolute',
            alignSelf: 'flex-end',
          }}>
          <Text
            style={{
              color: colors.backgroundWhite,
              fontSize: 12,
              fontWeight: '700',
            }}>
            {unreadCount < 10
              ? `0${unreadCount}`
              : unreadCount > 99
              ? `99+`
              : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
