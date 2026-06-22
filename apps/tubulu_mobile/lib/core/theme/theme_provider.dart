import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app_theme.dart';

import 'package:shared_preferences/shared_preferences.dart';

class ThemeNotifier extends StateNotifier<AppThemeType> {
  ThemeNotifier() : super(AppThemeType.regional) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final savedThemeStr = prefs.getString('pref_app_theme');
    if (savedThemeStr != null) {
      state = AppThemeType.values.firstWhere(
        (e) => e.name == savedThemeStr,
        orElse: () => AppThemeType.regional,
      );
    } else {
      state = AppThemeType.regional;
    }
  }

  Future<void> setTheme(AppThemeType type) async {
    state = type;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('pref_app_theme', type.name);
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, AppThemeType>((ref) {
  return ThemeNotifier();
});
