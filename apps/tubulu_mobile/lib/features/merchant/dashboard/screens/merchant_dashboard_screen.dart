import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tubulu_mobile/core/auth/auth_provider.dart';
import '../providers/dashboard_provider.dart';

class MerchantDashboardScreen extends ConsumerStatefulWidget {
  const MerchantDashboardScreen({super.key});

  @override
  ConsumerState<MerchantDashboardScreen> createState() => _MerchantDashboardScreenState();
}

class _MerchantDashboardScreenState extends ConsumerState<MerchantDashboardScreen> {
  String _selectedDuration = 'all';

  @override
  Widget build(BuildContext context) {
    final statsAsync = ref.watch(dashboardStatsProvider(_selectedDuration));
    final detailsAsync = ref.watch(merchantDetailsProvider);

    return Scaffold(
      appBar: AppBar(
        title: detailsAsync.when(
          data: (data) => Text(
            data['integrationName']?.toString() ?? 'Merchant Dashboard',
            maxLines: 2,
            overflow: TextOverflow.visible,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          loading: () => const Text('Loading...', style: TextStyle(fontWeight: FontWeight.bold)),
          error: (_, __) => const Text('Merchant Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(dashboardStatsProvider(_selectedDuration));
              ref.invalidate(merchantDetailsProvider);
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.red),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Order Trends Filter',
                    style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black87),
                  ),
                  DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedDuration,
                      icon: const Icon(Icons.filter_list_rounded, color: Colors.blue),
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue, fontSize: 14),
                      onChanged: (String? val) {
                        if (val != null) {
                          setState(() {
                            _selectedDuration = val;
                          });
                        }
                      },
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('All Time')),
                        DropdownMenuItem(value: 'today', child: Text('Today')),
                        DropdownMenuItem(value: 'week', child: Text('Last 7 Days')),
                        DropdownMenuItem(value: 'month', child: Text('Last 30 Days')),
                        DropdownMenuItem(value: 'year', child: Text('Last Year')),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: statsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 12),
                    Text('Could not load stats', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    Text(e.toString(), textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () => ref.invalidate(dashboardStatsProvider(_selectedDuration)),
                      icon: const Icon(Icons.refresh),
                      label: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (stats) => GridView.count(
                crossAxisCount: 2,
                padding: const EdgeInsets.all(16),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                children: [
                  _buildStatCard(
                    context,
                    'Total Sales',
                    '₹${stats.totalSales.toStringAsFixed(0)}',
                    Icons.account_balance_wallet,
                    Colors.blue,
                  ),
                  _buildStatCard(
                    context,
                    'Active Orders',
                    '${stats.activeOrders}',
                    Icons.shopping_bag,
                    Colors.orange,
                  ),
                  _buildStatCard(
                    context,
                    'Total Orders',
                    '${stats.totalOrders}',
                    Icons.assignment_outlined,
                    Colors.amber,
                  ),
                  _buildStatCard(
                    context,
                    'Products',
                    '${stats.totalProducts}',
                    Icons.inventory,
                    Colors.green,
                  ),
                  _buildStatCard(
                    context,
                    'Store Status',
                    'Online',
                    Icons.store,
                    Colors.teal,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, String title, String value,
      IconData icon, Color color) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: color),
            ),
            const SizedBox(height: 12),
            Text(value,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(title,
                style: const TextStyle(color: Colors.grey, fontSize: 13),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
