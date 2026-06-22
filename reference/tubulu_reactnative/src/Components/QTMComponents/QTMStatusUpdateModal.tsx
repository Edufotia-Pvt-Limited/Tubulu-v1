import {TextArea} from 'native-base';
import React from 'react';
import {
  Image,
  Keyboard,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {colors} from '../../Utils/Colors';

interface Props {
  readonly visible: boolean;
  readonly taskName: string;
  readonly rating: number;
  readonly handleRating: (count: number) => void;
  readonly changeDescription: (text: string) => void;
  readonly onPressSubmit: () => void;
  readonly setModalClose: () => void;
}

interface ReviewProps {
  readonly handleCheck?: () => void;
  readonly checked: boolean;
  readonly size?: number;
}

export function QTMReviewStar({
  handleCheck,
  checked,
  size = 48,
}: ReviewProps): JSX.Element {
  return (
    <TouchableOpacity onPress={handleCheck}>
      <Image
        style={{height: size, width: size}}
        source={
          !checked
            ? require('../../assets/rating_icon.png')
            : require('../../assets/rating_filled_icon.png')
        }
      />
    </TouchableOpacity>
  );
}

export function QTMStatusUpdateModal({
  visible,
  setModalClose,
  taskName,
  onPressSubmit,
  handleRating,
  rating,
  changeDescription,
}: Props): JSX.Element {
  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn={'bounceInUp'}
      onBackdropPress={setModalClose}
      backdropOpacity={0.7}
      onBackButtonPress={setModalClose}
      coverScreen={false}>
      <Pressable
        onPress={Keyboard.dismiss}
        style={{
          alignSelf: 'center',
          // height: 343,
          padding: 15,
          width: 343,
          backgroundColor: colors.backgroundWhite,
          borderRadius: 10,
        }}>
        <Text
          style={{
            color: colors.titleBlackColor,
            fontSize: 22,
            fontWeight: '700',
          }}>
          {`Great... Your ${taskName?.trim()} task is Completed`}
        </Text>
        <Text
          style={{
            color: colors.titleBlackColor,
            fontSize: 18,
            fontWeight: '500',
            marginTop: 17,
          }}>
          Please rate the task
        </Text>
        <View style={{flexDirection: 'row'}}>
          <QTMReviewStar
            checked={rating > 0}
            handleCheck={() => {
              handleRating(1);
            }}
          />
          <QTMReviewStar
            checked={rating > 1}
            handleCheck={() => {
              handleRating(2);
            }}
          />
          <QTMReviewStar
            checked={rating > 2}
            handleCheck={() => {
              handleRating(3);
            }}
          />
          <QTMReviewStar
            checked={rating > 3}
            handleCheck={() => {
              handleRating(4);
            }}
          />
          <QTMReviewStar
            checked={rating > 4}
            handleCheck={() => {
              handleRating(5);
            }}
          />
        </View>
        <View
          style={{
            marginTop: 10,
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
              height: 'auto',
              width: '100%',
              color: colors.backgroundColorHeader,
              fontSize: 16,
              fontWeight: '400',
            }}
            placeholder="Detail Review"
            placeholderTextColor={'#2355C4'}
            onChangeText={changeDescription}
          />
        </View>
        <TouchableOpacity
          onPress={onPressSubmit}
          style={{
            marginTop: 20,
            borderRadius: 8,
            backgroundColor: colors.backgroundColorHeader,
            height: 52,
            width: 262,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Text
            style={{
              color: colors.backgroundWhite,
              fontSize: 16,
              fontWeight: '700',
            }}>
            Submit
          </Text>
        </TouchableOpacity>
      </Pressable>
    </ReactNativeModal>
  );
}
