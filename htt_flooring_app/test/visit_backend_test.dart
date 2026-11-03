import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/services/visit_backend.dart';

void main() {
  test('replays ambiguous creation and resumes failed photo upload', () async {
    final directory = await Directory.systemTemp.createTemp('visit-test');
    addTearDown(() => directory.delete(recursive: true));
    final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    addTearDown(() => server.close(force: true));
    final createBodies = <String>[];
    final createKeys = <String?>[];
    final photoKeys = <String?>[];
    final photos = <List<int>>[];
    final versions = <String?>[];
    final authorization = <String?>[];
    server.listen((request) async {
      authorization.add(request.headers.value('authorization'));
      final bytes = await request.fold(
        <int>[],
        (all, chunk) => all..addAll(chunk),
      );
      final response = request.response;
      if (request.uri.path.endsWith('/collaboration')) {
        createBodies.add(utf8.decode(bytes));
        createKeys.add(request.headers.value('idempotency-key'));
        response.statusCode = createBodies.length == 1 ? 503 : 201;
        response.write('{"version":1}');
      } else {
        photos.add(bytes);
        photoKeys.add(request.headers.value('idempotency-key'));
        versions.add(request.headers.value('if-match'));
        response.statusCode = photos.length == 1 ? 503 : 202;
        response.write('{"state":"PENDING"}');
      }
      await response.close();
    });

    VisitBackend connect(String token) => VisitBackend(
      Uri.parse('http://127.0.0.1:${server.port}'),
      token,
      companyId: 'company',
      actorId: 'actor',
      storageDirectoryPath: directory.path,
    );
    const photo = [255, 216, 255, 1, 2, 3];
    final backend = connect('first');
    await backend.stage(
      {'id': 'branch', 'customerId': 'customer', 'name': 'Showroom'},
      {'latitude': -33.0, 'longitude': 151.0},
      photo,
    );
    await expectLater(
      backend.submitPending(),
      throwsA(isA<VisitApiException>()),
    );
    await expectLater(
      backend.submitPending(),
      throwsA(isA<VisitApiException>()),
    );

    final reconnected = connect('renewed');
    expect((await reconnected.pending())?['version'], 1);
    await reconnected.submitPending();

    expect(createBodies, hasLength(2));
    expect(createBodies.toSet(), hasLength(1));
    expect(createKeys.toSet(), hasLength(1));
    expect(photos, [photo, photo]);
    expect(photoKeys.toSet(), hasLength(1));
    expect(versions, ['"1"', '"1"']);
    expect(authorization.last, 'Bearer renewed');
    expect(await reconnected.pending(), isNull);
  });
}
