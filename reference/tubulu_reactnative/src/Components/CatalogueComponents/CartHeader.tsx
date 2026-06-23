
import {
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../Utils/Colors';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../Store/hooks';
import { getAddress } from '../../Store/UserAddressStore/userAddress.thunks';
import { Address } from '../../Store/UserAddressStore/address.state';

interface Props {
    navigation: any;
    integrationName: string
}

const CartHeader = (props: Props) => {
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
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

    const onViewAllAddresses = () => {
    };



    return (
        <>
            <View style={{
                backgroundColor: colors.backgroundColorHeader,
                paddingHorizontal: 15,
                paddingTop: insets.top, paddingBottom: 5,
            }}>
                {/* <SafeAreaView> */}
                <View style={{ width: '100%', alignItems: 'flex-start', marginBottom: 12 }}>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        paddingVertical: 5,
                        backgroundColor: 'transparent',
                    }}>
                        <TouchableOpacity
                            onPress={() => props.navigation.goBack()}
                            style={{
                                borderRadius: 14,
                                width: 28,
                                height: 28,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 12,
                            }}>
                            <Image
                                source={require('../../assets/back-icon.png')}
                                style={{
                                    height: 18.77,
                                    width: 10.74,
                                    tintColor: 'white',
                                }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                        <Text
                            style={{
                                fontFamily: 'Roboto',
                                fontWeight: '700',
                                fontSize: 20,
                                color: "white",
                                flexShrink: 1,
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {props.integrationName}
                        </Text>
                    </View>
                </View>
            </View>


        </>
    )
}

export default CartHeader;



