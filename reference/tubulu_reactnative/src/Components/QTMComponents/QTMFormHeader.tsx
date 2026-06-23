import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import FontAwesomeIcon5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../../Utils/Colors';

interface Props {
  readonly onPressBack: () => void;
  readonly header: string;
  readonly showSync?: boolean;
  readonly handleSync?: () => void;
}

export function QTMFormHeader({
  onPressBack,
  header,
  showSync = false,
  handleSync,
}: Props): JSX.Element {
  return (
    <View
      style={{
        backgroundColor: colors.backgroundColorHeader,
        height: 60,
        paddingLeft: 16,
        paddingRight: 8,
      }}>
      <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
        <View style={{flex: 1}}>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 32,
              width: 32,
              borderRadius: 40,
              borderColor: colors.backgroundWhite,
              borderWidth: 1,
            }}
            onPress={onPressBack}>
            <Icon
              name="arrow-back"
              style={{color: colors.backgroundWhite, fontSize: 24}}
            />
          </TouchableOpacity>
        </View>
        <View style={{flex: 2.5}}>
          <Text
            style={{
              color: colors.backgroundWhite,
              fontSize: 24,
              fontWeight: '700',
            }}>
            {header}
          </Text>
        </View>
        {showSync && (
          <TouchableOpacity
            onPress={handleSync}
            style={{
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              height: 36,
              width: 36,
              borderRadius: 40,
              borderColor: colors.backgroundWhite,
              // borderWidth: 1,
              right: 10,
            }}>
            <FontAwesomeIcon5
              name="sync"
              size={18}
              color={colors.backgroundWhite}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
