import 'package:flutter_riverpod/flutter_riverpod.dart';

class CartItem {
  final String id; // unique cart identifier (productId + selected options hash)
  final String productId;
  final String name;
  final double price;
  final String imageUrl;
  final int quantity;
  final String merchantId;
  final List<dynamic> selectedOptions;
  final String? customizationId;
  final double cgst;
  final double sgst;
  final int stock;

  CartItem({
    required this.id,
    required this.productId,
    required this.name,
    required this.price,
    required this.imageUrl,
    this.quantity = 1,
    required this.merchantId,
    this.selectedOptions = const [],
    this.customizationId,
    this.cgst = 0.0,
    this.sgst = 0.0,
    this.stock = 999,
  });

  CartItem copyWith({int? quantity, int? stock}) {
    return CartItem(
      id: id,
      productId: productId,
      name: name,
      price: price,
      imageUrl: imageUrl,
      quantity: quantity ?? this.quantity,
      merchantId: merchantId,
      selectedOptions: selectedOptions,
      customizationId: customizationId,
      cgst: cgst,
      sgst: sgst,
      stock: stock ?? this.stock,
    );
  }
}

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addItem(CartItem item) {
    final existingIndex = state.indexWhere((i) => i.id == item.id);
    if (existingIndex != -1) {
      final newQuantity = state[existingIndex].quantity + 1;
      if (newQuantity > state[existingIndex].stock) {
        return; // Exceeds available stock
      }
      state = [
        for (int i = 0; i < state.length; i++)
          if (i == existingIndex)
            state[i].copyWith(quantity: newQuantity)
          else
            state[i]
      ];
    } else {
      final quantityToAdd = item.quantity > item.stock ? item.stock : item.quantity;
      if (quantityToAdd > 0) {
        state = [...state, item.copyWith(quantity: quantityToAdd)];
      }
    }
  }

  void removeItem(String itemId) {
    state = state.where((i) => i.id != itemId).toList();
  }

  void updateQuantity(String itemId, int quantity) {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    state = [
      for (final item in state)
        if (item.id == itemId)
          item.copyWith(quantity: quantity > item.stock ? item.stock : quantity)
        else
          item
    ];
  }

  bool hasItemsFromOtherMerchant(String merchantId) {
    return state.isNotEmpty && state.any((item) => item.merchantId != merchantId);
  }

  void clear() {
    state = [];
  }

  double get totalAmount => state.fold(0, (sum, item) => sum + (item.price * item.quantity));
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});
