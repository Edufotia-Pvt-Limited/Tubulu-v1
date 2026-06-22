import moment from 'moment';
import React, {useRef} from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import Video, {VideoRef} from 'react-native-video';
import {useSelector} from 'react-redux';
import navigationService from '../../Services/navigation.service';
import {IAppState} from '../../Store/State';
import {colors} from '../../Utils/Colors';
import {IQTMGroupChat} from '../../models/IQTM';
import {ISAudioPlayerV2} from '../ISAudioPlayerV2';
import ISDocumentDownloader from '../ISDocumentDownloader';
import {QTMAvatar} from './QTMMemberCard';

interface Props {
  props: IQTMGroupChat;
}

export function QTMChatBubble({props}: Props) {
  const owner = useSelector((state: IAppState) => state.qtmState.userDetails);

  const player = useRef<VideoRef>(null);
  let bubbleRef = useRef(null);
  let _timeZone = moment.tz.guess();

  const _renderTime = () => {
    return (
      <Text
        style={{
          marginTop: 4,
          fontSize: 10,
          fontFamily: 'NotoSans',
          textAlign: owner.id === props.ownerId ? 'right' : 'left',
          color:
            owner.id === props.ownerId ? colors.textColorGray : colors.textGrey,
          marginRight: owner.id === props.ownerId ? 16 : 0,
        }}>
        {moment(props.createdAt).tz(_timeZone).format('DD/MM, hh:mm A   ')}
        {/* {props.chatMessage?.isSentToServer === false && (
          <FAIcon style={{}} name={'clock-o'} />
        )} */}
      </Text>
    );
  };

  const _renderName = () => {
    return (
      <Text
        style={{
          marginTop: 4,
          fontSize: 12,
          fontFamily: 'NotoSans',
          textAlign: owner.id === props.ownerId ? 'right' : 'left',
          color:
            owner.id === props.ownerId ? colors.textColorGray : colors.textGrey,
          marginRight: owner.id === props.ownerId ? 16 : 0,
          marginLeft: owner.id === props.ownerId ? 0 : 12,
        }}>
        {owner.id === props.ownerId
          ? 'You,'
          : `${props?.owner?.firstName} ${props?.owner?.lastName},`}
      </Text>
    );
  };

  const formatMessage = (message: string) => {
    const tagged = message.split('@');
    let formattedMessage = [];
    formattedMessage.push(tagged[0]);

    if (tagged.length > 1) {
      for (let index = 1; index < tagged.length; index++) {
        let member = tagged[index].split(' ')[0];
        let restOfMessage = tagged[index].slice(member.length);

        formattedMessage.push(
          <Text key={index} style={{fontWeight: 'bold'}}>
            @{member}
          </Text>,
        );
        formattedMessage.push(restOfMessage);
      }
    }
    return formattedMessage;
  };

  const _renderTextMessage = () => {
    const {message} = props;
    if (owner.id === props.ownerId) {
      return (
        <>
          <View
            style={{
              alignSelf: 'flex-end',
              backgroundColor: colors.userChatBubble,
              padding: 16,
              marginVertical: 4,
              marginHorizontal: 12,
              minWidth: 220,
              maxWidth: 300,
              borderBottomLeftRadius: 10,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}>
            <Text
              style={{
                fontFamily: 'NotoSans',
                fontSize: 14,
                fontWeight: '400',
                color: colors.backgroundWhite,
              }}>
              {formatMessage(message)}
            </Text>
          </View>
        </>
      );
    } else {
      return (
        <>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.merchantChatBubble,
              padding: 16,
              marginVertical: 4,
              marginHorizontal: 12,
              minWidth: 220,
              maxWidth: 300,
              borderWidth: 0.54,
              borderColor: colors.inputBorderGrey,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              borderTopRightRadius: 10,
            }}>
            <Text
              style={{
                fontFamily: 'NotoSans',
                fontSize: 14,
                fontWeight: '400',
                color: colors.primaryTextColor,
              }}>
              {formatMessage(message)}
            </Text>
          </View>
        </>
      );
    }
  };

  const _renderMediaMessage = () => {
    let _payload = props?.payload;
    // const filePath = props.chatMessage?.fileLocalPath;
    // if (_payload?.mimeType?.indexOf('image') >= 0) {
    return (
      <>
        <TouchableOpacity
          style={
            owner.id == props.ownerId
              ? {
                  alignSelf: 'flex-end',
                  backgroundColor: colors.userChatBubble,
                  padding: 4,
                  marginVertical: 4,
                  marginHorizontal: 12,
                  maxWidth: 300,
                  borderBottomLeftRadius: 10,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }
              : {
                  alignSelf: 'flex-start',
                  backgroundColor: colors.merchantChatBubble,
                  padding: 4,
                  marginVertical: 4,
                  marginHorizontal: 12,
                  maxWidth: 300,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  borderTopRightRadius: 10,
                }
          }
          // ref={ref => {bubbleRef.current = ref}}
          // onLongPress={(event) => {
          //     bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
          //     props?.onLongPress?.(pageX, pageY, height, width, event, event)})
          // }}
          onPress={() => {
            // if(!filePath) {
            //     //Download the file and return
            //     return;
            // }
            navigationService.push('ISImageViewer', {
              imageUrl: _payload?.documentUrl,
            });
          }}>
          <Image
            resizeMode="cover"
            style={{
              width: 200,
              height: 180,
              borderBottomLeftRadius: 10,
              borderTopLeftRadius: owner.id == props.ownerId ? 24 : 0,
              borderTopRightRadius: 10,
              borderBottomRightRadius: owner.id == props.ownerId ? 0 : 24,
            }}
            source={{uri: _payload?.documentUrl}}
          />
          {false && (
            <View
              style={{
                height: '105%',
                width: '100%',
                position: 'absolute',
                borderBottomLeftRadius: 10,
                borderTopRightRadius: 10,
                borderBottomRightRadius: owner.id == props.ownerId ? 0 : 24,
                borderTopLeftRadius: owner.id == props.ownerId ? 24 : 0,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  position: 'absolute',
                  backgroundColor: 'black',
                  opacity: 0.5,
                  borderBottomLeftRadius: 10,
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: owner.id == props.ownerId ? 0 : 24,
                  borderTopLeftRadius: owner.id == props.ownerId ? 24 : 0,
                  height: '105%',
                  width: '100%',
                }}
              />
              <FAIcon
                name={'download'}
                style={{
                  color: 'white',
                  fontSize: 48,
                }}
              />
            </View>
          )}
        </TouchableOpacity>
        {props.message !== 'MEDIA' && _renderTextMessage()}
      </>
    );
    // }
  };

  const _renderVideoMessage = () => {
    let _payload = props?.payload;
    return (
      <>
        <TouchableOpacity
          style={
            owner.id == props.ownerId
              ? {
                  alignSelf: 'flex-end',
                  backgroundColor: colors.userChatBubble,
                  padding: 6,
                  marginVertical: 4,
                  marginHorizontal: 12,
                  minWidth: 220,
                  maxWidth: 300,
                  borderBottomLeftRadius: 10,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }
              : {
                  alignSelf: 'flex-start',
                  backgroundColor: colors.merchantChatBubble,
                  padding: 6,
                  marginVertical: 4,
                  marginHorizontal: 12,
                  minWidth: 220,
                  maxWidth: 300,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  borderTopRightRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }
          }
          // ref={ref => {bubbleRef.current = ref}}
          //     onLongPress={(event) => {
          //         bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
          //         props?.onLongPress?.(pageX, pageY, height, width, event, event)})
          //     }}
          onPress={() => {
            navigationService.push('ISVideoViewer', {
              videoUrl: _payload?.documentUrl,
            });
          }}>
          <Video
            source={{uri: _payload?.documentUrl}}
            playInBackground={false}
            playWhenInactive={false}
            ref={player}
            paused={true}
            resizeMode={'cover'}
            onLoad={() => {
              player?.current.seek(0); // this will set first frame of video as thumbnail
            }}
            style={{
              width: 220,
              height: 160,
              borderTopRightRadius: 20,
              borderTopLeftRadius: owner.id == props.ownerId ? 20 : 0,
              borderBottomRightRadius: owner.id == props.ownerId ? 0 : 20,
              borderBottomLeftRadius: 20,
            }}
          />
          <View
            style={{
              height: 60,
              width: 60,
              position: 'absolute',
              borderRadius: 120,
              alignSelf: 'center',
              backgroundColor: '#000000cc',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <IonIcon
              name={'play'}
              style={{
                color: 'white',
                marginLeft: 4,
                fontSize: 36,
              }}
            />
          </View>
          {/*<VideoPlayer*/}
          {/*  video={{ uri: _payload?.documentUrl }}*/}
          {/*  videoWidth={200}*/}
          {/*  videoHeight={180}*/}
          {/*  style = {{*/}
          {/*      borderRadius: 16,*/}
          {/*  }}*/}
          {/*></VideoPlayer>*/}
          {/* {_renderTime()} */}
          <TouchableOpacity
            onPress={() => {
              // props.navigation?.push("ISVideoViewer", {
              //   videoUrl: _payload?.documentUrl
              // })
              Linking.openURL(_payload?.documentUrl);
            }}
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
            }}></TouchableOpacity>
        </TouchableOpacity>
        {props?.message !== 'MEDIA' && _renderTextMessage()}
      </>
    );
  };

  const _renderAudioMessage = () => {
    let _payload = props?.payload;
    return (
      <>
        <View
          style={
            owner.id == props.ownerId
              ? {
                  alignSelf: 'flex-end',
                  backgroundColor: colors.userChatBubble,
                  padding: 16,
                  marginVertical: 4,
                  marginHorizontal: 12,
                  minWidth: 220,
                  maxWidth: 300,
                  borderBottomLeftRadius: 10,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }
              : {
                  alignSelf: 'flex-start',
                  backgroundColor: colors.merchantChatBubble,
                  padding: 16,
                  marginVertical: 4,
                  marginHorizontal: 12,
                  minWidth: 220,
                  maxWidth: 300,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  borderTopRightRadius: 10,
                }
          }>
          <ISAudioPlayerV2
            // ref={ref => {
            //   bubbleRef.current = ref;
            // }}
            // onLongPress={event => {
            //   bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
            //     props?.onLongPress?.(pageX, pageY, height, width, event);
            //   });
            // }}
            isFromUser={owner.id == props.ownerId}
            documentName={_payload?.documentName}
            documentUrl={_payload?.documentUrl}
          />
        </View>
        {props.message !== 'MEDIA' && _renderTextMessage()}
      </>
    );
  };

  const _renderDocumentMessage = () => {
    let _payload = props?.payload;
    return (
      <View
        style={{
          alignSelf: owner.id == props.ownerId ? 'flex-end' : 'flex-start',
        }}>
        <View
          style={
            owner.id == props.ownerId
              ? {
                  alignSelf: 'flex-end',
                  backgroundColor: colors.userChatBubble,
                  padding: 4,
                  marginVertical: 4,
                  marginHorizontal: 12,
                  minWidth: 240,
                  maxWidth: 320,
                  borderBottomLeftRadius: 10,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }
              : {
                  alignSelf: 'flex-start',
                  backgroundColor: colors.merchantChatBubble,
                  marginVertical: 4,
                  marginHorizontal: 12,
                  minWidth: 240,
                  maxWidth: 320,
                  padding: 4,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  borderTopRightRadius: 10,
                }
          }>
          <ISDocumentDownloader
            // ref={ref => {
            //   bubbleRef.current = ref;
            // }}
            // onLongPress={event => {
            //   bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
            //     props?.onLongPress?.(pageX, pageY, height, width, event);
            //   });
            // }}
            isMessageByUser={owner.id == props.ownerId}
            color={
              owner.id == props.ownerId ? 'white' : colors.primaryTextColor
            }
            documentUrl={_payload?.documentUrl}
            documentName={_payload?.documentName}
          />
        </View>
      </View>
    );
  };

  const _renderActivityMessage = () => {
    return (
      <View
        style={{
          // backgroundColor: colors.backgroundWhite,
          // marginRight: Dimensions.get('screen').width / 6,
          alignItems: 'center',
          width: Dimensions.get('screen').width,
        }}>
        <View
          style={{
            borderRadius: 8,
            // backgroundColor: colors.backgroundWhite,
            backgroundColor: '#ecf0fc',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: '#ecf0fc',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <QTMAvatar
            firstName={props?.owner?.firstName}
            lastName={props?.owner?.lastName}
            fontSize={10}
            height={24}
            width={24}
          />
          <View
            style={{
              marginLeft: 4,
              maxWidth: Dimensions.get('screen').width / 1.4,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                color: '#404043',
                fontSize: 12,
                flexWrap: 'wrap',
                fontWeight: '400',
              }}>
              {props.message}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const _renderMessage = () => {
    switch (props.type) {
      case 'TEXT':
        return _renderTextMessage();
      case 'IMAGE':
        return _renderMediaMessage();
      case 'VIDEO':
        return _renderVideoMessage();
      case 'AUDIO':
        return _renderAudioMessage();
      case 'DOCUMENT':
        return _renderDocumentMessage();
      case 'ACTIVITY':
        return _renderActivityMessage();
      // case 'CAROUSEL':
      //     return _renderCarouselMessage();
      // case 'CHART':
      //     return _renderChartItem();
      // case 'LIST':
      //     return _renderListItem();
      // case 'FORM':
      //     return renderFormMessage();
      // return <ChartItem></ChartItem>
    }
  };

  if (owner.id === props.ownerId) {
    return (
      <TouchableOpacity
        // ref={ref => {
        //   bubbleRef?.current = ref;
        // }}
        style={{
          flexDirection: 'row',
          paddingLeft: 4,
          width: '100%',
          justifyContent: 'flex-end',
        }}
        activeOpacity={0.7}
        // onLongPress={event => {
        //   bubbleRef?.current.measure((x, y, width, height, pageX, pageY) => {
        //     props?.onLongPress?.(pageX, pageY, height, width, event, event);
        //   });
        // }}
      >
        <View
          style={{
            alignSelf: 'flex-end',
          }}>
          <View style={{display: 'flex', flex: 1}}>
            {props.type !== 'ACTIVITY' && _renderName()}
            {_renderMessage()}
            <View style={{marginLeft: 38, marginTop: 4, marginBottom: 16}}>
              {props.type !== 'ACTIVITY' && _renderTime()}
            </View>
          </View>
          {/* {props.hasNote && (
            <View
              style={[
                {
                  height: 24,
                  width: 24,
                  backgroundColor: '#FFC93E',
                  borderRadius: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  bottom: 24,
                },
                owner.id == props.ownerId
                  ? {
                      left: 30,
                    }
                  : {
                      right: 20,
                    },
              ]}>
              <FAIcon
                name={'sticky-note'}
                style={{fontSize: 12, color: 'white'}}
              />
            </View>
          )}
          {props.hasBookmark && (
            <View
              style={[
                {
                  height: 24,
                  width: 24,
                  backgroundColor: '#FF3E3E',
                  borderRadius: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  bottom: 24,
                },
                owner.id == props.ownerId
                  ? {
                      left: 70,
                    }
                  : {
                      right: 20,
                    },
              ]}>
              <FAIcon
                name={'bookmark'}
                style={{fontSize: 12, color: 'white'}}
              />
            </View>
          )} */}
        </View>
      </TouchableOpacity>
    );
  } else {
    return (
      <>
        <View
          onTouchStart={e => {
            console.log('touchMove', e.nativeEvent);
          }}>
          <TouchableOpacity
            // ref={ref => {
            //   bubbleRef?.current = ref;
            // }}
            style={{flexDirection: 'row', paddingLeft: 4}}
            activeOpacity={0.7}
            // onLongPress={event => {
            //   bubbleRef?.current.measure(
            //     (x, y, width, height, pageX, pageY) => {
            //       props?.onLongPress?.(pageX, pageY, height, width, event);
            //     },
            //   );
            // }}
          >
            {props.type !== 'ACTIVITY' && (
              <QTMAvatar
                firstName={props?.owner?.firstName}
                lastName={props?.owner?.lastName}
                fontSize={12}
                height={25}
                width={25}
              />
            )}
            <View style={{marginLeft: -6}}>
              {props.type !== 'ACTIVITY' && _renderName()}
              {_renderMessage()}
              {/* {props.hasNote && (
                <View
                  style={{
                    height: 24,
                    width: 24,
                    backgroundColor: '#FFC93E',
                    borderRadius: 60,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: 20,
                    bottom: -10,
                  }}>
                  <FAIcon
                    name={'sticky-note'}
                    style={{fontSize: 12, color: 'white'}}
                  />
                </View>
              )} */}
              {/* {props.hasBookmark && (
                <View
                  style={{
                    height: 24,
                    width: 24,
                    backgroundColor: '#FF3E3E',
                    borderRadius: 60,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: 50,
                    bottom: -10,
                  }}>
                  <FAIcon
                    name={'bookmark'}
                    style={{fontSize: 12, color: 'white'}}
                  />
                </View>
              )} */}
            </View>
          </TouchableOpacity>
        </View>
        {/* {_renderQuickActions()} */}
        <View style={{marginLeft: 38, marginTop: 4, marginBottom: 16}}>
          {props.type !== 'ACTIVITY' && _renderTime()}
        </View>
      </>
    );
  }
}
