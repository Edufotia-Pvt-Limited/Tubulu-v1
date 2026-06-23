import React from 'react';
import {
  GestureResponderEvent,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../Utils/Colors';
import {QTMAvatar} from './QTMMemberCard';

interface QTMTopicCardProps {
  fullMode?: boolean;
  topic: string;
  imagrUri?: string;
  totalTasks?: number;
  overdue?: number;
  onPress: () => void;
  onPressMenu: (event: GestureResponderEvent) => void;
  selected?: boolean;
}

export function QTMTopicCard({
  fullMode,
  topic,
  imagrUri,
  totalTasks,
  overdue,
  onPress,
  onPressMenu,
  selected,
}: QTMTopicCardProps): JSX.Element {
  const width = useWindowDimensions().width / 3 - 20;
  return (
    <TouchableOpacity
      style={{
        ...styles.container,
        width: fullMode ? width : 157,
        borderColor: selected
          ? colors.showMoreBlueColor
          : colors.inputBorderGrey,
      }}
      onPress={onPress}>
      <View
        style={{
          // marginTop: 20,
          alignItems: 'center',
          flex: 1,
        }}>
        <View style={styles.imageContainer}>
          {imagrUri !== '' ? (
            <Image
              style={{height: 36, width: 36, borderRadius: 50}}
              source={{uri: imagrUri}}
            />
          ) : (
            <QTMAvatar firstName={topic} lastName={topic?.split?.(' ')[1]} />
          )}
        </View>
        <Pressable
          style={{position: 'absolute', right: 0, top: 6}}
          onPress={onPressMenu}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={colors.backgroundColorHeader}
          />
        </Pressable>
        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.topicText}>
          {topic}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: 20,
          }}>
          {totalTasks !== undefined && totalTasks > 0 && (
            <Text style={styles.text}>{`Total ${totalTasks} task`} |</Text>
          )}
        </View>
        <View style={{}}>
          {overdue !== undefined && overdue > 0 && (
            <Text
              style={{
                color: colors.errorRed,
                fontSize: 13,
                fontWeight: '400',
              }}>
              {`${overdue} Overdue`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundWhite,
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    height: 124,
    borderColor: colors.inputBorderGrey,
    // borderWidth: 0.5,
    borderRadius: 10,
    elevation: 5,
    margin: 8,
  },
  imageContainer: {
    height: 40,
    width: 40,
    marginTop: 17,
    borderRadius: 50,
    borderWidth: 0.54,
    borderColor: '#8A8A8E',
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadTextContainer: {
    backgroundColor: colors.errorRed,
    borderRadius: 113,
    height: 24,
    width: 24,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicText: {
    fontSize: 16,
    fontWeight: '700',
    maxWidth: 100,
    color: colors.titleBlackColor,
    marginBottom: 1,
  },
  text: {
    fontWeight: '400',
    fontSize: 12,
    width: 78,
    color: colors.textColorGray,
  },
});
