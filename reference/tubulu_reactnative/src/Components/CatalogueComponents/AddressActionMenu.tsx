import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ReactNativeModal from "react-native-modal";
import { colors } from "../../Utils/Colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  addressLabel: string;
  addressText: string;
}

export default function DeleteConfirmationDialog({
  visible,
  onClose,
  onConfirm,
  addressLabel,
  addressText,
}: Props) {
  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <View style={styles.dialog}>
        <Text style={styles.title}>Delete Address</Text>
        <Text style={styles.message}>Are you sure you want to delete this address?</Text>

        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>{addressLabel}</Text>
          <Text style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">
            {addressText}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.noButton]} onPress={onClose}>
            <Text style={styles.noButtonText}>No</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={onConfirm}>
            <Text style={styles.yesButtonText}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ReactNativeModal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.titleBlackColor,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  addressContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addressLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.titleBlackColor,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  noButton: {
    backgroundColor: '#eee',
  },
  noButtonText: {
    fontWeight: '600',
    color: '#555',
  },
  yesButton: {
    backgroundColor: colors.backgroundColorHeader,
  },
  yesButtonText: {
    fontWeight: '600',
    color: 'white',
  },
});
