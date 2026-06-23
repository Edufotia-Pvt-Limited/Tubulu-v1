
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../Utils/Colors';
import useKeyboardState from '../../hooks/useKeyboardState';

interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
}

interface FilterCategory {
  id: string;
  title: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: FilterCategory[];
  onApplyFilters: (updatedFilters: FilterCategory[]) => void;
  onRemoveFilters: (updatedFilters: FilterCategory[]) => void;
}

function CatalogueFilterModal({ visible, onClose, filters, onApplyFilters, onRemoveFilters }: Props) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const isKeyboardOpen = useKeyboardState();


  const resetFilters = () => {
    const resetFilterOptions = filters.map(category => ({
      ...category,
      options: category.options.map(opt => ({
        ...opt,
        selected: false,
      })),
    }));

    setLocalFilters(resetFilterOptions);
    onRemoveFilters(resetFilterOptions);
  };

  const toggleOption = (categoryId: string, optionId: string) => {
    setLocalFilters(currentFilters =>
      currentFilters.map(cat => {
        if (cat.id !== categoryId) return cat;
        if (cat.multiSelect) {
          return {
            ...cat,
            options: cat.options.map(opt =>
              opt.id === optionId ? { ...opt, selected: !opt.selected } : opt,
            ),
          };
        } else {
          return {
            ...cat,
            options: cat.options.map(opt => ({
              ...opt,
              selected: opt.id === optionId,
            })),
          };
        }
      }),
    );
  };

  const renderOption = (category: FilterCategory, option: FilterOption) => {
    const isRadio = !category.multiSelect;
    return (
      <TouchableOpacity
        key={option.id}
        style={styles.optionRow}
        onPress={() => toggleOption(category.id, option.id)}
      >
        <View style={[styles.radioOuter, option.selected && styles.radioOuterSelected]}>
          {option.selected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.optionLabel}>{option.label}</Text>
      </TouchableOpacity>
    );
  };

  const selectedCategory = localFilters[selectedCategoryIndex];

  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      propagateSwipe
      backdropOpacity={0.7}
      deviceHeight={Dimensions.get('screen').height}
      deviceWidth={Dimensions.get('screen').width}
      coverScreen={true}
      statusBarTranslucent
      hideModalContentWhileAnimating

    >
      <View
        style={[
          styles.container,
          {
            maxHeight:
              Platform.OS === 'ios'
                ? Dimensions.get('window').height * 0.9
                : Dimensions.get('window').height * 0.9,
          },
        ]}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filter</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={28} color={colors.titleBlackColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.bodyRow}>
          {/* Sidebar navigation */}
          <View style={styles.sidebar}>
            {localFilters.map((cat, i) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.sidebarTab,
                  selectedCategoryIndex === i && styles.sidebarTabActive,
                ]}
                onPress={() => setSelectedCategoryIndex(i)}
              >
                <Text
                  style={[
                    styles.sidebarTabText,
                    selectedCategoryIndex === i && styles.sidebarTabTextActive,
                  ]}
                >
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Right side options */}
          <ScrollView style={styles.optionsScrollView}>
            <Text style={styles.categoryTitle}>{selectedCategory.title === "Sort" ? "SORT BY" : selectedCategory.title.toUpperCase()}</Text>
            {selectedCategory.options.map(opt => renderOption(selectedCategory, opt))}
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={resetFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => onApplyFilters(localFilters)}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ReactNativeModal>
  );
}


const highlightColor = colors.backgroundColorHeader || '#ff6e40';

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 0,
    width: Dimensions.get('screen').width,
    alignSelf: 'center',

    height: Dimensions.get('window').height * 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.titleBlackColor,
  },
  bodyRow: {
    flexDirection: 'row',
    flex: 1,
    minHeight: 270,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  sidebar: {
    width: 120,
    backgroundColor: '#fafafa',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingTop: 10,
  },
  sidebarTab: {
    paddingVertical: 12,
    paddingLeft: 18,
    borderLeftWidth: 4,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  sidebarTabActive: {
    borderLeftColor: highlightColor,
    backgroundColor: '#fff',
  },
  sidebarTabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  sidebarTabTextActive: {
    color: colors.titleBlackColor,
    fontWeight: 'bold',
  },
  optionsScrollView: {
    flex: 1,
    padding: 18,
  },
  categoryTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 16,
    color: '#222',
    letterSpacing: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: highlightColor,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: highlightColor,
  },
  optionLabel: {
    fontSize: 15,
    color: '#161616',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  clearButtonText: {
    color: '#aaa',
    fontWeight: '700',
    fontSize: 15,
  },
  applyButton: {
    backgroundColor: highlightColor,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 38,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CatalogueFilterModal;
