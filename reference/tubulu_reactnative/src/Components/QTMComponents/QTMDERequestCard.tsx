import {Spinner} from 'native-base';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../Utils/Colors';
import {QTMFormattedDateV5, QTMFormattedTime} from '../../Utils/QTMHelper';
import {QTMAvatar} from './QTMMemberCard';

interface Props {
  readonly firstName: string;
  readonly lastName: string;
  readonly subTaskName: string;
  readonly taskName: string;
  readonly reason: string;
  readonly endDate: string;
  readonly extensionDate: string;
  readonly loading: boolean;
  readonly onPressApprove: () => void;
  readonly onPressReject: () => void;
}

export function QTMDERequestCard({
  firstName,
  lastName,
  subTaskName,
  taskName,
  reason,
  endDate,
  extensionDate,
  loading,
  onPressApprove,
  onPressReject,
}: Props): JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <QTMAvatar
          height={34}
          width={34}
          fontSize={13}
          firstName={firstName}
          lastName={lastName}
        />
        <Text style={styles.name}>
          {firstName} {lastName}
        </Text>
        <View style={styles.status}>
          <Text style={styles.statusText}>Low</Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.subTask}>Sub Task :- {subTaskName}</Text>
        <Text style={styles.task}>Task :- {taskName}</Text>
        <View style={styles.dateTime}>
          <View style={styles.dateTimeBlock}>
            <Text style={styles.dateLabel}>Due Date & Time</Text>
            <Text style={styles.dateValue}>{QTMFormattedDateV5(endDate)}</Text>
            <Text style={styles.timeValue}>
              {QTMFormattedTime(endDate, true)}
            </Text>
          </View>
          <View style={styles.dateTimeBlock}>
            <Text style={styles.dateLabel}>Requested Date & Time</Text>
            <Text style={styles.dateValue}>
              {QTMFormattedDateV5(extensionDate)}
            </Text>
            <Text style={styles.timeValue}>
              {QTMFormattedTime(extensionDate, true)}
            </Text>
          </View>
        </View>
        <Text style={styles.reasonTitle}>Reason</Text>
        <Text style={styles.reasonText}>{reason}</Text>
      </View>
      {loading ? (
        <Spinner />
      ) : (
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.approved} onPress={onPressApprove}>
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelled} onPress={onPressReject}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 10,
    // height: 314,
    padding: 16,
    margin: 10,
    // borderWidth: 0.5,
    borderColor: colors.inputBorderGrey,
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    marginLeft: 10,
    fontSize: 18,
    color: colors.titleBlackColor,
    fontWeight: '700',
    flex: 1,
  },
  status: {
    backgroundColor: colors.completedGreen,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: colors.backgroundWhite,
    fontSize: 12,
    fontWeight: '400',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  details: {
    marginBottom: 5,
  },
  subTask: {
    // marginTop: 10,
    color: colors.titleBlackColor,
    fontSize: 14,
    fontWeight: '600',
    // marginBottom: 4,
  },
  task: {
    marginTop: 5,
    color: colors.titleBlackColor,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateTimeBlock: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: colors.titleBlackColor,
    fontWeight: '600',
  },
  dateValue: {
    marginTop: 4,
    fontSize: 14,
    color: colors.titleBlackColor,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.titleBlackColor,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.titleBlackColor,
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#868080',
    marginBottom: 10,
    maxHeight: 47,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approved: {
    width: Dimensions.get('screen').width / 2 - 40,
    // borderWidth: 1,
    borderRadius: 8,
    height: 32,
    backgroundColor: colors.completedGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelled: {
    width: Dimensions.get('screen').width / 2 - 40,
    // borderWidth: 1,
    borderRadius: 8,
    height: 32,
    backgroundColor: colors.cancelledRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.backgroundWhite,
    fontSize: 16,
    fontWeight: '500',
  },
});
