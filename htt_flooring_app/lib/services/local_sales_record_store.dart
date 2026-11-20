import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

/// Serializes local writes so separate forms cannot overwrite each other's records.
class LocalSalesRecordStore {
  static final Map<String, Future<void>> _writes = {};

  static Future<List<Map<String, dynamic>>> read(
    String key, {
    List<Map<String, dynamic>> initial = const [],
  }) async {
    final value = (await SharedPreferences.getInstance()).getString(key);
    if (value == null)
      return initial.map((r) => Map<String, dynamic>.from(r)).toList();
    try {
      return (jsonDecode(value) as List)
          .map((r) => Map<String, dynamic>.from(r as Map))
          .toList();
    } catch (_) {
      return initial.map((r) => Map<String, dynamic>.from(r)).toList();
    }
  }

  static Future<void> change(
    String key,
    void Function(List<Map<String, dynamic>>) update, {
    List<Map<String, dynamic>> initial = const [],
  }) {
    final previous = _writes[key] ?? Future<void>.value();
    final next = previous.then((_) async {
      final rows = await read(key, initial: initial);
      update(rows);
      final saved = await (await SharedPreferences.getInstance()).setString(
        key,
        jsonEncode(rows),
      );
      if (!saved) throw StateError('Could not save the local record.');
    });
    final queued = next.catchError((Object _) {});
    _writes[key] = queued;
    queued.then((_) {
      if (identical(_writes[key], queued)) _writes.remove(key);
    });
    return next;
  }

  static Future<void> upsert(
    String key,
    Map<String, dynamic> record, {
    List<Map<String, dynamic>> initial = const [],
  }) {
    if (record['id'] == null) throw ArgumentError('A record id is required.');
    return change(key, (rows) {
      final index = rows.indexWhere((r) => r['id'] == record['id']);
      if (index < 0) {
        rows.insert(0, Map<String, dynamic>.from(record));
      } else {
        rows[index] = {...rows[index], ...record};
      }
    }, initial: initial);
  }
}
