
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../Utils/Colors";

interface Props {
  isListView: boolean;
  onChange: (value: boolean) => void;
}

const ViewModeSelector: React.FC<Props> = ({ isListView, onChange }) => {
  return (
    <View style={styles.container}>
      {/* Grid */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onChange(false)}
        style={[
          styles.item,
          !isListView && styles.activeItem,
        ]}
      >
        <Ionicons
          name="grid-outline"
          size={18}
          color={!isListView ? "#fff" : colors.backgroundColorHeader}
        />
      </TouchableOpacity>

      {/* List */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onChange(true)}
        style={[
          styles.item,
          isListView && styles.activeItem,
        ]}
      >
        <Ionicons
          name="list-outline"
          size={18}
          color={isListView ? "#fff" : colors.backgroundColorHeader}
        />
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ViewModeSelector);

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     padding: 4,
//     borderRadius: 14,
//     backgroundColor: "rgba(230,240,255,0.85)",

//     shadowColor: "#0d6efd",
//     shadowOpacity: 0.16,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//     // elevation: 6,
//     marginBottom: 2
//   },

//   item: {
//     width: 34,
//     height: 34,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     marginHorizontal: 3,
//   },

//   activeItem: {
//     backgroundColor: colors.backgroundColorHeader,

//     shadowColor: "#0d6efd",
//     shadowOpacity: Platform.OS === "ios" ? 0.35 : 0.25,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 4,
//   },
// });


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 2, // ↓ from 4
    borderRadius: 10, // ↓ from 14
    backgroundColor: "rgba(230,240,255,0.85)",
    shadowColor: "#0d6efd",
    shadowOpacity: 0.12, // slightly lighter
    shadowRadius: 6, // ↓ from 10
    shadowOffset: { width: 0, height: 4 },
    // elevation: 4,
    marginBottom: 2,
  },

  item: {
    width: 28, // ↓ from 34
    height: 28, // ↓ from 34
    borderRadius: 8, // ↓ from 10
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2, // ↓ from 3
  },

  activeItem: {
    backgroundColor: colors.backgroundColorHeader,
    shadowColor: "#0d6efd",
    shadowOpacity: Platform.OS === "ios" ? 0.3 : 0.2,
    shadowRadius: 5, // ↓ from 8
    shadowOffset: { width: 0, height: 3 },
    elevation: 3, // ↓ from 4
  },
});
