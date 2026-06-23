import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../../Utils/Colors';

interface Props {
  onPressBack: () => void;
  readonly headerTitle: string;
  readonly onPressOptions: () => void;
  readonly topicLogo?: string;
}

export function QTMHeader({
  onPressBack,
  headerTitle,
  onPressOptions,
  topicLogo,
}: Props): JSX.Element {
  return (
    <View
      style={{
        backgroundColor: colors.backgroundColorHeader,
        height: 60,
        paddingLeft: 16,
        paddingRight: 8,
        alignItems: 'center',
        flexDirection: 'row',
      }}>
      <View
        style={{
          flex: 0,
          justifyContent: 'center',
          alignItems: 'center',
          height: 32,
          width: 32,
          borderRadius: 40,
          borderColor: colors.backgroundWhite,
          borderWidth: 1,
        }}>
        <TouchableOpacity
          onPress={() => {
            onPressBack();
          }}>
          <Icon
            name="arrow-back"
            style={{color: colors.backgroundWhite, fontSize: 24}}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 12,
        }}>
        <View
          style={{
            backgroundColor: 'white',
            borderColor: 'transparent',
            borderRadius: 100,
            borderWidth: 1,
            padding: 6,
          }}>
          <Image
            style={{
              height: 24,
              width: 24,
              borderRadius: 50,
            }}
            source={require('../../assets/splash_logo.png')}
            resizeMode="contain"
          />
        </View>
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: colors.backgroundWhite,
            fontSize: 28,
            fontWeight: '500',
            marginLeft: 5,
          }}>
          {headerTitle}
        </Text>
      </View>
      {/* <View style={{flex: 1}} /> */}
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity>
          <View
            style={{
              padding: 8,
              height: 38,
              width: 38,
              marginLeft: 8,
              borderColor: colors.backgroundWhite,
              borderWidth: 1,
              borderRadius: 100,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FontAwesomeIcon
              name="search"
              style={{fontSize: 16, color: 'white'}}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressOptions}>
          <View
            style={{
              padding: 8,
              height: 38,
              width: 38,
              marginLeft: 8,
              borderColor: colors.backgroundWhite,
              borderWidth: 1,
              borderRadius: 100,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FontAwesomeIcon
              name="plus"
              style={{fontSize: 16, color: 'white'}}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
