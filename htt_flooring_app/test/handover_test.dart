import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:htt_flooring_app/models/handover_proof.dart';
import 'package:htt_flooring_app/models/warehouse_order.dart';
import 'package:htt_flooring_app/models/customer_return_item.dart';
import 'package:htt_flooring_app/services/warehouse_order_service.dart';
import 'package:htt_flooring_app/services/customer_return_service.dart';
import 'package:htt_flooring_app/widgets/handover_fields.dart';

HandoverProof proof({String name = ' Alice ', String mobile = ''}) =>
    HandoverProof(
      name: name,
      mobile: mobile,
      points: [
        [0.1, 0.2],
        [0.4, 0.5],
      ],
    );
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() => SharedPreferences.setMockInitialValues({}));
  test('rejects blank name, blank ink and stationary taps', () {
    expect(() => proof(name: '  '), throwsArgumentError);
    expect(() => HandoverProof(name: 'Alice', points: []), throwsArgumentError);
    expect(
      () => HandoverProof(
        name: 'Alice',
        points: [
          [0.2, 0.2],
          [0.2, 0.2],
        ],
      ),
      throwsArgumentError,
    );
    expect(proof().mobile, isEmpty);
  });
  for (final type in WarehouseFulfilmentType.values) {
    test(
      '$type confirmation and completion survive reload with photos',
      () async {
        final service = WarehouseOrderService();
        await service.load();
        expect(
          await service.confirmPickupOrTransport('wo-100001', proof()),
          isFalse,
        );
        service.setFulfilmentType('wo-100004', type);
        expect(
          await service.confirmPickupOrTransport(
            'wo-100004',
            proof(mobile: '+64 21 123'),
          ),
          isTrue,
        );
        final restored = WarehouseOrderService();
        await restored.load();
        final order = restored.findOrder('wo-100004')!;
        expect(order.fulfilmentType, type);
        expect(order.handoverProof!.name, 'Alice');
        expect(order.handoverProof!.mobile, '+64 21 123');
        expect(order.handoverProof!.points, proof().points);
        expect(order.items.first.preparationPhotos.length, 2);
        expect(await restored.markCompleted(order.id), isFalse);
        restored.addDispatchPhoto(order.id, 'photo1');
        restored.addDispatchPhoto(order.id, 'photo2');
        expect(
          await restored.markCompleted(order.id, notes: 'checked'),
          isTrue,
        );
        final completed = WarehouseOrderService();
        await completed.load();
        expect(
          completed.findOrder(order.id)!.status,
          WarehouseOrderStatus.completed,
        );
        expect(completed.findOrder(order.id)!.dispatchPhotos, [
          'photo1',
          'photo2',
        ]);
        expect(completed.findOrder(order.id)!.dispatchNotes, 'checked');
      },
    );
  }
  test(
    'return persists proof, item details and photos; still validates photos',
    () async {
      final service = CustomerReturnService.instance;
      await service.load();
      CustomerReturnItem item(List<String> photos) => CustomerReturnItem(
        productId: 'oak',
        productName: 'Oak',
        sku: 'OAK',
        quantity: 2,
        reason: 'Damaged',
        condition: ReturnItemCondition.damaged,
        photoPaths: photos,
      );
      await expectLater(
        service.submit(
          customerId: 'abc',
          customerName: 'ABC',
          items: [item([])],
          handoverProof: proof(),
        ),
        throwsArgumentError,
      );
      final result = await service.submit(
        customerId: 'abc',
        customerName: 'ABC',
        items: [
          item(['a', 'b']),
        ],
        handoverProof: proof(),
      );
      await service.load();
      final saved = service.returns.firstWhere((v) => v.id == result.id);
      expect(saved.handoverProof!.name, 'Alice');
      expect(saved.handoverProof!.signedAt, result.handoverProof!.signedAt);
      expect(saved.items.single.photoPaths, ['a', 'b']);
      expect(saved.items.single.reason, 'Damaged');
      expect(saved.statusLabel, 'Pending');
    },
  );
  testWidgets(
    'requires name and ink, supports drawing, clearing and re-signing',
    (tester) async {
      final key = GlobalKey<HandoverFieldsState>();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: HandoverFields(
              key: key,
              nameLabel: 'Collector Name',
              signatureLabel: 'Collector Signature',
            ),
          ),
        ),
      );
      expect(key.currentState!.validateAndRead(), isNull);
      await tester.pump();
      await tester.enterText(find.byType(TextFormField).first, 'Alice');
      final pad = find.byKey(const ValueKey('handover-signature-pad'));
      final start = tester.getCenter(pad);
      await tester.dragFrom(start, const Offset(80, 20));
      expect(key.currentState!.validateAndRead(), isNotNull);
      await tester.tap(find.text('Clear / Re-sign'));
      await tester.pump();
      expect(key.currentState!.validateAndRead(), isNull);
      await tester.dragFrom(start, const Offset(40, -20));
      expect(key.currentState!.validateAndRead()!.mobile, isEmpty);
    },
  );
}
