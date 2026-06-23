import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/api/api_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../cart/screens/cart_screen.dart';

final rewardsHistoryProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/user/wallet');
  return Map<String, dynamic>.from(response.data['data']);
});

class RewardsScreen extends ConsumerWidget {
  const RewardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(rewardsHistoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Rewards', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: walletAsync.when(
        data: (wallet) {
          final points = wallet['points'] ?? 0;
          final cashBalance = wallet['cashBalance'] ?? '0.00';
          final referralCode = wallet['referralCode'] ?? 'TUBULU';
          final List<dynamic> transactions = wallet['transactions'] ?? [];

          return RefreshIndicator(
            onRefresh: () => ref.refresh(rewardsHistoryProvider.future),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Points & Cash Balance Card
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Container(
                    decoration: const BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.all(Radius.circular(16)),
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Total Balance', style: TextStyle(color: Colors.white70, fontSize: 14)),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('$points Pts', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                            Text('₹$cashBalance', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text('10 Points = ₹1.00 Wallet Cash', style: TextStyle(color: Colors.white60, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Refer & Earn Section
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade200)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        const Icon(Icons.people_outline_rounded, size: 48, color: AppTheme.primaryColor),
                        const SizedBox(height: 12),
                        const Text('Refer & Earn Points', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        const SizedBox(height: 6),
                        const Text('Share your referral code. For every friend who registers and places their first order, you both get 100 points!', textAlign: TextAlign.center, style: TextStyle(color: Colors.black54, fontSize: 13)),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(12)),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(referralCode, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primaryColor, letterSpacing: 1.5)),
                              IconButton(
                                icon: const Icon(Icons.share, color: AppTheme.primaryColor),
                                onPressed: () {
                                  Share.share('Join me on Tubulu! Use my referral code: $referralCode to get 100 points on sign up.');
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Transactions / Points History
                const Text('Points & Cash History', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 12),
                if (transactions.isEmpty)
                  const Center(child: Padding(padding: EdgeInsets.all(20), child: Text('No transaction history yet', style: TextStyle(color: Colors.grey))))
                else
                  ...transactions.map((tx) {
                    final isEarn = tx['points'] > 0;
                    return Card(
                      elevation: 0,
                      margin: const EdgeInsets.only(bottom: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: isEarn ? Colors.green.shade50 : Colors.red.shade50,
                          child: Icon(
                            isEarn ? Icons.add_circle_outline : Icons.remove_circle_outline,
                            color: isEarn ? Colors.green : Colors.red,
                          ),
                        ),
                        title: Text(tx['description'] ?? 'Transaction', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: Text(tx['createdAt'] != null ? tx['createdAt'].toString().substring(0, 10) : ''),
                        trailing: Text(
                          isEarn ? '+${tx['points']} pts' : '${tx['points']} pts',
                          style: TextStyle(fontWeight: FontWeight.bold, color: isEarn ? Colors.green : Colors.red),
                        ),
                      ),
                    );
                  }),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error loading rewards: $e')),
      ),
    );
  }
}
