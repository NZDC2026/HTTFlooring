import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/services/visit_backend.dart';
import 'package:htt_flooring_app/services/warehouse_return_backend.dart';

void main() {
  test('photo scan wait, ambiguous acknowledgement, stable replay and identity isolation', () async {
    final directory = await Directory.systemTemp.createTemp('return-test');
    addTearDown(() => directory.delete(recursive: true));
    final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    addTearDown(() => server.close(force: true));
    var uploads = 0, submissions = 0;
    final keys = <String?>[], bodies = <String>[];
    server.listen((r) async {
      final body = await r.fold(<int>[], (List<int> b, x) => b..addAll(x));
      expect(r.headers.value('x-company-id'), 'company');
      if (r.uri.path.endsWith('attachments')) {
        uploads++;
        r.response.statusCode = 202;
        r.response.write(
          jsonEncode({'id': 'photo-$uploads', 'state': 'PENDING'}),
        );
      } else {
        submissions++;
        keys.add(r.headers.value('idempotency-key'));
        bodies.add(utf8.decode(body));
        r.response.statusCode = submissions == 1
            ? 422
            : submissions == 2
            ? 503
            : 200;
        r.response.write(jsonEncode({'id': 'return-ack', 'status': 'PENDING'}));
      }
      await r.response.close();
    });
    WarehouseReturnBackend connect(
      String company,
      String actor, [
      String token = 'first',
    ]) => WarehouseReturnBackend(
      VisitBackend(
        Uri.parse('http://127.0.0.1:${server.port}'),
        token,
        companyId: company,
        actorId: actor,
      ),
      storageDirectoryPath: directory.path,
    );
    final backend = connect('company', 'actor');
    final item = {
      'stockMovementId': 'movement',
      'quantity': 1.5,
      'condition': 'damaged',
      'reason': 'Packaging damaged',
      'photos': [
        {
          'body': base64Encode([255, 216, 255, 1]),
        },
        {
          'body': base64Encode([255, 216, 255, 2]),
        },
      ],
    };
    await backend.stage(
      {'orderId': 'order', 'warehouseId': 'warehouse', 'version': 2},
      {'name': 'Synthetic handover'},
      [item],
    );
    expect(await connect('other-company', 'actor').pending(), isNull);
    expect(await connect('company', 'other-actor').pending(), isNull);
    await expectLater(backend.resume(), throwsA(isA<VisitApiException>()));
    expect((await backend.pending())?['submissionAttempted'], false);
    await expectLater(backend.resume(), throwsA(isA<VisitApiException>()));
    await expectLater(backend.discardSafely(), throwsA(isA<FormatException>()));
    final renewed = connect('company', 'actor', 'renewed');
    expect((await renewed.resume())?['id'], 'return-ack');
    expect(await renewed.pending(), isNull);
    expect(uploads, 2);
    expect(submissions, 3);
    expect(keys.toSet(), hasLength(1));
    expect(bodies.toSet(), hasLength(1));
    final sent = (jsonDecode(bodies.first)['items'] as List).single;
    expect(sent['quantity'], 1.5);
    expect(sent['condition'], 'damaged');
    expect(sent['reason'], 'Packaging damaged');
    expect(sent['photoFileIds'], ['photo-1', 'photo-2']);
  });
}
