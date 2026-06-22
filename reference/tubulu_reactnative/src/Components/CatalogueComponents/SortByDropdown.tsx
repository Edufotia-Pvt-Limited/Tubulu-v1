import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import { colors } from '../../Utils/Colors';

interface SortOption {
  id: string;
  label: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: SortOption) => void;
  selectedOptionId: string;
  sortOptions: SortOption[];
}

const screenWidth = Dimensions.get('window').width;

export default function SortByDropdown({
  visible,
  onClose,
  onSelect,
  selectedOptionId,
  sortOptions,
}: Props) {
  const renderItem = ({ item }: { item: SortOption }) => {
    const selected = item.id === selectedOptionId;

    return (
      <TouchableOpacity
        onPress={() => {
          onSelect(item);
          onClose();
        }}
        style={[styles.optionRow, selected && styles.optionRowSelected]}
      >
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.container}>
        <Text style={styles.title}>Sort By</Text>
        <FlatList
          data={sortOptions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          extraData={selectedOptionId}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000055',
  },
  container: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    width: screenWidth * 0.6,
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, 
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.titleBlackColor,
  },
  list: {
    maxHeight: 250,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 2,
    marginVertical: 4,
  },
  optionRowSelected: {
    backgroundColor: '#E9F4FF',
    borderRadius: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: colors.backgroundColorHeader,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.backgroundColorHeader,
  },
  optionLabel: {
    fontSize: 15,
    color: '#555',
  },
  optionLabelSelected: {
    color: colors.backgroundColorHeader,
    fontWeight: '600',
  },
});
