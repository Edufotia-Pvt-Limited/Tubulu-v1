import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/products_provider.dart';
import '../../catalogue/screens/merchant_catalogue_screen.dart';
import '../../../../core/api/api_provider.dart';
import '../../../../core/widgets/tubulu_image.dart';

class MerchantProductsScreen extends ConsumerStatefulWidget {
  const MerchantProductsScreen({super.key});

  @override
  ConsumerState<MerchantProductsScreen> createState() => _MerchantProductsScreenState();
}

class _MerchantProductsScreenState extends ConsumerState<MerchantProductsScreen> {
  String? _customSelectedCatalogueId;

  @override
  Widget build(BuildContext context) {
    final cataloguesAsync = ref.watch(merchantCataloguesProvider);

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
        title: const Text('My Products'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              final cats = ref.read(merchantCataloguesProvider).value ?? [];
              if (cats.isNotEmpty) {
                final catalogueId = _customSelectedCatalogueId ?? cats.first.id;
                context.go('/merchant/products/add/$catalogueId');
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please create a catalogue first.')),
                );
              }
            },
          ),
        ],
      ),
      body: cataloguesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              Text('Failed to load catalogues', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(merchantCataloguesProvider),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (cats) {
          if (cats.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.menu_book_outlined, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  const Text('No catalogues yet', style: TextStyle(fontSize: 18, color: Colors.grey)),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => context.go('/merchant/catalogue'),
                    child: const Text('Go to Store to Create Catalogue'),
                  ),
                ],
              ),
            );
          }
          final catalogueId = _customSelectedCatalogueId ?? cats.first.id;
          return Column(
            children: [
              Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: DropdownButtonFormField<String>(
                  value: catalogueId,
                  decoration: const InputDecoration(
                    labelText: 'Select Catalogue',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  items: cats.map((cat) => DropdownMenuItem<String>(
                    value: cat.id,
                    child: Text(cat.name),
                  )).toList(),
                  onChanged: (val) {
                    setState(() {
                      _customSelectedCatalogueId = val;
                    });
                  },
                ),
              ),
              Expanded(
                child: _ProductList(catalogueId: catalogueId),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ProductList extends ConsumerWidget {
  final String catalogueId;
  const _ProductList({required this.catalogueId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(merchantProductsProvider(catalogueId));

    return productsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 12),
            const Text('Failed to load products'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => ref.invalidate(merchantProductsProvider(catalogueId)),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
      data: (products) {
        if (products.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey.shade400),
                const SizedBox(height: 16),
                const Text('No products yet', style: TextStyle(fontSize: 18, color: Colors.grey)),
                const SizedBox(height: 8),
                ElevatedButton.icon(
                  onPressed: () => context.go('/merchant/products/add/$catalogueId'),
                  icon: const Icon(Icons.add),
                  label: const Text('Add Product'),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(merchantProductsProvider(catalogueId)),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: products.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final product = products[index];
              return Card(
                elevation: 2,
                child: ListTile(
                  leading: product.imageUrls.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: TubuluImage(
                            imageUrl: product.imageUrls.first,
                            width: 50,
                            height: 50,
                            fit: BoxFit.cover,
                            errorWidget: Container(
                              width: 50,
                              height: 50,
                              color: Colors.grey.shade200,
                              child: const Icon(Icons.image),
                            ),
                          ),
                        )
                      : Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.image),
                        ),
                  title: Text(product.name,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('₹${product.price.toStringAsFixed(0)}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Stock Update Button
                      TextButton.icon(
                        onPressed: () => _showStockUpdateDialog(context, ref, product, catalogueId),
                        icon: const Icon(Icons.inventory_2, size: 14),
                        label: Text('${product.quantity}'),
                        style: TextButton.styleFrom(
                          backgroundColor: Colors.blue.shade50,
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Active Toggle
                      Switch(
                        value: product.isActive,
                        onChanged: (val) async {
                          final dio = ref.read(dioProvider);
                          await dio.patch('/products/toggle-active/$catalogueId/${product.id}', data: {
                            'isActive': val
                          });
                          ref.invalidate(merchantProductsProvider(catalogueId));
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  void _showStockUpdateDialog(BuildContext context, WidgetRef ref, dynamic product, String catalogueId) {
    final controller = TextEditingController(text: product.quantity.toString());
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Update Stock: ${product.name}'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Quantity in Stock'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final newQty = int.tryParse(controller.text);
              if (newQty != null) {
                final dio = ref.read(dioProvider);
                await dio.put('/products/edit/${product.id}/$catalogueId', data: {
                  'quantity': newQty
                });
                ref.invalidate(merchantProductsProvider(catalogueId));
                if (context.mounted) Navigator.pop(context);
              }
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }
}
