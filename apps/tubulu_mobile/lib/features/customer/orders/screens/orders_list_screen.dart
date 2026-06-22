import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/api/api_provider.dart';
import '../../cart/providers/cart_provider.dart';

DateTime _toIST(DateTime dt) {
  final utc = dt.isUtc ? dt : dt.toUtc();
  return utc.add(const Duration(hours: 5, minutes: 30));
}

DateTime _nowIST() {
  return DateTime.now().toUtc().add(const Duration(hours: 5, minutes: 30));
}

Widget _buildReceiptRow(String label, double val, {bool isGreen = false, bool isFree = false}) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
        Text(
          isFree ? 'FREE' : (isGreen ? '-₹${val.abs().toStringAsFixed(2)}' : '₹${val.toStringAsFixed(2)}'),
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isFree || isGreen ? Colors.green : Colors.black87,
          ),
        ),
      ],
    ),
  );
}

final customerOrdersProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/orders/my-orders');
  return response.data['data'] ?? [];
});

class CustomerOrdersScreen extends ConsumerStatefulWidget {
  const CustomerOrdersScreen({super.key});

  @override
  ConsumerState<CustomerOrdersScreen> createState() => _CustomerOrdersScreenState();
}

class _CustomerOrdersScreenState extends ConsumerState<CustomerOrdersScreen> {
  Timer? _pollTimer;
  HttpClient? _sseClient;
  StreamSubscription? _sseSub;
  bool _sseActive = false;
  bool _isSearching = false;
  String _searchQuery = '';
  int _retrySeconds = 5;

  @override
  void initState() {
    super.initState();
    _startSSE();
    _startPolling();
  }

  void _startPolling() {
    _pollTimer?.cancel();
    final duration = _sseActive ? const Duration(seconds: 30) : const Duration(seconds: 10);
    _pollTimer = Timer.periodic(duration, (_) {
      if (mounted) ref.invalidate(customerOrdersProvider);
    });
  }

  void _handleSSEReconnect() {
    if (!_sseActive) return;
    setState(() {
      _sseActive = false;
    });
    _startPolling(); // Fallback to 10s poll delay

    final delay = _retrySeconds;
    _retrySeconds = (_retrySeconds * 2).clamp(5, 60);

    debugPrint('📲 SSE Disconnected. Reconnecting in $delay seconds...');
    Future.delayed(Duration(seconds: delay), () {
      if (mounted) _startSSE();
    });
  }

  Future<void> _startSSE() async {
    if (_sseActive) return;
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'auth_token');
      if (token == null) return;

      final baseUrl = ApiConfig.baseUrl; // e.g. http://10.0.2.2:3008/api/v1
      final sseUrl = baseUrl.replaceFirst('/api/v1', '') + '/api/v1/orders/user-stream';

      setState(() {
        _sseActive = true;
      });
      _startPolling(); // Switch to 30s poll delay

      final request = await HttpClient().getUrl(Uri.parse(sseUrl));
      request.headers.set('Authorization', 'Bearer $token');
      request.headers.set('Accept', 'text/event-stream');
      request.headers.set('Cache-Control', 'no-cache');

