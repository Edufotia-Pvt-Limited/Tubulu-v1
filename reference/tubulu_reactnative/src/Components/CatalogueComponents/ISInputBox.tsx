import React from 'react';
import {View, Text} from 'react-native';
import {Input} from 'native-base';
import {colors} from '../../Utils/Colors';

interface Props {
    label?: string;
    onChangeText?: (text: string) => void;
    onSubmitEditing?: () => void;
    inputLeftElement?: React.ReactNode;
    inputRightElement?: React.ReactNode;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    inputColor?: string;
    placeholder?: string;
    borderRadius?: number;
    value?: string
    // setSearch?: (value: string) => void;
}

function ISInputBox({label,value, onChangeText,borderRadius, placeholder,inputColor, inputLeftElement,inputRightElement,keyboardType, onSubmitEditing}: Props) {

    function renderLeftIcon() {
        if (inputLeftElement) {
            return <View style={{position: 'absolute', left: 14, bottom: 14}}>
                {inputLeftElement}
            </View>;
        }
    }
 
    function renderRightIcon() {
        if (inputRightElement) {
            return <View style={{position: 'absolute', right: 14, bottom: 14}}>
                {inputRightElement}
            </View>;
        }
    }

    return (
        <View style={{width: '100%'}}>
            {label &&
            <Text style={{
                color: colors.textColorGray,
                fontWeight: '400',
                fontSize: 17,
            }}>{label}</Text>}
            
            <Input
                keyboardType={keyboardType ?? 'default'}
                onSubmitEditing={onSubmitEditing}
                placeholder={placeholder ?? ""}
                style={{
                    borderColor: colors.textColorGray,
                    paddingLeft: inputLeftElement ? 50 : 16,
                    color: inputColor ?? 'black',
                    backgroundColor: 'white',
                    fontSize: 17,
                    height: 47,
                    borderRadius: borderRadius ?? 8
                }}
                onChangeText={onChangeText}
                value={value}
            />
            {renderLeftIcon()}
            {renderRightIcon()}
        </View>
    )
}



export default ISInputBox;
