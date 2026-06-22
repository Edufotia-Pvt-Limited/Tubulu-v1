import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'preferences_provider.dart';
import '../theme/theme_provider.dart';
import '../theme/app_theme.dart';
import '../theme/city_theme.dart';
import '../api/api_provider.dart';
import 'package:geocoding/geocoding.dart';

/// Call this once on app start (e.g. in CustomerShell) to request location
/// permission and update the preferences provider with real GPS coords.
/// Always marks locationReady = true when done, whether or not GPS succeeded.
Future<void> initLocationService(WidgetRef ref, BuildContext context) async {
  final notifier = ref.read(preferencesProvider.notifier);
  final themeNotifier = ref.read(themeProvider.notifier);
  final dio = ref.read(dioProvider);

  try {
    // Check if location services are enabled on the device
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      debugPrint('[LocationService] Location services disabled. Using stored/default coords.');
      notifier.markLocationReady();
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint('[LocationService] Permission denied. Using stored/default coords.');
        notifier.markLocationReady();
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint('[LocationService] Permission permanently denied.');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Location permission denied. Enable it in Settings for nearby store recommendations.',
            ),
            duration: Duration(seconds: 4),
          ),
        );
      }
      notifier.markLocationReady();
      return;
    }

    // Permission granted — get the current position with fallback
    Position? position;
    try {
      position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 4),
        ),
      );
    } catch (e) {
      debugPrint('[LocationService] getCurrentPosition failed: $e. Trying last known position.');
      try {
        position = await Geolocator.getLastKnownPosition();
      } catch (lastKnownErr) {
        debugPrint('[LocationService] getLastKnownPosition failed: $lastKnownErr');
      }
    }

    double resolvedLat = position?.latitude ?? 12.3237008;
    double resolvedLng = position?.longitude ?? 76.6022778;

    // Detect default Apple/SF Simulator coordinates or Android Googleplex Simulator coordinates and override to Mysuru center
    final isAppleSim = (resolvedLat - 37.7858).abs() < 0.05 && (resolvedLng - -122.4064).abs() < 0.05;
    final isAndroidSim = (resolvedLat - 37.422).abs() < 0.05 && (resolvedLng - -122.084).abs() < 0.05;
    if (isAppleSim || isAndroidSim) {
      resolvedLat = 12.3237008;
      resolvedLng = 76.6022778;
      debugPrint('[LocationService] 📱 Simulator coordinates detected ($resolvedLat, $resolvedLng). Overriding to Mysuru.');
    }

    // Resolve full address (area, city, pincode) using reverse geocoding
    String? fullAddress;
    try {
      final placemarks = await placemarkFromCoordinates(resolvedLat, resolvedLng);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        final area = place.subLocality ?? '';
        final city = place.locality ?? place.subAdministrativeArea ?? '';
        final pincode = place.postalCode ?? '';

        final parts = <String>[];
        if (area.isNotEmpty) parts.add(area);
        if (city.isNotEmpty) parts.add(city);

        String full = parts.join(', ');
        if (pincode.isNotEmpty) {
          full += ' - $pincode';
        }
        if (full.isNotEmpty) {
          fullAddress = full;
        }
      }
    } catch (geocodingErr) {
      debugPrint('[LocationService] Geocoding error: $geocodingErr');
    }

    // updateLocation also sets locationReady = true
    await notifier.updateLocation(resolvedLat, resolvedLng, fullAddress: fullAddress);

    // Resolve city and its theme config from backend
    await resolveCityTheme(notifier, themeNotifier, dio, resolvedLat, resolvedLng);

    debugPrint(
        '[LocationService] ✅ Resolved GPS: $resolvedLat, $resolvedLng (Real: ${position?.latitude}, ${position?.longitude})');
  } catch (e) {
    debugPrint('[LocationService] ⚠️ Error: $e — using stored/default coords.');
    // Mark ready so the screen doesn't hang waiting for GPS that failed
    notifier.markLocationReady();
  }
}

/// Resolves the city and its theme config from the backend based on latitude/longitude
Future<void> resolveCityTheme(dynamic notifier, dynamic themeNotifier, dynamic dio, double lat, double lng) async {
  try {
    final response = await dio.get('/locations/resolve?lat=$lat&lng=$lng');
    if (response.data['success'] == true && response.data['data'] != null) {
      final data = response.data['data'];
      final isWithinRadius = data['isWithinRadius'] == true;
      final themeConfig = data['themeConfig'];
      final city = data['city']?.toString();
      
      if (isWithinRadius && themeConfig != null && themeConfig.isNotEmpty) {
        final cityTheme = CityTheme.fromJson(Map<String, dynamic>.from(themeConfig));
        await notifier.updateCityTheme(cityTheme, cityName: city);
        themeNotifier.setTheme(AppThemeType.regional);
        debugPrint('[LocationService] Resolved city: $city with custom theme ${cityTheme.themeName}');
      } else {
        await notifier.updateCityTheme(null, cityName: city);
        themeNotifier.setTheme(AppThemeType.oceanBlue);
        debugPrint('[LocationService] Resolved city: $city (outside radius or no custom theme)');
      }
    }
  } catch (apiErr) {
    debugPrint('[LocationService] Error resolving city theme from backend: $apiErr');
  }
}
