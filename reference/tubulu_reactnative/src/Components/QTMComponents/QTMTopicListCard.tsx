import React from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../Utils/Colors';
import {IQTMUserTopics} from '../../models/IQTM';

interface Props {
  readonly topic: IQTMUserTopics;
  readonly onPress: () => void;
  readonly onPressMenu: (event: GestureResponderEvent) => void;
}

export function QTMTopicListCard({
  topic,
  onPress,
  onPressMenu,
}: Props): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        height: 37,
        width: Dimensions.get('screen').width - 30,
        // borderWidth: 0.3,
        borderRadius: 5,
        borderColor: colors.inputBorderGrey,
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13,
        shadowColor: 'rgba(0, 0, 0, 0.8)',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        backgroundColor: colors.backgroundWhite,
      }}>
      <View
        style={{
          borderRadius: 50,
          borderWidth: 0.5,
          borderColor: colors.titleBlackColor,
          flex: 0,
        }}>
        <Image
          style={{height: 24, width: 24, borderRadius: 50}}
          source={{uri: topic?.logo}}
        />
      </View>
      <View style={{flex: 2, marginHorizontal: 12}}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.titleBlackColor,
            maxWidth: 100,
          }}>
          {topic?.title}
        </Text>
      </View>
      <View style={{flexGrow: 0.2, flexDirection: 'row', alignItems: 'center'}}>
        {topic?.taskCount !== undefined &&
          topic?.taskCount > 0 &&
          topic.taskCount !== undefined && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '400',
                color: '#8A8A8E',
              }}>{`Total ${topic?.taskCount} task`}</Text>
          )}
        {topic?.dueSubTasks !== undefined &&
          topic?.dueSubTasks > 0 &&
          topic?.dueSubTasks !== undefined && (
            <Text
              style={{
                fontSize: 14,
                color: colors.titleBlackColor,
                marginHorizontal: 2,
              }}>
              |
            </Text>
          )}
        {topic?.dueSubTasks !== undefined &&
          topic?.dueSubTasks > 0 &&
          topic?.dueSubTasks !== undefined && (
            <Text
              style={{
                color: colors.errorRed,
                fontSize: 12,
                fontWeight: '400',
              }}>
              {`${topic?.dueSubTasks} Overdue`}
            </Text>
          )}
      </View>
      <TouchableOpacity
        style={{position: 'absolute', right: 2, top: 6}}
        onPress={onPressMenu}>
        <MaterialCommunityIcons
          name="dots-vertical"
          size={24}
          color={colors.backgroundColorHeader}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
