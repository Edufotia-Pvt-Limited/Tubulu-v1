import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Platform,
  // SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {QTMAddOptions} from '../../../Components/QTMComponents/QTMAddOptions';
import {QTMDateExtensionSheetModal} from '../../../Components/QTMComponents/QTMDateExtensionSheet';
import {QTMHeader} from '../../../Components/QTMComponents/QTMHeader';
import {QTMStatusSheetModal} from '../../../Components/QTMComponents/QTMStatusSheetModal';
import {
  QTMReviewStar,
  QTMStatusUpdateModal,
} from '../../../Components/QTMComponents/QTMStatusUpdateModal';
import {QTMTopicAddModal} from '../../../Components/QTMComponents/QTMTopicAddModal';
import {IAppState} from '../../../Store/State';
import {
  getSubTaskAttachmentsAction,
  refreshAllAction,
  updateSubTaskStatusAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {deviceHeight} from '../../../Utils/Constants';
import {getDaysBetweenTwoDates, QTMformattedDate} from '../../../Utils/Helper';
import {QTMFormattedTime} from '../../../Utils/QTMHelper';

interface Props {
  navigation: any;
  route: any;
}

const statusColor = {
  INPROGRESS: colors.inProgressYellow,
  CLOSED: colors.completedGreen,
  CANCEL: colors.cancelledRed,
};

export function QTMViewSubTaskDetailsScreen({
  navigation,
  route,
}: Props): JSX.Element {
  const permissions = route?.params?.permissions ?? [];
  console.log('🚀 ~ permissions:', permissions);
  const [displayQTMAddOptions, setDisplayQTMAddOptions] =
    useState<boolean>(false);
  const [displayStatusUpdateModal, setDisplayStatusModal] =
    useState<boolean>(false);
  const [statusButtonClicked, setStatusButtonClicked] =
    useState<boolean>(false);

  const [dayCount, setDayCount] = useState<number>(0);
  const [statusObj, setStatusObj] = useState<{
    _status: string;
    _color: string;
  }>({_status: 'In Progress', _color: statusColor.INPROGRESS});

  const dispatch: any = useDispatch();

  const selectedTopic = useSelector(
    (state: IAppState) => state.qtmState.selectedTopic,
  );
  const selectedSubTask = useSelector(
    (state: IAppState) => state.qtmState.selectedSubTask,
  );
  const selectedMember = useSelector(
    (state: IAppState) => state.qtmState.selectedMember,
  );
  const subTaskAttachments = useSelector(
    (state: IAppState) => state.qtmState.subTaskAttachments,
  );
  const userDetails = useSelector(
    (state: IAppState) => state.qtmState.userDetails,
  );

  const [reviewDetails, setReviewDetails] = useState({
    rating: 0,
    description: '',
  });

  const [subTaskRating, setSubTaskRating] = useState<number>(0);

  const [open, setIsOpen] = useState<boolean>(false);

  const [viewMore, setViewMore] = useState<boolean>(false);
  const [mode, setMode] = useState<'VIEW' | 'EDIT' | 'CREATE'>('VIEW');

  const [openDESheet, setOpenDESheet] = useState<boolean>(false);

  useEffect(() => {
    if (selectedSubTask) {
      handleStatus();
      getDaysCount();
      if (selectedSubTask?.subTaskFeedbacks) {
        selectedSubTask?.status == 'COMPLETED' &&
          setSubTaskRating(selectedSubTask?.subTaskFeedbacks?.[0]?.rating);
      }
    }
  }, [selectedSubTask]);

  useEffect(() => {
    selectedSubTask &&
      dispatch(getSubTaskAttachmentsAction(selectedSubTask?.id));
  }, [selectedSubTask]);

  function handleStatus() {
    switch (selectedSubTask?.status) {
      case 'IN_PROGRESS':
        return setStatusObj({
          _status: 'In Progress',
          _color: statusColor.INPROGRESS,
        });
      case 'COMPLETED':
        return setStatusObj({_status: 'Completed', _color: statusColor.CLOSED});
      case 'CANCELLED':
        return setStatusObj({_status: 'Cancel', _color: statusColor.CANCEL});
    }
  }

  function getDaysCount() {
    if (selectedSubTask?.subTaskFeedbacks?.[0]?.createdAt) {
      const _count = getDaysBetweenTwoDates(
        selectedSubTask?.subTaskFeedbacks?.[0]?.createdAt,
      );
      setDayCount(_count);
    } else {
      const count = getDaysBetweenTwoDates(selectedSubTask?.endDate);
      setDayCount(count);
    }
  }

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

  function handleStatusUpdate() {
    if (permissions?.length) {
      // setStatusButtonClicked(!statusButtonClicked);
      setIsOpen(true);
    } else {
      selectedMember?.userQTMId === userDetails?.id && setIsOpen(true);
      // setStatusButtonClicked(!statusButtonClicked);
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
      setReviewDetails({
        description: '',
        rating: 0,
      });
      await dispatch(refreshAllAction());
    }
  }

  async function submitCancelStatus() {
    setStatusButtonClicked(false);
    if (selectedSubTask?.id) {
      await dispatch(
        updateSubTaskStatusAction({
          subTaskId: selectedSubTask.id,
          description: '',
          status: 'CANCELLED',
        }),
      );
    }
    await dispatch(refreshAllAction());
  }

  async function submitInProgressStatus() {
    setStatusButtonClicked(false);
    if (selectedSubTask?.id) {
      await dispatch(
        updateSubTaskStatusAction({
          subTaskId: selectedSubTask.id,
          description: '',
          status: 'IN_PROGRESS',
        }),
      );
    }
    await dispatch(refreshAllAction());
  }

  function goToQTMTaskScreen() {
    setDisplayQTMAddOptions(!displayQTMAddOptions);
    navigation.navigate('QTMNewTaskScreen', {navigation});
  }

  function goToQTMTopicScreen() {
    // navigation.navigate('QTMNewTopicScreen', {navigation});
    setDisplayQTMAddOptions(!displayQTMAddOptions);
    setTimeout(() => {
      setMode('CREATE');
      setViewMore(true);
    }, 300);
  }

  function renderRating() {
    // if (selectedSubTask?.subTaskFeedbacks) {
    return (
      <View style={{flexDirection: 'row'}}>
        <QTMReviewStar checked={subTaskRating > 0} size={36} />
        <QTMReviewStar checked={subTaskRating > 1} size={36} />
        <QTMReviewStar checked={subTaskRating > 2} size={36} />
        <QTMReviewStar checked={subTaskRating > 3} size={36} />
        <QTMReviewStar checked={subTaskRating > 4} size={36} />
      </View>
    );
    // }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundWhite,
        position: 'relative',
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
      <View style={{marginHorizontal: 17, marginTop: 28}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            allowFontScaling={false}
            style={{
              fontWeight: '700',
              fontSize: 18,
              color: colors.titleBlackColor,
            }}>
            {selectedSubTask?.name}
          </Text>
          {/* <Text style={{ color: colors.textColorGray, fontSize: 16, fontWeight: '400' }}>Due Date: {QTMformattedDateV2(selectedSubTask?.endDate)}</Text> */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('QTMAttachmentScreen', {
                navigation,
                from: 'SUBTASK',
              });
            }}
            style={{
              backgroundColor: colors.backgroundColorHeader,
              height: 31,
              width: 51,
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
            {/* <Text style={{ color: colors.backgroundWhite, fontSize: 16, fontWeight: '700', marginLeft: 4 }}>
                        
                    </Text> */}
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          marginHorizontal: 17,
          marginTop: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            allowFontScaling={false}
            style={{
              color:
                selectedSubTask?.status == 'COMPLETED'
                  ? '#8A8A8E'
                  : dayCount < 0
                  ? colors.cancelledRed
                  : dayCount < 7
                  ? colors.inProgressYellow
                  : '#8A8A8E',
              fontSize: 16,
              fontWeight: '400',
            }}>
            {selectedSubTask?.status == 'COMPLETED'
              ? 'Done'
              : dayCount < 0
              ? 'Overdue'
              : 'Due in'}
          </Text>
          <View>
            {/* RATING IN HERE */}
            {subTaskRating > 0 && renderRating()}
          </View>
        </View>
        <Text
          allowFontScaling={false}
          style={{color: '#8A8A8E', fontSize: 16, fontWeight: '400'}}>
          {'Wattage'}
        </Text>
      </View>
      <View
        style={{
          marginHorizontal: 17,
          marginTop: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            backgroundColor:
              selectedSubTask?.status == 'COMPLETED'
                ? colors.completedGreen
                : dayCount > 0
                ? dayCount < 7
                  ? colors.inProgressYellow
                  : colors.completedGreen
                : colors.cancelledRed,
            height: 30,
            width: 'auto',
            paddingHorizontal: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.backgroundWhite,
              fontSize: 14,
              fontWeight: '700',
            }}>
            {dayCount > 0
              ? `${dayCount} Days`
              : dayCount == 0
              ? `0 Days`
              : `${dayCount?.toString()?.split('-')[1]} Days`}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.backgroundColorHeader,
            height: 30,
            width: 'auto',
            paddingHorizontal: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.backgroundWhite,
              fontSize: 14,
              fontWeight: '700',
            }}>
            {selectedSubTask?.wattage}%
          </Text>
        </View>
      </View>
      <View
        style={{
          marginHorizontal: 17,
          marginTop: 38,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row'}}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textColorGray,
              fontSize: 14,
              fontWeight: '400',
            }}>
            Due Date:{' '}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.titleBlackColor,
              fontSize: 14,
              fontWeight: '700',
            }}>
            {QTMformattedDate(selectedSubTask?.endDate)}
          </Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textColorGray,
              fontSize: 14,
              fontWeight: '400',
            }}>
            Due Time:{' '}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.titleBlackColor,
              fontSize: 14,
              fontWeight: '700',
            }}>
            {selectedSubTask?.endDate &&
              QTMFormattedTime(selectedSubTask.endDate)}
          </Text>
        </View>
      </View>
      <ScrollView
        style={{
          maxHeight: deviceHeight * 0.52,
        }}>
        <View
          style={{
            marginHorizontal: 17,
            marginTop: 20,
          }}>
          <Text
            allowFontScaling={false}
            style={{
              fontWeight: '700',
              fontSize: 18,
              color: colors.titleBlackColor,
            }}>
            {'Description'}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontWeight: '400',
              fontSize: 14,
              color: '#868080',
              marginTop: 10,
            }}>
            {selectedSubTask?.description}
          </Text>
        </View>
      </ScrollView>
      <View style={{marginHorizontal: 17, marginTop: 20}}>
        {/* <Text style={{ fontWeight: '700', fontSize: 20, color: colors.titleBlackColor }}>{'Attachments'}</Text> */}
      </View>
      <View
        style={{
          marginTop: 17,
          marginHorizontal: 17,
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}>
        {/* <QTMAttachments attachments={subTaskAttachments} /> */}
      </View>
      {!statusButtonClicked && (
        <TouchableOpacity
          onPress={handleStatusUpdate}
          style={{
            marginTop: 80,
            borderRadius: 8,
            backgroundColor: statusObj._color,
            height: 52,
            width: 262,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            bottom: 40,
            alignSelf: 'center',
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.backgroundWhite,
              fontSize: 16,
              fontWeight: '700',
            }}>
            {statusObj._status}
          </Text>
        </TouchableOpacity>
      )}
      {statusButtonClicked && (
        <View style={{position: 'absolute', bottom: 40, alignSelf: 'center'}}>
          <TouchableOpacity
            onPress={submitInProgressStatus}
            style={{
              marginTop: 20,
              borderRadius: 8,
              backgroundColor: statusColor.INPROGRESS,
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
              {'In Progress'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setDisplayStatusModal(true);
              setStatusButtonClicked(false);
            }}
            style={{
              marginTop: 20,
              borderRadius: 8,
              backgroundColor: statusColor.CLOSED,
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
              {'Completed'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={submitCancelStatus}
            style={{
              marginTop: 20,
              borderRadius: 8,
              backgroundColor: statusColor.CANCEL,
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
              {'Cancel'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <QTMStatusUpdateModal
        visible={displayStatusUpdateModal}
        taskName={selectedSubTask?.name ?? ''}
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
      <QTMStatusSheetModal
        open={open}
        setModalClose={() => setIsOpen(false)}
        status={selectedSubTask?.status ?? 'IN_PROGRESS'}
        showExtensionRequest={permissions?.length == 0 ? true : false}
        onChangeStatus={status => {
          if (status === 'IN_PROGRESS') {
            submitInProgressStatus();
            setIsOpen(false);
          } else if (status === 'COMPLETED') {
            setIsOpen(false);
            setTimeout(() => {
              setDisplayStatusModal(true);
            }, 300);
          } else if (status === 'CANCELLED') {
            submitCancelStatus();
            setIsOpen(false);
          } else if (status === 'DATE_EXTENSION') {
            setIsOpen(false);
            setTimeout(() => {
              setOpenDESheet(true);
            }, 500);
          } else {
            submitInProgressStatus();
            setIsOpen(false);
          }
        }}
      />
      {selectedSubTask && (
        <QTMDateExtensionSheetModal
          open={openDESheet}
          subTask={selectedSubTask}
          setModalClose={() => {
            setOpenDESheet(false);
          }}
        />
      )}
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
            onCancel={() => setDisplayQTMAddOptions(!displayQTMAddOptions)}
            addTaskPressed={goToQTMTaskScreen}
            addTopicPressed={goToQTMTopicScreen}
          />
        </View>
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
