import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from "../Utils/Colors";
import MIcon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';

export function InternetStatusBar(props) {

    const [online, isOnline] = useState(false);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        NetInfo.addEventListener((state) => { 
            isOnline(state.isConnected);
        });
    }, []);

    useEffect(() => {
        if (online) {
            handleHidden()
        }
    }, [online])

    function handleHidden() {
        setTimeout(() => {
            setHidden(true);
        }, 2000);
    }

    return (
        <View style={{ 
            width: '100%',
            padding: 10,
            height: 56,
            display: hidden ? 'none' : 'flex',
            flexDirection: 'row',
            backgroundColor: online ? colors.greenBackground : colors.errorRed
        }}>
            <View
                style={{ 
                    width: 36,
                    height: 36,
                    padding: 6,
                    borderRadius: 6,
                    backgroundColor: colors.transparentBackground
                }}
            >
               {online 
                ? <MIcon name="signal-wifi-0-bar" style={{ color: 'white', fontSize: 24 }} />
                : <MIcon name="signal-wifi-off" style={{ color: 'white', fontSize: 24 }} />}
            </View>
            <View style={{
                marginLeft: 5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
            }}>
                <Text style={{ fontSize: 14, color: colors.backgroundWhite, fontWeight: 'bold' }}>You're {online ? 'online' : 'offline'}</Text>
                <Text style={{ fontSize: 12, color: colors.backgroundWhite }}>{online ? 'Hurray! Internet is connected.' : 'Oops! Internet is disconnected.'} </Text>
            </View>
           {!online && 
            <TouchableOpacity
                onPress={props.onPress}
                style={{
                    position: 'absolute', 
                    height: 32,
                    width: 32,
                    // top: 12,
                    right: 10,
                    bottom: 10
            }}>
                <MIcon name="cached" style={{ color: 'white', fontSize: 24 }} />
            </TouchableOpacity>}
        </View>
    );
}