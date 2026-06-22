/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCodeScanner from 'react-native-qrcode-scanner';
import IonIcon from 'react-native-vector-icons/Ionicons';
import appUiStateService from '../Services/app-ui-state.service';
import { colors } from '../Utils/Colors';
import { requestCameraPermission } from '../Utils/Helper';

function QRScanner(props) {
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      (async () => {
        const granted = await requestCameraPermission();
        if (granted) {
          setShowQR(true);
        }
      })();
    } else {
      setShowQR(true);
    }
  }, []);

  return (
    <View
      style={{ display: 'flex', flex: 1, background: colors.backgroundWhite }}>
      <SafeAreaView />
      <View
        style={{
          height: 72,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: 'black',
          borderBottomWidth: 0.5,
        }}>
        <TouchableOpacity
          style={{ flex: 1, paddingLeft: 16 }}
          onPress={() => {
            props.navigation.goBack();
          }}>
          <IonIcon
            name="arrow-back"
            style={{
              fontSize: 22,
              color: '#2355C4',
            }}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              fontWeight: '600',
              fontSize: 14,
              color: 'black',
            }}>
            Scan QR Code
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            paddingRight: 16,
          }}
        />
      </View>
      {showQR && (
        <QRCodeScanner
          style={{ flex: 1 }}
          cameraStyle={{ height: '100%' }}
          onRead={async ({ data }) => {
            try {
              appUiStateService.handleQRCodeURL(data);
              // const { url } = await dynamicLink().resolveLink(data);
              // const integrationId = url.replace('http://tubulu.in/', '');
              // props.navigation.replace('HomeScreen', { linkedIntegrationId: integrationId });
            } catch (error) {
              console.log(error);
              console.log('Unable to scan the QR code at the moment');
            }
          }}
        />
      )}
    </View>
  );
}

export default QRScanner;
