import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/ThemeContext';
import PinProtectedScreen from '@/components/SecretPage/PinProtectedScreen';
import PageHeader from '@/components/Common/PageHeader';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { checkModelExists, downloadModel, loadModel, releaseModel } from '@/functions/AIModelManager';
import { buildContextPrompt } from '@/functions/AIPromptBuilder';

export default function ChatbotScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    
    const [modelExists, setModelExists] = useState<boolean | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const [messages, setMessages] = useState<{role: 'user'|'assistant', text: string}[]>([]);
    const [inputText, setInputText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        checkModelExists().then(exists => setModelExists(exists));

        const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            releaseModel();
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadModel((progress) => setDownloadProgress(progress));
            setModelExists(true);
        } catch (e) {
            alert("Download failed.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || isGenerating) return;
        
        const userMsg = inputText.trim();
        setInputText('');
        setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
        setIsGenerating(true);

        try {
            const context = await loadModel();
            const systemPrompt = await buildContextPrompt();
            
            // Format for Qwen / ChatML format
            let prompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n`;
            
            // Append previous messages
            const recentMsgs = messages.slice(-4);
            recentMsgs.forEach(msg => {
                prompt += `<|im_start|>${msg.role === 'user' ? 'user' : 'assistant'}\n${msg.text}<|im_end|>\n`;
            });
            prompt += `<|im_start|>user\n${userMsg}<|im_end|>\n<|im_start|>assistant\n`;

            setMessages(prev => [...prev, {role: 'assistant', text: ''}]);
            
            await context.completion({
                prompt,
                n_predict: 200,
                temperature: 0.7,
                top_p: 0.9,
            }, (res) => {
                setMessages(prev => {
                    const newMessages = [...prev];
                    const last = newMessages[newMessages.length - 1];
                    last.text += res.token;
                    return newMessages;
                });
            });

        } catch (e: any) {
            console.error(e);
            setMessages(prev => [...prev, {role: 'assistant', text: 'Error generating response.'}]);
        } finally {
            setIsGenerating(false);
        }
    };

    if (modelExists === null) return null;

    const innerContent = (
        <>
            <PageHeader title="Local AI" navigation={navigation} />
                
                {!modelExists ? (
                    <View style={styles.downloadContainer}>
                        <Ionicons name="hardware-chip-outline" size={64} color={colors.green} />
                        <Text style={[styles.downloadTitle, { color: colors.text }]}>Local AI Model Required</Text>
                        <Text style={[styles.downloadDesc, { color: colors.text }]}>
                            To chat with your notes offline, you need to download the AI model (~398MB).
                        </Text>
                        
                        {isDownloading ? (
                            <View style={styles.progressContainer}>
                                <Text style={{ color: colors.text }}>Downloading: {(downloadProgress * 100).toFixed(1)}%</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${downloadProgress * 100}%`, backgroundColor: colors.green }]} />
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: colors.green }]} onPress={handleDownload}>
                                <Text style={styles.downloadBtnText}>Download Model</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.chatContainer}>
                        <ScrollView 
                            ref={scrollViewRef}
                            contentContainerStyle={styles.scrollContent}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({animated: true})}
                        >
                            <Text style={styles.welcomeText}>
                                Chat with your Notes, Secrets, and Diary. (Running 100% locally)
                            </Text>
                            
                            {messages.map((msg, idx) => (
                                <View key={idx} style={[
                                    styles.messageBubble, 
                                    msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                                    msg.role === 'user' ? { backgroundColor: colors.green } : { backgroundColor: '#333' }
                                ]}>
                                    <Text style={styles.messageText}>{msg.text}</Text>
                                </View>
                            ))}
                            {isGenerating && (
                                <ActivityIndicator size="small" color={colors.green} style={{alignSelf: 'flex-start', marginLeft: 16, marginTop: 8}}/>
                            )}
                        </ScrollView>
                        
                        <View style={[
                            styles.inputContainer, 
                            Platform.OS === 'android' && { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 24 : 24 }
                        ]}>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: '#444' }]}
                                placeholder="Ask something..."
                                placeholderTextColor="#888"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity 
                                style={[styles.sendBtn, { backgroundColor: inputText.trim() && !isGenerating ? colors.green : '#555' }]} 
                                onPress={handleSend}
                                disabled={!inputText.trim() || isGenerating}
                            >
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
        </>
    );

    return (
        <PinProtectedScreen title="AI Chatbot">
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                {Platform.OS === 'ios' ? (
                    <KeyboardAvoidingView 
                        style={{ flex: 1, backgroundColor: colors.background }} 
                        behavior="padding"
                        keyboardVerticalOffset={90}
                    >
                        {innerContent}
                    </KeyboardAvoidingView>
                ) : (
                    innerContent
                )}
            </SafeAreaView>
        </PinProtectedScreen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    downloadContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    downloadTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    downloadDesc: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
        marginBottom: 32,
    },
    downloadBtn: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 24,
    },
    downloadBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBarBg: {
        width: '100%',
        height: 12,
        backgroundColor: '#333',
        borderRadius: 6,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
    },
    chatContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    welcomeText: {
        color: '#888',
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 13,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: 24,
        backgroundColor: '#1a1a1a',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        marginRight: 8,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
