import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/orders_provider.dart';

class MerchantOrdersScreen extends ConsumerWidget {
  const MerchantOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(merchantOrdersProvider);
    final statusNotifier = ref.watch(orderStatusNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/merchant/dashboard');
            }
          },
        ),
        title: const Text('Store Orders'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(merchantOrdersProvider),
          ),
        ],
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              const Text('Failed to load orders'),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(merchantOrdersProvider),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (orders) {
          if (orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_bag_outlined, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  const Text('No orders yet', style: TextStyle(fontSize: 18, color: Colors.grey)),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(merchantOrdersProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final order = orders[index];
                return _OrderCard(
                  order: order,
                  isUpdating: statusNotifier.isLoading,
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _OrderCard extends ConsumerWidget {
  final MerchantOrder order;
  final bool isUpdating;

  const _OrderCard({
    required this.order,
    required this.isUpdating,
  });

  Color _statusColor(String status) {
    switch (status) {
      case 'accepted': return Colors.green;
      case 'canceled': return Colors.red;
      case 'delivered': return Colors.blue;
      case 'packing': return Colors.purple;
      case 'dispatched': return Colors.indigo;
      default: return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Order #${order.orderId.length > 8 ? order.orderId.substring(0, 8) : order.orderId}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor(order.status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    order.status.toUpperCase(),
                    style: TextStyle(
                        color: _statusColor(order.status),
                        fontSize: 11,
                        fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const Divider(height: 20),
            Row(
              children: [
                const Icon(Icons.person_outline, size: 16, color: Colors.grey),
                const SizedBox(width: 6),
                Text(order.customerName,
                    style: const TextStyle(color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.phone_outlined, size: 16, color: Colors.grey),
                const SizedBox(width: 6),
                Text(order.customerPhone,
                    style: const TextStyle(color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '₹${order.totalPrice.toStringAsFixed(0)}',
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(order.orderDate,
                    style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
            if (order.status == 'waiting') ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: isUpdating
                          ? null
                          : () => ref
                              .read(orderStatusNotifierProvider.notifier)
                              .updateStatus(order.orderId, 'canceled'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                      ),
                      child: const Text('Reject'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: isUpdating
                          ? null
                          : () => ref
                              .read(orderStatusNotifierProvider.notifier)
                              .updateStatus(order.orderId, 'accepted'),
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green),
                      child: isUpdating
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            )
                          : const Text('Accept'),
                    ),
                  ),
                ],
              ),
            ] else if (order.status == 'accepted') ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: isUpdating
                          ? null
                          : () => ref
                              .read(orderStatusNotifierProvider.notifier)
                              .updateStatus(order.orderId, 'canceled'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: isUpdating
                          ? null
                          : () => ref
                              .read(orderStatusNotifierProvider.notifier)
                              .updateStatus(order.orderId, 'packing'),
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          foregroundColor: Colors.white),
                      child: const Text('Start Packing'),
                    ),
                  ),
                ],
              ),
            ] else if (order.status == 'packing') ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: isUpdating
                          ? null
                          : () => ref
                              .read(orderStatusNotifierProvider.notifier)
                              .updateStatus(order.orderId, 'dispatched'),
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.purple,
                          foregroundColor: Colors.white),
                      child: const Text('Dispatch Order'),
                    ),
                  ),
                ],
              ),
            ] else if (order.status == 'dispatched') ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: isUpdating
                          ? null
                          : () => ref
                              .read(orderStatusNotifierProvider.notifier)
                              .updateStatus(order.orderId, 'delivered'),
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white),
                      child: const Text('Mark as Delivered'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
