/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { ArrowForwardIcon, useToast } from 'native-base';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    LayoutAnimation,
    Linking,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ISButton from '../Components/ISButton';
import ISTextInput from '../Components/ISTextInput';
import { LoginUser } from '../Utils/ApiActions';
// import {LoginUser, RegisterUser} from '../Utils/ApiActions';
import PhoneInput from 'react-native-phone-number-input';
import ISNewButton from '../Components/ISNewButton';
import { colors } from '../Utils/Colors';
import { requestNotificationPermission } from '../Utils/Helper';
import useKeyboardState from '../hooks/useKeyboardState';

function Registration(props) {
    const [displayLoading, setDisplayLoading] = useState(false);
    const [userFirstName, setUserFirstName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userLastName, setUserLastName] = useState('');
    const [checkBox, setCheckBox] = useState(false);
    const toast = useToast();
    const insets = useSafeAreaInsets();
    const [kavKey, setKavKey] = useState(0);

    const keyboardOpen = useKeyboardState();

    const [formType, setFormType] = useState('Login');

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    // Handle keyboard show/hide for Android KeyboardAvoidingView reset
    useEffect(() => {
        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                // On Android with RN 0.78.2, force KeyboardAvoidingView reset
                if (Platform.OS === 'android') {
                    // Use LayoutAnimation for smooth transition
                    LayoutAnimation.configureNext(
                        LayoutAnimation.create(
                            200,
                            LayoutAnimation.Types.easeInEaseOut,
                            LayoutAnimation.Properties.opacity
                        )
                    );
                    // Wait for keyboard animation, then remount to reset
                    setTimeout(() => {
                        setKavKey(prev => prev + 1);
                    }, 150);
                }
            }
        );

        return () => {
            keyboardWillHideListener?.remove();
        };
    }, []);

    //   onPressRegister = () => {
    //     // props.navigation.replace('RegistrationOtp');
    //     if (checkValidationRegistration()) {
    //       setDisplayLoading(true);
    //       RegisterUser(phoneNumber, userFirstName, userLastName)
    //         .then(response => {
    //           console.log(JSON.stringify(response));
    //           setDisplayLoading(false);
    //           props.navigation.replace('RegistrationOtp', {
    //             phoneNumber: phoneNumber,
    //           });
    //         })
    //         .catch(error => {
    //           setDisplayLoading(false);
    //           toast.show({description: error});
    //         });
    //     }
    //   };

    const onPressLogin = () => {
        if (checkValidationLogin()) {
            setDisplayLoading(true);
            LoginUser(phoneNumber)
                .then(response => {
                    console.log(response);
                    // toast.show({
                    //   description: 'Please enter otp : ' + response.otp,
                    // });
                    setDisplayLoading(false);
                    props.navigation.replace('RegistrationOtp', {
                        phoneNumber: phoneNumber,
                    });
                })
                .catch(error => {
                    setDisplayLoading(false);
                    toast.show({ description: error });
                });
        }
    };

    const checkValidationRegistration = () => {
        let _validation = true;
        if (userFirstName.trim() == '' || userFirstName.length < 2) {
            toast.closeAll();
            toast.show({ description: 'Invalid first name' });
            _validation = false;
        } else if (!checkBox && formType != 'Login') {
            toast.closeAll();
            toast.show({ description: 'Please Accept T&C' });
            _validation = false;
        } else if (
            !phoneNumber.match(
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
            )
        ) {
            toast.closeAll();
            toast.show({ description: 'Invalid Phone Number' });
            _validation = false;
        }
        return _validation;
    };

    const checkValidationLogin = () => {
        let _validation = true;
        if (
            !phoneNumber.match(
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
            )
        ) {
            toast.closeAll();
            toast.show({ description: 'Invalid Phone Number' });
            _validation = false;
        }
        return _validation;
    };

    const _renderForm = () => {
        if (formType == 'Login') {
            return (
                <View style={{ backgroundColor: colors.backgroundWhite }}>
                    <ISTextInput
                        value={phoneNumber}
                        onChangeText={text => setPhoneNumber(text)}
                        keyboardType="phone-pad"
                        placeholder="Mobile No."
                    />
                    <View style={{ marginTop: 16 }} />

                    <View style={{ marginTop: 62 }} />
                    <ISButton
                        displayLoading={displayLoading}
                        onPress={onPressLogin}
                        label="Continue"
                        endIcon={<ArrowForwardIcon size={4} />}
                    />
                </View>
            );
        }
    };

    const _renderHeader = () => {
        if (formType == 'Registration') {
            return (
                <View>
                    <Text
                        style={{
                            color: colors.primaryColor,
                            fontSize: 25,
                            fontWeight: '700',
                            fontFamily: 'NotoSans',
                        }}>
                        Create a new account
                    </Text>
                    <Text
                        style={{
                            color: colors.textGrey,
                            fontSize: 14,
                            fontWeight: 'normal',
                            marginTop: 24,
                            fontFamily: 'NotoSans',
                        }}>
                        Create a new account so you can manage your store online.
                    </Text>
                </View>
            );
        } else {
            return (
                <View>
                    <Text
                        style={{
                            color: colors.primaryColor,
                            fontSize: 25,
                            fontWeight: '700',
                            fontFamily: 'NotoSans',
                        }}>
                        Welcome
                    </Text>
                    <Text
                        style={{
                            color: colors.textGrey,
                            fontSize: 14,
                            fontWeight: 'normal',
                            marginTop: 24,
                            fontFamily: 'NotoSans',
                        }}>
                        We are so happy to see you.
                        {/* You can continue to login for manage your
            store */}
                    </Text>
                </View>
            );
        }
    };

    const _renderLogin = () => {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    flexDirection: 'column',
                    backgroundColor: 'white',
                }}>
                <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
                    <TouchableOpacity
                        onPress={() => {
                            setFormType('Login');
                        }}>
                        <Text
                            style={{
                                color:
                                    formType == 'Login' ? colors.primaryColor : colors.textGrey,
                                fontSize: 20,
                                fontWeight: 'normal',
                                fontFamily: 'NotoSans',
                            }}>
                            Login or Register
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 30 }} />
                {_renderForm()}
            </View>
        );
    };

    function renderNewLoginScreen() {
        return (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        marginTop: Platform.OS === 'ios' ? -65 : 0,
                    }}>
                    <View
                        style={{
                            backgroundColor: colors.backgroundWhite,
                            padding: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Image
                            source={require('../assets/login_illus.png')}
                            style={{ height: 180, width: 180 }}
                        />
                        <Text
                            style={{
                                color: colors.textBlueColor,
                                fontSize: 24,
                                fontWeight: '700',
                                textAlign: 'center',
                                marginTop: 24,
                            }}>
                            Sign In / Sign Up
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '400',
                                color: colors.textColorGray,
                                textAlign: 'center',
                                marginTop: 20,
                            }}>
                            Enter your phone number then we will send you OTP SMS to register
                            a new user or login if you registered user.
                        </Text>
                    </View>
                    <View
                        style={{
                            marginTop: 20,
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            width: '100%',
                        }}>
                        <Text style={{
                            color: colors.textColorGray,
                            fontWeight: '400',
                            fontSize: 17,
                        }}>Enter your mobile number</Text>
                        <PhoneInput
                            // autoFocus
                            value={phoneNumber}
                            defaultCode="IN"
                            layout="second"
                            containerStyle={{
                                marginTop: 8,
                                width: '100%',
                                height: 55,
                                borderWidth: 1,
                                borderColor: colors.textColorGray,
                                borderRadius: 6,
                                overflow: 'hidden',
                            }}
                            flagButtonStyle={{
                                width: 65,
                                borderRightWidth: 1,
                                borderRightColor: colors.textColorGray,
                            }}
                            codeTextStyle={{
                                color: colors.textBlueColor,
                                fontSize: 16,
                                fontWeight: '400',
                            }}
                            textContainerStyle={{
                                backgroundColor: colors.backgroundWhite,
                            }}
                            textInputStyle={{
                                color: colors.textBlueColor,
                                height: 50,
                            }}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                            }}
                        // onChangeFormattedText={(text) => {
                        //     setPhoneNumber(text);
                        // }}
                        />
                    </View>
                </View>
        );
    }

    return (
        <>
            <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
            <View style={{ flex: 1, backgroundColor: colors.backgroundWhite }}>
                <SafeAreaView />
                <KeyboardAvoidingView
                    key={Platform.OS === 'android' ? `kav-main-${kavKey}` : 'kav-main-ios'}
                    enabled={true}
                    behavior={Platform.OS === 'ios' ? 'position' : 'height'}
                    keyboardVerticalOffset={0}
                    style={{ flex: 1 }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{ flex: 1 }}
                        onPress={() => {
                            Keyboard.dismiss();
                        }}>
                        <View style={{ flex: 1, padding: 24, paddingBottom: 160 }}>
                            {renderNewLoginScreen()}
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 16,
                        paddingBottom: Platform.OS === 'ios' 
                            ? Math.max(insets.bottom, 30) 
                            : Math.max(insets.bottom, 20),
                        backgroundColor: colors.backgroundWhite,
                    }}>
                    <View style={{
                        marginBottom: 15,
                        alignItems: 'center',
                    }}>
                        <Text allowFontScaling={false} style={{ fontSize: 12, color: colors.titleBlackColor }}>By tapping continue, you accept the<Text allowFontScaling={false} onPress={() => Linking.openURL('https://tubulu.in/privacy-policy/')} style={{ color: colors.blipColor, fontWeight: '500' }}> Terms & Privacy policy</Text>
                        </Text>
                    </View>
                    <ISNewButton
                        title={'Continue'}
                        borderRadius={20}
                        onPress={onPressLogin}
                        loading={displayLoading}
                    />
                </View>
            </View>
        </>
    );
}

export default Registration;
