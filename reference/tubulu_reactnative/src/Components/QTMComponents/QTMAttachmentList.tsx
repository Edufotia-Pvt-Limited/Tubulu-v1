import React, {useEffect, useState} from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {IUploadFileResponse} from '../../models/IQTM';
import navigationService from '../../Services/navigation.service';
import {colors} from '../../Utils/Colors';
import {CheckDocumentMimeTypes} from '../../Utils/QTMHelper';

interface Props {
  attachments: IUploadFileResponse[];
  handleRemove: (attachment: IUploadFileResponse) => void;
}

export function QTMAttachments({
  attachments,
  handleRemove,
}: Props): JSX.Element {
  const [images, setImages] = useState<IUploadFileResponse[]>([]);
  const [audios, setAudios] = useState<IUploadFileResponse[]>([]);
  const [documents, setDocuments] = useState<IUploadFileResponse[]>([]);
  const [videos, setVideos] = useState<IUploadFileResponse[]>([]);

  useEffect(() => {
    if (attachments?.length) {
      buildImages();
      buildDocuments();
      buildAudios();
    } else {
      setImages([]);
      setAudios([]);
      setDocuments([]);
    }
  }, [attachments]);

  function buildImages() {
    const imageList = attachments?.filter(
      imageData =>
        imageData.mimeType === 'image/jpeg' ||
        imageData.mimeType === 'image/jpg' ||
        imageData.mimeType === 'image/png',
    );
    setImages(imageList);
  }

  function buildDocuments() {
    const docList = attachments?.filter(documentData =>
      CheckDocumentMimeTypes(documentData.mimeType),
    );
    setDocuments(docList);
  }

  function buildAudios() {
    const audioList = attachments?.filter(
      audioData => audioData.mimeType === 'audio/mpeg',
    );
    setAudios(audioList);
  }

  const renderImages = (): JSX.Element => (
    <View style={{}}>
      {/* {images?.length > 0 && <Text style={{ fontSize: 14, fontWeight: '400', color: '#4F4D4D' }}>Images</Text>} */}
      <ScrollView horizontal style={{width: '100%'}}>
        {images?.length > 0 &&
          images?.map(imageItem => {
            return (
              <Pressable
                style={{marginRight: 10}}
                onPress={() => {
                  navigationService.push('ISImageViewer', {
                    imageUrl: `https://tubuludata.s3.amazonaws.com/${imageItem.url}`,
                  });
                }}>
                <TouchableOpacity
                  onPress={() => handleRemove(imageItem)}
                  style={{
                    position: 'absolute',
                    backgroundColor: colors.backgroundWhite,
                    borderWidth: 0.2,
                    borderRadius: 50,
                    zIndex: 10,
                    top: 0,
                    right: 0,
                  }}>
                  <Icon
                    name="close"
                    size={14}
                    style={{color: colors.titleBlackColor, padding: 2}}
                  />
                </TouchableOpacity>
                <FastImage
                  style={{height: 50, width: 50, borderRadius: 8}}
                  source={{
                    uri: `https://tubuludata.s3.amazonaws.com/${imageItem.url}`,
                  }}
                />
              </Pressable>
            );
          })}
      </ScrollView>
    </View>
  );

  const renderDocuments = (): JSX.Element => (
    <View style={{}}>
      {/* {documents?.length > 0 && <Text style={{ fontSize: 14, fontWeight: '400', color: '#4F4D4D' }}>Documents</Text>} */}
      <ScrollView horizontal style={{width: '100%'}}>
        {documents?.length > 0 &&
          documents?.map(docItem => {
            return (
              <TouchableOpacity
                style={{
                  marginRight: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon
                  name="document"
                  style={{fontSize: 50, color: '#E03131'}}
                />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="head"
                  style={{
                    width: 28,
                    position: 'absolute',
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.backgroundWhite,
                    bottom: 6,
                    left: 10,
                  }}>
                  PDF
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemove(docItem)}
                  style={{
                    position: 'absolute',
                    backgroundColor: colors.backgroundWhite,
                    borderWidth: 0.2,
                    borderRadius: 50,
                    zIndex: 10,
                    top: 0,
                    right: 0,
                  }}>
                  <Icon
                    name="close"
                    size={14}
                    style={{color: colors.titleBlackColor, padding: 2}}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );

  const renderAudios = (): JSX.Element => (
    <View style={{}}>
      {/* {audios?.length > 0 && <Text style={{ fontSize: 14, fontWeight: '400', color: '#4F4D4D' }}>Audio</Text>} */}
      <ScrollView horizontal style={{width: '100%'}}>
        {audios?.length > 0 &&
          audios?.map(audioItem => {
            return (
              <TouchableOpacity
                style={{
                  marginRight: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MaterialCommunityIcon
                  name="file-music"
                  style={{fontSize: 50, color: '#E03131'}}
                />
                {/* <Text numberOfLines={1} ellipsizeMode="head" style={{ width: 42 }}>{audioItem.fileName}</Text> */}
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      {renderImages()}
      {renderDocuments()}
      {renderAudios()}
    </View>
  );
}
