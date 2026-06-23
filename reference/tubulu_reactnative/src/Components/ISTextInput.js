import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import {Input, NativeBaseProvider, Spinner} from 'native-base';
import {colors} from '../Utils/Colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function ISTextInput(props) {
    const [isFocus, setIsFocus] = useState(false);

    return (
        <View style={{minHeight: 50}}>
            <NativeBaseProvider>
                <View>
                    <Input
                        autoFocus={props.autoFocus}
                        borderColor={'transparent'}
                        backgroundColor={'transparent'}
                        borderWidth={0}
                        isDisabled={props.isDisabled}
                        multiline={props.multiline}
                        onChangeText={text => {
                            if (props.onChangeText) {
                                props.onChangeText(text);
                            }
                        }}
                        isRequired={props.isRequired}
                        maxLength={props.maxLength}
                        autoCorrect={false}
                        keyboardType={props.keyboardType}
                        onBlur={() => setIsFocus(false)}
                        onFocus={() => setIsFocus(true)}
                        value={props?.value || ''}
                        style={{
                            borderWidth: props.borderWidth == 0 ? props.borderWidth : 1,
                            borderRadius: 8,
                            paddingLeft:
                                props.leftIcon != null && props.leftIcon != undefined ? 36 : 8,
                            paddingRight:
                                props.rightIcon != null && props.rightIcon != undefined
                                    ? 36
                                    : 8,
                            borderColor: isFocus ? colors.inputBorderGrey : colors.inputBackGrey,
                            color: colors.primaryTextColor,
                            fontWeight: props.fontWeight,
                            fontSize: 14,
                            fontFamily: 'NotoSans',
                        }}
                        height={props.multiline ? 71 : 0}
                        minHeight={50}
                        width={props.width}
                        placeholder={props.placeholder || 'Placeholder'}></Input>
                    {props.micEnabled && (
                        <View
                            style={{
                                flex: 1,
                                alignContent: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                right: 8,
                                top: 12,
                                // height: 50,
                                // width: 50,

                                borderRadius: 50,
                            }}>
                            {props.isMicOn && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        backgroundColor: colors.primaryColor,

                                        width: props.pitch * 5,
                                        minHeight: 30,
                                        minWidth: 30,
                                        borderRadius: 50,
                                        height: props.pitch * 5,

                                        opacity: 0.2,
                                    }}></View>
                            )}
                            <MaterialIcons
                                color={props.isMicOn ? colors.primaryColor : colors.textGrey}
                                name="mic"
                                size={24}
                                onPress={() => {
                                    props.onMicPress();
                                }}
                            />
                        </View>
                    )}
                    {props.leftIcon != null && props.leftIcon != undefined ? (
                        <View
                            style={{
                                position: 'absolute',
                                left: 8,
                                top: props.iconTop ? props.iconTop : 12,
                            }}>
                            {props.leftIcon}
                        </View>
                    ) : props.rightIcon != null && props.rightIcon != undefined ? (
                        <View style={{position: 'absolute', right: 8, top: 12}}>
                            {props.rightIcon}
                        </View>
                    ) : (
                        <View></View>
                    )}
                    {props.displayLoading === true && (
                        <Spinner size={'sm'} color={colors.primaryColor}></Spinner>
                    )}
                </View>
            </NativeBaseProvider>
        </View>
    );
}

ISTextInput.defaultProps = {
    keyboardType: 'default',
};

ISTextInput.propTypes = {
    placeholder: PropTypes.string,
    leftElement: PropTypes.element,
    rightElement: PropTypes.element,
    keyboardType: PropTypes.string,
    maxLength: PropTypes.number,
    width: PropTypes.number,
    value: PropTypes.string,
    isRequired: PropTypes.bool,
    fontWeight: PropTypes.string || PropTypes.number,
    leftIcon: PropTypes.element,
    onChangeText: PropTypes.func.isRequired,
    multiline: PropTypes.bool,
    rightIcon: PropTypes.element,
    displayLoading: PropTypes.bool,
    isDisabled: PropTypes.bool,
    iconTop: PropTypes.number,
    micEnabled: PropTypes.bool,
    onMicPress: PropTypes.func,
    isMicOn: PropTypes.bool,
    pitch: PropTypes.number,
    borderWidth: PropTypes.number,
};

export default ISTextInput;
