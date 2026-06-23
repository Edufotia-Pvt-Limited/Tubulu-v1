import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {colors} from '../Utils/Colors';
import FAIcon from 'react-native-vector-icons/FontAwesome'

export function ChatBubbleOptions({
                                      top,
                                      right,
                                      onClose,
                                      chatMessageType,
                                      onCopyMessage,
                                      onNewNote,
                                      existingNoteId,
                                      onDeleteNote,
                                      onEditNote,
                                      existingBookmarkId,
                                      onNewBookmark,
                                      onDeleteBookmark
                                  }) {
    return (
        <TouchableOpacity onPress={onClose} activeOpacity={1} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: '#00000066',
            width: '100%',
            height: '100%'
        }}>
            <View style={{
                position: 'absolute',
                top,
                right,
                backgroundColor: colors.backgroundWhite,
                borderRadius: 20,
                minHeight: 104,
                paddingHorizontal: 16,
                paddingTop: 8,
                minWidth: 264
            }}>
                {!!existingBookmarkId && <>
                    <TouchableOpacity
                        style={{height: 40, display: 'flex', alignItems: 'center', flexDirection: 'row'}}
                        onPress={() => {
                            onDeleteBookmark(existingBookmarkId)
                        }}
                    >
                        <FAIcon name={'bookmark'} style={{fontSize: 18, color: colors.errorRed}}/>
                        <Text style={{fontSize: 15, marginLeft: 20, fontWeight: '400', color: colors.errorRed}}>Delete
                            Bookmark</Text>
                    </TouchableOpacity>
                    <View style={{marginTop: 4, backgroundColor: '#EFEFF0', height: 1, width: '100%'}}/>
                </>}
                {!existingBookmarkId && <>
                    <TouchableOpacity
                        style={{height: 40, display: 'flex', alignItems: 'center', flexDirection: 'row'}}
                        onPress={onNewBookmark}
                    >
                        <FAIcon name={'bookmark'} style={{fontSize: 18, color: '#2355C4'}}/>
                        <Text style={{fontSize: 15, marginLeft: 20, fontWeight: '400', color: 'black'}}>Add
                            Bookmark</Text>
                    </TouchableOpacity>
                    <View style={{marginTop: 4, backgroundColor: '#EFEFF0', height: 1, width: '100%'}}/>
                </>}
                {!!existingNoteId && <><TouchableOpacity onPress={onEditNote} style={{
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>
                    <FAIcon name={'sticky-note'} style={{fontSize: 18, color: '#2355C4'}}/>
                    <Text style={{fontSize: 15, marginLeft: 20, fontWeight: '400', color: 'black'}}>Edit Note</Text>
                </TouchableOpacity>
                    <View style={{marginTop: 4, backgroundColor: '#EFEFF0', height: 1, width: '100%'}}/>
                </>}
                {!!existingNoteId && <><TouchableOpacity
                    onPress={() => {
                        onDeleteNote(existingNoteId)
                    }}
                    style={{height: 40, display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                    <FAIcon name={'sticky-note'} style={{fontSize: 18, color: colors.errorRed}}/>
                    <Text style={{fontSize: 15, marginLeft: 20, fontWeight: '400', color: colors.errorRed}}>Delete
                        Note</Text>
                </TouchableOpacity>
                    <View style={{marginTop: 4, backgroundColor: '#EFEFF0', height: 1, width: '100%'}}/>
                </>}
                {!existingNoteId && <><TouchableOpacity onPress={onNewNote} style={{
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>
                    <FAIcon name={'sticky-note'} style={{fontSize: 18, color: '#2355C4'}}/>
                    <Text style={{fontSize: 15, marginLeft: 20, fontWeight: '400', color: 'black'}}>Add Note</Text>
                </TouchableOpacity>
                {(chatMessageType === 'TEXT') && 
                    <View style={{marginTop: 4, backgroundColor: '#EFEFF0', height: 1, width: '100%'}}/>}
                </>
                }
                {(chatMessageType === 'TEXT') && 
                <>
                <TouchableOpacity onPress={onCopyMessage} style={{
                    marginTop: 4,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>
                    <FAIcon name={'sticky-note'} style={{fontSize: 18, color: '#2355C4'}}/>
                    <Text style={{fontSize: 15, marginLeft: 20, fontWeight: '400', color: 'black'}}>Copy Message</Text>
                </TouchableOpacity>
                <View style={{marginTop: 4, backgroundColor: '#EFEFF0', height: 1, width: '100%'}}/>
                    </>}
            </View>
        </TouchableOpacity>
    )
}
