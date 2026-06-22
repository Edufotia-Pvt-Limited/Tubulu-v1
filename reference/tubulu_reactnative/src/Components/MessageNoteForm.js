import { Button, TextArea } from 'native-base';
import React, { useState } from 'react';
import {
  Keyboard,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../Utils/Colors';

export function MessageNoteForm({
  onSave,
  onClose,
  integrationName,
  message,
  defaultNote,
}) {
  const [noteMessage, setNoteMessage] = useState(
    defaultNote?.noteMessage ?? '',
  );

  return (
    <TouchableOpacity
      onPress={onClose}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        backgroundColor: '#00000066',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          minHeight: 420,
          paddingBottom: 20,
          width: '88%',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 20,
          backgroundColor: colors.backgroundWhite,
        }}>
        <Pressable onPress={Keyboard.dismiss}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'black',
                }}>
                {defaultNote ? 'Edit' : 'Add'} Note
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MIcon style={{ fontSize: 24, color: 'black' }} name="close" />
            </TouchableOpacity>
          </View>
          <View style={{}}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                marginTop: 20,
                color: 'rgba(0, 14, 77, 0.3)',
              }}>
              {integrationName ?? 'Integration'}
            </Text>
            <View
              style={{
                maxHeight: 100,
                width: '100%',
                borderColor: 'rgba(76, 130, 246, 0.15)',
                borderWidth: 1,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                marginTop: 8,
                padding: 16,
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 14,
                  fontWeight: '400',
                  overflow: 'hidden',
                }}>
                {message ?? 'Message'}
              </Text>
            </View>
          </View>
          <View style={{ height: 20 }} />
          <TextArea
            style={{
              borderRadius: 20,
              marginTop: 20,
            }}
            multiline
            h={140}
            maxLength={100}
            value={noteMessage}
            placeholder={'Enter a note here'}
            onChangeText={setNoteMessage}
          />
          <View
            style={{
              marginTop: 40,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Button
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 20,
                borderColor: '#D0D5DD',
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#344054',
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                Cancel
              </Text>
            </Button>
            <Button
              onPress={() => {
                onSave(noteMessage);
              }}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                height: 44,
                backgroundColor: '#2355C4',
                borderRadius: 20,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                Save Note
              </Text>
            </Button>
          </View>
        </Pressable>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
