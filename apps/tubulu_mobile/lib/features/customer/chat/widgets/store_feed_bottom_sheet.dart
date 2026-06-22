import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../cart/providers/cart_provider.dart';

final storeFeedsProvider = FutureProvider.family.autoDispose<List<dynamic>, String>((ref, storeId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/feeds/public/stores/$storeId/feeds');
  if (response.data['success'] == true && response.data['data'] != null) {
    return List<dynamic>.from(response.data['data']);
  }
  return [];
});

String _formatImageUrl(String? url) {
  if (url == null || url.isEmpty) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  final baseHost = ApiConfig.baseUrl.replaceAll('/api/v1', '');
  return '$baseHost$url';
}

class StoreFeedBottomSheet extends ConsumerWidget {
  final String storeId;

  const StoreFeedBottomSheet({super.key, required this.storeId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final feedsAsync = ref.watch(storeFeedsProvider(storeId));

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.only(top: 8, bottom: 24),
      height: MediaQuery.of(context).size.height * 0.75,
      child: Column(
        children: [
          // Drag handle bar
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
            child: Row(
              children: [
                const Icon(Icons.campaign, color: Colors.orange, size: 28),
                const SizedBox(width: 10),
                const Text(
                  'Store Moments & Vibe',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: feedsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 12),
                    const Text(
                      'Failed to load feeds',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 4),
                    Text(err.toString(), style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ),
              data: (feeds) {
                if (feeds.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.campaign_outlined, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        const Text(
                          'No updates or campaigns yet',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 40),
                          child: Text(
                            'Follow this shop for celebrity visits, flash discounts, and moments!',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: feeds.length,
                  itemBuilder: (context, index) {
                    final feed = feeds[index];
                    final String title = feed['title'] ?? 'Store Announcement';
                    final String desc = feed['description'] ?? '';
                    final String? mediaUrl = feed['mediaUrl'];
                    final String dateStr = feed['createdAt'] != null
                        ? _formatTimeAgo(DateTime.parse(feed['createdAt']))
                        : 'Just now';

                    final Map<String, dynamic>? product = feed['linkedProduct'];

                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(color: Colors.grey[200]!),
                      ),
                      elevation: 0,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Feed Image
                          if (mediaUrl != null && mediaUrl.isNotEmpty)
                            ClipRRect(
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                              child: Image.network(
                                _formatImageUrl(mediaUrl),
                                fit: BoxFit.cover,
                                width: double.infinity,
                                height: 180,
                                errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                              ),
                            ),
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Time ago
                                Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 12, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text(
                                      dateStr,
                                      style: TextStyle(color: Colors.grey[600], fontSize: 11),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                // Title
                                Text(
                                  title,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                // Description
                                Text(
                                  desc,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey[800],
                                    height: 1.3,
                                  ),
                                ),
                                // Product Action Box
                                if (product != null) ...[
                                  const SizedBox(height: 16),
                                  Builder(
                                    builder: (context) {
                                      final List<dynamic> imageUrls = product['imageUrls'] is List ? product['imageUrls'] : [];
                                      final String? firstImage = imageUrls.isNotEmpty ? imageUrls.first?.toString() : null;
                                      return Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: Colors.orange.withValues(alpha: 0.05),
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(color: Colors.orange.withValues(alpha: 0.15)),
                                        ),
                                        child: Row(
                                          children: [
                                            if (firstImage != null && firstImage.isNotEmpty)
                                              ClipRRect(
                                                borderRadius: BorderRadius.circular(8),
                                                child: Image.network(
                                                  _formatImageUrl(firstImage),
                                                  width: 48,
                                                  height: 48,
                                                  fit: BoxFit.cover,
                                                  errorBuilder: (c, e, s) => Container(
                                                    width: 48,
                                                    height: 48,
                                                    color: Colors.grey[200],
                                                    child: const Icon(Icons.image, color: Colors.grey),
                                                  ),
                                                ),
                                              )
                                            else
                                              Container(
                                                width: 48,
                                                height: 48,
                                                decoration: BoxDecoration(
                                                  color: Colors.grey[100],
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: const Icon(Icons.shopping_bag_outlined, color: Colors.grey),
                                              ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    product['name']?.toString() ?? 'Linked Product',
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Text(
                                                    '₹${product['price']?.toString() ?? '0'}',
                                                    style: const TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      color: Colors.orange,
                                                      fontSize: 13,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            ElevatedButton(
                                              onPressed: () {
                                                final double priceVal = double.tryParse(product['price']?.toString() ?? '0') ?? 0.0;
                                                final itemToAdd = CartItem(
                                                  id: product['id'],
                                                  productId: product['id'],
                                                  name: product['name'] ?? 'Product',
                                                  price: priceVal,
                                                  imageUrl: _formatImageUrl(firstImage ?? ''),
                                                  merchantId: storeId,
                                                  stock: 999,
                                                );
                                                ref.read(cartProvider.notifier).addItem(itemToAdd);
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  SnackBar(
                                                    content: Text('${product['name']} added to cart!'),
                                                    duration: const Duration(seconds: 1),
                                                  ),
                                                );
                                              },
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: Colors.orange,
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                elevation: 0,
                                              ),
                                              child: const Text('Add', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime dt) {
    final duration = DateTime.now().difference(dt);
    if (duration.inMinutes < 1) return 'Just now';
    if (duration.inMinutes < 60) return '${duration.inMinutes}m ago';
    if (duration.inHours < 24) return '${duration.inHours}h ago';
    if (duration.inDays < 7) return '${duration.inDays}d ago';
    return DateFormat('dd MMM yyyy').format(dt);
  }
}
