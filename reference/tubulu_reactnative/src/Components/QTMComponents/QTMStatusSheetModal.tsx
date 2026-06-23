import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {colors} from '../../Utils/Colors';

interface Props {
  readonly open: boolean;
  readonly setModalClose: () => void;
  readonly status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DATE_EXTENSION';
  readonly onChangeStatus: (status: any) => void;
  readonly showExtensionRequest: boolean;
}

const statusType = [
  {
    name: 'In Progress',
    value: 'IN_PROGRESS',
    color: '#FFA800',
  },
  {
    name: 'Completed',
    value: 'COMPLETED',
    color: '#00BA07',
  },
  {
    name: 'Cancelled',
    value: 'CANCELLED',
    color: '#FF3014',
  },
  {
    name: 'Request Extension',
    value: 'DATE_EXTENSION',
    color: '#FF3014',
  },
];

export function QTMStatusSheetModal({
  open,
  showExtensionRequest,
  setModalClose,
  status,
  onChangeStatus,
}: Props): JSX.Element {
  const [filteredStatus, setFilteredStatus] = useState(
    statusType?.filter(fItem => fItem.value !== 'DATE_EXTENSION'),
  );

  useEffect(() => {
    if (showExtensionRequest) {
      setFilteredStatus(statusType);
    } else {
      setFilteredStatus(
        statusType?.filter(fItem => fItem.value !== 'DATE_EXTENSION'),
      );
    }
  }, [showExtensionRequest, status]);

  return (
    <ReactNativeModal
      isVisible={open}
      animationIn={'bounceInUp'}
      onBackdropPress={setModalClose}
      onBackButtonPress={setModalClose}
      backdropOpacity={0.7}
      coverScreen={false}>
      <View
        style={{
          alignSelf: 'center',
          height:
            Dimensions.get('screen').height *
            (showExtensionRequest ? 0.26 : 0.2),
          // padding: 15,
          width: Dimensions.get('screen').width,
          backgroundColor: colors.backgroundWhite,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          position: 'absolute',
          bottom: -20,
        }}>
        <View style={{marginTop: 10}}>
          <Pressable
            onPress={setModalClose}
            style={{
              height: 8,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                backgroundColor: colors.textColorGray,
                height: 5,
                width: 40,
                borderRadius: 20,
                alignSelf: 'center',
              }}
            />
          </Pressable>
          {filteredStatus?.map(buttonItem => (
            <TouchableOpacity
              onPress={() => onChangeStatus(buttonItem.value)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderColor: colors.inputBorderGrey,
                borderBottomWidth: 0.54,
                height: Dimensions.get('screen').height * 0.058,
                justifyContent: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '500',
                    color: colors.backgroundColorHeader,
                  }}>
                  {buttonItem.name}
                </Text>
                <View
                  style={{
                    borderRadius: 20,
                    height: 18,
                    width: 18,
                    borderWidth: 1,
                    borderColor: colors.inputBorderGrey,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {buttonItem.value == status && (
                    <View
                      style={{
                        height: 12,
                        width: 12,
                        borderRadius: 20,
                        backgroundColor: colors.backgroundColorHeader,
                      }}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ReactNativeModal>
  );
}
