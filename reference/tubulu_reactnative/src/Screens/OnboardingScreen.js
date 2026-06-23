/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
// import { ArrowForwardIcon, Select, useToast } from 'native-base';
import { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    ActivityIndicator
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from 'react-native-modal';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ISNewButton from '../Components/ISNewButton';
import ISTextInput from '../Components/ISTextInput';
import { OnboardUser, getUserSelfDetails } from '../Utils/ApiActions';
import { colors } from '../Utils/Colors';
import useKeyboardState from '../hooks/useKeyboardState';

const TubuluModal = ({ open, onPressOK, onPressCancel }) => {

    return (
        <View style={styles.container}>
            <Modal isVisible={open} onBackdropPress={onPressCancel}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Dear User, Welcome to Tubulu</Text>
                    <Text style={styles.content}>Your profile data will be:</Text>
                    <View style={styles.iconsContent}>
                        <View style={styles.iconContainer}>
                            <View style={styles.icon}>
                                <MaterialCommunityIcons color={colors.backgroundWhite} name="account-eye" size={18} />
                            </View>
                            <Text style={styles.iconText}>Visible to other professionals</Text>
                        </View>
                        <View style={styles.iconContainer}>
                            <View style={styles.icon}>
                                <MaterialCommunityIcons color={colors.backgroundWhite} name="contacts" size={18} />
                            </View>
                            <Text style={styles.iconText}>Your Name will only be visible to your Contacts.</Text>
                        </View>
                    </View>
                    <View style={{ marginTop: 10 }} />
                    <Text style={styles.content}>This enables business networking and communication within Tubulu.</Text>
                    <Text style={styles.permissionText}>
                        By Pressing Yes, You allow Tubulu to make you visible to other users.
                    </Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.buttonOk} onPress={onPressOK}>
                            <Text style={styles.okButtonText}>Yes, I consent</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonCancel} onPress={onPressCancel}>
                            <Text style={styles.cancelButtonText}>No, I do not consent</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};



