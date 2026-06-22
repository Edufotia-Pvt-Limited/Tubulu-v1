
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Keyboard,
  Pressable,
  Animated
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../Utils/Colors';
import ISInputBox from './ISInputBox';
import AddAddressForm from './AddAddressForm';
import { useAppDispatch, useAppSelector } from '../../Store/hooks';
import { Address } from '../../Store/UserAddressStore/address.state';
import { DeleteUserAddress, UpdateUserAddress } from '../../Utils/ApiActions';
import { getAddress } from '../../Store/UserAddressStore/userAddress.thunks';
import AddressSkeleton from './AddressSkeleton';
import { debounce } from '../../Utils/debounce';
import DeleteConfirmationDialog from './AddressActionMenu';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUseCurrentLocation: () => void;
  onViewAllAddresses: () => void;
}

export function AddressAddModal({
  visible,
  onClose,
  onUseCurrentLocation,
  onViewAllAddresses,
}: Props) {

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const dispatch = useAppDispatch();
  const { addresses, loading } = useAppSelector(state => state.userAddressState);

  const addressTypeIcons: Record<string, string> = {
    home: 'home',
    work: 'work',
    other: 'location-on',
  };

  const onModalClose = () => setIsModalVisible(false);
  const onSelectAddress = async (addressId: string) => {
    if(addresses.length === 1) return
    try {
      await UpdateUserAddress({ isDefault: true }, addressId);
      await dispatch(getAddress());
    } catch (error) {
      console.error("Error updating default address:", error);
    }
  };

  const handleEdit = (addressId: string) => {
    setActiveMenuId(null);
    setIsModalVisible(true)
    setEditMode(true)
    setSelectedAddressId(addressId)
  };

  const addNewAddress = () => {
    setActiveMenuId(null);
    setIsModalVisible(true)
    setEditMode(false)
  }

  const handleDelete = (item: Address) => {
    setDeleteDialogVisible(true)
    setSelectedAddress(item);
    setActiveMenuId(null);

  }

  const confirmDelete = async () => {
    setActiveMenuId(null);

    if (!selectedAddress?._id) return;

    try {
      await DeleteUserAddress(selectedAddress._id);
      await dispatch(getAddress());
      setDeleteDialogVisible(false);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };


  const onOpenMenu = (addressId: string) => {
    if (activeMenuId === addressId) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(addressId);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => dispatch(getAddress(value)), 300),
    []
  );

  const handleSearch = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  const renderAddressItem = (item: Address) => {
    if (!item._id) return null;
    const iconName = addressTypeIcons[item.addressType] || 'location-on';
    const isMenuVisible = activeMenuId === item._id;

    return (
      <View key={item._id} style={{ marginBottom: 8, position: 'relative' }}>
        <TouchableOpacity
          onPress={() => onSelectAddress(item._id!)}
          style={{
            flexDirection: 'row',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: item.isDefault ? '#EFF4FF' : 'white',
            borderRadius: 8,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <View
            style={{
              backgroundColor: item.isDefault ? colors.backgroundColorHeader : '#efefef',
              width: 42,
              height: 42,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Icon name={iconName} size={22} color={item.isDefault ? 'white' : colors.titleBlackColor} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: colors.titleBlackColor }}>
              {item.addressLabel ? item.addressLabel.charAt(0).toUpperCase() + item.addressLabel.slice(1) : 'Unknown'}
            </Text>
            <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }} numberOfLines={1} ellipsizeMode="tail">
              {`${item.addressLine1} ${item.addressLine2 || ''} ${item.city} ${item.state} ${item.pincode}`}
            </Text>
          </View>

          {item.isDefault && (
            <View style={{
              backgroundColor: '#00c853',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>SELECTED</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => onOpenMenu(item._id!)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <EntypoIcon name="dots-three-vertical" size={18} color="#999" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </TouchableOpacity>
        {isMenuVisible && (
          <View
            style={{
              position: 'absolute',
              right: 16,
              top: 50,
              backgroundColor: '#fff',
              paddingVertical: 8,
              borderRadius: 10,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 6,
              zIndex: 999,
              // width: 150,
            }}
          >
            {/* Edit Option */}
            <TouchableOpacity
              onPress={() => handleEdit(item._id!)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
              }}
            >
              <FAIcon name="pencil" size={16} color="#1976D2" style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1976D2' }}>Edit</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#eee', marginHorizontal: 8 }} />

            {/* Delete Option */}
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
              }}
            >
              <FAIcon name="trash" size={16} color="#D32F2F" style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#D32F2F' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    );
  };

  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.6}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      propagateSwipe={true}
      deviceHeight={Dimensions.get('screen').height}
      deviceWidth={Dimensions.get('screen').width}
      coverScreen={true}
      statusBarTranslucent
      hideModalContentWhileAnimating
      
    >
      <Pressable
        onPress={Keyboard.dismiss}
        style={{
          backgroundColor: '#fff',
          paddingTop: 16,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: Dimensions.get('window').height * 0.8,
        }}
      >

        {/* Header */}
        <Animated.View
          style={{
            height: Dimensions.get('screen').height,
            width: '100%',
            backgroundColor: colors.backgroundWhite,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={onClose}>
              <Image
                source={require('../../assets/back-icon.png')}
                style={{ height: 18.77, width: 10.74, tintColor: colors.titleBlackColor }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.titleBlackColor }}>
              Select Your Location
            </Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Search Box */}
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <ISInputBox
              inputLeftElement={<FAIcon name={'search'} style={{ fontSize: 22 }} />}
              placeholder={'Search an area or address'}
              value={search}
              onChangeText={handleSearch}
            />
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, marginHorizontal: 8 }}>
            <TouchableOpacity
              onPress={onUseCurrentLocation}
              style={{
                flex: 1,
                marginHorizontal: 6,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: colors.backgroundColorHeader,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}>
              <Icon name="my-location" size={20} color={colors.backgroundColorHeader} />
              <Text style={{ fontWeight: '700', color: colors.backgroundColorHeader, fontSize: 12 }}>
                Use Current Location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              // onPress={() => setIsModalVisible(true)}
              onPress={addNewAddress}
              style={{
                flex: 1,
                marginHorizontal: 6,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: colors.backgroundColorHeader,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}>
              <Icon name="add" size={20} color={colors.backgroundColorHeader} />
              <Text style={{ fontWeight: '700', color: colors.backgroundColorHeader, fontSize: 12 }}>
                Add New Address
              </Text>
            </TouchableOpacity>
          </View>
          {/* Address List */}
          <Pressable
            onPress={() => setActiveMenuId(null)}
            style={{ flex: 1 }}
          >
            {/* Address List */}
            <ScrollView style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
              {loading
                ? [...Array(3)].map((_, i) => <AddressSkeleton key={i} />)
                :
                addresses.length > 0 ?

                  addresses.map(renderAddressItem)

                  :
                  (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50 }}>
                    <Text style={{ color: '#555', fontSize: 15, fontWeight: '500' }}>
                      No saved addresses found.
                    </Text>
                  </View>)
              }
            </ScrollView>

          </Pressable>

          {/* View All */}
          {addresses.length > 3 && (
            <TouchableOpacity onPress={onViewAllAddresses} style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: colors.backgroundColorHeader, fontWeight: '700' }}>
                View all ▼
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Pressable>

      {/* Add Address Form */}
      <AddAddressForm
        onClose={onModalClose}
        visible={isModalVisible}
        addressId={selectedAddressId}
        editMode={editMode}
      />
      <DeleteConfirmationDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        addressLabel={selectedAddress?.addressType || ""}
        addressText={`${selectedAddress?.addressLine1} ${selectedAddress?.addressLine2} ${selectedAddress?.city} ${selectedAddress?.state} ${selectedAddress?.pincode}`}
      />
    </ReactNativeModal>
  );
}
