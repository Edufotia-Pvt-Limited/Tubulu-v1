import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../Utils/Colors';
import {findAvatarColor, formattedQTMRole} from '../../Utils/Helper';
import {QTMPieChart} from './QTMCommonComponents';
import {getChartData} from './QTMTaskCard';

interface Props {
  readonly onPress: () => void;
  readonly data: any;
  readonly name: string;
  readonly lastName?: string;
  readonly role?: string;
  readonly subTasks?: number;
  readonly overdue?: number;
  readonly showMenu?: boolean;
  readonly onPressCross?: () => void;
  readonly onPressMenu: (event: GestureResponderEvent) => void;
}

export const avatarColorsV2 = [
  '#D05B7D', // Deep Rose (vibrant & professional, accent)
  '#F78B00', // Deep Orange (vibrant & professional, accent)
  '#7CC775', // Mid-tone Green (vibrant & professional)
  '#007BFF', // Royal Blue (vibrant & professional)
  '#17A2B8', // Cerulean Blue (vibrant & professional)
  '#3F88C5', // Dark Teal (vibrant & professional)
  '#C62828', // Maroon (vibrant & professional, accent)
  '#D95B43', // Terracotta (vibrant & professional, accent)
  // '#F2BDBD', // Light Rose (vibrant & professional)
  '#F0A27A', // Peach (vibrant & professional)
  // '#D6A69C', // Light Brown (vibrant & professional)
  '#7986CB', // Blue Gray (vibrant & professional)
  '#388E3C', // Forest Green (vibrant & professional)
  '#4285F4', // Dark Blue (vibrant & professional)
  // '#FBE0CC', // Light Cream (vibrant & professional, neutral, adjust if needed)
  // '#C5E1A5', // Light Green (vibrant & professional, adjust if needed)
  // '#A5C9CA', // Light Teal (vibrant & professional, adjust if needed)
  // '#9D38BD', // Plump Purple (vibrant & professional, adjust if needed)
  // '#E06B7B', // Dusty Rose (vibrant & professional, adjust if needed)
  /// New Colors
  '#CC662282',
  '#D87A96',
  '#E3A556',
  '#6FA86A',
  '#4B83BF',
  '#4696A3',
  '#D95B43',
  '#F0A27A',
  '#7986CB',
  '#388E3C',
  '#4285F4',
];

interface AvatarProps {
  readonly firstName: string;
  readonly lastName?: string;
  readonly fontSize?: number;
  readonly height?: number;
  readonly width?: number;
}

export function QTMAvatar({
  firstName,
  lastName,
  fontSize = 16,
  height = 34,
  width = 34,
}: AvatarProps): JSX.Element {
  const [bgColor, setBgColor] = useState<string>(colors.backgroundColorHeader);

  useEffect(() => {
    if (firstName !== '' && lastName !== '') {
      let initials = firstName?.charAt(0) + lastName?.charAt(0);
      const _avatarColor = findAvatarColor(initials, avatarColorsV2?.length);
      setBgColor(avatarColorsV2[_avatarColor]);
    }
  }, [firstName, lastName]);

  return (
    <View
      style={{
        borderRadius: 200,
        borderWidth: 0.2,
        backgroundColor: bgColor,
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text
        allowFontScaling={false}
        style={{color: colors.backgroundWhite, fontSize, fontWeight: '700'}}>
        {firstName?.charAt?.(0)}
        {lastName?.charAt?.(0)}
      </Text>
    </View>
  );
}

export function QTMMemberCard({
  onPress,
  data,
  role,
  name,
  lastName,
  subTasks,
  overdue,
  showMenu = false,
  onPressMenu,
  onPressCross,
}: Props): JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 67,
        borderColor: colors.inputBorderGrey,
        backgroundColor: colors.backgroundWhite,
        elevation: 8,
        shadowColor: 'rgba(0, 0, 0, 0.8)',
        shadowOpacity: 0.15,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 10,
        // borderWidth: 0.5,
        borderRadius: 10,
        paddingLeft: 10,
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <QTMAvatar fontSize={14} firstName={name} lastName={lastName} />
        <View style={{paddingHorizontal: 10}}>
          <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                maxWidth: Dimensions.get('screen').width * 0.6,
              }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: colors.titleBlackColor,
                  fontSize: 16,
                  fontWeight: '700',
                  paddingRight: 5,
                }}>
                {name}
              </Text>
              <Text
                allowFontScaling={false}
                ellipsizeMode="tail"
                numberOfLines={1}
                style={{
                  color: colors.titleBlackColor,
                  fontSize: 16,
                  fontWeight: '700',
                  paddingRight: 5,
                }}>
                {lastName}
              </Text>
            </View>
            <Text
              allowFontScaling={false}
              style={{color: '#8A8A8E', fontSize: 12, fontWeight: '400'}}>
              {role && formattedQTMRole(role)}
            </Text>
          </View>
          <View style={{paddingTop: 1}}>
            {subTasks || overdue ? (
              <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
                {subTasks !== undefined && subTasks > 0 && (
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: '#8A8A8E',
                      fontSize: 14,
                      fontWeight: '400',
                    }}>{`${subTasks} Subtask`}</Text>
                )}
                {overdue !== undefined && overdue > 0 && (
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: colors.titleBlackColor,
                      fontSize: 16,
                      paddingHorizontal: 2,
                    }}>
                    {'|'}
                  </Text>
                )}
                {overdue !== undefined && overdue > 0 && (
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: colors.cancelledRed,
                      fontSize: 14,
                      fontWeight: '400',
                    }}>{`${overdue} Overdue`}</Text>
                )}
              </View>
            ) : (
              <Text
                allowFontScaling={false}
                style={{color: '#8A8A8E', fontSize: 14, fontWeight: '400'}}>
                {'No Task Assigned'}
              </Text>
            )}
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {data && (
          <View style={{position: 'absolute', right: 18}}>
            <QTMPieChart data={getChartData(data)} />
          </View>
        )}
        {role !== 'OWNER' && onPressCross && (
          <TouchableOpacity
            style={{position: 'absolute', right: 2}}
            onPress={onPressCross}>
            <MaterialCommunityIcons
              name="close"
              size={22}
              color={colors.backgroundColorHeader}
              style={{paddingRight: 2}}
            />
          </TouchableOpacity>
        )}
        {showMenu && role !== 'OWNER' && (
          <Pressable
            style={{position: 'absolute', right: 1}}
            onPress={onPressMenu}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={32}
              color={colors.backgroundColorHeader}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
