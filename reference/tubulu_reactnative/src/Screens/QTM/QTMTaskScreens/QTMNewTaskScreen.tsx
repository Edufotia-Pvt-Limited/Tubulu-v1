import {Spinner, TextArea, useToast} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Pressable,
  // SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {QTMAttachments} from '../../../Components/QTMComponents/QTMAttachmentList';
import {QTMFormHeader} from '../../../Components/QTMComponents/QTMFormHeader';
import {QTMMemberCard} from '../../../Components/QTMComponents/QTMMemberCard';
import {IAppState} from '../../../Store/State';
import {
  addNewTaskActions,
  addNewTaskToTopicAction,
  assignedMembersAction,
  clearSubTaskQueueAsync,
  getAllTasksV2Action,
  getMembersByTaskIdAction,
  getTaskAttachmentsAction,
  getTasksByTopicIdAction,
  selectedMemberAction,
  updateTaskDetailsAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {requestCameraPermission} from '../../../Utils/Helper';
import {UploadAttachments} from '../../../Utils/QTM.ApiActions';
import useKeyboardState from '../../../hooks/useKeyboardState';
import {
  IQTMMemberId,
  IQTMTasksv2,
  IUploadFileResponse,
} from '../../../models/IQTM';
import {AttachementSheet} from '../../ChatScreen';

interface Props {
  navigation: any;
  route: {params: {isEdit: boolean; isFromTopic: boolean}};
}

type SelectOpts = {
  id?: number;
  name: string;
  logo: string;
};

export function QTMNewTaskScreen({navigation, route}: Props) {
  const [taskDetails, setTaskDetails] = useState<IQTMTasksv2>({
    name: '',
  topicId: 0,
  description: '',
  attachements: [],
  owner: {
    id: 0,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    tubuluUserId: '',
    tubuluUserUUID: '',
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  },
  ownerId: 0,
  permissions: [],
  wattages: {
    cancelled: 0,
    completed: 0,
    inProgress: 0,
  },

  });
  const [selected, setSelected] = useState<boolean>(false);

  const assignedMembers = useSelector(
    (state: IAppState) => state.qtmState.assignedMembers,
  );
  const selectedTask = useSelector(
    (state: IAppState) => state.qtmState.selectedTask,
  );

  const selectedTaskMembers = useSelector(
    (state: IAppState) => state.qtmState.selectedTaskMembers,
  );

  const selectedAttachments = useSelector(
    (state: IAppState) => state.qtmState.taskAttachments,
  );

  const userDetails = useSelector(
    (state: IAppState) => state.qtmState.userDetails,
  );

  const draftedSubTasksForMember = useSelector(
    (state: IAppState) => state.qtmState.draftedSubTasksForMember,
  );

  const [attachmentData, setAttachmentData] = useState<IUploadFileResponse[]>(
    [],
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<{name: string; description: string}>(
    {name: '', description: ''},
  );

  const [isFromTopic, setIsFromTopic] = useState<boolean>(false);

  const dispatch: any = useDispatch();
  const toast = useToast();

  const isKeyboardOpen = useKeyboardState();

  const [newTaskLoading, setNewTaskLoading] = useState<boolean>(false);

  useEffect(() => {
    dispatch(assignedMembersAction([]));
    dispatch(clearSubTaskQueueAsync());
  }, []);

  useEffect(() => {
    setErrorMsg({name: '', description: ''});
  }, [taskDetails]);

  useEffect(() => {
    if (route?.params) {
      let {isEdit} = route?.params;
      setIsEdit(isEdit);
    }
    if (route?.params?.isFromTopic) {
      setIsFromTopic(true);
    }
  }, [route]);

  useEffect(() => {
    if (isEdit) {
      if (selectedTask) {
        console.log('The selectedTask::: ', selectedTask);
        setTaskDetails(selectedTask);
        selectedTask?.id && dispatch(getTaskAttachmentsAction(selectedTask.id));
        selectedTask?.id &&
          dispatch(getMembersByTaskIdAction(selectedTask?.id));
      }
    }
  }, [isEdit]);

  useEffect(() => {
    if (selectedAttachments.length && isEdit) {
      setTaskDetails({
        ...taskDetails,
        attachements: selectedAttachments.map(aItem => aItem.userAttachementId),
      });
      setAttachmentData(
        selectedAttachments.map(aItem => {
          return {
            createdAt: aItem.createdAt,
            url: aItem.url,
            deletedAt: aItem.deletedAt,
            fileName: aItem.fileName,
            originalFileName: aItem.originalFileName,
            id: aItem.userAttachementId,
            mimeType: aItem.mimeType,
            updatedAt: aItem.updatedAt,
            userId: 0,
          };
        }),
      );
    }
  }, [selectedAttachments]);

  useEffect(() => {
    if (selectedTaskMembers) {
      const _members: any = [];
      selectedTaskMembers.forEach(member => {
        _members.push({
          ...member,
          id: member.userId,
          qtmId: member.userQTMId,
          role: member.role,
        });
      });
      isEdit && dispatch(assignedMembersAction(_members));
    }
  }, [selectedTaskMembers, isEdit]);

  function handleChange(key: keyof IQTMTasksv2, value: string | number): void {
    setTaskDetails({
      ...taskDetails,
      [key]: value,
    });
  }

  async function handleAttachments(attachment: Asset): Promise<void> {
    setLoading(true);
    if (attachment?.uri && attachment?.fileName && attachment?.type) {
      let _base64 = await RNFS.readFile(attachment?.uri, 'base64');
      const response = await UploadAttachments({
        fileName: attachment?.fileName,
        mimeType: attachment?.type,
        file: _base64,
      });
      if (response) {
        setLoading(false);
        setAttachmentData([...attachmentData, response]);
        let _attachments = taskDetails?.attachements
          ? [...taskDetails?.attachements]
          : [];
        _attachments.push(response.id);
        setTaskDetails({
          ...taskDetails,
          attachements: _attachments,
        });
      } else {
        console.log('Unable to add attachments at the moment');
      }
    }
  }

  async function taskValidator() {
    let validation = true;
    const {name, description} = taskDetails;
    let errors = {...errorMsg};
    if (name?.trim?.() == '' || name?.length <= 3) {
      errors.name = 'Name is required, should be minimum of 3 characters';
      validation = false;
    }
    if (description?.trim?.() == '') {
      errors.description = 'Description is required';
      validation = false;
    }
    setErrorMsg(errors);
    return validation;
  }

  function handleRemove(attachment: IUploadFileResponse) {
    const _attachments = [...attachmentData];
    const newAttachments = _attachments.filter(
      aItem => aItem.id !== attachment.id,
    );
    setAttachmentData(newAttachments);
    setTaskDetails({
      ...taskDetails,
      attachements: newAttachments.map(aItem => aItem.id),
    });
  }

  async function createNewTask() {
    const validated = await taskValidator();
    if (validated) {
      setNewTaskLoading(true);
      try {
        const ownerIndex = assignedMembers.findIndex(
          item => item.role === 'OWNER',
        );
        const _memberIds: IQTMMemberId[] =
          ownerIndex >= 0 ? [] : [{userId: userDetails?.id, role: 'OWNER'}];
        assignedMembers?.forEach(member => {
          _memberIds.push({
            userId: member.qtmId,
            role: member.role ?? 'MEMBER',
          });
        });
        const _taskDetails = {
          ...taskDetails,
          memberIds: _memberIds,
        };
        if (isEdit) {
          _taskDetails?.id &&
            (await dispatch(
              updateTaskDetailsAction(_taskDetails?.id, _taskDetails),
            ));
          toast.show({
            description: 'Edited task successfully',
            bgColor: colors.greenBackground,
            color: colors.backgroundWhite,
            rounded: 'lg',
          });
        } else {
          if (isFromTopic) {
            await dispatch(addNewTaskToTopicAction(_taskDetails));
          } else {
            await dispatch(addNewTaskActions(_taskDetails));
          }
          toast.show({
            description: 'Created new task successfully',
            bgColor: colors.greenBackground,
            color: colors.backgroundWhite,
            rounded: 'lg',
          });
        }
        dispatch(getTasksByTopicIdAction(taskDetails?.topicId));
        dispatch(getAllTasksV2Action());
        setTaskDetails({} as IQTMTasksv2);
        setNewTaskLoading(false);
        isEdit
          ? navigation.goBack()
          : navigation.replace('QTMTaskDetailsScreen', {navigation});
      } catch (error) {
        setNewTaskLoading(false);
        console.log(error);
      }
    }
  }

  function renderMembers(): JSX.Element {
    const _user: any = {
      ...userDetails,
      userQTMId: userDetails.id,
    };
    return (
      <View style={{paddingHorizontal: 20, marginVertical: 5}}>
        {!isEdit && (
          <QTMMemberCard
            key={userDetails.id}
            onPressMenu={() => {}}
            data={[]}
            name={userDetails?.firstName}
            lastName={userDetails?.lastName}
            role="OWNER"
            subTasks={
              draftedSubTasksForMember?.filter(
                cItem => cItem.assignedUserId === userDetails.id,
              )?.length
            }
            onPress={() => {
              if (!isEdit && !newTaskLoading) {
                dispatch(selectedMemberAction(_user));
                navigation.push('QTMMemberDetailsScreen', {
                  navigation,
                  isOwner: true,
                });
              }
            }}
          />
        )}
        {assignedMembers?.map(member => {
          return (
            // member.role !== 'OWNER' && (
            <QTMMemberCard
              key={member.id}
              onPressMenu={() => {}}
              onPressCross={() => {
                if (!newTaskLoading) {
                  const _members = assignedMembers;
                  const newMembers = _members?.filter(
                    newMember => newMember.id !== member.id,
                  );
                  dispatch(assignedMembersAction(newMembers));
                }
              }}
              subTasks={
                draftedSubTasksForMember?.filter(
                  cItem => cItem.assignedUserId === member.qtmId,
                )?.length
              }
              data={isEdit ? undefined : []}
              role={member?.role ?? 'MEMBER'}
              name={member?.firstName ?? ''}
              lastName={member?.lastName ?? ''}
              onPress={() => {
                if (!isEdit && !newTaskLoading) {
                  const _selectedMember: any = {
                    ...member,
                    userQTMId: member?.qtmId,
                  };
                  dispatch(selectedMemberAction(_selectedMember));
                  navigation.push('QTMMemberDetailsScreen', {navigation});
                }
              }}
            />
            // )
          );
        })}
      </View>
    );
  }

  function createTaskForm(): JSX.Element {
    return (
      <View style={{marginHorizontal: 20}}>
        <View
          style={{
            marginTop: 25,
            height: 56,
            width: 'auto',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: errorMsg.name ? colors.errorRed : '#B7B7B7',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}>
          <MaterialCommunityIcons
            name={'clipboard-check'}
            size={20}
            style={{color: '#B7B7B7'}}
          />
          <TextInput
            style={{
              paddingLeft: 14,
              height: 'auto',
              width: '100%',
              color: colors.backgroundColorHeader,
              fontSize: 16,
              fontWeight: '400',
            }}
            value={taskDetails?.name}
            placeholder="Task name"
            placeholderTextColor={'#2355C4'}
            onChangeText={text => handleChange('name', text)}
          />
        </View>
        {errorMsg?.name !== undefined && errorMsg?.name !== '' && (
          <Text
            style={{
              color: colors.errorRed,
              fontSize: 14,
              fontWeight: '400',
              marginTop: 2,
            }}>
            {errorMsg?.name}
          </Text>
        )}
        <View
          style={{
            marginTop: 24,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: errorMsg.description ? colors.errorRed : '#B7B7B7',
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}>
          <Image
            style={{height: 20, width: 17, marginTop: 8}}
            source={require('../../../assets/description_icon.png')}
          />
          <TextArea
            style={{
              borderWidth: 0,
              paddingLeft: 18,
              height: 'auto',
              width: '100%',
              color: colors.backgroundColorHeader,
              fontSize: 16,
              fontWeight: '400',
              borderColor: colors.errorRed,
            }}
            maxLength={1000}
            value={taskDetails?.description}
            placeholder="Description"
            placeholderTextColor={'#2355C4'}
            onChangeText={text => handleChange('description', text)}
          />
          <View
            style={{
              position: 'absolute',
              alignSelf: 'baseline',
              bottom: 4,
              right: 4,
            }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '400',
                color: '#8A8A8E',
              }}>{`${taskDetails?.description?.length}/1000`}</Text>
          </View>
        </View>
        {errorMsg?.description !== undefined &&
          errorMsg?.description !== '' && (
            <Text
              style={{
                color: colors.errorRed,
                fontSize: 14,
                fontWeight: '400',
                marginTop: 2,
              }}>
              {errorMsg?.description}
            </Text>
          )}
        <View style={{marginTop: 24}}>
          <Text style={{color: '#4F4D4D', fontSize: 16, fontWeight: '400'}}>
            Attachments
          </Text>
          <View
            style={{
              marginTop: 17,
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              flex: 0,
            }}>
            <TouchableOpacity
              style={{marginRight: 10}}
              onPress={() => !loading && setIsOpen(!isOpen)}>
              {loading ? (
                <View
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: '#D9D9D9',
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Spinner size="sm" />
                </View>
              ) : (
                <Image
                  style={{width: 50, height: 50}}
                  source={require('../../../assets/attachment_icon.png')}
                />
              )}
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <QTMAttachments
                attachments={attachmentData}
                handleRemove={handleRemove}
              />
            </View>
          </View>
        </View>
        <View style={{marginTop: 24}}>
          <Text style={{color: '#4F4D4D', fontSize: 16, fontWeight: '400'}}>
            Add Members
          </Text>
          <TouchableOpacity
            style={{marginTop: 17}}
            onPress={() => {
              const editMembers: any = [];
              assignedMembers?.forEach(member => {
                editMembers.push({
                  ...member,
                  tubuluUserId: isEdit ? member.qtmId : member.tubuluUserId,
                });
              });
              dispatch(assignedMembersAction(editMembers));
              navigation.push('QTMAllContactScreen', {navigation});
            }}>
            <Image
              style={{width: 50, height: 50}}
              source={require('../../../assets/attachment_icon.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundWhite,
        position: 'relative',
      }}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      <QTMFormHeader
        header={isEdit ? 'Edit Task Details' : 'Create New Task'}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <ScrollView scrollEnabled={!selected}>
        <Pressable onPress={() => setSelected(false)}>
          <KeyboardAvoidingView>
            {createTaskForm()}
            {renderMembers()}
          </KeyboardAvoidingView>
        </Pressable>
      </ScrollView>
      <View style={{}}>
        {!isKeyboardOpen && (
          <TouchableOpacity
            onPress={() => !newTaskLoading && createNewTask()}
            style={{
              marginVertical: 20,
              borderRadius: 8,
              backgroundColor: colors.backgroundColorHeader,
              height: 52,
              width: Dimensions.get('screen').width / 1.5,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            {newTaskLoading ? (
              <Spinner />
            ) : (
              <Text
                style={{
                  color: colors.backgroundWhite,
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                {isEdit ? 'Done' : 'Create Task'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      <AttachementSheet
        isOpen={!isOpen}
        toggleHeightFlow={0}
        onCamera={() => {
          requestCameraPermission();
          setIsOpen(!isOpen);
          launchCamera({
            mediaType: 'mixed',
            cameraType: 'back',
            includeBase64: true,
          })
            .then(response => {
              let _assets = response.assets;
              if (_assets?.length) {
                handleAttachments(_assets?.[0]);
              }
            })
            .catch(error => {
              console.log(error);
            });
        }}
        onDocument={async () => {
          setIsOpen(!isOpen);
          try {
            const [file] = await pick({
              type: ['*/*'],
              presentationStyle: 'fullScreen',
              copyTo: 'documentDirectory'
            });
            
            if (file) {
              const fileInfo = await RNFS.stat(file.uri);
              const asset: Asset = {
                uri: file.uri,
                type: file.type || 'application/octet-stream',
                fileSize: fileInfo.size,
                fileName: file.name || 'document',
                height: 0,
                width: 0
              };
              
              handleAttachments({
                ...asset,
                fileName: asset.fileName,
                fileSize: asset.fileSize
              });
            }
          } catch (error: any) {
            if (error && error.code && error.code !== 'DOCUMENT_PICKER_CANCELED') {
              console.log('Document picker error:', error);
            }
          }
        }}
        onVideo={() => {
          setIsOpen(!isOpen);
          launchImageLibrary({
            mediaType: 'video',
            selectionLimit: 1,
            videoQuality: 'medium',
            includeBase64: true,
          })
            .then(response => {
              let _assets = response.assets;
              if (_assets?.length) {
                handleAttachments(_assets[0]);
              }
            })
            .catch(error => {
              console.log(error);
            });
        }}
        onGallery={() => {
          setIsOpen(!isOpen);
          launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            videoQuality: 'medium',
            includeBase64: true,
          })
            .then(response => {
              let _assets = response.assets;
              if (_assets?.length) {
                handleAttachments(_assets[0]);
              }
            })
            .catch(error => {
              console.log(error);
            });
        }}
      />
    </View>
  );
}
