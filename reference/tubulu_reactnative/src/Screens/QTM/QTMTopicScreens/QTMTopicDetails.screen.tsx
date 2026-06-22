import React, {useEffect, useState} from 'react';
import {Dimensions, FlatList, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmationPopup} from '../../../Components/ConfirmationPopup';
import {QTMAddOptions} from '../../../Components/QTMComponents/QTMAddOptions';
import {QTMHeader} from '../../../Components/QTMComponents/QTMHeader';
import {QTMMenuCard} from '../../../Components/QTMComponents/QTMMenuComponents';
import {QTMTaskCard} from '../../../Components/QTMComponents/QTMTaskCard';
import {IAppState} from '../../../Store/State';
import {
  getMembersByTaskIdAction,
  getTasksByTopicIdAction,
  getTopicAttachmentsAction,
  selectedTaskAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {getTopicAttachmentCount} from '../../../Utils/QTM.ApiActions';
import {IQTMTasksv2} from '../../../models/IQTM';

interface RouteProps {
  navigation: any;
}

export function QTMTopicDetailsScreen({navigation}: RouteProps): JSX.Element {
  const [displayQTMAddOptions, setDisplayQTMAddOptions] =
    useState<boolean>(false);
  const [count, setCount] = useState<number>(0);

  const tasks = useSelector((state: IAppState) => state.qtmState?.tasks);
  const selectedTopic = useSelector(
    (state: IAppState) => state.qtmState.selectedTopic,
  );

  const dispatch: any = useDispatch();

  const [displayTaskMenu, setDisplayTaskMenu] = useState<boolean>(false);

  const [menuTop, setMenuTop] = useState<number | undefined>(undefined);
  const [menuRight, setMenuRight] = useState<number | undefined>(undefined);

  const [showDeleteConfirmation, setDeleteConfirmation] =
    useState<boolean>(false);

  const [selectedTask, setSelectedTask] = useState<IQTMTasksv2>(
    {} as IQTMTasksv2,
  );

  useEffect(() => {
    if (selectedTopic?.id) {
      dispatch(getTasksByTopicIdAction(selectedTopic?.id));
      dispatch(getTopicAttachmentsAction(selectedTopic?.id));
      getCount(selectedTopic?.id);
    }
  }, [selectedTopic]);

  async function getCount(topicId: number) {
    const count = await getTopicAttachmentCount(topicId);
    setCount(count);
  }

  const goToQTMTaskScreen = () => {
    navigation.push('QTMNewTaskScreen', {navigation});
  };

  const goToQTMTopicScreen = () => {
    navigation.push('QTMNewTopicScreen', {navigation});
  };

  const renderTasks = () => (
    <FlatList
      data={tasks}
      style={{
        paddingHorizontal: 15,
        marginBottom: 30,
      }}
      renderItem={({item}) => {
        return (
          <QTMTaskCard
            task={item.name}
            topic={selectedTopic?.name ?? ''}
            data={item?.wattages}
            onPress={() => {
              item?.id && dispatch(getMembersByTaskIdAction(item?.id));
              dispatch(selectedTaskAction(item));
              navigation.navigate('QTMTaskDetailsScreen', {navigation});
            }}
            onPressMenu={event => {
              setSelectedTask(item);
              if (
                event.nativeEvent.pageY >
                Dimensions.get('screen').height * 0.8
              ) {
                setMenuTop(Dimensions.get('screen').height * 0.8);
              } else {
                const locationY = event.nativeEvent.pageY + 5;
                setMenuTop(locationY);
              }
              const locationX = event.nativeEvent.pageX - 320;
              setMenuRight(locationX);
              setDisplayTaskMenu(true);
            }}
          />
        );
      }}
    />
  );

  return (
    <View style={{flex: 1, backgroundColor: colors.qtmBackgroundColor}}>
      <QTMHeader
        headerTitle={selectedTopic?.name ?? ''}
        topicLogo={selectedTopic?.logo ?? ''}
        onPressBack={() => {
          navigation.navigate('HomeScreen');
        }}
        onPressOptions={() => setDisplayQTMAddOptions(!displayQTMAddOptions)}
      />
      <View
        style={{
          marginHorizontal: 17,
          marginTop: 30,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Text
          style={{
            flex: 1,
            color: colors.titleBlackColor,
            fontSize: 18,
            fontWeight: '700',
          }}>
          Description
        </Text>
        {/* <TouchableOpacity
          onPress={() => {
            navigation.navigate('QTMAttachmentScreen', {
              navigation,
              from: 'TOPIC',
            });
          }}
          style={{
            flex: 0,
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
        </TouchableOpacity> */}
      </View>
      <View style={{marginHorizontal: 17, marginTop: 10}}>
        <Text
          style={{
            color: '#868080',
            fontSize: 16,
            fontWeight: '400',
            textAlign: 'justify',
            lineHeight: 19,
            maxHeight: 108,
            width: 'auto',
          }}>
          {selectedTopic?.description ?? ''}
        </Text>
      </View>
      <View
        style={{
          paddingHorizontal: 15,
          marginTop: 37,
        }}>
        <Text
          style={{
            color: colors.titleBlackColor,
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 3,
          }}>
          Task
        </Text>
      </View>
      {renderTasks()}
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
      {displayTaskMenu && (
        <QTMMenuCard
          type="TASK"
          top={menuTop}
          right={menuRight}
          onCancel={() => setDisplayTaskMenu(false)}
          onPressEdit={() => {
            dispatch(selectedTaskAction(selectedTask));
            navigation.navigate('QTMNewTaskScreen', {navigation, isEdit: true});
          }}
          onPressDelete={() => {
            setDeleteConfirmation(true);
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
            // onLogout();
          }}
        />
      )}
    </View>
  );
}
