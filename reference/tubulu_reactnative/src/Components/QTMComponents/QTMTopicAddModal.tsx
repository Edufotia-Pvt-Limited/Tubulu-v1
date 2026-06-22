import {useToast} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import ReactNativeModal from 'react-native-modal';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import FontAwesomeIcon5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import navigationService from '../../Services/navigation.service';
import {IAppState} from '../../Store/State';
import {
  createUserTopicAction,
  getAllUserTopicsAction,
  moveTaskToTopicAction,
  removeUserTopicAction,
  selectedUserTopicAction,
  updateUserTopicAction,
} from '../../Store/qtm.store/qtm.actions';
import {colors} from '../../Utils/Colors';
import {deviceHeight, deviceWidth} from '../../Utils/Constants';
import {UploadAttachments} from '../../Utils/QTM.ApiActions';
import useKeyboardState from '../../hooks/useKeyboardState';
import {IQTMUserTopics, IUploadFile} from '../../models/IQTM';
import {ConfirmationPopup} from '../ConfirmationPopup';
import {QTMMenuCard} from './QTMMenuComponents';
import {QTMMovePopup} from './QTMMovePopUp';
import {QTMTopicCard} from './QTMTopicCard';
import {QTMTopicListCard} from './QTMTopicListCard';

interface Props {
  readonly visible: boolean;
  readonly setModalClose: () => void;
  readonly mode: 'EDIT' | 'CREATE' | 'VIEW' | 'MOVE';
}

type ImageType = {
  data: string;
};

