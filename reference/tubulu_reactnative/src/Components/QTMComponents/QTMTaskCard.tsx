import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../Utils/Colors';
import {QTMChartData} from '../../models/IQTM';
import {QTMPieChart} from './QTMCommonComponents';

interface Props {
  readonly task: string;
  readonly topic: string;
  readonly data: any;
  readonly onPress: () => void;
  readonly onPressMenu: (event: GestureResponderEvent) => void;
}

export function getChartData(wattages: {
  cancelled: number;
  inProgress: number;
  completed: number;
}) {
  const _data: QTMChartData[] = [
    {
      name: 'Cancelled',
      value: wattages?.cancelled,
      color: colors.cancelledRed,
    },
    {
      name: 'In Progress',
      value: wattages?.inProgress,
      color: colors.inProgressYellow,
    },
    {
      name: 'Completed',
      value: wattages?.completed,
      color: colors.completedGreen,
    },
  ];
  return _data;
}

export function QTMTaskCard({
  task,
  topic,
  data,
  onPress,
  onPressMenu,
}: Props): JSX.Element {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={{
        borderRadius: 10,
        height: 73,
        borderWidth: 0.2,
        borderColor: colors.backgroundColorHeader,
        backgroundColor: colors.backgroundWhite,
        marginVertical: 11,
        paddingLeft: 17,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{color: '#8A8A8E', fontSize: 14, fontWeight: '400'}}>
            Task
          </Text>
          <Text
            style={{
              color: colors.titleBlackColor,
              fontSize: 16,
              fontWeight: '700',
              marginLeft: 4,
            }}>
            {task}
          </Text>
        </View>
        <Text
          style={{
            color: '#8A8A8E',
            fontSize: 14,
            fontWeight: '400',
            marginTop: 14,
          }}>{`${topic} > ${task}`}</Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {data && <QTMPieChart data={getChartData(data)} />}
        <Pressable onPress={onPressMenu}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={32}
            color={colors.backgroundColorHeader}
          />
        </Pressable>
      </View>
    </TouchableOpacity>
  );
}
