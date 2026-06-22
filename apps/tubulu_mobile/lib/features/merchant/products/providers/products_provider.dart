import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_provider.dart';

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

class Product {
  final String id;
  final String name;
  final double price;
  final int quantity;
  final List<String> imageUrls;
  final bool isActive;

  const Product({
    required this.id,
    required this.name,
    required this.price,
    required this.quantity,
    required this.imageUrls,
    required this.isActive,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id']?.toString() ?? '',
        name: json['name'] ?? '',
        price: (json['price'] as num?)?.toDouble() ?? 0.0,
        quantity: (json['quantity'] as num?)?.toInt() ?? 0,
        imageUrls: List<String>.from(json['imageUrls'] ?? []),
        isActive: json['isActive'] ?? true,
      );
}

// ---------------------------------------------------------------------------
// Provider — requires catalogueId
// ---------------------------------------------------------------------------

final merchantProductsProvider =
    FutureProvider.autoDispose.family<List<Product>, String>((ref, catalogueId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/products/search/$catalogueId');
  final List<dynamic> list = response.data['data'] ?? response.data['products'] ?? [];
  return list.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
});
