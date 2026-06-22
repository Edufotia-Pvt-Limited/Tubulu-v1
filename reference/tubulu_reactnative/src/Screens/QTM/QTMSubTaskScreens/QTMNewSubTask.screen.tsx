import {ScrollView, Slider, Spinner, TextArea, useToast} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  // SafeAreaView,
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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {QTMAttachments} from '../../../Components/QTMComponents/QTMAttachmentList';
import {QTMFormHeader} from '../../../Components/QTMComponents/QTMFormHeader';
import {IAppState} from '../../../Store/State';
import {
  addNewSubTaskAction,
  addNewSubTaskInQueueForTaskAction,
  getSubTaskAttachmentsAction,
  getSubTasksByMemberIdAndTaskIdAction,
  refreshAllAction,
  updateSubTaskDetailsAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {
  QTMformattedDateV4,
  requestCameraPermission,
} from '../../../Utils/Helper';
import {UploadAttachments} from '../../../Utils/QTM.ApiActions';
import {QTMFormattedTime} from '../../../Utils/QTMHelper';
import {
  IQTMMembers,
  IQTMSubTasksRequest,
  IUploadFileResponse,
} from '../../../models/IQTM';
import {AttachementSheet} from '../../ChatScreen';

interface Props {
  navigation: any;
  route: {params: {isEdit: boolean; isFromTask: boolean}};
}

export function QTMNewSubTaskScreen({navigation, route}: Props): JSX.Element {
  const [subTaskDetails, setSubTaskDetails] = useState<IQTMSubTasksRequest>({
    name: '',
    description: '',
    assignedUserId: 0,
    attachements: [],
    date: '',
    taskId: 0,
    wattage: 0,
    endTime: '',
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [attachmentData, setAttachmentData] = useState<IUploadFileResponse[]>(
    [],
  );
  const [date, setDate] = useState(new Date());
  const [displayDatePicker, setDisplayDatePicker] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [datePickedMode, setDatePicketMode] = useState<
    'date' | 'time' | 'datetime'
  >('date');
  const [time, setTime] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<{
    name: string;
    description: string;
    date: string;
    endTime: string;
    percentage: string;
  }>({name: '', description: '', date: '', endTime: '', percentage: ''});

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isFromTask, setIsFromTask] = useState<boolean>(false);

  const selectedMember = useSelector(
    (state: IAppState) => state.qtmState?.selectedMember,
  );

  const selectedSubTask = useSelector(
    (state: IAppState) => state.qtmState?.selectedSubTask,
  );

  const subTaskLoading = useSelector(
    (state: IAppState) => state.qtmState.subTaskLoading,
  );

  const selectedAttachments = useSelector(
    (state: IAppState) => state.qtmState.subTaskAttachments,
  );

  const dispatch: any = useDispatch();

  const toast = useToast();

  useEffect(() => {
    setErrorMsg({
      name: '',
      description: '',
      date: '',
      endTime: '',
      percentage: '',
    });
  }, [subTaskDetails]);

  useEffect(() => {
    if (route?.params) {
      let {isEdit} = route?.params;
      setIsEdit(isEdit);
    }
    if (route?.params) {
      let {isFromTask} = route?.params;
      setIsFromTask(isFromTask);
    }
  }, [route]);

  useEffect(() => {
    if (isEdit) {
      if (selectedSubTask) {
        selectedSubTask?.id &&
          dispatch(getSubTaskAttachmentsAction(selectedSubTask.id));
        const _details: any = selectedSubTask;
        setSubTaskDetails({..._details, date: selectedSubTask.endDate});
        setPercentage(selectedSubTask?.wattage);
        setDate(new Date(selectedSubTask?.endDate));
        setTime(selectedSubTask?.endDate);
      }
    }
  }, [isEdit, selectedSubTask]);

  useEffect(() => {
    if (selectedAttachments.length && isEdit) {
      setSubTaskDetails({
        ...subTaskDetails,
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

  function handleChange(key: keyof IQTMSubTasksRequest, value: string) {
    setSubTaskDetails({
      ...subTaskDetails,
      [key]: value,
    });
  }

  function handleDateTimeChange(date: Date) {
    if (datePickedMode == 'date') {
      setDate(date);
      setSubTaskDetails({
        ...subTaskDetails,
        date: date.toISOString(),
      });
    }
    if (datePickedMode == 'time') {
      setDate(date);
      setTime(date.toISOString());
      setSubTaskDetails({
        ...subTaskDetails,
        date: date.toISOString(),
      });
    }
    setDisplayDatePicker(false);
  }

  async function handleAttachments(attachment: Asset): Promise<void> {
    console.log(
      '\x1b[37m',
      '\x1b[42m',
      '🚀 ~ attachment ~ 🚀',
      attachment,
      '\x1b[0m',
    );
    setLoading(true);
    if (attachment?.uri && attachment?.fileName && attachment?.type) {
      let _base64 = await RNFS.readFile(attachment?.uri, 'base64');
      const response = await UploadAttachments({
        fileName: attachment?.fileName,
        mimeType: attachment?.type,
        file: _base64,
      });
      console.log(
        '\x1b[37m',
        '\x1b[42m',
        '🚀 ~ Attachment Response ~ 🚀',
        response,
        '\x1b[0m',
      );
      if (response) {
        setLoading(false);
        setAttachmentData([...attachmentData, response]);
        let _attachments = subTaskDetails?.attachements
          ? [...subTaskDetails?.attachements]
          : [];
        _attachments.push(response.id);
        console.log('🚀 ~ _attachments ~ 🚀', _attachments);
        setSubTaskDetails({
          ...subTaskDetails,
          attachements: _attachments,
        });
      } else {
        console.log('Unable to add attachments at the moment');
      }
    }
  }

  async function subTaskValidator() {
    let validation = true;
    const {name, description} = subTaskDetails;
    let errors = {...errorMsg};
    if (name?.trim?.() == '' || name?.length <= 3) {
      errors.name = 'Name is required, should be minimum of 3 characters';
      validation = false;
    }
    if (description?.trim?.() == '') {
      errors.description = 'Description is required';
      validation = false;
    }
    if (date?.toString()?.trim?.() == '') {
      errors.date = 'End Date is required';
      validation = false;
    }
    if (time?.toString()?.trim?.() == '') {
      errors.endTime = 'End Time is required';
      validation = false;
    }
    if (percentage == 0) {
      errors.percentage = 'Please assign weightage to subtask';
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
    setSubTaskDetails({
      ...subTaskDetails,
      attachements: newAttachments.map(aItem => aItem.id),
    });
  }

  async function createNewSubTask(member: IQTMMembers): Promise<void> {
    const {userQTMId, taskId} = member;
    if (userQTMId && taskId) {
      const validated = await subTaskValidator();
      if (validated) {
        const _attachments = attachmentData?.map(attachment => attachment?.id);
        const _subTaskDetails: IQTMSubTasksRequest = {
          ...subTaskDetails,
          wattage: percentage,
          assignedUserId: userQTMId,
          taskId: taskId,
          date: date.toISOString(),
        };
        if (isEdit) {
          _subTaskDetails?.id &&
            (await dispatch(
              updateSubTaskDetailsAction(_subTaskDetails?.id, _subTaskDetails),
            ));
          toast.show({
            description: 'Edited the sub task successfully',
            bgColor: colors.greenBackground,
            color: colors.backgroundWhite,
            rounded: 'lg',
          });
        } else {
          await dispatch(addNewSubTaskAction(_subTaskDetails));
          toast.show({
            description: 'Created new sub task successfully',
            bgColor: colors.greenBackground,
            color: colors.backgroundWhite,
            rounded: 'lg',
          });
        }
        await dispatch(getSubTasksByMemberIdAndTaskIdAction(userQTMId, taskId));
        await dispatch(refreshAllAction());
        navigation.goBack();
      }
    }
    if (userQTMId && isFromTask) {
      const validated = await subTaskValidator();
      if (validated) {
        const _subTaskDetails: IQTMSubTasksRequest = {
          ...subTaskDetails,
          wattage: percentage,
          assignedUserId: userQTMId,
          date: date.toISOString(),
        };
        await dispatch(addNewSubTaskInQueueForTaskAction(_subTaskDetails));
        navigation.goBack();
      }
    }
  }

  function renderSubTaskForm(): JSX.Element {
    return (
      <View style={{paddingHorizontal: 20, display: 'flex'}}>
        <View
          style={{
            marginTop: 25,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: colors.backgroundColorHeader,
            }}>
            Assign to: {selectedMember?.firstName} {selectedMember?.lastName}
          </Text>
        </View>
        <View
          style={{
            marginTop: 15,
            height: 56,
            width: 'auto',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: '#B7B7B7',
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
            value={subTaskDetails?.name}
            placeholder="Subtask name"
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
            borderColor: '#B7B7B7',
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
            }}
            maxLength={1000}
            value={subTaskDetails?.description}
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
              }}>{`${subTaskDetails?.description?.length}/1000`}</Text>
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
        <View style={{marginTop: 24, flexDirection: 'row'}}>
          <View
            style={{
              justifyContent: 'center',
              width: Dimensions.get('screen').width / 2 - 25,
              marginRight: 5,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 8,
                borderColor: '#868484',
                height: 56,
                borderWidth: 0.5,
                paddingHorizontal: 14,
              }}>
              <Image
                style={{width: 20, height: 20, marginRight: 17}}
                source={require('../../../assets/calendar_icon.png')}
              />
              <TouchableOpacity
                onPress={() => {
                  setDisplayDatePicker(true);
                  setDatePicketMode('date');
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {subTaskDetails.date !== undefined ? (
                  <Text
                    allowFontScaling={false}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={{
                      color: colors.titleBlackColor,
                      fontSize: 16,
                      fontWeight: '700',
                    }}>
                    {QTMformattedDateV4(date)}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: colors.backgroundColorHeader,
                      fontSize: 16,
                      fontWeight: '400',
                      marginRight: 8,
                    }}>
                    End Date
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {errorMsg?.date !== undefined && errorMsg?.date !== '' && (
              <Text
                style={{
                  color: colors.errorRed,
                  fontSize: 14,
                  fontWeight: '400',
                  marginTop: 2,
                }}>
                {errorMsg?.date}
              </Text>
            )}
          </View>
          <DateTimePickerModal
            isVisible={displayDatePicker}
            mode={datePickedMode}
            date={date}
            onConfirm={handleDateTimeChange}
            onCancel={() => {
              setDisplayDatePicker(false);
            }}
          />
          {/* <DatePicker
            modal
            open={displayDatePicker}
            date={date}
            mode={datePickedMode}
            minuteInterval={15}
            onConfirm={handleDateTimeChange}
            onCancel={() => {
              setDisplayDatePicker(false);
            }}
          /> */}
          <View
            style={{
              justifyContent: 'center',
              width: Dimensions.get('screen').width / 2 - 25,
              marginLeft: 5,
            }}>
            <View
              style={{
                flexDirection: 'row',
                height: 56,
                borderWidth: 0.5,
                borderRadius: 8,
                borderColor: '#868484',
                alignItems: 'center',
                paddingHorizontal: 14,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setDisplayDatePicker(true);
                  setDatePicketMode('time');
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <MaterialCommunityIcons
                  name="clock-time-eight"
                  size={24}
                  color={'#B7B7B7'}
                />

                {subTaskDetails.date !== '' ? (
                  <Text
                    allowFontScaling={false}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={{
                      color: colors.titleBlackColor,
                      fontSize: 16,
                      paddingLeft: 10,
                      fontWeight: '700',
                    }}>
                    {QTMFormattedTime(time)}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: colors.backgroundColorHeader,
                      fontSize: 16,
                      fontWeight: '400',
                      marginRight: 8,
                      paddingLeft: 10,
                    }}>
                    Time
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {errorMsg?.endTime !== undefined && errorMsg?.endTime !== '' && (
              <Text
                style={{
                  color: colors.errorRed,
                  fontSize: 14,
                  fontWeight: '400',
                  marginTop: 2,
                  alignSelf: 'center',
                }}>
                {errorMsg?.endTime}
              </Text>
            )}
          </View>
        </View>
        <View style={{marginTop: 24}}>
          <View
            style={{
              marginBottom: 35,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#4F4D4D',
                  fontSize: 16,
                  fontWeight: '400',
                }}>
                Weightage
              </Text>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 8,
                  borderColor: '#868484',
                  height: 40,
                  width: 70,
                  marginLeft: 10,
                  borderWidth: 0.5,
                  paddingHorizontal: 14,
                }}>
                <TextInput
                  style={{
                    height: 'auto',
                    width: '100%',
                    color: colors.backgroundColorHeader,
                    fontSize: 16,
                    fontWeight: '400',
                  }}
                  maxLength={3}
                  keyboardType="number-pad"
                  value={percentage.toString()}
                  onChangeText={text => {
                    if (Number(text) <= 100) {
                      handleChange('wattage', text);
                      setPercentage(Number(text));
                    } else {
                      setErrorMsg({
                        ...errorMsg,
                        percentage: 'Weightage cannot exceed 100',
                      });
                    }
                  }}
                />
              </View>
            </View>
            {errorMsg?.percentage !== undefined &&
              errorMsg?.percentage !== '' && (
                <Text
                  style={{
                    color: colors.errorRed,
                    fontSize: 14,
                    fontWeight: '400',
                    marginTop: 2,
                  }}>
                  {errorMsg?.percentage}
                </Text>
              )}
          </View>
          <Slider
            onChange={v => {
              setPercentage(Math.floor(v));
            }}
            value={percentage}
            colorScheme={'blue'}
            minValue={0}
            maxValue={100}
            accessibilityLabel="Wattage bar"
            step={1}>
            <Slider.Track>
              <Slider.FilledTrack />
            </Slider.Track>
            <Slider.Thumb>
              <View
                style={{
                  position: 'absolute',
                  top: -24,
                  left: percentage > 85 ? -30 : 10,
                  width: 40,
                  backgroundColor: colors.backgroundColorHeader,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  borderBottomEndRadius: percentage > 85 ? 0 : 4,
                  borderBottomStartRadius: percentage > 85 ? 4 : 0,
                }}>
                <Text
                  style={{color: colors.backgroundWhite, paddingVertical: 2}}>
                  {percentage} %
                </Text>
              </View>
            </Slider.Thumb>
          </Slider>
        </View>
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
                attachments={attachmentData?.length ? attachmentData : []}
                handleRemove={handleRemove}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.qtmBackgroundColor}}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      <QTMFormHeader
        header={isEdit ? 'Edit Subtask' : 'Create New Subtask'}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <ScrollView>
        {renderSubTaskForm()}
        <TouchableOpacity
          onPress={() => {
            !subTaskLoading &&
              selectedMember &&
              createNewSubTask(selectedMember);
          }}
          style={{
            marginTop: 80,
            borderRadius: 8,
            backgroundColor: colors.backgroundColorHeader,
            height: 52,
            width: 262,
            justifyContent: 'center',
            alignItems: 'center',
            // position: 'absolute',
            alignSelf: 'center',
            bottom: 40,
            // zIndex: 10,
          }}>
          {subTaskLoading ? (
            <Spinner />
          ) : (
            <Text
              style={{
                color: colors.backgroundWhite,
                fontSize: 16,
                fontWeight: '700',
              }}>
              Done
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      {/* <View
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
        }}> */}
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
            // First, pick the file
            const [file] = await pick({
              type: ['*/*'],
              presentationStyle: 'fullScreen',
              copyTo: 'documentDirectory'
            });
            
            if (file) {
              // Get file info
              const fileInfo = await RNFS.stat(file.uri);
              
              // Create an asset object that matches the expected type
              const asset: Asset = {
                uri: file.uri,
                type: file.type || 'application/octet-stream',
                fileSize: fileInfo.size,
                fileName: file.name || 'document',
                // Add any other required properties for the Asset type
                height: 0,
                width: 0
              };
              
              // Handle the file using handleAttachments
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
      {/* </View> */}
    </View>
  );
}
