import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import OtpInputs from 'react-native-otp-inputs';
import { colors } from '../Utils/Colors';

import { useToast } from 'native-base';
import ISNewButton from '../Components/ISNewButton';
import { LoginUser, VerifyOtp } from '../Utils/ApiActions';
import useKeyboardState from '../hooks/useKeyboardState';

const screenWidth = Dimensions.get('screen').width;

function RegistrationOtp(props) {
    const toast = useToast();
    const phoneNumber = props?.route?.params?.phoneNumber;
    const [otp, setOtp] = useState('');
    const [displayLoading, setDisplayLoading] = useState(false);
    const isKeyboardOpen = useKeyboardState();
    const [count, setCount] = useState(60);
    const insets = useSafeAreaInsets();
    const [kavKey, setKavKey] = useState(0);
    const otpRef = React.useRef('');
    const hasStartedTyping = React.useRef(false);

    useEffect(() => {
        if (!displayLoading) {
            if (count > 0) {
                const timer = setTimeout(() => setCount(count - 1), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [count, displayLoading]);

    // Store OTP in ref to preserve during remounts
    useEffect(() => {
        otpRef.current = otp;
        if (otp && otp.length > 0) {
            hasStartedTyping.current = true;
        }
    }, [otp]);

    // Handle keyboard show/hide for Android KeyboardAvoidingView reset
    // Only remount if user hasn't started typing to avoid losing entered OTP
    useEffect(() => {
        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                // On Android with RN 0.78.2, force KeyboardAvoidingView reset
                // But only if user hasn't started typing to preserve entered OTP
                if (Platform.OS === 'android') {
                    // Use LayoutAnimation for smooth transition
                    LayoutAnimation.configureNext(
                        LayoutAnimation.create(
                            200,
                            LayoutAnimation.Types.easeInEaseOut,
                            LayoutAnimation.Properties.opacity
                        )
                    );
                    // Only remount if user hasn't started typing
                    if (!hasStartedTyping.current) {
                        setTimeout(() => {
                            setKavKey(prev => prev + 1);
                        }, 150);
                    }
                }
            }
        );

        return () => {
            keyboardWillHideListener?.remove();
        };
    }, []);

    const _resendOtp = () => {
        LoginUser(props?.route?.params?.phoneNumber)
            .then(response => {
                toast.show({ description: 'OTP sent successfully' });
                setCount(60);
                console.log(response);
            })
            .catch(error => {
                toast.show({ description: error });
            });
    };

    const _verifyOtp = () => {
        setDisplayLoading(true);
        VerifyOtp(props?.route?.params?.phoneNumber, otp)
            .then(response => {
                setDisplayLoading(false);
                console.log(response);
                if (response.email) {
                    props.navigation.replace('HomeScreen');
                } else {
                    props.navigation.replace('OnboardingScreen');
                }
            })
            .catch(error => {
                setDisplayLoading(false);
                toast.show({ description: error });
            });
    };

    return (
        <>
            <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
            <View style={{ flex: 1, backgroundColor: colors.backgroundWhite }}>
                <SafeAreaView />
                <KeyboardAvoidingView
                    key={Platform.OS === 'android' ? `kav-${kavKey}` : 'kav-ios'}
                    enabled={true}
                    behavior={Platform.OS === 'ios' ? 'position' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'android' ? -50 : 0}
                    style={{ flex: 1 }}>
                    <View
                        style={{
                            flex: 1,
                            padding: 24,
                            paddingTop: isKeyboardOpen ? 0 : 80,
                            paddingBottom: 120,
                        }}>
                        {!isKeyboardOpen && (
                            <>
                                <View
                                    style={{
                                        width: '100%',
                                        alignItems: 'center',
                                    }}>
                                    <Image
                                        style={{ margin: 24, height: 190, width: 190 }}
                                        resizeMode="contain"
                                        source={require('../assets/otp_illus.png')}
                                    />
                                </View>
                                <Text
                                    style={{
                                        color: colors.textBlueColor,
                                        fontSize: 24,
                                        fontWeight: '700',
                                        textAlign: 'center',
                                        marginTop: 24,
                                    }}>
                                    Verification Code
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '400',
                                        color: colors.textColorGray,
                                        textAlign: 'center',
                                        marginTop: 20,
                                    }}>
                                    Please enter the verification code, Sent to {phoneNumber}
                                </Text>
                            </>
                        )}
                        {isKeyboardOpen && (
                            <Text
                                style={{
                                    color: colors.textBlueColor,
                                    fontSize: 20,
                                    fontWeight: '700',
                                    textAlign: 'center',
                                    marginTop: 10,
                                    marginBottom: 10,
                                }}>
                                Enter Verification Code
                            </Text>
                        )}
                        <View style={{ width: '100%', height: 40, marginTop: isKeyboardOpen ? 10 : 60 }}>
                            <OtpInputs
                                key="otp-inputs-stable"
                                autofillFromClipboard
                                autoComplete="sms-otp"
                                inputStyles={{
                                    color: colors.primaryColor,
                                    backgroundColor: colors.backgroundWhite,
                                    width: screenWidth / 10,
                                    height: 50,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    borderColor: colors.primaryColor,
                                }}
                                onSubmitEditing={() => _verifyOtp()}
                                keyboardType={'phone-pad'}
                                handleChange={code => {
                                    setOtp(code);
                                }}
                                numberOfInputs={6}
                            />
                        </View>
                        <View
                            style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 32,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    marginHorizontal: 10,
                                    marginBottom: 10,
                                }}>
                                <Text
                                    style={{
                                        color: colors.backgroundColorHeader,
                                        fontSize: 16,
                                        fontWeight: '500',
                                    }}>
                                    {count > 59
                                        ? `0${Math.floor(count / 60)}:00`
                                        : count < 10
                                            ? `00:0${count}`
                                            : `00:${count}`}
                                </Text>
                            </View>
                            <TouchableOpacity
                                disabled={count !== 0 || displayLoading}
                                onPress={() => _resendOtp()}>
                                <Text
                                    style={{
                                        fontFamily: 'NotoSans',
                                        color: count == 0 ? colors.textBlueColor : colors.textGrey,
                                        textAlign: 'center',
                                    }}>
                                    Resend Verification Code
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
                        paddingBottom: Math.max(insets.bottom, 20),
                        backgroundColor: colors.backgroundWhite,
                    }}>
                    <ISNewButton title={'Verify'} borderRadius={20} onPress={_verifyOtp} loading={displayLoading} />
                </View>
            </View>
        </>
    );
}

export default RegistrationOtp;
