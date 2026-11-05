import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/services/visit_backend.dart';

class FixtureTls extends HttpOverrides {
  FixtureTls(this.context, this.pem);
  final SecurityContext context;
  final String pem;

  @override
  HttpClient createHttpClient(SecurityContext? _) =>
      super.createHttpClient(context)
        ..badCertificateCallback = (certificate, host, port) =>
            host == 'localhost' && certificate.pem.trim() == pem.trim();
}

void main() {
  test('resumes a real visit and upload across a stable HTTPS origin', () async {
    final env = Platform.environment;
    final context = SecurityContext(withTrustedRoots: false)
      ..setTrustedCertificates(env['HTT_FIXTURE_CA']!);
    HttpOverrides.global = FixtureTls(context, File(env['HTT_FIXTURE_CA']!).readAsStringSync());
    addTearDown(() => HttpOverrides.global = null);
    final directory = await Directory.systemTemp.createTemp('htt-visit-parity-');
    addTearDown(() => directory.delete(recursive: true));
    VisitBackend connect() => VisitBackend(
          Uri.parse(env['HTT_FIXTURE_ORIGIN']!),
          env['HTT_FIXTURE_TOKEN']!,
          companyId: '00000000-0000-0000-0000-000000000001',
          actorId: '00000000-0000-0000-0000-000000000002',
          storageDirectoryPath: directory.path,
        );

    final backend = connect();
    await backend.stage(
      {'id': '00000000-0000-0000-0000-000000000012',
       'customerId': '00000000-0000-0000-0000-000000000011',
       'name': 'Synthetic Sydney'},
      {'latitude': -33.86, 'longitude': 151.21, 'accuracyMetres': 5.25,
       'capturedAt': DateTime.now().toUtc().toIso8601String()},
      [137, 80, 78, 71, 13, 10, 26, 10, 1, 2],
    );
    await expectLater(backend.submitPending(), throwsA(isA<VisitApiException>()));
    expect((await backend.pending())?['version'], isNull);
    await expectLater(connect().submitPending(), throwsA(isA<VisitApiException>()));
    expect((await connect().pending())?['version'], 1);
    await connect().submitPending();
    expect(await connect().pending(), isNull);
  });
}
