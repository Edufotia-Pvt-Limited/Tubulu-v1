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
import {QTMformattedDateV3} from '../../Utils/Helper';
import {getStatus} from '../../Utils/QTMHelper';
import {QTMPieChart} from './QTMCommonComponents';
import {getChartData} from './QTMTaskCard';

interface QTMTaskCardProps {
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

export function QTMTaskCardV3({
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
}: QTMTaskCardProps): JSX.Element {
  const width = useWindowDimensions().width / 2 - 20;
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        ...styles.container,
        shadowColor:
          overdue !== undefined && overdue > 0
            ? '#E03131'
            : 'rgba(0, 0, 0, 0.8)',
        width: fullMode ? width : 157,
        borderWidth: selected
          ? 1
          : overdue !== undefined && overdue > 0
          ? 0.3
          : 0,
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
          <Text
            ellipsizeMode="tail"
            allowFontScaling={false}
            numberOfLines={2}
            style={styles.topicText}>
            {name}
          </Text>
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
            position: 'absolute',
            top: 50,
            height: 75,
          }}>
          <View
            style={{
              backgroundColor: overdue
                ? colors.cancelledRed
                : colors.completedGreen,
              alignItems: 'center',
              borderRadius: 4,
              paddingHorizontal: 4,
              marginBottom: 2,
              // width: overdue ? 60 : 40,
              height: 24,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                color: '#FFFFFF',
                fontSize: 12,
                paddingVertical: 4,
                fontWeight: '400',
              }}>
              {getStatus(overdue, data)}
            </Text>
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 2,
              width: 80,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#727272',
              }}>
              {QTMformattedDateV3(createdAt)}
            </Text>
            <View
              style={{
                flexDirection: 'row',
              }}>
              {subTasks !== undefined && subTasks > 0 && (
                <Text
                  allowFontScaling={false}
                  style={styles.text}>{`${subTasks} Subtask`}</Text>
              )}
              {overdue !== undefined && overdue > 0 && (
                <Text
                  allowFontScaling={false}
                  style={{
                    color: colors.errorRed,
                    fontSize: 10,
                    fontWeight: '400',
                  }}>
                  {`${overdue} Overdue`}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          right: 4,
          bottom: 4,
        }}>
        {data && <QTMPieChart size={90} data={getChartData(data)} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundWhite,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    height: 141,
    borderRadius: 8,
    paddingLeft: 10,
    elevation: 5,
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
    fontSize: 16,
    fontWeight: '700',
    width: 120,
    color: colors.titleBlackColor,
    marginBottom: 1,
    flexWrap: 'wrap',
  },
  text: {
    fontWeight: '400',
    fontSize: 10,
    color: colors.textColorGray,
    marginRight: 2,
  },
});
