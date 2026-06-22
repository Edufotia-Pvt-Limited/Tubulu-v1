import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SoundPlayer from 'react-native-sound-player';
import { Alert, TouchableOpacity, View, Text } from 'react-native';
import VectorIcon from 'react-native-vector-icons/FontAwesome';
import { Progress, Slider } from 'native-base'
import { duration } from 'moment';

let _audioInterval = null;

function ISAudioPlayer(props) {

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [value, setValue] = useState(0)
  const [audioDuration, setAudioDuration] = useState(1);

  useEffect(() => {
    // SoundPlayer.loadUrl(props.documentUrl);
    // _getSoundInfo();
  }, [])

  useEffect(() => {
    if (isAudioPlaying) {
      console.log("setting value")
      setTimeout(() => {
        if (value >= 100) {
          setIsAudioPlaying(false);
          setValue(0)
        } else {
          setValue(value + parseInt(100 / audioDuration))
        }
      }, 1000)
    }
  }, [value]);

  const _startAudioControl = () => {
    _audioInterval = setInterval(() => {
      console.log("Setting the value::")
      console.log(value + parseInt(100 / audioDuration));
      setValue(value + parseInt(100 / audioDuration));
      if (value >= parseInt(duration)) {
        clearInterval(_audioInterval)
      }
    }, 1000)
  }

  const _playSound = () => {
    try {
      setIsAudioPlaying(true)
      SoundPlayer.playUrl(props.documentUrl)
      setValue(value + parseInt(100 / audioDuration))
      // _startAudioControl()
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to play the audio at the moment');
    }
  }

  const _getSoundInfo = () => {
    SoundPlayer.getInfo().then(response => {
      setAudioDuration(response.duration)
    }).catch(error => {
        console.log(error);
    })
  }

  const _stopAudioPlaying = () => {
    try {
      setIsAudioPlaying(false);
      SoundPlayer.stop();
      clearInterval(_audioInterval);
      setValue(0);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={{ flex: 1, maxHeight: 20, display: 'flex', flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => {
        !isAudioPlaying ? _playSound() : _stopAudioPlaying();
      }}>
        <VectorIcon style={{ fontSize: 20, color: 'black' }} name={!isAudioPlaying ? 'play' : 'pause'}></VectorIcon>
      </TouchableOpacity>
      <View style={{ width: 160, justifyContent: 'center', marginLeft: 20 }}>
        <Progress colorScheme="primary" value={value} />
      </View>
      <View style={{ marginLeft: 8 }}>
        <Text style={{ color: 'black', fontSize: 12, fontWeight: '400' }}>{audioDuration?.toString()?.replace('.', ':')}</Text>
      </View>
    </View >
  )
}

// ISAudioPlayer.propTypes = {
//   documentUrl: PropTypes.string.isRequired
// }

export default ISAudioPlayer;
