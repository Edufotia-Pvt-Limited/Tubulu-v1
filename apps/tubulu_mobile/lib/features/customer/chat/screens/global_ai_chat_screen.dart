import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:dio/dio.dart' as d;
import '../../../../core/api/api_provider.dart';
import '../../../../core/providers/preferences_provider.dart';
import '../../../../core/auth/auth_provider.dart';
import '../widgets/voice_message_bubble.dart';

class GlobalAIChatScreen extends ConsumerStatefulWidget {
  const GlobalAIChatScreen({super.key});

  @override
  ConsumerState<GlobalAIChatScreen> createState() => _GlobalAIChatScreenState();
}

class _GlobalAIChatScreenState extends ConsumerState<GlobalAIChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  bool _isTyping = false;

  // Speech to Text state variables
  final stt.SpeechToText _speechToText = stt.SpeechToText();
  bool _speechEnabled = false;
  bool _isListening = false;

  String _getStorageKey() {
    final authState = ref.read(authProvider);
    final userId = authState.userId ?? authState.phoneNumber ?? 'anonymous';
    return 'tubulu_vibe_chat_history_$userId';
  }

  @override
  void initState() {
    super.initState();
    _loadHistory();
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    try {
      _speechEnabled = await _speechToText.initialize(
        onStatus: (status) {
          debugPrint('[SPEECH] Status: $status');
          if (status == 'done' || status == 'notListening') {
            if (mounted && _isListening) {
              setState(() {
                _isListening = false;
              });
            }
          }
        },
        onError: (errorNotification) {
          debugPrint('[SPEECH] Error: $errorNotification');
          if (mounted && _isListening) {
            setState(() {
              _isListening = false;
            });
          }
        },
      );
      if (mounted) {
        setState(() {});
      }
    } catch (e) {
      debugPrint('[SPEECH] Initialization error: $e');
    }
  }

  Future<void> _loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final storedHistory = prefs.getString(_getStorageKey());
    if (storedHistory != null) {
      try {
        final List<dynamic> decoded = jsonDecode(storedHistory);
        setState(() {
          _messages = decoded.map((e) => Map<String, dynamic>.from(e)).toList();
        });
        _scrollToBottom();
      } catch (_) {
        _initializeDefaultGreeting();
      }
    } else {
      _initializeDefaultGreeting();
    }
  }

  void _initializeDefaultGreeting() {
    setState(() {
      _messages = [
        {'role': 'assistant', 'content': 'Hi! I am Tubulu Vibe. How can I help you?'}
      ];
    });
    _saveHistory();
  }

  Future<void> _saveHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_getStorageKey(), jsonEncode(_messages));
  }

  @override
  void dispose() {
    _speechToText.stop();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handlePaste() async {
    final data = await Clipboard.getData('text/plain');
    if (data != null && data.text != null) {
      final currentText = _messageController.text;
      final selection = _messageController.selection;
      if (selection.isValid) {
        final newText = currentText.replaceRange(selection.start, selection.end, data.text!);
        _messageController.value = TextEditingValue(
          text: newText,
          selection: TextSelection.collapsed(offset: selection.start + data.text!.length),
        );
      } else {
        _messageController.text = currentText + data.text!;
      }
    }
  }

  Future<void> _startListening() async {
    try {
      var speechStatus = await Permission.speech.request();
      var micStatus = await Permission.microphone.request();
      
      if (!speechStatus.isGranted || !micStatus.isGranted) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Speech recognition and microphone permissions are required.')),
          );
        }
        return;
      }

      if (!_speechEnabled) {
        await _initSpeech();
      }

      if (_speechEnabled) {
        setState(() {
          _isListening = true;
        });
        await _speechToText.listen(
          onResult: (result) {
            if (mounted) {
              setState(() {
                _messageController.text = result.recognizedWords;
                _messageController.selection = TextSelection.fromPosition(
                  TextPosition(offset: _messageController.text.length),
                );
              });
            }
          },
        );
      } else {
        debugPrint('[SPEECH] Speech to text not enabled / initialized');
      }
    } catch (e) {
      debugPrint('[SPEECH] Error starting listening: $e');
      if (mounted) {
        setState(() {
          _isListening = false;
        });
      }
    }
  }

  Future<void> _stopListening() async {
    try {
      await _speechToText.stop();
      if (mounted) {
        setState(() {
          _isListening = false;
        });
      }
    } catch (e) {
      debugPrint('[SPEECH] Error stopping listening: $e');
    }
  }

  Future<void> _handleSend() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _isTyping = true;
    });
    _saveHistory();
    _messageController.clear();
    _scrollToBottom();

    try {
      final dio = ref.read(dioProvider);
      final history = _messages.where((m) => _messages.indexOf(m) > 0).toList();
      final userPrefs = ref.read(preferencesProvider);

      final response = await dio.post('/ai/global-chat', data: {
        'message': text,
        'history': history,
        'latitude': userPrefs.lat,
        'longitude': userPrefs.lng,
      });

      if (mounted) {
        final responseData = response.data['data'];
        final String reply;
        final List<dynamic> storeCards;

        if (responseData is Map) {
          reply = responseData['reply'] ?? responseData['message'] ?? "I'm sorry, I couldn't process that.";
          storeCards = List<dynamic>.from(responseData['storeCards'] ?? []);
        } else {
          reply = responseData?.toString() ?? "I'm sorry, I couldn't process that.";
          storeCards = [];
        }

        setState(() {
          _messages.add({'role': 'assistant', 'content': reply, 'storeCards': storeCards});
          _isTyping = false;
        });
        _saveHistory();
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add({
            'role': 'assistant',
            'content': "I'm having trouble connecting right now. Please try again!",
          });
          _isTyping = false;
        });
        _saveHistory();
        _scrollToBottom();
      }
    }
  }

  void _openStore(String storeId, String storeName) {
    context.push('/customer/catalogue', extra: {
      'id': storeId,
      'integrationName': storeName,
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Tubulu Vibe', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: theme.appBarTheme.backgroundColor,
        foregroundColor: theme.appBarTheme.foregroundColor,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_sweep, size: 22),
            tooltip: 'Clear Chat',
            onPressed: () {
              setState(() => _messages.clear());
              _initializeDefaultGreeting();
            },
          )
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg['role'] == 'user';
                final storeCards = msg['storeCards'] as List<dynamic>? ?? [];
                final audioUrl = msg['audioUrl'] as String?;
                return Column(
                  crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                  children: [
                    if (audioUrl != null)
                      VoiceMessageBubble(
                        audioUrl: audioUrl,
                        isMe: isUser,
                        transcription: msg['content'] as String?,
                      )
                    else
                      _buildBubble(msg['content'] as String? ?? '', isUser),
                    if (!isUser && storeCards.isNotEmpty) _buildStoreCards(storeCards),
                  ],
                );
              },
            ),
          ),
          if (_isTyping)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 6),
              child: Text(
                'Tubulu Vibe is thinking...',
                style: TextStyle(fontSize: 12, color: Colors.grey, fontStyle: FontStyle.italic),
              ),
            ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildBubble(String text, bool isUser) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final linkColor = isUser
        ? (isDark ? Colors.blue.shade200 : Colors.yellowAccent)
        : (isDark ? theme.colorScheme.primary : Colors.blue.shade700);

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        decoration: BoxDecoration(
          color: isUser
              ? theme.colorScheme.primary
              : (isDark ? Colors.grey[850]! : Colors.grey.shade100),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isUser ? 18 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 18),
          ),
        ),
        child: LinkableMessageText(
          text: text,
          isUser: isUser,
          linkColor: linkColor,
          onStoreTap: _openStore,
        ),
      ),
    );
  }

  Widget _buildStoreCards(List<dynamic> storeCards) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 12),
      child: SizedBox(
        height: 125,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.only(right: 4),
          itemCount: storeCards.length,
          separatorBuilder: (_, __) => const SizedBox(width: 10),
          itemBuilder: (context, index) {
            final card = storeCards[index] is Map
                ? Map<String, dynamic>.from(storeCards[index] as Map)
                : <String, dynamic>{};
            final id   = card['id']   as String? ?? '';
            final name = card['name'] as String? ?? 'Store';
            final city = card['city'] as String?;
            final cat  = card['category'] as String?;

            return GestureDetector(
              onTap: () => _openStore(id, name),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                width: 165,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isDark
                        ? [theme.colorScheme.primary.withOpacity(0.28), theme.colorScheme.secondary.withOpacity(0.14)]
                        : [theme.colorScheme.primary.withOpacity(0.10), theme.colorScheme.secondary.withOpacity(0.05)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: theme.colorScheme.primary.withOpacity(0.35), width: 1.2),
                  boxShadow: [
                    BoxShadow(
                      color: theme.colorScheme.primary.withOpacity(0.08),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.storefront_rounded, size: 15, color: theme.colorScheme.primary),
                        const SizedBox(width: 5),
                        Expanded(
                          child: Text(
                            name,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    if (city != null || cat != null)
                      Text(
                        [if (cat != null) cat, if (city != null) city].join(' · '),
                        style: TextStyle(fontSize: 10.5, color: theme.hintColor),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'View Store →',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.black : Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: theme.cardColor,
        border: Border(top: BorderSide(color: theme.dividerColor)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            // ── Listening in progress ──────────────────────────────────────
            if (_isListening)
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50.withOpacity(isDark ? 0.1 : 0.8),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.red.shade300.withOpacity(0.5)),
                  ),
                  child: const Row(
                    children: [
                      _FlashingRecordDot(),
                      SizedBox(width: 8),
                      Text(
                        'Listening... Speak now',
                        style: TextStyle(
                            color: Colors.redAccent,
                            fontWeight: FontWeight.bold,
                            fontSize: 14),
                      ),
                      Spacer(),
                    ],
                  ),
                ),
              )
            // ── Normal text input ──────────────────────────────────────────
            else
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: theme.scaffoldBackgroundColor,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: CallbackShortcuts(
                    bindings: {
                      const SingleActivator(LogicalKeyboardKey.keyV,
                          control: true): _handlePaste,
                      const SingleActivator(LogicalKeyboardKey.keyV,
                          meta: true): _handlePaste,
                    },
                    child: TextField(
                      controller: _messageController,
                      maxLines: null,
                      minLines: 1,
                      enableInteractiveSelection: true,
                      selectionControls: MaterialTextSelectionControls(),
                      keyboardType: TextInputType.multiline,
                      style: TextStyle(color: theme.textTheme.bodyLarge?.color),
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        hintStyle: TextStyle(color: theme.hintColor),
                        border: InputBorder.none,
                        contentPadding:
                            const EdgeInsets.symmetric(vertical: 12),
                        suffixIcon: IconButton(
                          icon: Icon(Icons.paste_rounded,
                              size: 20, color: theme.hintColor),
                          onPressed: _handlePaste,
                          tooltip: 'Paste from clipboard',
                        ),
                      ),
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                ),
              ),
            const SizedBox(width: 12),
            // ── Right action button ────────────────────────────────────────
            if (_isListening)
              CircleAvatar(
                backgroundColor: Colors.redAccent,
                child: IconButton(
                  icon: const Icon(Icons.stop, color: Colors.white, size: 20),
                  onPressed: _stopListening,
                ),
              )
            else
              ValueListenableBuilder<TextEditingValue>(
                valueListenable: _messageController,
                builder: (context, value, child) {
                  final isNotEmpty = value.text.trim().isNotEmpty;
                  if (isNotEmpty) {
                    return CircleAvatar(
                      backgroundColor: theme.colorScheme.primary,
                      child: IconButton(
                        icon: Icon(Icons.send,
                            color: isDark ? Colors.black : Colors.white,
                            size: 20),
                        onPressed: _handleSend,
                      ),
                    );
                  } else {
                    return CircleAvatar(
                      backgroundColor:
                          theme.colorScheme.primary.withOpacity(0.15),
                      child: IconButton(
                        icon: Icon(Icons.mic,
                            color: theme.colorScheme.primary, size: 20),
                        onPressed: _startListening,
                      ),
                    );
                  }
                },
              ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Linkable text widget: parses [Name](store:UUID) and bare store:UUID patterns
// ─────────────────────────────────────────────────────────────────────────────
class LinkableMessageText extends StatefulWidget {
  final String text;
  final bool isUser;
  final Color linkColor;
  final void Function(String storeId, String storeName)? onStoreTap;

  const LinkableMessageText({
    super.key,
    required this.text,
    required this.isUser,
    required this.linkColor,
    this.onStoreTap,
  });

  @override
  State<LinkableMessageText> createState() => _LinkableMessageTextState();
}

class _LinkableMessageTextState extends State<LinkableMessageText> {
  final List<TapGestureRecognizer> _recognizers = [];

  @override
  void dispose() {
    for (final r in _recognizers) r.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    for (final r in _recognizers) r.dispose();
    _recognizers.clear();

    // Matches [Name](store:UUID) OR bare store:UUID
    final RegExp re = RegExp(
      r'\[([^\]]+)\]\s*\(\s*(store:[^\s)]+)\s*\)|store:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
      caseSensitive: false,
    );

    final List<InlineSpan> spans = [];
    int lastIndex = 0;

    for (final match in re.allMatches(widget.text)) {
      if (match.start > lastIndex) {
        spans.add(TextSpan(text: widget.text.substring(lastIndex, match.start)));
      }

      final String label;
      final String storeId;
      if (match.group(1) != null) {
        label   = match.group(1)!.trim();
        storeId = match.group(2)!.replaceFirst(RegExp(r'^store:', caseSensitive: false), '').trim();
      } else {
        storeId = match.group(3)!.trim();
        label   = 'View Store';
      }

      final recognizer = TapGestureRecognizer()
        ..onTap = () => widget.onStoreTap?.call(storeId, label);
      _recognizers.add(recognizer);

      spans.add(TextSpan(
        text: label,
        style: TextStyle(
          color: widget.linkColor,
          decoration: TextDecoration.underline,
          fontWeight: FontWeight.bold,
        ),
        recognizer: recognizer,
      ));
      lastIndex = match.end;
    }

    if (lastIndex < widget.text.length) {
      spans.add(TextSpan(text: widget.text.substring(lastIndex)));
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SelectableText.rich(
      TextSpan(
        children: spans,
        style: TextStyle(
          color: widget.isUser
              ? (isDark ? Colors.black : Colors.white)
              : (isDark ? Colors.white70 : Colors.black87),
          fontSize: 15,
          height: 1.45,
        ),
      ),
    );
  }
}

class _FlashingRecordDot extends StatefulWidget {
  const _FlashingRecordDot();

  @override
  State<_FlashingRecordDot> createState() => _FlashingRecordDotState();
}

class _FlashingRecordDotState extends State<_FlashingRecordDot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller,
      child: const Icon(Icons.fiber_manual_record, color: Colors.redAccent, size: 14),
    );
  }
}
