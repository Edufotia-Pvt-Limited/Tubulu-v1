import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_provider.dart';
import '../../../../core/widgets/tubulu_image.dart';

final merchantChatHistoryProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/chatRoom/dashboard/all/chatRooms');
  final data = response.data['conversations'];
  if (data != null && data is List) {
    return List<Map<String, dynamic>>.from(data);
  }
  return [];
});

class MerchantChatHistoryScreen extends ConsumerWidget {
  const MerchantChatHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(merchantChatHistoryProvider);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text(
          'Conversations',
          style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(merchantChatHistoryProvider),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(merchantChatHistoryProvider.future),
        child: historyAsync.when(
          data: (rooms) {
            if (rooms.isEmpty) {
              return _buildEmptyState(context);
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: rooms.length,
              separatorBuilder: (c, i) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final room = rooms[index];
                
                // Extract customer details (the participant that is not admin)
                final participants = List<Map<String, dynamic>>.from(room['participants'] ?? []);
                final customer = participants.firstWhere(
                  (p) => p['role'] != 'admin',
                  orElse: () => <String, dynamic>{},
                );

                final customerName = customer['name'] ?? customer['phoneNumber'] ?? 'Unknown Customer';
                final customerAvatar = customer['avatarUrl'] ?? '';
                final customerPhone = customer['phoneNumber'] ?? '';
                final lastMessageList = room['messages'] as List?;
                final lastMessage = (lastMessageList != null && lastMessageList.isNotEmpty) ? lastMessageList.first : null;
                final lastMessageBody = lastMessage != null ? (lastMessage['body'] ?? '') : '';

                DateTime? date;
                if (lastMessage != null && lastMessage['createdAt'] != null) {
                  date = DateTime.tryParse(lastMessage['createdAt'].toString());
                }

                return GestureDetector(
                  onTap: () {
                    context.push('/merchant/chat/${room['id']}', extra: {
                      'customerName': customerName,
                      'customerPhone': customerPhone,
                    });
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: theme.cardColor,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                      border: Border.all(color: theme.dividerColor),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        // Avatar
                        Container(
                          height: 50,
                          width: 50,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(25),
                            child: customerAvatar.isNotEmpty
                                ? Image.network(
                                    customerAvatar,
                                    fit: BoxFit.cover,
                                    errorBuilder: (c, e, s) => Icon(Icons.person, color: theme.colorScheme.primary),
                                  )
                                : Icon(Icons.person, color: theme.colorScheme.primary),
                          ),
                        ),
                        const SizedBox(width: 16),

                        // Text details
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      customerName,
                                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (date != null)
                                    Text(
                                      DateFormat('hh:mm a').format(date.toLocal()),
                                      style: TextStyle(fontSize: 11, color: theme.hintColor),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                lastMessageBody.isNotEmpty ? lastMessageBody : 'No messages yet',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(Icons.chevron_right, color: theme.hintColor),
                      ],
                    ),
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Failed to load chat history: $e')),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.chat_bubble_outline_rounded, size: 80, color: theme.hintColor),
          const SizedBox(height: 24),
          const Text(
            'No active chats',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Customer messages will show up here.',
            style: TextStyle(color: theme.hintColor),
          ),
        ],
      ),
    );
  }
}
