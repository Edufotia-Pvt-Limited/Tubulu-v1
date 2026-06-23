import {useToast} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import FontAwesomeIcon5 from 'react-native-vector-icons/FontAwesome5';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmationPopup} from '../../Components/ConfirmationPopup';
import {QTMAddOptions} from '../../Components/QTMComponents/QTMAddOptions';
import {QTMContactPermissionBanner} from '../../Components/QTMComponents/QTMContactPermissionBanner';
import {QTMDERequestCard} from '../../Components/QTMComponents/QTMDERequestCard';
// import {QTMActionButton} from '../../Components/QTMComponents/QTMFloatingActionButton';

import {QTMMenuCard} from '../../Components/QTMComponents/QTMMenuComponents';
import {QTMStatusFilter} from '../../Components/QTMComponents/QTMStatusFilter';
import {QTMTaskCardV3} from '../../Components/QTMComponents/QTMTaskCardV3';
import {QTMTopicCard} from '../../Components/QTMComponents/QTMTopicCard';
import {IAppState} from '../../Store/State';
import {
  getAllContactsAction,
  getAllDERequestsAction,
  getAllTasksV2Action,
  getAllUserTopicsAction,
  getMembersByTaskIdAction,
  getOwnerDetailsAction,
  getTaskDetailsByTaskIdAction,
  pinTaskAction,
  removeQTMTaskByTaskIdAction,
  removeTaskPinAction,
  removeUserTopicAction,
  selectedTaskAction,
  selectedUserTopicAction,
  syncContactsAction,
  updateDEAction,
} from '../../Store/qtm.store/qtm.actions';
import {colors} from '../../Utils/Colors';
import {getPercentage} from '../../Utils/Helper';
import {
  getCancelledPercentage,
  getCategorizedTasks,
} from '../../Utils/QTMHelper';
import {ExtensionType, IQTMTasksv2, IQTMUserTopics} from '../../models/IQTM';

interface Props {
  navigation: any;
  displayOptions: boolean;
  setDisplayOptions: (options: boolean) => void;
  viewMore: boolean;
  setViewMore: (view: boolean) => void;
  setTopicMode: (mode: 'VIEW' | 'EDIT' | 'CREATE' | 'MOVE') => void;
}

