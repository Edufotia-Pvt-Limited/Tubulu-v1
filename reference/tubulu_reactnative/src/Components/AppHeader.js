import React, { useContext, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut } from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';
import VectorIcon from 'react-native-vector-icons/FontAwesome'
import ISTextInput from './ISTextInput';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { appContext } from '../Context/AppContext';

function AppHeader(props) {

  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [searchText, setSearchText] = useState('')
  const appStore = useContext(appContext);

  const _renderSearchArea = () => {
    if (isSearchEnabled) {
      return (
        <View style={{ flex: 1, width: '100%', paddingLeft: 16, paddingRight: 16, }}>
          <TextInput
            value={searchText}
            placeholder='Search...'
            underlineColorAndroid={'transparent'}
            style={{ borderBottomColor: 'black', borderBottomWidth: 1 }}
            onChangeText={text => {
              setSearchText(text);
              props?.onSearchChange?.(text);
            }}
          ></TextInput>
          {/* <ISTextInput
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
            }}
            placeholder={'Search...'}
          ></ISTextInput> */}
        </View>
      )
    }
  }

  return (
    <View style={{ backgroundColor: colors.backgroundWhite }}>
      <SafeAreaView></SafeAreaView>
      <View
        style={{
          //   backgroundColor: 'blue',
          flexDirection: 'row',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          borderBottomWidth: 4,
          borderColor: colors.primaryColor,
          height: 60,
        }}>
        <View style={{ marginLeft: 16, }}>
          <Image
            source={require('../assets/splash_logo.png')}
            style={{ height: 50, width: 40 }}
            resizeMethod={'resize'}
            resizeMode={'stretch'}></Image>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {!isSearchEnabled && <Text
            style={{
              fontFamily: 'NotoSans',
              fontSize: 24,
              color: colors.primaryTextColor,
              fontWeight: 'bold',
            }}>
            TUBULU
          </Text>}
          {isSearchEnabled && _renderSearchArea()}
        </View>
        <TouchableOpacity
          onPress={() => {
            //TODO: Take the user to the search navigation
            props.navigation.navigate('IntegrationSearch');
          }}
          style={{
            paddingRight: 16
          }}>
          <VectorIcon style={{
            fontSize: isSearchEnabled ? 22 : 16,
            color: colors.primaryTextColor
          }} name={isSearchEnabled ? 'remove' : 'search'}></VectorIcon>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingRight: 16 }}
          onPress={() => {
            appStore.actions.setIsContextMenuOpen(true);
          }}>
          {/* <Text style={{ color: colors.primaryTextColor }}>Log Out</Text> */}
          <MCIcon name="dots-vertical" style={{ color: 'black', fontSize: 24 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default AppHeader;
