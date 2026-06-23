import {Spinner, useToast} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  // SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmationPopup} from '../../../Components/ConfirmationPopup';
import {QTMAddOptions} from '../../../Components/QTMComponents/QTMAddOptions';
import {QTMGroupChatButton} from '../../../Components/QTMComponents/QTMGroupChatButton';
import {QTMHeader} from '../../../Components/QTMComponents/QTMHeader';
import {
  QTMAvatar,
  QTMMemberCard,
} from '../../../Components/QTMComponents/QTMMemberCard';
import {QTMMenuCard} from '../../../Components/QTMComponents/QTMMenuComponents';
import {QTMTopicAddModal} from '../../../Components/QTMComponents/QTMTopicAddModal';
import {IAppState} from '../../../Store/State';
import {
  getTaskAttachmentsAction,
  removeTaskMembersByTaskIdAndMemberIdAction,
  selectedMemberAction,
  updateMemberRoleAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {QTMformattedDate} from '../../../Utils/Helper';
import {getTaskAttachmentCount} from '../../../Utils/QTM.ApiActions';
import {IQTMMembers} from '../../../models/IQTM';

interface Props {
  navigation: any;
}

interface ProgressProps {
  readonly wattages: {
    cancelled: number;
    inProgress: number;
    completed: number;
  };
}

function QTMProgressBar({wattages}: ProgressProps): JSX.Element {
  const [percentage, setPercentage] = useState({
    cancelled: 0,
    completed: 0,
  });

  useEffect(() => {
    buildPercentage();
  }, [wattages]);

  function buildPercentage() {
    const total = wattages.cancelled + wattages.completed + wattages.inProgress;
    let _percentage = {
      cancelled: (wattages.cancelled / total) * 100,
      completed: (wattages.completed / total) * 100,
    };
    setPercentage(_percentage);
  }

  return (
    <View style={{flexDirection: 'row', flex: 1}}>
      <View
        style={{
          height: 10,
          backgroundColor: colors.completedGreen,
          width: `${percentage.completed}%`,
          borderRadius: 20,
          position: 'absolute',
          zIndex: 10,
        }}
      />
      <View
        style={{
          height: 10,
          backgroundColor: colors.cancelledRed,
          width: `${percentage.completed + percentage.cancelled}%`,
          borderRadius: 20,
          position: 'absolute',
          zIndex: 5,
        }}
      />
      <View
        style={{
          height: 10,
          backgroundColor: colors.inProgressYellow,
          width: '100%',
          borderRadius: 20,
          position: 'absolute',
        }}
      />
    </View>
  );
}

export function QTMTaskDetailsScreen({navigation}: Props): JSX.Element {
  const [displayQTMAddOptions, setDisplayQTMAddOptions] =
    useState<boolean>(false);

  const [count, setCount] = useState<number>(0);

  const selectedTaskMembers = useSelector(
    (state: IAppState) => state.qtmState.selectedTaskMembers,
  );
  const selectedTopic = useSelector(
    (state: IAppState) => state.qtmState.selectedTopic,
  );
  const selectedTask = useSelector(
    (state: IAppState) => state.qtmState.selectedTask,
  );
  const userDetails = useSelector(
    (state: IAppState) => state.qtmState.userDetails,
  );
  const loading = useSelector((state: IAppState) => state.qtmState.taskLoading);

  const dispatch: any = useDispatch();
  const toast = useToast();

  const [displayMenu, setDisplayMenu] = useState<boolean>(false);

  const [menuTop, setMenuTop] = useState<number | undefined>(undefined);
  const [menuRight, setMenuRight] = useState<number | undefined>(undefined);
  const [role, setRole] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<IQTMMembers>(
    {} as IQTMMembers,
  );

  const [showDeleteConfirmation, setDeleteConfirmation] =
    useState<boolean>(false);

  const [showMore, setShowMore] = useState<boolean>(false);

  const [viewMore, setViewMore] = useState<boolean>(false);
  const [mode, setMode] = useState<'VIEW' | 'EDIT' | 'CREATE'>('VIEW');

  useEffect(() => {
    if (selectedTask?.id) {
      getCount(selectedTask?.id);
      dispatch(getTaskAttachmentsAction(selectedTask?.id));
    }
  }, [selectedTask]);

  const goToQTMTaskScreen = () => {
    setDisplayQTMAddOptions(!displayQTMAddOptions);
    navigation.push('QTMNewTaskScreen', {navigation});
  };

  const goToQTMTopicScreen = () => {
    // navigation.push('QTMNewTopicScreen', {navigation});
    setDisplayQTMAddOptions(!displayQTMAddOptions);
    setTimeout(() => {
      setMode('CREATE');
      setViewMore(true);
    }, 300);
  };

  async function getCount(taskId: number) {
    const count = await getTaskAttachmentCount(taskId);
    setCount(count);
  }

  const renderMembers = () => (
    <View style={{height: 'auto'}}>
      {selectedTaskMembers &&
        selectedTaskMembers.map(member => {
          return (
            <QTMMemberCard
              name={member.firstName}
              lastName={member?.lastName}
              role={member?.role}
              data={member?.wattages}
              subTasks={member?.subTaskCount}
              overdue={member?.dueSubTasks}
              showMenu={!!member?.permissions?.length}
              onPress={() => {
                dispatch(selectedMemberAction(member));
                navigation.push('QTMSubTaskDetailsScreen', {
                  permissions: member.permissions,
                });
              }}
              onPressMenu={event => {
                setRole(member?.role);
                setDisplayMenu(true);
                setSelectedMember(member);
                if (
                  event.nativeEvent.pageY >
                  Dimensions.get('screen').height * 0.74
                ) {
                  setMenuTop(Dimensions.get('screen').height * 0.72);
                } else {
                  const locationY = event.nativeEvent.pageY + 5;
                  setMenuTop(locationY);
                }
                const locationX = event.nativeEvent.pageX - 320;
                setMenuRight(locationX);
                setDisplayMenu(true);
              }}
            />
          );
        })}
    </View>
  );

  const renderChatBubble = () => (
    <View
      style={{
        marginTop: 17,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: '#868080',
      }}>
      <View
        style={{
          marginVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <QTMAvatar
          firstName={userDetails?.firstName ?? ''}
          lastName={userDetails?.lastName ?? ''}
          fontSize={16}
        />
        <Text
          style={{
            color: colors.titleBlackColor,
            fontSize: 18,
            fontWeight: '700',
            marginLeft: 8,
          }}>
          {userDetails?.firstName} {userDetails?.lastName}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          justifyContent: 'center',
          marginBottom: 16,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TextInput
            style={{
              paddingLeft: 12,
              height: 'auto',
              width: '84%',
              color: colors.backgroundColorHeader,
              fontSize: 16,
              fontWeight: '400',
              borderColor: 'grey',
              borderWidth: 0.5,
              borderRadius: 8,
              marginRight: 10,
            }}
            placeholder="Type"
            placeholderTextColor={colors.backgroundColorHeader}
            multiline
          />
          <Pressable
            style={{
              backgroundColor: colors.backgroundColorHeader,
              height: 44,
              width: 44,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FontAwesome5Icon color={'white'} name="arrow-right" size={18} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: colors.backgroundWhite}}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      <QTMHeader
        headerTitle={'Tubulu QTM'}
        onPressOptions={() => {
          // goToQTMTaskScreen();
          setDisplayQTMAddOptions(!displayQTMAddOptions);
        }}
        onPressBack={() => {
          navigation.navigate('HomeScreen', {isFromTaskDetails: true});
        }}
      />
      <ScrollView style={{flexGrow: 1}}>
        <View
          style={{
            paddingHorizontal: 15,
            marginTop: 30,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <Text
            style={{
              color: colors.titleBlackColor,
              fontSize: 22,
              fontWeight: '700',
              marginBottom: 10,
            }}>
            {selectedTask?.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('QTMAttachmentScreen', {
                navigation,
                from: 'TASK',
              });
            }}
            style={{
              backgroundColor: colors.backgroundColorHeader,
              height: 31,
              width: 71,
              borderRadius: 4,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <MaterialIcons
              name="attach-file"
              size={18}
              style={{
                color: colors.backgroundWhite,
                transform: [{rotate: '45deg'}],
              }}
            />
            <Text
              style={{
                color: colors.backgroundWhite,
                fontSize: 16,
                fontWeight: '700',
                marginLeft: 4,
              }}>
              {count}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            paddingHorizontal: 15,
            marginTop: 22,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
            }}>
            <Text
              allowFontScaling={false}
              style={{fontSize: 14, fontWeight: '400', color: '#868080'}}>
              {'Created Date: '}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.titleBlackColor,
              }}>
              {QTMformattedDate(selectedTask?.createdAt)}
            </Text>
          </View>
        </View>
        <View style={{paddingHorizontal: 15, marginTop: 20}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{marginRight: 22}}>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  color: '#868080',
                  marginBottom: 2,
                }}>
                Completed
              </Text>
              <View
                style={{
                  backgroundColor: colors.completedGreen,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: colors.backgroundWhite,
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                  {selectedTask?.wattages?.completed ?? 0}
                </Text>
              </View>
            </View>
            <View style={{marginRight: 22}}>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  color: '#868080',
                  marginBottom: 2,
                }}>
                Cancelled
              </Text>
              <View
                style={{
                  backgroundColor: colors.cancelledRed,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: colors.backgroundWhite,
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                  {selectedTask?.wattages?.cancelled ?? 0}
                </Text>
              </View>
            </View>
            <View style={{marginRight: 22}}>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  color: '#868080',
                  marginBottom: 2,
                }}>
                In Progress
              </Text>
              <View
                style={{
                  backgroundColor: colors.inProgressYellow,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: colors.backgroundWhite,
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                  {selectedTask?.wattages?.inProgress ?? 0}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{paddingHorizontal: 15}}>
          {selectedTask?.wattages && (
            <Text
              allowFontScaling={false}
              style={{
                color: '#868080',
                fontSize: 14,
                fontWeight: '400',
                alignSelf: 'flex-end',
                marginBottom: 6,
                paddingHorizontal: 6,
              }}>
              {selectedTask?.wattages?.completed +
                selectedTask?.wattages?.cancelled +
                selectedTask?.wattages?.inProgress}
            </Text>
          )}
          {selectedTask?.wattages && (
            <QTMProgressBar wattages={selectedTask?.wattages} />
          )}
        </View>
        <View style={{paddingHorizontal: 15, marginTop: 27}}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.titleBlackColor,
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 10,
            }}>
            Description
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              color: '#868080',
              fontSize: 14,
              fontWeight: '400',
              textAlign: 'justify',
              lineHeight: 19,
            }}>
            {selectedTask?.description !== undefined &&
            selectedTask?.description.length > 250 &&
            !showMore
              ? selectedTask?.description.substring(0, 234)
              : selectedTask?.description}
            {selectedTask?.description !== undefined &&
              selectedTask?.description.length > 230 && (
                <Text
                  onPress={() => setShowMore(!showMore)}
                  allowFontScaling={false}
                  style={{
                    color: colors.backgroundColorHeader,
                    fontSize: 14,
                    fontWeight: '400',
                  }}>
                  {showMore ? ' Show less' : '...Show more'}
                </Text>
              )}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 15,
            marginTop: 39,
            flex: 1,
            paddingBottom: 30,
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.titleBlackColor,
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 3,
            }}>
            Members
          </Text>
          {renderMembers()}
          {/* <Text
            style={{
              color: colors.titleBlackColor,
              fontSize: 18,
              fontWeight: '700',
              marginTop: 8,
            }}>
            Recent Activity
          </Text>
          {renderChatBubble()} */}
          <View style={{marginVertical: 30}} />
        </View>
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          bottom: -20,
          right: 30,
          marginVertical: 40,
        }}>
        <QTMGroupChatButton
          onPress={() => {
            navigation.push('QTMGroupChatScreen', {navigation});
          }}
          // unreadCount={1}
        />
      </View>
      {displayQTMAddOptions && (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top:
              Platform.OS === 'ios'
                ? Dimensions.get('screen').height * 0.127
                : 60,
          }}>
          <QTMAddOptions
            addTaskPressed={goToQTMTaskScreen}
            addTopicPressed={goToQTMTopicScreen}
            onCancel={() => setDisplayQTMAddOptions(!displayQTMAddOptions)}
          />
        </View>
      )}
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
      {displayMenu && (
        <QTMMenuCard
          type="MEMBER"
          permissions={selectedMember?.permissions}
          role={role}
          right={menuRight}
          top={menuTop}
          onCancel={() => setDisplayMenu(false)}
          onPressCreate={() => {
            setDisplayMenu(false);
            dispatch(selectedMemberAction(selectedMember));
            navigation.navigate('QTMNewSubTaskScreen', {navigation});
          }}
          onPressObserver={() => {
            setDisplayMenu(false);
            dispatch(
              updateMemberRoleAction(
                selectedMember.taskId,
                selectedMember.userId,
                selectedMember.role !== 'OBSERVER' ? 'OBSERVER' : 'MEMBER',
              ),
            );
            toast.show({
              description: 'Changed role successfully',
              bgColor: colors.greenBackground,
              color: colors.backgroundWhite,
              rounded: 'lg',
            });
          }}
          onPressEdit={() => {
            setDisplayMenu(false);
            dispatch(
              updateMemberRoleAction(
                selectedMember.taskId,
                selectedMember.userId,
                selectedMember.role !== 'ADMIN' ? 'ADMIN' : 'MEMBER',
              ),
            );
            toast.show({
              description: 'Changed role successfully',
              bgColor: colors.greenBackground,
              color: colors.backgroundWhite,
              rounded: 'lg',
            });
          }}
          onPressDelete={() => {
            setDeleteConfirmation(true);
          }}
        />
      )}
      {showDeleteConfirmation && (
        <ConfirmationPopup
          title={'Remove Member?'}
          subTitle={'Do you really want to remove this Member?'}
          onCancel={() => {
            setDeleteConfirmation(false);
            setDisplayMenu(false);
          }}
          yesText={'Yes'}
          onSave={() => {
            setDeleteConfirmation(false);
            setDisplayMenu(false);
            dispatch(
              removeTaskMembersByTaskIdAndMemberIdAction(
                selectedMember.taskId,
                selectedMember.userId,
              ),
            );
            toast.show({
              description: 'Removed member successfully',
              bgColor: colors.greenBackground,
              color: colors.backgroundWhite,
              rounded: 'lg',
            });
          }}
        />
      )}
      <QTMTopicAddModal
        visible={viewMore}
        setModalClose={() => {
          setViewMore(false);
          setMode('VIEW');
        }}
        mode={mode}
      />
    </View>
  );
}
