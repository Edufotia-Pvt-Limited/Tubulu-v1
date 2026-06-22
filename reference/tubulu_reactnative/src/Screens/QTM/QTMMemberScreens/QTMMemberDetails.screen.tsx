import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  // SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {QTMFormHeader} from '../../../Components/QTMComponents/QTMFormHeader';
import {QTMAvatar} from '../../../Components/QTMComponents/QTMMemberCard';
import {QTMSubTaskCard} from '../../../Components/QTMComponents/QTMSubTaskCard';
import {IAppState} from '../../../Store/State';
import {
  assignedMembersAction,
  removeSubTaskInQueueForTaskAsync,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {IQTMMembers, IQTMSubTasksRequest} from '../../../models/IQTM';

interface Props {
  navigation: any;
  route: {params: {isOwner: boolean}};
}

export function QTMMemberDetailsScreen({
  navigation,
  route,
}: Props): JSX.Element {
  const [role, setRole] = useState<'MEMBER' | 'OBSERVER' | 'ADMIN' | 'OWNER'>(
    'MEMBER',
  );
  const [open, setOpen] = useState<boolean>(false);
  const [subTasks, setSubTasks] = useState<IQTMSubTasksRequest[]>([]);

  const allSubTasks = useSelector(
    (state: IAppState) => state.qtmState?.draftedSubTasksForMember,
  );

  const dispatch: any = useDispatch();

  const selectedMember = useSelector(
    (state: IAppState) => state.qtmState.selectedMember,
  );

  const assignedMembers = useSelector(
    (state: IAppState) => state.qtmState.assignedMembers,
  );

  useEffect(() => {
    if (allSubTasks?.length) {
      const _assignedSubTasks = allSubTasks?.filter(
        sItem => sItem?.assignedUserId === selectedMember?.userQTMId,
      );
      if (_assignedSubTasks?.length) {
        setSubTasks(_assignedSubTasks);
      }
    }
  }, [allSubTasks]);

  useEffect(() => {
    route?.params?.isOwner && setRole('OWNER');
  }, [route]);

  useEffect(() => {
    if (selectedMember?.role === 'ADMIN') {
      setRole('ADMIN');
    }
    if (selectedMember?.role === 'OBSERVER') {
      setRole('OBSERVER');
    }
  }, []);

  useEffect(() => {
    if (selectedMember?.userQTMId) {
      handleRoles();
    }
  }, [role]);

  function handleRoles() {
    const _roles = [...assignedMembers];
    const rolesV2 = _roles?.filter(
      member => member.qtmId !== selectedMember?.userQTMId,
    );
    const newRole = _roles?.find(
      _member => _member.qtmId == selectedMember?.userQTMId,
    );
    if (newRole && rolesV2) {
      rolesV2.push({...newRole, role});
      dispatch(assignedMembersAction(rolesV2));
    }
  }

  function renderMemberBanner(member: IQTMMembers): JSX.Element {
    const {firstName, lastName} = member;
    return (
      <View
        style={{
          paddingHorizontal: 15,
          marginTop: 30,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <QTMAvatar
            firstName={firstName}
            lastName={lastName}
            fontSize={18}
            height={48}
            width={48}
          />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              paddingLeft: 10,
              fontSize: 22,
              fontWeight: '700',
              color: colors.titleBlackColor,
              maxWidth: 200,
            }}>
            {firstName} {lastName}
          </Text>
        </View>
        {route?.params?.isOwner ? (
          <View style={{marginRight: 10, alignItems: 'center'}}>
            <Text
              style={{
                color: colors.textColorGray,
                fontSize: 18,
                fontWeight: '400',
              }}>
              Owner
            </Text>
          </View>
        ) : (
          <View>
            <TouchableOpacity
              onPress={() => {
                setOpen(!open);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 0.5,
                borderRadius: 8,
                borderColor: colors.textColorGray,
                padding: 6,
                width: 124,
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontSize: 18,
                  color: colors.backgroundColorHeader,
                  fontWeight: '400',
                }}>
                {role}
              </Text>
              <Image
                style={{
                  height: 20,
                  width: 22,
                  transform: [{rotate: open ? '60deg' : '0deg'}],
                }}
                source={require('../../../assets/soft_traingle_icon.png')}
              />
            </TouchableOpacity>
            {open && (
              <View
                style={{
                  position: 'absolute',
                  top: 33,
                  borderWidth: 0.5,
                  borderRadius: 8,
                  borderColor: colors.textColorGray,
                  height: 100,
                  width: 124,
                  justifyContent: 'center',
                  zIndex: 10,
                  backgroundColor: colors.backgroundWhite,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setRole('ADMIN');
                    setOpen(!open);
                  }}
                  style={{
                    borderBottomWidth: 0.5,
                    alignItems: 'center',
                    borderColor: colors.textColorGray,
                    paddingBottom: 4,
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: colors.backgroundColorHeader,
                      fontWeight: '400',
                    }}>
                    {'Admin'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setRole('OBSERVER');
                    setOpen(!open);
                  }}
                  style={{
                    alignItems: 'center',
                    marginTop: 4,
                    borderBottomWidth: 0.5,
                    borderColor: colors.textColorGray,

                    paddingBottom: 4,
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: colors.backgroundColorHeader,
                      fontWeight: '400',
                    }}>
                    {'Observer'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setRole('MEMBER');
                    setOpen(!open);
                  }}
                  style={{alignItems: 'center', marginTop: 4}}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: colors.backgroundColorHeader,
                      fontWeight: '400',
                    }}>
                    {'Member'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  function renderSubTasks(): JSX.Element {
    if (subTasks?.length) {
      return (
        <View style={{paddingHorizontal: 20, marginTop: 25}}>
          <FlatList
            data={subTasks}
            renderItem={({item, index}) => {
              return (
                <QTMSubTaskCard
                  name={item?.name}
                  dueDate={item?.date}
                  status={'YET_TO_START'}
                  showCross
                  onPressCross={() => {
                    const _subtasks = subTasks;
                    const newSubTasks = _subtasks?.filter(
                      (_, sIndex) => sIndex !== index,
                    );
                    dispatch(removeSubTaskInQueueForTaskAsync(newSubTasks));
                    setSubTasks(newSubTasks);
                  }}
                  onPress={() => {}}
                  onPressStatus={() => {}}
                />
              );
            }}
          />
        </View>
      );
    }
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 88,
          paddingHorizontal: 15,
        }}>
        <MaterialCommunityIcons
          name={'clipboard-check'}
          size={100}
          style={{color: '#B7B7B7'}}
        />
        <Text
          style={{
            fontSize: 20,
            fontWeight: '400',
            color: '#000000',
            width: 180,
            height: 48,
            textAlign: 'center',
            lineHeight: 24,
          }}>
          Subtask Not Available to Show
        </Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.qtmBackgroundColor}}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      <QTMFormHeader
        header="Create New Task"
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      {selectedMember && renderMemberBanner(selectedMember)}
      {renderSubTasks()}
      <TouchableOpacity
        onPress={() => {
          navigation.push('QTMNewSubTaskScreen', {isFromTask: true});
        }}
        style={{
          marginTop: 80,
          borderRadius: 8,
          backgroundColor: colors.backgroundColorHeader,
          height: 52,
          width: 262,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 40,
          alignSelf: 'center',
          zIndex: 10,
        }}>
        <Text
          style={{
            color: colors.backgroundWhite,
            fontSize: 16,
            fontWeight: '700',
          }}>
          Add New Subtask
        </Text>
      </TouchableOpacity>
    </View>
  );
}
