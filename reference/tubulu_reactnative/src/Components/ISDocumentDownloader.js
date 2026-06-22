/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import RNFS from 'react-native-fs';
import FAIcon from 'react-native-vector-icons/FontAwesome';

function ISDocumentDownloader(props) {
    const [displayLoading, setDisplayLoading] = useState(false);

    const _downloadFile = async () => {
        const localFile = `${RNFS.DocumentDirectoryPath}/${props.documentName}`;
        setDisplayLoading(true);
        await Linking.openURL(props.documentUrl);
        setDisplayLoading(false);
        // RNFS.downloadFile({
        //   fromUrl: props.documentUrl,
        //   toFile: localFile
        // }).promise.then(response => {
        //   setDisplayLoading(false);
        //   return FileViewer.open(localFile, {
        //     displayName: props.documentName,
        //     showOpenWithDialog: true
        //   })
        // }).catch(error => {
        //   setDisplayLoading(false);
        //   Alert.alert('Error ' + error.message, 'Unable to download the file at the moment');
        // })
    };

    return (
        <TouchableOpacity
            onPress={_downloadFile}
            ref={props.ref}
            onLongPress={props.onLongPress}
            style={{
                minHeight: 40,
                alignItems: 'center',
                flexDirection: 'row',
                borderWidth: 0.5,
                borderColor: props?.isMessageByUser ? 'transparent' : '#DEE2FB',
                borderRadius: 20,
                padding: 16,
            }}>
            {!displayLoading && (
                <TouchableOpacity
                    onPress={() => {
                        _downloadFile();
                    }}>
                    <Image
                        style={{ height: 30, width: 23 }}
                        source={require('../assets/pdf_type.png')}
                    />
                </TouchableOpacity>
            )}
            <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={{
                    marginLeft: 8,
                    color: props.color ? props.color : 'white',
                    fontSize: 14,
                    fontWeight: '400',
                    flexWrap: 'wrap',
                    maxWidth: 180,
                }}>
                {props.documentName?.split('_')[1] || 'Document'}
            </Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                {!displayLoading && (
                    <TouchableOpacity onPress={_downloadFile}>
                        <FAIcon
                            name="download"
                            style={{
                                color: props.isMessageByUser ? 'white' : '#C7C7CC',
                                fontSize: 16,
                            }}
                        />
                    </TouchableOpacity>
                )}
                {displayLoading && <ActivityIndicator color={'#C7C7CC'} />}
            </View>
        </TouchableOpacity>
    );
}

ISDocumentDownloader.propTypes = {
    onLongPress: PropTypes.func,
    documentName: PropTypes.string.isRequired,
    documentUrl: PropTypes.string.isRequired,
    color: PropTypes.string,
};

export default ISDocumentDownloader;
