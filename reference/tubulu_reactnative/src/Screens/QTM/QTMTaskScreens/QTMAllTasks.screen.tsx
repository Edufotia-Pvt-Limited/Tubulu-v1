import {useToast} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  // SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmationPopup} from '../../../Components/ConfirmationPopup';
import {QTMAddOptions} from '../../../Components/QTMComponents/QTMAddOptions';
import {QTMHeader} from '../../../Components/QTMComponents/QTMHeader';
import {QTMMenuCard} from '../../../Components/QTMComponents/QTMMenuComponents';
import {QTMMovePopup} from '../../../Components/QTMComponents/QTMMovePopUp';
import {QTMStatusFilter} from '../../../Components/QTMComponents/QTMStatusFilter';
import {QTMTaskCardV3} from '../../../Components/QTMComponents/QTMTaskCardV3';
import {QTMTopicAddModal} from '../../../Components/QTMComponents/QTMTopicAddModal';
import {IAppState} from '../../../Store/State';
import {
  getAllTasksV2Action,
  getMembersByTaskIdAction,
  getTaskDetailsByTaskIdAction,
  getTasksFromUserTopicAction,
  moveTaskToTopicAction,
  pinTaskAction,
  removeQTMTaskByTaskIdAction,
  removeTaskPinAction,
  selectedTaskAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {getPercentage} from '../../../Utils/Helper';
import {
  getCancelledPercentage,
  getCategorizedTasks,
} from '../../../Utils/QTMHelper';
import {IQTMTasksv2} from '../../../models/IQTM';

interface Props {
  readonly navigation: any;
  readonly route: {params: {isSelectTask: boolean}};
}

export function QTMAllTasksScreen({navigation, route}: Props): JSX.Element {
  const dispatch: any = useDispatch();
  const toast = useToast();

  const tasks = useSelector((state: IAppState) => state.qtmState.tasks);
  const selectedUserTopic = useSelector(
    (state: IAppState) => state.qtmState.selectedUserTopic,
  );

  const contactLoading = useSelector(
    (state: IAppState) => state.qtmState?.contactsLoading,
  );

  const [newTasks, setNewTasks] = useState<IQTMTasksv2[]>(tasks);
  const [displayTaskMenu, setDisplayTaskMenu] = useState<boolean>(false);

  const [taskMenuTop, setTaskMenuTop] = useState<number | undefined>(undefined);
  const [taskMenuRight, setTaskMenuRight] = useState<number | undefined>(
    undefined,
  );
  const [showDeleteConfirmation, setDeleteConfirmation] =
    useState<boolean>(false);

  const [selectedTask, setSelectedTask] = useState<IQTMTasksv2>(
    {} as IQTMTasksv2,
  );

  const [moveMode, setMoveMode] = useState<boolean>(false);
  const [displayMove, setDisplayMove] = useState<boolean>(false);
  const [showTopicsModal, setShowTopicsModal] = useState<boolean>(false);

  const [selectedFilterType, setSelectedFilterType] = useState<
    'NONE' | 'INPROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE'
  >('NONE');

  const [filteredTasks, setFilteredTasks] = useState<IQTMTasksv2[]>(newTasks);

  const [count, setCount] = useState({
    all: tasks?.length,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
  });

  const [displayQTMAddOptions, setDisplayQTMAddOptions] =
    useState<boolean>(false);

  const [mode, setMode] = useState<'VIEW' | 'EDIT' | 'CREATE' | 'MOVE'>('VIEW');

  useEffect(() => {
    dispatch(getAllTasksV2Action());
  }, []);

  useEffect(() => {
    if (route?.params?.isSelectTask) {
      setMoveMode(true);
      setMode('MOVE');
    }
  }, [route]);

  useEffect(() => {
    showPinnedTasks();
  }, [tasks]);

  useEffect(() => {
    handleTaskFilter();
  }, [selectedFilterType]);

  useEffect(() => {
    updateTaskCount();
  }, []);

  function goToQTMTaskScreen() {
    setDisplayQTMAddOptions(!displayQTMAddOptions);
    navigation.navigate('QTMNewTaskScreen', {navigation});
  }

  function goToQTMTopicScreen() {
    // navigation.push('QTMNewTopicScreen', {navigation});
    setDisplayQTMAddOptions(!displayQTMAddOptions);
    setTimeout(() => {
      setMode('CREATE');
      setShowTopicsModal(true);
    }, 300);
  }

  function updateTaskCount() {
    const _allTasks = tasks;
    let _count = {...count};
    _count.all = _allTasks.length;
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
    setCount(_count);
  }

  function handleTaskFilter() {
    const _noneFilteredTasks = newTasks;
    let _filteredTasks = [];
    switch (selectedFilterType) {
      case 'NONE':
        setFilteredTasks(_noneFilteredTasks);
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
        setCount({
          ...count,
          inProgress: _filteredTasks?.length,
        });
        break;
      case 'COMPLETED':
        _filteredTasks = newTasks?.filter(
          task => getPercentage(task?.wattages) == 100,
        );
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
        setCount({
          ...count,
          cancelled: _filteredTasks?.length,
        });
        break;
      case 'OVERDUE':
        _filteredTasks = newTasks?.filter(task => task?.dueSubTasks);
        setFilteredTasks(_filteredTasks);
        setCount({
          ...count,
          overdue: _filteredTasks?.length,
        });
        break;
      default:
        setFilteredTasks(_noneFilteredTasks);
        setCount({
          ...count,
          all: _noneFilteredTasks?.length,
        });
    }
  }

  async function showPinnedTasks() {
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

  async function handleMove() {
    selectedUserTopic?.id &&
      selectedTask?.id &&
      (await dispatch(
        moveTaskToTopicAction(selectedUserTopic.id, selectedTask.id),
      ));
    toast.show({
      description: 'Moved Task successfully',
      bgColor: colors.greenBackground,
      borderRadius: 20,
    });
    selectedUserTopic?.id &&
      (await dispatch(getTasksFromUserTopicAction(selectedUserTopic?.id)));
    await dispatch(getAllTasksV2Action());
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

  const renderNoTasks = () => (
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

  function renderTasks() {
    return (
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
            selected={moveMode && item?.id === selectedTask?.id}
            onPress={() => {
              if (moveMode) {
                setSelectedTask(item);
                setDisplayMove(true);
              } else {
                item?.id && dispatch(getMembersByTaskIdAction(item?.id));
                item?.id && dispatch(getTaskDetailsByTaskIdAction(item?.id));
                navigation.push('QTMTaskDetailsScreen', {navigation});
                // dispatch(selectedTopicAction(item));
              }
            }}
            onPressMenu={event => {
              if (!moveMode) {
                setSelectedTask(item);
                if (
                  event.nativeEvent.pageY >
                  Dimensions.get('screen').height * 0.74
                ) {
                  setTaskMenuTop(Dimensions.get('screen').height - 250);
                } else {
                  const locationY =
                    event.nativeEvent.pageY >=
                    Dimensions.get('screen').height / 2
                      ? event.nativeEvent.pageY - 40
                      : event.nativeEvent.pageY + 20;

                  setTaskMenuTop(locationY);
                }
                const locationX =
                  event.nativeEvent.pageX >= Dimensions.get('screen').width / 2
                    ? event.nativeEvent.pageX - 340
                    : event.nativeEvent.pageX - 160;
                setTaskMenuRight(locationX);
                setDisplayTaskMenu(true);
              }
            }}
          />
        )}
      />
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.qtmBackgroundColor}}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      <QTMHeader
        headerTitle="Tubulu QTM"
        onPressBack={() => navigation.goBack()}
        onPressOptions={() => {
          // navigation.push('QTMNewTaskScreen', {navigation});
          setDisplayQTMAddOptions(!displayQTMAddOptions);
        }}
      />
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.titleBlackColor,
          paddingHorizontal: 20,
          marginTop: 15,
        }}>
        {moveMode ? 'Select a Task to Move' : 'All Task'}
      </Text>
      <View style={{marginVertical: 5}}>
        <QTMStatusFilter
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
      <ScrollView>
        {filteredTasks?.length > 0 ? renderTasks() : renderNoTasks()}
        <View style={{marginTop: 40}} />
      </ScrollView>
      {displayQTMAddOptions && (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 60,
          }}>
          <QTMAddOptions
            addTaskPressed={goToQTMTaskScreen}
            addTopicPressed={goToQTMTopicScreen}
            onCancel={() => setDisplayQTMAddOptions(!displayQTMAddOptions)}
          />
        </View>
      )}
      <QTMTopicAddModal
        mode={mode}
        setModalClose={() => {
          setShowTopicsModal(false);
          setMode('VIEW');
        }}
        visible={showTopicsModal}
      />
      {showDeleteConfirmation && (
        <ConfirmationPopup
          title={'Delete Task?'}
          subTitle={'Do you really want to delete this Task?'}
          onCancel={() => {
            setDeleteConfirmation(false);
            setSelectedTask({} as IQTMTasksv2);
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
      {displayMove && (
        <QTMMovePopup
          onSave={() => {
            setDisplayMove(false);
            handleMove();
            navigation.goBack();
          }}
          yesText="Move"
          title="Move to Topic"
          subTitle="Are you sure to move this task to topic?"
          onCancel={() => {
            setDisplayMove(false);
            setSelectedTask({} as IQTMTasksv2);
          }}
        />
      )}
      {displayTaskMenu && (
        <QTMMenuCard
          permissions={selectedTask?.permissions}
          type="TASK"
          top={taskMenuTop}
          isPinned={selectedTask?.isPinned}
          right={taskMenuRight}
          onPressPin={handlePinTasks}
          onCancel={() => setDisplayTaskMenu(false)}
          onPressMove={() => {
            setShowTopicsModal(true);
            dispatch(selectedTaskAction(selectedTask));
          }}
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
        />
      )}
    </View>
  );
}
