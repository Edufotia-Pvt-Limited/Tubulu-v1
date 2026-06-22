import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pinput/pinput.dart';
import '../../../core/auth/auth_provider.dart';

class SetPinScreen extends ConsumerStatefulWidget {
  const SetPinScreen({super.key});

  @override
  ConsumerState<SetPinScreen> createState() => _SetPinScreenState();
}

class _SetPinScreenState extends ConsumerState<SetPinScreen> {
  final _pinController = TextEditingController();
  final _confirmPinController = TextEditingController();
  bool _isConfirmStep = false;
  bool _isLoading = false;

  Future<void> _handleSetPin() async {
    if (_pinController.text != _confirmPinController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PINs do not match')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final success = await ref.read(authProvider.notifier).setPin(_pinController.text);

    if (success) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Security PIN set successfully!'), backgroundColor: Colors.green),
      );
      // Navigate to correct dashboard based on role
      final auth = ref.read(authProvider);
      final role = auth.activeRole;
      if (role == UserRole.merchantAdmin || role == UserRole.superAdmin) {
        context.go('/merchant/catalogue');
      } else {
        context.go('/customer/home');
      }
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to set PIN. Please try again.')),
      );
    }

    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Setup Security PIN'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Icon(Icons.lock_outline, size: 64, color: Color(0xFF3D5AFE)),
            const SizedBox(height: 24),
            Text(
              _isConfirmStep ? 'Confirm your PIN' : 'Create a 4-digit PIN',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'This PIN will be used for future logins to keep your account secure.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 40),
            Pinput(
              key: ValueKey(_isConfirmStep ? 'confirm_pin_input' : 'setup_pin_input'),
              length: 4,
              controller: _isConfirmStep ? _confirmPinController : _pinController,
              obscureText: true,
              onCompleted: (pin) {
                if (!_isConfirmStep) {
                  setState(() => _isConfirmStep = true);
                } else {
                  _handleSetPin();
                }
              },
            ),
            const SizedBox(height: 40),
            if (_isConfirmStep)
              TextButton(
                onPressed: () => setState(() {
                  _isConfirmStep = false;
                  _confirmPinController.clear();
                }),
                child: const Text('Back to Change PIN'),
              ),
          ],
        ),
      ),
    );
  }
}
