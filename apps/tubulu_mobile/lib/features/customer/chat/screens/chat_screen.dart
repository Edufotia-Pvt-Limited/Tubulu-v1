import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:dio/dio.dart' as d;
import '../../../../core/api/api_provider.dart';
import '../../cart/providers/cart_provider.dart';
import '../widgets/store_feed_bottom_sheet.dart';
import '../../home/screens/home_screen.dart';
import '../widgets/voice_message_bubble.dart';

// ---------------------------------------------------------------------------
// Provider: fetch-or-create chatRoom for this user + merchant
// ---------------------------------------------------------------------------

final chatRoomProvider = FutureProvider.family.autoDispose<Map<String, dynamic>, String>((ref, merchantId) async {
  final dio = ref.watch(dioProvider);
  // ALWAYS start with new chat as requested
  final response = await dio.post('/chatRoom/createFresh', data: {
    'integrationId': merchantId,
  });
  return Map<String, dynamic>.from(response.data['data']);
});

final chatIntegrationProvider = FutureProvider.family.autoDispose<Map<String, dynamic>, String>((ref, merchantId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/integrations/byId/$merchantId');
  return Map<String, dynamic>.from(response.data['data']);
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ChatScreen extends ConsumerStatefulWidget {
  final String? merchantName;
  final String? merchantId;
  final String? chatRoomId;
  const ChatScreen({super.key, this.merchantName, this.merchantId, this.chatRoomId});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  bool _isLoadingMessages = true;
  bool _isPolling = false;

  Timer? _pollTimer;
  String? _resolvedRoomId;
  dynamic _dio;

  // Speech to Text state variables
  final stt.SpeechToText _speechToText = stt.SpeechToText();
  bool _speechEnabled = false;
  bool _isListening = false;

  final Set<String> _processedCartMessageIds = {};
  List<dynamic>? _cachedProducts;

  bool _getIsStoreClosed(Map<String, dynamic>? merchant) {
    if (merchant == null) return false;
    try {
      if (merchant['isSuspended'] == true) return true;
      if (merchant['isActive'] != true) return true;
      if (merchant['isApproved'] != true) return true;
      final openingHours = merchant['openingHours'];
      if (openingHours == null) return false;
      final now = DateTime.now();
      final days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      final dayName = days[now.weekday - 1];
      final dayConfig = openingHours[dayName];
      if (dayConfig == null) return false;
      if (dayConfig['isOpen'] == false) return true;
      
      final openStr = dayConfig['open'] as String?;
      final closeStr = dayConfig['close'] as String?;
      if (openStr == null || closeStr == null) return false;
      
      final openParts = openStr.split(':');
      final closeParts = closeStr.split(':');
      final openMinutes = int.parse(openParts[0]) * 60 + int.parse(openParts[1]);
      final closeMinutes = int.parse(closeParts[0]) * 60 + int.parse(closeParts[1]);
      final nowMinutes = now.hour * 60 + now.minute;
      
      return !(nowMinutes >= openMinutes && nowMinutes <= closeMinutes);
    } catch (e) {
      return false;
    }
  }

  void _updateUserStatus(String status) async {
    if (_dio == null) return;
    try {
      await _dio.put('/user/status', data: {'status': status});
    } catch (e) {
      debugPrint('Failed to update user presence to $status: $e');
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _speechToText.stop();
    _messageController.dispose();
    _scrollController.dispose();
    _updateUserStatus('offline');
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _dio = ref.read(dioProvider);
    _resolvedRoomId = widget.chatRoomId;
    if ((widget.chatRoomId == null || widget.chatRoomId!.isEmpty) && widget.merchantId == null) {
      _messages = [];
      _isLoadingMessages = false;
    }
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

  void _startPolling(String roomId) {
    if (_isPolling) return;
    _isPolling = true;
    _updateUserStatus('online');
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted) {
        _fetchMessages(roomId, isBackground: true);
      }
    });
  }

  Future<void> _fetchMessages(String roomId, {bool isBackground = false}) async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post('/chatMessage/chatRoomMessages', data: {'chatRoomId': roomId});
      final dynamic rawData = response.data['data'];
      
      if (mounted && rawData != null && rawData is List) {
        final newMessages = List<Map<String, dynamic>>.from(rawData);
        final bool hasNewMessages = newMessages.length > _messages.length;

        setState(() {
          _messages = newMessages;
          if (!isBackground) _isLoadingMessages = false;
        });
        
        _automaticallyProcessCartIntents(newMessages);
        
        if (hasNewMessages) {
          _scrollToBottom();
        }
      } else if (mounted && !isBackground) {
        setState(() {
          _isLoadingMessages = false;
        });
      }
    } catch (e) {
      if (mounted && !isBackground) {
        setState(() {
          _isLoadingMessages = false;
        });
      }
    }
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

  @override
  Widget build(BuildContext context) {
    if (widget.merchantId != null) {
      ref.watch(chatIntegrationProvider(widget.merchantId!));
    }
    if (_resolvedRoomId != null && _resolvedRoomId!.isNotEmpty) {
      if (_isLoadingMessages && _messages.isEmpty) {
        _fetchMessages(_resolvedRoomId!);
      }
      _startPolling(_resolvedRoomId!);
      return _buildChatScaffold(_resolvedRoomId!);
    }

    if (widget.merchantId == null) {
      return _buildChatScaffold(null);
    }

    final roomAsync = ref.watch(chatRoomProvider(widget.merchantId!));
    return roomAsync.when(
      data: (room) {
        final roomId = room['id']?.toString() ?? room['_id']?.toString() ?? '';
        _resolvedRoomId = roomId;
        if (roomId.isNotEmpty && _isLoadingMessages && _messages.isEmpty) {
          _fetchMessages(roomId);
        }
        if (roomId.isNotEmpty) {
          _startPolling(roomId);
        }
        return _buildChatScaffold(roomId.isNotEmpty ? roomId : null);
      },
      loading: () => Scaffold(
        appBar: _buildAppBar(),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => _buildChatScaffold(null),
    );
  }

  Widget _buildHeaderButton({
    required IconData icon,
    required VoidCallback onTap,
    Widget? badgeLabel,
    bool isBadgeVisible = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          shape: BoxShape.circle,
        ),
        child: Center(
          child: isBadgeVisible
              ? Badge(
                  label: badgeLabel,
                  child: Icon(icon, color: Colors.grey.shade800, size: 20),
                )
              : Icon(icon, color: Colors.grey.shade800, size: 20),
        ),
      ),
    );
  }

  AppBar _buildAppBar() {
    final integration = widget.merchantId != null
        ? ref.watch(chatIntegrationProvider(widget.merchantId!)).value
        : null;
    final isClosed = _getIsStoreClosed(integration);

    return AppBar(
      toolbarHeight: 70,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        onPressed: () {
          _updateUserStatus('offline');
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/customer/home');
          }
        },
      ),
      title: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          if (widget.merchantId != null) {
            final integrationAsync = ref.read(chatIntegrationProvider(widget.merchantId!));
            final integrationVal = integrationAsync.value;
            final merchantMap = {
              'id': widget.merchantId,
              'integrationName': widget.merchantName ?? (integrationVal?['integrationName'] ?? 'Store'),
              'category': integrationVal?['category'],
              'verticalType': integrationVal?['verticalType'],
              'logo': integrationVal?['logo'],
              'bannerImage': integrationVal?['bannerImage'],
              'isSuspended': integrationVal?['isSuspended'] ?? false,
              'isActive': integrationVal?['isActive'] ?? true,
              'isApproved': integrationVal?['isApproved'] ?? true,
              'openingHours': integrationVal?['openingHours'],
            };
            context.push('/customer/catalogue', extra: merchantMap);
          }
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.merchantName ?? 'Chat',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, height: 1.1),
            ),
            const SizedBox(height: 2),
            Text(
              isClosed ? 'Offline (Closed)' : 'Online',
              style: TextStyle(
                fontSize: 11,
                color: isClosed ? Colors.grey : Colors.green,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
      actions: [
        _buildHeaderButton(
          icon: Icons.campaign_outlined,
          onTap: () {
            if (widget.merchantId != null) {
              _showStoreFeedBottomSheet(context);
            }
          },
        ),
        const SizedBox(width: 8),
        _buildHeaderButton(
          icon: Icons.shopping_cart_outlined,
          isBadgeVisible: ref.watch(cartProvider).isNotEmpty,
          badgeLabel: Text(
            ref.watch(cartProvider).length.toString(),
            style: const TextStyle(color: Colors.white, fontSize: 10),
          ),
          onTap: () => context.push('/customer/cart'),
        ),
        const SizedBox(width: 8),
        Padding(
          padding: const EdgeInsets.only(right: 16.0),
          child: _buildHeaderButton(
            icon: Icons.explore_outlined,
            onTap: () => _showRecommendDialog(context),
          ),
        ),
      ],
    );
  }

  void _showStoreFeedBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StoreFeedBottomSheet(storeId: widget.merchantId ?? ''),
    );
  }

  Widget _buildChatScaffold(String? roomId) {
    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          _updateUserStatus('offline');
        }
      },
      child: Scaffold(
        appBar: _buildAppBar(),
        body: Column(
          children: [
            Expanded(child: _buildMessageArea(roomId)),
            _buildMessageInput(roomId),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageArea(String? roomId) {
    if (_isLoadingMessages && _messages.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    return _buildMessageList(_messages);
  }

  Widget _buildMessageList(List<Map<String, dynamic>> messages) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: messages.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) return _buildWelcomeMessage();
        final msg = messages[index - 1];
        final text = (msg['content'] ?? msg['message'] ?? '').toString();
        final sender = (msg['sender'] ?? msg['senderType'] ?? 'user').toString();
        final isMe = sender == 'user';
        final isAudio = (msg['type'] ?? msg['messageType'] ?? '').toString().toUpperCase() == 'AUDIO';

        if (isAudio) {
          return VoiceMessageBubble(audioUrl: text, isMe: isMe);
        } else {
          return _buildMessageBubble(text, isMe);
        }
      },
    );
  }

  Widget _buildWelcomeMessage() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0D47A1).withValues(alpha: 0.3) : Colors.blue.shade50,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            const Icon(Icons.security, size: 32, color: Colors.blue),
            const SizedBox(height: 8),
            Text(
              "You are chatting with ${widget.merchantName ?? 'this store'}.\nYour messages are secured.",
              textAlign: TextAlign.center,
              style: TextStyle(color: isDark ? Colors.blue.shade200 : Colors.blue.shade800, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isMe) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = Theme.of(context).colorScheme.primary;
    
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isMe 
              ? primaryColor 
              : (isDark ? Colors.grey[850]! : Colors.grey.shade200),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isMe ? 16 : 0),
            bottomRight: Radius.circular(isMe ? 0 : 16),
          ),
        ),
        child: HtmlWidget(
          text,
          onTapUrl: (url) {
            // Support both old custom format and new standard HTTPS format
            if (url.startsWith('product:')) {
              final integrationAsync = ref.read(chatIntegrationProvider(widget.merchantId ?? ''));
              final integration = integrationAsync.value;
              final merchantMap = {
                'id': widget.merchantId,
                'integrationName': widget.merchantName ?? (integration?['integrationName'] ?? 'Store'),
                'category': integration?['category'],
                'verticalType': integration?['verticalType'],
                'logo': integration?['logo'],
                'bannerImage': integration?['bannerImage'],
                'isSuspended': integration?['isSuspended'] ?? false,
                'isActive': integration?['isActive'] ?? true,
                'isApproved': integration?['isApproved'] ?? true,
                'openingHours': integration?['openingHours'],
              };
              context.push('/customer/catalogue', extra: merchantMap);
              return true;
            } else if (url.startsWith('add-to-cart:')) {
              final parts = url.split(':');
              if (parts.length >= 4) {
                final productId = parts[1];
                final catalogueId = parts[2];
                final quantity = int.tryParse(parts[3]) ?? 1;
                _addProductToCartFromLink(productId, catalogueId, quantity);
              }
              return true;
            }

            final uri = Uri.tryParse(url);
            if (uri != null && uri.host == 'tubulu.app') {
              if (uri.path == '/product') {
                final integrationAsync = ref.read(chatIntegrationProvider(widget.merchantId ?? ''));
                final integration = integrationAsync.value;
                final merchantMap = {
                  'id': widget.merchantId,
                  'integrationName': widget.merchantName ?? (integration?['integrationName'] ?? 'Store'),
                  'category': integration?['category'],
                  'verticalType': integration?['verticalType'],
                  'logo': integration?['logo'],
                  'bannerImage': integration?['bannerImage'],
                  'isSuspended': integration?['isSuspended'] ?? false,
                  'isActive': integration?['isActive'] ?? true,
                  'isApproved': integration?['isApproved'] ?? true,
                  'openingHours': integration?['openingHours'],
                };
                context.push('/customer/catalogue', extra: merchantMap);
                return true;
              } else if (uri.path == '/add-to-cart') {
                final productId = uri.queryParameters['productId'];
                final catalogueId = uri.queryParameters['catalogueId'];
                final quantity = int.tryParse(uri.queryParameters['quantity'] ?? '1') ?? 1;
                if (productId != null && catalogueId != null) {
                  _addProductToCartFromLink(productId, catalogueId, quantity);
                }
                return true;
              }
            }
            return false;
          },
          textStyle: TextStyle(
            color: isMe 
                ? (isDark ? Colors.black : Colors.white) 
                : (isDark ? Colors.white70 : Colors.black87),
            fontSize: 15,
          ),
        ),
      ),
    );
  }

  Widget _buildMessageInput(String? roomId) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: theme.cardColor,
        border: Border(top: BorderSide(color: theme.dividerColor)),
      ),
      child: SafeArea(
        child: Row(
          children: [
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
                        style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      Spacer(),
                    ],
                  ),
                ),
              )
            else
              Expanded(
                child: GestureDetector(
                  onLongPress: _handlePaste,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: theme.scaffoldBackgroundColor,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: CallbackShortcuts(
                      bindings: {
                        const SingleActivator(LogicalKeyboardKey.keyV, control: true): () => _handlePaste(),
                        const SingleActivator(LogicalKeyboardKey.keyV, meta: true): () => _handlePaste(),
                      },
                      child: TextField(
                        controller: _messageController,
                        textCapitalization: TextCapitalization.sentences,
                        minLines: 1,
                        maxLines: null,
                        enableInteractiveSelection: true,
                        selectionControls: MaterialTextSelectionControls(),
                        style: TextStyle(color: theme.textTheme.bodyLarge?.color),
                        decoration: InputDecoration(
                          hintText: 'Type a message...',
                          hintStyle: TextStyle(color: theme.hintColor),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        onSubmitted: (_) => _handleSend(roomId),
                      ),
                    ),
                  ),
                ),
              ),
            const SizedBox(width: 8),
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
                        icon: Icon(
                          Icons.send, 
                          color: isDark ? Colors.black : Colors.white, 
                          size: 20
                        ),
                        onPressed: () => _handleSend(roomId),
                      ),
                    );
                  } else {
                    return CircleAvatar(
                      backgroundColor: theme.colorScheme.primary.withOpacity(0.15),
                      child: IconButton(
                        icon: Icon(
                          Icons.mic, 
                          color: theme.colorScheme.primary, 
                          size: 20
                        ),
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

  Future<void> _handleSend(String? roomId) async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    // Optimistic UI update
    setState(() {
      _messages.add({'content': text, 'sender': 'user'});
    });
    _messageController.clear();
    _scrollToBottom();

    if (roomId == null || roomId.isEmpty) return;

    try {
      final dio = ref.read(dioProvider);
      await dio.post('/chatMessage/send', data: {
        'chatRoom': roomId,
        'message': text,
        'type': 'TEXT',
        'integrationId': widget.merchantId,
      });
      
      // Poll a few times to get the async AI reply
      _pollForReply(roomId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }
  
  Future<void> _pollForReply(String roomId) async {
    if (_isPolling) return;
    _isPolling = true;
    
    // Poll 4 times, every 3 seconds (up to 12s for AI response)
    for (int i = 0; i < 4; i++) {
      await Future.delayed(const Duration(seconds: 3));
      if (!mounted) break;
      await _fetchMessages(roomId);
    }
    
    _isPolling = false;
  }

  void _showRecommendDialog(BuildContext context) {
    if (widget.merchantId == null) return;
    int selectedRating = 5;
    final textController = TextEditingController();
    bool isSubmitting = false;

    final integrationAsync = ref.read(chatIntegrationProvider(widget.merchantId!));
    final integration = integrationAsync.value;
    
    final category = integration?['category']?.toString() ?? '';
    final verticalType = integration?['verticalType']?.toString() ?? '';
    final merchantName = widget.merchantName ?? integration?['integrationName']?.toString() ?? '';
    
    final isFood = category.toUpperCase() == 'FB' ||
                   category.toUpperCase().contains('FOOD') ||
                   category.toUpperCase().contains('RESTAURANT') ||
                   category.toUpperCase().contains('BAKERY') ||
                   category.toUpperCase().contains('COFFEE') ||
                   category.toUpperCase().contains('CAFE') ||
                   verticalType.toUpperCase() == 'FB' ||
                   merchantName.toUpperCase().contains('COFFEE') ||
                   merchantName.toUpperCase().contains('BAKERY') ||
                   merchantName.toUpperCase().contains('VEG') ||
                   merchantName.toUpperCase().contains('RESTAURANT') ||
                   merchantName.toUpperCase().contains('CAFE') ||
                   merchantName.toUpperCase().contains('FOOD') ||
                   merchantName.toUpperCase().contains('KITCHEN') ||
                   merchantName.toUpperCase().contains('IDLI') ||
                   merchantName.toUpperCase().contains('CHAT') ||
                   merchantName.toUpperCase().contains('SWEET') ||
                   merchantName.toUpperCase().contains('BIRYANI') ||
                   merchantName.toUpperCase().contains('BHAVAN');

    final itemType = isFood ? 'Food' : 'Product';
    final titleText = 'Recommend this $itemType';
    final ratingPrompt = 'Rate this ${itemType.toLowerCase()} (1 to 5 stars):';
    final hintText = 'Share why you recommend this ${itemType.toLowerCase()} to your contacts...';

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (builderContext, setDialogState) => AlertDialog(
          title: Text(titleText),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(ratingPrompt),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starVal = index + 1;
                  return IconButton(
                    icon: Icon(
                      starVal <= selectedRating ? Icons.star : Icons.star_border,
                      color: Colors.amber,
                    ),
                    onPressed: isSubmitting ? null : () {
                      setDialogState(() {
                        selectedRating = starVal;
                      });
                    },
                  );
                }),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: textController,
                enabled: !isSubmitting,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: hintText,
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: isSubmitting ? null : () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      setDialogState(() => isSubmitting = true);
                      try {
                        final dio = ref.read(dioProvider);
                        await dio.post('/user/reviews', data: {
                          'integrationId': widget.merchantId,
                          'rating': selectedRating,
                          'reviewText': textController.text.trim(),
                        });
                        ref.invalidate(personalizedRecommendationsProvider);
                        if (dialogContext.mounted) {
                          Navigator.pop(dialogContext);
                          ScaffoldMessenger.of(dialogContext).showSnackBar(
                            const SnackBar(
                              content: Text('Recommendation shared with your contacts!'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      } catch (e) {
                        setDialogState(() => isSubmitting = false);
                        if (dialogContext.mounted) {
                          ScaffoldMessenger.of(dialogContext).showSnackBar(
                            SnackBar(
                              content: Text('Failed to submit: $e'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      }
                    },
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }

  Future<List<dynamic>> _getProducts() async {
    if (_cachedProducts != null) return _cachedProducts!;
    final merchantId = widget.merchantId;
    if (merchantId == null || merchantId.isEmpty) return [];
    
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/products/search-app/$merchantId');
      final data = response.data;
      if (data == null) return [];
      
      final catalogues = data['catalogues'] ?? [];
      final List<dynamic> flattenedProducts = [];
      
      for (final catalogue in catalogues) {
        final structuredProducts = catalogue['products'] ?? {};
        structuredProducts.forEach((category, subcatGroups) {
          if (subcatGroups is List) {
            for (var group in subcatGroups) {
              if (group is Map && group['items'] is List) {
                flattenedProducts.addAll(group['items']);
              }
            }
          }
        });
      }
      
      _cachedProducts = flattenedProducts;
      return _cachedProducts!;
    } catch (e) {
      debugPrint('Error loading merchant products: $e');
      return [];
    }
  }

  Future<void> _addProductToCartFromLink(String productId, String catalogueId, int quantity) async {
    final merchantId = widget.merchantId;
    if (merchantId == null || merchantId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot add item: Merchant ID is missing.')),
      );
      return;
    }
    
    try {
      final productsList = await _getProducts();
      dynamic product;
      for (final p in productsList) {
        if (p['productId'].toString() == productId) {
          product = p;
          break;
        }
      }
      
      if (product == null) {
        throw Exception('Product not found in catalogue.');
      }
      
      final name = product['productName'] ?? product['name'] ?? 'Product';
      final price = (product['price'] as num?)?.toDouble() ?? 0.0;
      final imageUrl = (product['imageUrls'] is List && (product['imageUrls'] as List).isNotEmpty)
          ? product['imageUrls'][0].toString()
          : '';
          
      final itemToAdd = CartItem(
        id: '${productId}_default',
        productId: productId,
        name: name,
        price: price,
        imageUrl: imageUrl,
        quantity: quantity,
        merchantId: merchantId,
        selectedOptions: const [],
        customizationId: null,
      );
      
      ref.read(cartProvider.notifier).addItem(itemToAdd);
      
      if (mounted) {
        context.push('/customer/cart');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add item: ${e.toString()}'),
            backgroundColor: Colors.red.shade600,
          ),
        );
      }
    }
  }

  Future<void> _addProductToCartSilently(String productId, int quantity) async {
    final merchantId = widget.merchantId;
    if (merchantId == null || merchantId.isEmpty) return;
    
    try {
      final productsList = await _getProducts();
      dynamic product;
      for (final p in productsList) {
        if (p['productId'].toString() == productId) {
          product = p;
          break;
        }
      }
      if (product == null) return;
      
      final name = product['productName'] ?? product['name'] ?? 'Product';
      final price = (product['price'] as num?)?.toDouble() ?? 0.0;
      final imageUrl = (product['imageUrls'] is List && (product['imageUrls'] as List).isNotEmpty)
          ? product['imageUrls'][0].toString()
          : '';
          
      final itemToAdd = CartItem(
        id: '${productId}_default',
        productId: productId,
        name: name,
        price: price,
        imageUrl: imageUrl,
        quantity: quantity,
        merchantId: merchantId,
        selectedOptions: const [],
        customizationId: null,
      );
      
      ref.read(cartProvider.notifier).addItem(itemToAdd);
    } catch (e) {
      debugPrint('Failed to auto add item to cart: $e');
    }
  }

  void _automaticallyProcessCartIntents(List<Map<String, dynamic>> messages) {
    for (final msg in messages) {
      final msgId = (msg['id'] ?? msg['uuid'] ?? '').toString();
      if (msgId.isEmpty || _processedCartMessageIds.contains(msgId)) continue;
      
      final sender = (msg['sender'] ?? msg['senderType'] ?? 'user').toString();
      if (sender == 'user') continue; // Only process bot messages
      
      final text = (msg['content'] ?? msg['message'] ?? '').toString();
      if (text.contains('add-to-cart') && text.contains('successfully added')) {
        final regex = RegExp(r'https://tubulu.app/add-to-cart\?productId=([a-zA-Z0-9\-]+)&catalogueId=([a-zA-Z0-9\-]+)&quantity=(\d+)');
        final match = regex.firstMatch(text);
        if (match != null) {
          final productId = match.group(1);
          final catalogueId = match.group(2);
          final quantity = int.tryParse(match.group(3) ?? '1') ?? 1;
          
          if (productId != null && catalogueId != null) {
            _processedCartMessageIds.add(msgId);
            _addProductToCartSilently(productId, quantity);
          }
        }
      }
    }
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
