import 'package:flutter/material.dart';
import 'package:collection/collection.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/api/api_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/tubulu_image.dart';
import '../../cart/providers/cart_provider.dart';
import '../../home/screens/home_screen.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final merchantStoreDataProvider = FutureProvider.family.autoDispose<Map<String, dynamic>, String>((ref, merchantId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/products/search-app/$merchantId');
  return Map<String, dynamic>.from(response.data);
});

final merchantReviewsProvider = FutureProvider.family.autoDispose<List<dynamic>, String>((ref, merchantId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/user/reviews/$merchantId');
  if (response.data['success'] == true) {
    return List<dynamic>.from(response.data['data'] ?? []);
  }
  return [];
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class CatalogueScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic>? merchant;
  const CatalogueScreen({super.key, this.merchant});

  @override
  ConsumerState<CatalogueScreen> createState() => _CatalogueScreenState();
}

class _CatalogueScreenState extends ConsumerState<CatalogueScreen> {
  String? _selectedCatalogueId;
  int _currentBannerIndex = 0;
  String _searchQuery = '';
  String _dietaryFilter = 'all';
  bool _isGridView = true;

  Widget _buildBannerSlider(Map<String, dynamic> merchant) {
    final String bannerStr = merchant['bannerImage'] ?? merchant['logo'] ?? '';
    final List<String> images = bannerStr.isNotEmpty
        ? bannerStr.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList()
        : [];

    if (images.isEmpty) {
      return Container(
        color: AppTheme.primaryColor.withOpacity(0.2),
        child: const Icon(Icons.store_rounded, size: 64, color: Colors.white24),
      );
    }

    if (images.length == 1) {
      return TubuluImage(
        imageUrl: images.first,
        fit: BoxFit.cover,
      );
    }

    return Stack(
      children: [
        PageView.builder(
          itemCount: images.length,
          onPageChanged: (index) {
            setState(() {
              _currentBannerIndex = index;
            });
          },
          itemBuilder: (context, index) {
            return TubuluImage(
              imageUrl: images[index],
              fit: BoxFit.cover,
            );
          },
        ),
        Positioned(
          bottom: 145, // Position dots above the store details card
          left: 0,
          right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(images.length, (index) {
              final isSelected = index == _currentBannerIndex;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: isSelected ? 12 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white : Colors.white.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final merchant = widget.merchant;
    debugPrint('[TEST-CATALOGUE] merchant map: $merchant');
    if (merchant == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Store')),
        body: const Center(child: Text('No store selected')),
      );
    }

    final merchantId = merchant['id'] ?? merchant['_id'];
    final storeDataAsync = ref.watch(merchantStoreDataProvider(merchantId));
    final cartItems = ref.watch(cartProvider);
    final totalAmount = cartItems.fold(0.0, (sum, item) => sum + (item.price * item.quantity));

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        bottomNavigationBar: cartItems.isNotEmpty
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -2))],
                ),
                child: SafeArea(
                  child: ElevatedButton(
                    onPressed: () => context.push('/customer/cart'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('${cartItems.length} ITEM${cartItems.length > 1 ? 'S' : ''} | ₹$totalAmount', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const Row(
                          children: [
                            Text('View Cart', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            SizedBox(width: 8),
                            Icon(Icons.shopping_cart_checkout, size: 20),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              )
            : null,
        body: storeDataAsync.when(
          data: (data) {
            final catalogues = List<Map<String, dynamic>>.from(data['catalogues'] ?? []);
            final advertisements = List<Map<String, dynamic>>.from(data['advertisements'] ?? []);

            // Default selection if none
            if (catalogues.isNotEmpty) {
              _selectedCatalogueId ??= catalogues.first['catalogueId'];
            }
            
            final activeCatalogue = catalogues.isNotEmpty 
              ? catalogues.firstWhere(
                  (c) => c['catalogueId'] == _selectedCatalogueId, 
                  orElse: () => catalogues.first
                )
              : null;
            
            // Flatten products
            final List<Map<String, dynamic>> flattenedProducts = [];
            if (activeCatalogue != null) {
              final Map<String, dynamic> structuredProducts = activeCatalogue['products'] ?? {};
              structuredProducts.forEach((category, subcatGroups) {
                for (var group in subcatGroups) {
                  final items = List<Map<String, dynamic>>.from(group['items'] ?? []);
                  flattenedProducts.addAll(items);
                }
              });
            }

            // Apply search and dietary filters
            final filteredProducts = flattenedProducts.where((product) {
              final name = (product['productName'] ?? '').toString().toLowerCase();
              final matchesSearch = name.contains(_searchQuery.toLowerCase());
              
              final type = (product['dietaryType'] ?? 'veg').toString().toLowerCase();
              bool matchesDiet = true;
              if (_dietaryFilter != 'all') {
                matchesDiet = type == _dietaryFilter;
              }
              
              return matchesSearch && matchesDiet;
            }).toList();

            return NestedScrollView(
              headerSliverBuilder: (context, innerBoxIsScrolled) {
                return [
                  SliverAppBar(
                    expandedHeight: 250,
                    pinned: true,
                    elevation: 0,
                    backgroundColor: AppTheme.primaryColor,
                    leading: IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
                      onPressed: () => context.pop(),
                    ),
                    actions: [
                      IconButton(
                        icon: const Icon(Icons.favorite_border, color: Colors.white),
                        tooltip: 'Recommend Store',
                        onPressed: () => _showRecommendDialog(context, merchantId),
                      ),
                    ],
                    flexibleSpace: LayoutBuilder(
                      builder: (BuildContext context, BoxConstraints constraints) {
                        final double top = constraints.biggest.height;
                        // collapsed height includes: status bar height + kToolbarHeight (56.0) + TabBar height (46.0)
                        final double collapsedHeight = MediaQuery.of(context).padding.top + kToolbarHeight + 46.0;
                        final bool isCollapsed = top <= collapsedHeight + 15.0;

                        return FlexibleSpaceBar(
                          title: isCollapsed
                              ? Padding(
                                  padding: const EdgeInsets.only(bottom: 48.0), // Shift title up to clear the TabBar
                                  child: Text(
                                    merchant['integrationName'] ?? 'Store',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                )
                              : null,
                          centerTitle: true,
                          background: Stack(
                            fit: StackFit.expand,
                            children: [
                              _buildBannerSlider(merchant),
                              Container(
                                color: Colors.black.withOpacity(0.4),
                              ),
                              Positioned(
                                bottom: 60,
                                left: 16,
                                right: 16,
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 36,
                                      backgroundColor: Colors.white,
                                      child: Padding(
                                        padding: const EdgeInsets.all(4),
                                        child: ClipOval(
                                          child: TubuluImage(
                                            imageUrl: merchant['logo'] ?? '',
                                            fit: BoxFit.cover,
                                            errorWidget: const Icon(Icons.store_rounded, size: 36, color: Colors.grey),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            merchant['integrationName'] ?? 'Store',
                                            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            merchant['category'] ?? 'Retailer',
                                            style: const TextStyle(color: Colors.white70, fontSize: 13),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    bottom: const TabBar(
                      indicatorColor: Colors.white,
                      labelColor: Colors.white,
                      unselectedLabelColor: Colors.white70,
                      tabs: [
                        Tab(text: 'Menu'),
                        Tab(text: 'Reviews'),
                        Tab(text: 'About'),
                      ],
                    ),
                  ),
                ];
              },
              body: TabBarView(
                children: [
                  // 1. MENU TAB
                  Column(
                    children: [
                      // Quick Action Buttons Row
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildQuickAction(Icons.phone, 'Call', () {
                              if (merchant['phoneNumber'] != null) {
                                launchUrl(Uri.parse('tel:${merchant['phoneNumber']}'));
                              }
                            }),
                            _buildQuickAction(Icons.directions, 'Directions', () {
                              if (merchant['latitude'] != null && merchant['longitude'] != null) {
                                launchUrl(Uri.parse('https://maps.google.com/?q=${merchant['latitude']},${merchant['longitude']}'));
                              }
                            }),
                            _buildQuickAction(Icons.share, 'Share', () {
                              Share.share('Check out ${merchant['integrationName']} on Tubulu!');
                            }),
                            _buildQuickAction(Icons.chat_bubble_outline_rounded, 'Chat', () {
                              context.push('/customer/chat', extra: {
                                'merchantId': merchantId,
                                'merchantName': merchant['integrationName'],
                              });
                            }),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      if (advertisements.isNotEmpty) _buildAdBoard(advertisements),
                      if (catalogues.isNotEmpty) _buildCatalogueTabs(catalogues),
                      if ((merchant['isSuspended'] ?? false) == true || (merchant['isActive'] ?? true) == false || (merchant['isApproved'] ?? true) == false)
                        Container(
                          width: double.infinity,
                          color: Colors.red.shade50,
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                          child: Row(
                            children: [
                              Icon(Icons.warning_amber_rounded, color: Colors.red.shade800, size: 20),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'This store is temporarily closed or suspended.',
                                  style: TextStyle(color: Colors.red.shade800, fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Row(
                          children: [
                            Expanded(
                              child: Container(
                                height: 40,
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: TextField(
                                  onChanged: (val) {
                                    setState(() {
                                      _searchQuery = val;
                                    });
                                  },
                                  decoration: const InputDecoration(
                                    hintText: 'Search items...',
                                    hintStyle: TextStyle(color: Colors.grey, fontSize: 14),
                                    prefixIcon: Icon(Icons.search, size: 20, color: Colors.grey),
                                    border: InputBorder.none,
                                    contentPadding: EdgeInsets.symmetric(vertical: 10),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            DropdownButton<String>(
                              value: _dietaryFilter,
                              underline: const SizedBox(),
                              icon: const Icon(Icons.filter_list_rounded, color: AppTheme.primaryColor),
                              items: const [
                                DropdownMenuItem(value: 'all', child: Text('All Types')),
                                DropdownMenuItem(value: 'veg', child: Text('Veg Only')),
                                DropdownMenuItem(value: 'non-veg', child: Text('Non-Veg')),
                                DropdownMenuItem(value: 'vegan', child: Text('Vegan')),
                                DropdownMenuItem(value: 'jain', child: Text('Jain')),
                              ],
                              onChanged: (val) {
                                if (val != null) {
                                  setState(() {
                                    _dietaryFilter = val;
                                  });
                                }
                              },
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                              icon: Icon(_isGridView ? Icons.view_list_rounded : Icons.grid_view_rounded, color: AppTheme.primaryColor),
                              onPressed: () {
                                setState(() {
                                  _isGridView = !_isGridView;
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: _isGridView
                            ? _buildProductGrid(filteredProducts, merchantId)
                            : _buildProductList(filteredProducts, merchantId),
                      ),
                    ],
                  ),

                  // 2. REVIEWS TAB
                  _buildReviewsTab(merchant, merchantId),

                  // 3. ABOUT TAB
                  _buildAboutTab(merchant),
                ],
              ),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Error loading store: $e')),
        ),
      ),
    );
  }

  Widget _buildQuickAction(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppTheme.primaryColor, size: 22),
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.black87)),
        ],
      ),
    );
  }

  Widget _buildAdBoard(List<Map<String, dynamic>> ads) {
    return Container(
      height: 120,
      margin: const EdgeInsets.only(top: 8, bottom: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: ads.length,
        itemBuilder: (context, index) {
          final ad = ads[index];
          final String name = ad['name'] ?? '';
          final String description = ad['description'] ?? '';
          final String displayText = [
            if (name.isNotEmpty) name,
            if (description.isNotEmpty) description,
          ].join(' - ');

          return Container(
            width: MediaQuery.of(context).size.width - 64,
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.grey.shade100,
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(
              children: [
                Positioned.fill(
                  child: TubuluImage(
                    imageUrl: ad['bannerUrl'],
                    fit: BoxFit.cover,
                  ),
                ),
                if (displayText.isNotEmpty)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [
                            Colors.black.withOpacity(0.85),
                            Colors.black.withOpacity(0.0),
                          ],
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      child: MarqueeText(
                        text: displayText,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          shadows: [
                            Shadow(
                              offset: Offset(0.5, 0.5),
                              blurRadius: 2.0,
                              color: Colors.black54,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCatalogueTabs(List<Map<String, dynamic>> catalogues) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: catalogues.length,
        itemBuilder: (context, index) {
          final cat = catalogues[index];
          final catId = cat['catalogueId'];
          final isSelected = catId == _selectedCatalogueId;
          return GestureDetector(
            onTap: () => setState(() => _selectedCatalogueId = catId),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isSelected ? AppTheme.primaryColor : Colors.transparent,
                    width: 2,
                  ),
                ),
              ),
              child: Text(
                cat['catalogueName'] ?? 'Catalogue',
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? AppTheme.primaryColor : Colors.grey.shade600,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildProductGrid(List<Map<String, dynamic>> products, String merchantId) {
    if (products.isEmpty) {
      return const Center(child: Text('This category is empty.'));
    }

    // Check if store is suspended
    final merchant = widget.merchant ?? {};
    final isSuspended = merchant['isSuspended'] == true || merchant['isActive'] != true || merchant['isApproved'] != true;
    final isStoreClosed = _getIsStoreClosed(merchant);

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.58,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return Card(
          elevation: 0,
          clipBehavior: Clip.antiAlias,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: InkWell(
            onTap: () => context.push('/customer/product-details/${product['productId']}/$_selectedCatalogueId', extra: product),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Stack(
                    children: [
                      Container(
                        width: double.infinity,
                        height: double.infinity,
                        color: Colors.grey.shade50,
                        child: product['productImages'] != null && (product['productImages'] as List).isNotEmpty
                          ? TubuluImage(
                              imageUrl: (product['productImages'] as List).first,
                              errorWidget: const Icon(Icons.shopping_bag_outlined, size: 40, color: Colors.grey),
                              fit: BoxFit.cover,
                            )
                          : const Icon(Icons.shopping_bag_outlined, size: 40, color: Colors.grey),
                      ),
                      if (product['isBestseller'] == true)
                        Positioned(
                          top: 8,
                          left: 0,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: const BoxDecoration(
                              color: Color(0xFFFFD54F),
                              borderRadius: BorderRadius.only(topRight: Radius.circular(4), bottomRight: Radius.circular(4)),
                            ),
                            child: const Text(
                              '⭐ BESTSELLER',
                              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 9, color: Colors.black87),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          _buildDietaryIndicator(product['dietaryType']?.toString() ?? 'veg'),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              product['productName'] ?? 'Product',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${product['discountPrice'] ?? product['productPrice'] ?? '0'}',
                        style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          if (product['preparationTime'] != null) ...[
                            const Icon(Icons.access_time, size: 12, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text('${product['preparationTime']}m', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                            const SizedBox(width: 8),
                          ],
                          const Icon(Icons.inventory_2_outlined, size: 12, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text('Stock: ${product['quantity'] ?? 0}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Consumer(
                        builder: (context, ref, _) {
                          final cart = ref.watch(cartProvider);
                          final itemInCart = cart.firstWhereOrNull((i) => i.productId == product['productId']);
                          final int stockQty = int.tryParse(product['quantity']?.toString() ?? '0') ?? 0;
                          final isOutOfStock = stockQty <= 0;
                          if (itemInCart == null) {
                            return SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: (isSuspended || isOutOfStock || isStoreClosed) ? null : () => _showCustomizationSheet(context, product, merchantId),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: (isSuspended || isOutOfStock || isStoreClosed) ? Colors.grey : AppTheme.primaryColor,
                                  foregroundColor: Colors.white,
                                  padding: EdgeInsets.zero,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: Text(isOutOfStock ? 'Out of Stock' : (isStoreClosed ? 'Store Closed' : 'Add'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            );
                          }
                          return Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              GestureDetector(
                                onTap: () => ref.read(cartProvider.notifier).updateQuantity(itemInCart.id, itemInCart.quantity - 1),
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(color: Colors.grey.shade200, shape: BoxShape.circle),
                                  child: const Icon(Icons.remove, size: 16),
                                ),
                              ),
                              Text('${itemInCart.quantity}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              GestureDetector(
                                onTap: () {
                                  final newQty = itemInCart.quantity + 1;
                                  final availableStock = int.tryParse(product['quantity']?.toString() ?? '999') ?? 999;
                                  if (newQty > availableStock) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Only $availableStock units in stock.'),
                                        backgroundColor: Colors.orange,
                                        duration: const Duration(seconds: 2),
                                      ),
                                    );
                                  } else {
                                    ref.read(cartProvider.notifier).updateQuantity(itemInCart.id, newQty);
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
                                  child: const Icon(Icons.add, color: Colors.white, size: 16),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  bool _checkAndAlertDifferentStore(BuildContext context, String merchantId, VoidCallback onConfirm) {
    if (ref.read(cartProvider.notifier).hasItemsFromOtherMerchant(merchantId)) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Different Store'),
          content: const Text('You have items from another store in your cart. Would you like to clear your cart or checkout first?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context); // Close dialog
                context.push('/customer/cart');
              },
              child: const Text('Checkout First'),
            ),
            TextButton(
              onPressed: () {
                ref.read(cartProvider.notifier).clear();
                Navigator.pop(context); // Close dialog
                onConfirm(); // Perform the original add
              },
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              child: const Text('Clear Cart & Add'),
            ),
          ],
        ),
      );
      return false;
    }
    return true;
  }

  void _showCustomizationSheet(BuildContext context, Map<String, dynamic> product, String merchantId) {
    final firstImage = (product['productImages'] as List?)?.isNotEmpty == true 
        ? (product['productImages'] as List).first 
        : '';
        
    final List<dynamic> variantsConfig = product['variantsConfig'] ?? [];
    if (variantsConfig.isEmpty) {
      final itemToAdd = CartItem(
        id: product['productId'],
        productId: product['productId'],
        name: product['productName'] ?? product['name'],
        price: (product['discountPrice'] ?? product['productPrice'] ?? 0).toDouble(),
        imageUrl: firstImage,
        merchantId: merchantId,
        cgst: (product['cgst'] ?? 0).toDouble(),
        sgst: (product['sgst'] ?? 0).toDouble(),
        stock: int.tryParse(product['quantity']?.toString() ?? '999') ?? 999,
      );
      final allowed = _checkAndAlertDifferentStore(context, merchantId, () {
        ref.read(cartProvider.notifier).addItem(itemToAdd);
      });
      if (allowed) {
        ref.read(cartProvider.notifier).addItem(itemToAdd);
      }
      return;
    }

    _executeAddProduct(context, product, firstImage, merchantId);
  }

  void _executeAddProduct(BuildContext context, Map<String, dynamic> product, String firstImage, String merchantId) {
    final List<dynamic> variantsConfig = product['variantsConfig'] ?? [];
    final Map<String, bool> selectionMap = {};

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            double extraCost = 0.0;
            variantsConfig.forEach((group) {
              final groupName = group['groupName'] ?? 'Add-ons';
              final options = List<dynamic>.from(group['options'] ?? []);
              for (var opt in options) {
                final key = "${groupName}_${opt['name']}";
                if (selectionMap[key] == true) {
                  extraCost += (opt['price'] ?? 0).toDouble();
                }
              }
            });

            final basePrice = (product['discountPrice'] ?? product['productPrice'] ?? 0).toDouble();
            final finalPrice = basePrice + extraCost;

            return Container(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Customize ${product['productName']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Expanded(
                    child: ListView(
                      children: variantsConfig.map((group) {
                        final groupName = group['groupName'] ?? 'Add-ons';
                        final options = List<dynamic>.from(group['options'] ?? []);
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(groupName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryColor)),
                            const SizedBox(height: 6),
                            ...options.map((opt) {
                              final name = opt['name'] ?? '';
                              final price = opt['price'] ?? 0;
                              final key = "${groupName}_$name";
                              return CheckboxListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text('$name (+₹$price)', style: const TextStyle(fontSize: 13)),
                                value: selectionMap[key] ?? false,
                                onChanged: (val) {
                                  setSheetState(() {
                                    selectionMap[key] = val ?? false;
                                  });
                                },
                              );
                            }),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        // Gather selected options
                        final List<dynamic> selectedOptionsList = [];
                        variantsConfig.forEach((group) {
                          final groupName = group['groupName'] ?? 'Add-ons';
                          final options = List<dynamic>.from(group['options'] ?? []);
                          for (var opt in options) {
                            final key = "${groupName}_${opt['name']}";
                            if (selectionMap[key] == true) {
                              selectedOptionsList.add({
                                'name': opt['name'],
                                'price': opt['price'],
                              });
                            }
                          }
                        });

                        // Generate unique cart item id
                        final optionsHash = selectedOptionsList.map((o) => o['name']).join('_');
                        final uniqueCartId = optionsHash.isNotEmpty 
                            ? "${product['productId']}_$optionsHash"
                            : product['productId'];

                        final itemToAdd = CartItem(
                          id: uniqueCartId,
                          productId: product['productId'],
                          name: product['productName'],
                          price: finalPrice,
                          imageUrl: firstImage,
                          merchantId: merchantId,
                          selectedOptions: selectedOptionsList,
                          cgst: (product['cgst'] ?? 0).toDouble(),
                          sgst: (product['sgst'] ?? 0).toDouble(),
                          stock: int.tryParse(product['quantity']?.toString() ?? '999') ?? 999,
                        );

                        final allowed = _checkAndAlertDifferentStore(context, merchantId, () {
                          ref.read(cartProvider.notifier).addItem(itemToAdd);
                        });
                        if (allowed) {
                          ref.read(cartProvider.notifier).addItem(itemToAdd);
                          Navigator.pop(context);
                        }
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
                      child: Text('Add Item • ₹${finalPrice.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
            );
          }
        );
      }
    );
  }

  Widget _buildReviewsTab(Map<String, dynamic> merchant, String merchantId) {
    final reviewsAsync = ref.watch(merchantReviewsProvider(merchantId));

    return reviewsAsync.when(
      data: (reviews) {
        double avgRating = 0.0;
        if (reviews.isNotEmpty) {
          final totalRating = reviews.fold<int>(0, (sum, r) => sum + (r['rating'] as num).toInt());
          avgRating = totalRating / reviews.length;
        }

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                const Icon(Icons.star_rounded, color: Colors.amber, size: 40),
                const SizedBox(width: 8),
                Text(
                  reviews.isNotEmpty ? avgRating.toStringAsFixed(1) : 'No reviews',
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      reviews.isNotEmpty
                          ? 'Based on ${reviews.length} ${reviews.length == 1 ? 'review' : 'reviews'}'
                          : 'No reviews yet',
                      style: const TextStyle(color: Colors.black54, fontSize: 13),
                    ),
                    if (reviews.isNotEmpty)
                      Row(
                        children: List.generate(
                          5,
                          (index) => Icon(
                            index < avgRating.round() ? Icons.star : Icons.star_border,
                            color: Colors.amber,
                            size: 16,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Customer Recommendations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            if (reviews.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 32),
                  child: Text(
                    'No recommendations yet from contacts.',
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                ),
              )
            else
              ...reviews.map((rev) {
                final userObj = rev['user'] ?? {};
                final firstName = userObj['firstName'] ?? 'Anonymous';
                final lastName = userObj['lastName'] ?? '';
                final fullName = '$firstName $lastName'.trim();
                final rating = (rev['rating'] as num?)?.toInt() ?? 5;
                final text = rev['reviewText'] ?? '';
                return _buildDummyReview(fullName, rating, text);
              }),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error loading reviews: $e')),
    );
  }

  Widget _buildDummyReview(String user, int rating, String text) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(user, style: const TextStyle(fontWeight: FontWeight.bold)),
                Row(children: List.generate(5, (i) => Icon(i < rating ? Icons.star : Icons.star_border, color: Colors.amber, size: 14))),
              ],
            ),
            const SizedBox(height: 6),
            Text(text, style: const TextStyle(color: Colors.black87, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutTab(Map<String, dynamic> merchant) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(merchant['integrationName'] ?? 'Store Details', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 8),
        Text(merchant['description'] ?? 'No description available for this store.', style: const TextStyle(color: Colors.black54, fontSize: 14)),
        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 16),
        Row(
          children: [
            const Icon(Icons.location_on_outlined, color: Colors.grey),
            const SizedBox(width: 12),
            Expanded(child: Text(merchant['addressLine'] ?? 'Main Street, Tubulu City, India')),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            const Icon(Icons.phone_outlined, color: Colors.grey),
            const SizedBox(width: 12),
            Text(merchant['phoneNumber'] ?? 'No phone number available'),
          ],
        ),
        if (merchant['website'] != null) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.web, color: Colors.grey),
              const SizedBox(width: 12),
              Text(merchant['website']),
            ],
          ),
        ],
        const SizedBox(height: 24),
        const Text('Opening Hours', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        _buildOpeningHours(merchant['openingHours']),
      ],
    );
  }

  Widget _buildOpeningHours(Map<String, dynamic>? hours) {
    if (hours == null) {
      return const Text('Open: 9:00 AM - 10:00 PM (Daily)', style: TextStyle(color: Colors.black87, fontSize: 13));
    }
    final days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: days.map((day) {
        final config = hours[day];
        final open = config?['open'] ?? '09:00';
        final close = config?['close'] ?? '22:00';
        final isOpen = config?['isOpen'] ?? true;
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(day[0].toUpperCase() + day.substring(1), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              Text(isOpen ? '$open - $close' : 'Closed', style: TextStyle(color: isOpen ? Colors.black87 : Colors.red, fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
        );
      }).toList(),
    );
  }

  void _showRecommendDialog(BuildContext context, String merchantId) {
    int selectedRating = 5;
    final textController = TextEditingController();
    bool isSubmitting = false;

    final category = widget.merchant?['category']?.toString() ?? '';
    final verticalType = widget.merchant?['verticalType']?.toString() ?? '';
    final merchantName = widget.merchant?['integrationName']?.toString() ?? '';

    final isFood = category.toUpperCase() == 'FB' ||
                   category.toUpperCase().contains('FOOD') ||
                   category.toUpperCase().contains('RESTAURANT') ||
                   category.toUpperCase().contains('BAKERY') ||
                   category.toUpperCase().contains('COFFEE') ||
                   category.toUpperCase().contains('CAFE') ||
                   verticalType.toUpperCase() == 'FB' ||
                   merchantName.toUpperCase().contains('COFFEE') ||
                   merchantName.toUpperCase().contains('BAKERY') ||
                   merchantName.toUpperCase().contains('VEG') ||
                   merchantName.toUpperCase().contains('RESTAURANT') ||
                   merchantName.toUpperCase().contains('CAFE') ||
                   merchantName.toUpperCase().contains('FOOD') ||
                   merchantName.toUpperCase().contains('KITCHEN') ||
                   merchantName.toUpperCase().contains('IDLI') ||
                   merchantName.toUpperCase().contains('CHAT') ||
                   merchantName.toUpperCase().contains('SWEET') ||
                   merchantName.toUpperCase().contains('BIRYANI') ||
                   merchantName.toUpperCase().contains('BHAVAN');

    final itemType = isFood ? 'Food' : 'Product';
    final titleText = 'Recommend this $itemType';
    final ratingPrompt = 'Rate this ${itemType.toLowerCase()} (1 to 5 stars):';
    final hintText = 'Share why you recommend this ${itemType.toLowerCase()} to your contacts...';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(titleText),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(ratingPrompt),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starVal = index + 1;
                  return IconButton(
                    icon: Icon(
                      starVal <= selectedRating ? Icons.star : Icons.star_border,
                      color: Colors.amber,
                    ),
                    onPressed: () {
                      setDialogState(() {
                        selectedRating = starVal;
                      });
                    },
                  );
                }),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: textController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: hintText,
                  border: const OutlineInputBorder(),
                ),
              ),
            ],
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
                      setDialogState(() => isSubmitting = true);
                      try {
                        final dio = ref.read(dioProvider);
                        await dio.post('/user/reviews', data: {
                          'integrationId': merchantId,
                          'rating': selectedRating,
                          'reviewText': textController.text.trim(),
                        });
                        ref.invalidate(merchantReviewsProvider(merchantId));
                        ref.invalidate(personalizedRecommendationsProvider);
                        if (context.mounted) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Recommendation shared with your contacts!'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      } catch (e) {
                        setDialogState(() => isSubmitting = false);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Failed to submit: $e'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      }
                    },
              child: isSubmitting
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDietaryIndicator(String type) {
    final isVeg = type.toLowerCase() == 'veg';
    final color = isVeg ? Colors.green.shade700 : Colors.red.shade800;
    
    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        border: Border.all(color: color, width: 1.2),
        borderRadius: BorderRadius.circular(2),
      ),
      child: Icon(
        Icons.circle,
        size: 8,
        color: color,
      ),
    );
  }

  Widget _buildProductList(List<Map<String, dynamic>> products, String merchantId) {
    if (products.isEmpty) {
      return const Center(child: Text('No products match your search or filter.'));
    }

    // Check if store is suspended
    final merchant = widget.merchant ?? {};
    final isSuspended = merchant['isSuspended'] == true || merchant['isActive'] != true || merchant['isApproved'] != true;
    final isStoreClosed = _getIsStoreClosed(merchant);

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: products.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final product = products[index];
        return Card(
          elevation: 0,
          clipBehavior: Clip.antiAlias,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: InkWell(
            onTap: () => context.push('/customer/product-details/${product['productId']}/$_selectedCatalogueId', extra: product),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: product['productImages'] != null && (product['productImages'] as List).isNotEmpty
                        ? TubuluImage(
                            imageUrl: (product['productImages'] as List).first,
                            errorWidget: const Icon(Icons.shopping_bag_outlined, size: 28, color: Colors.grey),
                            fit: BoxFit.cover,
                          )
                        : const Icon(Icons.shopping_bag_outlined, size: 28, color: Colors.grey),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            _buildDietaryIndicator(product['dietaryType']?.toString() ?? 'veg'),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                product['productName'] ?? 'Product',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '₹${product['discountPrice'] ?? product['productPrice'] ?? '0'}',
                          style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            if (product['preparationTime'] != null) ...[
                              Icon(Icons.access_time, size: 12, color: Colors.grey.shade600),
                              const SizedBox(width: 4),
                              Text('${product['preparationTime']} mins', style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                              const SizedBox(width: 12),
                            ],
                            Icon(Icons.inventory_2_outlined, size: 12, color: Colors.grey.shade600),
                            const SizedBox(width: 4),
                            Text('Stock: ${product['quantity'] ?? 0}', style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    width: 85,
                    child: Consumer(
                      builder: (context, ref, _) {
                        final cart = ref.watch(cartProvider);
                        final itemInCart = cart.firstWhereOrNull((i) => i.productId == product['productId']);
                        final int stockQty = int.tryParse(product['quantity']?.toString() ?? '0') ?? 0;
                        final isOutOfStock = stockQty <= 0;
                        if (itemInCart == null) {
                          return ElevatedButton(
                            onPressed: (isSuspended || isOutOfStock || isStoreClosed) ? null : () => _showCustomizationSheet(context, product, merchantId),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: (isSuspended || isOutOfStock || isStoreClosed) ? Colors.grey : AppTheme.primaryColor,
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.zero,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: Text(isOutOfStock ? 'Out of Stock' : (isStoreClosed ? 'Store Closed' : 'Add'), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                          );
                        }
                        return Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            GestureDetector(
                              onTap: () => ref.read(cartProvider.notifier).updateQuantity(itemInCart.id, itemInCart.quantity - 1),
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(color: Colors.grey.shade200, shape: BoxShape.circle),
                                child: const Icon(Icons.remove, size: 12),
                              ),
                            ),
                            Text('${itemInCart.quantity}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            GestureDetector(
                              onTap: () {
                                final newQty = itemInCart.quantity + 1;
                                final availableStock = int.tryParse(product['quantity']?.toString() ?? '999') ?? 999;
                                if (newQty > availableStock) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Only $availableStock units in stock.'),
                                      backgroundColor: Colors.orange,
                                      duration: const Duration(seconds: 2),
                                    ),
                                  );
                                } else {
                                  ref.read(cartProvider.notifier).updateQuantity(itemInCart.id, newQty);
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
                                child: const Icon(Icons.add, color: Colors.white, size: 12),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  bool _getIsStoreClosed(Map<String, dynamic> merchant) {
    try {
      if (merchant['isSuspended'] == true) return true;
      if (merchant['isActive'] != true) return true;
      if (merchant['isApproved'] != true) return true;
      final openingHours = merchant['openingHours'];
      if (openingHours == null) return false;
      final now = DateTime.now();
      final days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      final dayName = days[now.weekday - 1];
      final dayConfig = openingHours[dayName];
      if (dayConfig == null) return false;
      if (dayConfig['isOpen'] == false) return true;
      
      final openStr = dayConfig['open'] as String?;
      final closeStr = dayConfig['close'] as String?;
      if (openStr == null || closeStr == null) return false;
      
      final openParts = openStr.split(':');
      final closeParts = closeStr.split(':');
      final openMinutes = int.parse(openParts[0]) * 60 + int.parse(openParts[1]);
      final closeMinutes = int.parse(closeParts[0]) * 60 + int.parse(closeParts[1]);
      final nowMinutes = now.hour * 60 + now.minute;
      
      return !(nowMinutes >= openMinutes && nowMinutes <= closeMinutes);
    } catch (e) {
      return false;
    }
  }
}

class MarqueeText extends StatefulWidget {
  final String text;
  final TextStyle style;
  final double speed;

  const MarqueeText({
    super.key,
    required this.text,
    required this.style,
    this.speed = 30.0,
  });

  @override
  State<MarqueeText> createState() => _MarqueeTextState();
}

class _MarqueeTextState extends State<MarqueeText> {
  late ScrollController _scrollController;
  bool _scrolling = false;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) => _startScrolling());
  }

  @override
  void dispose() {
    _scrolling = false;
    _scrollController.dispose();
    super.dispose();
  }

  void _startScrolling() async {
    if (!mounted) return;
    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;

    if (!_scrollController.hasClients) return;
    final maxScrollExtent = _scrollController.position.maxScrollExtent;
    if (maxScrollExtent <= 0) return;

    _scrolling = true;

    while (_scrolling && mounted) {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted || !_scrolling || !_scrollController.hasClients) break;
      final currentMax = _scrollController.position.maxScrollExtent;
      final duration = Duration(
        milliseconds: (currentMax / widget.speed * 1000).toInt(),
      );
      await _scrollController.animateTo(
        currentMax,
        duration: duration,
        curve: Curves.linear,
      );
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted || !_scrolling || !_scrollController.hasClients) break;
      _scrollController.jumpTo(0.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      controller: _scrollController,
      scrollDirection: Axis.horizontal,
      physics: const NeverScrollableScrollPhysics(),
      child: Text(
        widget.text,
        style: widget.style,
      ),
    );
  }
}
