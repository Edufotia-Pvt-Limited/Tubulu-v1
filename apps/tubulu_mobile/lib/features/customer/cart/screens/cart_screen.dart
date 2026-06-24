import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/cart_provider.dart';
import '../../../../core/api/api_provider.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../orders/screens/orders_list_screen.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../profile/screens/addresses_screen.dart';
import '../../../../core/widgets/tubulu_image.dart';

final userWalletProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/user/wallet');
  return Map<String, dynamic>.from(response.data['data']);
});

final merchantsProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/integrations/all/integrations');
  return response.data['data'] as List<dynamic>;
});

final activeMerchantProvider = FutureProvider.family.autoDispose<Map<String, dynamic>?, String>((ref, id) async {
  if (id.isEmpty) return null;
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/integrations/byId/$id');
    return Map<String, dynamic>.from(response.data['data']);
  } catch (e) {
    debugPrint('Error fetching active merchant by id: $e');
    return null;
  }
});

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  String _deliveryType = 'Delivery';
  String _paymentMethod = 'cod';
  DateTime? _scheduledFor;
  bool _useWalletCash = false;
  double _walletCashBalance = 0.0;
  int _walletPoints = 0;
  String? _selectedAddressId;
  bool _isLocating = false;
  final _notesController = TextEditingController();

  String? _lastCreatedOrderId;
  late Razorpay _razorpay;
  String? _checkoutMerchantId;
  BuildContext? _checkoutLoaderCtx;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    _notesController.dispose();
    _razorpay.clear();
    super.dispose();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    if (_checkoutLoaderCtx != null && _checkoutLoaderCtx!.mounted) {
      Navigator.pop(_checkoutLoaderCtx!);
      _checkoutLoaderCtx = null;
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        _checkoutLoaderCtx = dialogCtx;
        return const Center(child: CircularProgressIndicator());
      },
    );

    final dio = ref.read(dioProvider);
    try {
      final verifyResponse = await dio.post('/orders/verify', data: {
        'razorpayPaymentId': response.paymentId,
        'razorpayOrderId': response.orderId,
        'razorpaySignature': response.signature,
        'integrationId': _checkoutMerchantId,
      });

      if (_checkoutLoaderCtx != null && _checkoutLoaderCtx!.mounted) {
        Navigator.pop(_checkoutLoaderCtx!);
        _checkoutLoaderCtx = null;
      }

      final responseData = verifyResponse.data;
      final isSuccess = responseData['success'] == true || 
                        (responseData['data'] is Map && responseData['data']['success'] == true) ||
                        responseData['statusCode'] == 200;

      if (isSuccess) {
        ref.read(cartProvider.notifier).clear();
        ref.invalidate(customerOrdersProvider);
        if (mounted) {
          _showSuccessDialog(context);
        }
      } else {
        final errorMsg = verifyResponse.data['message'] ?? 'Payment verification failed';
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errorMsg), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (_checkoutLoaderCtx != null && _checkoutLoaderCtx!.mounted) {
        Navigator.pop(_checkoutLoaderCtx!);
        _checkoutLoaderCtx = null;
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment verification error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) async {
    if (_checkoutLoaderCtx != null && _checkoutLoaderCtx!.mounted) {
      Navigator.pop(_checkoutLoaderCtx!);
      _checkoutLoaderCtx = null;
    }

    final orderId = _lastCreatedOrderId;
    if (orderId != null) {
      final dio = ref.read(dioProvider);
      try {
        await dio.put('/orders/details/app/$orderId/cancel', data: {
          'cancelReason': 'Razorpay payment failed or cancelled by user',
        });
        debugPrint('Successfully cancelled unpaid order $orderId on backend.');
      } catch (e) {
        debugPrint('Error cancelling unpaid order $orderId on backend: $e');
      }
      _lastCreatedOrderId = null;
    }

    if (mounted) {
      final message = response.message ?? 'Unknown payment error';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Payment failed (${response.code}): $message'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    if (_checkoutLoaderCtx != null && _checkoutLoaderCtx!.mounted) {
      Navigator.pop(_checkoutLoaderCtx!);
      _checkoutLoaderCtx = null;
    }
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('External wallet selected: ${response.walletName}'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartItems = ref.watch(cartProvider);
    final totalAmount = ref.watch(cartProvider.notifier).totalAmount;
    final walletAsync = ref.watch(userWalletProvider);

    // Update wallet values when loaded
    walletAsync.whenData((wallet) {
      _walletCashBalance = double.tryParse(wallet['cashBalance']?.toString() ?? '0.0') ?? 0.0;
      _walletPoints = int.tryParse(wallet['points']?.toString() ?? '0') ?? 0;
    });

    final firstMerchantId = cartItems.isNotEmpty ? cartItems.first.merchantId : '';
    final activeMerchantAsync = ref.watch(activeMerchantProvider(firstMerchantId));
    double deliveryFee = 0.0;
    double totalCgst = 0.0;
    double totalSgst = 0.0;
    bool isGrocery = false;

    // Calculate sum of item-level taxes first
    if (cartItems.isNotEmpty) {
      for (var item in cartItems) {
        totalCgst += item.price * (item.cgst / 100) * item.quantity;
        totalSgst += item.price * (item.sgst / 100) * item.quantity;
      }
    }

    if (cartItems.isNotEmpty) {
      activeMerchantAsync.when(
        data: (matched) {
          debugPrint('DEBUG-TAX: active merchant loaded: ${matched != null ? matched['integrationName'] : 'null'}');
          if (matched != null) {
            final rawDeliveryFee = double.tryParse(matched['deliveryFee']?.toString() ?? '0.0') ?? 0.0;
            final minOrderVal = double.tryParse(matched['minimumOrderValue']?.toString() ?? '0.0') ?? 0.0;
            if (minOrderVal > 0 && totalAmount >= minOrderVal) {
              deliveryFee = 0.0;
            } else {
              deliveryFee = rawDeliveryFee;
            }

            final String cat = matched['category']?.toString().toUpperCase() ?? '';
            final String vert = matched['verticalType']?.toString().toUpperCase() ?? '';
            debugPrint('DEBUG-TAX: category: $cat, verticalType: $vert');
            if (cat == 'GROCERY' || vert == 'GROCERY') {
              isGrocery = true;
            }

            // If cart items did not have any tax configured, fall back to global merchant settings
            if (totalCgst == 0.0 && totalSgst == 0.0) {
              final settings = matched['receiptSettings'] ?? {};
              final double centralRate = double.tryParse(settings['centralTaxRate']?.toString() ?? '2.5') ?? 2.5;
              final double stateRate = double.tryParse(settings['stateTaxRate']?.toString() ?? '2.5') ?? 2.5;
              totalCgst = totalAmount * (centralRate / 100);
              totalSgst = totalAmount * (stateRate / 100);
              debugPrint('DEBUG-TAX: Fallback tax calculated: cgst=$totalCgst, sgst=$totalSgst (rates: $centralRate, $stateRate)');
            }
          }
        },
        loading: () {
          debugPrint('DEBUG-TAX: active merchant provider is loading');
        },
        error: (err, stack) {
          debugPrint('DEBUG-TAX: active merchant provider error: $err');
        },
      );
    }

    if (isGrocery && _deliveryType == 'Dine-in') {
      _deliveryType = 'Delivery';
    }

    final double deliveryCost = _deliveryType == 'Delivery' ? deliveryFee : 0.0;
    final double discountableAmount = totalAmount + totalCgst + totalSgst + deliveryCost;
    final double discount = _useWalletCash ? (_walletCashBalance > discountableAmount ? discountableAmount : _walletCashBalance) : 0.0;
    final finalAmount = totalAmount + totalCgst + totalSgst + deliveryCost - discount;

    final addressesAsync = ref.watch(userAddressesProvider);
    Map<String, dynamic>? selectedAddress;
    List<dynamic> addressesList = [];
    bool hasAddresses = false;

    addressesAsync.whenData((addresses) {
      addressesList = addresses;
      hasAddresses = addresses.isNotEmpty;
      if (addresses.isNotEmpty) {
        final defaultAddress = addresses.firstWhere((a) => a['isDefault'] == true, orElse: () => null);
        final defaultId = defaultAddress != null ? defaultAddress['id'] : addresses.first['id'];
        
        if (_selectedAddressId == null || !addresses.any((a) => a['id'] == _selectedAddressId)) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              setState(() {
                _selectedAddressId = defaultId;
              });
            }
          });
        }
        final resolvedId = _selectedAddressId ?? defaultId;
        selectedAddress = addresses.firstWhere(
          (a) => a['id'] == resolvedId,
          orElse: () => addresses.first,
        );
      }
    });

    final bool isAddressRequiredButMissing = _deliveryType == 'Delivery' && _selectedAddressId == null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Cart', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          if (cartItems.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.red),
              onPressed: () => _showClearCartDialog(context, ref),
            ),
        ],
      ),
      body: cartItems.isEmpty
          ? _buildEmptyState(context)
          : Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      ...cartItems.map((item) => _buildCartItem(context, ref, item)),
                      const SizedBox(height: 16),
                      _buildFulfillmentMethodSection(context, isGrocery),
                      const SizedBox(height: 16),
                      if (_deliveryType == 'Delivery') ...[
                        _buildDeliveryAddressSection(
                          context: context,
                          hasAddresses: hasAddresses,
                          selectedAddress: selectedAddress,
                          addressesList: addressesList,
                          addressesAsync: addressesAsync,
                        ),
                        const SizedBox(height: 16),
                      ],
                      _buildNotesSection(context),
                      const SizedBox(height: 16),
                      _buildWalletSection(context, walletAsync),
                      const SizedBox(height: 16),
                      _buildPaymentMethodSection(context),
                      const SizedBox(height: 16),
                      _buildBillDetailsSection(
                        subtotal: totalAmount,
                        discount: discount,
                        totalCgst: totalCgst,
                        totalSgst: totalSgst,
                        deliveryFee: deliveryCost,
                      ),
                    ],
                  ),
                ),
                _buildStickyBottomBar(
                  context: context,
                  ref: ref,
                  total: finalAmount,
                  cartItems: cartItems,
                  discount: discount,
                  isAddressRequiredButMissing: isAddressRequiredButMissing,
                ),
              ],
            ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text('Your cart is empty', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.grey)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Go Shopping'),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(BuildContext context, WidgetRef ref, CartItem item) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            SizedBox(
              width: 70,
              height: 70,
              child: TubuluImage(
                imageUrl: item.imageUrl,
                borderRadius: 12,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text('₹${item.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline, color: Colors.blue),
                  onPressed: () => ref.read(cartProvider.notifier).updateQuantity(item.id, item.quantity - 1),
                ),
                Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                 IconButton(
                  icon: const Icon(Icons.add_circle_outline, color: Colors.blue),
                  onPressed: () {
                    final cartItems = ref.read(cartProvider);
                    final totalCartQty = cartItems.fold<int>(0, (sum, i) => sum + i.quantity);
                    final newQty = item.quantity + 1;
                    
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
                    } else if (newQty > item.stock) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Only ${item.stock} units in stock.'),
                          backgroundColor: Colors.orange,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    } else {
                      ref.read(cartProvider.notifier).updateQuantity(item.id, newQty);
                    }
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }



  Future<void> _useLiveLocation(BuildContext context, WidgetRef ref) async {
    setState(() => _isLocating = true);
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw 'Location services are disabled on your device.';
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw 'Location permission denied.';
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw 'Location permission permanently denied. Enable it in settings.';
      }

      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 4),
          ),
        );
      } catch (e) {
        debugPrint('[CartScreen] getCurrentPosition failed: $e. Trying last known position.');
        try {
          position = await Geolocator.getLastKnownPosition();
        } catch (lastKnownErr) {
          debugPrint('[CartScreen] getLastKnownPosition failed: $lastKnownErr');
        }
      }

      double lat = position?.latitude ?? 12.3237008;
      double lng = position?.longitude ?? 76.6022778;

      final isAppleSim = (lat - 37.7858).abs() < 0.05 && (lng - -122.4064).abs() < 0.05;
      final isAndroidSim = (lat - 37.422).abs() < 0.05 && (lng - -122.084).abs() < 0.05;
      if (isAppleSim || isAndroidSim) {
        lat = 12.3237008;
        lng = 76.6022778;
        debugPrint('[CartScreen] Simulator coordinates detected. Overriding to Mysuru.');
      }

      final String addressLine = 'GPS Coords: ${lat.toStringAsFixed(6)}, ${lng.toStringAsFixed(6)}';
      
      String resolvedCity = 'Mysuru';
      String resolvedState = 'Karnataka';
      final dio = ref.read(dioProvider);
      try {
        final res = await dio.get('/locations/resolve?lat=$lat&lng=$lng');
        if (res.data['success'] == true && res.data['data'] != null) {
          resolvedCity = res.data['data']['city'] ?? 'Mysuru';
          resolvedState = res.data['data']['state'] ?? 'Karnataka';
        }
      } catch (_) {}

      final authState = ref.read(authProvider);
      final phone = authState.phoneNumber ?? '';
      final name = authState.firstName != null ? '${authState.firstName} ${authState.lastName ?? ""}'.trim() : 'Customer';

      final error = await ref.read(userAddressesProvider.notifier).addAddress({
        'fullName': name,
        'contact': phone.isNotEmpty ? phone : '9999999999',
        'addressLine1': addressLine,
        'addressLine2': 'Live Location',
        'city': resolvedCity,
        'state': resolvedState,
        'pincode': '570001',
        'addressType': 'other',
        'addressLabel': 'LIVE',
        'isDefault': false,
      });

      if (error == null) {
        final currentAddresses = ref.read(userAddressesProvider).value ?? [];
        final liveAddress = currentAddresses.firstWhere(
          (a) => a['addressLabel'] == 'LIVE' || (a['addressLine2'] == 'Live Location'),
          orElse: () => null,
        );
        if (liveAddress != null) {
          setState(() {
            _selectedAddressId = liveAddress['id'];
          });
        }
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Live Location address generated and selected!'), backgroundColor: Colors.green),
          );
        }
      } else {
        throw error;
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLocating = false);
      }
    }
  }

  Widget _buildNotesSection(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Personal Order Notes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 10),
            TextField(
              controller: _notesController,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: 'Add instructions (e.g. Leave at the door, Make it spicy)',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.all(12),
              ),
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildWalletSection(BuildContext context, AsyncValue<Map<String, dynamic>> walletAsync) {
    return walletAsync.when(
      data: (wallet) {
        final double cash = double.tryParse(wallet['cashBalance']?.toString() ?? '0.0') ?? 0.0;
        
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade200)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Wallet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 12),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text('Use Wallet Cash (Balance: ₹${cash.toStringAsFixed(2)})'),
                  value: _useWalletCash,
                  activeColor: Colors.green,
                  onChanged: cash > 0
                      ? (val) {
                          setState(() {
                            _useWalletCash = val;
                          });
                        }
                      : null,
                ),
              ],
            ),
          ),
        );
      },
      loading: () => const Center(child: Padding(padding: EdgeInsets.all(10), child: CircularProgressIndicator())),
      error: (e, _) => const SizedBox.shrink(),
    );
  }


  Widget _buildFulfillmentMethodSection(BuildContext context, bool isGrocery) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Fulfillment Method', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: SegmentedButton<String>(
                showSelectedIcon: false,
                segments: [
                  const ButtonSegment(
                    value: 'Delivery',
                    label: FittedBox(fit: BoxFit.scaleDown, child: Text('Delivery', style: TextStyle(fontSize: 12))),
                    icon: Icon(Icons.delivery_dining, size: 18),
                  ),
                  const ButtonSegment(
                    value: 'Pick-up',
                    label: FittedBox(fit: BoxFit.scaleDown, child: Text('Takeaway', style: TextStyle(fontSize: 12))),
                    icon: Icon(Icons.shopping_bag_outlined, size: 18),
                  ),
                  if (!isGrocery)
                    const ButtonSegment(
                      value: 'Dine-in',
                      label: FittedBox(fit: BoxFit.scaleDown, child: Text('Dine In', style: TextStyle(fontSize: 12))),
                      icon: Icon(Icons.restaurant, size: 18),
                    ),
                ],
                selected: {_deliveryType},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() {
                    _deliveryType = newSelection.first;
                  });
                },
                style: SegmentedButton.styleFrom(
                  selectedBackgroundColor: Colors.blue.shade100,
                  selectedForegroundColor: Colors.blue.shade900,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryAddressSection({
    required BuildContext context,
    required bool hasAddresses,
    required Map<String, dynamic>? selectedAddress,
    required List<dynamic> addressesList,
    required AsyncValue<List<dynamic>> addressesAsync,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Delivery Address', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                Row(
                  children: [
                    if (_isLocating)
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    else
                      TextButton.icon(
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        icon: const Icon(Icons.my_location, size: 16, color: Colors.blue),
                        label: const Text('Live Location', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.blue)),
                        onPressed: () => _useLiveLocation(context, ref),
                      ),
                    if (hasAddresses && selectedAddress != null) ...[
                      const SizedBox(width: 12),
                      TextButton(
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        onPressed: () => _showAddressSelectionBottomSheet(context, addressesList),
                        child: const Text('Change', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            addressesAsync.when(
              data: (addresses) {
                if (addresses.isEmpty) {
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.warning_amber_rounded, color: Colors.red.shade700),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Please add a delivery address to proceed.',
                                style: TextStyle(color: Colors.red.shade900, fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => context.push('/customer/addresses'),
                                icon: const Icon(Icons.add, size: 18),
                                label: const Text('Add Address', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red.shade600,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  elevation: 0,
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: _isLocating ? null : () => _useLiveLocation(context, ref),
                                icon: _isLocating
                                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                    : const Icon(Icons.my_location, size: 18),
                                label: const Text('Live Location', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue.shade600,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  elevation: 0,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }

                if (selectedAddress == null) {
                  return const SizedBox.shrink();
                }

                final String type = (selectedAddress!['addressType'] ?? 'other').toString().toLowerCase();
                final String label = (selectedAddress!['addressLabel'] ?? type).toString().toUpperCase();
                IconData typeIcon = Icons.location_on;
                if (type == 'home') typeIcon = Icons.home;
                if (type == 'work') typeIcon = Icons.work;

                return Card(
                  elevation: 0,
                  margin: EdgeInsets.zero,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.grey.shade100),
                  ),
                  color: Colors.grey.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(typeIcon, color: Colors.blue, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.shade50,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      label,
                                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 9, color: Colors.blue.shade900),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      selectedAddress!['fullName'] ?? '',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                '${selectedAddress!['addressLine1']}${selectedAddress!['addressLine2'] != null && selectedAddress!['addressLine2'].toString().trim().isNotEmpty ? ", ${selectedAddress!['addressLine2']}" : ""}',
                                style: TextStyle(fontSize: 13, color: Colors.grey.shade800, height: 1.3),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                '${selectedAddress!['city']}, ${selectedAddress!['state']} - ${selectedAddress!['pincode']}',
                                style: TextStyle(fontSize: 13, color: Colors.grey.shade800, height: 1.3),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Contact: ${selectedAddress!['contact']}',
                                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
              loading: () => const Center(child: Padding(padding: EdgeInsets.all(8.0), child: CircularProgressIndicator())),
              error: (e, _) => Text('Error loading address: $e', style: const TextStyle(color: Colors.red)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSection(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Payment Method', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: SegmentedButton<String>(
                showSelectedIcon: false,
                segments: const [
                  ButtonSegment(
                    value: 'cod',
                    label: FittedBox(fit: BoxFit.scaleDown, child: Text('COD', style: TextStyle(fontSize: 12))),
                    icon: Icon(Icons.money, size: 18),
                  ),
                  ButtonSegment(
                    value: 'upi',
                    label: FittedBox(fit: BoxFit.scaleDown, child: Text('UPI', style: TextStyle(fontSize: 12))),
                    icon: Icon(Icons.qr_code, size: 18),
                  ),
                  ButtonSegment(
                    value: 'razorpay',
                    label: FittedBox(fit: BoxFit.scaleDown, child: Text('Card', style: TextStyle(fontSize: 12))),
                    icon: Icon(Icons.credit_card, size: 18),
                  ),
                ],
                selected: {_paymentMethod},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() {
                    _paymentMethod = newSelection.first;
                  });
                },
                style: SegmentedButton.styleFrom(
                  selectedBackgroundColor: Colors.green.shade100,
                  selectedForegroundColor: Colors.green.shade900,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBillDetailsSection({
    required double subtotal,
    required double discount,
    required double totalCgst,
    required double totalSgst,
    required double deliveryFee,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Bill Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Subtotal', style: TextStyle(color: Colors.grey, fontSize: 14)),
                Text('₹${subtotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 14)),
              ],
            ),
            if (discount > 0) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Wallet Discount', style: TextStyle(color: Colors.green, fontSize: 14)),
                  Text('-₹${discount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 14, color: Colors.green, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
            if (totalCgst > 0) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('CGST', style: TextStyle(color: Colors.grey, fontSize: 14)),
                  Text('+₹${totalCgst.toStringAsFixed(2)}', style: const TextStyle(fontSize: 14, color: Colors.black87)),
                ],
              ),
            ],
            if (totalSgst > 0) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('SGST', style: TextStyle(color: Colors.grey, fontSize: 14)),
                  Text('+₹${totalSgst.toStringAsFixed(2)}', style: const TextStyle(fontSize: 14, color: Colors.black87)),
                ],
              ),
            ],
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Delivery Fee', style: TextStyle(color: Colors.grey, fontSize: 14)),
                Text(
                  _deliveryType == 'Delivery' 
                      ? (deliveryFee > 0 ? '₹${deliveryFee.toStringAsFixed(2)}' : 'FREE') 
                      : 'N/A', 
                  style: TextStyle(
                    color: (_deliveryType == 'Delivery' && deliveryFee == 0) ? Colors.green : Colors.black87, 
                    fontWeight: FontWeight.bold, 
                    fontSize: 14
                  )
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStickyBottomBar({
    required BuildContext context,
    required WidgetRef ref,
    required double total,
    required List<CartItem> cartItems,
    required double discount,
    required bool isAddressRequiredButMissing,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5)),
        ],
      ),
      child: SafeArea(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Total Amount', style: TextStyle(fontSize: 13, color: Colors.grey, fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text('₹${total.toStringAsFixed(2)}', 
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.blue)),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: isAddressRequiredButMissing
                      ? null
                      : () => _processCheckout(ref, cartItems, total, discount),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isAddressRequiredButMissing ? Colors.grey.shade300 : Colors.blue,
                    foregroundColor: isAddressRequiredButMissing ? Colors.grey.shade600 : Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: const Text('Proceed to Checkout', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddressSelectionBottomSheet(BuildContext context, List<dynamic> addresses) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bottomSheetCtx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                  alignment: Alignment.center,
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const Text(
                  'Select Delivery Address',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                const SizedBox(height: 16),
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: addresses.length,
                    itemBuilder: (ctx, index) {
                      final addr = addresses[index];
                      final isSelected = addr['id'] == _selectedAddressId;
                      final type = (addr['addressType'] ?? 'other').toString().toLowerCase();
                      final label = (addr['addressLabel'] ?? type).toString().toUpperCase();

                      IconData typeIcon = Icons.location_on;
                      if (type == 'home') typeIcon = Icons.home;
                      if (type == 'work') typeIcon = Icons.work;

                      return ListTile(
                        leading: Icon(typeIcon, color: isSelected ? Colors.blue : Colors.grey),
                        title: Text('${addr['fullName']} ($label)'),
                        subtitle: Text('${addr['addressLine1']}, ${addr['city']} - ${addr['pincode']}'),
                        trailing: isSelected ? const Icon(Icons.check_circle, color: Colors.blue) : null,
                        onTap: () {
                          setState(() {
                            _selectedAddressId = addr['id'];
                          });
                          Navigator.pop(bottomSheetCtx);
                        },
                      );
                    },
                  ),
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.add, color: Colors.blue),
                  title: const Text('Add New Address', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
                  onTap: () {
                    Navigator.pop(bottomSheetCtx);
                    context.push('/customer/addresses');
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _processCheckout(WidgetRef ref, List<CartItem> cartItems, double total, double discount) async {
    if (cartItems.isEmpty) return;

    final dio = ref.read(dioProvider);

    // Group cart items by merchantId
    final Map<String, List<CartItem>> itemsByMerchant = {};
    for (var item in cartItems) {
      itemsByMerchant.putIfAbsent(item.merchantId, () => []).add(item);
    }

    Future<void> executeOrderPlacement() async {
      if (!mounted) return;
      BuildContext? loaderCtx;
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (dialogCtx) {
          loaderCtx = dialogCtx;
          return const Center(child: CircularProgressIndicator());
        },
      );

      try {
        bool allSuccessful = true;
        String? lastError;

        for (var entry in itemsByMerchant.entries) {
          final merchantId = entry.key;
          final merchantItems = entry.value;

          try {
            final response = await dio.post('/orders/create', data: {
              'integrationId': merchantId,
              'paymentMethod': _paymentMethod,
              'deliveryType': _deliveryType,
              'addressId': _deliveryType == 'Delivery' ? _selectedAddressId : 'default_address',
              'orderMessage': _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : 'New order from mobile app',
              'personalNote': _notesController.text.trim(),
              'scheduledFor': null,
              'discountAmount': discount,
              'walletDiscount': discount,
              'items': merchantItems.map((item) => {
                'productId': item.productId,
                'quantity': item.quantity,
                'selectedOptions': item.selectedOptions,
              }).toList(),
            });

            if (response.data['success'] != true && response.data['statusCode'] != 201) {
              allSuccessful = false;
              lastError = response.data['message'] ?? 'Failed to place order for a store';
            }
          } catch (e) {
            allSuccessful = false;
            lastError = _parseCheckoutError(e);
          }
        }

        if (loaderCtx != null && loaderCtx!.mounted) {
          Navigator.pop(loaderCtx!);
        }

        if (allSuccessful) {
          ref.read(cartProvider.notifier).clear();
          ref.invalidate(customerOrdersProvider);
          if (mounted) {
            _showSuccessDialog(context);
          }
        } else {
          if (mounted) {
            if (lastError != null && lastError!.toLowerCase().contains('stock')) {
              _showOutOfStockDialog(lastError!);
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Failed to place order: $lastError'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        }
      } catch (e) {
        if (loaderCtx != null && loaderCtx!.mounted) {
          Navigator.pop(loaderCtx!);
        }
        if (mounted) {
          final errorMsg = _parseCheckoutError(e);
          if (errorMsg.toLowerCase().contains('stock')) {
            _showOutOfStockDialog(errorMsg);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Checkout failed: $errorMsg'), backgroundColor: Colors.red),
            );
          }
        }
      }
    }

    if (_paymentMethod == 'upi') {
      BuildContext? loaderCtx;
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (dialogCtx) {
          loaderCtx = dialogCtx;
          return const Center(child: CircularProgressIndicator());
        },
      );

      String upiVpa = '';
      String merchantName = 'Merchant';

      try {
        final firstMerchantId = itemsByMerchant.keys.first;
        final response = await dio.get('/integrations/byId/$firstMerchantId');
        final matched = response.data['data'];
        if (matched != null) {
          merchantName = matched['integrationName'] ?? 'Merchant';
          if (matched['upi'] != null && matched['upi']['vpa'] != null && matched['upi']['vpa'].toString().isNotEmpty) {
            upiVpa = matched['upi']['vpa'].toString();
            if (matched['upi']['merchantName'] != null) {
              merchantName = matched['upi']['merchantName'].toString();
            }
          }
        }
      } catch (e) {
        debugPrint('Error loading UPI details: $e');
      }

      if (upiVpa.isEmpty) {
        final cleanName = merchantName.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
        upiVpa = cleanName.isNotEmpty ? '$cleanName@okicici' : 'merchant@okicici';
      }

      if (loaderCtx != null && loaderCtx!.mounted) {
        Navigator.pop(loaderCtx!);
      }

      _showUpiPaymentDialog(upiVpa, merchantName, total, () {
        executeOrderPlacement();
      });
    } else if (_paymentMethod == 'razorpay') {
      if (!mounted) return;

      final firstMerchantId = itemsByMerchant.keys.first;
      _checkoutMerchantId = firstMerchantId;

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (dialogCtx) {
          _checkoutLoaderCtx = dialogCtx;
          return const Center(child: CircularProgressIndicator());
        },
      );

      try {
        final merchantId = itemsByMerchant.keys.first;
        final merchantItems = itemsByMerchant[merchantId]!;

        final response = await dio.post('/orders/create', data: {
          'integrationId': merchantId,
          'paymentMethod': 'razorpay',
          'deliveryType': _deliveryType,
          'addressId': _deliveryType == 'Delivery' ? _selectedAddressId : 'default_address',
          'orderMessage': _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : 'New order from mobile app',
          'personalNote': _notesController.text.trim(),
          'scheduledFor': _scheduledFor?.toIso8601String(),
          'discountAmount': discount,
          'walletDiscount': discount,
          'items': merchantItems.map((item) => {
            'productId': item.productId,
            'quantity': item.quantity,
            'selectedOptions': item.selectedOptions,
          }).toList(),
        });

        if (response.data['success'] == true || response.data['statusCode'] == 201) {
          final orderData = response.data['data'];
          final orderObj = orderData['order'];
          if (orderObj != null) {
            _lastCreatedOrderId = orderObj['id'];
          }
          final razorpayOrder = orderData['razorpayOrder'];
          final publicToken = orderData['publicToken'] ?? ApiConfig.razorpayPublicKey;

          if (razorpayOrder == null) {
            throw Exception('Failed to generate Razorpay order from backend');
          }

          final authState = ref.read(authProvider);
          final String userPhone = authState.phoneNumber ?? '';

          final options = {
            'key': publicToken,
            'amount': razorpayOrder['amount'], // Already in paise
            'name': 'Tubulu',
            'order_id': razorpayOrder['id'],
            'description': 'Order Payment',
            'prefill': {
              'contact': userPhone,
              'email': 'customer@tubulu.com',
            },
            'external': {
              'wallets': ['paytm']
            }
          };

          _razorpay.open(options);
        } else {
          if (_checkoutLoaderCtx != null && _checkoutLoaderCtx!.mounted) {
            Navigator.pop(_checkoutLoaderCtx!);
            _checkoutLoaderCtx = null;
          }
          final lastError = response.data['message'] ?? 'Failed to place order';
          if (mounted) {
            if (lastError.toLowerCase().contains('stock')) {
              _showOutOfStockDialog(lastError);
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(lastError), backgroundColor: Colors.red),
              );
            }
          }
        }
      } catch (e) {
        if (_checkoutLoaderCtx != null && _checkoutLoaderCtx!.mounted) {
          Navigator.pop(_checkoutLoaderCtx!);
          _checkoutLoaderCtx = null;
        }
        if (mounted) {
          final errorMsg = _parseCheckoutError(e);
          if (errorMsg.toLowerCase().contains('stock')) {
            _showOutOfStockDialog(errorMsg);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Checkout failed: $errorMsg'), backgroundColor: Colors.red),
            );
          }
        }
      }
    } else {
      executeOrderPlacement();
    }
  }

  String _parseCheckoutError(dynamic e) {
    if (e is DioException) {
      final data = e.response?.data;
      if (data is Map) {
        if (data['errors'] is Map && data['errors']['message'] != null) {
          return data['errors']['message'].toString();
        }
        if (data['message'] != null) {
          return data['message'].toString();
        }
      }
    }
    return e.toString();
  }

  void _showOutOfStockDialog(String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
            const SizedBox(width: 8),
            const Text('Out of Stock', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          message,
          style: const TextStyle(fontSize: 15, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ],
      ),
    );
  }

  void _showUpiPaymentDialog(
    String upiVpa,
    String merchantName,
    double total,
    VoidCallback onConfirm,
  ) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Center(
          child: Text(
            'UPI Payment',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Pay to $merchantName',
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              '₹${total.toStringAsFixed(2)}',
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Image.network(
                'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${Uri.encodeComponent('upi://pay?pa=$upiVpa&pn=${Uri.encodeComponent(merchantName)}&am=${total.toStringAsFixed(2)}&cu=INR')}',
                height: 200,
                width: 200,
                errorBuilder: (_, __, ___) => const Icon(
                  Icons.qr_code_2,
                  size: 150,
                  color: Colors.grey,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Expanded(
                  child: Text(
                    upiVpa,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.grey.shade700,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.copy, color: Colors.blue),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: upiVpa));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('UPI ID copied to clipboard!')),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _launchUpiUrl(upiVpa, merchantName, total),
                    icon: const Icon(Icons.payment, size: 18),
                    label: const Text('Google Pay', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black87,
                      side: BorderSide(color: Colors.grey.shade300),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _launchUpiUrl(upiVpa, merchantName, total),
                    icon: const Icon(Icons.account_balance_wallet, size: 18),
                    label: const Text('PhonePe', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF5f259f),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              'Scan this QR using any UPI app or copy the UPI ID to pay.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
        actionsPadding: const EdgeInsets.only(bottom: 16, left: 16, right: 16),
        actions: [
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(dialogCtx),
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(dialogCtx);
                    onConfirm();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('I Have Paid'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(BuildContext parentCtx) {
    showDialog(
      context: parentCtx,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 80),
            const SizedBox(height: 16),
            const Text('Order Placed!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Your order has been sent to the merchant.', textAlign: TextAlign.center),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(dialogCtx);
                  if (parentCtx.mounted) {
                    parentCtx.go('/customer/home');
                    Navigator.pop(parentCtx);
                  }
                },
                child: const Text('Done'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showClearCartDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cart?'),
        content: const Text('Are you sure you want to remove all items from your cart?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              ref.read(cartProvider.notifier).clear();
              Navigator.pop(context);
            },
            child: const Text('Clear All', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Future<void> _launchUpiUrl(String upiVpa, String merchantName, double total) async {
    final upiUrl = 'upi://pay?pa=$upiVpa&pn=${Uri.encodeComponent(merchantName)}&am=${total.toStringAsFixed(2)}&cu=INR';
    final uri = Uri.parse(upiUrl);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri);
      }
    } catch (e) {
      debugPrint('Error launching UPI deep link: $e');
    }
  }
}
