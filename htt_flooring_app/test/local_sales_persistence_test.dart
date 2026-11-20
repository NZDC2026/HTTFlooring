import 'dart:typed_data';
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:htt_flooring_app/services/local_sales_record_store.dart';
import 'package:htt_flooring_app/services/local_sales_request_store.dart';
import 'package:htt_flooring_app/services/customer_note_service.dart';
import 'package:htt_flooring_app/services/app_session.dart';
import 'package:htt_flooring_app/models/customer_note.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() => SharedPreferences.setMockInitialValues({}));
  test('simultaneous requests and deliveries preserve every record without duplicate ids', () async {
    await Future.wait([
      for (var i = 0; i < 20; i++)
        LocalSalesRecordStore.upsert(
          'samples',
          {'id': 'sample-$i', 'done': false},
          initial: [
            {'id': 'historic', 'done': true},
          ],
        ),
    ]);
    final rows = await LocalSalesRecordStore.read('samples');
    expect(rows, hasLength(21));
    await Future.wait([
      for (var i = 0; i < 10; i++)
        LocalSalesRecordStore.upsert('samples', {
          'id': 'sample-$i',
          'done': true,
        }),
    ]);
    final updated = await LocalSalesRecordStore.read('samples');
    expect(updated, hasLength(21));
    expect(updated.where((r) => r['done'] == true), hasLength(11));
    await Future.wait([
      for (var i = 0; i < 15; i++)
        LocalSalesRequestStore.append('actor', {'kind': 'Quote', 'index': i}),
    ]);
    final requests = await LocalSalesRequestStore.read('actor');
    expect(requests, hasLength(15));
    expect(requests.map((r) => r['id']).toSet(), hasLength(15));
  });
  test(
    'a failed queued update does not prevent the next request being saved',
    () async {
      await expectLater(
        LocalSalesRecordStore.change(
          'queue',
          (_) => throw StateError('failure'),
        ),
        throwsStateError,
      );
      await LocalSalesRecordStore.upsert('queue', {
        'id': 'retry',
        'done': false,
      });
      expect((await LocalSalesRecordStore.read('queue')).single['id'], 'retry');
    },
  );
  test(
    'notes follow-ups attachments and completion survive a service restart',
    () async {
      final service = CustomerNoteService(persistenceKey: 'activities-test');
      await service.ready;
      await service.commit(() {
        service.addNote(
          customerId: 'abc',
          content: 'Meeting details',
          author: AppSession.jamesWilson,
          attachments: [
            ActivityAttachment(
              name: 'photo.jpg',
              bytes: Uint8List.fromList([1, 2, 3]),
              isPhoto: true,
            ),
          ],
        );
        service.addFollowUp(
          customerId: 'abc',
          content: 'Return call',
          actor: AppSession.jamesWilson,
          followUpDate: DateTime(2026, 12, 1, 9),
          followUpType: 'Payment Follow-up',
          assignees: [AppSession.jamesWilson, AppSession.liWei],
          priority: 'High',
          reminder: '30 min',
          reminderDate: DateTime(2026, 12, 1, 8, 30),
        );
      });
      final id = service.notes.last.id;
      service.setFollowUpStatus(
        id,
        FollowUpStatus.completed,
        actor: AppSession.jamesWilson,
        result: 'Paid',
      );
      await service.flush();
      service.dispose();
      final restored = CustomerNoteService(persistenceKey: 'activities-test');
      await restored.ready;
      expect(restored.notes, hasLength(2));
      expect(restored.notes.first.attachments.single.bytes, [1, 2, 3]);
      final task = restored.notes.last;
      expect(task.id, id);
      expect(task.isCompleted, isTrue);
      expect(task.assignees.map((p) => p.id), ['sales-001', 'warehouse-001']);
      expect(task.reminderDate, DateTime(2026, 12, 1, 8, 30));
      expect(task.events.last.message, 'Paid');
      restored.dispose();
    },
  );
  test('failed form mutations roll back and malformed records do not hide valid activities', () async {
    final service = CustomerNoteService(persistenceKey: 'rollback');
    await service.ready;
    await expectLater(
      service.commit(() {
        service.addNote(
          customerId: 'abc',
          content: 'not committed',
          author: AppSession.jamesWilson,
        );
        throw StateError('validation');
      }),
      throwsStateError,
    );
    expect(service.notes, isEmpty);
    await service.flush();
    service.addNote(
      customerId: 'abc',
      content: 'valid',
      author: AppSession.jamesWilson,
    );
    await service.flush();
    service.dispose();
    final prefs = await SharedPreferences.getInstance();
    final rows = jsonDecode(prefs.getString('rollback')!) as List;
    rows.insert(0, {'bad': 'data'});
    await prefs.setString('rollback', jsonEncode(rows));
    final restored = CustomerNoteService(persistenceKey: 'rollback');
    await restored.ready;
    expect(restored.notes.single.content, 'valid');
    restored.dispose();
  });
}
