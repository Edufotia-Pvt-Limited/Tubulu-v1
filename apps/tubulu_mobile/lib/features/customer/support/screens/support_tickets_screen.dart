import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/api/api_provider.dart';
import '../../../../core/theme/app_theme.dart';

final customerTicketsProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/support/tickets');
  return response.data['data'] ?? [];
});

final ticketDetailsProvider = FutureProvider.family.autoDispose<Map<String, dynamic>, String>((ref, ticketId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/support/ticket/$ticketId');
  return response.data['data'] ?? {};
});

class SupportTicketsScreen extends ConsumerStatefulWidget {
  const SupportTicketsScreen({super.key});

  @override
  ConsumerState<SupportTicketsScreen> createState() => _SupportTicketsScreenState();
}

class _SupportTicketsScreenState extends ConsumerState<SupportTicketsScreen> {
  HttpClient? _sseClient;
  StreamSubscription? _sseSub;
  bool _sseActive = false;

  @override
  void initState() {
    super.initState();
    _startSSE();
  }

  Future<void> _startSSE() async {
    if (_sseActive) return;
    _sseActive = true;
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'auth_token');
      if (token == null) return;

      final baseUrl = ApiConfig.baseUrl;
      final sseUrl = baseUrl.replaceFirst('/api/v1', '') + '/api/v1/orders/user-stream';

      final request = await HttpClient().getUrl(Uri.parse(sseUrl));
      request.headers.set('Authorization', 'Bearer $token');
      request.headers.set('Accept', 'text/event-stream');
      request.headers.set('Cache-Control', 'no-cache');

      final response = await request.close();
      final stream = response.transform(utf8.decoder);

      String buffer = '';
      _sseSub = stream.listen((chunk) {
        buffer += chunk;
        final lines = buffer.split('\n');
        buffer = lines.removeLast();
        String? eventData;
        for (final line in lines) {
          if (line.startsWith('data: ')) {
            eventData = line.substring(6).trim();
          } else if (line.isEmpty && eventData != null) {
            try {
              final parsed = jsonDecode(eventData!);
              if (parsed['type'] == 'SUPPORT_TICKET_UPDATE') {
                debugPrint('📲 SupportTicketsScreen SSE SUPPORT_TICKET_UPDATE: ${parsed['ticketId']}');
                if (mounted) ref.invalidate(customerTicketsProvider);
              }
            } catch (_) {}
            eventData = null;
          }
        }
      }, onError: (_) {
        _sseActive = false;
        Future.delayed(const Duration(seconds: 5), () {
          if (mounted) _startSSE();
        });
      }, onDone: () {
        _sseActive = false;
        Future.delayed(const Duration(seconds: 5), () {
          if (mounted) _startSSE();
        });
      });
    } catch (e) {
      _sseActive = false;
      debugPrint('SupportTicketsScreen SSE connection failed: $e — will retry in 5s');
      Future.delayed(const Duration(seconds: 5), () {
        if (mounted) _startSSE();
      });
    }
  }

  @override
  void dispose() {
    _sseSub?.cancel();
    _sseClient?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ticketsAsync = ref.watch(customerTicketsProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        title: const Text(
          'Support Tickets',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black87),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.grey),
            onPressed: () => ref.invalidate(customerTicketsProvider),
          ),
        ],
      ),
      body: ticketsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
        data: (tickets) {
          if (tickets.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.support_agent_rounded, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  const Text('No support tickets raised yet!', style: TextStyle(color: Colors.grey, fontSize: 16)),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showCreateTicketDialog(context),
                    icon: const Icon(Icons.add, color: Colors.white),
                    label: const Text('Raise a Ticket', style: TextStyle(fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: tickets.length,
            itemBuilder: (context, index) {
              final ticket = tickets[index];
              return _TicketCard(ticket: ticket);
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateTicketDialog(context),
        backgroundColor: AppTheme.primaryColor,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Ticket', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  void _showCreateTicketDialog(BuildContext context) {
    final subjectController = TextEditingController();
    final descController = TextEditingController();
    String selectedCategory = 'App Issue';
    bool isSubmitting = false;

    final categories = [
      'App Issue',
      'Payment Issue',
      'Delivery Issue',
      'Store Feedback',
      'General Enquiry',
      'Refund Request'
    ];

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Create Support Ticket', style: TextStyle(fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedCategory,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: categories.map((cat) {
                    return DropdownMenuItem<String>(
                      value: cat,
                      child: Text(cat),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setDialogState(() => selectedCategory = val);
                    }
                  },
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: subjectController,
                  decoration: const InputDecoration(
                    labelText: 'Subject',
                    hintText: 'e.g. App crashing, Payment issue',
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: descController,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    hintText: 'Provide details about the issue...',
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      if (subjectController.text.trim().isEmpty || descController.text.trim().isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please fill all fields')),
                        );
                        return;
                      }

                      setDialogState(() => isSubmitting = true);
                      try {
                        final dio = ref.read(dioProvider);
                        await dio.post('/support/ticket', data: {
                          'subject': subjectController.text.trim(),
                          'category': selectedCategory,
                          'description': descController.text.trim(),
                          'priority': 'medium',
                        });
                        if (context.mounted) {
                          Navigator.pop(context);
                          ref.invalidate(customerTicketsProvider);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Ticket created successfully!'), backgroundColor: Colors.green),
                          );
                        }
                      } catch (e) {
                        setDialogState(() => isSubmitting = false);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red),
                          );
                        }
                      }
                    },
              child: isSubmitting
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Create'),
            ),
          ],
        ),
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  final Map<String, dynamic> ticket;

  const _TicketCard({required this.ticket});

  @override
  Widget build(BuildContext context) {
    final status = ticket['status']?.toString().toUpperCase() ?? 'OPEN';
    final createdAt = ticket['createdAt'] != null ? DateTime.parse(ticket['createdAt']) : DateTime.now();
    final timeStr = DateFormat('dd MMM, hh:mm a').format(createdAt);

    Color statusColor = Colors.orange;
    if (status == 'RESOLVED' || status == 'CLOSED') {
      statusColor = Colors.green;
    } else if (status == 'IN_PROGRESS' || status == 'OPEN') {
      statusColor = Colors.blue;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2)),
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TicketDetailsScreen(ticketId: ticket['id'].toString()),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                  Text(
                    timeStr,
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                ticket['subject'] ?? 'Support Request',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.black87),
              ),
              const SizedBox(height: 6),
              Text(
                ticket['description'] ?? '',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.black54, fontSize: 13),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'View Messages',
                    style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  const SizedBox(width: 4),
                  Icon(Icons.arrow_forward_ios_rounded, color: AppTheme.primaryColor, size: 12),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TicketDetailsScreen extends ConsumerStatefulWidget {
  final String ticketId;

  const TicketDetailsScreen({super.key, required this.ticketId});

  @override
  ConsumerState<TicketDetailsScreen> createState() => _TicketDetailsScreenState();
}

