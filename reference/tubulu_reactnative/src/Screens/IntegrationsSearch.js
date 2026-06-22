import NetInfo from '@react-native-community/netinfo';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DotsLoader from '../Components/CustomDotsLoader';
import { default as FAIcon, default as IonIcon } from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import IntegrationListItem from '../Components/IntegrationListItem';
import ISTextInput from '../Components/ISTextInput';
import { GetIntegrationsList } from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';
import { debounce } from '../Utils/debounce';

function IntegrationSearchHeader(props) {
    return (
        <View
            style={{
                backgroundColor: colors.backgroundWhite,
                borderBottomColor: colors.primaryColor,
                borderBottomWidth: 6,
                maxHeight: 64,
                flex: 1,
            }}>
            <SafeAreaView />
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Text
                    style={{
                        fontFamily: 'NotoSans',
                        fontSize: 24,
                        color: colors.primaryTextColor,
                        fontWeight: 'bold',
                    }}>
                    Search Integrations
                </Text>
            </View>
        </View>
    );
}

function IntegrationSearch(props) {
    const [searchText, setSearchText] = useState('');
    const [inputSearch, setInputSearch] = useState("")
    const [integrations, setIntegrations] = useState([]);
    const [displayLoading, setDisplayLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const [online, isOnline] = useState(false);

    const integrationsMaster = useSelector(
        state => state.integrationState.integrationMaster,
    );

    useEffect(() => {
        NetInfo.addEventListener(state => {
            isOnline(state.isConnected);
            state.isConnected == false && setIntegrations(integrationsMaster);
        });
    }, []);

    useEffect(() => {
         setCurrentPage(0);
    setIntegrations([]);
        _fetchIntegrationList(searchText);
    }, [searchText]);

    useEffect(() => {
        if (!online) {
            if (searchText) {
                _searchOfflineIntegrations(searchText);
            }
        }
    }, [searchText, online]);

    useEffect(() => {
        if (online) {
            props.navigation.addListener('focus', e => {
                setIntegrations([]);
                _fetchIntegrationList();
            });
            if (currentPage > 0) {
                _fetchIntegrationList(searchText);
            }
        }
    }, [currentPage, online]);

    function _fetchIntegrationList(_searchText = '') {
        setDisplayLoading(true);
        GetIntegrationsList(currentPage, 10, _searchText)
            .then(response => {
             
                setDisplayLoading(false);
                //  setIntegrations([...integrations, ...response.data]);
                setIntegrations(prev =>
    currentPage === 0 ? response.data : [...prev, ...response.data]
);

            })
            .catch(error => {
                setDisplayLoading(false);
                console.log(error);
            });
    }

    function _searchOfflineIntegrations(_searchText) {
        setDisplayLoading(true);
        const _searchResponseList = integrationsMaster?.filter(item =>
            item?.integrationName
                ?.toLowerCase()
                ?.includes(_searchText?.toLowerCase()?.trim()),
        );
        if (_searchResponseList?.length) {
            setDisplayLoading(false);
            setIntegrations(_searchResponseList);
        } else {
            setDisplayLoading(false);
            setIntegrations(integrationsMaster);
        }
    }


      const debouncedSetSearch = useCallback(
        // debounce((value) => props.setSearchProduct(value), 300),
        debounce((value) => setSearchText(value), 500),
        []
      );


    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'column',
                backgroundColor: colors.backgroundWhite,
            }}>
            <SafeAreaView />
            <View
                style={{
                    marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 16,
                }}>
                <TouchableOpacity
                    onPress={() => {
                        props.navigation.goBack();
                    }}>
                    <IonIcon
                        name="arrow-back"
                        style={{
                            fontSize: 20,
                            color: colors.textBlueColor,
                        }}
                    />
                </TouchableOpacity>
                <View
                    style={{
                        paddingHorizontal: 8,
                        flex: 1,
                    }}>
                    <ISTextInput
                        autoFocus={true}
                        placeholder={'Search...'}
                        value={inputSearch}
                        borderWidth={1}
                        leftIcon={<FAIcon name={'search'} style={{ fontSize: 22 }} />}
                        onChangeText={text => {
                            //TODO: Debounce the search
                            setInputSearch(text)
                            debouncedSetSearch(text)
                            // setCurrentPage(0);
                            // setIntegrations([]);
                            //
                        }}
                    />
                </View>
            </View>
            <View
                style={{
                    marginTop: 8,
                    flex: 1,
                }}>
                <FlatList
                    keyboardShouldPersistTaps="always"
                    onEndReached={() => {
                        setCurrentPage(currentPage + 1);
                    }}
                    data={integrations}
                    onEndReachedThreshold={0.1}
                    renderItem={item => (
                        <View style={{ flex: 1 }}>
                            <IntegrationListItem navigation={props.navigation} item={item} />
                        </View>
                    )}
                />
            </View>
            {displayLoading && (
                <View
                    style={{
                        paddingBottom: 16,
                        height: 40,
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        bottom: 10,
                    }}>
                    <DotsLoader color={colors.primaryColor} />
                </View>
            )}
        </View>
    );
}

export default IntegrationSearch;
