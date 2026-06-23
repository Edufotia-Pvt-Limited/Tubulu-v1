import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../Utils/Colors';
import {QTMformattedDate} from '../../Utils/Helper';
import {QTMPieChart} from './QTMCommonComponents';
import {getChartData} from './QTMTaskCard';

interface QTMTopicCardProps {
  fullMode?: boolean;
  name: string;
  createdAt: string;
  data: any;
  subTasks?: number;
  isPinned?: boolean;
  overdue?: number;
  showMenu: boolean;
  onPress: () => void;
  onPressMenu: (event: GestureResponderEvent) => void;
  selected?: boolean;
}

export function QTMTaskCardV2({
  fullMode,
  name,
  createdAt,
  data,
  showMenu,
  isPinned,
  subTasks,
  overdue,
  onPress,
  onPressMenu,
  selected,
}: QTMTopicCardProps): JSX.Element {
  const width = useWindowDimensions().width / 2 - 20;
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        ...styles.container,
        width: fullMode ? width : 157,
        borderWidth: selected ? 1 : 0.54,
        borderColor: selected
          ? colors.showMoreBlueColor
          : overdue !== undefined && overdue > 0
          ? '#E03131'
          : colors.inputBorderGrey,
      }}
      onPress={onPress}>
      <View style={{marginTop: 8}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
          <View style={{}}>
            <View
              style={{
                backgroundColor: overdue ? '#E03131' : '#0B8D00',
                alignItems: 'center',
                borderRadius: 4,
                paddingHorizontal: 4,
                marginBottom: 2,
                width: overdue ? 60 : 40,
              }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 12,
                  paddingVertical: 4,
                  fontWeight: '400',
                }}>
                {overdue ? 'Overdue' : 'Low'}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#727272',
              }}>
              {QTMformattedDate(createdAt)}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            {isPinned && (
              <TouchableOpacity style={{marginTop: 2}}>
                <Entypo
                  name="pin"
                  size={18}
                  color={colors.backgroundColorHeader}
                />
              </TouchableOpacity>
            )}
            {showMenu && (
              <Pressable onPress={onPressMenu}>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={24}
                  color={colors.backgroundColorHeader}
                />
              </Pressable>
            )}
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
          <View>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={styles.topicText}>
              {name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                width: 75,
                marginTop: 10,
              }}>
              {subTasks !== undefined && subTasks > 0 && (
                <Text style={styles.text}>{`${subTasks} Subtask`}</Text>
              )}
              {overdue !== undefined && overdue > 0 && (
                <Text
                  style={{
                    color: colors.errorRed,
                    fontSize: 12,
                    fontWeight: '400',
                  }}>
                  {`${overdue} Overdue`}
                </Text>
              )}
            </View>
          </View>
          <View style={{marginRight: 10}}>
            {data && <QTMPieChart size={90} data={getChartData(data)} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: 141,
    borderRadius: 8,
    paddingLeft: 10,
    margin: 10,
  },
  imageContainer: {
    height: 59,
    width: 59,
    borderRadius: 50,
    borderWidth: 0.54,
    borderColor: '#8A8A8E',
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadTextContainer: {
    backgroundColor: colors.errorRed,
    borderRadius: 113,
    height: 24,
    width: 24,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicText: {
    fontSize: 18,
    fontWeight: '700',
    width: 80,
    color: colors.titleBlackColor,
    marginBottom: 1,
  },
  text: {
    fontWeight: '400',
    fontSize: 14,
    color: colors.textColorGray,
  },
});
