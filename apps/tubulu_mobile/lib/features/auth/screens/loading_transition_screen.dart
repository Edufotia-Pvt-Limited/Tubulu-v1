import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tubulu_mobile/core/providers/location_service.dart';
import 'package:tubulu_mobile/core/auth/auth_provider.dart';
import 'package:tubulu_mobile/core/providers/preferences_provider.dart';

// StateProvider to track if the transition loading animation has completed
final loadingCompletedProvider = StateProvider<bool>((ref) => false);

class LoadingTransitionScreen extends ConsumerStatefulWidget {
  const LoadingTransitionScreen({super.key});

  @override
  ConsumerState<LoadingTransitionScreen> createState() => _LoadingTransitionScreenState();
}

class _LoadingTransitionScreenState extends ConsumerState<LoadingTransitionScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  Timer? _timeoutTimer;
  bool _isTransitioning = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startInitialization();
    });
  }

  void _startInitialization() async {
    if (!mounted) return;

    final authState = ref.read(authProvider);
    final isCustomer = authState.activeRole == UserRole.customer;

    if (isCustomer) {
      // Start 4 second safety timeout
      _timeoutTimer = Timer(const Duration(seconds: 4), () {
        _completeLoading('Timeout reached');
      });

      // Start fetching location
      try {
        await initLocationService(ref, context);
        _completeLoading('Location resolved');
      } catch (e) {
        debugPrint('[LoadingTransitionScreen] Error initializing location: $e');
        _completeLoading('Location resolution error');
      }
    } else {
      // For non-customers, just show the transition for 1.5 seconds
      Future.delayed(const Duration(milliseconds: 1500), () {
        _completeLoading('Non-customer delay complete');
      });
    }
  }

  void _completeLoading(String reason) {
    if (!mounted || _isTransitioning) return;
    _isTransitioning = true;
    _timeoutTimer?.cancel();
    
    // Ensure we mark location as ready in case of error/timeout
    final prefs = ref.read(preferencesProvider);
    if (!prefs.locationReady) {
      ref.read(preferencesProvider.notifier).markLocationReady();
    }

    ref.read(loadingCompletedProvider.notifier).state = true;
    debugPrint('[LoadingTransitionScreen] Transition completed: $reason');
  }

  @override
  void dispose() {
    _timeoutTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Dark elegant background
      body: Stack(
        children: [
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Animated Pulsing Logo container
                AnimatedBuilder(
                  animation: _controller,
                  builder: (context, child) {
                    final scale = 1.0 + (math.sin(_controller.value * 2 * math.pi) * 0.05);
                    return Transform.scale(
                      scale: scale,
                      child: child,
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blueAccent.withValues(alpha: 0.2),
                          blurRadius: 30,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: Image.asset(
                      'assets/images/splash_logo.png',
                      width: 90,
                      height: 90,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) => const Icon(
                        Icons.shopping_bag,
                        size: 60,
                        color: Colors.blueAccent,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Tubulu',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Connecting you locally...',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white60,
                  ),
                ),
              ],
            ),
          ),
          // Pulsing wave at the bottom of the screen
          Positioned(
            bottom: 80,
            left: 0,
            right: 0,
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 40,
                  child: AnimatedBuilder(
                    animation: _controller,
                    builder: (context, child) {
                      return CustomPaint(
                        painter: WavePainter(_controller.value * 2 * math.pi),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class WavePainter extends CustomPainter {
  final double animationValue;

  WavePainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = const LinearGradient(
        colors: [Colors.cyan, Colors.purpleAccent, Colors.blueAccent],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 2);

    final path = Path();
    path.moveTo(0, size.height / 2);

    for (double i = 0; i <= size.width; i++) {
      final y = math.sin((i / size.width * 2 * math.pi * 2.5) - animationValue) * 10 + (size.height / 2);
      path.lineTo(i, y);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant WavePainter oldDelegate) {
    return oldDelegate.animationValue != animationValue;
  }
}
