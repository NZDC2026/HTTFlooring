import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'htt_tokens.dart';

class AppColors {
  static const green = HttTokens.primary;
  static const darkGreen = HttTokens.primaryHover;

  static const ivory = HttTokens.background;
  static const background = HttTokens.background;
  static const card = HttTokens.surface;

  static const copper = HttTokens.success;
  static const copperLight = HttTokens.primarySoft;

  static const success = HttTokens.success;
  static const successLight = HttTokens.successSoft;

  static const warning = HttTokens.warning;
  static const warningLight = HttTokens.warningSoft;

  static const danger = HttTokens.danger;
  static const dangerLight = HttTokens.dangerSoft;

  static const text = HttTokens.text;
  static const muted = HttTokens.muted;
  static const border = HttTokens.border;
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
      backgroundColor: AppColors.card,
      foregroundColor: AppColors.green,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.inter(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: AppColors.text,
      ),
    ),

    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size(48, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(48, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    cardTheme: const CardThemeData(
      color: AppColors.card,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(HttTokens.radius)),
        side: BorderSide(color: AppColors.border),
      ),
    ),

    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: AppColors.card,
      indicatorColor: AppColors.copperLight,
    ),

    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.green, width: 1.5),
      ),
    ),
  );
}
