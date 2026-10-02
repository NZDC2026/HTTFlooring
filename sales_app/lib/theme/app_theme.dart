import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const green = Color(0xFF0E342B);
  static const darkGreen = Color(0xFF08271F);

  static const ivory = Color(0xFFF8F5EF);
  static const background = Color(0xFFF4F0E9);
  static const card = Color(0xFFFFFDF9);

  static const copper = Color(0xFFB96532);
  static const copperLight = Color(0xFFF8E5D6);

  static const success = Color(0xFF258453);
  static const successLight = Color(0xFFE2F2E7);

  static const warning = Color(0xFFD9892D);
  static const warningLight = Color(0xFFFFE9D3);

  static const danger = Color(0xFFD83B32);
  static const dangerLight = Color(0xFFFFE3DF);

  static const text = Color(0xFF17221F);
  static const muted = Color(0xFF777B78);
  static const border = Color(0xFFE3DED5);
}

ThemeData buildTheme() {
  final baseTheme = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.background,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.green,
      primary: AppColors.green,
      secondary: AppColors.copper,
    ),
  );

  final interFont = GoogleFonts.inter();

  return baseTheme.copyWith(
    textTheme: baseTheme.textTheme.apply(fontFamily: interFont.fontFamily),

    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.green,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.cormorantGaramond(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
    ),

    cardTheme: const CardThemeData(
      color: AppColors.card,
      elevation: 0,
      margin: EdgeInsets.zero,
    ),

    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: AppColors.card,
      indicatorColor: AppColors.copperLight,
    ),

    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.green, width: 1.5),
      ),
    ),
  );
}
