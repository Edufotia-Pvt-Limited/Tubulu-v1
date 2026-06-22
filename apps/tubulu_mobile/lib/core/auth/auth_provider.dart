import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../api/api_provider.dart';

enum UserRole { customer, merchantAdmin, superAdmin, enabler }

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final UserRole? role;
  final UserRole? activeRole; // The role currently being used (toggleable)
  final String? token;
  final String? merchantId;
  final String? userId;
  final String? phoneNumber;
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? profilePictureUrl;

  const AuthState({
    this.isLoading = true,
    this.isAuthenticated = false,
    this.role,
    this.activeRole,
    this.token,
    this.merchantId,
    this.userId,
    this.phoneNumber,
    this.firstName,
    this.lastName,
    this.email,
    this.profilePictureUrl,
  });
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref _ref;
  final _storage = const FlutterSecureStorage();

  AuthNotifier(this._ref) : super(const AuthState()) {
    _initialize();
  }

  Future<void> _initialize() async {
    final token = await _storage.read(key: 'auth_token');
    if (token != null) {
      final role = await _storage.read(key: 'user_role');
      final activeRole = await _storage.read(key: 'active_role');
      final merchantId = await _storage.read(key: 'merchant_id');
      final userId = await _storage.read(key: 'user_id');
      final phoneNumber = await _storage.read(key: 'phone_number');
      final firstName = await _storage.read(key: 'first_name');
      final lastName = await _storage.read(key: 'last_name');
      final email = await _storage.read(key: 'email');
      final profilePictureUrl = await _storage.read(key: 'profile_picture_url');
      
      final parsedRole = _parseRole(role);
      
      state = AuthState(
        isLoading: false,
        isAuthenticated: true,
        token: token,
        role: parsedRole,
        activeRole: activeRole != null ? _parseRole(activeRole) : parsedRole,
        merchantId: merchantId,
        userId: userId,
        phoneNumber: phoneNumber,
        firstName: firstName,
        lastName: lastName,
        email: email,
        profilePictureUrl: profilePictureUrl,
      );
    } else {
      state = const AuthState(isLoading: false, isAuthenticated: false);
    }
  }

  Future<void> switchRole(UserRole newRole) async {
    await _storage.write(key: 'active_role', value: newRole.name);
    state = AuthState(
      isLoading: false,
      isAuthenticated: state.isAuthenticated,
      token: state.token,
      role: state.role,
      activeRole: newRole,
      merchantId: state.merchantId,
      userId: state.userId,
      phoneNumber: state.phoneNumber,
      firstName: state.firstName,
      lastName: state.lastName,
      email: state.email,
      profilePictureUrl: state.profilePictureUrl,
    );
  }

  Future<void> login(
    String token,
    String role, {
    String? merchantId,
    String? userId,
    String? phoneNumber,
    String? firstName,
    String? lastName,
    String? email,
    String? profilePictureUrl,
  }) async {
    await _storage.write(key: 'auth_token', value: token);
    await _storage.write(key: 'user_role', value: role);
    await _storage.write(key: 'active_role', value: role); // Default active role to official role
    if (merchantId != null) await _storage.write(key: 'merchant_id', value: merchantId);
    if (userId != null) await _storage.write(key: 'user_id', value: userId);
    if (phoneNumber != null) await _storage.write(key: 'phone_number', value: phoneNumber);
    if (firstName != null) await _storage.write(key: 'first_name', value: firstName);
    if (lastName != null) await _storage.write(key: 'last_name', value: lastName);
    if (email != null) await _storage.write(key: 'email', value: email);
    if (profilePictureUrl != null) await _storage.write(key: 'profile_picture_url', value: profilePictureUrl);

    final parsedRole = _parseRole(role);
    state = AuthState(
      isLoading: false,
      isAuthenticated: true,
      token: token,
      role: parsedRole,
      activeRole: parsedRole,
      merchantId: merchantId,
      userId: userId,
      phoneNumber: phoneNumber,
      firstName: firstName,
      lastName: lastName,
      email: email,
      profilePictureUrl: profilePictureUrl,
    );
  }

  Future<void> updateProfileState(String firstName, String? lastName, String? email, {String? profilePictureUrl}) async {
    await _storage.write(key: 'first_name', value: firstName);
    if (lastName != null && lastName.isNotEmpty) {
      await _storage.write(key: 'last_name', value: lastName);
    } else {
      await _storage.delete(key: 'last_name');
    }
    if (email != null && email.isNotEmpty) {
      await _storage.write(key: 'email', value: email);
    } else {
      await _storage.delete(key: 'email');
    }
    if (profilePictureUrl != null && profilePictureUrl.isNotEmpty) {
      await _storage.write(key: 'profile_picture_url', value: profilePictureUrl);
    } else if (profilePictureUrl == null) {
      // Keep existing profilePictureUrl if not modified
    } else {
      await _storage.delete(key: 'profile_picture_url');
    }

    state = AuthState(
      isLoading: false,
      isAuthenticated: state.isAuthenticated,
      token: state.token,
      role: state.role,
      activeRole: state.activeRole,
      merchantId: state.merchantId,
      userId: state.userId,
      phoneNumber: state.phoneNumber,
      firstName: firstName,
      lastName: lastName,
      email: email,
      profilePictureUrl: profilePictureUrl ?? state.profilePictureUrl,
    );
  }

  Future<bool> setPin(String pin) async {
    try {
      final dio = _ref.read(dioProvider);
      final response = await dio.post('/user/set-pin', data: {'pin': pin});
      return response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.deleteAll();
    state = const AuthState(isLoading: false, isAuthenticated: false);
  }

  UserRole _parseRole(String? role) {
    switch (role?.toLowerCase()) {
      case 'super_admin':
      case 'superadmin':
        return UserRole.superAdmin;
      case 'merchant_admin':
      case 'merchantadmin':
        return UserRole.merchantAdmin;
      case 'enabler':
        return UserRole.enabler;
      case 'customer':
      case 'user':
      default:
        return UserRole.customer;
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier(ref));