      final response = await request.close();
      _retrySeconds = 5; // Reset backoff delay on successful connection
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
              if (parsed['type'] == 'ORDER_STATUS_UPDATE') {
                debugPrint('📲 SSE ORDER_STATUS_UPDATE: ${parsed['orderId']} -> ${parsed['status']}');
                if (mounted) ref.invalidate(customerOrdersProvider);
              }
            } catch (_) {}
            eventData = null;
          }
        }
      }, onError: (err) {
        debugPrint('📲 SSE Stream Error: $err');
        _handleSSEReconnect();
      }, onDone: () {
        debugPrint('📲 SSE Stream Done');
        _handleSSEReconnect();
      });
    } catch (e) {
      debugPrint('📲 SSE connection exception: $e');
      _handleSSEReconnect();
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _sseSub?.cancel();
    _sseClient?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(customerOrdersProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: Colors.grey.shade50,
        appBar: AppBar(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
          centerTitle: false,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, size: 20),
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/customer/home');
              }
            },
          ),
          title: _isSearching
              ? TextField(
                  autofocus: true,
                  style: const TextStyle(color: Colors.black87, fontSize: 16),
                  decoration: const InputDecoration(
                    hintText: 'Search orders, items, or shops...',
                    hintStyle: TextStyle(color: Colors.grey),
                    border: InputBorder.none,
                  ),
                  onChanged: (val) {
                    setState(() {
                      _searchQuery = val;
                    });
                  },
                )
              : const Text('My Orders', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black87)),
          actions: [
            IconButton(
              icon: Icon(_isSearching ? Icons.close : Icons.search, color: Colors.black54),
              onPressed: () {
                setState(() {
                  if (_isSearching) {
                    _isSearching = false;
                    _searchQuery = '';
                  } else {
                    _isSearching = true;
                  }
                });
              },
            ),
          ],
          bottom: const TabBar(
            labelColor: Colors.black87,
            unselectedLabelColor: Colors.grey,
            indicatorColor: Colors.orange,
            tabs: [
              Tab(text: 'Active Orders'),
              Tab(text: 'History'),
            ],
          ),
        ),
        body: ordersAsync.when(
          skipLoadingOnReload: true,
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) => Center(child: Text('Failed to load: $err')),
          data: (orders) {
            // Apply search query filter
            final filteredOrders = orders.where((o) {
              if (_searchQuery.isEmpty) return true;
              final query = _searchQuery.toLowerCase();
              
              // 1. Filter by Store Name
              final storeName = o['Integration']?['integrationName']?.toString().toLowerCase() ?? '';
              if (storeName.contains(query)) return true;
              
              // 2. Filter by Product/Item Names
              final items = o['orderItems'] as List?;
              if (items != null) {
                for (var item in items) {
                  final productName = item['name']?.toString().toLowerCase() ?? '';
                  if (productName.contains(query)) return true;
                }
              }
              
              // 3. Filter by Order ID
              final orderId = o['id']?.toString().toLowerCase() ?? '';
              if (orderId.contains(query)) return true;
              
              return false;
            }).toList();

            final activeOrders = filteredOrders.where((o) {
              final status = o['status']?.toString().toLowerCase() ?? 'waiting';
              return status != 'delivered' && status != 'canceled' && status != 'rejected';
            }).toList();
            
            final historyOrders = filteredOrders.where((o) {
              final status = o['status']?.toString().toLowerCase() ?? 'waiting';
              return status == 'delivered' || status == 'canceled' || status == 'rejected';
            }).toList();

            return TabBarView(
              children: [
                _buildOrderList(activeOrders),
                _buildOrderList(historyOrders),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildOrderList(List<dynamic> ordersList) {
    if (ordersList.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long_outlined, size: 80, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(
              _searchQuery.isNotEmpty 
                ? 'No matching orders found!' 
                : 'No orders found here!', 
              style: const TextStyle(color: Colors.grey, fontSize: 16)
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.refresh(customerOrdersProvider.future),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: ordersList.length,
        itemBuilder: (context, index) {
          return OrderCardWidget(order: ordersList[index]);
        },
      ),
    );
  }
}

/// ShopOrdersScreen now watches the live provider so it re-renders
/// when an ORDER_STATUS_UPDATE comes in via SSE or poll.
class ShopOrdersScreen extends ConsumerWidget {
  final String shopName;
  final String merchantId;

  const ShopOrdersScreen({super.key, required this.shopName, required this.merchantId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(customerOrdersProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(shopName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black87)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.grey),
            onPressed: () => ref.invalidate(customerOrdersProvider),
          ),
        ],
      ),
      body: ordersAsync.when(
        skipLoadingOnReload: true,
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
        data: (allOrders) {
          debugPrint('==== ShopOrdersScreen Render ====');
          debugPrint('allOrders total: ${allOrders.length}');
          debugPrint('Looking for merchantId: $merchantId');
          
          final shopOrders = allOrders.where((o) {
            final merchant = o['Integration'] ?? {};
            final mId = merchant['id']?.toString() ?? 'unknown';
            debugPrint('Order integration mId: $mId');
            return mId == merchantId;
          }).toList();

          if (shopOrders.isEmpty) {
            return const Center(child: Text('No orders for this shop.', style: TextStyle(color: Colors.grey)));
          }

          return RefreshIndicator(
            onRefresh: () => ref.refresh(customerOrdersProvider.future),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: shopOrders.length,
              itemBuilder: (context, index) {
                return OrderCardWidget(order: shopOrders[index]);
              },
            ),
          );
        },
      ),
    );
  }
}





