import {Spinner} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  // SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesomeIcon5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {QTMFormHeader} from '../../../Components/QTMComponents/QTMFormHeader';
import {QTMAvatar} from '../../../Components/QTMComponents/QTMMemberCard';
import {IAppState} from '../../../Store/State';
import {
  assignedMembersAction,
  getAllContactsAction,
  syncContactsAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import useKeyboardState from '../../../hooks/useKeyboardState';
import {IQTMContacts} from '../../../models/IQTM';

interface Props {
  navigation: any;
}

export function QTMAllContactScreen({navigation}: Props): JSX.Element {
  const syncedContacts = useSelector(
    (state: IAppState) => state.qtmState?.syncedContacts,
  );
  const loading = useSelector(
    (state: IAppState) => state.qtmState?.contactsLoading,
  );
  const assignedMembers = useSelector(
    (state: IAppState) => state.qtmState.assignedMembers,
  );

  const contactLoading = useSelector(
    (state: IAppState) => state.qtmState.contactsLoading,
  );

  const dispatch: any = useDispatch();

  const isKeyboardOpen = useKeyboardState();

  const [filteredContacts, setFilteredContacts] = useState<IQTMContacts[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<IQTMContacts[]>([]);
  const [contacts, setContacts] = useState<IQTMContacts[]>([]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    dispatch(getAllContactsAction());
    // dispatch(assignedMembersAction([]));
  }, []);

  useEffect(() => {
    handleSearch();
  }, [search]);

  useEffect(() => {
    if (assignedMembers?.length) {
      setSelectedMembers(assignedMembers);
    }
  }, [assignedMembers]);

  useEffect(() => {
    const filteredArray: IQTMContacts[] = [];
    const sortedContacts = syncedContacts
      ?.sort((a, b) => (a?.firstName < b?.firstName ? -1 : 1))
      ?.sort((a, b) => (a?.tubuluUserId ? 0 : 1) - (b?.tubuluUserId ? 0 : 1));
    for (let index = 0; index < sortedContacts.length; index++) {
      const contact = sortedContacts[index];
      if (sortedContacts[index]?.id !== sortedContacts[index - 1]?.id) {
        filteredArray.push({...contact});
      }
    }
    setFilteredContacts(filteredArray);
    setContacts(filteredArray);
  }, [syncedContacts]);

  function handleSearch() {
    const searchText = search.trim().toLowerCase();
    const _filtered = contacts?.filter(contact => {
      const lowerLastName = contact?.lastName?.toLowerCase()?.trim() || '';
      const lowerMiddleName = contact?.middleName?.toLowerCase()?.trim() || '';
      const lowerFirstName = contact?.firstName?.toLowerCase()?.trim() || '';
      return (
        lowerLastName.includes(searchText) ||
        lowerMiddleName.includes(searchText) ||
        lowerFirstName.includes(searchText)
      );
    });
    setFilteredContacts(_filtered);
  }

  async function selectedContacts() {
    // const _selectedMembers: IQTMAssignedMember[] = selectedMembers.map((member) => { return { id: member?.id, memberName: member?.firstName, phoneNumber: member?.phoneNumber } })
    await dispatch(assignedMembersAction(selectedMembers));
    setSearch('');
    navigation.goBack();
  }

  function handleSelect(contact: IQTMContacts) {
    const _selectedMembers = [...selectedMembers];
    const isPresent = _selectedMembers.filter(
      _contact =>
        _contact?.tubuluUserId == contact?.tubuluUserId &&
        contact?.role !== 'OWNER',
    );
    if (isPresent?.length) {
      const updateArray = _selectedMembers.filter(
        newContacts => newContacts?.tubuluUserId !== contact?.tubuluUserId,
      );
      setSelectedMembers(updateArray);
    } else {
      _selectedMembers.push(contact);
      setSelectedMembers(_selectedMembers);
    }
  }

  function handleInvite(contact: IQTMContacts) {
    console.log('Invite this user', contact);
  }

  function renderContactList() {
    return (
      <View style={{flex: 1, marginTop: 23}}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '400',
            color: colors.titleBlackColor,
            marginHorizontal: 15,
          }}>
          Contact
        </Text>
        <FlatList
          keyboardShouldPersistTaps={'always'}
          contentContainerStyle={
            {
              // paddingBottom: 30,
            }
          }
          // estimatedItemSize={200}
          data={filteredContacts}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  item?.tubuluUserId !== null && handleSelect(item);
                }}
                style={{
                  marginVertical: 10,
                  flexDirection: 'row',
                  marginHorizontal: 15,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image
                    style={{width: 48, height: 48, borderRadius: 200}}
                    source={require('../../../assets/contact_logo.png')}
                  />
                  <View style={{paddingLeft: 8}}>
                    <Text
                      ellipsizeMode="tail"
                      numberOfLines={1}
                      style={{
                        marginBottom: 4,
                        color: colors.titleBlackColor,
                        fontSize: 18,
                        fontWeight: '400',
                        width: Dimensions.get('screen').width * 0.6,
                      }}>
                      {item?.middleName == ''
                        ? item.firstName + ' ' + item.lastName
                        : item.firstName +
                          ' ' +
                          item?.middleName +
                          ' ' +
                          item.lastName}
                    </Text>
                    <Text
                      style={{
                        color: '#8A8A8E',
                        fontSize: 16,
                        fontWeight: '400',
                      }}>
                      {item.phoneNumber}
                    </Text>
                  </View>
                  {item?.tubuluUserId && (
                    <View
                      style={{
                        position: 'absolute',
                        alignSelf: 'flex-end',
                        left: 28,
                        bottom: -2,
                      }}>
                      <Image
                        style={{height: 24, width: 24}}
                        source={require('../../../assets/tubulu_users.png')}
                      />
                    </View>
                  )}
                </View>
                {item?.tubuluUserId == undefined && (
                  <TouchableOpacity
                    onPress={() => handleInvite(item)}
                    style={{
                      backgroundColor: colors.backgroundColorHeader,
                      borderRadius: 3,
                      height: 24,
                      width: 55,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '500',
                        color: colors.backgroundWhite,
                      }}>
                      Invite
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
        {loading && (
          <View
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
              backgroundColor: 'rgba(72, 72, 72, 0.2)',
            }}>
            <Spinner size={'lg'} />
          </View>
        )}
      </View>
    );
  }

  function renderMembers(): JSX.Element {
    if (selectedMembers?.length) {
      return (
        <View style={{maxHeight: '20%', paddingHorizontal: 15, marginTop: 23}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '400',
              color: colors.titleBlackColor,
            }}>
            Members +
          </Text>
          <FlatList
            data={selectedMembers}
            horizontal
            keyboardShouldPersistTaps={'always'}
            renderItem={({item}) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => item?.role !== 'OWNER' && handleSelect(item)}
                  style={{marginHorizontal: 10}}>
                  <View style={{alignItems: 'center', marginTop: 15}}>
                    <QTMAvatar
                      firstName={item?.firstName}
                      lastName={item?.lastName}
                      height={50}
                      width={50}
                      fontSize={18}
                    />
                    <Text
                      style={{
                        color: '#8A8A8E',
                        fontSize: 12,
                        fontWeight: '400',
                        marginTop: 6,
                        maxWidth: 50,
                      }}>
                      {item?.firstName} {item?.lastName}
                    </Text>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      backgroundColor: colors.backgroundWhite,
                      borderWidth: 0.2,
                      borderRadius: 50,
                      zIndex: 10,
                      top: 14,
                      right: -2,
                    }}>
                    {item?.role !== 'OWNER' && (
                      <Icon
                        name="close"
                        size={14}
                        style={{color: colors.titleBlackColor, padding: 2}}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      );
    }
    return <></>;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundWhite,
      }}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      <QTMFormHeader
        showSync
        header="Task Assign To"
        handleSync={() => dispatch(syncContactsAction())}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      {contactLoading && (
        <View
          style={{
            zIndex: 100,
            backgroundColor: colors.greenBackground,
            height: 40,
            width: '50%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
            top: Platform.OS === 'ios' ? 70 : 10,
            position: 'absolute',
            alignSelf: 'center',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <FontAwesomeIcon5
              name="sync"
              size={14}
              color={colors.backgroundWhite}
            />
            <Text
              style={{
                color: colors.backgroundWhite,
                fontSize: 16,
                fontWeight: '500',
                marginLeft: 10,
              }}>
              Syncing the Contacts
            </Text>
          </View>
        </View>
      )}
      <View
        style={{
          marginTop: 25,
          marginHorizontal: 15,
          height: 56,
          width: 'auto',
          borderWidth: 1,
          borderRadius: 8,
          borderColor: '#B7B7B7',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 14,
        }}>
        <Icon name="search" color={colors.backgroundColorHeader} size={20} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            paddingHorizontal: 10,
          }}>
          <TextInput
            style={{
              height: 'auto',
              flex: 1,
              color: colors.backgroundColorHeader,
              fontSize: 16,
              fontWeight: '400',
            }}
            value={search}
            placeholder="Search Contacts"
            placeholderTextColor={'#2355C4'}
            onChangeText={setSearch}
          />
          {search?.length !== 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon
                name="close-circle"
                color={colors.backgroundColorHeader}
                size={22}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {renderMembers()}
      {renderContactList()}
      {!isKeyboardOpen && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 20,
          }}>
          <TouchableOpacity
            onPress={() => selectedContacts()}
            style={{
              borderRadius: 8,
              backgroundColor: colors.backgroundColorHeader,
              height: 52,
              width: 262,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: colors.backgroundWhite,
                fontSize: 16,
                fontWeight: '700',
              }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
