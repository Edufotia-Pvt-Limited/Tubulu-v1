import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/api/api_provider.dart';
import 'package:intl/intl.dart';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final chatHistoryProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/chatRoom/allChatRoomsByUserId');
  
  // Extract array reliably
  final data = response.data['data'];
  if (data != null && data is List) {
     final rawList = List<Map<String, dynamic>>.from(data);
     
     // Group/Combine by integrationId (Merchant Store) to prevent duplicates
     final Map<String, Map<String, dynamic>> combined = {};
     for (final room in rawList) {
       final integration = room['integration'] as Map<String, dynamic>?;
       if (integration == null) continue;
       final integrationId = integration['id']?.toString() ?? room['integrationId']?.toString() ?? '';
       if (integrationId.isEmpty) continue;
       
       // Since the list is ordered by updatedAt DESC, the first one encountered is the latest one
       if (!combined.containsKey(integrationId)) {
         combined[integrationId] = room;
       }
     }
     return combined.values.toList();
  }
  return [];
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ChatHistoryScreen extends ConsumerStatefulWidget {
  const ChatHistoryScreen({super.key});

  @override
  ConsumerState<ChatHistoryScreen> createState() => _ChatHistoryScreenState();
}

class _ChatHistoryScreenState extends ConsumerState<ChatHistoryScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final historyAsync = ref.watch(chatHistoryProvider);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text(
          'Chat History',
          style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5),
        ),
        backgroundColor: theme.appBarTheme.backgroundColor,
        foregroundColor: theme.appBarTheme.foregroundColor,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                setState(() {
                  _searchQuery = val.trim();
                });
              },
              decoration: InputDecoration(
                hintText: 'Search chats or stores...',
                hintStyle: TextStyle(
                  color: isDark ? Colors.grey.shade500 : Colors.grey.shade500,
                  fontSize: 14,
                ),
                prefixIcon: Icon(
                  Icons.search_rounded,
                  color: theme.colorScheme.primary,
                  size: 22,
                ),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 20),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                filled: true,
                fillColor: isDark ? theme.cardColor : Colors.grey.shade100,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.dividerColor,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.dividerColor,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.colorScheme.primary.withValues(alpha: 0.5),
                    width: 1.5,
                  ),
                ),
              ),
            ),
          ),

          // Chat History List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.refresh(chatHistoryProvider.future),
              child: historyAsync.when(
                data: (rooms) {
                  if (rooms.isEmpty) {
                    return _buildEmptyState(context);
                  }

                  // Filter rooms by merchant name or last message
                  final filteredRooms = rooms.where((room) {
                    final integration = room['integration'] as Map<String, dynamic>?;
                    final merchantName = (integration?['integrationName'] ?? 'Unknown Store').toString().toLowerCase();
                    final lastMsg = (room['lastMessage'] ?? '').toString().toLowerCase();
                    final q = _searchQuery.toLowerCase();
                    return merchantName.contains(q) || lastMsg.contains(q);
                  }).toList();

                  if (filteredRooms.isEmpty) {
                    return _buildNoSearchResultsState(context);
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                    itemCount: filteredRooms.length,
                    separatorBuilder: (c, i) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final room = filteredRooms[index];
                      final integration = room['integration'] as Map<String, dynamic>?;
                      final merchantName = integration?['integrationName'] ?? 'Unknown Store';
                      final merchantLogo = integration?['logo'] ?? '';
                      final merchantId = integration?['id']?.toString() ?? room['integrationId']?.toString() ?? '';
                      
                      // Parse timestamp
                      DateTime? date;
                      if (room['updatedAt'] != null) {
                         date = DateTime.tryParse(room['updatedAt'].toString());
                      }

                      return GestureDetector(
                        onTap: () {
                          // Navigate to existing chat room with pre-resolved ID
                          context.push('/customer/chat', extra: {
                            'chatRoomId': room['id'],
                            'merchantName': merchantName,
                            'merchantId': merchantId,
                          });
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: theme.cardColor,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03), 
                                blurRadius: 10, 
                                offset: const Offset(0, 4)
                              ),
                            ],
                            border: Border.all(color: theme.dividerColor),
                          ),
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              // Merchant Logo / Icon
                              Container(
                                height: 50,
                                width: 50,
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(25),
                                  child: merchantLogo.isNotEmpty 
                                    ? Image.network(
                                        merchantLogo, 
                                        fit: BoxFit.cover,
                                        errorBuilder: (c,e,s) => Icon(Icons.store_rounded, color: theme.colorScheme.primary),
                                      )
                                    : Icon(Icons.store_rounded, color: theme.colorScheme.primary),
                                ),
                              ),
                              const SizedBox(width: 16),
                              
                              // Text info
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      merchantName,
                                      style: TextStyle(
                                        fontSize: 16, 
                                        fontWeight: FontWeight.bold,
                                        color: theme.textTheme.bodyLarge?.color,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      date != null 
                                        ? DateFormat('MMM d, yyyy - hh:mm a').format(date.toLocal())
                                        : 'N/A',
                                      style: TextStyle(
                                        fontSize: 12, 
                                        color: isDark ? Colors.grey.shade400 : Colors.grey.shade600
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              
                              // Arrow
                              Icon(Icons.chevron_right, color: theme.hintColor),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Text(
                      'Failed to load history: $e',
                      style: TextStyle(color: theme.textTheme.bodyLarge?.color),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
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
          Text(
            'No Chat History Yet',
            style: TextStyle(
              fontSize: 18, 
              fontWeight: FontWeight.bold, 
              color: theme.textTheme.titleLarge?.color
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Start chatting with local stores to see them here!',
            style: TextStyle(color: theme.hintColor),
          ),
        ],
      ),
    );
  }

  Widget _buildNoSearchResultsState(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off_rounded, size: 80, color: theme.hintColor),
            const SizedBox(height: 24),
            Text(
              'No Matching Chats Found',
              style: TextStyle(
                fontSize: 18, 
                fontWeight: FontWeight.bold, 
                color: theme.textTheme.titleLarge?.color
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "We couldn't find any stores matching '$_searchQuery'. Try checking spelling or type another keyword.",
              textAlign: TextAlign.center,
              style: TextStyle(color: theme.hintColor),
            ),
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: () {
                _searchController.clear();
                setState(() {
                  _searchQuery = '';
                });
              },
              icon: const Icon(Icons.clear_all_rounded),
              label: const Text('Clear Search Filter'),
            ),
          ],
        ),
      ),
    );
  }
}
