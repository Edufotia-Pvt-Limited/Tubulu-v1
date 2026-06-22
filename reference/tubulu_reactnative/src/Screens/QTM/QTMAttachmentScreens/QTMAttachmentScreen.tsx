import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  // SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Share, {ShareOptions} from 'react-native-share';
import AntIcon from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmationPopup} from '../../../Components/ConfirmationPopup';
import {IQTMAttachments} from '../../../models/IQTM';
import {IAppState} from '../../../Store/State';
import {colors} from '../../../Utils/Colors';
import {CheckDocumentMimeTypes, DocumentType} from '../../../Utils/QTMHelper';

interface Props {
  navigation: any;
  route: {params: {from: 'TASK' | 'TOPIC' | 'SUBTASK'}};
}

export function QTMAttachmentScreen({navigation, route}: Props): JSX.Element {
  const [selectedTab, setSelectedTab] = useState<0 | 1>(0);
  const [selected, setSelected] = useState<boolean>(false);
  const [selectAll, showSelectAll] = useState<boolean>(false);
  const [selectAllAttachments, setSelectAllAttachments] =
    useState<boolean>(false);

  const [attachmentData, setAttachmentData] = useState<IQTMAttachments[]>([]);
  const [media, setMedia] = useState<IQTMAttachments[]>([]);
  const [documents, setDocuments] = useState<IQTMAttachments[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<
    IQTMAttachments[]
  >([]);

  const [showDeleteConfirmation, setDeleteConfirmation] =
    useState<boolean>(false);

  const dispatch: any = useDispatch();

  const topicAttachments = useSelector(
    (state: IAppState) => state.qtmState.topicAttachments,
  );
  const taskAttachments = useSelector(
    (state: IAppState) => state.qtmState.taskAttachments,
  );
  const subTaskAttachments = useSelector(
    (state: IAppState) => state.qtmState.subTaskAttachments,
  );

  useEffect(() => {
    if (route?.params) {
      switch (route?.params?.from) {
        case 'TASK':
          setAttachmentData(taskAttachments);
          break;
        case 'TOPIC':
          console.log('FROM TOPIC');
          setAttachmentData(topicAttachments);
          break;
        case 'SUBTASK':
          console.log('FROM SUBTASK');
          setAttachmentData(subTaskAttachments);
          break;
      }
    }
  }, [route]);

  useEffect(() => {
    if (attachmentData?.length) {
      handleData(attachmentData);
    }
  }, [attachmentData]);

  function handleData(data: IQTMAttachments[]) {
    // MEDIA
    const _media = data?.filter(
      images =>
        images?.mimeType === 'image/jpeg' ||
        images?.mimeType === 'image/png' ||
        images?.mimeType === 'image/jpg',
    );

    setMedia(_media);
    // DOCUMENTS
    const _documents = data?.filter(documents =>
      CheckDocumentMimeTypes(documents.mimeType),
    );
    setDocuments(_documents);
  }

  function handleSelect(item: IQTMAttachments) {
    const _selected = [...selectedAttachments];
    const present = _selected?.filter(a => a.id === item.id);
    if (present?.length) {
      const updateSelected = _selected?.filter(a => a.id !== item?.id);
      setSelectedAttachments(updateSelected);
    } else {
      _selected.push(item);
      setSelectedAttachments(_selected);
    }
  }

  function shareAttachments() {
    const urls = selectedAttachments?.map(
      attachment => `https://tubuludata.s3.amazonaws.com/${attachment?.url}`,
    );
    console.log('HERE ARE URLS', urls);
    const options: ShareOptions = {
      title: `${selectedAttachments?.length} item selected`,
      // message: 'Share',
      urls,
    };
    Share.open(options)
      .then(res => {
        console.log('shared', res);
      })
      .catch(error => {
        console.log(error);
      });
  }

  function downloadAttachments() {}

  function deleteAttachments() {
    setDeleteConfirmation(true);
  }

  async function openDocumentUrl(documentUrl: string) {
    const url = `https://tubuludata.s3.amazonaws.com/${documentUrl}`;
    await Linking.openURL(url);
  }

  const renderHeader = () => (
    <View
      style={{
        height: 60,
        backgroundColor: colors.backgroundColorHeader,
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back"
            style={{color: colors.backgroundWhite, fontSize: 24}}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          backgroundColor: '#90aae1',
          width: 200,
          overflow: 'hidden',
          borderRadius: 8,
        }}>
        <Pressable
          onPress={() => {
            setSelectedTab(0);
            setSelected(false);
            showSelectAll(false);
            setSelectedAttachments([]);
          }}
          style={{
            backgroundColor: selectedTab !== 0 ? '#90aae1' : '#d2def2',
            padding: 5,
            borderTopRightRadius: selectedTab == 0 ? 8 : 0,
            borderBottomRightRadius: selectedTab == 0 ? 8 : 0,
            height: 36,
            width: 100,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: colors.titleBlackColor,
              fontSize: 16,
              fontWeight: '700',
            }}>
            Media
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setSelectedTab(1);
            setSelected(false);
            showSelectAll(false);
            setSelectedAttachments([]);
          }}
          style={{
            backgroundColor: selectedTab !== 1 ? '#90aae1' : '#d2def2',
            padding: 5,
            borderTopLeftRadius: selectedTab == 1 ? 8 : 0,
            borderBottomLeftRadius: selectedTab == 1 ? 8 : 0,
            height: 36,
            width: 100,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: colors.titleBlackColor,
              fontSize: 16,
              fontWeight: '700',
            }}>
            Documents
          </Text>
        </Pressable>
      </View>
      <TouchableOpacity
        onPress={() => {
          setSelected(!selected);
          showSelectAll(false);
          setSelectedAttachments([]);
        }}
        style={{alignSelf: 'center', width: 50}}>
        <Text
          style={{
            color: colors.backgroundWhite,
            fontSize: 16,
            fontWeight: '400',
          }}>
          {selected ? 'Done' : 'Select'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAttachments = (type: 0 | 1) => {
    if (type === 1) {
      return (
        <View
          style={{
            flexGrow: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: '100%',
            marginTop: 2,
          }}>
          {documents?.map(documentItem => {
            return (
              <Pressable
                onLongPress={() => {
                  setSelected(true);
                  handleSelect(documentItem);
                  showSelectAll(true);
                }}
                onPress={() => {
                  selected
                    ? handleSelect(documentItem)
                    : openDocumentUrl(documentItem.url);
                }}
                style={{
                  width: Dimensions.get('screen').width / 4,
                  height: Dimensions.get('screen').width / 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon
                  name="document"
                  style={{fontSize: 60, color: '#E03131'}}
                />
                <Text
                  numberOfLines={1}
                  // ellipsizeMode="head"
                  style={{
                    width: 30,
                    position: 'absolute',
                    fontSize: 10,
                    fontWeight: '700',
                    color: colors.backgroundWhite,
                  }}>
                  {DocumentType(documentItem.mimeType)?.toUpperCase()}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.titleBlackColor,
                    fontSize: 16,
                    fontWeight: '400',
                  }}>
                  {documentItem?.originalFileName?.split('.')[0]}
                </Text>
                {selectedAttachments?.find(
                  item => item.id === documentItem?.id,
                ) && (
                  <View
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    }}>
                    <AntIcon
                      name="checkcircle"
                      style={{
                        fontSize: 18,
                        color: '#01752F',
                        position: 'absolute',
                        margin: 4,
                        right: 2,
                        bottom: 2,
                      }}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      );
    } else {
      return (
        <View
          style={{
            flexGrow: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: '100%',
            marginTop: 2,
          }}>
          {media?.map(imageItem => {
            return (
              <Pressable
                onLongPress={() => {
                  setSelected(true);
                  handleSelect(imageItem);
                  showSelectAll(true);
                }}
                onPress={() => {
                  selected
                    ? handleSelect(imageItem)
                    : navigation.navigate('ISImageViewer', {
                        imageUrl: `https://tubuludata.s3.amazonaws.com/${imageItem?.url}`,
                      });
                }}
                style={{
                  width: Dimensions.get('screen').width / 4,
                  height: Dimensions.get('screen').width / 4,
                }}>
                <FastImage
                  style={{
                    width: Dimensions.get('screen').width / 4 - 2,
                    height: Dimensions.get('screen').width / 4 - 2,
                  }}
                  source={{
                    uri: `https://tubuludata.s3.amazonaws.com/${imageItem?.url}`,
                  }}
                />
                {selectedAttachments?.find(
                  item => item.id === imageItem?.id,
                ) && (
                  <View
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    }}>
                    <AntIcon
                      name="checkcircle"
                      style={{
                        fontSize: 18,
                        color: '#01752F',
                        position: 'absolute',
                        margin: 4,
                        right: 2,
                        bottom: 2,
                      }}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      );
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.qtmBackgroundColor}}>
      <SafeAreaView style={{backgroundColor: colors.backgroundColorHeader}} />
      {renderHeader()}
      {selectAll && (
        <Pressable
          onPress={() => {
            setSelectAllAttachments(!selectAllAttachments);
            if (!selectAllAttachments) {
              if (selectedTab == 0) {
                setSelectedAttachments(media);
              } else {
                setSelectedAttachments(documents);
              }
            } else {
              setSelectedAttachments([]);
            }
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-end',
            paddingHorizontal: 10,
            marginVertical: 6,
          }}>
          <Text
            style={{
              color: colors.titleBlackColor,
              fontSize: 18,
              fontWeight: '500',
              marginRight: 6,
            }}>
            Select All
          </Text>
          <AntIcon
            name="checkcircle"
            style={{
              fontSize: 18,
              color: selectAllAttachments ? '#01752F' : colors.titleBlackColor,
            }}
          />
        </Pressable>
      )}
      <ScrollView>{renderAttachments(selectedTab)}</ScrollView>
      {showDeleteConfirmation && (
        <ConfirmationPopup
          title={'Delete Attachments?'}
          subTitle={'Do you really want to remove these Attachments?'}
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
      {selected && (
        <View
          style={{
            backgroundColor: colors.backgroundColorHeader,
            height: 60,
            paddingHorizontal: 30,
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            // position: 'absolute',
            // alignSelf: 'center',
            flexDirection: 'row',
            // bottom: 0,
          }}>
          <TouchableOpacity onPress={shareAttachments}>
            <Icon
              name="share-social"
              style={{
                fontSize: 24,
                color: selectedAttachments?.length == 0 ? '#90aae1' : '#d2def2',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={downloadAttachments}>
            <AntIcon
              name="download"
              style={{
                fontSize: 24,
                color: selectedAttachments?.length == 0 ? '#90aae1' : '#d2def2',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteAttachments}>
            <Icon
              name="trash"
              style={{
                fontSize: 24,
                color: selectedAttachments?.length == 0 ? '#90aae1' : '#d2def2',
              }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
