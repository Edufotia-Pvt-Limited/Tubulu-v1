import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';
import '../../../../core/api/api_provider.dart';

class MerchantChatScreen extends ConsumerStatefulWidget {
  final String roomId;
  final String? customerName;
  final String? customerPhone;
  const MerchantChatScreen({
    super.key,
    required this.roomId,
    this.customerName,
    this.customerPhone,
  });

  @override
  ConsumerState<MerchantChatScreen> createState() => _MerchantChatScreenState();
}

class _MerchantChatScreenState extends ConsumerState<MerchantChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  bool _isLoadingMessages = true;
  bool _isPolling = false;
  Timer? _pollTimer;
  bool _isAiActive = false;

  @override
  void dispose() {
    _pollTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _fetchMessages();
    _startPolling();
  }

  void _startPolling() {
    _isPolling = true;
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted) {
        _fetchMessages(isBackground: true);
      }
    });
  }

  Future<void> _fetchMessages({bool isBackground = false}) async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/chatRoom/dashboard/all/chatMessages/${widget.roomId}');
      final conversation = response.data['conversation'];
      if (conversation != null) {
        final messagesList = conversation['messages'] as List?;
        final rawAiActive = conversation['isAiActive'] ?? false;
        
        if (mounted) {
          setState(() {
            _isAiActive = rawAiActive;
          });
        }

        if (mounted && messagesList != null) {
          final List<Map<String, dynamic>> fetchedMessages = List<Map<String, dynamic>>.from(messagesList);
          // The API returns messages. The bubble helper expects sorting matching customer screen
          // (Let's check if the API returns them chronologically or reverse. Usually /dashboard/all/chatMessages returns chronologically or we can check).
          // We can sort them by createdAt to ensure correct order
          fetchedMessages.sort((a, b) {
            final aTime = DateTime.tryParse(a['createdAt'].toString()) ?? DateTime.now();
            final bTime = DateTime.tryParse(b['createdAt'].toString()) ?? DateTime.now();
            return aTime.compareTo(bTime);
          });

          final bool hasNewMessages = fetchedMessages.length > _messages.length;

          if (mounted) {
            setState(() {
              _messages = fetchedMessages;
              if (!isBackground) _isLoadingMessages = false;
            });
            if (hasNewMessages) {
              _scrollToBottom();
            }
          }
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

  Future<void> _toggleAi() async {
    try {
      final dio = ref.read(dioProvider);
      final newState = !_isAiActive;
      await dio.put('/chatRoom/dashboard/chatRoom/${widget.roomId}/toggle-ai', data: {
        'isAiActive': newState,
      });
      setState(() {
        _isAiActive = newState;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(newState ? 'AI Chatbot auto-replies enabled' : 'AI Chatbot auto-replies paused'),
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update AI setting: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _handleSend() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    final placeholderMsg = {
      'id': 'temp_${DateTime.now().millisecondsSinceEpoch}',
      'body': text,
      'senderId': 'admin', // Optimistic sender
      'createdAt': DateTime.now().toIso8601String(),
    };

    setState(() {
      _messages.add(placeholderMsg);
    });
    _messageController.clear();
    _scrollToBottom();

    try {
      final dio = ref.read(dioProvider);
      // PUT /chatMessage/integrationSendDashboard?conversationId=...
      // req.body contains: id (which is chatRoom id), body, contentType
      await dio.put('/chatMessage/integrationSendDashboard', 
        queryParameters: {'conversationId': widget.roomId},
        data: {
          'id': widget.roomId,
          'body': text,
          'contentType': 'text',
        },
      );
      
      // Refresh messages to sync state and update isAiActive status (sending message auto-disables AI)
      await _fetchMessages(isBackground: true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send: $e'), backgroundColor: Colors.red),
        );
      }
    }
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/merchant/chats');
            }
          },
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.customerName ?? 'Customer Chat',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            if (widget.customerPhone != null && widget.customerPhone!.isNotEmpty)
              Text(
                widget.customerPhone!,
                style: TextStyle(fontSize: 12, color: theme.hintColor),
              ),
          ],
        ),
        actions: [
          // Toggle AI switch/button
          IconButton(
            icon: Icon(
              _isAiActive ? Icons.android : Icons.android_outlined,
              color: _isAiActive ? Colors.green : theme.hintColor,
            ),
            tooltip: _isAiActive ? 'AI Enabled (Auto-replies active)' : 'AI Paused (Manual mode)',
            onPressed: _toggleAi,
          ),
        ],
      ),
      body: Column(
        children: [
          // AI status notification header if active
          if (_isAiActive)
            Container(
              width: double.infinity,
              color: Colors.green.withOpacity(0.1),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  const Icon(Icons.android, size: 16, color: Colors.green),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'AI Chatbot is auto-responding. Sending a manual reply will disable it.',
                      style: TextStyle(fontSize: 12, color: isDark ? Colors.green[200] : Colors.green[800]),
                    ),
                  ),
                ],
              ),
            ),
          
          Expanded(
            child: _isLoadingMessages && _messages.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      final text = msg['body'] ?? msg['message'] ?? '';
                      // senderId will match admin's phone number or integration phone number
                      // In the response, messages sent by integration have senderId = integrationDetails.phoneNumber
                      // Customer has senderId = user.phoneNumber
                      // Let's determine if it's "Me" (admin) by checking senderId. 
                      // If it's "admin" (our temp msg) or NOT the customer's phone number, treat as me.
                      final isMe = msg['senderId'] == 'admin' || (widget.customerPhone != null && msg['senderId'] != widget.customerPhone);
                      
                      return _buildMessageBubble(text, isMe, msg['createdAt']);
                    },
                  ),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isMe, dynamic createdAt) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primaryColor = theme.colorScheme.primary;

    DateTime? time;
    if (createdAt != null) {
      time = DateTime.tryParse(createdAt.toString());
    }

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Container(
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
                textStyle: TextStyle(
                  color: isMe 
                      ? (isDark ? Colors.black : Colors.white) 
                      : (isDark ? Colors.white70 : Colors.black87),
                  fontSize: 15,
                ),
              ),
            ),
            if (time != null)
              Padding(
                padding: const EdgeInsets.only(top: 2, left: 4, right: 4),
                child: Text(
                  DateFormat('hh:mm a').format(time.toLocal()),
                  style: TextStyle(fontSize: 10, color: theme.hintColor),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
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
            Expanded(
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
                      suffixIcon: IconButton(
                        icon: Icon(Icons.paste_rounded, size: 20, color: theme.hintColor),
                        onPressed: _handlePaste,
                      ),
                    ),
                    onSubmitted: (_) => _handleSend(),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            ValueListenableBuilder<TextEditingValue>(
              valueListenable: _messageController,
              builder: (context, value, child) {
                final isNotEmpty = value.text.trim().isNotEmpty;
                return CircleAvatar(
                  backgroundColor: isNotEmpty 
                      ? theme.colorScheme.primary 
                      : (isDark ? Colors.grey.shade800 : Colors.grey.shade300),
                  child: IconButton(
                    icon: Icon(
                      Icons.send, 
                      color: isNotEmpty 
                          ? (isDark ? Colors.black : Colors.white) 
                          : Colors.grey, 
                      size: 20
                    ),
                    onPressed: isNotEmpty ? _handleSend : null,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
