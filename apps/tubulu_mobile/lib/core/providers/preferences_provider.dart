import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert' show jsonDecode, jsonEncode;
import '../theme/city_theme.dart';

class UserPreferences {
  final String category;
  final double lat;
  final double lng;
  final double radius;
  /// True once the GPS attempt has completed (success OR fallback).
  /// Home screen uses this to avoid fetching merchants with stale default coords.
  final bool locationReady;
  final CityTheme? cityTheme;
  final List<String>? selectedContactNames;
  final String? cityName;
  final String? fullAddress;

  const UserPreferences({
    this.category = 'All',
    this.lat = 12.3237008, // Default to Mysuru center
    this.lng = 76.6022778,
    this.radius = 50.0, // Default 50km
    this.locationReady = false,
    this.cityTheme,
    this.selectedContactNames,
    this.cityName,
    this.fullAddress,
  });

  UserPreferences copyWith({
    String? category,
    double? lat,
    double? lng,
    double? radius,
    bool? locationReady,
    CityTheme? cityTheme,
    bool clearCityTheme = false,
    List<String>? selectedContactNames,
    bool clearSelectedContacts = false,
    String? cityName,
    bool clearCityName = false,
    String? fullAddress,
    bool clearFullAddress = false,
  }) {
    return UserPreferences(
      category: category ?? this.category,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      radius: radius ?? this.radius,
      locationReady: locationReady ?? this.locationReady,
      cityTheme: clearCityTheme ? null : (cityTheme ?? this.cityTheme),
      selectedContactNames: clearSelectedContacts ? null : (selectedContactNames ?? this.selectedContactNames),
      cityName: clearCityName ? null : (cityName ?? this.cityName),
      fullAddress: clearFullAddress ? null : (fullAddress ?? this.fullAddress),
    );
  }
}

class PreferencesNotifier extends StateNotifier<UserPreferences> {
  PreferencesNotifier() : super(const UserPreferences()) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    CityTheme? loadedTheme;
    final themeStr = prefs.getString('pref_city_theme');
    if (themeStr != null) {
      try {
        loadedTheme = CityTheme.fromJson(jsonDecode(themeStr));
      } catch (_) {}
    }

    List<String>? loadedContactNames;
    final contactsStr = prefs.getString('pref_selected_contacts');
    if (contactsStr != null) {
      try {
        loadedContactNames = List<String>.from(jsonDecode(contactsStr));
      } catch (_) {}
    }

    state = UserPreferences(
      category: prefs.getString('pref_category') ?? 'All',
      lat: prefs.getDouble('pref_lat') ?? 12.3237008,
      lng: prefs.getDouble('pref_lng') ?? 76.6022778,
      radius: prefs.getDouble('pref_radius') ?? 50.0,
      locationReady: false, // GPS not yet resolved for this session
      cityTheme: loadedTheme,
      selectedContactNames: loadedContactNames,
      cityName: prefs.getString('pref_city_name'),
      fullAddress: prefs.getString('pref_full_address'),
    );
  }

  Future<void> updateCategory(String category) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('pref_category', category);
    state = state.copyWith(category: category);
  }

  /// Called after GPS resolves (real coords OR fallback). Marks locationReady = true.
  Future<void> updateLocation(double lat, double lng, {String? cityName, String? fullAddress}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('pref_lat', lat);
    await prefs.setDouble('pref_lng', lng);
    if (cityName != null) {
      await prefs.setString('pref_city_name', cityName);
    } else {
      await prefs.remove('pref_city_name');
    }
    if (fullAddress != null) {
      await prefs.setString('pref_full_address', fullAddress);
    } else {
      await prefs.remove('pref_full_address');
    }
    state = state.copyWith(
      lat: lat,
      lng: lng,
      locationReady: true,
      cityName: cityName,
      clearCityName: cityName == null,
      fullAddress: fullAddress,
      clearFullAddress: fullAddress == null,
    );
  }

  /// Called when mock location and radius are applied together.
  Future<void> updateLocationAndRadius(double lat, double lng, double radius, {String? cityName, String? fullAddress}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('pref_lat', lat);
    await prefs.setDouble('pref_lng', lng);
    await prefs.setDouble('pref_radius', radius);
    if (cityName != null) {
      await prefs.setString('pref_city_name', cityName);
    } else {
      await prefs.remove('pref_city_name');
    }
    if (fullAddress != null) {
      await prefs.setString('pref_full_address', fullAddress);
    } else {
      await prefs.remove('pref_full_address');
    }
    state = state.copyWith(
      lat: lat,
      lng: lng,
      radius: radius,
      locationReady: true,
      cityName: cityName,
      clearCityName: cityName == null,
      fullAddress: fullAddress,
      clearFullAddress: fullAddress == null,
    );
  }

  /// Updates or clears the dynamic city theme
  Future<void> updateCityTheme(CityTheme? cityTheme, {String? cityName}) async {
    final prefs = await SharedPreferences.getInstance();
    if (cityTheme != null) {
      await prefs.setString('pref_city_theme', jsonEncode(cityTheme.toJson()));
    } else {
      await prefs.remove('pref_city_theme');
    }

    if (cityName != null) {
      await prefs.setString('pref_city_name', cityName);
    } else {
      await prefs.remove('pref_city_name');
    }

    state = state.copyWith(
      cityTheme: cityTheme,
      clearCityTheme: cityTheme == null,
      cityName: cityName,
      clearCityName: cityName == null,
    );
  }

  /// Updates the selected friends for recommendations filter
  Future<void> updateSelectedContacts(List<String> contactNames) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('pref_selected_contacts', jsonEncode(contactNames));
    state = state.copyWith(selectedContactNames: contactNames);
  }

  /// Call this when GPS is unavailable or denied — use stored/default coords but mark ready.
  void markLocationReady() {
    state = state.copyWith(locationReady: true);
  }
}

final preferencesProvider = StateNotifierProvider<PreferencesNotifier, UserPreferences>((ref) {
  return PreferencesNotifier();
});
