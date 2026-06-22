import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:tubulu_mobile/core/auth/auth_provider.dart';
import '../../../core/api/api_provider.dart';

class MobileOnboardScreen extends ConsumerStatefulWidget {
  const MobileOnboardScreen({super.key});

  @override
  ConsumerState<MobileOnboardScreen> createState() => _MobileOnboardScreenState();
}

class _MobileOnboardScreenState extends ConsumerState<MobileOnboardScreen> {
  int _currentStep = 0;
  bool _isLoading = false;
  bool _isLocating = false;
  String? _scopedCityId;
  String? _cityName;

  // Controllers
  final _formKey1 = GlobalKey<FormState>();
  final _formKey2 = GlobalKey<FormState>();
  final _formKey3 = GlobalKey<FormState>();
  final _formKey4 = GlobalKey<FormState>();

  final _storeNameController = TextEditingController();
  final _ownerNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();

  final _addressController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _latController = TextEditingController();
  final _lngController = TextEditingController();
  final _notesController = TextEditingController();

  final _gstController = TextEditingController();
  final _panController = TextEditingController();
  final _aadharController = TextEditingController();
  final _shopEstablishmentController = TextEditingController();

  final _bankAccountController = TextEditingController();
  final _ifscController = TextEditingController();
  final _upiVpaController = TextEditingController();
  final _upiNameController = TextEditingController();

  String _verticalType = 'Food & Beverage';
  final List<String> _verticals = [
    'Food & Beverage',
    'Grocery',
    'Electronics',
    'Retail',
    'Services',
    'Govt Sector',
    'General Store'
  ];

