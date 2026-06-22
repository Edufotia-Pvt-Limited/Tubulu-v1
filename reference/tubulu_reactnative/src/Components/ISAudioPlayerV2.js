import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import VectorIcon from "react-native-vector-icons/FontAwesome";
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import Slider from '@react-native-community/slider';
import Sound from 'react-native-sound';

export function ISAudioPlayerV2({documentUrl, documentName, isFromUser, ref, onLongPress}) {
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [playValue, setPlayValue] = useState(0);
    const [soundState, setSoundState] = useState(undefined);

    const soundCallback = useCallback(() => initializeSound(), []);

    const soundIntervalRef = useRef({
        value: undefined
    })


    useEffect(() => {
        return () => {
            soundState?.stop?.();
            soundState?.release?.();
        }
    }, [])

    useEffect(() => {
        if (isAudioPlaying) {
            const duration = soundState ? parseInt(soundState?.getDuration?.()) : 0;
            if (duration) {
                soundIntervalRef.current.value = setInterval(function () {
                    setPlayValue((value) => value + (1 / duration));
                }, 1000)
                return;
            }
        }
        clearInterval(soundIntervalRef.current.value);
    }, [isAudioPlaying])

    useEffect(() => {
        if (!!soundState) {
            return;
        }
        soundCallback();
    }, [soundState])

    function initializeSound() {
        Sound.setMode('Default');
        const sound = new Sound(documentUrl, '', (error) => {
            if (error) {
                return;
            }
            setSoundState(sound);
        });
    }

    function getDurationString() {
        const duration = soundState ? parseInt(soundState?.getDuration?.()) : 0;
        if (duration) {
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
        }
        return "00:00";
    }

    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    function playAudio() {
        if (!!soundState) {
            if (!isAudioPlaying) {
                soundState.play();
                setIsAudioPlaying(true);
                return;
            }
            soundState.pause();
            setIsAudioPlaying(false);
        }
    }

    function handleAudioSeek(value) {
        let previouslyAudioPlaying = false;
        if (isAudioPlaying) {
            setIsAudioPlaying(false);
            soundState.pause();
            previouslyAudioPlaying = true;
        }
        if (soundState) {
            const duration = soundState.getDuration();
            const sanitizedValue = value;
            const seekerValue = sanitizedValue * duration;
            setPlayValue(seekerValue * (1 / duration));
            soundState.setCurrentTime(seekerValue);
        }
    }

    function getAudioFileName() {
        if (documentName) {
            if (documentName.length > 16) {
                return `${documentName.substring(0, 14)}...`
            }
            return documentName
        }
        return 'Audio';
    }

    return (
        <TouchableOpacity 
            ref={ref}
            onLongPress={onLongPress}
            style={{
                flex: 1,
                maxHeight: 48,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
        }}>
            <TouchableOpacity onPress={playAudio} style={{
                height: 40,
                width: 40,
                backgroundColor: isFromUser ? 'white' : '#339AF0',
                borderRadius: 60,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <VectorIcon
                    style={{fontSize: 20, color: isFromUser ? '#339AF0' : 'white'}}
                    name={isAudioPlaying ? 'pause' : 'play'}
                />
            </TouchableOpacity>
            <View style={{marginLeft: 4, display: 'flex', flexDirection: 'column'}}>
                <View style={{width: '100%', minWidth: 160}}>
                    <Slider
                        disabled
                        lowerLimit={0}
                        value={playValue}
                        onValueChange={handleAudioSeek}
                        minimumTrackTintColor={isFromUser ? 'white' : '#339AF0'}
                        maximumTrackTintColor={'#D2D7FC'}
                        thumbTintColor={isFromUser ? 'white' : '#339AF0'}
                        style={{}}/>
                </View>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                    <Text style={{
                        fontSize: 12,
                        flex: 1,
                        fontWeight: '400',
                        color: isFromUser ? 'white' : '#AEAEB2',
                        marginLeft: 16,
                    }}>{getAudioFileName()}</Text>
                    <View style={{}}>
                        <Text style={{
                            color: isFromUser ? 'white' : '#339AF0',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            backgroundColor: isFromUser ? '#339AF0' : '#F4F7FF',
                            fontSize: 9,
                            fontWeight: '400',
                        }}>{getDurationString().toString()}</Text>
                    </View>
                </View>
            </View>

        </TouchableOpacity>
    )
}
