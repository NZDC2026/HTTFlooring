import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

/// Local request drafts. These records are never treated as office approvals.
class LocalSalesRequestStore {
  static String _key(String userId) => 'office-requests-$userId';
  static Future<List<Map<String, dynamic>>> read(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    try {
      return (jsonDecode(prefs.getString(_key(userId)) ?? '[]') as List)
          .map((r) => Map<String, dynamic>.from(r as Map))
          .toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> append(
    String userId,
    Map<String, dynamic> request,
  ) async {
    final rows = await read(userId);
    rows.insert(0, {
      ...request,
      'id': DateTime.now().microsecondsSinceEpoch.toString(),
      'createdAt': DateTime.now().toIso8601String(),
      'status': 'Waiting',
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key(userId), jsonEncode(rows));
  }
}
