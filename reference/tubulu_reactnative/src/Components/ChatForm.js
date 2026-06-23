import React, {useState} from 'react';
import {colors} from "../Utils/Colors";
import {Alert, Text, TouchableOpacity, View} from "react-native";
import IonIcon from "react-native-vector-icons/Ionicons";
import {Input, Select, ScrollView} from "native-base";
import {confirmMessageForm} from "../Utils/ApiActions";
import {string} from "prop-types";

export function FormCheckBox({title, checked, onPress}) {
    return (
        <TouchableOpacity onPress={onPress} style={{
            flexDirection: 'row',
            alignItems: 'center',
        }}>
            <View style={{
                height: 24,
                width: 24,
                borderRadius: 2,
                borderColor: checked ? '#339AF0' : '#AEAEB2',
                borderWidth: checked ? 8 : 1,
            }}></View>
            <Text style={{
                fontSize: 15,
                fontWeight: '400',
                color: 'black',
                marginLeft: 8,
            }}>{title}</Text>
        </TouchableOpacity>
    )
}

export function FormRadio({title, value, checked, onPress}) {
    return (
        <TouchableOpacity onPress={onPress} style={{
            flexDirection: 'row',
            alignItems: 'center',
        }}>
            <View style={{
                height: 24,
                width: 24,
                borderRadius: 60,
                borderColor: checked ? '#339AF0' : '#AEAEB2',
                borderWidth: checked ? 8 : 1,
            }}></View>
            <Text style={{
                fontSize: 15,
                fontWeight: '400',
                color: 'black',
                marginLeft: 8,
            }}>{title}</Text>
        </TouchableOpacity>
    )
}

