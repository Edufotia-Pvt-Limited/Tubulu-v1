import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:tubulu_mobile/core/auth/auth_provider.dart';
import '../../../../core/api/api_provider.dart';

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

class Catalogue {
  final String id;
  final String name;
  final bool isActive;

  const Catalogue({required this.id, required this.name, required this.isActive});

  factory Catalogue.fromJson(Map<String, dynamic> json) => Catalogue(
        id: json['id']?.toString() ?? '',
        name: json['catalogueName'] ?? json['name'] ?? 'Unnamed',
        isActive: json['isActive'] ?? true,
      );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final merchantCataloguesProvider = FutureProvider.autoDispose<List<Catalogue>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/catalogue/catalogues');
  final List<dynamic> list = response.data['data'] ?? [];
  return list.map((e) => Catalogue.fromJson(e as Map<String, dynamic>)).toList();
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class MerchantCatalogueScreen extends ConsumerWidget {
  const MerchantCatalogueScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cataloguesAsync = ref.watch(merchantCataloguesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Catalogues'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'New Catalogue',
            onPressed: () => _showCreateCatalogueDialog(context, ref),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.red),
            onPressed: () => ref.read(authProvider.notifier).logout(),
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
              const SizedBox(height: 8),
              Text(e.toString(), textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey, fontSize: 12)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(merchantCataloguesProvider),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (catalogues) {
          if (catalogues.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.menu_book_outlined, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  const Text('No catalogues yet', style: TextStyle(fontSize: 18, color: Colors.grey)),
                  const SizedBox(height: 8),
                  const Text('Tap + to create your first catalogue',
                      style: TextStyle(color: Colors.grey)),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: catalogues.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final cat = catalogues[index];
              return Card(
                elevation: 2,
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                    child: Icon(Icons.menu_book, color: Theme.of(context).primaryColor),
                  ),
                  title: Text(cat.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(cat.isActive ? 'Active' : 'Inactive'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit_outlined, size: 20, color: Colors.blue),
                        onPressed: () => _showEditCatalogueDialog(context, ref, cat),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: cat.isActive ? Colors.green.shade100 : Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          cat.isActive ? 'Active' : 'Inactive',
                          style: TextStyle(
                              color: cat.isActive ? Colors.green : Colors.grey,
                              fontSize: 12),
                        ),
                      ),
                      const Icon(Icons.chevron_right),
                    ],
                  ),
                  onTap: () => context.go('/merchant/products'),
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showEditCatalogueDialog(BuildContext context, WidgetRef ref, Catalogue catalogue) {
    final nameController = TextEditingController(text: catalogue.name);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Catalogue'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Catalogue Name',
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
            onPressed: () async {
              if (nameController.text.isEmpty) return;
              
              try {
                final dio = ref.read(dioProvider);
                await dio.put('/catalogue/update-catalogue', data: {
                  'id': catalogue.id,
                  'name': nameController.text,
                });
                
                if (context.mounted) {
                  Navigator.pop(context);
                  ref.invalidate(merchantCataloguesProvider);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Catalogue updated successfully')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error updating catalogue')),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showCreateCatalogueDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New Catalogue'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Catalogue Name',
                hintText: 'e.g. Breakfast Menu',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: descController,
              decoration: const InputDecoration(
                labelText: 'Description',
                hintText: 'Describe the items...',
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isEmpty) return;
              
              try {
                final dio = ref.read(dioProvider);
                await dio.post('/catalogue/create-catalogue', data: {
                  'name': nameController.text,
                  'description': descController.text,
                  'displayType': 'Grid View',
                });
                
                if (context.mounted) {
                  Navigator.pop(context);
                  ref.invalidate(merchantCataloguesProvider);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Catalogue created successfully')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error creating catalogue')),
                  );
                }
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }
}
