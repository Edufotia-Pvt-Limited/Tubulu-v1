
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../Utils/Colors';
import { addAddress, getAddress } from "../../Store/UserAddressStore/userAddress.thunks";
import { useAppDispatch, useAppSelector } from '../../Store/hooks';
import { getUserAddressById, UpdateUserAddress } from '../../Utils/ApiActions';

interface Props {
  visible: boolean;
  onClose: () => void;
  editMode?: boolean;
  addressId?: string | null;
}

interface NewAddress {
  fullName: string;
  contact: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  addressType: string;
}

const initialAddressState: NewAddress = {
  fullName: '',
  contact: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  addressType: '',
};

const isPincodeValid = (pincode: string) => /^\d{6}$/.test(pincode);
const isContactValid = (contact: string) => /^\d{10}$/.test(contact);

const addressTypes = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'work', label: 'Work', icon: 'work' },
  { key: 'other', label: 'Other', icon: 'add' },
];

export default function AddAddressForm({ visible, onClose, editMode = false, addressId }: Props) {
  const [address, setAddress] = useState<NewAddress>(initialAddressState);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customOtherLabel, setCustomOtherLabel] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const otherInputRef = useRef<TextInput>(null);

  const dispatch = useAppDispatch();
  const { addresses: reduxAddresses } = useAppSelector(state => state.userAddressState);

  useEffect(() => {
    dispatch(getAddress());
  }, [dispatch]);

  useEffect(() => {
    const fetchAddressData = async () => {
      if (editMode && addressId) {
        try {
          setLoading(true);
          const res = await getUserAddressById(addressId);
          console.log("add edit res", res.data)
          if (res?.data) {
            const addr = res.data;
            setAddress({
              fullName: addr.fullName || '',
              contact: addr.contact || '',
              addressLine1: addr.addressLine1 || '',
              addressLine2: addr.addressLine2 || '',
              city: addr.city || '',
              state: addr.state || '',
              country: addr.country || '',
              pincode: addr.pincode || '',
              addressType: addr.addressType || '',
            });
          }
        } catch (error) {
          console.log("Failed to fetch address for edit:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAddressData();
  }, [editMode, addressId]);

  const usedTypes = reduxAddresses.map(addr => addr.addressType?.toLowerCase());

  const updateField = (field: keyof NewAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const selectAddressType = (type: string) => {
    if (type === 'other') {
      setShowOtherInput(true);
      setCustomOtherLabel('');
      setAddress(prev => ({ ...prev, addressType: type }));
      setTimeout(() => otherInputRef.current?.focus(), 100);
    } else {
      setShowOtherInput(false);
      setCustomOtherLabel('');
      setAddress(prev => ({ ...prev, addressType: type }));
    }
  };

  useEffect(() => {
    const hasAddressType =
      address.addressType.trim().length > 0 || (showOtherInput && customOtherLabel.trim().length > 0);
    const valid =
      address.fullName.trim().length > 0 &&
      isContactValid(address.contact) &&
      address.addressLine1.trim().length > 0 &&
      address.city.trim().length > 0 &&
      address.state.trim().length > 0 &&
      address.country.trim().length > 0 &&
      isPincodeValid(address.pincode) &&
      hasAddressType;

    setIsValid(valid);
  }, [address, customOtherLabel, showOtherInput]);

  const handleSave = async () => {
    if (!isValid) return;

    try {
      const finalAddress = {
        ...address,
        addressType: address.addressType,
        customLabel: address.addressType === "other" ? customOtherLabel.trim() : "",
      };

      if (editMode && addressId) {
        console.log("Editing address:", finalAddress);
        await UpdateUserAddress(finalAddress, addressId)

      } else {
        console.log("Adding new address:", finalAddress);
        await dispatch(addAddress(finalAddress));
      }

      await dispatch(getAddress());
      setAddress(initialAddressState);
      onClose();
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      propagateSwipe
      coverScreen
      useNativeDriver
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={28} color={colors.titleBlackColor} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editMode ? 'Edit Delivery Address' : 'Add Delivery Address'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.backgroundColorHeader} />
          </View>
        ) : (
          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* --- Same Input Fields --- */}
            {Object.entries({
              fullName: 'Full Name *',
              contact: 'Contact Number *',
              addressLine1: 'Address Line 1 *',
              addressLine2: 'Address Line 2',
              city: 'City *',
              state: 'State *',
              country: 'Country *',
              pincode: 'Pincode *',
            }).map(([key, label]) => (
              <View key={key}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${label.replace('*', '')}`}
                  value={address[key as keyof NewAddress] || ''}
                  onChangeText={text => updateField(key as keyof NewAddress, text)}
                  keyboardType={key === 'contact' ? 'phone-pad' : key === 'pincode' ? 'numeric' : 'default'}
                  maxLength={key === 'contact' ? 10 : key === 'pincode' ? 6 : undefined}
                />
              </View>
            ))}

            <Text style={styles.label}>Address Type *</Text>
            <View style={styles.chipContainer}>
              {addressTypes.map(type => {
                const isUsed = usedTypes.includes(type.key);
                const isSelected =
                  type.key === 'other' ? showOtherInput : address.addressType === type.key;

                return (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                      isUsed && type.key !== 'other' && styles.chipDisabled,
                    ]}
                    disabled={isUsed && type.key !== 'other'}
                    onPress={() => selectAddressType(type.key)}
                  >
                    <Icon name={type.icon} size={16} color={isSelected ? 'white' : 'black'} />
                    <Text style={[styles.chipText, isSelected && { color: 'white' }]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {showOtherInput && (
              <TextInput
                ref={otherInputRef}
                style={styles.input}
                placeholder="Enter custom address type"
                value={customOtherLabel}
                onChangeText={setCustomOtherLabel}
              />
            )}
          </ScrollView>
        )}

        <TouchableOpacity
          disabled={!isValid}
          onPress={handleSave}
          style={[styles.saveButton, !isValid && { backgroundColor: '#ccc' }]}
        >
          <Text style={styles.saveButtonText}>
            {editMode ? 'Update Address' : 'Save Address'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ReactNativeModal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: Dimensions.get('window').height * 0.8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: '700', color: colors.titleBlackColor, flex: 1, textAlign: 'center' },
  body: { marginTop: 10 },
  label: { fontWeight: '700', color: colors.titleBlackColor, fontSize: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, fontSize: 14, color: colors.titleBlackColor, marginBottom: 12 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: colors.backgroundColorHeader, borderColor: colors.backgroundColorHeader },
  chipDisabled: { opacity: 0.4 },
  chipText: { marginLeft: 6, fontSize: 14 },
  saveButton: { backgroundColor: colors.backgroundColorHeader, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
