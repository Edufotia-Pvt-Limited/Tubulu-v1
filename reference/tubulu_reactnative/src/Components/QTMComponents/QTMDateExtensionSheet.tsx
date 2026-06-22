import {Spinner, TextArea, useToast} from 'native-base';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch} from 'react-redux';
import {IQTMSubTaskDERequest, IQTMSubTasks} from '../../models/IQTM';
import {requestDEAction} from '../../Store/qtm.store/qtm.actions';
import {colors} from '../../Utils/Colors';
import {QTMformattedDateV4} from '../../Utils/Helper';
import {QTMFormattedTime} from '../../Utils/QTMHelper';

interface Props {
  readonly open: boolean;
  readonly subTask: IQTMSubTasks;
  readonly setModalClose: () => void;
}

export function QTMDateExtensionSheetModal({
  open,
  subTask,
  setModalClose,
}: Props): JSX.Element {
  const dispatch: any = useDispatch();
  const toast = useToast();

  const extensionReasonRef = useRef<string>('');
  const [date, setDate] = useState('');
  const [displayDatePicker, setDisplayDatePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [datePickedMode, setDatePicketMode] = useState<
    'date' | 'time' | 'datetime'
  >('date');
  const [time, setTime] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<{
    description: string;
    date: string;
    endTime: string;
  }>({description: '', date: '', endTime: ''});

  useEffect(() => {
    setErrorMsg({
      description: '',
      date: '',
      endTime: '',
    });
  }, [date, time]);

  function clearAndExit(): void {
    setDate('');
    setTime('');
    extensionReasonRef.current = '';
    setModalClose();
  }

  async function subTaskValidator() {
    let validation = true;
    let errors = {...errorMsg};
    if (extensionReasonRef?.current?.trim?.() == '') {
      errors.description = 'Reason is required';
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
    setErrorMsg(errors);
    return validation;
  }

  function handleDateTimeChange(date: Date) {
    if (datePickedMode == 'date') {
      setDate(date.toISOString());
      // setTime(date.toISOString());
    }
    if (datePickedMode == 'time') {
      // setDate(date.toISOString());
      setTime(date.toISOString());
    }
    setDisplayDatePicker(false);
  }

  function handleChange(text: string) {
    extensionReasonRef.current = text;
  }

  async function createDERequest() {
    const validated = await subTaskValidator();
    if (validated) {
      setLoading(true);
      if (subTask?.id && subTask?.memberId) {
        const _date = `${date.split('T')[0]}T${time.split('T')[1]}`;
        const requestData: IQTMSubTaskDERequest = {
          subTaskId: subTask.id,
          taskId: subTask.taskId,
          extensionReason: extensionReasonRef.current,
          extensionDateTime: new Date(_date).toISOString(),
          previousDateTime: subTask.endDate,
        };
        await dispatch(requestDEAction(requestData));
        toast.show({
          description: `Date Extension request successfull`,
          bgColor: colors.greenBackground,
          color: colors.backgroundWhite,
          rounded: 'lg',
        });
        setLoading(false);
        clearAndExit();
      }
    }
  }

  function FormHeader(): JSX.Element {
    return (
      <View
        style={{
          alignItems: 'center',
          paddingVertical: 10,
          borderBottomColor: '#E7E5E5',
          borderBottomWidth: 1,
        }}>
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 18,
            fontWeight: '500',
            color: colors.backgroundColorHeader,
          }}>
          Extend Date
        </Text>
      </View>
    );
  }

  function DateExtensionForm(): JSX.Element {
    return (
      <Pressable onPress={Keyboard.dismiss} style={{alignSelf: 'center'}}>
        <View
          style={{
            marginTop: 24,
            flexDirection: 'row',
          }}>
          <View
            style={{
              justifyContent: 'center',
              width: Dimensions.get('screen').width / 2 - 25,
              marginRight: 10,
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
                source={require('../../assets/calendar_icon.png')}
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
                {date !== '' ? (
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
            date={new Date()}
            onConfirm={handleDateTimeChange}
            onCancel={() => {
              setDisplayDatePicker(false);
            }}
          />
          <View
            style={{
              justifyContent: 'center',
              width: Dimensions.get('screen').width / 2 - 25,
              marginLeft: 10,
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
                {time !== '' ? (
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
            source={require('../../assets/description_icon.png')}
          />
          <TextArea
            style={{
              borderWidth: 0,
              paddingLeft: 18,
              minHeight: Dimensions.get('screen').height * 0.05,
              width: '80%',
              color: colors.backgroundColorHeader,
              fontSize: 16,
              fontWeight: '400',
            }}
            maxLength={500}
            // ref={extensionReasonRef}
            defaultValue={extensionReasonRef.current}
            placeholder="Reason for Extension"
            placeholderTextColor={'#2355C4'}
            onChangeText={text => {
              handleChange(text);
            }}
          />
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
        <TouchableOpacity
          onPress={() => {
            !loading && createDERequest();
          }}
          style={{
            marginTop: 24,
            borderRadius: 8,
            backgroundColor: colors.backgroundColorHeader,
            height: 52,
            width: Dimensions.get('screen').width - 20,
            // position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            // bottom: -80,
          }}>
          {loading ? (
            <Spinner />
          ) : (
            <Text
              allowFontScaling={false}
              style={{
                color: colors.backgroundWhite,
                fontSize: 16,
                fontWeight: '700',
              }}>
              Submit
            </Text>
          )}
        </TouchableOpacity>
      </Pressable>
    );
  }

  return (
    <ReactNativeModal
      isVisible={open}
      animationIn={'bounceInUp'}
      onBackdropPress={clearAndExit}
      onBackButtonPress={clearAndExit}
      backdropOpacity={0.7}
      coverScreen={false}>
      <View
        style={{
          alignSelf: 'center',
          height:
            Platform.OS === 'ios'
              ? Dimensions.get('screen').height * 0.65
              : 'auto',
          // padding: 15,
          width: Dimensions.get('screen').width,
          backgroundColor: colors.backgroundWhite,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          position: 'absolute',
          bottom: -20,
        }}>
        <View style={{marginTop: 10, marginBottom: 20}}>
          <Pressable
            onPress={clearAndExit}
            style={{
              height: 8,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                backgroundColor: colors.textColorGray,
                height: 5,
                width: 40,
                borderRadius: 20,
                alignSelf: 'center',
              }}
            />
          </Pressable>
          <FormHeader />
          <DateExtensionForm />
        </View>
      </View>
    </ReactNativeModal>
  );
}
