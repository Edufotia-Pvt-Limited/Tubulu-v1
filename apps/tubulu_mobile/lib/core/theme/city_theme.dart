import 'package:flutter/material.dart';

class CityTheme {
  final String themeName;
  final Color primaryColor;
  final Color secondaryColor;
  final List<Color> gradientColors;
  final String? backgroundPatternUrl;
  final bool isDark;

  CityTheme({
    required this.themeName,
    required this.primaryColor,
    required this.secondaryColor,
    required this.gradientColors,
    this.backgroundPatternUrl,
    required this.isDark,
  });

  factory CityTheme.fromJson(Map<String, dynamic> json) {
    Color parseHex(String hex) {
      final hexClean = hex.replaceAll('#', '');
      if (hexClean.length == 6) {
        return Color(int.parse('FF$hexClean', radix: 16));
      } else if (hexClean.length == 8) {
        return Color(int.parse(hexClean, radix: 16));
      }
      return const Color(0xFF1565C0); // default fallback
    }

    final grads = (json['gradientColors'] as List?)
        ?.map((c) => parseHex(c.toString()))
        .toList() ?? [];

    return CityTheme(
      themeName: json['themeName'] ?? 'Default',
      primaryColor: parseHex(json['primaryColor'] ?? '#1565C0'),
      secondaryColor: parseHex(json['secondaryColor'] ?? '#64B5F6'),
      gradientColors: grads.isNotEmpty ? grads : [const Color(0xFF1565C0), const Color(0xFF64B5F6)],
      backgroundPatternUrl: json['backgroundPatternUrl'],
      isDark: json['isDark'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    String toHexStr(Color c) => '#${c.value.toRadixString(16).padLeft(8, '0').substring(2).toUpperCase()}';
    return {
      'themeName': themeName,
      'primaryColor': toHexStr(primaryColor),
      'secondaryColor': toHexStr(secondaryColor),
      'gradientColors': gradientColors.map((c) => toHexStr(c)).toList(),
      'backgroundPatternUrl': backgroundPatternUrl,
      'isDark': isDark,
    };
  }
}
