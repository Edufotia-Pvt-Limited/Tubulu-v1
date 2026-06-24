import 'dart:io' show Platform;
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../auth/auth_provider.dart';

const _stagingUrl = String.fromEnvironment(
  'STAGING_URL', 
  defaultValue: 'http://34.135.72.28/api/v1'
);

class ApiConfig {
  static final String baseUrl = () {
    const fromEnv = String.fromEnvironment('BASE_URL');
    if (fromEnv.isNotEmpty) return fromEnv;
    
    // In debug mode, default to local machine server for emulator/simulator development
    if (kDebugMode) {
      if (!kIsWeb && Platform.isAndroid) {
        return 'http://10.0.2.2:3008/api/v1';
      }
      return 'http://localhost:3008/api/v1';
    }
    
    // In release mode (e.g. built staging APK), default to GCP staging server
    return _stagingUrl;
  }();

  static const String razorpayPublicKey = String.fromEnvironment(
    'RAZORPAY_PUBLIC_KEY',
    defaultValue: 'rzp_test_S4RhE3lkMmLbAn',
  );
}

final storageProvider = Provider((ref) => const FlutterSecureStorage());

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(storageProvider);
  
  final dio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Bypass-Tunnel-Reminder': 'true',
      'User-Agent': 'custom',
    },
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await storage.read(key: 'auth_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (error, handler) {
      if (error.response?.statusCode == 401) {
        ref.read(authProvider.notifier).logout();
      }
      return handler.next(error);
    },
  ));

  return dio;
});
