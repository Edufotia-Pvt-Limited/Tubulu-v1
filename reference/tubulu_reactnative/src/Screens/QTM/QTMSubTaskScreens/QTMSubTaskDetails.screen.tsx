import {Spinner, useToast} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  // SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmationPopup} from '../../../Components/ConfirmationPopup';
import {QTMAddOptions} from '../../../Components/QTMComponents/QTMAddOptions';
import {QTMPieChart} from '../../../Components/QTMComponents/QTMCommonComponents';
import {QTMDateExtensionSheetModal} from '../../../Components/QTMComponents/QTMDateExtensionSheet';
import {QTMHeader} from '../../../Components/QTMComponents/QTMHeader';
import {QTMAvatar} from '../../../Components/QTMComponents/QTMMemberCard';
import {QTMMenuCard} from '../../../Components/QTMComponents/QTMMenuComponents';
import {QTMStatusSheetModal} from '../../../Components/QTMComponents/QTMStatusSheetModal';
import {QTMStatusUpdateModal} from '../../../Components/QTMComponents/QTMStatusUpdateModal';
import {QTMSubTaskCard} from '../../../Components/QTMComponents/QTMSubTaskCard';
import {getChartData} from '../../../Components/QTMComponents/QTMTaskCard';
import {QTMTopicAddModal} from '../../../Components/QTMComponents/QTMTopicAddModal';
import {IAppState} from '../../../Store/State';
import {
  getSubTaskDetailsBySubTaskIdAction,
  getSubTasksByMemberIdAndTaskIdAction,
  refreshAllAction,
  removeQTMSubTaskBySubTaskIdAction,
  selectedSubTaskAction,
  updateSubTaskStatusAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {IQTMMembers, IQTMSubTasks} from '../../../models/IQTM';

interface Props {
  navigation: any;
  route: any;
}

export function QTMSubTaskDetailsScreen({
  navigation,
  route,
}: Props): JSX.Element {
  const permissions = route?.params?.permissions ?? [];
  console.log('🚀 ~ permissions:', permissions);
  const [displayQTMAddOptions, setDisplayQTMAddOptions] =
    useState<boolean>(false);
  const [displayStatusUpdateModal, setDisplayStatusModal] =
    useState<boolean>(false);

  const subTasks = useSelector((state: IAppState) => state.qtmState.subTasks);
  const loading = useSelector(
    (state: IAppState) => state.qtmState.subTaskLoading,
  );

  const selectedTopic = useSelector(
    (state: IAppState) => state.qtmState.selectedTopic,
  );
  const selectedMember = useSelector(
    (state: IAppState) => state.qtmState?.selectedMember,
  );
  const userDetails = useSelector(
    (state: IAppState) => state.qtmState.userDetails,
  );

  const dispatch: any = useDispatch();

  const toast = useToast();

  const [selectedSubTask, setSelectedSubTask] = useState<IQTMSubTasks>(
    {} as IQTMSubTasks,
  );

  const [reviewDetails, setReviewDetails] = useState({
    rating: 0,
    description: '',
  });

  const [displayMenu, setDisplayMenu] = useState<boolean>(false);

  const [menuTop, setMenuTop] = useState<number | undefined>(undefined);
  const [menuRight, setMenuRight] = useState<number | undefined>(undefined);

  const [open, setIsOpen] = useState<boolean>(false);

  const [showDeleteConfirmation, setDeleteConfirmation] =
    useState<boolean>(false);

  const [viewMore, setViewMore] = useState<boolean>(false);
  const [mode, setMode] = useState<'VIEW' | 'EDIT' | 'CREATE'>('VIEW');

  const [openDESheet, setOpenDESheet] = useState<boolean>(false);

  useEffect(() => {
    if (selectedMember?.taskId && selectedMember?.userQTMId) {
      dispatch(
        getSubTasksByMemberIdAndTaskIdAction(
          selectedMember?.userQTMId,
          selectedMember?.taskId,
        ),
      );
    }
  }, [selectedMember]);

  function handleReviewStars(counts: number) {
    setReviewDetails({
      ...reviewDetails,
      rating: counts,
    });
    if (reviewDetails.rating == counts) {
      setReviewDetails({
        ...reviewDetails,
        rating: counts - 1,
      });
    }
  }

  async function submitReview() {
    if (selectedSubTask?.id) {
      await dispatch(
        updateSubTaskStatusAction({
          ...reviewDetails,
          subTaskId: selectedSubTask?.id,
          status: 'COMPLETED',
        }),
      );
      setDisplayStatusModal(false);
      setSelectedSubTask({} as IQTMSubTasks);
      setReviewDetails({
        description: '',
        rating: 0,
      });
      toast.show({
        description: 'Status updated successfully',
        bgColor: colors.greenBackground,
        color: colors.backgroundWhite,
        rounded: 'lg',
      });
      await dispatch(refreshAllAction());
    }
  }

  async function submitCancelStatus(item: IQTMSubTasks) {
    await dispatch(
      updateSubTaskStatusAction({
        subTaskId: item.id,
        description: '',
        status: 'CANCELLED',
      }),
    );
    await dispatch(refreshAllAction());
  }

  async function submitInProgressStatus(item: IQTMSubTasks) {
    await dispatch(
      updateSubTaskStatusAction({
        subTaskId: item.id,
        description: '',
        status: 'IN_PROGRESS',
      }),
    );
    await dispatch(refreshAllAction());
  }

  function goToQTMTaskScreen() {
    setDisplayQTMAddOptions(!displayQTMAddOptions);
    navigation.navigate('QTMNewTaskScreen', {navigation});
  }

  function goToQTMTopicScreen() {
    // navigation.push('QTMNewTopicScreen', {navigation});
    setDisplayQTMAddOptions(!displayQTMAddOptions);
    setTimeout(() => {
      setMode('CREATE');
      setViewMore(true);
    }, 300);
  }

  function renderMemberBanner(member: IQTMMembers): JSX.Element {
    const {firstName, lastName} = member;
    return (
      <View style={{marginHorizontal: 17, marginTop: 25}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <QTMAvatar
              firstName={firstName}
              lastName={lastName}
              height={44}
              width={44}
              fontSize={18}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 22,
                marginLeft: 10,
                fontWeight: '700',
                color: colors.titleBlackColor,
              }}>
              {firstName} {lastName}
            </Text>
          </View>
          <View style={{}}>
            {selectedMember?.wattages && (
              <QTMPieChart
                size={90}
                data={getChartData(selectedMember?.wattages)}
              />
            )}
          </View>
        </View>
        <View
          style={{marginTop: 10, paddingHorizontal: 10, flexDirection: 'row'}}>
          <Text style={{color: '#8A8A8E', fontSize: 16, fontWeight: '400'}}>
            {subTasks?.length !== 0
              ? `${selectedMember?.subTaskCount} Subtask`
              : 'No subtask assigned'}
          </Text>
          {selectedMember?.dueSubTasks !== undefined &&
            selectedMember?.dueSubTasks !== 0 && (
              <Text
                style={{
                  color: colors.cancelledRed,
                  fontWeight: '400',
                  fontSize: 16,
                  marginLeft: 4,
                }}>
                | {selectedMember?.dueSubTasks} Overdue
              </Text>
            )}
        </View>
      </View>
    );
  }

  function renderSubTasks(): JSX.Element {
    if (subTasks?.length) {
      return (
        <View
          style={{
            height: permissions?.length > 0 ? '60%' : '70%',
            marginTop: 5,
          }}>
          <FlatList
            data={subTasks}
            renderItem={({item}) => {
              return (
                <QTMSubTaskCard
                  key={item.id}
                  showMenu={!!item?.permissions?.length}
                  name={item?.name}
                  dueDate={item?.endDate}
                  status={item?.status}
                  rating={
                    item?.status == 'COMPLETED'
                      ? item?.subTaskFeedbacks?.[0]?.rating
                      : undefined
                  }
                  onPress={() => {
                    dispatch(selectedSubTaskAction(item));
                    dispatch(getSubTaskDetailsBySubTaskIdAction(item?.id));
                    navigation.push('QTMViewSubTaskDetailsScreen', {
                      navigation,
                      permissions: item.permissions,
                    });
                  }}
                  onPressStatus={() => {
                    if (item?.permissions?.length) {
                      setIsOpen(true);
                    } else {
                      selectedMember?.userQTMId === userDetails?.id &&
                        setIsOpen(true);
                    }
                    setSelectedSubTask(item);
                  }}
                  clickedStatusProgress={() => {
                    submitInProgressStatus(item);
                  }}
                  clickedStatusClosed={() => {
                    setSelectedSubTask(item);
                    setDisplayStatusModal(true);
                  }}
                  clickedStatusCancel={() => {
                    submitCancelStatus(item);
                  }}
                  onPressMenu={event => {
                    setSelectedSubTask(item);
                    setDisplayMenu(true);
                    // if (
                    //   event.nativeEvent.pageY >
                    //   Dimensions.get('screen').height * 0.74
                    // ) {
                    //   setMenuTop(Dimensions.get('screen').height * 0.74);
                    // } else {
                    const locationY = event.nativeEvent.pageY + 10;
                    setMenuTop(locationY);
                    // }
                    const locationX = event.nativeEvent.pageX - 330;
                    setMenuRight(locationX);
                    setDisplayMenu(true);
                  }}
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
    <View
      style={{
        flex: 1,
        backgroundColor: colors.qtmBackgroundColor,
        // position: 'relative',
      }}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      <QTMHeader
        headerTitle={'Tubulu QTM'}
        onPressBack={() => navigation.goBack()}
        onPressOptions={() => {
          // goToQTMTaskScreen();
          setDisplayQTMAddOptions(!displayQTMAddOptions);
        }}
      />
      {selectedMember && renderMemberBanner(selectedMember)}
      {renderSubTasks()}
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
      {permissions.indexOf('CREATE') >= 0 && (
        <View style={{flex: 1}}>
          <TouchableOpacity
            onPress={() => {
              navigation.push('QTMNewSubTaskScreen', {navigation});
            }}
            style={{
              // marginTop: 80,
              borderRadius: 8,
              backgroundColor: colors.backgroundColorHeader,
              height: 52,
              width: 262,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              bottom: 30,
              alignSelf: 'center',
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
      )}
      <QTMStatusUpdateModal
        visible={displayStatusUpdateModal}
        taskName={selectedSubTask?.name}
        rating={reviewDetails?.rating}
        handleRating={handleReviewStars}
        changeDescription={text =>
          setReviewDetails({
            ...reviewDetails,
            description: text,
          })
        }
        onPressSubmit={submitReview}
        setModalClose={() => {
          setDisplayStatusModal(false);
          setReviewDetails({
            rating: 0,
            description: '',
          });
        }}
      />
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
      <QTMStatusSheetModal
        open={open}
        setModalClose={() => setIsOpen(false)}
        status={selectedSubTask.status}
        showExtensionRequest={permissions?.length == 0 ? true : false}
        onChangeStatus={status => {
          if (status === 'IN_PROGRESS') {
            submitInProgressStatus(selectedSubTask);
            setIsOpen(false);
          } else if (status === 'COMPLETED') {
            setIsOpen(false);
            setTimeout(() => {
              setDisplayStatusModal(true);
            }, 300);
          } else if (status === 'CANCELLED') {
            submitCancelStatus(selectedSubTask);
            setIsOpen(false);
          } else if (status === 'DATE_EXTENSION') {
            setIsOpen(false);
            setTimeout(() => {
              setOpenDESheet(true);
            }, 500);
          } else {
            submitInProgressStatus(selectedSubTask);
            setIsOpen(false);
          }
        }}
      />
      <QTMDateExtensionSheetModal
        open={openDESheet}
        subTask={selectedSubTask}
        setModalClose={() => {
          setOpenDESheet(false);
        }}
      />
      {displayMenu && (
        <QTMMenuCard
          type="SUBTASK"
          permissions={selectedSubTask?.permissions}
          right={menuRight}
          top={menuTop}
          onCancel={() => setDisplayMenu(false)}
          onPressEdit={() => {
            dispatch(selectedSubTaskAction(selectedSubTask));
            navigation.navigate('QTMNewSubTaskScreen', {
              navigation,
              isEdit: true,
            });
            setDisplayMenu(false);
          }}
          onPressDelete={() => {
            setDeleteConfirmation(true);
          }}
        />
      )}
      {showDeleteConfirmation && (
        <ConfirmationPopup
          title={'Delete Subtask?'}
          subTitle={'Do you really want to delete this Subtask?'}
          onCancel={() => {
            setDeleteConfirmation(false);
          }}
          yesText={'Yes'}
          onSave={() => {
            setDeleteConfirmation(false);
            setTimeout(() => {
              setDisplayMenu(false);
              selectedSubTask?.id &&
                dispatch(
                  removeQTMSubTaskBySubTaskIdAction(selectedSubTask?.id),
                );
              toast.show({
                description: 'Deleted sub task successfully',
                bgColor: colors.greenBackground,
                color: colors.backgroundWhite,
                rounded: 'lg',
              });
            }, 500);
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
