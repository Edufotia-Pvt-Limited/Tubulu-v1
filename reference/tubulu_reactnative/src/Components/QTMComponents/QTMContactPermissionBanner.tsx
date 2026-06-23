import React, {useEffect, useState} from 'react';
import {Linking, Text, TouchableOpacity, View} from 'react-native';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {colors} from '../../Utils/Colors';

export function QTMContactPermissionBanner() {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    checkPermission();
  }, []);

  function checkPermission() {
    check(PERMISSIONS.IOS.CONTACTS).then(result => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          setShow(false);
          console.log(
            'This feature is not available (on this device / in this context)',
          );
          break;
        case RESULTS.DENIED:
          setShow(true);
          console.log(
            'The permission has not been requested / is denied but requestable',
          );
          break;
        case RESULTS.LIMITED:
          setShow(false);
          console.log('The permission is limited: some actions are possible');
          break;
        case RESULTS.GRANTED:
          setShow(false);
          console.log('The permission is granted');
          break;
        case RESULTS.BLOCKED:
          setShow(true);
          console.log('The permission is denied and not requestable anymore');
          break;
      }
    });
  }

  return (
    show && (
      <View
        style={{
          marginHorizontal: 10,
          marginTop: 15,
          padding: 10,
          borderWidth: 0.2,
          borderRadius: 6,
          borderColor: colors.textGrey,
          backgroundColor: colors.backgroundWhite,
          elevation: 5,
          shadowOpacity: 0.16,
          shadowOffset: {
            height: 2,
            width: 0,
          },
          shadowColor: 'rgba(0, 0, 0, 0.8)',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.titleBlackColor,
              fontSize: 16,
              fontWeight: '500',
            }}>
            <AntDesignIcon
              name="exclamationcircle"
              size={18}
              color={colors.errorRed}
            />{' '}
            Access to Contacts
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShow(false);
            }}>
            <AntDesignIcon name="close" size={18} />
          </TouchableOpacity>
        </View>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textGrey,
            marginTop: 5,
            fontSize: 14,
          }}>
          For seamless integration with Quick Task Manager, please allow Tubulu
          to access your contacts.
        </Text>
        <View
          style={{
            borderTopWidth: 0.2,
            marginTop: 10,
            borderColor: colors.textGrey,
          }}>
          <TouchableOpacity
            onPress={() => {
              Linking.openSettings();
            }}
            style={{paddingTop: 10}}>
            <Text
              allowFontScaling={false}
              style={{color: colors.showMoreBlueColor, fontSize: 14}}>
              Allow in Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  );
}
