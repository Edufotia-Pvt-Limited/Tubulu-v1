import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import FAIcon from 'react-native-vector-icons/FontAwesome'
import Video from 'react-native-video';
import { deviceHeight, deviceWidth } from '../Utils/Constants';

function ISVideoPlayer(props) {
  const navParams = Object.assign({}, props.route?.params);
  const videoUrl = navParams?.videourl || navParams?.videoUrl;
  const playerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!videoUrl) {
    return (
      <View style={{
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        height: deviceHeight,
        width: deviceWidth,
      }}>
        <TouchableOpacity style={{
          right: 20, 
          top: Platform.OS === 'ios' ? 60 : 20,
          position: 'absolute'
        }} onPress={() => {
          props.navigation.goBack()
        }}>
          <FAIcon
            name='close'
            style={{ fontSize: 20, color: 'white', height: 32, width: 32, }}></FAIcon>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
      height: deviceHeight,
      width: deviceWidth,
    }}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        {isLoading && !hasError && (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: -20,
            marginTop: -20,
            zIndex: 1
          }}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
        <Video
          ref={playerRef}
          source={{ uri: videoUrl }}
          style={{
            width: deviceWidth,
            height: deviceHeight,
          }}
          resizeMode="contain"
          controls={true}
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onError={(error) => {
            console.error('Video playback error:', error);
            setIsLoading(false);
            setHasError(true);
          }}
          onLoadStart={() => {
            setIsLoading(true);
          }}
        />
        <TouchableOpacity style={{
          right: 20, 
          top: Platform.OS === 'ios' ? 60 : 20,
          position: 'absolute',
          zIndex: 2,
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: 20,
          padding: 8,
        }} onPress={() => {
          props.navigation.goBack()
        }}>
          <FAIcon
            name='close'
            style={{ fontSize: 20, color: 'white', height: 32, width: 32, }}></FAIcon>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}


export default ISVideoPlayer
