import React from 'react';
import { View, Text, Linking } from 'react-native';
// import Lottie from 'lottie-react-native';
import LottieView from 'lottie-react-native';


import ISNewButton from './ISNewButton';

function NoInternetVisual(props) {

  return (
    <View
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        backgroundColor: 'white',
        flex: 1,
      }}
    >
      <View style={{ height: 327, width: '100%' }}>
        <LottieView autoPlay loop source={require('../assets/no_connection.json')} />
      </View>
      <Text style={{
        fontSize: 24,
        fontStyle: 'normal',
        color: '#0C54A0',
        textAlign: 'center',
        fontWeight: '600',
      }}>No Internet Connection</Text>
      <Text style={{
        marginTop: 9,
        color: '#0C54A0',
        textAlign: 'center',
        fontWeight: '400',
        fontSize: 18,
        fontStyle: 'normal',
        lineHeight: 30
      }}>{'Please check your internet settings\nand try again'}</Text>
      <View style={{
        display: 'flex',
        marginTop: 16,
        flexDirection: 'row'
      }}>
        <ISNewButton
          onPress={() => {

          }}
          title={'Retry'}
          width={140}
        ></ISNewButton>
        <View style={{ width: 16 }}></View>
        <ISNewButton
          onPress={() => {
            Linking.openSettings();
          }}
          title={'Open Settings'}
          width={140}
        ></ISNewButton>
      </View>
    </View>
  )
}

export default NoInternetVisual;