  XFile? _gstImage;
  XFile? _panImage;
  XFile? _aadharImage;
  XFile? _shopEstablishmentImage;
  XFile? _qrCodeImage;

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _fetchEnablerScope().then((_) => _loadDraft());
  }

  @override
  void dispose() {
    _storeNameController.dispose();
    _ownerNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _pincodeController.dispose();
    _latController.dispose();
    _lngController.dispose();
    _notesController.dispose();
    _gstController.dispose();
    _panController.dispose();
    _aadharController.dispose();
    _shopEstablishmentController.dispose();
    _bankAccountController.dispose();
    _ifscController.dispose();
    _upiVpaController.dispose();
    _upiNameController.dispose();
    super.dispose();
  }

  Future<void> _fetchEnablerScope() async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/integrations/myDetails');
      if (response.data['success'] == true) {
        setState(() {
          _scopedCityId = response.data['data']['scopedCityId'];
          _cityName = response.data['data']['city'] ?? 'Mysuru';
        });
      }
    } catch (e) {
      debugPrint('Error fetching enabler scope: $e');
    }
  }

  Future<void> _saveDraft() async {
    final prefs = await SharedPreferences.getInstance();
    final draftData = {
      'currentStep': _currentStep,
      'verticalType': _verticalType,
      'storeName': _storeNameController.text,
      'ownerName': _ownerNameController.text,
      'phone': _phoneController.text,
      'email': _emailController.text,
      'address': _addressController.text,
      'pincode': _pincodeController.text,
      'lat': _latController.text,
      'lng': _lngController.text,
      'notes': _notesController.text,
      'gst': _gstController.text,
      'pan': _panController.text,
      'aadhar': _aadharController.text,
      'shopEstablishment': _shopEstablishmentController.text,
      'bankAccount': _bankAccountController.text,
      'ifsc': _ifscController.text,
      'upiVpa': _upiVpaController.text,
      'upiName': _upiNameController.text,
      'gstImagePath': _gstImage?.path,
      'panImagePath': _panImage?.path,
      'aadharImagePath': _aadharImage?.path,
      'shopEstablishmentImagePath': _shopEstablishmentImage?.path,
      'qrCodeImagePath': _qrCodeImage?.path,
    };
    final userId = ref.read(authProvider).userId ?? 'anonymous';
    await prefs.setString('onboard_draft_$userId', jsonEncode(draftData));
  }

  Future<void> _loadDraft() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = ref.read(authProvider).userId ?? 'anonymous';
    final jsonStr = prefs.getString('onboard_draft_$userId');
    if (jsonStr != null) {
      try {
        final draft = jsonDecode(jsonStr) as Map<String, dynamic>;
        setState(() {
          _currentStep = draft['currentStep'] ?? 0;
          _verticalType = draft['verticalType'] ?? 'Food & Beverage';
          if (!_verticals.contains(_verticalType)) {
            _verticalType = 'Food & Beverage';
          }
          _storeNameController.text = draft['storeName'] ?? '';
          _ownerNameController.text = draft['ownerName'] ?? '';
          _phoneController.text = draft['phone'] ?? '';
          _emailController.text = draft['email'] ?? '';
          _addressController.text = draft['address'] ?? '';
          _pincodeController.text = draft['pincode'] ?? '';
          _latController.text = draft['lat'] ?? '';
          _lngController.text = draft['lng'] ?? '';
          _notesController.text = draft['notes'] ?? '';
          _gstController.text = draft['gst'] ?? '';
          _panController.text = draft['pan'] ?? '';
          _aadharController.text = draft['aadhar'] ?? '';
          _shopEstablishmentController.text = draft['shopEstablishment'] ?? '';
          _bankAccountController.text = draft['bankAccount'] ?? '';
          _ifscController.text = draft['ifsc'] ?? '';
          _upiVpaController.text = draft['upiVpa'] ?? '';
          _upiNameController.text = draft['upiName'] ?? '';
          
          if (draft['gstImagePath'] != null) _gstImage = XFile(draft['gstImagePath']);
          if (draft['panImagePath'] != null) _panImage = XFile(draft['panImagePath']);
          if (draft['aadharImagePath'] != null) _aadharImage = XFile(draft['aadharImagePath']);
          if (draft['shopEstablishmentImagePath'] != null) _shopEstablishmentImage = XFile(draft['shopEstablishmentImagePath']);
          if (draft['qrCodeImagePath'] != null) _qrCodeImage = XFile(draft['qrCodeImagePath']);
        });
      } catch (e) {
        debugPrint('Error loading onboarding draft: $e');
      }
    }
  }

  Future<void> _clearDraft() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = ref.read(authProvider).userId ?? 'anonymous';
    await prefs.remove('onboard_draft_$userId');
  }

  Future<void> _captureLocation() async {
    setState(() => _isLocating = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        throw Exception('Location permissions are permanently denied.');
      }

      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Location services are disabled. Please enable GPS.');
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
        debugPrint('[MobileOnboardScreen] getCurrentPosition failed: $e. Trying last known position.');
        try {
          position = await Geolocator.getLastKnownPosition();
        } catch (lastKnownErr) {
          debugPrint('[MobileOnboardScreen] getLastKnownPosition failed: $lastKnownErr');
        }
      }

      double resolvedLat = position?.latitude ?? 12.3237008;
      double resolvedLng = position?.longitude ?? 76.6022778;

      final isAppleSim = (resolvedLat - 37.7858).abs() < 0.05 && (resolvedLng - -122.4064).abs() < 0.05;
      final isAndroidSim = (resolvedLat - 37.422).abs() < 0.05 && (resolvedLng - -122.084).abs() < 0.05;
      if (isAppleSim || isAndroidSim) {
        resolvedLat = 12.3237008;
        resolvedLng = 76.6022778;
        debugPrint('[MobileOnboardScreen] Simulator coordinates detected. Overriding to Mysuru.');
      }

      if (!mounted) return;
      setState(() {
        _latController.text = resolvedLat.toString();
        _lngController.text = resolvedLng.toString();
        _isLocating = false;
      });
      _saveDraft();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('GPS Coordinates captured successfully!')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLocating = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to capture GPS: $e')),
      );
    }
  }

  Future<void> _pickImage(String type) async {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Choose from Gallery'),
                onTap: () async {
                  Navigator.pop(ctx);
                  await _executePickImage(type, ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Take Photo'),
                onTap: () async {
                  Navigator.pop(ctx);
                  await _executePickImage(type, ImageSource.camera);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _executePickImage(String type, ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 85,
      );
      if (image != null) {
        setState(() {
          if (type == 'GST') _gstImage = image;
          if (type == 'PAN') _panImage = image;
          if (type == 'Aadhaar') _aadharImage = image;
          if (type == 'ShopEstablishment') _shopEstablishmentImage = image;
          if (type == 'QRCode') _qrCodeImage = image;
        });
        _saveDraft();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error picking image: $e')),
        );
      }
    }
  }

  Future<void> _submitOnboarding() async {
    if (!_formKey4.currentState!.validate()) return;
    if (_scopedCityId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error: Enabler scope not loaded yet. please retry.')),
      );
      return;
    }

    setState(() => _isLoading = true);
    final dio = ref.read(dioProvider);

    // Mock document URLs mapping
    final List<Map<String, String>> docs = [];
    if (_gstImage != null) docs.add({'type': 'GST', 'url': 'https://tubuludata.s3.ap-south-1.amazonaws.com/kyc/gst_mock.png', 'fileName': 'gst_cert.png'});
    if (_panImage != null) docs.add({'type': 'PAN', 'url': 'https://tubuludata.s3.ap-south-1.amazonaws.com/kyc/pan_mock.png', 'fileName': 'pan_card.png'});
    if (_aadharImage != null) docs.add({'type': 'Aadhaar', 'url': 'https://tubuludata.s3.ap-south-1.amazonaws.com/kyc/aadhar_mock.png', 'fileName': 'aadhar.png'});
    if (_shopEstablishmentImage != null) docs.add({'type': 'ShopEstablishment', 'url': 'https://tubuludata.s3.ap-south-1.amazonaws.com/kyc/shop_establishment_mock.png', 'fileName': 'shop_establishment.png'});
    if (_qrCodeImage != null) docs.add({'type': 'PaymentQRCode', 'url': 'https://tubuludata.s3.ap-south-1.amazonaws.com/kyc/payment_qr_mock.png', 'fileName': 'payment_qr_code.png'});

    try {
      final response = await dio.post('/enabler/submit', data: {
        'integrationName': _storeNameController.text.trim(),
        'verticalType': _verticalType,
        'phoneNumber': _phoneController.text.trim(),
        'email': _emailController.text.trim().isEmpty ? null : _emailController.text.trim(),
        'addressLine': _addressController.text.trim(),
        'pincode': _pincodeController.text.trim(),
        'cityId': _scopedCityId,
        'gpsLatitude': double.tryParse(_latController.text) ?? 12.3237,
        'gpsLongitude': double.tryParse(_lngController.text) ?? 76.6022,
        'fieldNotes': _notesController.text.trim(),
        'gstNumber': _gstController.text.trim().isEmpty ? null : _gstController.text.trim(),
        'panNumber': _panController.text.trim().isEmpty ? null : _panController.text.trim(),
        'aadharNumber': _aadharController.text.trim().isEmpty ? null : _aadharController.text.trim(),
        'shopEstablishmentNumber': _shopEstablishmentController.text.trim().isEmpty ? null : _shopEstablishmentController.text.trim(),
        'upiVpa': _upiVpaController.text.trim(),
        'upiMerchantName': _upiNameController.text.trim().isEmpty ? _storeNameController.text.trim() : _upiNameController.text.trim(),
        'documents': docs,
      });

      if (response.data['success'] == true) {
        if (!mounted) return;
        await _clearDraft();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Merchant Onboarded successfully for review!'), backgroundColor: Colors.green),
        );
        context.go('/enabler/dashboard');
      }
    } on DioException catch (e) {
      if (!mounted) return;
      final msg = e.response?.data?['message'] ?? 'Failed to submit merchant profile';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An error occurred: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Merchant Onboarding'),
      ),
      body: Column(
        children: [
          // Step progress indicators
          _buildStepIndicator(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: _buildCurrentStepForm(),
            ),
          ),
          _buildBottomButtons(),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      color: Colors.grey[100],
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(4, (index) {
          final isCompleted = _currentStep > index;
          final isCurrent = _currentStep == index;
          return Row(
            children: [
              CircleAvatar(
                radius: 14,
                backgroundColor: isCompleted
                    ? Colors.green
                    : isCurrent
                        ? Colors.indigo
                        : Colors.grey[300],
                child: isCompleted
                    ? const Icon(Icons.check, size: 16, color: Colors.white)
                    : Text(
                        (index + 1).toString(),
                        style: TextStyle(
                          fontSize: 12,
                          color: isCurrent || isCompleted ? Colors.white : Colors.black87,
                        ),
                      ),
              ),
              if (index < 3)
                Container(
                  width: 40,
                  height: 2,
                  color: _currentStep > index ? Colors.green : Colors.grey[300],
                ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildCurrentStepForm() {
    switch (_currentStep) {
      case 0:
        return Form(
          key: _formKey1,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Step 1: Business Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[800])),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _verticalType,
                decoration: const InputDecoration(labelText: 'Business Vertical *', border: OutlineInputBorder()),
                items: _verticals.map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
                onChanged: (val) => setState(() => _verticalType = val!),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _storeNameController,
                decoration: const InputDecoration(labelText: 'Store / Business Name *', border: OutlineInputBorder()),
                validator: (val) => val == null || val.isEmpty ? 'Store name is compulsory' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _ownerNameController,
                decoration: const InputDecoration(labelText: 'Owner / Contact Name', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                maxLength: 10,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  labelText: 'Owner Phone Number (10 digits) *', 
                  border: OutlineInputBorder(),
                  counterText: "",
                ),
                validator: (val) => val == null || val.length != 10 ? 'Enter valid 10 digit number' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Owner Email (Optional)', border: OutlineInputBorder()),
              ),
            ],
          ),
        );
      case 1:
        return Form(
          key: _formKey2,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Step 2: Location Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[800])),
              const SizedBox(height: 16),
              TextFormField(
                controller: _addressController,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Full Address *', border: OutlineInputBorder()),
                validator: (val) => val == null || val.isEmpty ? 'Address is compulsory' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _pincodeController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(labelText: 'Pincode *', border: OutlineInputBorder(), counterText: ""),
                validator: (val) => val == null || val.length != 6 ? 'Pincode must be 6 digits' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                enabled: false,
                decoration: InputDecoration(
                  labelText: 'Assigned CityScope *',
                  hintText: _cityName ?? 'Loading Scope...',
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              Card(
                color: Colors.indigo.withOpacity(0.04),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Live GPS Coordinates *', style: TextStyle(fontWeight: FontWeight.bold)),
                          ElevatedButton.icon(
                            onPressed: _isLocating ? null : _captureLocation,
                            icon: _isLocating
                                ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                                : const Icon(Icons.gps_fixed, size: 16),
                            label: Text(_isLocating ? 'Locating...' : 'Capture'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _latController,
                              readOnly: true,
                              decoration: const InputDecoration(labelText: 'Latitude', border: OutlineInputBorder()),
                              validator: (val) => val == null || val.isEmpty ? 'GPS required' : null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _lngController,
                              readOnly: true,
                              decoration: const InputDecoration(labelText: 'Longitude', border: OutlineInputBorder()),
                              validator: (val) => val == null || val.isEmpty ? 'GPS required' : null,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _notesController,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Executive Field Notes (Optional)', border: OutlineInputBorder()),
              ),
            ],
          ),
        );
      case 2:
        return Form(
          key: _formKey3,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Step 3: KYC Documents', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[800])),
              const SizedBox(height: 16),
              TextFormField(
                controller: _gstController,
                maxLength: 15,
                textCapitalization: TextCapitalization.characters,
                decoration: const InputDecoration(
                  labelText: 'GSTIN Number (Optional)', 
                  hintText: 'e.g. 29ABCDE1234F1Z5',
                  border: OutlineInputBorder(),
                  counterText: "",
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return null;
                  final uppercaseVal = val.toUpperCase().trim();
                  final gstRegex = RegExp(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');
                  if (!gstRegex.hasMatch(uppercaseVal)) {
                    return 'Invalid GST format (e.g. 29ABCDE1234F1Z5)';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 8),
              _buildKYCCard('GST Certificate (Optional)', _gstImage, () => _pickImage('GST')),
              const Divider(height: 24),
              TextFormField(
                controller: _panController,
                maxLength: 10,
                textCapitalization: TextCapitalization.characters,
                decoration: const InputDecoration(
                  labelText: 'Business PAN Number *', 
                  hintText: 'e.g. ABCDE1234F',
                  border: OutlineInputBorder(),
                  counterText: "",
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Business PAN is required';
                  }
                  final uppercaseVal = val.toUpperCase().trim();
                  final panRegex = RegExp(r'^[A-Z]{5}[0-9]{4}[A-Z]$');
                  if (!panRegex.hasMatch(uppercaseVal)) {
                    return 'Invalid PAN Card format (e.g. ABCDE1234F)';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 8),
              _buildKYCCard('PAN Card Photo *', _panImage, () => _pickImage('PAN')),
              const Divider(height: 24),
              TextFormField(
                controller: _aadharController,
                maxLength: 12,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  labelText: 'Aadhaar Number *', 
                  hintText: 'e.g. 123456789012',
                  border: OutlineInputBorder(),
                  counterText: "",
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Aadhaar is required';
                  }
                  final clean = val.replaceAll(RegExp(r'[^0-9]'), '');
                  if (clean.length != 12) {
                    return 'Aadhaar must be exactly 12 digits';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 8),
              _buildKYCCard('Aadhaar Photo *', _aadharImage, () => _pickImage('Aadhaar')),
              const Divider(height: 24),
              TextFormField(
                controller: _shopEstablishmentController,
                maxLength: 18,
                decoration: const InputDecoration(
                  labelText: 'Shop Establishment Number *',
                  hintText: 'e.g. 123456/2026',
                  border: OutlineInputBorder(),
                  counterText: "",
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Shop Establishment Number is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 8),
              _buildKYCCard('Shop Establishment Photo *', _shopEstablishmentImage, () => _pickImage('ShopEstablishment')),
            ],
          ),
        );
      case 3:
        return Form(
          key: _formKey4,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Step 4: UPI & Bank Settings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[800])),
              const SizedBox(height: 16),
              TextFormField(
                controller: _bankAccountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Bank Account Number', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _ifscController,
                decoration: const InputDecoration(labelText: 'IFSC Code', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 20),
              const Divider(),
              const SizedBox(height: 20),
              TextFormField(
                controller: _upiVpaController,
                decoration: const InputDecoration(labelText: 'Settlement UPI ID (VPA) *', hintText: 'e.g. storename@ybl', border: OutlineInputBorder()),
                validator: (val) => val == null || val.isEmpty ? 'UPI VPA ID is required for digital payments' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _upiNameController,
                decoration: const InputDecoration(labelText: 'UPI Registered Merchant Name', border: OutlineInputBorder()),
              ),
            ],
          ),
        );
      default:
        return const SizedBox();
    }
  }

  Widget _buildKYCCard(String title, XFile? image, VoidCallback onTap) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(side: BorderSide(color: Colors.grey[300]!), borderRadius: BorderRadius.circular(10)),
      child: ListTile(
        leading: Icon(image == null ? Icons.camera_alt_outlined : Icons.check_circle, color: image == null ? Colors.grey : Colors.green),
        title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        subtitle: Text(image == null ? 'Not Captured' : 'Captured: ${image.name.substring(image.name.length - 8)}'),
        trailing: TextButton(
          onPressed: onTap,
          child: Text(image == null ? 'Take Photo' : 'Retake'),
        ),
      ),
    );
  }

  Widget _buildBottomButtons() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, -4))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (_currentStep > 0)
            OutlinedButton(
              onPressed: () {
                setState(() => _currentStep--);
                _saveDraft();
              },
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16)),
              child: const Text('Back'),
            )
          else
            const SizedBox(),
          ElevatedButton(
            onPressed: _isLoading ? null : _onNextPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.indigo,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            ),
            child: _isLoading
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Text(_currentStep == 3 ? 'Submit Merchant' : 'Next'),
          ),
        ],
      ),
    );
  }

  void _onNextPressed() {
    if (_currentStep == 0) {
      if (_formKey1.currentState!.validate()) {
        setState(() => _currentStep++);
        _saveDraft();
      }
    } else if (_currentStep == 1) {
      if (_formKey2.currentState!.validate()) {
        setState(() => _currentStep++);
        _saveDraft();
      }
    } else if (_currentStep == 2) {
      if (_formKey3.currentState!.validate()) {
        if (_panImage == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please capture PAN Card Photo')),
          );
          return;
        }
        if (_aadharImage == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please capture Aadhaar Photo')),
          );
          return;
        }
        if (_shopEstablishmentImage == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please capture Shop Establishment Photo')),
          );
          return;
        }
        setState(() => _currentStep++);
        _saveDraft();
      }
    } else if (_currentStep == 3) {
      _submitOnboarding();
    }
  }
}