class OrderCardWidget extends ConsumerWidget {
  final Map<String, dynamic> order;

  const OrderCardWidget({super.key, required this.order});

  Future<void> _handleReorder(BuildContext context, WidgetRef ref) async {
    final List<dynamic> items = order['orderItems'] ?? [];
    if (items.isEmpty) return;
    final merchantId = order['integrationId'];
    
    ref.read(cartProvider.notifier).clear();
    for (var it in items) {
      ref.read(cartProvider.notifier).addItem(
        CartItem(
          id: it['productId'] ?? '',
          productId: it['productId'] ?? '',
          name: it['name'] ?? 'Product',
          price: (it['price'] ?? 0.0).toDouble(),
          imageUrl: it['imageUrl'] ?? '',
          merchantId: merchantId,
          cgst: (it['cgst'] ?? 0.0).toDouble(),
          sgst: (it['sgst'] ?? 0.0).toDouble(),
        ),
      );
    }
    context.push('/customer/cart');
  }

  void _showReportIssueDialog(BuildContext context, WidgetRef ref) {
    final subjectController = TextEditingController();
    final descController = TextEditingController();
    String selectedCategory = 'Delivery Issue';
    bool submitting = false;

    final categories = [
      'Delivery Issue',
      'Payment Issue',
      'Missing Item',
      'Damaged Item',
      'Wrong Item',
      'Store Feedback',
      'General Enquiry'
    ];

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Report Issue / Help', style: TextStyle(fontWeight: FontWeight.bold)),
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
                  decoration: const InputDecoration(labelText: 'Subject (e.g. Missing Item, Late Delivery)'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: descController,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Description'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: submitting ? null : () async {
                setDialogState(() => submitting = true);
                try {
                  final dio = ref.read(dioProvider);
                  await dio.post('/support/ticket', data: {
                    'orderId': order['id'],
                    'subject': subjectController.text.trim(),
                    'category': selectedCategory,
                    'description': descController.text.trim(),
                    'priority': 'medium',
                  });
                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Support ticket raised successfully!'), backgroundColor: Colors.green),
                    );
                  }
                } catch (e) {
                  setDialogState(() => submitting = false);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to raise ticket: $e'), backgroundColor: Colors.red),
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

  Future<void> _cancelOrder(BuildContext context, WidgetRef ref, String orderId, {bool closeSheet = false}) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final reasonController = TextEditingController();
    
    // Show confirmation dialog with a TextField
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Order', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Are you sure you want to cancel this order?'),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Reason for cancellation (optional)',
                hintText: 'e.g. Changed my mind, ordered by mistake',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Yes, Cancel', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final dio = ref.read(dioProvider);
      final reason = reasonController.text.trim();
      final response = await dio.put(
        '/orders/details/app/$orderId/cancel',
        data: reason.isNotEmpty ? {'reason': reason} : null,
      );
      if (response.statusCode == 200) {
        scaffoldMessenger.showSnackBar(
          const SnackBar(
            content: Text('Order canceled successfully'),
            backgroundColor: Colors.green,
          ),
        );
        ref.invalidate(customerOrdersProvider);
        if (closeSheet && context.mounted) {
          Navigator.pop(context); // Close the sheet if requested
        }
      } else {
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('Failed to cancel: ${response.data['message'] ?? 'Unknown error'}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Failed to cancel order: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final merchant = order['Integration'] ?? {};
    final createdAt = order['createdAt'] != null ? DateTime.parse(order['createdAt']) : null;
    final timeStr = createdAt != null ? DateFormat('dd MMM, hh:mm a').format(_toIST(createdAt)) : '';
    final status = order['status'] ?? 'waiting';
    final price = order['totalPrice'] ?? 0;

    // Standard status colors
    Color statusColor;
    switch(status.toString().toLowerCase()) {
      case 'delivered': statusColor = Colors.green; break;
      case 'canceled': statusColor = Colors.red; break;
      default: statusColor = Colors.orange;
    }

    final isPastOrder = status == 'delivered' || status == 'canceled' || status == 'rejected';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () => _showTrackingTimeline(context, ref, order),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 55,
                    height: 55,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: (merchant['logo']?.toString().isNotEmpty == true)
                          ? Image.network(
                              merchant['logo'],
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(Icons.store, color: Colors.grey),
                            )
                          : const Icon(Icons.store, color: Colors.grey),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          merchant['integrationName'] ?? 'Unknown Store',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.black87),
                        ),
                        const SizedBox(height: 4),
                        Text(timeStr, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                      ],
                    ),
                  ),
                  Text(
                    '₹$price',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87),
                  ),
                ],
              ),
              const Divider(height: 24, thickness: 1, color: Color(0xFFF0F0F0)),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      status.toString().toUpperCase(),
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.w800,
                        fontSize: 11,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const Spacer(),
                  if (isPastOrder) ...[
                    TextButton.icon(
                      onPressed: () => _showReportIssueDialog(context, ref),
                      icon: const Icon(Icons.help_outline, size: 14, color: Colors.red),
                      label: const Text('Help', style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _handleReorder(context, ref),
                      icon: const Icon(Icons.replay, size: 14, color: Colors.white),
                      label: const Text('Reorder', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ] else ...[
                    CancelOrderButton(
                      order: order,
                      onPressed: () => _cancelOrder(context, ref, order['id']),
                    ),
                    const Text(
                      'Track Order',
                      style: TextStyle(color: Colors.orange, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(width: 2),
                    const Icon(Icons.chevron_right, color: Colors.orange, size: 14),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showTrackingTimeline(BuildContext context, WidgetRef ref, Map<String, dynamic> order) {
    final stages = ['waiting', 'accepted', 'packing', 'dispatched', 'delivered'];
    final currentStatus = order['status']?.toString().toLowerCase() ?? 'waiting';
    final createdAt = order['createdAt'] != null ? DateTime.parse(order['createdAt']) : null;
    final List<dynamic> items = order['orderItems'] ?? [];
    
    int currentIdx = stages.indexOf(currentStatus);
    if (currentIdx == -1) currentIdx = 0; // Default to placing if error
    if (currentStatus == 'canceled') currentIdx = -1; // Handled separately

    String? _getStatusTimestamp(String status) {
      final logs = order['statusLogs'];
      if (logs is List) {
        final log = logs.firstWhere(
          (l) => l is Map && l['status']?.toString().toLowerCase() == status.toLowerCase(),
          orElse: () => null,
        );
        if (log != null && log['timestamp'] != null) {
          try {
            final parsedDate = _toIST(DateTime.parse(log['timestamp'].toString()));
            final now = _nowIST();
            final isToday = parsedDate.year == now.year && parsedDate.month == now.month && parsedDate.day == now.day;
            final timeStr = "${parsedDate.hour.toString().padLeft(2, '0')}:${parsedDate.minute.toString().padLeft(2, '0')}";
            if (isToday) {
              return "Today at $timeStr";
            } else {
              final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return "${parsedDate.day} ${months[parsedDate.month - 1]}, $timeStr";
            }
          } catch (_) {}
        }
      }
      
      DateTime? fallbackDate;
      if (status == 'waiting') fallbackDate = DateTime.tryParse(order['createdAt']?.toString() ?? '');
      if (status == 'accepted') fallbackDate = DateTime.tryParse(order['acceptedAt']?.toString() ?? '');
      if (status == 'packing') fallbackDate = DateTime.tryParse(order['packedAt']?.toString() ?? '');
      if (status == 'dispatched') fallbackDate = DateTime.tryParse(order['dispatchedAt']?.toString() ?? '');
      if (status == 'delivered') fallbackDate = DateTime.tryParse(order['deliveredAt']?.toString() ?? '');
      if (status == 'canceled' && order['status'] == 'canceled') fallbackDate = DateTime.tryParse(order['updatedAt']?.toString() ?? '');
      
      if (fallbackDate != null) {
        final localDate = _toIST(fallbackDate);
        final now = _nowIST();
        final isToday = localDate.year == now.year && localDate.month == now.month && localDate.day == now.day;
        final timeStr = "${localDate.hour.toString().padLeft(2, '0')}:${localDate.minute.toString().padLeft(2, '0')}";
        if (isToday) {
          return "Today at $timeStr";
        } else {
          final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return "${localDate.day} ${months[localDate.month - 1]}, $timeStr";
        }
      }
      return null;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.7,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // Modal Handle bar
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
            ),
            
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Live Track Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
                        const SizedBox(height: 4),
                        Text('Order #${order['id']?.toString().substring(0,8).toUpperCase()}', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // 👑 STICKY NOTE SECTION
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.push_pin, size: 16, color: Colors.amber),
                      const SizedBox(width: 8),
                      const Text('Private Sticky Note (Personal Reminder)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.amber)),
                      const Spacer(),
                      GestureDetector(
                        onTap: () => _editNote(context, ref, order),
                        child: const Text('Edit', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    order['personalNote']?.toString().isNotEmpty == true 
                      ? order['personalNote'] 
                      : 'No notes yet. Add a note to help you remember what this purchase belongs to!',
                    style: TextStyle(
                      color: order['personalNote']?.toString().isNotEmpty == true ? Colors.black87 : Colors.grey,
                      fontSize: 13,
                      fontStyle: order['personalNote']?.toString().isNotEmpty == true ? FontStyle.normal : FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // 💳 PAYMENT DETAILS SECTION
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.payment, size: 20, color: Colors.blue.shade600),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Payment Details',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Method: ${order['paymentMethod']?.toString().toUpperCase() ?? 'COD'}',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: (currentStatus == 'canceled')
                        ? Colors.red.shade50
                        : (order['paymentStatus']?.toString().toUpperCase() == 'PAID') 
                          ? Colors.green.shade50 
                          : Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      (currentStatus == 'canceled')
                        ? 'CANCELLED'
                        : (order['paymentStatus']?.toString().toUpperCase() ?? 'PENDING'),
                      style: TextStyle(
                        color: (currentStatus == 'canceled')
                          ? Colors.red.shade700
                          : (order['paymentStatus']?.toString().toUpperCase() == 'PAID') 
                            ? Colors.green.shade700 
                            : Colors.orange.shade700,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  if (currentStatus == 'canceled')
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12)),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('This order was cancelled.', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                                if (_getStatusTimestamp('canceled') != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      _getStatusTimestamp('canceled')!,
                                      style: TextStyle(color: Colors.red.shade700, fontSize: 12),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ...List.generate(stages.length, (index) {
                      final isCompleted = index <= currentIdx;
                      final isLast = index == stages.length - 1;
                      
                      String title = "";
                      IconData icon = Icons.circle;
                      
                      final merchant = order['Integration'] ?? {};
                      final verticalType = merchant['verticalType']?.toString().toLowerCase();
                      final category = merchant['category']?.toString().toLowerCase();
                      final isFood = verticalType == 'fb' || category == 'food & restaurant';

                      switch(stages[index]) {
                        case 'waiting': title = "Order Placed"; icon = Icons.receipt_outlined; break;
                        case 'accepted': title = "Merchant Accepted"; icon = Icons.thumb_up_outlined; break;
                        case 'packing': 
                          title = isFood ? "Food Prepared" : "Order Being Packed"; 
                          icon = isFood ? Icons.restaurant : Icons.inventory_2_outlined; 
                          break;
                        case 'dispatched': title = "Out for Delivery"; icon = Icons.delivery_dining_outlined; break;
                        case 'delivered': title = "Delivered Safely"; icon = Icons.home_outlined; break;
                      }

                      return _buildStep(
                        title: title,
                        isDone: isCompleted,
                        isCurrent: index == currentIdx,
                        isLast: isLast,
                        icon: icon,
                        timestamp: isCompleted ? _getStatusTimestamp(stages[index]) : null,
                      );
                    }),
                  
                  const Divider(height: 32),
                  const Text(
                    'Itemized Receipt',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
                  ),
                  const SizedBox(height: 12),
                  ...items.map((item) {
                    final itemName = item['name'] ?? 'Product';
                    final qty = item['quantity'] ?? 1;
                    final itemPrice = (item['price'] ?? 0).toDouble();
                    final itemTotal = (item['total'] ?? (itemPrice * qty)).toDouble();
                    final custDetails = item['customizationDetails'] as List?;
                    
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  '$itemName x $qty',
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Colors.black87),
                                ),
                              ),
                              Text(
                                '₹${itemTotal.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87),
                              ),
                            ],
                          ),
                          if (custDetails != null && custDetails.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(left: 8, top: 4),
                              child: Text(
                                custDetails.map((c) {
                                  final choices = (c['choiceName'] as List?)?.join(', ') ?? '';
                                  return "${c['optionName']}: $choices";
                                }).join(' | '),
                                style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                              ),
                            ),
                        ],
                      ),
                    );
                  }).toList(),
                  const Divider(height: 24),
                  Builder(
                    builder: (context) {
                      double subtotal = 0;
                      double totalCgst = 0;
                      double totalSgst = 0;
                      
                      for (var item in items) {
                        final qty = item['quantity'] ?? 1;
                        final price = (item['price'] ?? 0).toDouble();
                        subtotal += price * qty;
                        
                        final cgstPct = (item['cgst'] ?? 0).toDouble();
                        final sgstPct = (item['sgst'] ?? 0).toDouble();
                        totalCgst += price * (cgstPct / 100) * qty;
                        totalSgst += price * (sgstPct / 100) * qty;
                      }
                      
                      final discount = (order['discountAmount'] ?? 0).toDouble();
                      final finalTotal = (order['totalPrice'] ?? 0).toDouble();
                      final isDelivery = order['deliveryType']?.toString().toLowerCase() == 'delivery';
                      final deliveryFee = isDelivery ? (finalTotal - (subtotal + totalCgst + totalSgst - discount)).clamp(0.0, 500.0) : 0.0;

                      return Column(
                        children: [
                          _buildReceiptRow('Subtotal', subtotal),
                          if (discount > 0)
                            _buildReceiptRow('Discount', -discount, isGreen: true),
                          if (totalCgst > 0)
                            _buildReceiptRow('CGST', totalCgst),
                          if (totalSgst > 0)
                            _buildReceiptRow('SGST', totalSgst),
                          if (isDelivery)
                            _buildReceiptRow('Delivery Fee', deliveryFee, isFree: deliveryFee == 0),
                          const Divider(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Amount Paid', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.black87)),
                              Text(
                                '₹${finalTotal.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.blue),
                              ),
                            ],
                          ),
                        ],
                      );
                    }
                  ),
                  const SizedBox(height: 24),

                  if (order['trackingUrl'] != null && currentStatus == 'dispatched')
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Container(
                        width: double.infinity,
                        height: 50,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFFFA800), Color(0xFFE15B4D)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFE15B4D).withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(12),
                            onTap: () {
                              Navigator.pop(ctx);
                              context.push(
                                '/customer/orders/track',
                                extra: {
                                  'url': order['trackingUrl'].toString(),
                                  'orderId': order['id'].toString(),
                                },
                              );
                            },
                            child: const Center(
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.map_outlined, color: Colors.white),
                                  SizedBox(width: 8),
                                  Text(
                                    'Track Live Delivery',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                  CancelOrderButton(
                    order: order,
                    isLargeStyle: true,
                    onPressed: () => _cancelOrder(ctx, ref, order['id'], closeSheet: true),
                  ),

                  // Show receipt buttons for delivered orders
                  if (currentStatus == 'delivered')
                    Padding(
                      padding: const EdgeInsets.only(top: 20, bottom: 40),
                      child: Column(
                        children: [
                          // View Receipt — opens styled HTML receipt in browser
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () => _viewReceiptInBrowser(context, order),
                              icon: const Icon(Icons.receipt_long_outlined),
                              label: const Text('View Receipt'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.black87,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                elevation: 0,
                              ),
                            ),
                          ),
                          if (order['receiptPdfUrl'] != null) ...[
                            const SizedBox(height: 10),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: () => _downloadReceipt(context, ref, order),
                                icon: const Icon(Icons.download_for_offline_outlined),
                                label: const Text('Download PDF'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.orange,
                                  side: const BorderSide(color: Colors.orange),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }


  void _editNote(BuildContext context, WidgetRef ref, Map<String, dynamic> order) {
    final controller = TextEditingController(text: order['personalNote']?.toString() ?? '');
    
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Private Sticky Note (Personal Reminder)'),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'e.g., Belongs to my son',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final note = controller.text;
              final orderId = order['id'];
              final dio = ref.read(dioProvider);
              
              try {
                await dio.put('/orders/details/app/$orderId/note', data: {'note': note});
                if (context.mounted) {
                  Navigator.pop(ctx);
                  Navigator.pop(context); // Close the sheet
                  ref.invalidate(customerOrdersProvider); // Refresh list
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Note updated!')));
                }
              } catch (e) {
                if (context.mounted) {
                   ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _viewReceiptInBrowser(BuildContext context, Map<String, dynamic> order) async {
    final orderId = order['id']?.toString();
    if (orderId == null) return;
    // Build the HTML receipt URL from the base API URL
    final apiBase = ApiConfig.baseUrl.replaceFirst('/api/v1', '');
    final receiptUrl = '$apiBase/api/v1/public/receipt/$orderId';
    try {
      await launchUrl(Uri.parse(receiptUrl), mode: LaunchMode.externalApplication);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open receipt: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _downloadReceipt(BuildContext context, WidgetRef ref, Map<String, dynamic> order) async {
    final url = order['receiptPdfUrl'];
    if (url == null) return;

    try {
      // 1. Check Permissions
      if (Platform.isAndroid) {
        final deviceInfo = await DeviceInfoPlugin().androidInfo;
        if (deviceInfo.version.sdkInt <= 32) {
          final status = await Permission.storage.request();
          if (!status.isGranted) {
             if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Storage permission required')));
             return;
          }
        }
      }

      // 2. Get Directory
      Directory? directory;
      if (Platform.isAndroid) {
        directory = Directory('/storage/emulated/0/Download/Tubulu receipt');
      } else {
        directory = await getApplicationDocumentsDirectory();
        directory = Directory('${directory.path}/Tubulu receipt');
      }

      if (!await directory.exists()) {
        await directory.create(recursive: true);
      }

      // 3. Download
      final fileName = "Receipt_${order['id'].toString().substring(0, 8).toUpperCase()}.pdf";
      final filePath = "${directory.path}/$fileName";
      
      final dio = ref.read(dioProvider);
      
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Downloading receipt...')));
      
      await dio.download(url, filePath);
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Saved to $fileName'),
            action: SnackBarAction(
              label: 'Open', 
              onPressed: () => launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication)
            ),
          )
        );
      }
    } catch (e) {
      if (context.mounted) {
         ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Download failed: $e')));
      }
    }
  }

  Widget _buildStep({
    required String title,
    required bool isDone,
    required bool isCurrent,
    required bool isLast,
    required IconData icon,
    String? timestamp,
  }) {
    final activeColor = Colors.green.shade600;
    const inactiveColor = Color(0xFFE0E0E0);

    return IntrinsicHeight(
      child: Row(
        children: [
          Column(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDone ? activeColor : Colors.white,
                  border: Border.all(
                    color: isDone ? activeColor : inactiveColor,
                    width: 2
                  ),
                ),
                child: Icon(
                  isDone ? Icons.check : icon,
                  size: 16,
                  color: isDone ? Colors.white : Colors.grey,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: isDone ? activeColor : inactiveColor,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Container(
              padding: const EdgeInsets.only(bottom: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: isDone ? FontWeight.bold : FontWeight.normal,
                      fontSize: 15,
                      color: isDone ? Colors.black87 : Colors.grey,
                    ),
                  ),
                  if (isCurrent)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        'Current Status',
                        style: TextStyle(color: activeColor, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  if (timestamp != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        timestamp,
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CancelOrderButton extends StatefulWidget {
  final Map<String, dynamic> order;
  final VoidCallback onPressed;
  final bool isLargeStyle;

  const CancelOrderButton({
    super.key,
    required this.order,
    required this.onPressed,
    this.isLargeStyle = false,
  });

  @override
  State<CancelOrderButton> createState() => _CancelOrderButtonState();
}

class _CancelOrderButtonState extends State<CancelOrderButton> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final status = widget.order['status']?.toString().toLowerCase() ?? 'waiting';
    if (status != 'waiting') {
      return const SizedBox.shrink();
    }

    final createdAtStr = widget.order['createdAt'];
    if (createdAtStr == null) {
      return const SizedBox.shrink();
    }

    final createdAt = DateTime.tryParse(createdAtStr);
    if (createdAt == null) {
      return const SizedBox.shrink();
    }

    final now = DateTime.now().toUtc();
    final difference = now.difference(createdAt.toUtc());
    final elapsedSecs = difference.inSeconds;

    bool isWithinSixtySeconds = elapsedSecs >= 0 && elapsedSecs <= 60;
    bool isAfterFiveMinutes = elapsedSecs >= 300;

    if (!isWithinSixtySeconds && !isAfterFiveMinutes) {
      return const SizedBox.shrink();
    }

    if (widget.isLargeStyle) {
      final remaining = 60 - elapsedSecs;
      final labelText = isWithinSixtySeconds 
          ? 'Cancel Order (${remaining < 0 ? 0 : remaining}s)' 
          : 'Cancel Order';
      return Padding(
        padding: const EdgeInsets.only(top: 20, bottom: 40),
        child: SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: widget.onPressed,
            icon: const Icon(Icons.cancel_outlined, color: Colors.white),
            label: Text(labelText),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
          ),
        ),
      );
    } else {
      final remaining = 60 - elapsedSecs;
      final labelText = isWithinSixtySeconds 
          ? 'Cancel (${remaining < 0 ? 0 : remaining}s)' 
          : 'Cancel Order';
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextButton(
            onPressed: widget.onPressed,
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            ),
            child: Text(
              labelText,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 8),
        ],
      );
    }
  }
}
