import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:pinput/pinput.dart';
import '../../../core/auth/auth_provider.dart';
import '../../../core/api/api_provider.dart';

enum LoginRole { customer, merchant }

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpSent = false;
  bool _isPinFlow = false;
  bool _isForgotPinFlow = false; // User explicitly chose 'Forgot PIN'
  bool _isLoading = false;
  String _fullPhoneNumber = '';
  LoginRole _selectedRole = LoginRole.customer;

  Future<void> _sendOtp() async {
    final dio = ref.read(dioProvider);

    final String strippedPhone = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (strippedPhone.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit phone number')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final body = {'phoneNumber': strippedPhone};
      final response = await dio.post('/user/register', data: body);

      if (response.data['success'] == true) {
        if (!mounted) return;
        final hasPin = response.data['hasPin'] == true;
        
        setState(() {
          _otpSent = true;
          _isPinFlow = hasPin;
        });

        if (!hasPin) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('OTP sent successfully!'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    } on DioException catch (e) {
      if (!mounted) return;
      final msg = e.response?.data?['message'] ?? 'Failed to send OTP';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to send OTP: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Called when user clicks 'Forgot PIN? Use OTP' 
  Future<void> _sendForgotPinOtp() async {
    final dio = ref.read(dioProvider);
    final String strippedPhone = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');
    setState(() => _isLoading = true);
    try {
      final response = await dio.post('/user/register', data: {
        'phoneNumber': strippedPhone,
        'forgotPin': true,
      });
      if (response.data['success'] == true && mounted) {
        setState(() {
          _isForgotPinFlow = true;
          _isPinFlow = false;
          _otpController.clear();
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP sent! Enter it to reset your PIN.'), backgroundColor: Colors.orange),
        );
      }
    } on DioException catch (e) {
      if (!mounted) return;
      final msg = e.response?.data?['message'] ?? 'Could not send OTP';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _showReactivateDialog(String phoneNumber, {String? pin, String? otp}) async {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Reactivate Account?'),
          content: const Text('Your account is currently deactivated. Would you like to reactivate it and log in?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.pop(dialogContext);
                setState(() => _isLoading = true);
                try {
                  final dio = ref.read(dioProvider);
                  final response = await dio.post('/user/reactivate', data: {
                    'phoneNumber': phoneNumber,
                    if (pin != null) 'pin': pin,
                    if (otp != null) 'otp': otp,
                  });

                  if (response.data['success'] == true) {
                    final respData = response.data['data'] ?? response.data;
                    final userData = response.data['user'];

                    await ref.read(authProvider.notifier).login(
                      response.data['authToken'] ?? respData['authToken'],
                      respData['role'] ?? 'customer',
                      userId: userData?['id'] ?? respData?['id'],
                      merchantId: userData?['merchantId'] ?? respData?['merchantId'],
                      phoneNumber: phoneNumber,
                      firstName: userData?['firstName'] ?? respData?['firstName'],
                      lastName: userData?['lastName'] ?? respData?['lastName'],
                      email: userData?['email'] ?? respData?['email'],
                    );
                    
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Account reactivated and logged in!'), backgroundColor: Colors.green),
                      );
                    }
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Reactivation failed: ${e.toString()}')),
                    );
                  }
                } finally {
                  if (mounted) setState(() => _isLoading = false);
                }
              },
              child: const Text('Reactivate', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _verifyPin() async {
    final dio = ref.read(dioProvider);
    setState(() => _isLoading = true);
    
    final String strippedPhone = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');

    try {
      final response = await dio.post('/user/verify-pin', data: {
        'phoneNumber': strippedPhone,
        'pin': _otpController.text,
      });
      
      if (response.data['success']) {
        final respData = response.data['data'] ?? response.data;
        final userData = response.data['user'];
        
        await ref.read(authProvider.notifier).login(
          response.data['authToken'] ?? respData['authToken'],
          respData['role'] ?? 'customer',
          userId: userData?['id'] ?? respData?['id'],
          merchantId: userData?['merchantId'] ?? respData?['merchantId'],
          phoneNumber: strippedPhone,
          firstName: userData?['firstName'] ?? respData?['firstName'],
          lastName: userData?['lastName'] ?? respData?['lastName'],
          email: userData?['email'] ?? respData?['email'],
        );
      } else if (response.data['isDeactivated'] == true) {
        if (!mounted) return;
        _showReactivateDialog(strippedPhone, pin: _otpController.text);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('PIN incorrect. Try again.')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _verifyOtp() async {
    final dio = ref.read(dioProvider);
    setState(() => _isLoading = true);
    
    final String strippedPhone = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');

    try {
      final response = await dio.post('/user/verifyOtp', data: {
        'phoneNumber': strippedPhone, 
        'otp': _otpController.text,
        if (_isForgotPinFlow) 'forgotPin': true,
      });
      
      if (response.data['success']) {
        final respData = response.data['data'] ?? response.data;
        final userData = response.data['user'];
        final requiresPinSetup = response.data['requiresPinSetup'] == true;
        
        await ref.read(authProvider.notifier).login(
          response.data['authToken'] ?? respData['authToken'],
          respData['role'] ?? 'customer',
          userId: userData?['id'] ?? respData?['id'],
          merchantId: userData?['merchantId'] ?? respData?['merchantId'],
          phoneNumber: strippedPhone,
          firstName: userData?['firstName'] ?? respData?['firstName'],
          lastName: userData?['lastName'] ?? respData?['lastName'],
          email: userData?['email'] ?? respData?['email'],
        );

        // Navigate to PIN setup if this is first login or forgot-pin reset
        if (requiresPinSetup && mounted) {
          context.go('/auth/set-pin');
        }
      } else if (response.data['isDeactivated'] == true) {
        if (!mounted) return;
        _showReactivateDialog(strippedPhone, otp: _otpController.text);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Verification failed: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF2355C4),
        foregroundColor: Colors.white,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
              child: Image.asset('assets/images/splash_logo.png', width: 20, height: 20),
            ),
            const SizedBox(width: 10),
            const Text('Tubulu Login', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: Image.asset('assets/images/splash_logo.png', width: 70, height: 70),
              ),
              const Text(
                'Welcome to Tubulu',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                _isPinFlow ? 'Enter your security PIN to login' : 'Enter your phone number to continue',
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 40),
              
              if (!_otpSent) ...[
                IntlPhoneField(
                  controller: _phoneController,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    border: OutlineInputBorder(),
                  ),
                  initialCountryCode: 'IN',
                  onChanged: (phone) => _fullPhoneNumber = phone.completeNumber,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _sendOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF3D5AFE),
                      foregroundColor: Colors.white,
                    ),
                    child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Next'),
                  ),
                ),
              ] else ...[
                Text(_isPinFlow ? 'Security PIN' : 'Enter 6-digit OTP', style: const TextStyle(fontWeight: FontWeight.w500)),
                const SizedBox(height: 24),
                Pinput(
                  length: _isPinFlow ? 4 : 6,
                  controller: _otpController,
                  obscureText: _isPinFlow,
                  onCompleted: (pin) {
                    if (!_isLoading) {
                      if (_isPinFlow) {
                        _verifyPin();
                      } else {
                        _verifyOtp();
                      }
                    }
                  },
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : (_isPinFlow ? _verifyPin : _verifyOtp),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF3D5AFE),
                      foregroundColor: Colors.white,
                    ),
                    child: _isLoading 
                      ? const CircularProgressIndicator(color: Colors.white) 
                      : Text(_isPinFlow ? 'Login' : 'Verify & Login'),
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => setState(() {
                    _otpSent = false;
                    _isPinFlow = false;
                    _isForgotPinFlow = false;
                    _otpController.clear();
                  }),
                  child: const Text('Edit Phone Number'),
                ),
                if (_isPinFlow)
                  TextButton(
                    onPressed: _isLoading ? null : _sendForgotPinOtp,
                    child: const Text('Forgot PIN? Use OTP'),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