export function ChatForm({navigation, route}) {

    const payload = route.params?.payload;
    const chatRoomId = route.params?.chatRoomId;
    const integrationId = route.params?.integrationId;
    const messageId = route.params?.messageId;

    const [formData, setFormData] = useState({});

    const formTemplate = payload?.formTemplate;

    function renderFormControl(formItem) {
        switch (formItem.type) {
            case 'INPUT':
                return <Input
                    borderColor={'transparent'}
                    backgroundColor={'transparent'}
                    borderRadius={8}
                    borderWidth={0}
                    placeholder={formItem.placeholder}
                    value={formData?.[formItem?.title] ?? ''}
                    onChangeText={(text) => {
                        setFormData({...formData, [formItem.title]: text})
                    }}
                    style={{
                        borderColor: '#B9B9BB',
                        borderRadius: 8,
                        borderWidth: 1,
                        height: 56
                    }}
                />
            case 'SELECT':
                return <Select
                    selectedValue={formData?.[formItem?.title] ?? ''}
                    placeholder={formItem.placeholder}
                    borderColor={'#B9B9BB'}
                    height={50}
                    onValueChange={value => {
                        setFormData({...formData, [formItem.title]: value})
                    }}
                >
                    {formItem.options?.length && formItem.options.map(optionItem => {
                        return (
                            <Select.Item label={optionItem.label} value={optionItem.value}/>
                        )
                    })}
                </Select>
            case 'RADIO':
                return <View style={{flexDirection: 'column'}}>
                    {formItem.options.map((optionItem, index) => {
                        return <View
                            style={{
                                margin: 8,
                            }}
                        ><FormRadio
                            onPress={() => {
                                setFormData({...formData, [formItem.title]: optionItem.value})
                            }}
                            checked={formData[formItem.title] === optionItem.value}
                            value={optionItem.value}
                            title={optionItem.label}/>
                        </View>
                    })}
                </View>
            case 'CHECKBOX':
                return <View style={{flexDirection: 'column'}}>
                    {formItem.options.map((optionItem, index) => {
                        return <View
                            style={{
                               margin: 8
                            }}
                        ><FormCheckBox
                            onPress={() => {
                                if (formData?.[formItem.title]?.length && formData[formItem.title].includes(optionItem.value)) {
                                    const existingValues = [...formData[formItem.title]];
                                    const index = existingValues.findIndex(item => item === optionItem.value);
                                    if (index >= 0) {
                                        existingValues.splice(index, 1);
                                        setFormData({
                                            ...formData,
                                            [formItem.title]: existingValues
                                        })
                                    }
                                } else if (formData?.[formItem.title]?.length) {
                                    const existingValues = [...formData[formItem.title]];
                                    existingValues.push(optionItem.value);
                                    setFormData({
                                        ...formData,
                                        [formItem.title]: existingValues
                                    })
                                } else {
                                    setFormData({...formData, [formItem.title]: [optionItem.value]})
                                }
                            }}
                            checked={formData[formItem.title]?.includes?.(optionItem.value)}
                            value={optionItem.value}
                            title={optionItem.label}/>
                        </View>
                    })}
                </View>
        }
    }

    function renderHeader() {
        return <View style={{
            height: 70,
            width: '100%',
            borderBottomWidth: 1,
            borderBottomColor: '#E4E7EC',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            flexDirection: 'row'
        }}>
            <View style={{
                flex: 1,
                justifyContent: 'center'
            }}>
                <Text style={{
                    color: '#101828',
                    fontStyle: 'normal',
                    fontSize: 18,
                    fontWeight: '600'
                }}>{payload?.buttonTitle ?? ''}</Text>
            </View>
            <TouchableOpacity onPress={() => {
                navigation.goBack();
            }}>
                <IonIcon name={'close'} style={{
                    color: '#667085',
                    fontSize: 24
                }}/>
            </TouchableOpacity>
        </View>
    }

    function renderFormData() {
        return (
            <ScrollView contentContainerStyle={{
                paddingBottom: 120,
            }} style={{
                paddingHorizontal: 16,
            }}>
                {formTemplate.map(formItem => {
                    return (
                        <View style={{
                            paddingTop: 16,
                        }}>
                            <Text style={{
                                fontWeight: '400',
                                fontSize: 17,
                                color: '#8A8A8E'
                            }}>{`${formItem.title} ${formItem.required ? '*' : ''}`}</Text>
                            <View style={{
                                marginTop: 8,
                            }}>
                                {renderFormControl(formItem)}
                            </View>
                        </View>
                    )
                })}
            </ScrollView>
        )
    }

    function checkValidation() {
        let validationResult = true;
        formTemplate.forEach(formItem => {
            if (!formData[formItem.title]) {
                validationResult = false;
            }
        })
        return validationResult;
    }

    async function onSubmitPress() {
        try {
            if(!checkValidation()){
                Alert.alert('Please fill all the required fields');
                return;
            }
            if (Object.keys(formData)?.length) {
                Object.keys(formData).forEach(keyItem => {
                    if (Array.isArray(formData[keyItem])) {
                        let stringResult = '';
                        formData[keyItem].forEach((item, index) => {
                            stringResult += `${item}${index === formData[keyItem].length - 1 ? '' : ', '}`
                        })
                        formData[keyItem] = stringResult;
                    }
                })
            }
            confirmMessageForm(messageId, formData, integrationId, chatRoomId);
            navigation.goBack();
        } catch (error) {
            console.log('Unable to submit the data at the moment');
            console.log(error);
        }
    }

    function renderActionButtons() {
        return (
            <View style={{
                flexDirection: 'row',
                borderTopWidth: 1,
                borderTopColor: '#E4E7EC',
                backgroundColor: 'white',
                height: 90,
                position: 'absolute',
                bottom: 0,
                width: '100%',
                justifyContent: 'center',
                paddingHorizontal: 16,
                alignItems: 'center'
            }}>
                <TouchableOpacity onPress={() => {
                    navigation.goBack();
                }} style={{
                    borderRadius: 40,
                    borderColor: '#D0D5DD',
                    borderWidth: 1,
                    flex: 1,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8,
                }}>
                    <Text style={{
                        fontWeight: '600',
                        color: '#344054',
                        fontSize: 16,

                    }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    onSubmitPress();
                }} style={{
                    borderRadius: 40,
                    borderColor: '#2355C4',
                    backgroundColor: '#2355C4',
                    borderWidth: 1,
                    flex: 1,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 8
                }}>
                    <Text style={{
                        fontWeight: '600',
                        color: 'white',
                        fontSize: 16,
                    }}>Submit</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={{
            flex: 1,
            backgroundColor: colors.backgroundWhite
        }}>
            {renderHeader()}
            {renderFormData()}
            {renderActionButtons()}
        </View>
    )
}
