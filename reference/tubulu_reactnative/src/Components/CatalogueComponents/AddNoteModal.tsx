import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Platform,
  UIManager,
  ScrollView,
  Keyboard,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors } from "../../Utils/Colors";

const screenHeight = Dimensions.get("window").height;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  initialNote?: string;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  visible,
  onClose,
  onSave,
  initialNote = "",
}) => {
  const [note, setNote] = useState(initialNote);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Reset everything when modal opens
  useEffect(() => {
    if (visible) {
      // Reset scroll position when modal becomes visible
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
  }, [visible]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // Ensure input is fully visible above keyboard
        // ReactNativeModal's avoidKeyboard moves the modal up
        // Minimal scroll just to fine-tune positioning
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 10, animated: true });
        }, 300);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        // Clean reset when keyboard closes - reset scroll position
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }, 150);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleInputFocus = () => {
    // Ensure input is visible when focused
    // Small delay to let keyboard animation start
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 10, animated: true });
    }, 350);
  };

  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.55}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      avoidKeyboard={true}
    >
      <View 
        style={[
          styles.modalContainer, 
          { 
            paddingBottom: insets.bottom + 10,
          }
        ]}
      >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add a note for the restaurant</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentWrapper}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollContent}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {/* Textarea Input */}
              <View style={styles.textAreaContainer}>
                <TextInput
                  ref={textInputRef}
                  value={note}
                  onChangeText={setNote}
                  placeholder="e.g. Note for the entire order"
                  placeholderTextColor="#999"
                  multiline
                  style={styles.textArea}
                  maxLength={300}
                  onFocus={handleInputFocus}
                />
              </View>

              {/* Caption */}
              <Text style={styles.caption}>
                The restaurant will try its best to follow your requests.
                 However,
                refunds or cancellations in this regard won't be possible.
              </Text>
            </ScrollView>
          </View>

          {/* Bottom Action Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={() => 
              {
                  setNote("")
                  onClose()
              }
          }
              style={styles.clearBtn}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSave(note.trim());
                onClose();
              }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
    </ReactNativeModal>
  );
};

export default AddNoteModal;

const styles = StyleSheet.create({
  modalContainer: {
    minHeight: 300,
    maxHeight: screenHeight * 0.75, 
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingBottom: 10, 
    overflow: "hidden",
    flexDirection: "column",
  },

  header: {
    backgroundColor: colors.backgroundColorHeader,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    flex: 1,
  },

  closeBtn: {
    padding: 6,
    backgroundColor: "#ffffff33",
    borderRadius: 50,
  },

  contentWrapper: {
    minHeight: 180,
    maxHeight: screenHeight * 0.4,
    flexShrink: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 100,
  },

  textAreaContainer: {
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    padding: 12,
    height: 90,  
  },

  textArea: {
    fontSize: 15,
    color: "#111",
    height: "100%",
    textAlignVertical: "top",
  },

  caption: {
    fontSize: 13.5,
    color: "#777",
    marginTop: 12,
    lineHeight: 20,
    marginBottom: 15,   
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  clearText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },

  saveBtn: {
    backgroundColor: colors.backgroundColorHeader,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
