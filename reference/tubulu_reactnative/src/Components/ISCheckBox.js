import {Checkbox,  NativeBaseProvider, VStack} from 'native-base';
import {View, Text} from 'react-native';
import React from 'react';
import {colors} from '../Utils/Colors';
import PropTypes from 'prop-types';

function ISCheckBox(props) {
  return (
    <View style={{height: 60}}>
      <NativeBaseProvider>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Checkbox
            onChange={change => {
              if (props.onChange) {
                console.log(change)
                props.onChange(change);
              }
            }}
            style={{marginRight: 16, marginLeft: 4}}
            value="termsandConditions"
            colorScheme="purple">
            <Text
              style={{
                fontFamily: 'NotoSans',
                width: '100%',
                flexWrap: 'wrap',
                color: colors.primaryTextColor,
              }}>
              I agree to the{' '}
              <Text
                style={{
                  color: colors.primaryColor,
                  textDecorationLine: 'underline',
                  marginTop: 32,
                }}>
                term and services
              </Text>{' '}
              and{'\n'}
              <Text
                style={{
                  color: colors.primaryColor,
                  textDecorationLine: 'underline',
                }}>
                privacy policy
              </Text>
            </Text>
          </Checkbox>
        </View>
      </NativeBaseProvider>
    </View>
  );
}

ISCheckBox.propTypes = {
  onChange: PropTypes.func,
};

export default ISCheckBox;
