import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IonIcon from 'react-native-vector-icons/Ionicons';
import WebView from 'react-native-webview';
import { colors } from '../Utils/Colors';

export function PrivacyPolicyScreen({ navigation }) {
    function renderHeader() {
        return (
            <View
                style={{
                    height: 60,
                    backgroundColor: colors.backgroundWhite,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                }}>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={{
                            paddingLeft: 16,
                        }}
                        onPress={() => {
                            navigation.goBack();
                        }}>
                        <IonIcon
                            name={'arrow-back'}
                            style={{ color: '#2355C4', fontSize: 24 }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text
                        style={{
                            color: 'black',
                            fontSize: 16,
                            fontWeight: '500',
                        }}>
                        Legal
                    </Text>
                </View>
                <View style={{ flex: 1 }} />
            </View>
        );
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.white,
            }}>
            <SafeAreaView style={{ backgroundColor: colors.backgroundWhite }} />
            {renderHeader()}
            <WebView
                textZoom={180}
                source={{ uri: 'https://tubulu.in/privacy-policy/' }}
            />
        </View>
    );
}
