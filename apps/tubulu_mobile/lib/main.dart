import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/providers/preferences_provider.dart';

void main() => runApp(const ProviderScope(child: TubuluApp()));

class TubuluApp extends ConsumerWidget {
  const TubuluApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeType = ref.watch(themeProvider);
    final prefs = ref.watch(preferencesProvider);

    return MaterialApp.router(
      title: 'Tubulu',
      theme: AppTheme.getTheme(themeType, cityTheme: prefs.cityTheme),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