export function QTMHomeScreen({
  navigation,
  displayOptions,
  setDisplayOptions,
  viewMore,
  setViewMore,
  setTopicMode,
}: Props) {
  const dispatch: any = useDispatch();
  const toast = useToast();

  const tasks = useSelector((state: IAppState) => state.qtmState.tasks);
  const userTopics = useSelector(
    (state: IAppState) => state.qtmState.userTopics,
  );

  const contactLoading = useSelector(
    (state: IAppState) => state.qtmState?.contactsLoading,
  );

  const taskDetails = useSelector(
    (state: IAppState) => state.qtmState.selectedTask,
  );

  const allDERequests = useSelector(
    (state: IAppState) => state.qtmState.allDERequests,
  );

  const [newTasks, setNewTasks] = useState<IQTMTasksv2[]>(tasks);
  const [displayTaskMenu, setDisplayTaskMenu] = useState<boolean>(false);
  const [displayTopicMenu, setDisplayTopicMenu] = useState<boolean>(false);

  const [taskMenuTop, setTaskMenuTop] = useState<number | undefined>(undefined);
  const [taskMenuRight, setTaskMenuRight] = useState<number | undefined>(
    undefined,
  );
  const [showDeleteConfirmation, setDeleteConfirmation] =
    useState<boolean>(false);

  const [showTopicDeleteConfirmation, setTopicDeleteConfirmation] =
    useState<boolean>(false);

  const [selectedTask, setSelectedTask] = useState<IQTMTasksv2>(
    {} as IQTMTasksv2,
  );
  const [selectedTopic, setSelectedTopic] = useState<IQTMUserTopics>(
    {} as IQTMUserTopics,
  );

  const [viewMoreTopics, setViewMoreTopics] = useState<boolean>(false);

  const [showDERequests, setShowDERequests] = useState<boolean>(false);

  const [selectedFilterType, setSelectedFilterType] = useState<
    | 'NONE'
    | 'INPROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'OVERDUE'
    | 'DATE_EXTENSION'
  >('NONE');

  const [filteredTasks, setFilteredTasks] = useState<IQTMTasksv2[]>([]);
  const [count, setCount] = useState({
    all: tasks?.length,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    extension: allDERequests?.length ?? 0,
  });

  const [DERequestLoading, setDERequestLoading] = useState<boolean>(false);
  const [selectedDEId, setSelectedDeId] = useState<number>(0);

  useEffect(() => {
    // getTopFiveTopics();
    showPinnedTasks();
  }, [tasks]);

  useEffect(() => {
    handleTaskFilter();
  }, [selectedFilterType]);

  useEffect(() => {
    dispatch(syncContactsAction());
    dispatch(getAllContactsAction());
    dispatch(getAllUserTopicsAction());
    dispatch(getAllTasksV2Action());
    dispatch(getOwnerDetailsAction());
    dispatch(getAllDERequestsAction());
  }, []);

  // useEffect(() => {
  //   requestContactPermission();
  // }, []);

  // useEffect(() => {
  //   if (tasks?.length) {
  //     updateTaskCount(tasks);
  //   }
  // }, [tasks]);

  async function updateTaskCount(_tasks: IQTMTasksv2[]) {
    const _allTasks = [..._tasks];
    let _count = {...count};
    _count.all = _allTasks.length;
    _count.extension = allDERequests?.length;
    _count.completed = _allTasks.filter(
      task => getPercentage(task?.wattages) == 100,
    )?.length;
    _count.cancelled = _allTasks.filter(
      task => getCancelledPercentage(task?.wattages) > 0,
    )?.length;
    _count.inProgress = _allTasks.filter(
      task => getPercentage(task?.wattages) !== 100,
    )?.length;
    _count.overdue = _allTasks.filter(task => task?.dueSubTasks)?.length;
    return _count;
  }

  async function handleTaskFilter() {
    const _noneFilteredTasks = newTasks;
    let _count = await updateTaskCount(_noneFilteredTasks);
    setCount(_count);
    let _filteredTasks = [];
    switch (selectedFilterType) {
      case 'DATE_EXTENSION':
        setShowDERequests(true);
        setCount({
          ...count,
          extension: allDERequests?.length ?? 0,
        });
        break;
      case 'NONE':
        setFilteredTasks(_noneFilteredTasks);
        setShowDERequests(false);
        setCount({
          ...count,
          all: _noneFilteredTasks?.length,
        });
        break;
      case 'INPROGRESS':
        _filteredTasks = newTasks?.filter(
          task => getPercentage(task?.wattages) !== 100,
        );
        setFilteredTasks(_filteredTasks);
        setShowDERequests(false);
        setCount({
          ...count,
          inProgress: _filteredTasks?.length,
        });
        break;
      case 'COMPLETED':
        _filteredTasks = newTasks?.filter(
          task => getPercentage(task?.wattages) == 100,
        );
        setShowDERequests(false);
        setFilteredTasks(_filteredTasks);
        setCount({
          ...count,
          completed: _filteredTasks?.length,
        });
        break;
      case 'CANCELLED':
        _filteredTasks = newTasks?.filter(
          task => getCancelledPercentage(task?.wattages) > 0,
        );
        setFilteredTasks(_filteredTasks);
        setShowDERequests(false);
        setCount({
          ...count,
          cancelled: _filteredTasks?.length,
        });
        break;
      case 'OVERDUE':
        _filteredTasks = newTasks?.filter(task => task?.dueSubTasks);
        setFilteredTasks(_filteredTasks);
        setShowDERequests(false);
        setCount({
          ...count,
          overdue: _filteredTasks?.length,
        });
        break;
      default:
        setFilteredTasks(_noneFilteredTasks);
        setShowDERequests(false);
        setCount({
          ...count,
          all: _noneFilteredTasks?.length,
        });
    }
  }

  async function showPinnedTasks() {
    const _count = await updateTaskCount(tasks);
    setCount(_count);
    const categorizedTasks = await getCategorizedTasks(tasks);
    setNewTasks([
      ...categorizedTasks.pinnedOverdue.sort(
        (a: any, b: any) => b?.dueSubTasks - a?.dueSubTasks,
      ),
      ...categorizedTasks.overdue.sort(
        (a: any, b: any) => b?.dueSubTasks - a?.dueSubTasks,
      ),
      ...categorizedTasks.pinned,
      ...categorizedTasks.other,
      ...categorizedTasks.cancelled,
      ...categorizedTasks.completed,
    ]);
    setFilteredTasks([
      ...categorizedTasks.pinnedOverdue.sort(
        (a: any, b: any) => b?.dueSubTasks - a?.dueSubTasks,
      ),
      ...categorizedTasks.overdue.sort(
        (a: any, b: any) => b?.dueSubTasks - a?.dueSubTasks,
      ),
      ...categorizedTasks.pinned,
      ...categorizedTasks.other,
      ...categorizedTasks.cancelled,
      ...categorizedTasks.completed,
    ]);
  }

  function getTopFiveTopics() {
    let _newTasks: IQTMTasksv2[] = [];
    if (tasks?.length > 3) {
      for (let i = 0; i < 4; i++) {
        _newTasks.push(tasks[i]);
        setNewTasks(_newTasks);
      }
    } else if (tasks?.length <= 3) {
      setNewTasks(tasks);
    }
  }

  async function handlePinTasks() {
    setDisplayTaskMenu(false);
    const isPinned = tasks?.filter(task => task?.isPinned == true);
    if (selectedTask?.isPinned) {
      selectedTask?.id &&
        (await dispatch(removeTaskPinAction(selectedTask.id)));
      toast.show({
        description: `Removed Pin from Task`,
        bgColor: colors.greenBackground,
        color: colors.backgroundWhite,
        rounded: 'lg',
      });
    } else {
      if (isPinned?.length < 2) {
        selectedTask?.id && (await dispatch(pinTaskAction(selectedTask.id)));
        toast.show({
          description: `Pinned Task Successfully`,
          bgColor: colors.greenBackground,
          color: colors.backgroundWhite,
          rounded: 'lg',
        });
      } else {
        toast.show({
          description: `Already pinned 2 tasks, can't pin more`,
          bgColor: colors.errorRed,
          color: colors.backgroundWhite,
          rounded: 'lg',
        });
      }
    }
    dispatch(getAllTasksV2Action());
  }

  async function updateDERequest(id: number, type: ExtensionType) {
    setDERequestLoading(true);
    switch (type) {
      case 'APPROVED':
        await dispatch(updateDEAction(id, 'APPROVED'));
        toast.show({
          description: `Approved Date Extension`,
          bgColor: colors.greenBackground,
          color: colors.backgroundWhite,
          rounded: 'lg',
        });
        setDERequestLoading(false);
        setCount({...count, extension: allDERequests?.length});
        if (allDERequests?.length - 1 === 0) {
          setSelectedFilterType('NONE');
        }
        break;
      case 'REJECTED':
        await dispatch(updateDEAction(id, 'REJECTED'));
        toast.show({
          description: `Rejected Date Extension`,
          bgColor: colors.greenBackground,
          color: colors.backgroundWhite,
          rounded: 'lg',
        });
        setDERequestLoading(false);
        setCount({...count, extension: allDERequests?.length});
        if (allDERequests?.length - 1 === 0) {
          setSelectedFilterType('NONE');
        }
        break;
    }
  }

  function goToQTMTaskScreen(): void {
    setDisplayOptions(false);
    navigation.navigate('QTMNewTaskScreen', {navigation});
  }

  function goToQTMTopicScreen(): void {
    // navigation.navigate('QTMNewTopicScreen', {navigation});
    setDisplayOptions(false);
    setTimeout(() => {
      setTopicMode('CREATE');
      setViewMore(!viewMore);
    }, 300);
  }

  function renderTasks(): JSX.Element {
    return (
      <View style={{flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginTop: 10,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.titleBlackColor,
            }}>
            Task
          </Text>
          {/* <TouchableOpacity
            onPress={() => {
              navigation.navigate('QTMAllTasksScreen', {navigation});
            }}
            style={{flex: 0, flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: colors.showMoreBlueColor,
                marginRight: 10,
              }}>
              {'See all'}
            </Text>
            <FontAwesomeIcon5
              name="chevron-right"
              style={{fontSize: 16, color: colors.showMoreBlueColor}}
            />
          </TouchableOpacity> */}
        </View>
        {filteredTasks?.length > 0 ? (
          <FlatList
            data={filteredTasks}
            horizontal
            contentContainerStyle={{
              flex: 1,
              flexWrap: 'wrap',
              marginHorizontal: 'auto',
              // justifyContent: 'space-between',
            }}
            renderItem={({item}) => (
              <QTMTaskCardV3
                fullMode
                showMenu
                key={item?.id}
                data={item?.wattages ?? []}
                isPinned={item?.isPinned}
                createdAt={item?.createdAt ?? ''}
                name={item?.name ?? ''}
                subTasks={item.subTaskCount}
                overdue={item.dueSubTasks}
                onPress={() => {
                  item?.id && dispatch(getMembersByTaskIdAction(item.id));
                  // dispatch(selectedTaskAction(item));
                  item?.id && dispatch(getTaskDetailsByTaskIdAction(item.id));
                  navigation.push('QTMTaskDetailsScreen', {navigation});
                }}
                onPressMenu={event => {
                  setSelectedTask(item);
                  const locationY =
                    event.nativeEvent.pageY >=
                    Dimensions.get('screen').height * 0.7
                      ? event.nativeEvent.pageY - 250
                      : event.nativeEvent.pageY - 40;
                  const locationX =
                    event.nativeEvent.pageX >=
                    Dimensions.get('screen').width / 2
                      ? event.nativeEvent.pageX - 300
                      : event.nativeEvent.pageX - 120;
                  setTaskMenuTop(locationY);
                  setTaskMenuRight(locationX);
                  setDisplayTaskMenu(true);
                }}
              />
            )}
          />
        ) : (
          renderNoTasks()
        )}
      </View>
    );
  }

  const renderNoTasks = (): JSX.Element => (
    <View>
      <View
        style={{
          alignSelf: 'center',
          marginTop: 60,
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.titleBlackColor,
            marginLeft: 10,
          }}>
          {selectedFilterType === 'NONE'
            ? 'No task'
            : `No ${selectedFilterType} task`}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.titleBlackColor,
          }}>
          {selectedFilterType === 'NONE' ? '' : 'to Preview'}
        </Text>
      </View>
    </View>
  );

  const renderDERequests = (): JSX.Element => (
    <ScrollView style={{paddingHorizontal: 10}}>
      {allDERequests?.map(item => (
        <QTMDERequestCard
          key={item.id}
          loading={selectedDEId == item.id && DERequestLoading}
          firstName={item.requester?.firstName ?? ''}
          lastName={item.requester?.lastName ?? ''}
          taskName={item.task.name}
          subTaskName={item.subTask.name}
          reason={item.reason}
          endDate={item.previousDateTime}
          extensionDate={item.extensionDateTime}
          onPressApprove={() => {
            updateDERequest(item.id, 'APPROVED');
            setSelectedDeId(item.id);
          }}
          onPressReject={() => {
            updateDERequest(item.id, 'REJECTED');
            setSelectedDeId(item.id);
          }}
        />
      ))}
      <View style={{marginTop: 40}} />
    </ScrollView>
  );

  function renderTopics(): JSX.Element {
    return (
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginTop: 20,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.titleBlackColor,
            }}>
            Topic
          </Text>
          <TouchableOpacity
            onPress={() => {
              setViewMore(!viewMore);
              setTopicMode('VIEW');
              // setViewMoreTopics(true);
            }}
            style={{flex: 0, flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: colors.showMoreBlueColor,
                marginRight: 10,
              }}>
              {'See all'}
            </Text>
            <FontAwesomeIcon5
              name="chevron-right"
              style={{fontSize: 16, color: colors.showMoreBlueColor}}
            />
          </TouchableOpacity>
        </View>
        {userTopics?.length > 0 ? (
          <FlatList
            data={userTopics.slice(0, 4)}
            horizontal
            style={{marginLeft: 4}}
            renderItem={({item}) => {
              return (
                <QTMTopicCard
                  fullMode
                  key={item?.id}
                  imagrUri={item?.logo ?? ''}
                  onPress={async () => {
                    await dispatch(selectedUserTopicAction(item));
                    // item?.id && dispatch(getTasksFromUserTopicAction(item.id));
                    navigation.push('QTMTopicDetailsV2', {navigation});
                  }}
                  onPressMenu={event => {
                    setSelectedTopic(item);
                    setDisplayTopicMenu(true);
                    const locationY =
                      event.nativeEvent.pageY >=
                      Dimensions.get('screen').height / 2
                        ? event.nativeEvent.pageY - 250
                        : event.nativeEvent.pageY - 40;
                    const locationX =
                      event.nativeEvent.pageX >=
                      Dimensions.get('screen').width / 2
                        ? Dimensions.get('screen').width -
                          event.nativeEvent.pageX
                        : event.nativeEvent.pageX - 40;
                    setTaskMenuTop(locationY);
                    setTaskMenuRight(locationX);
                  }}
                  topic={item?.title}
                  totalTasks={item?.taskCount}
                  overdue={item?.dueSubTasks}
                />
              );
            }}
          />
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (tasks?.length) {
                setViewMore(true);
                setTopicMode('CREATE');
              } else {
                goToQTMTaskScreen();
              }
            }}
            style={{
              height: 124,
              alignItems: 'center',
              justifyContent: 'center',
              width: Dimensions.get('screen').width / 3 - 20,
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              borderWidth: 0.5,
              borderColor: colors.inputBorderGrey,
              borderRadius: 10,
              margin: 10,
              backgroundColor: colors.backgroundWhite,
              shadowColor: 'rgba(0, 0, 0, 0.8)',
              elevation: 5,
              shadowOffset: {
                width: 0,
                height: 2,
              },
            }}>
            <AntDesignIcon
              name="plus"
              size={32}
              style={{color: colors.backgroundColorHeader}}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.qtmBackgroundColor}}>
      {contactLoading && (
        <View
          style={{
            zIndex: 10,
            backgroundColor: colors.greenBackground,
            height: 40,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 0,
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
      {Platform.OS === 'ios' && <QTMContactPermissionBanner />}
      <View style={{marginTop: 20}}>
        <QTMStatusFilter
          showExtension={!!allDERequests?.length}
          selectedType={selectedFilterType}
          count={count}
          setFilterType={type => {
            if (selectedFilterType === type) {
              setSelectedFilterType('NONE');
              setFilteredTasks(newTasks);
            } else {
              setSelectedFilterType(type);
            }
          }}
        />
      </View>
      {showDERequests ? (
        renderDERequests()
      ) : (
        <ScrollView>
          {renderTopics()}
          {renderTasks()}
          <View style={{marginTop: 40}} />
        </ScrollView>
      )}
      {/* <QTMActionButton
        goToNewTaskScreen={goToQTMTaskScreen}
        goToNewTopicScreen={goToQTMTopicScreen}
      /> */}
      {displayOptions && (
        <QTMAddOptions
          addTopicPressed={goToQTMTopicScreen}
          addTaskPressed={goToQTMTaskScreen}
          onCancel={() => setDisplayOptions(!displayOptions)}
        />
      )}
      {/* <QTMTopicAddModal
        visible={viewMoreTopics}
        setModalClose={() => setViewMoreTopics(false)}
      /> */}
      {displayTaskMenu && (
        <QTMMenuCard
          permissions={selectedTask?.permissions}
          type="TASK"
          top={taskMenuTop}
          isPinned={selectedTask?.isPinned}
          right={taskMenuRight}
          onPressPin={handlePinTasks}
          onCancel={() => setDisplayTaskMenu(false)}
          onPressEdit={() => {
            dispatch(selectedTaskAction(selectedTask));
            navigation.navigate('QTMNewTaskScreen', {
              navigation,
              isEdit: true,
            });
            setDisplayTaskMenu(false);
          }}
          onPressDelete={() => {
            setDeleteConfirmation(true);
          }}
          onPressMove={() => {
            dispatch(selectedTaskAction(selectedTask));
            setDisplayTaskMenu(false);
            setTopicMode('MOVE');
            setViewMore(true);
          }}
        />
      )}
      {displayTopicMenu && (
        <QTMMenuCard
          permissions={['EDIT', 'DELETE']}
          type="TOPIC"
          top={taskMenuTop}
          right={taskMenuRight}
          onCancel={() => setDisplayTopicMenu(false)}
          onPressEdit={() => {
            setDisplayTopicMenu(false);
            setViewMore(true);
            setTopicMode('EDIT');
            dispatch(selectedUserTopicAction(selectedTopic));
          }}
          onPressDelete={() => {
            setTopicDeleteConfirmation(true);
          }}
        />
      )}
      {showTopicDeleteConfirmation && (
        <ConfirmationPopup
          title={'Delete Topic?'}
          subTitle={'Do you really want to delete this Topic?'}
          onCancel={() => {
            setTopicDeleteConfirmation(false);
            setDisplayTopicMenu(false);
          }}
          yesText={'Yes'}
          onSave={() => {
            setTopicDeleteConfirmation(false);
            setDisplayTopicMenu(false);
            selectedTopic?.id &&
              dispatch(removeUserTopicAction(selectedTopic.id));
            setSelectedTopic({} as IQTMUserTopics);
            dispatch(selectedUserTopicAction({} as IQTMUserTopics));
            toast.show({
              description: 'Deleted topic successfully',
              bgColor: colors.greenBackground,
              color: colors.backgroundWhite,
              rounded: 'lg',
            });
          }}
        />
      )}
      {showDeleteConfirmation && (
        <ConfirmationPopup
          title={'Delete Task?'}
          subTitle={'Do you really want to delete this Task?'}
          onCancel={() => {
            setDeleteConfirmation(false);
          }}
          yesText={'Yes'}
          onSave={() => {
            setDeleteConfirmation(false);
            setTimeout(() => {
              setDisplayTaskMenu(false);
              selectedTask?.id &&
                dispatch(removeQTMTaskByTaskIdAction(selectedTask?.id));
              toast.show({
                description: 'Deleted task successfully',
                bgColor: colors.greenBackground,
                color: colors.backgroundWhite,
                rounded: 'lg',
              });
            }, 500);
          }}
        />
      )}
    </View>
  );
}
