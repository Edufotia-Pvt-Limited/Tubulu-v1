import {CommonActions} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  // SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import IonIcon from 'react-native-vector-icons/Ionicons';
import {useDispatch} from 'react-redux';
import {resetChatState} from '../Store/chat.store/chat.actions';
import {resetQTMState} from '../Store/qtm.store/qtm.actions';
import {DeleteAccount, getUserSelfDetails, LogOut} from '../Utils/ApiActions';
import {colors} from '../Utils/Colors';
import {DeleteQTMUserAccount} from '../Utils/QTM.ApiActions';

interface Props {
  readonly navigation: any;
}

export function DeleteAccountScreen({navigation}: Props): JSX.Element {
  const [resourcePath, setresourcePath] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');

  const dispatch = useDispatch();

  useEffect(() => {
    getProfileDetails();
  }, []);

  async function getProfileDetails() {
    try {
      const {
        data: {firstName, lastName, profilePictureUrl},
      } = await getUserSelfDetails();
      setresourcePath(profilePictureUrl);
      setFirstName(firstName);
    } catch (error) {
      console.log('Unable to get the profile details at the moment');
    }
  }

  async function onLogout() {
    await LogOut()
      .then(response => {
        navigation?.dispatch?.(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Registration',
              },
            ],
          }),
        );
      })
      .catch(error => {
        console.log(error);
        console.log('Unable to logout at the moment');
      });
  }

  async function handleDeleteAccount() {
    await DeleteQTMUserAccount();
    await dispatch(resetQTMState());
    await dispatch(resetChatState());
    await DeleteAccount();
    await onLogout();
  }

  function renderHeader() {
    return (
      <View
        style={{
          height: 60,
          backgroundColor: colors.backgroundWhite,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <View style={{flex: 1}}>
          <TouchableOpacity
            style={{
              paddingLeft: 16,
            }}
            onPress={() => {
              navigation.goBack();
            }}>
            <IonIcon
              name={'arrow-back'}
              style={{color: '#2355C4', fontSize: 24}}
            />
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text
            style={{
              color: 'black',
              fontSize: 16,
              fontWeight: '500',
            }}>
            Delete Account
          </Text>
        </View>
        <View style={{flex: 1}} />
      </View>
    );
  }

  function PageContent(): JSX.Element {
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <View style={{flex: 5, alignItems: 'center'}}>
          <View
            style={{
              marginTop: 80,
              height: 180,
              width: 180,
              borderWidth: 2,
              borderColor: '#2355C4',
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={{uri: resourcePath}}
              style={{
                height: 165,
                width: 165,
                borderWidth: 0.2,
                borderRadius: 100,
              }}
            />
          </View>
          <View
            style={{
              alignItems: 'center',
              marginTop: 25,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 24,
                flexWrap: 'wrap',
                color: colors.backgroundColorHeader,
              }}>
              {firstName}, Delete your account?
            </Text>
            <View
              style={{
                marginTop: 25,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: Dimensions.get('screen').width * 0.85,
              }}>
              <IonIcon
                name="warning"
                size={24}
                color={colors.inProgressYellow}
              />
              <View
                style={{
                  marginLeft: 10,
                }}>
                {/* <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 16,
                    flexWrap: 'wrap',
                    color: colors.titleBlackColor,
                  }}>
                  This action will,
                </Text> */}
                {/* <Text
                  allowFontScaling={false}
                  style={{
                    marginTop: 5,
                    fontSize: 14,
                    flexWrap: 'wrap',
                    color: colors.titleBlackColor,
                  }}>
                  - Remove all the information and data associated with this
                  account
                </Text> */}
                <Text
                  allowFontScaling={false}
                  style={{
                    marginTop: 4,
                    fontSize: 14,
                    flexWrap: 'wrap',
                    color: colors.titleBlackColor,
                  }}>
                  This action will delete your account from this device.
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{flex: 1}}>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={{
              width: Dimensions.get('screen').width * 0.8,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.errorRed,
              borderRadius: 8,
            }}>
            <Text style={{fontSize: 16, color: colors.backgroundWhite}}>
              Yes, Delete my account
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={{
              width: Dimensions.get('screen').width * 0.8,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.backgroundWhite,
              // borderWidth: 0.5,
              borderRadius: 8,
            }}>
            <Text style={{color: colors.backgroundColorHeader}}>
              No, keep my account
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.backgroundWhite}}>
      <SafeAreaView />
      {renderHeader()}
      <PageContent />
    </View>
  );
}
