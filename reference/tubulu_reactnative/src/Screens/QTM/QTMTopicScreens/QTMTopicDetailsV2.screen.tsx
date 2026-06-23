import {useToast} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  // SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmationPopup} from '../../../Components/ConfirmationPopup';
import {QTMAddOptions} from '../../../Components/QTMComponents/QTMAddOptions';
import {QTMHeader} from '../../../Components/QTMComponents/QTMHeader';
import {QTMAvatar} from '../../../Components/QTMComponents/QTMMemberCard';
import {QTMMenuCard} from '../../../Components/QTMComponents/QTMMenuComponents';
import {QTMStatusFilter} from '../../../Components/QTMComponents/QTMStatusFilter';
import {QTMTaskCardV3} from '../../../Components/QTMComponents/QTMTaskCardV3';
import {QTMTopicAddModal} from '../../../Components/QTMComponents/QTMTopicAddModal';
import {IAppState} from '../../../Store/State';
import {
  getAllTasksV2Action,
  getMembersByTaskIdAction,
  getTaskDetailsByTaskIdAction,
  getTasksFromUserTopicAction,
  pinTaskAction,
  removeQTMTaskByTaskIdAction,
  removeTaskFromTopicAction,
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
  navigation: any;
}

export function QTMTopicDetailsV2({navigation}: Props) {
  const dispatch: any = useDispatch();
  const toast = useToast();

  const tasks = useSelector((state: IAppState) => state.qtmState?.topicTasks);

  const [viewMore, setViewMore] = useState<boolean>(false);
  const selectedUserTopic = useSelector(
    (state: IAppState) => state.qtmState.selectedUserTopic,
  );
  const [mode, setMode] = useState<'VIEW' | 'EDIT' | 'CREATE'>('VIEW');

  const [newTasks, setNewTasks] = useState<IQTMTasksv2[]>([]);
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

  const [removeTask, setRemoveTask] = useState<boolean>(false);

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

  useEffect(() => {
    if (selectedUserTopic?.id) {
      dispatch(getTasksFromUserTopicAction(selectedUserTopic.id));
    }
  }, []);

  useEffect(() => {
    if (tasks?.length) {
      showPinnedTasks();
      updateTaskCount(tasks);
    } else {
      updateTaskCount(tasks);
      setNewTasks(tasks);
      setFilteredTasks(tasks);
    }
  }, [tasks, selectedUserTopic]);

  useEffect(() => {
    handleTaskFilter();
  }, [selectedFilterType]);

  // useEffect(() => {
  //   updateTaskCount();
  // }, []);

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

  async function updateTaskCount(_tasks: IQTMTasksv2[]) {
    const _allTasks = [..._tasks];
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
    // return _count;
    setCount(_count);
  }

  async function handleTaskFilter() {
    const _noneFilteredTasks = newTasks;
    let _filteredTasks = [];
    // let _count = await updateTaskCount(_noneFilteredTasks);
    // setCount(_count);
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

  async function handleRemoveTask() {
    setDisplayTaskMenu(false);
    setDeleteConfirmation(false);
    setRemoveTask(false);
    if (selectedUserTopic?.id) {
      selectedTask?.id &&
        (await dispatch(
          removeTaskFromTopicAction(selectedUserTopic?.id, selectedTask?.id),
        ));
      await dispatch(getTasksFromUserTopicAction(selectedUserTopic?.id));
    }
    toast.show({
      description: `Removed Task successfully`,
      bgColor: colors.greenBackground,
      color: colors.backgroundWhite,
      rounded: 'lg',
    });
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
    selectedUserTopic?.id &&
      (await dispatch(getTasksFromUserTopicAction(selectedUserTopic?.id)));
    await dispatch(getAllTasksV2Action());
  }

  async function deleteTask() {
    setDeleteConfirmation(false);
    setTimeout(async () => {
      setDisplayTaskMenu(false);
      selectedTask?.id &&
        (await dispatch(removeQTMTaskByTaskIdAction(selectedTask?.id)));
      toast.show({
        description: 'Deleted task successfully',
        bgColor: colors.greenBackground,
        color: colors.backgroundWhite,
        rounded: 'lg',
      });
    }, 500);
  }

  function renderTopicBanner(): JSX.Element {
    return (
      <View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 21,
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={{
                height: 26,
                width: 26,
                borderRadius: 50,
                borderWidth: 0.54,
                borderColor: '#B7B7B7',
                marginRight: 6,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {selectedUserTopic?.logo !== '' ? (
                <Image
                  style={{height: 24, width: 24, borderRadius: 50}}
                  source={{uri: selectedUserTopic?.logo}}
                />
              ) : (
                <QTMAvatar
                  height={22}
                  width={22}
                  fontSize={12}
                  firstName={selectedUserTopic?.title}
                  lastName={selectedUserTopic?.title?.split(' ')[1]}
                />
              )}
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.titleBlackColor,
              }}>
              {selectedUserTopic?.title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setViewMore(true);
              setMode('VIEW');
            }}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.showMoreBlueColor,
                marginRight: 10,
              }}>
              See All
            </Text>
            <FontAwesome5Icon
              name="chevron-right"
              style={{fontSize: 14, color: colors.showMoreBlueColor}}
            />
          </TouchableOpacity>
        </View>
        <View style={{marginTop: 20}} />
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
    );
  }

  function renderNoNewTask() {
    return (
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
            {selectedFilterType === 'NONE' ? 'in this Topic' : 'to Preview'}
          </Text>
        </View>
        {selectedFilterType === 'NONE' && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <TouchableOpacity
              onPress={() => {
                navigation.push('QTMNewTaskScreen', {
                  navigation,
                  isFromTopic: true,
                });
              }}
              style={{
                marginVertical: 50,
                borderRadius: 8,
                backgroundColor: colors.backgroundColorHeader,
                height: 52,
                width: Dimensions.get('screen').width / 2.5,
                justifyContent: 'center',
                alignSelf: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: colors.backgroundWhite,
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                {'Create New Task'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.push('QTMAllTasksScreen', {
                  navigation,
                  isSelectTask: true,
                });
              }}
              style={{
                marginVertical: 50,
                borderRadius: 8,
                backgroundColor: colors.backgroundColorHeader,
                height: 52,
                width: Dimensions.get('screen').width / 2.5,
                justifyContent: 'center',
                alignSelf: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: colors.backgroundWhite,
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                {'Add Task'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  function renderTasks() {
    return (
      <View style={{marginTop: 20}}>
        <FlatList
          data={filteredTasks}
          horizontal
          contentContainerStyle={{
            flex: 1,
            flexWrap: 'wrap',
            marginHorizontal: 'auto',
            justifyContent: 'space-between',
          }}
          renderItem={({item}) => (
            <QTMTaskCardV3
              fullMode
              showMenu
              key={item?.id}
              data={item?.wattages ?? []}
              createdAt={item?.createdAt ?? ''}
              name={item?.name ?? ''}
              isPinned={item?.isPinned}
              subTasks={item.subTaskCount}
              overdue={item.dueSubTasks}
              onPress={() => {
                item?.id && dispatch(getMembersByTaskIdAction(item?.id));
                item?.id && dispatch(getTaskDetailsByTaskIdAction(item?.id));
                navigation.push('QTMTaskDetailsScreen', {navigation});
                // dispatch(selectedTopicAction(item));
              }}
              onPressMenu={event => {
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
              }}
            />
          )}
        />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.qtmBackgroundColor}}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      <QTMHeader
        headerTitle="Tubulu QTM"
        onPressBack={() => {
          navigation.goBack();
          setNewTasks([]);
          setFilteredTasks([]);
        }}
        onPressOptions={() => {
          // navigation.push('QTMNewTaskScreen', {navigation});
          setDisplayQTMAddOptions(!displayQTMAddOptions);
        }}
      />
      {renderTopicBanner()}
      <ScrollView>
        {filteredTasks?.length > 0 ? renderTasks() : renderNoNewTask()}
      </ScrollView>
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
      {displayTaskMenu && (
        <QTMMenuCard
          permissions={selectedTask?.permissions}
          type="TASK"
          top={taskMenuTop}
          isPinned={selectedTask?.isPinned}
          right={taskMenuRight}
          onPressPin={handlePinTasks}
          removeTask
          onPressMove={() => {
            // handleRemoveTask();
            setRemoveTask(true);
            setDeleteConfirmation(true);
          }}
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
            setDisplayTaskMenu(false);
          }}
        />
      )}
      {showDeleteConfirmation && (
        <ConfirmationPopup
          title={removeTask ? 'Remove Task?' : 'Delete Task?'}
          subTitle={`Do you really want to ${
            removeTask ? 'remove' : 'delete'
          } this Task?`}
          onCancel={() => {
            setDeleteConfirmation(false);
            setRemoveTask(false);
            setSelectedTask({} as IQTMTasksv2);
          }}
          yesText={'Yes'}
          onSave={() => {
            removeTask ? handleRemoveTask() : deleteTask();
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
