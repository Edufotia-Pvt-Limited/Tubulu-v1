import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'city_theme.dart';

enum AppThemeType {
  lavenderPurple,
  forestGreen,
  oceanBlue,
  sleekDark,
  regional,
}

class AppTheme {
  static bool isTestMode = false;

  // Primary gradient helpers
  static const primaryColor = Color(0xFF7D50F0); 
  static const accentGreen = Color(0xFF57CA8C);
  static const ultraBlack = Color(0xFF040303);

  static const primaryGradient = LinearGradient(
    colors: [primaryColor, Color(0xFF9C74FF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const secondaryGradient = LinearGradient(
    colors: [accentGreen, Color(0xFF81DFAC)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static LinearGradient primaryGradientForType(AppThemeType type, {CityTheme? cityTheme, bool isMysore = false, bool isNagpur = false}) {
    if (cityTheme != null && type == AppThemeType.regional) {
      return LinearGradient(
        colors: cityTheme.gradientColors,
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (isNagpur) {
      return const LinearGradient(
        colors: [Color(0xFFFFA800), Color(0xFFE15B4D)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (type == AppThemeType.regional || isMysore) {
      return const LinearGradient(
        colors: [Color(0xFF1565C0), Color(0xFFD4AF37)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    switch (type) {
      case AppThemeType.lavenderPurple:
        return const LinearGradient(colors: [Color(0xFF7D50F0), Color(0xFF9C74FF)]);
      case AppThemeType.forestGreen:
        return const LinearGradient(colors: [Color(0xFF2E7D32), Color(0xFF81C784)]);
      case AppThemeType.oceanBlue:
        return const LinearGradient(colors: [Color(0xFF1565C0), Color(0xFF64B5F6)]);
      case AppThemeType.sleekDark:
        return const LinearGradient(colors: [Color(0xFF104A69), Color(0xFF1C6385)]);
      case AppThemeType.regional:
        return const LinearGradient(colors: [Color(0xFF1565C0), Color(0xFFD4AF37)]);
    }
  }

  static ThemeData getTheme(AppThemeType type, {CityTheme? cityTheme}) {
    if (cityTheme != null && type == AppThemeType.regional) {
      return _buildTheme(
        primary: cityTheme.primaryColor,
        secondary: cityTheme.secondaryColor,
        background: const Color(0xFFF5F5F5),
        surface: Colors.white,
        isDark: cityTheme.isDark,
      );
    }
    switch (type) {
      case AppThemeType.lavenderPurple:
        return _buildTheme(
          primary: const Color(0xFF7D50F0),
          secondary: const Color(0xFF57CA8C),
          background: const Color(0xFFFAFAFA),
          surface: Colors.white,
          isDark: false,
        );
      case AppThemeType.forestGreen:
        return _buildTheme(
          primary: const Color(0xFF2E7D32),
          secondary: const Color(0xFF4CAF50),
          background: const Color(0xFFF5F5F5),
          surface: Colors.white,
          isDark: false,
        );
      case AppThemeType.oceanBlue:
        return _buildTheme(
          primary: const Color(0xFF1565C0),
          secondary: const Color(0xFF03A9F4),
          background: const Color(0xFFF5F5F5),
          surface: Colors.white,
          isDark: false,
        );
      case AppThemeType.sleekDark:
        return _buildTheme(
          primary: const Color(0xFFA594F9),
          secondary: const Color(0xFF03DAC6),
          background: const Color(0xFF1B1A18),
          surface: const Color(0xFF2A2826),
          isDark: true,
        );
      case AppThemeType.regional:
        return _buildTheme(
          primary: const Color(0xFF1565C0),
          secondary: const Color(0xFFD4AF37),
          background: const Color(0xFFF5F5F5),
          surface: Colors.white,
          isDark: false,
        );
    }
  }

  static ThemeData _buildTheme({
    required Color primary,
    required Color secondary,
    required Color background,
    required Color surface,
    required bool isDark,
  }) {
    final textColor = isDark ? Colors.white : const Color(0xFF040303);
    final secondaryTextColor = isDark ? Colors.grey[400]! : const Color(0xFF555555);

    final baseTextTheme = TextTheme(
      bodyLarge: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 16),
      bodyMedium: TextStyle(color: secondaryTextColor, fontWeight: FontWeight.w500, fontSize: 14),
      titleLarge: TextStyle(color: textColor, fontWeight: FontWeight.w800, fontSize: 22, letterSpacing: -0.2),
      titleMedium: TextStyle(color: textColor, fontWeight: FontWeight.w700, fontSize: 18),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: isDark ? Brightness.dark : Brightness.light,
      fontFamily: isTestMode ? null : GoogleFonts.publicSans().fontFamily,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: secondary,
        surface: surface,
        brightness: isDark ? Brightness.dark : Brightness.light,
      ),
      textTheme: isTestMode ? baseTextTheme : GoogleFonts.publicSansTextTheme(baseTextTheme),
      scaffoldBackgroundColor: background,
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        foregroundColor: textColor,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: isTestMode
            ? TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: textColor,
                letterSpacing: 0.2,
              )
            : GoogleFonts.publicSans(
                textStyle: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: textColor,
                  letterSpacing: 0.2,
                ),
              ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: isDark ? Colors.black : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        ),
      ),
      textSelectionTheme: TextSelectionThemeData(
        cursorColor: primary,
        selectionColor: primary.withOpacity(0.3),
        selectionHandleColor: primary,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: isDark ? const Color(0xFFA594F9) : primary,
        unselectedItemColor: isDark ? Colors.white54 : Colors.grey,
        selectedIconTheme: IconThemeData(color: isDark ? const Color(0xFFA594F9) : primary, size: 24),
        unselectedIconTheme: IconThemeData(color: isDark ? Colors.white38 : Colors.grey[600], size: 24),
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 12),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }
}

class MysorePalacePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = LinearGradient(
        colors: [
          const Color(0xFFD4AF37).withOpacity(0.08), // Mysore Gold
          const Color(0xFFC8102E).withOpacity(0.03), // Palace Crimson
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..style = PaintingStyle.fill;

    // Draw Mysore Palace domes and pillars silhouette
    final path = Path();
    final w = size.width;
    final h = size.height;

    // Base line
    path.moveTo(0, h);
    path.lineTo(0, h * 0.85);

    // Left dome
    path.quadraticBezierTo(w * 0.1, h * 0.82, w * 0.15, h * 0.85);
    path.lineTo(w * 0.15, h * 0.78);
    // Small dome top
    path.cubicTo(w * 0.13, h * 0.74, w * 0.17, h * 0.74, w * 0.15, h * 0.78);
    path.lineTo(w * 0.20, h * 0.85);

    // Main Arch
    path.lineTo(w * 0.35, h * 0.85);
    path.quadraticBezierTo(w * 0.5, h * 0.65, w * 0.65, h * 0.85);

    // Right dome
    path.lineTo(w * 0.80, h * 0.85);
    path.lineTo(w * 0.85, h * 0.78);
    path.cubicTo(w * 0.83, h * 0.74, w * 0.87, h * 0.74, w * 0.85, h * 0.78);
    path.lineTo(w * 0.85, h * 0.85);

    // Right base line
    path.lineTo(w, h * 0.85);
    path.lineTo(w, h);
    path.close();

    canvas.drawPath(path, paint);

    // Draw Chamundi Hill in background
    final hillPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          const Color(0xFF1565C0).withOpacity(0.04), // Blue
          const Color(0xFF7D50F0).withOpacity(0.02),
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..style = PaintingStyle.fill;

    final hillPath = Path();
    hillPath.moveTo(0, h);
    hillPath.quadraticBezierTo(w * 0.4, h * 0.88, w * 0.5, h * 0.89);
    // Nandi/Temple structure on hill peak
    hillPath.lineTo(w * 0.51, h * 0.87);
    hillPath.lineTo(w * 0.52, h * 0.89);
    hillPath.quadraticBezierTo(w * 0.7, h * 0.90, w, h * 0.92);
    hillPath.lineTo(w, h);
    hillPath.close();

    canvas.drawPath(hillPath, hillPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
