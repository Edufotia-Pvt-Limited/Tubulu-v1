import {Button} from "native-base";
import React from "react";
import {View, Text, TouchableOpacity} from 'react-native';
import {colors} from "../Utils/Colors";

export function ConfirmationPopup({title, subTitle, onCancel, onSave, yesText}) {
    return (
        <TouchableOpacity onPress={onCancel} style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '100%',
            backgroundColor: '#00000066',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <TouchableOpacity activeOpacity={1} style={{
                width: '90%',
                height: 172,
                backgroundColor: colors.backgroundWhite,
                position: 'absolute',
                bottom: 60,
                borderRadius: 20,
                paddingTop: 20,
                alignItems: 'center',
            }}>
                <Text style={{fontSize: 18, fontWeight: '600', color: '#101828'}}>{title || ''}</Text>
                <View style={{height: 6}}/>
                <Text style={{fontSize: 14, fontWeight: '400', color: '#475467'}}>{subTitle || ''}</Text>
                <View style={{marginTop: 40}}/>
                <View style={{flexDirection: 'row', paddingHorizontal: 20}}>
                    <View style={{flex: 1, borderRadius: 20, borderColor: 'black', borderWidth: 1, paddingRight: 10}}>
                        <Button onPress={onCancel} style={{
                            backgroundColor: colors.backgroundWhite,
                            flex: 1,
                            borderRadius: 20,
                            borderColor: 'black'
                        }}>
                            <Text style={{fontSize: 16, fontWeight: '600', color: 'black'}}>No</Text>
                        </Button>
                    </View>
                    <View style={{flex: 1, borderRadius: 20, height: 44, paddingLeft: 10}}>
                        <Button onPress={onSave} style={{flex: 1, backgroundColor: colors.errorRed, borderRadius: 20,}}>
                            <Text style={{fontSize: 16, fontWeight: '600', color: 'white'}}>{yesText ?? `Yes`}</Text>
                        </Button>
                    </View>
                </View>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}