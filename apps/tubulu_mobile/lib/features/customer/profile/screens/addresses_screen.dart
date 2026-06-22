import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../../../../core/api/api_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/theme_provider.dart';

// ---------------------------------------------------------------------------
// Notifier & Provider
// ---------------------------------------------------------------------------

class UserAddressesNotifier extends StateNotifier<AsyncValue<List<dynamic>>> {
  final Ref ref;
  UserAddressesNotifier(this.ref) : super(const AsyncValue.loading()) {
    fetchAddresses();
  }

  Future<void> fetchAddresses() async {
    state = const AsyncValue.loading();
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/address/get-address');
      final data = response.data['data'];
      if (data is List) {
        state = AsyncValue.data(data);
      } else if (data is Map) {
        state = AsyncValue.data([data]);
      } else {
        state = const AsyncValue.data([]);
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        state = const AsyncValue.data([]);
      } else {
        state = AsyncValue.error(e, e.stackTrace);
      }
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<String?> addAddress(Map<String, dynamic> addressData) async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post('/address/create-address', data: addressData);
      if (response.data['success'] == true) {
        await fetchAddresses();
        return null;
      }
      return response.data['message'] ?? 'Failed to add address';
    } on DioException catch (e) {
      final msg = e.response?.data?['message'];
      if (msg != null) return msg.toString();
      return e.message;
    } catch (e) {
      return e.toString();
    }
  }

  Future<String?> updateAddress(String id, Map<String, dynamic> addressData) async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.patch('/address/update/$id', data: addressData);
      if (response.data['success'] == true) {
        await fetchAddresses();
        return null;
      }
      return response.data['message'] ?? 'Failed to update address';
    } on DioException catch (e) {
      final msg = e.response?.data?['message'];
      if (msg != null) return msg.toString();
      return e.message;
    } catch (e) {
      return e.toString();
    }
  }

  Future<bool> deleteAddress(String id) async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.delete('/address/delete/$id');
      if (response.data['success'] == true) {
        await fetchAddresses();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> setAsDefault(String id) async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.patch('/address/update/$id', data: {
        'isDefault': true,
      });
      if (response.data['success'] == true) {
        await fetchAddresses();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

final userAddressesProvider =
    StateNotifierProvider.autoDispose<UserAddressesNotifier, AsyncValue<List<dynamic>>>((ref) {
  return UserAddressesNotifier(ref);
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class AddressesScreen extends ConsumerStatefulWidget {
  const AddressesScreen({super.key});

  @override
  ConsumerState<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends ConsumerState<AddressesScreen> {
  @override
  Widget build(BuildContext context) {
    final addressesAsync = ref.watch(userAddressesProvider);
    final activeTheme = ref.watch(themeProvider);
    final isDark = activeTheme == AppThemeType.sleekDark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Addresses', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(userAddressesProvider.notifier).fetchAddresses(),
        child: addressesAsync.when(
          data: (addresses) {
            if (addresses.isEmpty) {
              return _buildEmptyState(context, isDark);
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: addresses.length,
              itemBuilder: (context, index) {
                final address = addresses[index];
                return _buildAddressCard(context, address, isDark);
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Failed to load addresses', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text(error.toString(),
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey.shade600)),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => ref.read(userAddressesProvider.notifier).fetchAddresses(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ElevatedButton.icon(
            onPressed: () => _showAddressFormDialog(null),
            icon: const Icon(Icons.add),
            label: const Text('Add New Address',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.7,
        alignment: Alignment.center,
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.blue.shade50,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.location_off_outlined,
                size: 80,
                color: isDark ? const Color(0xFFA594F9) : Colors.blue,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'No Saved Addresses',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              'Add a delivery address to place orders with delivery fulfillment.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            OutlinedButton.icon(
              onPressed: () => _showAddressFormDialog(null),
              icon: const Icon(Icons.add),
              label: const Text('Add Address'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressCard(BuildContext context, Map<String, dynamic> address, bool isDark) {
    final String type = (address['addressType'] ?? 'other').toString().toLowerCase();
    final String label = (address['addressLabel'] ?? type).toString().toUpperCase();
    final bool isDefault = address['isDefault'] == true;
    final String id = address['id'] ?? '';

    IconData typeIcon = Icons.location_on;
    Color typeColor = Colors.blue;

    if (type == 'home') {
      typeIcon = Icons.home;
      typeColor = Colors.orange;
    } else if (type == 'work') {
      typeIcon = Icons.work;
      typeColor = Colors.green;
    } else {
      typeColor = Colors.purple;
    }

    final cardBorderColor = isDefault
        ? (isDark ? const Color(0xFFA594F9) : Colors.blue.shade300)
        : (isDark ? Colors.grey.shade800 : Colors.grey.shade200);

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: cardBorderColor, width: isDefault ? 2 : 1),
      ),
      color: isDark ? const Color(0xFF2A2826) : Colors.white,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: isDefault ? null : () => _setDefaultAddress(id),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: typeColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(typeIcon, size: 14, color: typeColor),
                        const SizedBox(width: 4),
                        Text(
                          label,
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: typeColor),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  if (isDefault)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_circle, size: 14, color: Colors.green),
                          SizedBox(width: 4),
                          Text(
                            'DEFAULT',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green),
                          ),
                        ],
                      ),
                    ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 20),
                    visualDensity: VisualDensity.compact,
                    onPressed: () => _showAddressFormDialog(address),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 20, color: Colors.red),
                    visualDensity: VisualDensity.compact,
                    onPressed: () => _confirmDeleteAddress(id),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                address['fullName'] ?? '',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 4),
              Text(
                'Phone: ${address['contact'] ?? ""}',
                style: TextStyle(
                    color: isDark ? Colors.grey.shade400 : Colors.grey.shade600, fontSize: 13),
              ),
              const SizedBox(height: 8),
              Text(
                _formatAddressText(address),
                style: TextStyle(
                  color: isDark ? Colors.grey.shade300 : Colors.grey.shade700,
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
              if (!isDefault) ...[
                const SizedBox(height: 12),
                InkWell(
                  onTap: () => _setDefaultAddress(id),
                  child: Text(
                    'Set as Default Delivery Address',
                    style: TextStyle(
                      color: isDark ? const Color(0xFFA594F9) : Colors.blue,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatAddressText(Map<String, dynamic> address) {
    final lines = <String>[];
    if (address['addressLine1'] != null) lines.add(address['addressLine1']);
    if (address['addressLine2'] != null &&
        address['addressLine2'].toString().trim().isNotEmpty) {
      lines.add(address['addressLine2']);
    }
    if (address['landmark'] != null && address['landmark'].toString().trim().isNotEmpty) {
      lines.add('Near: ${address['landmark']}');
    }
    final cityState = <String>[];
    if (address['city'] != null) cityState.add(address['city']);
    if (address['state'] != null) cityState.add(address['state']);
    if (address['pincode'] != null) cityState.add(address['pincode']);
    if (cityState.isNotEmpty) lines.add(cityState.join(', '));
    if (address['country'] != null) lines.add(address['country']);
    return lines.join('\n');
  }

  Future<void> _setDefaultAddress(String id) async {
    final success = await ref.read(userAddressesProvider.notifier).setAsDefault(id);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Default address updated'), backgroundColor: Colors.green),
      );
    }
  }

  Future<void> _confirmDeleteAddress(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Delete Address'),
        content: const Text(
            'Are you sure you want to delete this address? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final success = await ref.read(userAddressesProvider.notifier).deleteAddress(id);
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Address deleted successfully'), backgroundColor: Colors.green),
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Address Form Dialog
  // ---------------------------------------------------------------------------

  void _showAddressFormDialog(Map<String, dynamic>? editingAddress) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) => _AddressFormDialog(
        editingAddress: editingAddress,
        onSave: (data, isEditing) async {
          final navigator = Navigator.of(dialogCtx);
          final scaffoldMessenger = ScaffoldMessenger.of(context);

          String? error;
          if (isEditing) {
            error = await ref
                .read(userAddressesProvider.notifier)
                .updateAddress(editingAddress!['id'], data);
          } else {
            error = await ref.read(userAddressesProvider.notifier).addAddress(data);
          }

          navigator.pop();

          if (error == null) {
            scaffoldMessenger.showSnackBar(SnackBar(
              content: Text(isEditing ? 'Address updated successfully' : 'Address added successfully'),
              backgroundColor: Colors.green,
            ));
          } else {
            scaffoldMessenger.showSnackBar(
                SnackBar(content: Text(error), backgroundColor: Colors.red));
          }
        },
        existingAddresses: ref.read(userAddressesProvider).value ?? [],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Address Form as a StatefulWidget so it can hold its own state
// (live location loading, controllers, etc.)
// ---------------------------------------------------------------------------

class _AddressFormDialog extends StatefulWidget {
  final Map<String, dynamic>? editingAddress;
  final Future<void> Function(Map<String, dynamic> data, bool isEditing) onSave;
  final List<dynamic> existingAddresses;

  const _AddressFormDialog({
    required this.editingAddress,
    required this.onSave,
    required this.existingAddresses,
  });

  @override
  State<_AddressFormDialog> createState() => _AddressFormDialogState();
}

class _AddressFormDialogState extends State<_AddressFormDialog> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _fullNameController;
  late final TextEditingController _contactController;
  late final TextEditingController _line1Controller;
  late final TextEditingController _line2Controller;
  late final TextEditingController _landmarkController;
  late final TextEditingController _cityController;
  late final TextEditingController _stateController;
  late final TextEditingController _pincodeController;
  late final TextEditingController _customLabelController;

  late String _selectedType;
  bool _isSaving = false;
  bool _isFetchingLocation = false;

  bool get _isEditing => widget.editingAddress != null;

  @override
  void initState() {
    super.initState();
    final e = widget.editingAddress;
    _fullNameController = TextEditingController(text: e?['fullName'] ?? '');
    _contactController = TextEditingController(text: e?['contact'] ?? '');
    _line1Controller = TextEditingController(text: e?['addressLine1'] ?? '');
    _line2Controller = TextEditingController(text: e?['addressLine2'] ?? '');
    _landmarkController = TextEditingController(text: e?['landmark'] ?? '');
    _cityController = TextEditingController(text: e?['city'] ?? '');
    _stateController = TextEditingController(text: e?['state'] ?? '');
    _pincodeController = TextEditingController(text: e?['pincode'] ?? '');
    _customLabelController = TextEditingController(text: e?['customLabel'] ?? '');

    if (_isEditing) {
      _selectedType = e!['addressType'] ?? 'home';
    } else {
      final hasHome = widget.existingAddresses
          .any((a) => a['addressType'] == 'home' && a['isDeleted'] != true);
      final hasWork = widget.existingAddresses
          .any((a) => a['addressType'] == 'work' && a['isDeleted'] != true);
      if (hasHome && !hasWork) {
        _selectedType = 'work';
      } else if (hasHome && hasWork) {
        _selectedType = 'other';
      } else {
        _selectedType = 'home';
      }
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _contactController.dispose();
    _line1Controller.dispose();
    _line2Controller.dispose();
    _landmarkController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _customLabelController.dispose();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Live Location Fetch
  // ---------------------------------------------------------------------------

  Future<void> _fetchLiveLocation() async {
    setState(() => _isFetchingLocation = true);
    try {
      // 1. Check / request permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Location permission denied. Please enable it in Settings.'),
            backgroundColor: Colors.orange,
          ));
        }
        setState(() => _isFetchingLocation = false);
        return;
      }

      // 2. Check if location service is enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Location services are disabled. Please turn on GPS.'),
            backgroundColor: Colors.orange,
          ));
        }
        setState(() => _isFetchingLocation = false);
        return;
      }

      // 3. Get current position with fallback
      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 4),
          ),
        );
      } catch (e) {
        debugPrint('[AddressesScreen] getCurrentPosition failed: $e. Trying last known position.');
        try {
          position = await Geolocator.getLastKnownPosition();
        } catch (lastKnownErr) {
          debugPrint('[AddressesScreen] getLastKnownPosition failed: $lastKnownErr');
        }
      }

      double resolvedLat = position?.latitude ?? 12.3237008;
      double resolvedLng = position?.longitude ?? 76.6022778;

      final isAppleSim = (resolvedLat - 37.7858).abs() < 0.05 && (resolvedLng - -122.4064).abs() < 0.05;
      final isAndroidSim = (resolvedLat - 37.422).abs() < 0.05 && (resolvedLng - -122.084).abs() < 0.05;
      if (isAppleSim || isAndroidSim) {
        resolvedLat = 12.3237008;
        resolvedLng = 76.6022778;
        debugPrint('[AddressesScreen] Simulator coordinates detected. Overriding to Mysuru.');
      }

      // 4. Reverse geocode using resolved coordinates
      final placemarks =
          await placemarkFromCoordinates(resolvedLat, resolvedLng);

      if (placemarks.isNotEmpty && mounted) {
        final place = placemarks.first;

        // --- Indian Geocoding Field Mapping ---
        // locality   → ward/area (e.g. "Hutagalli") — NOT the city
        // subAdministrativeArea → district/city (e.g. "Mysuru") ← use for City
        // subLocality / locality → area/neighbourhood → Address Line 1
        // thoroughfare / subThoroughfare → street name → Address Line 1

        // Build Address Line 1: street first, then area as fallback
        final streetParts = <String>[];
        if ((place.subThoroughfare ?? '').isNotEmpty) {
          streetParts.add(place.subThoroughfare!);
        }
        if ((place.thoroughfare ?? '').isNotEmpty) {
          streetParts.add(place.thoroughfare!);
        }
        // If no street info, use subLocality (area/ward) for line 1
        if (streetParts.isEmpty && (place.subLocality ?? '').isNotEmpty) {
          streetParts.add(place.subLocality!);
        }
        if (streetParts.isEmpty && (place.locality ?? '').isNotEmpty) {
          streetParts.add(place.locality!);
        }

        final line1 = streetParts.join(', ');

        String city = place.locality ?? '';
        if (city.isEmpty) city = place.subAdministrativeArea ?? '';

        final state = place.administrativeArea ?? '';
        final pincode = place.postalCode ?? '';

        setState(() {
          if (line1.isNotEmpty) _line1Controller.text = line1;
          if (city.isNotEmpty) _cityController.text = city;
          if (state.isNotEmpty) _stateController.text = state;
          if (pincode.isNotEmpty) _pincodeController.text = pincode;
        });

        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Location fetched! Please verify and fill in remaining details.'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 3),
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Could not fetch location: $e'),
          backgroundColor: Colors.red,
        ));
      }
    } finally {
      if (mounted) setState(() => _isFetchingLocation = false);
    }
  }

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    // Duplicate-type check
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final hasHome = widget.existingAddresses.any((a) =>
        a['addressType'] == 'home' &&
        a['isDeleted'] != true &&
        (!_isEditing || a['id'] != widget.editingAddress?['id']));
    final hasWork = widget.existingAddresses.any((a) =>
        a['addressType'] == 'work' &&
        a['isDeleted'] != true &&
        (!_isEditing || a['id'] != widget.editingAddress?['id']));

    if (_selectedType == 'home' && hasHome) {
      scaffoldMessenger.showSnackBar(const SnackBar(
        content: Text(
            'A Home address already exists. Please choose a different type or edit the existing one.'),
        backgroundColor: Colors.orange,
      ));
      return;
    }
    if (_selectedType == 'work' && hasWork) {
      scaffoldMessenger.showSnackBar(const SnackBar(
        content: Text(
            'A Work address already exists. Please choose a different type or edit the existing one.'),
        backgroundColor: Colors.orange,
      ));
      return;
    }

    setState(() => _isSaving = true);

    final data = {
      'addressType': _selectedType,
      'fullName': _fullNameController.text.trim(),
      'contact': _contactController.text.trim(),
      'addressLine1': _line1Controller.text.trim(),
      'addressLine2': _line2Controller.text.trim(),
      'landmark': _landmarkController.text.trim(),
      'city': _cityController.text.trim(),
      'state': _stateController.text.trim(),
      'pincode': _pincodeController.text.trim(),
      'country': 'India',
      if (_selectedType == 'other') 'customLabel': _customLabelController.text.trim(),
    };

    await widget.onSave(data, _isEditing);
    // Dialog is popped by parent after onSave
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Text(
        _isEditing ? 'Edit Address' : 'Add New Address',
        style: const TextStyle(fontWeight: FontWeight.bold),
      ),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.9,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Live Location Button ──────────────────────────────────
                _LiveLocationButton(
                  isLoading: _isFetchingLocation,
                  onTap: _isFetchingLocation ? null : _fetchLiveLocation,
                ),
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 4),

                // ── Address Type ─────────────────────────────────────────
                DropdownButtonFormField<String>(
                  value: _selectedType,
                  decoration: const InputDecoration(labelText: 'Address Type *'),
                  items: const [
                    DropdownMenuItem(value: 'home', child: Text('Home')),
                    DropdownMenuItem(value: 'work', child: Text('Work')),
                    DropdownMenuItem(value: 'other', child: Text('Other')),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedType = val);
                  },
                ),
                if (_selectedType == 'other') ...[
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _customLabelController,
                    decoration:
                        const InputDecoration(labelText: 'Custom Label (e.g. Gym, Office 2) *'),
                    validator: (val) {
                      if (_selectedType == 'other' && (val == null || val.trim().isEmpty)) {
                        return 'Custom label is required';
                      }
                      return null;
                    },
                  ),
                ],
                const SizedBox(height: 8),

                // ── Name & Contact ────────────────────────────────────────
                TextFormField(
                  controller: _fullNameController,
                  decoration: const InputDecoration(labelText: 'Full Name *'),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Full name is required';
                    if (val.trim().length > 100) return 'Maximum 100 characters allowed';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _contactController,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  decoration: const InputDecoration(labelText: 'Contact Number (10 digits) *'),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Contact number is required';
                    if (!RegExp(r'^[0-9]{10}$').hasMatch(val.trim())) {
                      return 'Must be a 10-digit number';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 8),

                // ── Address Fields ────────────────────────────────────────
                TextFormField(
                  controller: _line1Controller,
                  decoration: const InputDecoration(
                    labelText: 'Address Line 1 *',
                    hintText: 'Street / Area',
                  ),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Address Line 1 is required';
                    if (val.trim().length > 200) return 'Maximum 200 characters allowed';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _line2Controller,
                  decoration: const InputDecoration(
                    labelText: 'Address Line 2 (Optional)',
                    hintText: 'Flat / Building / Floor',
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _landmarkController,
                  decoration: const InputDecoration(
                    labelText: 'Landmark (Optional)',
                    hintText: 'e.g. Near City Mall, Opp. Post Office',
                    prefixIcon: Icon(Icons.place_outlined),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _cityController,
                        decoration: const InputDecoration(labelText: 'City *'),
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) return 'City required';
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextFormField(
                        controller: _stateController,
                        decoration: const InputDecoration(labelText: 'State *'),
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) return 'State required';
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _pincodeController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(6),
                  ],
                  decoration: const InputDecoration(labelText: 'Pincode (6 digits) *'),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Pincode is required';
                    if (!RegExp(r'^[0-9]{6}$').hasMatch(val.trim())) {
                      return 'Must be a 6-digit number';
                    }
                    return null;
                  },
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSaving ? null : () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isSaving ? null : _save,
          child: _isSaving
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Save'),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Live Location Button Widget
// ---------------------------------------------------------------------------

class _LiveLocationButton extends StatelessWidget {
  final bool isLoading;
  final VoidCallback? onTap;

  const _LiveLocationButton({required this.isLoading, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.primary;
    return Material(
      color: color.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              if (isLoading)
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: color),
                )
              else
                Icon(Icons.my_location_rounded, color: color, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  isLoading ? 'Fetching your location...' : 'Use My Current Location',
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
              if (!isLoading) Icon(Icons.chevron_right_rounded, color: color, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}
