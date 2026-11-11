import 'dart:convert';

import 'package:uuid/uuid.dart';

import 'visit_backend.dart';
import 'visit_platform/storage_native.dart'
    if (dart.library.js_interop) 'visit_platform/storage_web.dart';

/// Durable drafts contain no credentials and are isolated by origin/company/actor.
class WarehouseReturnBackend {
  WarehouseReturnBackend(this.api, {String? storageDirectoryPath})
    : storage = VisitStorage(
        base64Url.encode(
          utf8.encode(
            'warehouse-returns|${api.origin.origin}|${api.companyId}|${api.actorId}',
          ),
        ),
        storageDirectoryPath,
      ) {
    if (api.companyId == null || api.actorId == null) {
      throw const FormatException('Select a verified company before returns.');
    }
  }
  final VisitBackend api;
  final VisitStorage storage;
  static final Map<String, Future<void>> _queues = {};
  Future<void> _exclusive(Future<void> Function() action) async {
    final scope = storage.scope;
    final prior = _queues[scope] ?? Future<void>.value();
    final next = prior.then((_) => storage.exclusive(action));
    final barrier = next.catchError((Object _) {});
    _queues[scope] = barrier;
    try {
      await next;
    } finally {
      if (identical(_queues[scope], barrier)) _queues.remove(scope);
    }
  }

  Future<void> discardSafely() => _exclusive(() async {
    final draft = await pending();
    if (draft == null) return;
    if (draft['submissionAttempted'] == true) {
      throw const FormatException(
        'The submission result is uncertain. Retry it before discarding.',
      );
    }
    await storage.delete();
  });
  Future<JsonObject?> pending() async {
    final raw = await storage.read();
    return raw == null ? null : jsonDecode(raw) as JsonObject;
  }

  Future<void> _save(JsonObject draft) => storage.write(jsonEncode(draft));
  Future<void> stage(
    JsonObject order,
    JsonObject proof,
    List<JsonObject> items,
  ) => _exclusive(() async {
    if (await pending() != null) {
      throw const FormatException('Resume the pending return first.');
    }
    if (items.isEmpty || items.length > 50) {
      throw const FormatException('Select 1–50 dispatched items.');
    }
    for (final item in items) {
      final photos = item['photos'] as List;
      if (photos.length < 2 ||
          photos.length > 10 ||
          (item['quantity'] as num) <= 0 ||
          (item['reason'] as String).trim().length < 3) {
        throw const FormatException(
          'Each item needs a quantity, reason and 2–10 photos.',
        );
      }
      for (final raw in photos) {
        final bytes = base64Decode((raw as JsonObject)['body'] as String);
        final png =
            bytes.length >= 8 &&
            const [
              137,
              80,
              78,
              71,
              13,
              10,
              26,
              10,
            ].asMap().entries.every((e) => bytes[e.key] == e.value);
        final jpeg =
            bytes.length >= 3 &&
            bytes[0] == 255 &&
            bytes[1] == 216 &&
            bytes[2] == 255;
        if ((!png && !jpeg) || bytes.length > 10 * 1024 * 1024) {
          throw const FormatException('Use JPEG or PNG photos under 10 MiB.');
        }
        raw['type'] = png ? 'image/png' : 'image/jpeg';
      }
    }
    await _save({
      'key': const Uuid().v4(),
      'order': order,
      'proof': proof,
      'items': items,
    });
  });
  Future<JsonObject?> resume() async {
    JsonObject? acknowledged;
    await _exclusive(() async {
      final draft = await pending();
      if (draft == null) return;
      final order = draft['order'] as JsonObject;
      final key = draft['key'] as String;
      final items = (draft['items'] as List).cast<JsonObject>();
      for (var i = 0; i < items.length; i++) {
        final photos = (items[i]['photos'] as List).cast<JsonObject>();
        for (var j = 0; j < photos.length; j++) {
          final photo = photos[j];
          if (photo['fileId'] != null) continue;
          final type = photo['type'] as String;
          final uploaded = await api.request(
            'POST',
            '/documents/${order['orderId']}/attachments',
            query: {
              'fileName':
                  'return-$key-$i-$j.${type == 'image/png' ? 'png' : 'jpg'}',
            },
            body: base64Decode(photo['body'] as String),
            contentType: type,
            version: order['version'] as int,
            key: 'return-photo-$key-$i-$j',
          );
          photo['fileId'] = uploaded['id'];
          await _save(draft);
        }
      }
      final input = {
        'orderId': order['orderId'],
        'warehouseId': order['warehouseId'],
        'reason': 'Customer return with signed item evidence',
        'handoverProof': draft['proof'],
        'items': items
            .map(
              (item) => {
                'stockMovementId': item['stockMovementId'],
                'invoiceLineId': item['invoiceLineId'],
                'quantity': item['quantity'],
                'condition': item['condition'],
                'reason': item['reason'],
                'photoFileIds': (item['photos'] as List)
                    .map((p) => p['fileId'])
                    .toList(),
              },
            )
            .toList(),
      };
      // A scan-pending response or ambiguous network outcome retains the same draft/key.
      draft['submissionAttempted'] = true;
      await _save(draft);
      try {
        acknowledged = await api.request(
          'POST',
          '/warehouse/return-requests',
          body: utf8.encode(jsonEncode(input)),
          key: 'return-submit-$key',
        );
      } on VisitApiException catch (error) {
        if ([400, 401, 403, 404, 409, 422].contains(error.status)) {
          draft['submissionAttempted'] = false;
          await _save(draft);
        }
        rethrow;
      }
      if (acknowledged?['status'] != 'PENDING') {
        throw const FormatException(
          'The server has not acknowledged this return.',
        );
      }
      await storage.delete();
    });
    return acknowledged;
  }
}
