import React, { useEffect, useState } from 'react';
import {
    Image,
    // SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import VectorIcon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../Utils/Colors';

function ChatHeader(props) {
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [catalogueDate, setCatalogueData] = useState([]);
    const isCatalogueEnabled = props.isCatalogueEnabled ?? false;
    console.log("Catalogue status in header: ", props.integrationItem);
    console.log("Catalogue Props in Chat Header: ", props);

    // useEffect(()=>{
    //     if(props?.integrationItem?.catalogue?.length > 0){
    //         const catalogue = props?.integrationItem.catalogue.filter(item => item.isActive === true);

    //         setCatalogueData(props?.integrationItem.catalogue);
    //     }else{
    //         setCatalogueData([]);
    //     }

    // },[props.integrationItem])
    const _renderSearchBar = () => {
        if (isSearchEnabled) {
            return (
                <View
                    style={{ flex: 1, width: '100%', paddingLeft: 16, paddingRight: 16 }}>
                    <SafeAreaView>
                        <TextInput
                            value={searchText}
                            placeholder="Search..."
                            underlineColorAndroid={'transparent'}
                            style={{ borderBottomColor: 'black', borderBottomWidth: 1 }}
                            onChangeText={text => {
                                setSearchText(text);
                                props?.onSearchChange?.(text);
                            }}
                        />
                    </SafeAreaView>
                </View>
            );
        }
    };

    return (
        <View
            style={{
                backgroundColor: colors.backgroundWhite,
                height: 40,
            }}>
            {/* <SafeAreaView> */}
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingLeft: 8,
                        paddingRight: 8,
                    }}>
                    <TouchableOpacity
                        onPress={() => {
                            props.navigation.navigate('HomeScreen');
                        }}>

                        <IonIcon
                            name={'arrow-back'}
                            size={24} color="#2355C4"
                        />

                    </TouchableOpacity>


                </View>


                <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() =>
                        props.navigation.navigate("IntegrationProfileDetails", {
                            integrationItem: props.integrationItem,
                            fromScreen: "ChatHeader",
                        })
                    }

                >
                    <View style={{ justifyContent: 'center' }}>
                        <Image
                            source={{ uri: props.integrationItem.logo }}
                            style={{ height: 40, width: 40, borderRadius: 50 }}
                        />
                    </View>
                    <View
                        style={{
                            flex: 1,
                            paddingLeft: 12,
                            alignItems: 'flex-start',
                            alignContent: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {!isSearchEnabled && (
                            <>
                                <Text
                                    style={{
                                        fontFamily: 'NotoSans',
                                        fontSize: 16,
                                        fontWeight: '400',
                                        color: colors.primaryTextColor,
                                    }}>
                                    {props?.integrationItem?.integrationName}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '400',
                                        color: '#8E8E93',
                                    }}>
                                    Business Account
                                </Text>
                            </>
                        )}
                        {isSearchEnabled && _renderSearchBar()}
                    </View>
                </TouchableOpacity>

                {isCatalogueEnabled &&
                    (<View style={{ justifyContent: 'center', paddingRight: 10 }}>
                        <TouchableOpacity
                            onPress={() => {
                                props.navigation.navigate('CatalogueScreen', {
                                    integrationItem: props?.integrationItem,
                                });
                            }}
                            // disabled={!isCatalogueEnabled}
                            style={{
                                borderRadius: 16,
                                // width: 32,
                                // height: 32,

                                minHeight: 44,
                                marginTop: 6,
                                padding: 10
                            }}>

                            <Image
                                source={require('../assets/catalogue-icon.png')}
                                style={{ height: 18.67, width: 21, opacity: isCatalogueEnabled ? 1 : 0.4, }}
                                resizeMode="contain"
                                accessibilityState={{ disabled: !isCatalogueEnabled }}
                            />
                        </TouchableOpacity>

                    </View>)}
                {/* {isCatalogueEnabled && (
  <View style={{ justifyContent: 'center', paddingRight: 10 }}>
    <TouchableOpacity
      onPress={() => {
        props.navigation.navigate('CatalogueScreen', {
          integrationItem: props?.integrationItem,
        });
      }}
      style={{
        padding: 10,                // 👈 increases touch area
        borderRadius: 14,
        marginTop: 4,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44,               // 👈 ensures 44x44 touch target
        minHeight: 44,
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // 👈 extra safe zone
    >
      <Image
        source={require('../assets/catalogue-icon.png')}
        style={{
          height: 18.67,
          width: 21,
          opacity: isCatalogueEnabled ? 1 : 0.4,
        }}
        resizeMode="contain"
        accessibilityState={{ disabled: !isCatalogueEnabled }}
      />
    </TouchableOpacity>
  </View>
)} */}

                <View style={{ justifyContent: 'center', paddingRight: 16 }}>
                    <TouchableOpacity
                        onPress={() => {
                            props.navigation.navigate('Assistant', {
                                integrationId: props?.integrationItem?._id,
                                integrationName: props?.integrationItem?.integrationName,
                            });
                        }}>
                        <MaterialCommunityIcon
                            style={{
                                fontSize: 22,
                                color: colors.primaryTextColor,
                            }}
                            name="robot-outline"
                        />
                    </TouchableOpacity>
                </View>

                <View style={{ justifyContent: 'center', paddingRight: 16 }}>
                    <TouchableOpacity
                        onPress={() => {
                            // setIsSearchEnabled(!isSearchEnabled);
                            props.navigation.navigate('ChatSearch', {
                                chatRoomId: props.chatRoomId,
                                chatRoomName: props?.integrationItem?.integrationName,
                                integrationItem: props?.integrationItem,
                            });
                        }}
                        style={{}}>
                        <VectorIcon
                            style={{
                                fontSize: isSearchEnabled ? 22 : 18,
                                color: colors.primaryTextColor,
                            }}
                            name={isSearchEnabled ? 'remove' : 'search'}
                        />
                    </TouchableOpacity>
                </View>


                <View style={{ justifyContent: 'center', paddingRight: 16 }}>
                    <TouchableOpacity onPress={props.onOptionsPressed}>
                        <MaterialCommunityIcon
                            style={{
                                fontSize: 24,
                                color: colors.primaryTextColor,
                            }}
                            name="dots-vertical"
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {/* </SafeAreaView> */}
        </View>
    );
}

export default ChatHeader;
