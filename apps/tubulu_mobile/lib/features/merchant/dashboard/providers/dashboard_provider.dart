import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_provider.dart';

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

class DashboardStats {
  final double totalSales;
  final int activeOrders;
  final int totalOrders;
  final int totalProducts;

  const DashboardStats({
    required this.totalSales,
    required this.activeOrders,
    required this.totalOrders,
    required this.totalProducts,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) => DashboardStats(
        totalSales: (json['totalSales'] as num?)?.toDouble() ?? 0.0,
        activeOrders: (json['activeOrders'] as num?)?.toInt() ?? 0,
        totalOrders: (json['totalOrders'] as num?)?.toInt() ?? 0,
        totalProducts: (json['totalProducts'] as num?)?.toInt() ?? 0,
      );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final dashboardStatsProvider = FutureProvider.autoDispose.family<DashboardStats, String>((ref, duration) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/integrations/dashboard/stats?duration=$duration');
  return DashboardStats.fromJson(response.data['data'] as Map<String, dynamic>);
});

final merchantDetailsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/integrations/myDetails');
  return response.data['data'] as Map<String, dynamic>;
});
