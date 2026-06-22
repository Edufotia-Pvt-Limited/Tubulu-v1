import React from 'react';
import {Text} from 'react-native';
import ActionButton from 'react-native-action-button';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../Utils/Colors';

interface Props {
  readonly goToNewTaskScreen: () => void;
  readonly goToNewTopicScreen: () => void;
}

export function QTMActionButton({
  goToNewTaskScreen,
  goToNewTopicScreen,
}: Props) {
  return (
    <ActionButton
      backgroundTappable
      offsetY={10}
      offsetX={23}
      buttonTextStyle={{fontSize: 40}}
      buttonColor={colors.backgroundColorHeader}>
      <ActionButton.Item title="" onPress={goToNewTaskScreen}>
        <MaterialCommunityIcons
          name={'clipboard-check'}
          style={{fontSize: 18, color: colors.backgroundWhite}}
        />
        <Text
          allowFontScaling={false}
          style={{fontSize: 12, marginTop: 3, color: colors.backgroundWhite}}>
          Task
        </Text>
      </ActionButton.Item>
      <ActionButton.Item title="" onPress={goToNewTopicScreen}>
        <FontAwesome5
          name={'clipboard-list'}
          style={{fontSize: 18, color: colors.backgroundWhite}}
        />
        <Text
          allowFontScaling={false}
          style={{fontSize: 12, marginTop: 3, color: colors.backgroundWhite}}>
          Topic
        </Text>
      </ActionButton.Item>
    </ActionButton>
  );
}
