import {FlashList} from '@shopify/flash-list';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  // SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, keepLocalCopy } from '@react-native-documents/picker';
import EmojiSelector, {Categories} from 'react-native-emoji-selector';
import RNFS from 'react-native-fs';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {QTMChatBubble} from '../../../Components/QTMComponents/QTMChatBubble';
import {QTMGroupChatInput} from '../../../Components/QTMComponents/QTMGroupChatComponents';
import {IAppState} from '../../../Store/State';
import {
  addChatMessageToQueueAction,
  clearChatMessageQueueAction,
  getChatMessageAction,
  getMembersByTaskIdAction,
  getTaskDetailsByTaskIdAction,
  sendChatMessageAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {getMediaType, requestCameraPermission} from '../../../Utils/Helper';
import {UploadAttachments} from '../../../Utils/QTM.ApiActions';
import {IQTMChatMessageRequestBody, IQTMMembers} from '../../../models/IQTM';
import {AttachementSheet} from '../../ChatScreen';
interface Props {
  navigation: any;
  route: {
    params: {
      taskId?: number;
    };
  };
}

interface HeaderProps {
  header: string;
  onPressBack: () => void;
  onPressMenu?: () => void;
}

function ChatHeader({
  onPressBack,
  header,
  onPressMenu,
}: HeaderProps): JSX.Element {
  return (
    <View
      style={{
        backgroundColor: colors.backgroundColorHeader,
        height: 60,
        paddingLeft: 16,
        paddingRight: 8,
        alignItems: 'center',
        flexDirection: 'row',
      }}>
      <View
        style={{
          flex: 0,
          justifyContent: 'center',
          alignItems: 'center',
          height: 32,
          width: 32,
          borderRadius: 40,
          borderColor: colors.backgroundWhite,
          borderWidth: 1,
        }}>
        <TouchableOpacity onPress={onPressBack}>
          <Icon
            name="arrow-back"
            style={{color: colors.backgroundWhite, fontSize: 24}}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 12,
        }}>
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={{
            color: colors.backgroundWhite,
            fontSize: 28,
            fontWeight: '500',
            marginLeft: 5,
          }}>
          {header}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity style={{marginRight: 10}}>
          <Icon name="search" style={{fontSize: 24, color: 'white'}} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressMenu}>
          <MaterialCommunityIcons
            name="dots-vertical"
            style={{fontSize: 24, color: 'white'}}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function QTMGroupChatScreen({navigation, route}: Props) {
  const [chatInputHeight, setChatInputHeight] = useState(45);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showTaggableModal, setShowTaggableModal] = useState<boolean>(false);
  const [openEmojiPicker, setOpenEmojiPicker] = useState<boolean>(false);

  const dispatch: any = useDispatch();

  useEffect(() => {
    if (route.params?.taskId) {
      getAllDetailsByTaskId(route.params.taskId);
    }
  }, [route]);

  async function getAllDetailsByTaskId(taskId: number) {
    await dispatch(getChatMessageAction(taskId));
    await dispatch(getTaskDetailsByTaskIdAction(taskId));
    await dispatch(getMembersByTaskIdAction(taskId));
  }

  const [chatMessage, setChatMessage] = useState<IQTMChatMessageRequestBody>({
    message: '',
    payload: {},
    type: 'TEXT',
  });

  const selectedTask = useSelector(
    (state: IAppState) => state.qtmState.selectedTask,
  );
  const chatListRef = useRef(null);

  const chatLoading = useSelector(
    (state: IAppState) => state.qtmState.chatLoading,
  );

  const chats = useSelector((state: IAppState) => state.qtmState.chats);

  const userDetails = useSelector(
    (state: IAppState) => state.qtmState.userDetails,
  );

  const members = useSelector(
    (state: IAppState) => state.qtmState.selectedTaskMembers,
  );

  const chatMessageQueue = useSelector(
    (state: IAppState) => state.qtmState.chatMessageQueue,
  );

  const [filteredMembers, setFilteredMembers] = useState<IQTMMembers[]>([]);

  useEffect(() => {
    selectedTask?.id && dispatch(getChatMessageAction(selectedTask.id));
  }, [selectedTask]);

  function handleEmojiSelect(emoji: string) {
    setChatMessage({
      ...chatMessage,
      message: chatMessage.message + emoji,
    });
  }

  function handleTagFilter(searchText: string) {
    if (searchText?.trim?.() !== '') {
      const _members = members?.filter(
        member =>
          member.firstName
            ?.toLowerCase?.()
            ?.includes(searchText?.toLowerCase()) ||
          member.lastName?.toLowerCase?.()?.includes(searchText?.toLowerCase()),
      );
      setFilteredMembers(_members);
    }
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
        const _url: string =
          'https://tubuludata.s3.amazonaws.com/' + response?.url;
        const _chatMessage = {
          message: 'MEDIA',
          payload: {
            documentUrl: _url,
            documentName: response.fileName,
            mimeType: response.mimeType,
          },
          type: getMediaType(response.mimeType),
        };
        if (selectedTask?.id) {
          await dispatch(sendChatMessageAction(_chatMessage, selectedTask.id));
          setChatMessage({
            message: '',
            type: 'TEXT',
            payload: {},
          });
          setLoading(false);
        }
      } else {
        console.log('Unable to add attachments at the moment');
      }
    }
  }

  async function handleMessageSend() {
    if (chatMessage.message.trim?.() !== '') {
      setOpenEmojiPicker(false);
      const messageArr: IQTMChatMessageRequestBody[] = chatMessageQueue?.length
        ? [...chatMessageQueue]
        : [];
      messageArr.push({
        ...chatMessage,
        ownerId: userDetails?.id,
        owner: userDetails,
      });
      dispatch(addChatMessageToQueueAction(messageArr));
      setChatMessage({
        message: '',
        type: 'TEXT',
        payload: {},
      });
      // setLoading(true);
      messageArr?.forEach(async message => {
        if (selectedTask?.id) {
          await dispatch(sendChatMessageAction(message, selectedTask.id));
          await dispatch(clearChatMessageQueueAction(message));
        }
      });
      // setLoading(false);
    }
  }

  function renderChatMessages() {
    return (
      <View style={{flex: 1}}>
        <View style={{paddingTop: 10}} />
        <FlashList
          // keyboardShouldPersistTaps={'always'}
          inverted={true}
          ref={chatListRef}
          data={[...(chats ?? [])].reverse()}
          estimatedItemSize={200}
          renderItem={({item, index}) => {
            return (
              <View style={{paddingTop: 4}}>
                <QTMChatBubble props={item} />
              </View>
            );
          }}
        />
        {/* <Spinner style={{}} /> */}
      </View>
    );
  }

  function renderEmojiPicker() {
    return (
      <View>
        {openEmojiPicker && (
          <View
            style={{
              height: Dimensions.get('screen').height * 0.35,
              width: Dimensions.get('screen').width,
              position: 'absolute',
              bottom: 0,
              alignSelf: 'center',
              borderRadius: 5,
              borderColor: colors.inputBorderGrey,
              borderWidth: 0.5,
              padding: 2,
              backgroundColor: colors.backgroundWhite,
            }}>
            <EmojiSelector
              onEmojiSelected={handleEmojiSelect}
              category={Categories.all}
              showTabs={true}
              showSearchBar={false}
              showHistory={true}
              columns={10}
              placeholder="Search emoji..."
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.qtmBackgroundColor}}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      <ChatHeader
        header={selectedTask?.name ?? ''}
        onPressBack={() => {
          navigation.navigate('QTMTaskDetailsScreen', {navigation});
        }}
      />
      <KeyboardAvoidingView
        enabled={Platform.OS == 'ios'}
        behavior="padding"
        contentContainerStyle={{flex: 1}}
        style={{flex: 1}}>
        <View
          style={{
            flexGrow: 1,
            // paddingBottom: showTaggableModal ? 0 : 40,
            // backgroundColor: '#ecf0fc',
            backgroundColor: colors.backgroundWhite,
          }}>
          {renderChatMessages()}
        </View>
        <AttachementSheet
          toggleHeightFlow={chatInputHeight}
          isOpen={!isOpen}
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
                presentationStyle: 'fullScreen'
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
                
                // Handle the file
                handleAttachments(asset);
              }
            } catch (error: any) {
              if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
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
        <QTMGroupChatInput
          loading={loading}
          chatMembers={filteredMembers}
          showTaggableModal={showTaggableModal}
          onLayout={event => {
            const {height} = event.nativeEvent.layout;
            setChatInputHeight(height - 10);
          }}
          onTagKeyPress={key => {
            if (key === '@') {
              setFilteredMembers(members);
              setShowTaggableModal(true);
            }
          }}
          onPressMember={tagged => {
            setShowTaggableModal(false);
            const chunks = chatMessage.message?.split(' ');
            const numOfTags = chunks.length;
            let prevMsg = chunks.slice(0, numOfTags - 1)?.join(' ');
            setChatMessage({
              ...chatMessage,
              message: prevMsg + ` @${tagged.firstName}${tagged.lastName}`,
            });
          }}
          message={chatMessage?.message}
          onChangeText={text => {
            setChatMessage({...chatMessage, message: text});
            const tags = text.split('@');
            const numOfTags = tags.length;
            if (showTaggableModal) {
              handleTagFilter(text.split('@')[numOfTags - 1]);
            }
          }}
          onPressSend={handleMessageSend}
          onPressAttachment={() => {
            setIsOpen(!isOpen);
          }}
          onPressEmoji={() => {
            setOpenEmojiPicker(!openEmojiPicker);
          }}
          onPressCamera={() => {
            requestCameraPermission();
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
        />
        {renderEmojiPicker()}
      </KeyboardAvoidingView>
    </View>
  );
}
