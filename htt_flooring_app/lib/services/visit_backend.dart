import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';

import 'visit_platform/storage_native.dart'
    if (dart.library.js_interop) 'visit_platform/storage_web.dart';

typedef JsonObject = Map<String, dynamic>;

class VisitBackend {
  VisitBackend(
    this.origin,
    this.token, {
    this.companyId,
    this.actorId,
    this.storageDirectoryPath,
  });

  final Uri origin;
  final String token;
  final String? companyId;
  final String? actorId;
  final String? storageDirectoryPath;

  VisitBackend forCompany(JsonObject company) => VisitBackend(
    origin,
    token,
    companyId: company['companyId'] as String,
    actorId: company['actorId'] as String,
    storageDirectoryPath: storageDirectoryPath,
  );

  Future<JsonObject> request(
    String method,
    String path, {
    Map<String, String>? query,
    List<int>? body,
    String? contentType,
    String? key,
    int? version,
  }) async {
    final client = http.Client();
    try {
      final request = http.Request(
        method,
        origin.replace(path: '/api/v1$path', queryParameters: query),
      )..followRedirects = false;
      request.headers.addAll({
        'Authorization': 'Bearer $token',
        'X-Company-Id': ?companyId,
        'Idempotency-Key': ?key,
        if (version != null) 'If-Match': '"$version"',
        if (body != null) 'Content-Type': contentType ?? 'application/json',
      });
      if (body != null) request.bodyBytes = Uint8List.fromList(body);
      final response = await client
          .send(request)
          .then(http.Response.fromStream)
          .timeout(const Duration(seconds: 45));
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw VisitApiException(path, response.statusCode);
      }
      return jsonDecode(utf8.decode(response.bodyBytes)) as JsonObject;
    } finally {
      client.close();
    }
  }

  late final _storage = VisitStorage(
    base64Url.encode(utf8.encode('${origin.origin}|$companyId|$actorId')),
    storageDirectoryPath,
  );

  Future<JsonObject?> pending() async {
    final value = await _storage.read();
    return value == null ? null : jsonDecode(value) as JsonObject;
  }

  Future<void> _save(JsonObject pending) => _storage.write(jsonEncode(pending));

  Future<void> stage(JsonObject branch, JsonObject position, List<int> photo) =>
      _storage.exclusive(() async {
        if (await pending() != null) {
          throw const FormatException(
            'Finish the pending visit before starting another.',
          );
        }
        final jpeg =
            photo.length >= 3 &&
            photo[0] == 255 &&
            photo[1] == 216 &&
            photo[2] == 255;
        final png =
            photo.length >= 8 &&
            const [
              137,
              80,
              78,
              71,
              13,
              10,
              26,
              10,
            ].asMap().entries.every((byte) => photo[byte.key] == byte.value);
        if ((!jpeg && !png) || photo.length > 10 * 1024 * 1024) {
          throw const FormatException('Take a JPEG or PNG photo under 10 MiB.');
        }
        await _save({
          'create': {
            'id': const Uuid().v4(),
            'kind': 'VISIT',
            'customerId': branch['customerId'],
            'branchId': branch['id'],
            'data': {'checkIn': position},
          },
          'name': branch['name'],
          'extension': jpeg ? 'jpg' : 'png',
          'photo': base64Encode(photo),
        });
      });

  Future<void> submitPending() => _storage.exclusive(() async {
    final draft = await pending();
    if (draft == null) return;
    final create = draft['create'] as JsonObject;
    final id = create['id'] as String;
    var version = draft['version'] as int?;
    if (version == null) {
      final visit = await request(
        'POST',
        '/crm/collaboration',
        body: utf8.encode(jsonEncode(create)),
        key: 'visit-$id',
      );
      version = visit['version'] as int;
      draft['version'] = version;
      await _save(draft);
    }
    final extension = draft['extension'] as String;
    await request(
      'POST',
      '/documents/$id/attachments',
      query: {'fileName': 'visit-$id.$extension'},
      body: base64Decode(draft['photo'] as String),
      contentType: extension == 'jpg' ? 'image/jpeg' : 'image/png',
      key: 'visit-photo-$id',
      version: version,
    );
    await _storage.delete();
  });
}

class VisitApiException implements Exception {
  const VisitApiException(this.path, this.status);
  final String path;
  final int status;

  @override
  String toString() => switch (status) {
    401 => 'Access token expired or invalid. Reconnect with a valid token.',
    403 => 'Your account lacks permission for this visit operation.',
    _ => 'Server returned HTTP $status for $path.',
  };
}

String visitAddress(JsonObject branch) => [
  for (final field in [
    'addressLine1',
    'suburb',
    'state',
    'postcode',
    'country',
  ])
    if (branch[field] case final String value when value.isNotEmpty) value,
].join(', ');