class _TicketDetailsScreenState extends ConsumerState<TicketDetailsScreen> {
  final replyController = TextEditingController();
  bool submittingReply = false;
  HttpClient? _sseClient;
  StreamSubscription? _sseSub;
  bool _sseActive = false;

  @override
  void initState() {
    super.initState();
    _startSSE();
  }

  Future<void> _startSSE() async {
    if (_sseActive) return;
    _sseActive = true;
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'auth_token');
      if (token == null) return;

      final baseUrl = ApiConfig.baseUrl;
      final sseUrl = baseUrl.replaceFirst('/api/v1', '') + '/api/v1/orders/user-stream';

      final request = await HttpClient().getUrl(Uri.parse(sseUrl));
      request.headers.set('Authorization', 'Bearer $token');
      request.headers.set('Accept', 'text/event-stream');
      request.headers.set('Cache-Control', 'no-cache');

      final response = await request.close();
      final stream = response.transform(utf8.decoder);

      String buffer = '';
      _sseSub = stream.listen((chunk) {
        buffer += chunk;
        final lines = buffer.split('\n');
        buffer = lines.removeLast();
        String? eventData;
        for (final line in lines) {
          if (line.startsWith('data: ')) {
            eventData = line.substring(6).trim();
          } else if (line.isEmpty && eventData != null) {
            try {
              final parsed = jsonDecode(eventData!);
              if (parsed['type'] == 'SUPPORT_TICKET_UPDATE') {
                final ticketId = parsed['ticketId']?.toString();
                debugPrint('📲 TicketDetailsScreen SSE SUPPORT_TICKET_UPDATE: $ticketId');
                if (ticketId == widget.ticketId) {
                  if (mounted) {
                    ref.invalidate(ticketDetailsProvider(widget.ticketId));
                  }
                }
              }
            } catch (_) {}
            eventData = null;
          }
        }
      }, onError: (_) {
        _sseActive = false;
        Future.delayed(const Duration(seconds: 5), () {
          if (mounted) _startSSE();
        });
      }, onDone: () {
        _sseActive = false;
        Future.delayed(const Duration(seconds: 5), () {
          if (mounted) _startSSE();
        });
      });
    } catch (e) {
      _sseActive = false;
      debugPrint('TicketDetailsScreen SSE connection failed: $e — will retry in 5s');
      Future.delayed(const Duration(seconds: 5), () {
        if (mounted) _startSSE();
      });
    }
  }

  @override
  void dispose() {
    _sseSub?.cancel();
    _sseClient?.close();
    replyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final detailsAsync = ref.watch(ticketDetailsProvider(widget.ticketId));

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        title: const Text('Ticket Details', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: detailsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading ticket: $err')),
        data: (ticket) {
          final replies = List<dynamic>.from(ticket['replies'] ?? []);
          final isClosed = ticket['status']?.toString().toUpperCase() == 'CLOSED' || ticket['status']?.toString().toUpperCase() == 'RESOLVED';

          return Column(
            children: [
              // Ticket Header / Details
              Container(
                color: Colors.white,
                padding: const EdgeInsets.all(16),
                width: double.infinity,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Ticket #${widget.ticketId.substring(0, 8).toUpperCase()}', style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                        if (!isClosed)
                          OutlinedButton(
                            onPressed: () => _closeTicket(context),
                            style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                            child: const Text('Close Ticket'),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(ticket['subject'] ?? 'Support Request', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const SizedBox(height: 8),
                    Text(ticket['description'] ?? '', style: const TextStyle(color: Colors.black87, fontSize: 14)),
                  ],
                ),
              ),
              const Divider(height: 1),

              // Replies / Message Stream
              Expanded(
                child: replies.isEmpty
                    ? const Center(child: Text('No replies yet. A support agent will respond shortly.', style: TextStyle(color: Colors.grey)))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: replies.length,
                        itemBuilder: (context, index) {
                          final reply = replies[index];
                          final isAdmin = reply['isAdmin'] == true;
                          final senderName = isAdmin ? 'Support Agent' : 'You';
                          final timestamp = reply['createdAt'] != null ? DateTime.parse(reply['createdAt']) : DateTime.now();
                          final timeStr = DateFormat('hh:mm a').format(timestamp);

                          return Align(
                            alignment: isAdmin ? Alignment.centerLeft : Alignment.centerRight,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: isAdmin ? Colors.white : AppTheme.primaryColor.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(12),
                                border: isAdmin ? Border.all(color: Colors.grey.shade200) : null,
                              ),
                              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(senderName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: isAdmin ? Colors.blue.shade800 : AppTheme.primaryColor)),
                                  const SizedBox(height: 4),
                                  Text(reply['message'] ?? '', style: const TextStyle(fontSize: 13.5)),
                                  const SizedBox(height: 4),
                                  Align(
                                    alignment: Alignment.bottomRight,
                                    child: Text(timeStr, style: const TextStyle(fontSize: 9, color: Colors.black38)),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),

              // Reply Input Field
              if (!isClosed)
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(12),
                  child: SafeArea(
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: replyController,
                            decoration: InputDecoration(
                              hintText: 'Type your message...',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(20),
                                borderSide: BorderSide(color: Colors.grey.shade300),
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.send, color: AppTheme.primaryColor),
                          onPressed: submittingReply ? null : () => _sendReply(context),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Container(
                  color: Colors.grey.shade100,
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  width: double.infinity,
                  alignment: Alignment.center,
                  child: const Text('This ticket is closed.', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _sendReply(BuildContext context) async {
    final reply = replyController.text.trim();
    if (reply.isEmpty) return;

    setState(() => submittingReply = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.post('/support/ticket/${widget.ticketId}/reply', data: {
        'message': reply,
      });
      replyController.clear();
      ref.invalidate(ticketDetailsProvider(widget.ticketId));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to send message: $e')));
    } finally {
      setState(() => submittingReply = false);
    }
  }

  Future<void> _closeTicket(BuildContext context) async {
    try {
      final dio = ref.read(dioProvider);
      await dio.patch('/support/ticket/${widget.ticketId}/close');
      ref.invalidate(ticketDetailsProvider(widget.ticketId));
      ref.invalidate(customerTicketsProvider);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ticket closed successfully!')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to close ticket: $e')));
    }
  }
}
