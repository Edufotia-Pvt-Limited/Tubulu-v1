/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    // SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ConfirmationPopup } from '../Components/ConfirmationPopup';
import IntegrationListItem from '../Components/IntegrationListItem';
import { getBlockedList, removeBlockedIntegration } from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';

export default function ManageBusiness(props) {
    const [blockedIntegrations, setBlockedIntegrations] = useState([]);
    const [selectedIntegrationToUnblock, setSelectedIntegrationToUnblock] =
        useState(undefined);

    useEffect(() => {
        fetchBlockedList();
    }, []);

    async function fetchBlockedList() {
        try {
            const { data } = await getBlockedList();
            setBlockedIntegrations(
                data.map(item => {
                    return item.integration[0];
                }),
            );
        } catch (error) {
            console.log('Unable to get the block list at the moment');
            console.log(error);
        }
    }

    async function unblockIntegration(integrationId) {
        try {
            await removeBlockedIntegration(integrationId);
            setSelectedIntegrationToUnblock(undefined);
            fetchBlockedList();
        } catch (error) {
            console.log(error);
            Alert.alert('Unable to unblock the integration at the moment');
        }
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.backgroundWhite,
            }}>
            <SafeAreaView />
            <View
                style={{
                    height: 60,
                    flexDirection: 'row',
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={{}}
                        onPress={() => {
                            props.navigation.goBack();
                        }}>
                        <IonIcon
                            name={'arrow-back'}
                            style={{ color: '#2355C4', fontSize: 24 }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 7, justifyContent: 'center', alignItems: 'center' }}>
                    <Text
                        style={{
                            fontWeight: '600',
                            fontSize: 16,
                            width: '100%',
                            textAlign: 'center',
                            color: 'black',
                        }}>
                        Manage Business
                    </Text>
                </View>
                <View style={{ flex: 1 }} />
            </View>
            <FlatList
                data={blockedIntegrations}
                renderItem={item => {
                    return (
                        <View style={{ flexDirection: 'row', paddingRight: 8 }}>
                            <View style={{ flex: 8 }}>
                                <IntegrationListItem
                                    navigation={{
                                        push: () => { },
                                    }}
                                    item={item}
                                />
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedIntegrationToUnblock(item.item._id);
                                    }}>
                                    <MaterialCommunityIcon
                                        style={{
                                            color: colors.errorRed,
                                            fontSize: 24,
                                        }}
                                        name={'cancel'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
            {!!selectedIntegrationToUnblock && (
                <ConfirmationPopup
                    yesText={'Unblock'}
                    title={'Unblock Business?'}
                    subTitle={'Are you sure you want to unblock this business?'}
                    onSave={() => {
                        unblockIntegration(selectedIntegrationToUnblock);
                    }}
                    onCancel={() => {
                        setSelectedIntegrationToUnblock(undefined);
                    }}
                />
            )}
        </View>
    );
}
