/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import dynamicLink from '@react-native-firebase/dynamic-links';
import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import { useSelector } from 'react-redux';
import { CheckUserOnboarded } from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';
import { getTokenPair } from '../Utils/StorageUtils';

function SplashScreen(props) {
    let linkedIntegrationId = null;

    const userOnboarded = useSelector(state => state.loginState.userOnboarded);

    useEffect(() => {
        _handleDynamicLinks();

        // redirectToNextScreen();
        setTimeout(redirectToNextScreen, 500);
    }, []);

    const _handleDynamicLinks = async () => {
        dynamicLink()
            .getInitialLink()
            .then(link => {
                if (link.url.indexOf('http://tubulu.in/') >= 0) {
                    linkedIntegrationId = link.url.replace('http://tubulu.in/', '');
                }
            });
        dynamicLink().onLink(link => {
            if (link.url.indexOf('http://tubulu.in/') >= 0) {
                linkedIntegrationId = link.url.replace('http://tubulu.in/', '');
            }
        });
    };

    const _customTimer = () => {
        return new Promise(function (resolve) {
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    };

    function nextScreenDecision(isOnboarded) {
        if (isOnboarded) {
            getTokenPair()
                .then(async tokenPair => {
                    if (tokenPair.refreshToken) {
                        let _integrationId = linkedIntegrationId;
                        props.navigation.replace('HomeScreen', {
                            linkedIntegrationId: _integrationId,
                        });
                    } else {
                        props.navigation.replace('Registration');
                    }
                })
                .catch(error => {
                    props.navigation.replace('Registration');
                });
        } else {
            getTokenPair()
                .then(tokenPair => {
                    if (tokenPair.refreshToken) {
                        props.navigation.replace('OnboardingScreen');
                    } else {
                        props.navigation.replace('Registration');
                    }
                })
                .catch(error => {
                    console.log('ERROR OCCURED');
                    props.navigation.replace('Registration');
                });
        }
    }

    const redirectToNextScreen = async () => {
        await _customTimer();
        if (userOnboarded) {
            nextScreenDecision(true);
            return;
        }
        CheckUserOnboarded()
            .then(response => {
                if (response.data == true) {
                    nextScreenDecision(true);
                } else {
                    nextScreenDecision(false);
                }
            })
            .catch(error => {
                props.navigation.replace('Registration');
            });
        // props.navigation.replace('OnboardingScreen');
    };

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: colors.backgroundWhite,
            }}>
            {/* <SafeAreaView></SafeAreaView> */}
            <Image
                source={require('../assets/splash_new.png')}
                style={{ height: '100%', width: '100%' }}
            />
        </View>
    );
}

export default SplashScreen;


// import React, { useEffect, useState } from 'react';
// import { getTokenPair } from '../Utils/StorageUtils';
// import { CheckUserOnboarded } from '../Utils/ApiActions';
// import { useSelector } from 'react-redux';
// import { View, Image } from 'react-native';
// import { colors } from '../Utils/Colors';
// import dynamicLink from '@react-native-firebase/dynamic-links';
// function SplashScreen(props) {
//   const [linkedIntegrationId, setLinkedIntegrationId] = useState(null);
//   const userOnboarded = useSelector(state => state.loginState.userOnboarded);

//   useEffect(() => {
//     async function init() {
//       await handleDynamicLinks();
//       await redirectToNextScreen();
//     }
//     init();
//   }, []);

//   const handleDynamicLinks = async () => {
//     const initialLink = await dynamicLink().getInitialLink();
//     if (initialLink?.url?.includes('http://tubulu.in/')) {
//       setLinkedIntegrationId(initialLink.url.replace('http://tubulu.in/', ''));
//     }
//     // Subscribe to onLink listener if necessary
//   };

//   const nextScreenDecision = async (isOnboarded) => {
//     try {
//       const tokenPair = await getTokenPair();
//       if (isOnboarded) {
//         if (tokenPair.refreshToken) {
//           props.navigation.replace('HomeScreen', {
//             linkedIntegrationId,
//           });
//         } else {
//           props.navigation.replace('Registration');
//         }
//       } else {
//         if (tokenPair.refreshToken) {
//           props.navigation.replace('OnboardingScreen');
//         } else {
//           props.navigation.replace('Registration');
//         }
//       }
//     } catch {
//       props.navigation.replace('Registration');
//     }
//   };

//   const redirectToNextScreen = async () => {
//     await new Promise(r => setTimeout(r, 3000));
//     if (userOnboarded) {
//       await nextScreenDecision(true);
//       return;
//     }
//     try {
//       const response = await CheckUserOnboarded();
//       if (response.data === true) {
//         await nextScreenDecision(true);
//       } else {
//         await nextScreenDecision(false);
//       }
//             // await nextScreenDecision(true);

//     } catch {
//       props.navigation.replace('Registration');
//     }
//   };

//   return (
//     <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.backgroundWhite }}>
//       <Image source={require('../assets/splash_new.png')} style={{ height: '100%', width: '100%' }} />
//     </View>
//   );
// }

// export default SplashScreen;
