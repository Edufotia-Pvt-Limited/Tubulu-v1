import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../../Utils/Colors';

interface MenuProps {
  onCancel: () => void;
  top?: number;
  right?: number;
  role?: string;
  permissions: string[];
  type: 'TOPIC' | 'TASK' | 'MEMBER' | 'SUBTASK';
  isPinned?: boolean;
  onPressEdit: () => void;
  onPressDelete: () => void;
  onPressPin?: () => void;
  onPressMove?: () => void;
  onPressCreate?: () => void;
  onPressObserver?: () => void;
  removeTask?: boolean;
}

export function QTMMenuCard({
  onCancel,
  top,
  right,
  role,
  type,
  isPinned,
  permissions,
  onPressDelete,
  onPressEdit,
  onPressPin,
  onPressMove,
  onPressCreate,
  onPressObserver,
  removeTask,
}: MenuProps): JSX.Element {
  const [cardType, setCardType] = useState<string>('');
  const [roleType, setRoleType] = useState<string>('Admin');

  useEffect(() => {
    switch (role) {
      case 'MEMBER':
        return setRoleType('Member');
      case 'ADMIN':
        return setRoleType('Admin');
      case 'OBSERVER':
        return setRoleType('Observer');
      default:
        return setRoleType('Member');
    }
  }, [role]);

  useEffect(() => {
    switch (type) {
      case 'TOPIC':
        setCardType('Topic');
        break;
      case 'TASK':
        setCardType('Task');
        break;
      case 'MEMBER':
        setCardType('Member');
        break;
      case 'SUBTASK':
        setCardType('Subtask');
        break;
    }
  }, [type]);

  function renderAdminChangeOption() {
    return (
      <View style={{marginHorizontal: 6}}>
        {permissions.find(text => text == 'EDIT_MEMBER' || 'EDIT') &&
          roleType !== 'Admin' && (
            <TouchableOpacity
              onPress={onPressEdit}
              style={{
                flexDirection: 'row',
                height: 40,
                borderBottomColor: '#00000022',
                borderBottomWidth: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <FontAwesome5Icon
                name="user-cog"
                size={16}
                color={colors.backgroundColorHeader}
              />
              <Text
                style={{
                  fontSize: 16,
                  paddingLeft: 6,
                  fontWeight: '400',
                  color: colors.backgroundColorHeader,
                }}>
                {'Make Task Admin'}
              </Text>
            </TouchableOpacity>
          )}
        {permissions.find(text => text == 'EDIT') && roleType == 'Admin' && (
          <TouchableOpacity
            onPress={onPressEdit}
            style={{
              flexDirection: 'row',
              height: 40,
              borderBottomColor: '#00000022',
              borderBottomWidth: 1,
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: 10,
            }}>
            <FontAwesome5Icon
              name="user-cog"
              size={16}
              color={colors.cancelledRed}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '400',
                paddingLeft: 6,
                color: colors.cancelledRed,
              }}>
              {'Dismiss as Task Admin'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderObserverChangeOption() {
    return (
      <View style={{marginHorizontal: 6}}>
        {permissions.find(text => text == 'EDIT') &&
          roleType !== 'Observer' && (
            <TouchableOpacity
              onPress={onPressObserver}
              style={{
                flexDirection: 'row',
                height: 40,
                borderBottomColor: '#00000022',
                borderBottomWidth: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <FontAwesome5Icon
                name="binoculars"
                size={18}
                color={colors.backgroundColorHeader}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  paddingLeft: 6,
                  color: colors.backgroundColorHeader,
                }}>
                {'Make Task Observer'}
              </Text>
            </TouchableOpacity>
          )}
        {permissions.find(text => text == 'EDIT') && roleType == 'Observer' && (
          <TouchableOpacity
            onPress={onPressObserver}
            style={{
              flexDirection: 'row',
              height: 40,
              borderBottomColor: '#00000022',
              borderBottomWidth: 1,
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: 10,
            }}>
            <FontAwesome5Icon
              name="binoculars"
              size={18}
              color={colors.cancelledRed}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '400',
                paddingLeft: 6,
                color: colors.cancelledRed,
              }}>
              {'Dismiss as Task Observer'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderRemoveMemberOption() {
    return (
      <View style={{}}>
        {permissions.find(text => text == 'DELETE_MEMBER') &&
          roleType !== 'Admin' && (
            <TouchableOpacity
              onPress={onPressDelete}
              style={{
                flexDirection: 'row',
                height: 40,
                justifyContent: 'flex-start',
                borderBottomColor: '#00000022',
                padding: 10,
                alignItems: 'center',
              }}>
              <View
                style={{
                  paddingHorizontal: 0,
                  marginLeft: 5,
                  marginRight: 2,
                  width: 25,
                }}>
                <Icon
                  name={'trash-sharp'}
                  size={18}
                  style={{color: colors.cancelledRed}}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: colors.cancelledRed,
                }}>
                {'Remove Member'}
              </Text>
            </TouchableOpacity>
          )}
        {permissions.find(text => text == 'DELETE') && roleType !== 'OWNER' && (
          <TouchableOpacity
            onPress={onPressDelete}
            style={{
              flexDirection: 'row',
              height: 40,
              justifyContent: 'flex-start',
              borderBottomColor: '#00000022',
              padding: 10,
              alignItems: 'center',
            }}>
            <View
              style={{
                paddingHorizontal: 0,
                marginLeft: 5,
                marginRight: 2,
                width: 25,
              }}>
              <Icon
                name={'trash-sharp'}
                size={18}
                style={{color: colors.cancelledRed}}
              />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '400',
                color: colors.cancelledRed,
              }}>
              {'Remove Member'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // if (permissions?.length) {
  return (
    <Pressable
      onPress={onCancel}
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#00000044',
        position: 'absolute',
      }}>
      <Pressable
        style={{
          borderRadius: 10,
          width: Dimensions.get('screen').width / 2,
          backgroundColor: colors.backgroundWhite,
          position: 'absolute',
          right,
          top,
        }}>
        {!!permissions?.find(text => text == 'CREATE') &&
          cardType == 'Member' && (
            <TouchableOpacity
              onPress={onPressCreate}
              style={{
                flexDirection: 'row',
                height: 40,
                borderBottomColor: '#00000022',
                borderBottomWidth: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingHorizontal: 2,
                }}>
                <View style={{marginHorizontal: 5}}>
                  <FontAwesome5Icon
                    name="plus"
                    size={16}
                    color={colors.backgroundColorHeader}
                  />
                </View>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: colors.backgroundColorHeader,
                  marginLeft: 4,
                }}>
                Add New Sub Task
              </Text>
            </TouchableOpacity>
          )}
        {!!permissions?.find(text => text == 'EDIT') &&
          cardType !== 'Member' && (
            <TouchableOpacity
              onPress={onPressEdit}
              style={{
                flexDirection: 'row',
                height: 40,
                borderBottomColor: '#00000022',
                borderBottomWidth: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <View
                style={{
                  marginHorizontal: 6,
                }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    backgroundColor: colors.backgroundColorHeader,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <MaterialIcons
                    name="edit"
                    size={14}
                    style={{color: 'white'}}
                  />
                </View>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: '#2355C4',
                }}>
                {`Edit ${cardType}`}
              </Text>
            </TouchableOpacity>
          )}
        {cardType == 'Member' && renderAdminChangeOption()}
        {cardType == 'Member' && renderObserverChangeOption()}
        {type == 'TASK' && (
          <View>
            <TouchableOpacity
              onPress={onPressPin}
              style={{
                flexDirection: 'row',
                height: 40,
                borderBottomColor: '#00000022',
                borderBottomWidth: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <View style={{marginHorizontal: 4, width: 25}}>
                <Entypo name="pin" size={18} style={{color: '#2355C4'}} />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: '#2355C4',
                }}>
                {isPinned ? 'Remove Pin' : 'Pin to Home Screen'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onPressMove}
              style={{
                flexDirection: 'row',
                height: 40,
                borderBottomColor: '#00000022',
                borderBottomWidth: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <View style={{marginHorizontal: 4, width: 25}}>
                <MaterialCommunityIcons
                  name="folder-move"
                  size={22}
                  style={{color: removeTask ? colors.cancelledRed : '#2355C4'}}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: removeTask ? colors.cancelledRed : '#2355C4',
                }}>
                {removeTask ? 'Remove from Topic' : 'Move to Topic'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {cardType === 'Member' && renderRemoveMemberOption()}
        {!!permissions?.find(text => text == 'DELETE') &&
          cardType !== 'Member' && (
            <TouchableOpacity
              onPress={onPressDelete}
              style={{
                flexDirection: 'row',
                height: 40,
                justifyContent: 'flex-start',
                borderBottomColor: '#00000022',
                padding: 10,
                alignItems: 'center',
              }}>
              <View
                style={{
                  paddingHorizontal: 0,
                  marginLeft: 5,
                  marginRight: 2,
                  width: 25,
                }}>
                <Icon
                  name={'trash-sharp'}
                  size={18}
                  style={{color: colors.cancelledRed}}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: colors.cancelledRed,
                }}>
                {'Delete'} {cardType}
              </Text>
            </TouchableOpacity>
          )}
      </Pressable>
    </Pressable>
  );
}
// return <View></View>;
// }
