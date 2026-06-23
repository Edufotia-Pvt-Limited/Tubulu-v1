import {TextArea} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import {Asset} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import {QTMFormHeader} from '../../../Components/QTMComponents/QTMFormHeader';
import {IAppState} from '../../../Store/State';
import {
  addNewTopicActions,
  getAllTopicsAction,
} from '../../../Store/qtm.store/qtm.actions';
import {colors} from '../../../Utils/Colors';
import {UploadAttachments} from '../../../Utils/QTM.ApiActions';
import {
  IQTMTopics,
  IUploadFile,
  IUploadFileResponse,
} from '../../../models/IQTM';

type ImageType = {
  data: string;
};

interface Props {
  navigation: any;
  route: {params: {isEdit: boolean}};
}

export function QTMNewTopicScreen({navigation, route}: Props) {
  const dispatch: any = useDispatch();
  const [topicDetails, setTopicDetails] = useState<IQTMTopics>({
    name: '',
    description: '',
    logo: '',
    attachements: [],
  });
  const [resourcePath, setresourcePath] = useState('');
  const [attachmentData, setAttachmentData] = useState<IUploadFileResponse[]>(
    [],
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [isEdit, setIsEdit] = useState<boolean>(false);

  const selectedTopic = useSelector(
    (state: IAppState) => state.qtmState.selectedTopic,
  );

  useEffect(() => {
    if (route?.params) {
      let {isEdit} = route?.params;
      setIsEdit(isEdit);
    }
  }, [route]);

  useEffect(() => {
    if (isEdit) {
      if (selectedTopic) {
        setTopicDetails(selectedTopic);
        setresourcePath(selectedTopic?.logo);
      }
    }
  }, [isEdit]);

  const assignedMembers = useSelector(
    (state: IAppState) => state.qtmState.assignedMembers,
  );

  function handleChange(key: keyof IQTMTopics, value: string) {
    setTopicDetails({
      ...topicDetails,
      [key]: value,
    });
  }

  async function handleProfileChange(image: ImageOrVideo & ImageType) {
    const file: IUploadFile = {
      file: image?.data,
      fileName: image?.filename ?? `${Date.now().toLocaleString()}.png`,
      mimeType: image?.mime,
    };
    const response = await UploadAttachments(file);
    const _url: string = 'https://tubuludata.s3.amazonaws.com/' + response?.url;
    setresourcePath(_url);
    handleChange('logo', _url);
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
        let _attachments = [...topicDetails?.attachements];
        _attachments.push(response.id);
        setTopicDetails({
          ...topicDetails,
          attachements: _attachments,
        });
      } else {
        console.log('Unable to add attachments at the moment');
      }
    }
  }

  function renderCreateTopicForm(): JSX.Element {
    return (
      <View style={{paddingHorizontal: 20, display: 'flex'}}>
        <View
          style={{
            position: 'relative',
            top: 37,
            width: 208,
            height: 208,
            alignSelf: 'center',
          }}>
          <View
            style={{
              width: 208,
              height: 208,
              borderColor: '#75BDFF',
              borderWidth: 2,
              borderRadius: 200,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{height: 190, width: 190, borderRadius: 200}}
              source={
                resourcePath == ''
                  ? require('../../../assets/topic_image.png')
                  : {uri: resourcePath}
              }
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              ImagePicker.openPicker({
                mediaType: 'photo',
                selectionLimit: 1,
                cropping: true,
                includeBase64: true,
              })
                .then(response => {
                  handleProfileChange(response);
                  // setresourcePath(response.path);
                })
                .catch(error => {
                  console.log(error);
                });
            }}
            style={{position: 'absolute', top: 140, alignSelf: 'flex-end'}}>
            <Image
              style={{height: 52, width: 52}}
              source={
                isEdit
                  ? require('../../../assets/edit_icon.png')
                  : require('../../../assets/add_button.png')
              }
            />
          </TouchableOpacity>
        </View>
        <View style={{marginTop: 66}} />
        <View
          style={{
            height: 56,
            width: 'auto',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: '#B7B7B7',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}>
          <Image
            style={{height: 20, width: 16}}
            source={require('../../../assets/topic_icon.png')}
          />
          <TextInput
            style={{
              paddingLeft: 18,
              height: 'auto',
              width: '100%',
              color: colors.backgroundColorHeader,
              fontSize: 16,
              fontWeight: '400',
            }}
            value={topicDetails?.name}
            placeholder="New Topic"
            placeholderTextColor={'#2355C4'}
            onChangeText={text => handleChange('name', text)}
          />
        </View>
        <View style={{marginTop: 30}} />
        <View
          style={{
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
            value={topicDetails?.description}
            placeholder="Description"
            placeholderTextColor={'#2355C4'}
            onChangeText={text => handleChange('description', text)}
          />
        </View>
      </View>
    );
  }

  async function createNewTopic() {
    if (topicDetails?.name !== '' && topicDetails?.description !== '') {
      const _data: IQTMTopics = {
        name: topicDetails.name,
        description: topicDetails.description,
        logo: topicDetails.logo,
        attachements: topicDetails?.attachements,
      };
      await dispatch(addNewTopicActions(_data));
      setTopicDetails({} as IQTMTopics);
      dispatch(getAllTopicsAction());
      setresourcePath('');
      navigation.goBack();
    }
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.qtmBackgroundColor}}>
      <QTMFormHeader
        header={isEdit ? 'Edit Topic Details' : 'Create New Topic'}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <ScrollView>
        {renderCreateTopicForm()}
        <View style={{}}>
          <TouchableOpacity
            onPress={createNewTopic}
            style={{
              marginVertical: 80,
              borderRadius: 8,
              backgroundColor: colors.backgroundColorHeader,
              height: 52,
              width: Dimensions.get('screen').width / 1.5,
              justifyContent: 'center',
              alignSelf: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: colors.backgroundWhite,
                fontSize: 16,
                fontWeight: '700',
              }}>
              {isEdit ? 'Save Changes' : 'Create Topic'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
