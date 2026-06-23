import { useCallback } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,

} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ISInputBox from './ISInputBox';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../Utils/Colors';
import { useEffect, useState } from 'react';
import { AddressAddModal } from './AddAddressModal';
import { debounce } from '../../Utils/debounce';
import { useAppDispatch, useAppSelector } from '../../Store/hooks';
import { getAddress } from '../../Store/UserAddressStore/userAddress.thunks';
import { Address } from '../../Store/UserAddressStore/address.state';

interface Props {
  navigation: any;
  searchTitle: string
  setSearchProduct: (value: string) => void
}

const CatalogueScreenHeader = (props: Props) => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("")
  const dispatch = useAppDispatch();
  const { addresses } = useAppSelector(
    state => state.userAddressState
  );

  useEffect(() => {
    dispatch(getAddress());
  }, [dispatch]);

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault === true) || null
      setSelectedAddress(defaultAddress)
    }
  }, [addresses])

  const onUseCurrentLocation = () => {
  };

  const onAddNewAddress = () => {
  };

  const onRequestAddress = () => {
  };

  const onViewAllAddresses = () => {
  };

  const debouncedSetSearch = useCallback(
    debounce((value: string) => props.setSearchProduct(value), 300),
    []
  );

  const handleSearch = (text: string) => {
    setSearch(text)
    debouncedSetSearch(text)
  }


  return (
    <>
      <View style={{
        backgroundColor: colors.backgroundColorHeader,
        paddingHorizontal: 15,
        paddingTop: insets.top, paddingBottom: 15,
      }}>
        {/* <SafeAreaView> */}

        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
              style={{
                borderRadius: 13,
                width: 26,
                height: 23,
              }}>
              <Image
                source={require('../../assets/back-icon.png')}
                style={{ height: 18.77, width: 10.74 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={{
            borderRadius: 16,
            backgroundColor: "white",
            marginLeft: 2,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image
              source={require('../../assets/location-icon.png')}
              style={{ height: 18.33, width: 12.83 }}
            />
          </View>

          <TouchableOpacity
            style={{
              width: "100%",
              paddingLeft: 8,
              paddingRight: 8,
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
   onPress={() => setModalVisible(true)}
          >
            <View
              style={{
                justifyContent: "center",
                gap: 6,
                flexDirection: "row",
                alignItems: "center",
              }}
           
            >
              <Text
                style={{
                  fontFamily: "Roboto",
                  fontWeight: "700",
                  fontSize: 16,
                  textAlign: "right",
                  color: "white",
                }}
              >
                {selectedAddress?.addressLabel ? selectedAddress?.addressLabel?.charAt(0).toUpperCase()+ selectedAddress.addressLabel.slice(1)  : "Select Address"}
              </Text>
              <View style={{ width: "100%", flex: 1 }}>
                <Image
                  source={require("../../assets/down-arrow.png")}
                  style={{ height: 6, width: 10.24, marginTop: 3 }}
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                width: "80%",
              }}
            >
              <Text
                style={{
                  fontFamily: "Roboto",
                  fontWeight: "400",
                  fontSize: 13,
                  color: "white",
                  marginTop: 2,
                  flex: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedAddress
                  ? `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 || ""}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.pincode}`
                  : "No address selected"}
              </Text>
            </View>
          </TouchableOpacity>

        </View>

        <ISInputBox
          inputLeftElement={<FAIcon name={'search'} style={{ fontSize: 22 }} />}
          value={search}
          inputRightElement={<Image
            source={require('../../assets/mic-icon.png')}
            style={{ height: 19, width: 13.34 }}
          />}
          placeholder={`Search in ${props.searchTitle ? `${props.searchTitle}` : "Store"}`}
          onChangeText={handleSearch}

        />

        {/* </SafeAreaView> */}

      </View>

      <AddressAddModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUseCurrentLocation={onUseCurrentLocation}
        onViewAllAddresses={onViewAllAddresses}
      />
    </>
  )
}

export default CatalogueScreenHeader;

