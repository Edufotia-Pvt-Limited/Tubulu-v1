import React from 'react';
import {Dimensions, Text, TouchableOpacity} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../Utils/Colors';

interface Props {
  addTaskPressed: () => void;
  addTopicPressed: () => void;
  onCancel: () => void;
}

export function QTMAddOptions({
  addTaskPressed,
  addTopicPressed,
  onCancel,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onCancel}
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#00000044',
        position: 'absolute',
        top: 0,
        left: 0,
      }}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          borderRadius: 10,
          width: Dimensions.get('screen').width * 0.5,
          backgroundColor: colors.backgroundWhite,
          position: 'absolute',
          right: 8,
          top: 0,
        }}>
        <TouchableOpacity
          onPress={addTopicPressed}
          style={{
            flexDirection: 'row',
            height: 40,
            borderBottomColor: '#00000022',
            borderBottomWidth: 1,
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 10,
          }}>
          <FontAwesome5
            name={'clipboard-list'}
            style={{fontSize: 20, color: '#2355C4'}}
          />
          <Text
            style={{
              fontSize: 16,
              marginLeft: 8,
              fontWeight: '400',
              color: '#2355C4',
            }}>{`New Topic`}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={addTaskPressed}
          style={{
            flexDirection: 'row',
            height: 40,
            justifyContent: 'flex-start',
            borderBottomColor: '#00000022',
            padding: 10,
            alignItems: 'center',
          }}>
          <MaterialCommunityIcons
            name={'clipboard-check'}
            style={{fontSize: 20, color: '#2355C4'}}
          />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 16,
              fontWeight: '400',
              color: '#2355C4',
            }}>{`New Task`}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
