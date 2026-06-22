/* eslint-disable eqeqeq */
/* eslint-disable prettier/prettier */
import moment from 'moment';
import { PermissionsAndroid, Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { MIME_TYPES } from './Constants';

export function getMediaType(mediaType) {
    let _mediaType = 'DOCUMENT';
    Object.keys(MIME_TYPES.IMAGE).map(keyItem => {
        if (MIME_TYPES.IMAGE[keyItem] == mediaType) {
            _mediaType = 'IMAGE';
        }
    });
    Object.keys(MIME_TYPES.AUDIO).map(keyItem => {
        if (MIME_TYPES.AUDIO[keyItem] == mediaType) {
            _mediaType = 'AUDIO';
        }
    });
    Object.keys(MIME_TYPES.VIDEO).map(keyItem => {
        if (MIME_TYPES.VIDEO[keyItem] == mediaType) {
            _mediaType = 'VIDEO';
        }
    });
    return _mediaType;
}

export async function requestNotificationPermission() {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                //     {
                //     title: 'Notification permission needs to be granted',
                //     message: 'App needs notification permission to send notifications',
                //     buttonNeutral: 'Ask Me Later',
                //     buttonPositive: 'OK',
                //     buttonNegative: 'Cancel',
                // }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.log(`Unable to grant the notification permission due to: ${error.message}`);
        }
    }
}

export async function requestCameraPermission() {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
                title: 'Camera permission needs to be granted',
                message: 'App needs the camera permission to send images or videos to the integrations',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            });
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.log(`Unable to grant the camera permission due to: ${error.message}`);
        }
    }
    if (Platform.OS === 'ios') {
        try {
            const result = await request(PERMISSIONS.IOS.CAMERA);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.log('Unable to grant the camera permission');
        }
    }
}

export async function requestContactPermission() {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
                title: 'Contacts Permission needs to granted',
                message: 'App needs the contacts permission to assign tasks to contacts',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            });
            console.log('Permission for contacts:', granted);
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.log(`Unable to grant the contacts permission due to: ${error.message}`);
        }
    }
    if (Platform.OS === 'ios') {
        try {
            const result = await request(PERMISSIONS.IOS.CONTACTS);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.log('Unable to grant the contacts permission');
        }
    }
}

export function QTMformattedDate(isoString) {
    const formattedDate = moment(isoString).format('DD MMMM YYYY'); // Use MMMM for full month name
    return formattedDate;
}

export function QTMformattedDateV2(isoString) {
    const formattedDate = moment(isoString).format('DD/MM/YYYY');
    return formattedDate;
}

export function QTMformattedDateV3(isoString) {
    const formattedDate = moment(isoString).format('MMM DD, YYYY'); // Use MMMM for full month name
    return formattedDate;
}

export function QTMformattedDateV4(isoString) {
    const formattedDate = moment(isoString).format('DD MMM YYYY'); // Use MMMM for full month name
    return formattedDate;
}

export function findAvatarColor(initials, length) {
    if (typeof initials == 'string') {
        let hash = 0;
        let prime = 31;
        for (let i = 0; i < initials.length; i++) {
            hash = (hash * prime + initials.charCodeAt(i)) % length;
        }
        return hash;
    }
    return 0;
}


export function getDaysBetweenTwoDates(endDate) {
    const _currentDate = new Date();
    const _dueDate = new Date(endDate);
    const timeDiff = _dueDate.getTime() - _currentDate.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
    return dayDiff;
}


export function formattedQTMRole(role) {
    if (typeof role === 'string') {
        const _roleText = role;
        const newText =
            _roleText.charAt(0).toUpperCase() + _roleText.substring(1).toLowerCase();
        return newText;
    }
}

export function getPercentage(wattage) {
    if (typeof wattage === 'object') {
        const sum = wattage?.inProgress + wattage?.completed + wattage?.cancelled;
        const percentage = Math.floor((wattage?.completed / sum) * 100);
        return percentage;
    }
}
