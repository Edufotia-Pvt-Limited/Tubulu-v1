import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { processAiChat } from '../Utils/ApiActions';
import { useNavigation } from '@react-navigation/native';

const Assistant = ({ route }) => {
    const { integrationId, integrationName } = route.params || {};
    
    const [messages, setMessages] = useState([
        { 
            id: '1', 
            text: `Hi! I am the AI Assistant for ${integrationName || 'Tubulu'}. How can I help you with our products or services today?`, 
            sender: 'ai' 
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [quickActions] = useState([
        "What do you sell?",
        "Where are you located?",
        "How can I contact you?",
        "Tell me about your business"
    ]);
    const flatListRef = useRef(null);
    const navigation = useNavigation();

    const sendMessage = async (overrideInput) => {
        const messageToSend = overrideInput || input;
        if (!messageToSend.trim()) return;

        const userMessage = { id: Date.now().toString(), text: messageToSend, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        if (!overrideInput) setInput('');
        setLoading(true);

        try {
            // Prepare history for Gemini (excluding the current message which is sent as 'message' param)
            const history = messages.slice(1).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));

            const response = await processAiChat(messageToSend, history, integrationId);
            const aiMessage = { 
                id: (Date.now() + 1).toString(), 
                text: response.data.reply, 
                sender: 'ai' 
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { 
                id: (Date.now() + 1).toString(), 
                text: "I am having trouble connecting right now. Please check your internet and try again.", 
                sender: 'ai',
                error: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderQuickActions = () => {
        if (messages.length > 2) return null; // Hide after first exchange
        return (
            <View style={styles.quickActionsContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={quickActions}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.chip} 
                            onPress={() => sendMessage(item)}
                        >
                            <Text style={styles.chipText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item}
                />
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <View style={[
            styles.messageContainer,
            item.sender === 'user' ? styles.userMessage : styles.aiMessage,
            item.error && { backgroundColor: '#FFF5F5', borderColor: '#FED7D7', borderWidth: 1 }
        ]}>
            <Text style={[
                styles.messageText,
                item.sender === 'user' ? styles.userText : styles.aiText,
                item.error && { color: '#C53030' }
            ]}>{item.text}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-left" size={32} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{integrationName || 'Tubulu AI'}</Text>
                    <Text style={styles.headerSubtitle}>Always here to help</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListFooterComponent={() => (
                    <>
                        {loading && (
                            <View style={styles.aiMessageLoading}>
                                <ActivityIndicator size="small" color="#007AFF" />
                                <Text style={styles.loadingText}>AI is thinking...</Text>
                            </View>
                        )}
                        {renderQuickActions()}
                    </>
                )}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type your question..."
                        placeholderTextColor="#999"
                        multiline
                    />
                    <TouchableOpacity 
                        style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]} 
                        onPress={() => sendMessage()}
                        disabled={!input.trim() || loading}
                    >
                        <Icon name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageContainer: {
        maxWidth: '85%',
        padding: 14,
        borderRadius: 18,
        marginBottom: 10,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 2,
    },
    aiMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    aiMessageLoading: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 18,
        borderBottomLeftRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: '#1A1A1A',
    },
    quickActionsContainer: {
        marginTop: 10,
        paddingLeft: 4,
    },
    chip: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    chipText: {
        color: '#007AFF',
        fontSize: 13,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 15,
        maxHeight: 100,
        color: '#000',
    },
    sendButton: {
        backgroundColor: '#007AFF',
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D1D6',
        elevation: 0,
        shadowOpacity: 0,
    },
    loadingText: {
        marginLeft: 8,
        color: '#8E8E93',
        fontSize: 13,
    }
});

export default Assistant;