export function QTMTopicAddModal({
  visible,
  setModalClose,
  mode = 'VIEW',
}: Props): JSX.Element {
  const dispatch: any = useDispatch();

  const [listMode, setListMode] = useState<boolean>(false);
  const [newTopicScreen, showNewTopicScreen] = useState<boolean>(false);
  const [resourcePath, setresourcePath] = useState('');
  const [topicDetails, setTopicDetails] = useState<IQTMUserTopics>({
    title: '',
    logo: '',
  });
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const isKeyboardOpen = useKeyboardState();

  const userTopics = useSelector(
    (state: IAppState) => state.qtmState.userTopics,
  );

  const selectedUserTopic = useSelector(
    (state: IAppState) => state.qtmState.selectedUserTopic,
  );

  const selectedTask = useSelector(
    (state: IAppState) => state.qtmState.selectedTask,
  );

  const [showTopicDeleteConfirmation, setTopicDeleteConfirmation] =
    useState<boolean>(false);

  const [displayTopicMenu, setDisplayTopicMenu] = useState<boolean>(false);

  const [taskMenuTop, setTaskMenuTop] = useState<number | undefined>(undefined);
  const [taskMenuRight, setTaskMenuRight] = useState<number | undefined>(
    undefined,
  );
  const [displayMove, setDisplayMove] = useState<boolean>(false);
  const [selectMoveTopic, setSelectedMoveTopic] = useState<IQTMUserTopics>(
    {} as IQTMUserTopics,
  );
  const [errorMsg, setErrorMsg] = useState<{title: string; logo: string}>({
    title: '',
    logo: '',
  });

  const [height, setHeight] = useState<Animated.Value>(new Animated.Value(0));

  const toast = useToast();

  useEffect(() => {
    switch (mode) {
      case 'EDIT':
        setIsEdit(true);
        showNewTopicScreen(true);
        break;
      case 'CREATE':
        showNewTopicScreen(true);
        break;
      case 'VIEW':
        return showNewTopicScreen(false);
      case 'MOVE':
        return showNewTopicScreen(false);
      default:
        return showNewTopicScreen(false);
    }
  }, [mode]);

  useEffect(() => {
    setErrorMsg({title: '', logo: ''});
  }, [topicDetails]);

  useEffect(() => {
    if (mode == 'EDIT' && isEdit) {
      selectedUserTopic?.id && setTopicDetails(selectedUserTopic);
      selectedUserTopic?.logo && setresourcePath(selectedUserTopic?.logo);
    }
  }, [mode, isEdit]);

  useEffect(() => {
    moveTopicModalOnKeyboard();
  }, [isKeyboardOpen]);

  function moveTopicModalOnKeyboard() {
    Animated.timing(height, {
      toValue: isKeyboardOpen ? deviceHeight * 0.89 : deviceHeight * 0.8,
      delay: 50,
      useNativeDriver: false,
    }).start();
  }

  function handleChange(key: 'title' | 'logo', value: string) {
    setTopicDetails({...topicDetails, [key]: value});
  }

  async function handleProfileChange(image: ImageOrVideo & ImageType) {
    const file: IUploadFile = {
      file: image?.data,
      fileName: image?.filename ?? `${Date.now().toLocaleString()}.png`,
      mimeType: image?.mime,
    };
    const response = await UploadAttachments(file);
    const _url: string = 'https://tubuludata.s3.amazonaws.com/' + response?.url;
    setresourcePath(_url);
    handleChange('logo', _url);
  }

  async function topicValidator() {
    let validation = true;
    const {title, logo} = topicDetails;
    let errors = {...errorMsg};
    if (title?.trim?.() == '' || title == undefined) {
      errors.title = 'Title is required';
      validation = false;
    }
    // if (logo?.trim?.() == '' || logo == undefined) {
    //   errors.logo = 'Logo is required';
    //   validation = false;
    // }
    setErrorMsg(errors);
    return validation;
  }

  async function handleMove() {
    selectMoveTopic?.id &&
      selectedTask?.id &&
      (await dispatch(
        moveTaskToTopicAction(selectMoveTopic.id, selectedTask.id),
      ));
    toast.show({
      description: 'Moved Task successfully',
      bgColor: colors.greenBackground,
      borderRadius: 20,
    });
    setSelectedMoveTopic({title: '', logo: ''});
  }

  async function createNewTopic() {
    const validated = await topicValidator();
    if (validated) {
      // Pass the details to create action / edit action as per the mode\
      // After getting the array, go back to the modal screen - for create
      // After getting the array. go back to homescreen = for edit
      if (isEdit) {
        await dispatch(updateUserTopicAction(topicDetails));
        setModalClose();
        showNewTopicScreen(false);
        setIsEdit(false);
        await dispatch(getAllUserTopicsAction());
        setTopicDetails({title: '', logo: ''});
        toast.show({
          description: 'Edited topic successfully',
          bgColor: colors.greenBackground,
          color: colors.backgroundWhite,
          borderRadius: 20,
        });
      } else {
        console.log('🚀 ~ topicDetails ~ 🚀', topicDetails);
        await dispatch(createUserTopicAction(topicDetails));
        setTopicDetails({title: '', logo: ''});
        setresourcePath('');
        showNewTopicScreen(false);
        await dispatch(getAllUserTopicsAction());
        toast.show({
          description: 'Topic created successfully',
          bgColor: colors.greenBackground,
          color: colors.backgroundWhite,
          borderRadius: 20,
        });
      }
    }
  }

  function renderModalHeader() {
    return (
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.backgroundColorHeader,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          margin: 15,
        }}>
        <TouchableOpacity
          onPress={() => {
            if (mode === 'CREATE') {
              setTopicDetails({title: '', logo: ''});
              setModalClose();
              setresourcePath('');
            }
            if (newTopicScreen) {
              showNewTopicScreen(false);
              setTopicDetails({title: '', logo: ''});
              setresourcePath('');
              isEdit && setIsEdit(false);
            } else {
              setModalClose();
              setListMode(false);
            }
          }}
          style={{flexDirection: 'row', alignItems: 'center', flex: 2}}>
          {mode !== 'EDIT' && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <FontAwesomeIcon5
                name="chevron-left"
                style={{fontSize: 16, color: colors.showMoreBlueColor}}
              />
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  color: colors.showMoreBlueColor,
                  marginLeft: 6,
                }}>
                Back
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={{flex: 2}}>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 16,
              color: colors.titleBlackColor,
              fontWeight: '700',
            }}>
            {newTopicScreen
              ? isEdit
                ? 'Edit Topic'
                : 'Create Topic'
              : mode !== 'MOVE'
              ? 'Topic'
              : 'Move to'}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            height: 32,
          }}>
          {!newTopicScreen && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: mode !== 'MOVE' ? 'space-between' : 'flex-end',
              }}>
              {mode !== 'MOVE' && (
                <TouchableOpacity
                  onPress={() => {
                    showNewTopicScreen(true);
                    setTopicDetails({title: '', logo: ''});
                    setresourcePath('');
                  }}
                  style={{
                    backgroundColor: colors.backgroundColorHeader,
                    height: 32,
                    width: 32,
                    borderRadius: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <FontAwesomeIcon5
                    name="plus"
                    size={16}
                    style={{color: colors.backgroundWhite}}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  setListMode(!listMode);
                }}
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {!listMode ? (
                  <FontAwesomeIcon5
                    name="list"
                    size={28}
                    style={{color: colors.backgroundColorHeader}}
                  />
                ) : (
                  <Icon
                    name="grid"
                    size={28}
                    style={{color: colors.backgroundColorHeader}}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  function renderTasksGrid() {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          paddingHorizontal: 3,
        }}>
        {userTopics?.map(topic => (
          <QTMTopicCard
          key={topic.id}
            fullMode
            imagrUri={topic?.logo}
            selected={mode === 'MOVE' && topic?.id == selectMoveTopic?.id}
            onPress={() => {
              if (mode === 'MOVE') {
                setDisplayMove(true);
                setSelectedMoveTopic(topic);
              } else {
                setTimeout(() => {
                  // topic?.id && dispatch(getTasksFromUserTopicAction(topic.id));
                  dispatch(selectedUserTopicAction(topic));
                  navigationService.push('QTMTopicDetailsV2');
                }, 300);
                setModalClose();
              }
            }}
            onPressMenu={event => {
              dispatch(selectedUserTopicAction(topic));
              setDisplayTopicMenu(true);
              const locationY =
                event.nativeEvent.pageY >= Dimensions.get('screen').height / 2
                  ? event.nativeEvent.pageY - 220
                  : event.nativeEvent.pageY - 150;
              const locationX =
                event.nativeEvent.pageX >= Dimensions.get('screen').width / 2
                  ? deviceWidth - event.nativeEvent.pageX
                  : event.nativeEvent.pageX - 40;
              setTaskMenuTop(locationY);
              setTaskMenuRight(locationX);
            }}
            topic={topic.title}
            totalTasks={topic?.taskCount}
            overdue={topic?.dueSubTasks}
          />
        ))}
        {mode !== 'MOVE' && (
          <TouchableOpacity
            onPress={() => {
              showNewTopicScreen(true);
              setTopicDetails({title: '', logo: ''});
              setresourcePath('');
            }}
            style={{
              height: 124,
              alignItems: 'center',
              justifyContent: 'center',
              width: Dimensions.get('screen').width / 3 - 20,
              shadowOpacity: 0.2,
              shadowRadius: 3.84,
              backgroundColor: colors.backgroundWhite,
              // borderWidth: 0.5,
              borderColor: colors.inputBorderGrey,
              borderRadius: 10,
              margin: 8,
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

  function renderTasks(): JSX.Element {
    return !listMode ? renderTasksGrid() : renderTasksList();
  }

  function renderTasksList(): JSX.Element {
    return (
      <View
        style={{
          paddingHorizontal: 15,
        }}>
        {userTopics?.map(topic => (
          <QTMTopicListCard
            key={topic.id}
            topic={topic}
            onPress={() => {
              if (mode === 'MOVE') {
                setDisplayMove(true);
                setSelectedMoveTopic(topic);
              } else {
                setTimeout(() => {
                  // topic?.id && dispatch(getTasksFromUserTopicAction(topic?.id));
                  dispatch(selectedUserTopicAction(topic));
                  navigationService.push('QTMTopicDetailsV2');
                }, 300);
                setModalClose();
              }
            }}
            onPressMenu={event => {
              dispatch(selectedUserTopicAction(topic));
              setDisplayTopicMenu(true);
              const locationY =
                event.nativeEvent.pageY >= Dimensions.get('screen').height / 2
                  ? event.nativeEvent.pageY - 250
                  : event.nativeEvent.pageY - 90;
              const locationX =
                event.nativeEvent.pageX >= Dimensions.get('screen').width / 2
                  ? event.nativeEvent.pageX - 320
                  : event.nativeEvent.pageX - 60;
              setTaskMenuTop(locationY);
              setTaskMenuRight(locationX);
            }}
          />
        ))}
        {mode !== 'MOVE' && (
          <TouchableOpacity
            onPress={() => {
              showNewTopicScreen(true);
              setTopicDetails({title: '', logo: ''});
              setresourcePath('');
            }}
            style={{
              height: 37,
              width: Dimensions.get('screen').width - 30,
              // borderWidth: 0.3,
              borderRadius: 5,
              borderColor: colors.inputBorderGrey,
              backgroundColor: colors.backgroundWhite,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: 'rgba(0, 0, 0, 0.8)',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 2,
              marginTop: 6,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <FontAwesomeIcon5
                name="plus"
                size={16}
                style={{color: colors.backgroundColorHeader}}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  color: colors.titleBlackColor,
                  marginLeft: 4,
                }}>
                Create New Topic
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderNewTopicForm(): JSX.Element {
    return (
      <Pressable
        onPress={Keyboard.dismiss}
        style={{paddingHorizontal: 20, marginTop: 20}}>
        <View
          style={{
            width: 208,
            height: 208,
            alignSelf: 'center',
            marginBottom: 20,
          }}>
          <View
            style={{
              width: 208,
              height: 208,
              borderColor: errorMsg?.logo ? colors.errorRed : '#75BDFF',
              borderWidth: 2,
              borderRadius: 200,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                height: 190,
                width: 190,
                borderRadius: 200,
                backgroundColor: colors.backgroundWhite,
              }}
              source={
                resourcePath == ''
                  ? require('../../assets/topic_image.png')
                  : {uri: resourcePath}
              }
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              ImagePicker.openPicker({
                mediaType: 'photo',
                selectionLimit: 1,
                cropping: true,
                includeBase64: true,
              })
                .then(response => {
                  handleProfileChange(response as any);
                  // setresourcePath(response.path);
                })
                .catch(error => {
                  console.log(error);
                });
            }}
            style={{position: 'absolute', top: 140, alignSelf: 'flex-end'}}>
            <Image
              style={{height: 52, width: 52}}
              source={
                !isEdit
                  ? require('../../assets/add_button.png')
                  : require('../../assets/edit_icon.png')
              }
            />
          </TouchableOpacity>
        </View>
        {errorMsg?.logo !== undefined && errorMsg?.logo !== '' && (
          <Text
            style={{
              color: colors.errorRed,
              fontSize: 14,
              fontWeight: '400',
              marginTop: 2,
              alignSelf: 'center',
            }}>
            {errorMsg?.logo}
          </Text>
        )}
        <View
          style={{
            height: 56,
            width: 'auto',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: errorMsg.title ? colors.errorRed : '#B7B7B7',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginTop: 30,
          }}>
          <Image
            style={{height: 20, width: 16}}
            source={require('../../assets/topic_icon.png')}
          />
          <TextInput
            style={{
              paddingLeft: 18,
              height: 'auto',
              width: '100%',
              color: colors.backgroundColorHeader,
              fontSize: 16,
              fontWeight: '400',
            }}
            value={topicDetails?.title}
            placeholder="New Topic"
            placeholderTextColor={'#2355C4'}
            onChangeText={text => handleChange('title', text)}
          />
        </View>
        {errorMsg?.title !== undefined && errorMsg?.title !== '' && (
          <Text
            style={{
              color: colors.errorRed,
              fontSize: 14,
              fontWeight: '400',
              marginTop: 2,
            }}>
            {errorMsg?.title}
          </Text>
        )}
        <TouchableOpacity
          onPress={createNewTopic}
          style={{
            marginVertical: 80,
            borderRadius: 8,
            backgroundColor: colors.backgroundColorHeader,
            height: 52,
            width: Dimensions.get('screen').width / 1.5,
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
            {isEdit ? 'Save Changes' : 'Create Topic'}
          </Text>
        </TouchableOpacity>
      </Pressable>
    );
  }

  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn={'slideInUp'}
      onBackdropPress={() => {
        setModalClose();
        // setListMode(false);
        // showNewTopicScreen(false);
      }}
      backdropOpacity={0.7}
      onBackButtonPress={setModalClose}
      coverScreen={false}>
      <Animated.View
        style={{
          alignSelf: 'center',
          height:
            Platform.OS === 'ios'
              ? height
              : isKeyboardOpen
              ? deviceHeight * 0.62
              : deviceHeight * 0.8,
          //   padding: 15,
          width: Dimensions.get('screen').width,
          backgroundColor: colors.backgroundWhite,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          position: 'absolute',
          bottom: -20,
        }}>
        <View>{renderModalHeader()}</View>
        {newTopicScreen ? renderNewTopicForm() : renderTasks()}
        {displayTopicMenu && (
          <QTMMenuCard
            permissions={['EDIT', 'DELETE']}
            type="TOPIC"
            top={taskMenuTop}
            right={taskMenuRight}
            onCancel={() => setDisplayTopicMenu(false)}
            onPressEdit={() => {
              setDisplayTopicMenu(false);
              showNewTopicScreen(true);
              setIsEdit(true);
              selectedUserTopic && setTopicDetails(selectedUserTopic);
              selectedUserTopic && setresourcePath(selectedUserTopic?.logo);
              // setTopicMode('EDIT');
              // dispatch(selectedTopicAction(selectedTopic));
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
              selectedUserTopic?.id &&
                dispatch(removeUserTopicAction(selectedUserTopic.id));
              dispatch(selectedUserTopicAction({title: '', logo: ''}));
              toast.show({
                description: 'Deleted topic successfully',
                bgColor: colors.greenBackground,
                color: colors.backgroundWhite,
                borderRadius: 20,
              });
            }}
          />
        )}
        {displayMove && (
          <QTMMovePopup
            onSave={() => {
              setDisplayMove(false);
              handleMove();
              setModalClose();
              // setSelectedMoveTopic({title: "", logo: ""});
              // setTimeout(() => {
              //   navigationService.push('QTMTopicDetailsV2');
              // }, 300);
            }}
            yesText="Move"
            title="Move to Topic"
            subTitle="Are you sure to move the task to this topic?"
            onCancel={() => {
              setDisplayMove(false);
            }}
          />
        )}
      </Animated.View>
    </ReactNativeModal>
  );
}
