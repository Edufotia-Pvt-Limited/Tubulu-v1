import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LogOut } from '../Utils/ApiActions';
import { CommonActions } from '@react-navigation/native';
import { appContext } from '../Context/AppContext';

function ContextMenu(props) {

  const appStore = useContext(appContext);

  if (!appStore.state.isContextMenuOpen) {
    return (
      <></>
    )
  } else {
    return (
      <TouchableOpacity
        onPress={() => {
          appStore.actions.setIsContextMenuOpen(false);
        }}
        style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: '#00000022' }}
      >
        <View style={{
          position: 'absolute',
          backgroundColor: 'white',
          width: 200,
          height: 200,
          right: 8,
          top: 8,
          borderRadius: 8,
          borderWidth: 0.5,
          paddingLeft: 16,
          paddingTop: 16
        }}>
          <TouchableOpacity
            onPress={() => {
              appStore.actions.setIsContextMenuOpen(false);
              LogOut().then(response => {
                props.navigation?.dispatch?.(CommonActions.reset({
                  index: 0,
                  routes: [{
                    name: 'Registration',
                  }]
                }))
              }).catch(error => {
                alert("Unable to logout at the moment");
              })
            }}
          >
            <Text style={{
              fontSize: 16,
              color: 'black',
            }}>Log Out</Text>
            <View style={{ width: '100%', height: 0.5, backgroundColor: '#000000', marginTop: 8 }} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }
}

export default ContextMenu;