import React, {useEffect, useState} from 'react';
import {
  GestureResponderEvent,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../Utils/Colors';
import {QTMformattedDateV2, getDaysBetweenTwoDates} from '../../Utils/Helper';
import {QTMFormattedTime} from '../../Utils/QTMHelper';
import {QTMReviewStar} from './QTMStatusUpdateModal';

interface Props {
  readonly onPress: () => void;
  readonly name: string;
  readonly dueDate: string;
  readonly showMenu?: boolean;
  readonly status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'YET_TO_START';
  readonly showCross?: boolean;
  readonly rating?: number;
  readonly clickedStatusClosed?: () => void;
  readonly clickedStatusCancel?: () => void;
  readonly clickedStatusProgress?: () => void;
  readonly onPressMenu?: (event: GestureResponderEvent) => void;
  readonly onPressStatus: () => void;
  readonly onPressCross?: () => void;
}


const statusColor = {
  INPROGRESS: colors.inProgressYellow,
  CLOSED: colors.completedGreen,
  CANCEL: colors.cancelledRed,
};

export function QTMSubTaskCard({
  onPress,
  name,
  dueDate,
  status,
  showMenu,
  showCross = false,
  rating,
  onPressStatus,
  clickedStatusClosed,
  clickedStatusCancel,
  clickedStatusProgress,
  onPressMenu,
  onPressCross,
}: Props): JSX.Element {
  const [statusObj, setStatusObj] = useState<{
    _status: string;
    _color: string;
  }>({_status: 'In Progress', _color: statusColor.INPROGRESS});
  const [dayCount, setDayCount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    handleStatus();
  }, [status]);

  useEffect(() => {
    getDaysCount();
  }, [dueDate]);

  function handleStatus() {
    switch (status) {
      case 'IN_PROGRESS':
        return setStatusObj({
          _status: 'IN PROGRESS',
          _color: statusColor.INPROGRESS,
        });
      case 'COMPLETED':
        return setStatusObj({_status: 'COMPLETED', _color: statusColor.CLOSED});
      case 'CANCELLED':
        return setStatusObj({_status: 'CANCEL', _color: statusColor.CANCEL});
      case 'YET_TO_START':
        return setStatusObj({
          _status: 'YET TO START',
          _color: statusColor.INPROGRESS,
        });
    }
  }

  function getDaysCount() {
    const count = getDaysBetweenTwoDates(dueDate);
    setDayCount(count);
  }

  return (
    <Pressable
      onPress={() => {
        setOpen(false);
        onPress();
      }}
      style={{
        borderRadius: 10,
        // borderWidth: 0.54,
        paddingBottom: 10,
        borderColor: colors.inputBorderGrey,
        backgroundColor: colors.backgroundWhite,
        paddingHorizontal: 15,
        marginHorizontal: 15,
        marginVertical: 5,
        // position: 'relative',
        shadowColor: 'rgba(0, 0, 0, 0.8)',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 1,
        elevation: 5,
      }}>
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: 17,
          }}>
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: colors.titleBlackColor,
              fontSize: 16,
              fontWeight: '700',
              width: 120,
            }}>
            {name}
          </Text>
          <View
            style={{
              position: 'absolute',
              alignItems: 'flex-start',
              marginRight: 14,
              right: 5,
              top: 0,
              flexDirection: 'row',
            }}>
            {/* <Text
              allowFontScaling={false}
              style={{
                color: colors.textColorGray,
                fontSize: 14,
                fontWeight: '400',
                marginRight: 10,
              }}>
              Due Date & Time
            </Text> */}
            <View style={{alignItems: 'center'}}>
              <Text
                allowFontScaling={false}
                style={{
                  color: colors.textColorGray,
                  fontSize: 16,
                  fontWeight: '400',
                }}>
                {QTMformattedDateV2(dueDate)}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  marginTop: 4,
                  color: colors.textColorGray,
                  fontSize: 12,
                  fontWeight: '400',
                }}>
                {QTMFormattedTime(dueDate)}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{marginTop: 8, flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={{
              color:
                status == 'COMPLETED'
                  ? '#8A8A8E'
                  : dayCount < 0
                  ? colors.cancelledRed
                  : dayCount < 7
                  ? colors.inProgressYellow
                  : '#8A8A8E',
              fontSize: 14,
              fontWeight: '400',
              // marginBottom: 9,
            }}>
            {status == 'COMPLETED'
              ? 'Done'
              : dayCount < 0
              ? 'Overdue by'
              : 'Due in'}
          </Text>
          {rating !== undefined && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 8,
              }}>
              <QTMReviewStar checked={rating > 0} size={28} />
              <QTMReviewStar checked={rating > 1} size={28} />
              <QTMReviewStar checked={rating > 2} size={28} />
              <QTMReviewStar checked={rating > 3} size={28} />
              <QTMReviewStar checked={rating > 4} size={28} />
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            // paddingVertical: 16,
          }}>
          <View
            style={{
              backgroundColor:
                status == 'IN_PROGRESS'
                  ? dayCount > 0
                    ? dayCount < 7
                      ? colors.inProgressYellow
                      : colors.completedGreen
                    : colors.cancelledRed
                  : 'white',
              height: 24,
              width: 88,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 20,
            }}>
            {status == 'IN_PROGRESS' && (
              <Text
                style={{
                  color: colors.backgroundWhite,
                  fontSize: 14,
                  fontWeight: '700',
                }}>
                {dayCount > 0
                  ? `${dayCount} Days`
                  : dayCount == 0
                  ? '0 Days'
                  : `${dayCount?.toString()?.split('-')[1]} Days`}
              </Text>
            )}
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                // setOpen(!open);
                onPressStatus();
              }}
              style={{
                backgroundColor: statusObj._color,
                flexDirection: 'row',
                height: 36,
                width: 150,
                paddingHorizontal: 10,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 8,
              }}>
              <Text
                style={{
                  color: colors.backgroundWhite,
                  fontWeight: '700',
                  fontSize: 14,
                }}>
                {statusObj._status}
              </Text>
              {statusObj._status === 'IN PROGRESS' && (
                <Image
                  style={{height: 14, width: 16, marginLeft: 8, aspectRatio: 16 / 14}}
                  source={require('../../assets/soft_traingle_2.png')}
                  resizeMode="contain"
                />
                
              )}
            </TouchableOpacity>
          </View>
        </View>
        {showMenu && (
          <View style={{position: 'absolute', right: -16, top: 16}}>
            <Pressable onPress={onPressMenu}>
              <MaterialCommunityIcons
                name="dots-vertical"
                size={32}
                color={colors.backgroundColorHeader}
              />
            </Pressable>
          </View>
        )}
        {showCross && (
          <View style={{position: 'absolute', right: -12, top: 4}}>
            <Pressable onPress={onPressCross}>
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={colors.backgroundColorHeader}
              />
            </Pressable>
          </View>
        )}
      </View>

      {open && (
        <View
          style={{
            position: 'absolute',
            top: 14,
            right: 15,
            borderWidth: 0.5,
            borderRadius: 8,
            height: 'auto',
            padding: 5,
            width: 150,
            zIndex: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.backgroundWhite,
          }}>
          <TouchableOpacity
            onPress={() => {
    if (clickedStatusProgress) {
      clickedStatusProgress();
    }
    setOpen(!open);
  }}
            style={{
              alignItems: 'flex-start',
              padding: 5,
              backgroundColor: statusColor.INPROGRESS,
              borderRadius: 4,
              marginBottom: 2,
              width: 140,
            }}>
            <Text
              style={{
                color: colors.backgroundWhite,
                fontWeight: '700',
                fontSize: 14,
              }}>
              {' IN PROGRESS'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if(clickedStatusClosed) {
                clickedStatusClosed()
              }
              setOpen(!open);
            }}
            style={{
              alignItems: 'flex-start',
              padding: 5,
              backgroundColor: statusColor.CLOSED,
              borderRadius: 4,
              marginBottom: 2,
              width: 140,
            }}>
            <Text
              style={{
                color: colors.backgroundWhite,
                fontWeight: '700',
                fontSize: 14,
              }}>
              {' COMPLETED'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if(clickedStatusCancel) {
                clickedStatusCancel()
              }
              setOpen(!open);
            }}
            style={{
              alignItems: 'flex-start',
              padding: 5,
              backgroundColor: statusColor.CANCEL,
              borderRadius: 4,
              marginBottom: 0,
              width: 140,
            }}>
            <Text
              style={{
                color: colors.backgroundWhite,
                fontWeight: '700',
                fontSize: 14,
              }}>
              {' CANCEL'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Pressable>
  );
}
