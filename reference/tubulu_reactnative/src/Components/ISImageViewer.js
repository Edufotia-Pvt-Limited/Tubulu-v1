import PropTypes from 'prop-types';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageViewer from 'react-native-image-zoom-viewer';
import FAIcon from 'react-native-vector-icons/FontAwesome';

function ISImageViewer(props) {
  const navParams = Object.assign({}, props.route?.params);
  // Clipboard.setString(navParams.imageUrl)
  const _images = [
    {
      url: navParams?.imageUrl,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <SafeAreaView />
      <ImageViewer imageUrls={_images} />
      <TouchableOpacity
        style={{
          right: 20,
          top: Platform.OS === 'ios' ? 60 : 20,
          position: 'absolute',
        }}
        onPress={() => {
          props.navigation.goBack();
        }}>
        <FAIcon
          name="close"
          style={{
            fontSize: 20,
            color: 'white',
            height: 32,
            width: 32,
          }}
        />
      </TouchableOpacity>
      {/* <ImageViewer imageUrls={_images}></ImageViewer> */}
    </View>
  );
}

ISImageViewer.propTypes = {
  imageUrl: PropTypes.string.isRequired,
};

export default ISImageViewer;
