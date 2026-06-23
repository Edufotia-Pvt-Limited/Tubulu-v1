/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { Linking, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { resetChatState } from '../Store/chat.store/chat.actions';
import { colors } from '../Utils/Colors';

export function SettingsScreen(props) {
    const [showLogoutConfirmation, setShowLogoConfirmation] = useState(false);

    const dispatch = useDispatch();

    function renderListItem(title, icon, onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 16,
                    marginRight: 16,
                    paddingTop: 16,
                    paddingBottom: 16,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#E5E5EA',
                }}>
                <View
                    style={{
                        backgroundColor: '#11308D23',
                        padding: 4,
                        borderRadius: 20,
                    }}>
               
                    {icon}
                </View>
                <Text
                    style={{
                        marginLeft: 16,
                        color: '#11308D',
                        fontSize: 17,
                        fontWeight: '400',
                    }}>
                    {title}
                </Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <FAIcon
                        name={'chevron-right'}
                        style={{
                            color: '#11308D',
                            fontSize: 16,
                        }}
                    />
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <>
            <View style={{ flex: 1, backgroundColor: colors.backgroundWhite }}>
                <SafeAreaView style={{ backgroundColor: 'white' }} />
                <Text
                    style={{
                        marginTop: 20,
                        fontWeight: '600',
                        fontSize: 16,
                        width: '100%',
                        textAlign: 'center',
                        color: 'black',
                    }}>
                    Settings
                </Text>
                <View style={{ marginTop: 24 }} />
                {renderListItem(
                    'Edit Profile',
                    <MIcon
                        name="account-circle"
                        style={{
                            color: '#11308D',
                            fontSize: 24,
                        }}
                    />,
                    () => {
                        props.navigation.push('OnboardingScreen', {
                            isEdit: true,
                        });
                    },
                )}

                     {renderListItem(
                    'Task Manager',
                    // <FAIcon
                    //     name="suitcase"
                    //     style={{
                    //         color: '#7b91d3ff',
                    //         fontSize: 20,
                    //     }}
                    // />,
                     
    <Image
                        // style={{ height: 14, width: 18 }}
                        // source={
                        //     selectedTab === 2
                        //         ? require('../assets/qtm_active.png')
                        //         : require('../assets/qtm_inactive.png')
                        // }
                          source={require('../assets/qtm_active.png')}
                             style={{
        height: 22,
        width: 22,
        resizeMode: 'contain',
    }}
                        
                    /> ,
                    () => {
                        // props.setSelectedTab(2)
                        // props.navigation.push('HomeScreen');

                        props.navigation.navigate('HomeScreen');
setTimeout(() => {
    props.setSelectedTab(6);
}, 50);
                    },
                    
                )}


                
                {renderListItem(
                    'Manage Business',
                    <FAIcon
                        name="suitcase"
                        style={{
                            color: '#11308D',
                            fontSize: 20,
                        }}
                    />,
                    () => {
                        props.navigation.navigate('ManageBusiness');
                    },
                )}
                {renderListItem(
                    'Help Support',
                    <MIcon
                        name="contact-support"
                        style={{
                            color: '#11308D',
                            fontSize: 24,
                        }}
                    />,
                    () => {
                        Linking.openURL('https://support.tubulu.in/');
                    },
                )}
                {renderListItem(
                    'Legal',
                    <FAIcon
                        name="legal"
                        style={{
                            color: '#11308D',
                            fontSize: 20,
                        }}
                    />,
                    () => {
                        Linking.openURL('https://tubulu.in/privacy-policy/');
                        {/* props.navigation.navigate('LegalScreen'); */ }
                    },
                )}
                {renderListItem(
                    'Delete Account',
                    <FAIcon
                        name="trash"
                        style={{
                            color: '#11308D',
                            fontSize: 24,
                        }}
                    />,
                    () => {
                        props.navigation.navigate('DeleteAccountScreen');
                    },
                )}
                {renderListItem(
                    'Logout',
                    <MIcon
                        name="logout"
                        style={{
                            color: '#11308D',
                            fontSize: 24,
                        }}
                    />,
                    () => {
                        dispatch(resetChatState());
                        props.onLogout();
                    },
                )}
            </View>
        </>
    );
}
