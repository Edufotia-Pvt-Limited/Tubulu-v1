import {ArrowForwardIcon, Button, NativeBaseProvider} from 'native-base';
import PropTypes from 'prop-types';
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {colors} from '../Utils/Colors';
import {Text} from 'react-native';

function ISButton(props) {
  return (
    <View style={{minHeight: 40}}>
      <NativeBaseProvider>
        {!props.displayLoading && (
          <Button
            onPress={props.onPress}
            style={{
              backgroundColor: colors.primaryColor,
              borderRadius: props.borderRadius ? props.borderRadius : 0,
            }}
            _text={{fontSize: 14, font: 'NotoSans'}}
            endIcon={props?.endIcon}>
            {props.label}
          </Button>
        )}
        {props.displayLoading && (
          <ActivityIndicator
            color={colors.primaryColor}
            size={'large'}></ActivityIndicator>
        )}
      </NativeBaseProvider>
    </View>
  );
}

ISButton.propTypes = {
  endIcon: PropTypes.element,
  startIcon: PropTypes.element,
  onPress: PropTypes.func,
  label: PropTypes.string.isRequired,
  displayLoading: PropTypes.bool,
  borderRadius: PropTypes.number,
};

export default ISButton;
