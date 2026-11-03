@TestOn('browser')
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/services/visit_platform/storage_web.dart';
import 'package:uuid/uuid.dart';

void main() {
  test(
    'pending visit survives reopening storage and serializes writes',
    () async {
      final scope = const Uuid().v4();
      final first = VisitStorage(scope, null);
      final reopened = VisitStorage(scope, null);
      addTearDown(reopened.delete);
      var staged = 0;
      Future<void> stage(VisitStorage storage) => storage.exclusive(() async {
        if (await storage.read() != null) return;
        await storage.write('{"id":"visit","photo":"original-photo"}');
        staged++;
      });

      await Future.wait([stage(first), stage(reopened)]);
      expect(staged, 1);
      expect(await reopened.read(), '{"id":"visit","photo":"original-photo"}');

      await reopened.delete();
      expect(await first.read(), isNull);
    },
  );
}
