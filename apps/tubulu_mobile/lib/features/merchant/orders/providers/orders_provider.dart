import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_provider.dart';

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

class MerchantOrder {
  final String orderId;
  final String customerName;
  final String customerPhone;
  final double totalPrice;
  final String status;
  final String paymentMethod;
  final String orderDate;
  final List<Map<String, dynamic>> products;

  const MerchantOrder({
    required this.orderId,
    required this.customerName,
    required this.customerPhone,
    required this.totalPrice,
    required this.status,
    required this.paymentMethod,
    required this.orderDate,
    required this.products,
  });

  factory MerchantOrder.fromJson(Map<String, dynamic> json) {
    final customer = json['customer'] as Map<String, dynamic>? ?? {};
    return MerchantOrder(
      orderId: json['orderId']?.toString() ?? '',
      customerName: customer['name'] ?? 'Unknown',
      customerPhone: customer['phone'] ?? '',
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
      status: json['orderStatus'] ?? json['status'] ?? 'waiting',
      paymentMethod: json['payment']?['method'] ?? 'cod',
      orderDate: json['orderDate'] ?? '',
      products: List<Map<String, dynamic>>.from(json['products'] ?? []),
    );
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final merchantOrdersProvider =
    FutureProvider.autoDispose<List<MerchantOrder>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/orders/all');
  final data = response.data['data'];
  final List<dynamic> list = data['data'] ?? data ?? [];
  return list.map((e) => MerchantOrder.fromJson(e as Map<String, dynamic>)).toList();
});

// ---------------------------------------------------------------------------
// Order status update notifier
// ---------------------------------------------------------------------------

class OrderStatusNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;
  OrderStatusNotifier(this._ref) : super(const AsyncData(null));

  Future<void> updateStatus(String orderId, String newStatus) async {
    state = const AsyncLoading();
    try {
      final dio = _ref.read(dioProvider);
      await dio.put('/orders/update-order-status', data: {
        'orderId': orderId,
        'status': newStatus,
      });
      state = const AsyncData(null);
      _ref.invalidate(merchantOrdersProvider);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }
}

final orderStatusNotifierProvider =
    StateNotifierProvider.autoDispose<OrderStatusNotifier, AsyncValue<void>>(
        (ref) => OrderStatusNotifier(ref));
