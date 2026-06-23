import {Spinner} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {IQTMMembers} from '../../models/IQTM';
import {colors} from '../../Utils/Colors';
import {QTMAvatar} from './QTMMemberCard';

interface Props {
  readonly chatMembers: IQTMMembers[];
  readonly message: string;
  readonly onChangeText: (text: string) => void;
  readonly onPressSend: () => void;
  readonly onPressAttachment: () => void;
  readonly onPressCamera: () => void;
  readonly onPressEmoji: () => void;
  readonly onLayout: (event: LayoutChangeEvent) => void;
  readonly loading: boolean;
  readonly onTagKeyPress: (e: string) => void;
  readonly showTaggableModal: boolean;
  readonly onPressMember: (tagged: IQTMMembers) => void;
}

export function QTMGroupChatInput({
  chatMembers,
  message,
  loading,
  showTaggableModal,
  onChangeText,
  onPressSend,
  onPressAttachment,
  onPressCamera,
  onPressEmoji,
  onLayout,
  onTagKeyPress,
  onPressMember,
}: Props) {
  const [bottomVal, setBottomVal] = useState(new Animated.Value(0));
  const screenWidth = Dimensions.get('screen').width;

  const openTagModal = () => {
    const newHeight = Math.min(chatMembers.length * 35, 170); // Assuming each item height is around 40px
    Animated.timing(bottomVal, {
      toValue: showTaggableModal ? newHeight : 0,
      delay: 50,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    openTagModal();
  }, [showTaggableModal, chatMembers]);

  return (
    <View
      onLayout={onLayout}
      style={{
        // position: 'absolute',
        backgroundColor: colors.backgroundWhite,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        // bottom: Platform.OS === 'ios' ? 20 : 0,
        // flex: 1,
        borderColor: '#ecf0fc',
        borderTopWidth: 1,
        zIndex: 1000,
      }}>
      <Animated.View
        style={{
          // paddingHorizontal: 15,
          borderRadius: 4,
          // borderWidth: 1,
          width: screenWidth,
          maxHeight: 170,
          height: bottomVal,
          overflow: 'hidden',
          borderColor: '#ecf0fc',
        }}>
        <ScrollView keyboardShouldPersistTaps={'always'}>
          {chatMembers?.map(item => (
            <TouchableOpacity
              onPress={() => onPressMember(item)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderColor: '#ecf0fc',
                paddingHorizontal: 15,
                paddingVertical: 4,
                marginBottom: 2,
                width: '100%',
              }}>
              <QTMAvatar
                firstName={item?.firstName ?? ''}
                lastName={item?.lastName ?? ''}
                height={24}
                width={24}
                fontSize={12}
              />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  color: colors.titleBlackColor,
                }}>
                {item?.firstName} {item?.lastName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 11,
          paddingTop: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ECEBEB',
            paddingHorizontal: 8,
            borderRadius: 20,
            minHeight: 50,
            flex: 1,
          }}>
          <TouchableOpacity onPress={onPressEmoji}>
            <MaterialIcons name="emoji-emotions" size={20} color={'#8E8E93'} />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-start',
            }}>
            <TextInput
              value={message}
              placeholder="Message"
              placeholderTextColor={'#8E8E93'}
              multiline
              onKeyPress={e => onTagKeyPress(e.nativeEvent.key)}
              onChangeText={onChangeText}
              style={{
                paddingHorizontal: 5,
                maxHeight: 120,
                color: colors.backgroundColorHeader,
                fontSize: 14,
                fontWeight: '400',
              }}
            />
          </View>
          <TouchableOpacity onPress={onPressAttachment}>
            <MaterialCommunityIcons
              name="attachment"
              size={20}
              color={'#8E8E93'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressCamera} style={{marginLeft: 10}}>
            <MaterialIcons name="camera-alt" size={20} color={'#8E8E93'} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => !loading && onPressSend()}
          style={{
            height: 45,
            width: 45,
            borderRadius: 40,
            backgroundColor: colors.backgroundColorHeader,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 4,
          }}>
          {/* <MaterialIcons name="mic" size={20} color={colors.backgroundWhite} /> */}
          {loading ? (
            <Spinner />
          ) : (
            <MaterialIcons
              name="send"
              size={20}
              color={colors.backgroundWhite}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
