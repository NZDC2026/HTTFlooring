import 'package:uuid/uuid.dart';

import 'local_sales_record_store.dart';

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
    await LocalSalesRecordStore.change(_key(userId), (rows) {
      rows.insert(0, {
        ...request,
        'id': const Uuid().v4(),
        'createdAt': DateTime.now().toIso8601String(),
        'status': 'Waiting',
      });
    });
  }
}
