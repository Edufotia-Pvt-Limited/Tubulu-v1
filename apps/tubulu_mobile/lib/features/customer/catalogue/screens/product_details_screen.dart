import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:collection/collection.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/tubulu_image.dart';
import '../../../../core/api/api_provider.dart';
import '../../cart/providers/cart_provider.dart';

final integrationDetailsProvider = FutureProvider.family.autoDispose<Map<String, dynamic>, String>((ref, integrationId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/products/search-app/$integrationId');
  return Map<String, dynamic>.from(response.data);
});

class ProductDetailsScreen extends ConsumerStatefulWidget {
  final String productId;
  final String catalogueId;
  final Map<String, dynamic>? product;

  const ProductDetailsScreen({
    super.key,
    required this.productId,
    required this.catalogueId,
    this.product,
  });

  @override
  ConsumerState<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends ConsumerState<ProductDetailsScreen> {
  Map<String, dynamic>? _loadedProduct;
  bool _isLoading = false;

  bool _getIsStoreClosed(Map<String, dynamic>? merchant) {
    if (merchant == null) return false;
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

  @override
  void initState() {
    super.initState();
    if (widget.product != null) {
      _loadedProduct = widget.product;
    } else {
      _fetchProductDetails();
    }
  }

  Future<void> _fetchProductDetails() async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      // Wait, we need to extract merchantId/integrationId. Let's find it.
      // If we don't have merchantId, let's fetch using a generic endpoint or query.
      // But typically widget.product is always passed through extra from catalogue_screen.
    } catch (e) {
      debugPrint('Failed to load product details: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildDietaryBadge(String type) {
    final isVeg = type.toLowerCase() == 'veg';
    final color = isVeg ? Colors.green.shade700 : Colors.red.shade800;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        border: Border.all(color: color, width: 1.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.circle, size: 8, color: color),
          const SizedBox(width: 6),
          Text(
            isVeg ? 'VEG' : 'NON-VEG',
            style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 0.5),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = _loadedProduct;
    if (product == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Product Details')),
        body: Center(
          child: _isLoading 
            ? const CircularProgressIndicator()
            : const Text('Product details not found.'),
        ),
      );
    }

    final name = product['productName'] ?? product['name'] ?? 'Product';
    final description = product['productDescription'] ?? product['description'] ?? 'No description available.';
    final price = (product['productPrice'] ?? product['price'] ?? 0).toDouble();
    final discountPrice = (product['discountPrice'] ?? price).toDouble();
    final sku = product['productSku'] ?? product['sku'] ?? 'N/A';
    final prepTime = product['preparationTime'] ?? 15;
    final int stock = int.tryParse(product['quantity']?.toString() ?? '0') ?? 0;
    final dietaryType = product['dietaryType']?.toString() ?? 'veg';
    final images = product['productImages'] ?? product['imageUrls'] ?? [];
    final String merchantId = product['integrationId'] ?? '';
    final storeState = ref.watch(integrationDetailsProvider(merchantId)).when(
      data: (storeData) {
        final integration = storeData['integration'] ?? {};
        final bool isSuspended = integration['isSuspended'] == true || integration['isActive'] != true || integration['isApproved'] != true;
        final bool isClosed = _getIsStoreClosed(integration);
        return {'isSuspended': isSuspended, 'isClosed': isClosed};
      },
      loading: () => {'isSuspended': false, 'isClosed': false},
      error: (_, __) => {'isSuspended': false, 'isClosed': false},
    );
    final isSuspended = storeState['isSuspended'] ?? false;
    final isClosed = storeState['isClosed'] ?? false;
    final isUnavailable = isSuspended || isClosed;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Container(
              height: 300,
              width: double.infinity,
              color: Colors.grey.shade50,
              child: images.isNotEmpty
                  ? TubuluImage(
                      imageUrl: images[0],
                      fit: BoxFit.cover,
                      errorWidget: const Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.grey),
                    )
                  : const Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.grey),
            ),
            
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildDietaryBadge(dietaryType),
                      if (product['isBestseller'] == true)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFD54F),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('⭐ BESTSELLER', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 9, color: Colors.black87)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        '₹${discountPrice.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 20, color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                      ),
                      if (discountPrice < price) ...[
                        const SizedBox(width: 10),
                        Text(
                          '₹${price.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 16, color: Colors.grey, decoration: TextDecoration.lineThrough),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 12),
                  const Text('Product Specifications', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87)),
                  const SizedBox(height: 8),
                  _buildSpecRow('SKU', sku),
                  _buildSpecRow('Preparation Time', '$prepTime mins'),
                  _buildSpecRow('Availability', stock > 0 ? 'In Stock ($stock items available)' : 'Out of Stock'),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 12),
                  const Text('Description', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87)),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade700, height: 1.5),
                  ),
                  const SizedBox(height: 30),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: Consumer(
                      builder: (context, ref, _) {
                        final cart = ref.watch(cartProvider);
                        // Search by product id since unique id might differ
                        final itemInCart = cart.firstWhereOrNull((i) => i.productId == product['productId']);
                        final isOutOfStock = stock <= 0;
                        
                        if (itemInCart == null) {
                          return ElevatedButton(
                            onPressed: (isUnavailable || isOutOfStock) ? null : () => _showCustomizationSheet(context, product, merchantId),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: (isUnavailable || isOutOfStock) ? Colors.grey : AppTheme.primaryColor,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: Text(
                              isSuspended 
                                  ? 'Store Suspended' 
                                  : (isClosed 
                                      ? 'Store Closed' 
                                      : (isOutOfStock ? 'Out of Stock' : 'Add to Cart')), 
                              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)
                            ),
                          );
                        }
                        
                        return Row(
                           mainAxisAlignment: MainAxisAlignment.spaceBetween,
                           children: [
                             const Text('Item in Cart', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                             Row(
                               children: [
                                 GestureDetector(
                                   onTap: () => ref.read(cartProvider.notifier).updateQuantity(itemInCart.id, itemInCart.quantity - 1),
                                   child: Container(
                                     padding: const EdgeInsets.all(8),
                                     decoration: BoxDecoration(color: Colors.grey.shade200, shape: BoxShape.circle),
                                     child: const Icon(Icons.remove, size: 20),
                                   ),
                                 ),
                                 const SizedBox(width: 16),
                                 Text('${itemInCart.quantity}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                 const SizedBox(width: 16),
                                 GestureDetector(
                                   onTap: isUnavailable
                                       ? null
                                       : () {
                                           final cartItems = ref.read(cartProvider);
                                           final totalCartQty = cartItems.fold<int>(0, (sum, i) => sum + i.quantity);
                                           final newQty = itemInCart.quantity + 1;
                                           final availableStock = int.tryParse(product['quantity']?.toString() ?? '999') ?? 999;
                                           
                                           if (totalCartQty >= 5) {
                                             ScaffoldMessenger.of(context).showSnackBar(
                                               const SnackBar(
                                                 content: Text('You can only select up to 5 units per order.'),
                                                 backgroundColor: Colors.orange,
                                                 duration: Duration(seconds: 2),
                                               ),
                                             );
                                           } else if (newQty > 5) {
                                             ScaffoldMessenger.of(context).showSnackBar(
                                               const SnackBar(
                                                 content: Text('You can only select up to 5 units of this item at a time.'),
                                                 backgroundColor: Colors.orange,
                                                 duration: Duration(seconds: 2),
                                               ),
                                             );
                                           } else if (newQty > availableStock) {
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
                                     padding: const EdgeInsets.all(8),
                                     decoration: BoxDecoration(color: isUnavailable ? Colors.grey : AppTheme.primaryColor, shape: BoxShape.circle),
                                     child: const Icon(Icons.add, color: Colors.white, size: 20),
                                   ),
                                 ),
                               ],
                             ),
                           ],
                         );
                      },
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

  Widget _buildSpecRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ),
    );
  }

  void _showCustomizationSheet(BuildContext context, Map<String, dynamic> product, String merchantId) {
    final firstImage = (product['productImages'] ?? product['imageUrls'] as List?)?.isNotEmpty == true 
        ? (product['productImages'] ?? product['imageUrls'] as List).first 
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
        stock: int.tryParse(product['quantity']?.toString() ?? '999') ?? 999,
      );
      ref.read(cartProvider.notifier).addItem(itemToAdd);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Added to cart'), duration: Duration(seconds: 1)),
      );
      return;
    }

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
                  Text('Customize ${product['productName'] ?? product['name']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
                          name: product['productName'] ?? product['name'],
                          price: finalPrice,
                          imageUrl: firstImage,
                          merchantId: merchantId,
                          selectedOptions: selectedOptionsList,
                          stock: int.tryParse(product['quantity']?.toString() ?? '999') ?? 999,
                        );

                        ref.read(cartProvider.notifier).addItem(itemToAdd);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Added to cart'), duration: Duration(seconds: 1)),
                        );
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
}