function OnboardingScreen(props) {
    const isEdit = props?.route?.params?.isEdit ?? false;

    const [resourcePath, setresourcePath] = useState(
        'https://cdn.pixabay.com/photo/2015/03/04/22/35/avatar-659652_960_720.png',
    );
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [gender, setGender] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [displayLoading, setDisplayLoading] = useState(false);
    const [imageInfo, setImageInfo] = useState({});
    const [location, setLocation] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [dob, setDob] = useState(null)
    const [isConsent, setIsConcent] = useState(false)
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [dateModal, setDateModal] = useState(false);

    // const toast = useToast();

    const isKeyboardOpen = useKeyboardState(false);

    const [height, setHeight] = useState(new Animated.Value(0));

    const showProfile = () => {
        Animated.timing(height, {
            toValue: isKeyboardOpen ? 0 : 180,
            delay: 50,
            useNativeDriver: false,
        }).start();
    };

    const showToast = (message) => {
        Toast.show({
            type: 'error',
            text1: message,
            position: 'bottom',
        });
    };

    useEffect(() => {
        isEdit && getProfileDetails();
    }, []);

    useEffect(() => {
        showProfile();
    }, [isKeyboardOpen]);

    async function getProfileDetails() {
        try {
            setLoadingProfile(true);
            const {
                data: {
                    location,
                    firstName,
                    lastName,
                    email,
                    profilePictureUrl,
                    country,
                    state,
                    city,
                    pinCode,
                    gender,
                    dateOfBirth
                },
            } = await getUserSelfDetails();
            setresourcePath(profilePictureUrl);
            setFirstName(firstName);
            setLastName(lastName);
            setEmail(email);
            setCountry(country);
            setState(state);
            setPinCode(pinCode);
            setGender(gender);
            setCity(city);
            setLocation(location);
            setDob(new Date(dateOfBirth))

        } catch (error) {
            alert(`Unable to get the profile details at the moment ${error.message}`);
        }
        finally {
            setLoadingProfile(false);
        }
    }


    const checkValidation = () => {
        if (!firstName?.trim() || firstName.length < 2) {
            showToast('Please enter a valid first name');
            return false;
        }

        if (!lastName?.trim() || lastName.length < 2) {
            showToast('Please enter a valid last name');
            return false;
        }

        if (
            !email ||
            !email
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                )
        ) {
            showToast('Please enter a valid email');
            return false;
        }

        if (!dob) {
            showToast('Please select your date of birth');
            return false;
        }

        const age = dayjs().diff(dayjs(dob), 'year');
        if (age < 18) {
            showToast('You must be at least 18 years old');
            return false;
        }

        if (!gender) {
            showToast('Please select your gender');
            return false;
        }

        return true;
    };

    const onPressContnue = () => {
        setModalOpen(false);
        if (!isEdit) {
            setIsConcent(true)
        }

        console.log("not validated")
        console.log("dob", dob)
        if (checkValidation()) {
            const formattedDob = dayjs(dob).format('YYYY-MM-DD');
            console.log("validated")
            setDisplayLoading(true);
            const fileExtensionSplit = imageInfo?.path?.split?.('.');
            const extension =
                fileExtensionSplit?.[fileExtensionSplit?.length - 1] ?? undefined;
            OnboardUser({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.toLowerCase(),
                file: imageInfo.data,
                mimeType: imageInfo.mime,
                fileName: imageInfo.fileName ?? `${firstName}_${email}.${extension}`,
                location,
                country: country.trim(),
                city: city.trim(),
                state: state.trim(),
                gender,
                pinCode: pinCode.trim(),
                dateOfBirth: formattedDob
            })
                .then(response => {
                    setDisplayLoading(false);
                    !isEdit && props.navigation.replace('HomeScreen');
                    Alert.alert('Success', 'Profile updated successfully');
                })
                .catch(error => {
                    alert(error.message);
                    setDisplayLoading(false);
                    showToast(error.message || 'Something went wrong');
                    console.log(error);
                });
        }
    };
    return (
        <>
            {
                loadingProfile ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <ActivityIndicator size="large" color="#2355C4" />
                        <Text style={{ marginTop: 12, color: "#555" }}>Loading profile...</Text>
                    </View>
                ) :

                    (<View style={{ flex: 1, backgroundColor: colors.backgroundWhite }}>




                        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.backgroundWhite }}>
                            <View style={{ height: 60, flexDirection: 'row', paddingHorizontal: 16 }}>
                                {isEdit && (
                                    <View style={{ justifyContent: 'center', flex: 1 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                props.navigation.goBack();
                                            }}>
                                            <IonIcon
                                                name={'arrow-back'}
                                                style={{ color: '#2355C4', fontSize: 24 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <View style={{ flex: 6, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 17, fontWeight: '600' }}>
                                        Profile information
                                    </Text>
                                </View>
                                {isEdit && <View style={{ flex: 1 }} />}
                            </View>
                        </SafeAreaView>
                        {/* {!isKeyboardOpen && ( */}
                        <Animated.View
                            style={{
                                marginVertical: isKeyboardOpen ? 20 : 20,
                                // height: height,

                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Animated.View
                                style={{
                                    height: isKeyboardOpen ? 0 : 180,
                                    width: 180,
                                    borderColor: '#2355C4',
                                    borderWidth: isKeyboardOpen ? 0 : 2,
                                    borderRadius: 100,
                                }}>
                                <View style={{ alignItems: 'center', padding: 8 }}>
                                    <Image
                                        source={{ uri: resourcePath }}
                                        style={{ height: isKeyboardOpen ? 0 : 160, width: 160, borderRadius: 1000 }}
                                    />
                                </View>
                                {!isKeyboardOpen && (<View
                                    style={{
                                        borderRadius: 50,
                                        borderWidth: 2,
                                        padding: 8,
                                        position: 'absolute',
                                        borderColor: 'white',
                                        backgroundColor: '#2355C4',
                                        top: 125,
                                        left: 125,
                                    }}>
                                    <MaterialIcons
                                        name="camera-alt"
                                        size={32}
                                        style={{ color: 'white' }}
                                        onPress={() => {
                                            ImagePicker.openPicker({
                                                mediaType: 'photo',
                                                selectionLimit: 1,
                                                cropping: true,
                                                includeBase64: true,
                                            })
                                                .then(response => {
                                                    console.log(response);
                                                    setImageInfo(response);
                                                    setresourcePath(response.path);
                                                })
                                                .catch(error => {
                                                    console.log(error);
                                                });
                                        }}
                                    />
                                </View>)}
                            </Animated.View>
                        </Animated.View>
                        {/* )} */}
                        <View
                            style={{
                                flex: 1,
                            }}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === "ios" ? "padding" : "height"}

                                style={{ flex: 1 }}
                            >
                                <ScrollView
                                    contentContainerStyle={{
                                        flexGrow: 1,
                                        paddingBottom: 50, // ensures last dropdown not cut off
                                    }}
                                    keyboardShouldPersistTaps="handled">
                                    <View style={{ flex: 1, padding: 24 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ flex: 1, paddingRight: 8 }}>
                                                <ISTextInput
                                                    placeholder={'First Name'}
                                                    value={firstName}
                                                    onChangeText={text => setFirstName(text)}
                                                />
                                            </View>
                                            <View style={{ flex: 1, paddingLeft: 8 }}>
                                                <ISTextInput
                                                    placeholder={'Last Name'}
                                                    value={lastName}
                                                    onChangeText={text => setLastName(text)}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ marginTop: 16 }} />
                                        <ISTextInput
                                            placeholder={'Email'}
                                            value={email}
                                            onChangeText={text => setEmail(text)}
                                        />

                                        <TouchableOpacity
                                            style={styles.dateInput}
                                            onPress={() => setDateModal(true)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.dateText, !dob && { color: '#9E9E9E' }]}>
                                                {dob ? dayjs(dob).format('DD MMM YYYY') : 'Date of Birth'}
                                            </Text>
                                        </TouchableOpacity>
                                        <DatePicker
                                            modal
                                            open={dateModal}
                                            date={dob || new Date('2000-01-01')}
                                            mode="date"
                                            maximumDate={new Date()}
                                            onConfirm={(date) => {
                                                setDateModal(false)
                                                setDob(date);
                                            }}
                                            onCancel={() => setDateModal(false)}
                                        />
                                        <View style={{ marginTop: 16 }} />
                                        <ISTextInput
                                            placeholder={'Country'}
                                            value={country}
                                            onChangeText={text => setCountry(text)}
                                        />

                                        <View style={{ marginTop: 16 }} />
                                        <ISTextInput
                                            placeholder={'State'}
                                            value={state}
                                            onChangeText={text => setState(text)}
                                        />
                                        <View style={{ marginTop: 16 }} />
                                        <ISTextInput
                                            placeholder={'City'}
                                            value={city}
                                            onChangeText={text => setCity(text)}
                                        />
                                        <View style={{ marginTop: 16 }} />
                                        <ISTextInput
                                            placeholder={'Pin Code'}
                                            value={pinCode}
                                            onChangeText={text => setPinCode(text)}
                                        />
                                        <View style={{ marginTop: 16 }} />

                                        <Dropdown
                                            style={styles.dropdown}
                                            placeholderStyle={styles.placeholderStyle}
                                            selectedTextStyle={styles.selectedTextStyle}
                                            itemTextStyle={styles.itemTextStyle}
                                            containerStyle={styles.dropdownContainer}
                                            activeColor="#F5F5F5"
                                            data={[
                                                { label: "Male", value: "Male" },
                                                { label: "Female", value: "Female" },
                                            ]}
                                            maxHeight={250}
                                            labelField="label"
                                            valueField="value"
                                            placeholder="Gender"
                                            value={gender}
                                            onChange={(item) => setGender(item.value)}
                                        />
                                    </View>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </View>
                        <View style={{ flex: 0.1, padding: 24 }}>
                            <ISNewButton
                                displayLoading={displayLoading}
                                onPress={() => { isEdit || isConsent ? onPressContnue() : setModalOpen(true); }}
                                title={isEdit ? 'Update Profile' : 'Continue'}
                            // endIcon={<ArrowForwardIcon size={4} />}
                            />
                        </View>





                    </View>
                    )

            }

            <TubuluModal open={modalOpen} onPressOK={onPressContnue}

                onPressCancel={() => {
                    setModalOpen(false)

                }


                } />

        </>

    )

}

const styles = StyleSheet.create({
    container: {},
    modalContent: {
        backgroundColor: colors.backgroundWhite,
        padding: 20,
        borderRadius: 10,
        // height: 400,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
        color: colors.titleBlackColor,
    },
    content: {
        fontSize: 14,
        color: colors.titleBlackColor,
        marginBottom: 5,
    },
    permissionText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginVertical: 12,
        color: colors.titleBlackColor,
    },
    iconsContent: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    icon: {
        // borderColor: colors.backgroundColorHeader,
        // borderWidth: 0.5,
        borderRadius: 20,
        padding: 5,
        backgroundColor: colors.backgroundColorHeader,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    iconText: {
        fontSize: 14,
        color: colors.titleBlackColor,
    },
    buttonContainer: {
        // flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.inputBorderGrey,
        paddingTop: 10,
        justifyContent: 'space-between',
        width: '100%',
    },
    buttonOk: {
        // borderWidth: 0.5,
        paddingVertical: 5,
        borderRadius: 8,
        height: 40,
        // width: '48%',
        backgroundColor: colors.backgroundColorHeader,
    },
    buttonCancel: {
        marginTop: 10,
        borderWidth: 0.5,
        height: 40,
        borderRadius: 8,
        paddingVertical: 5,
        borderColor: colors.backgroundColorHeader,
        // width: '48%',
        backgroundColor: colors.backgroundWhite,
    },
    okButtonText: {
        textAlign: 'center',
        color: colors.backgroundWhite,
        fontSize: 14,
        marginTop: 6,
    },
    cancelButtonText: {
        textAlign: 'center',
        color: colors.backgroundColorHeader,
        fontSize: 14,
        marginTop: 6,
    },
    dropdown: {
        height: 50,
        // borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
    },
    placeholderStyle: {
        fontSize: 15,
        color: '#9E9E9E',
    },
    selectedTextStyle: {
        fontSize: 15,
        color: '#212121',
    },
    itemTextStyle: {
        fontSize: 15,
        color: '#212121',
    },
    dropdownContainer: {
        borderRadius: 8,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        backgroundColor: '#FFF',
    },
    dateInput: {
        height: 50,
        // borderWidth: 1,
        marginTop: 16,
        // borderColor: '#E0E0E0',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: '#FFF',
    },
    dateText: {
        fontSize: 15,
        color: '#212121',
    },
});

export default OnboardingScreen;