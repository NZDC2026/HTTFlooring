import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/services/visit_backend.dart';
import 'package:htt_flooring_app/services/warehouse_return_backend.dart';

void main() {
  final fixture = Platform.environment['HTT_RETURN_FIXTURE'];
  test(
    'warehouse return real Java API',
    () async {
      final f = jsonDecode(await File(fixture!).readAsString()) as JsonObject;
      final api = VisitBackend(
        Uri.parse(f['origin'] as String),
        f['token'] as String,
        companyId: f['companyId'] as String,
        actorId: f['actorId'] as String,
      );
      final backend = WarehouseReturnBackend(
        api,
        storageDirectoryPath: f['storage'] as String,
      );
      final phase = Platform.environment['HTT_RETURN_PHASE'];
      if (phase == 'prepare') {
        final warehouses = await api.request(
          'GET',
          '/warehouse/return-warehouses',
        );
        expect(
          (warehouses['items'] as List).any((x) => x['id'] == f['warehouseId']),
          true,
        );
        final orders = await api.request(
          'GET',
          '/warehouse/return-orders',
          query: {'warehouseId': f['warehouseId'] as String, 'pageSize': '100'},
        );
        expect(
          (orders['items'] as List).any((x) => x['id'] == f['orderId']),
          true,
        );
        final order = await api.request(
          'GET',
          '/warehouse/orders/${f['orderId']}/returnable',
        );
        final movement = (order['movements'] as List).first as JsonObject;
        await backend.stage(
          order,
          {
            'name': 'Synthetic customer',
            'mobile': '0400000000',
            'points': [
              [.1, .1],
              [.8, .7],
            ],
            'signedAt': '2026-11-11T01:00:00Z',
          },
          [
            {
              'stockMovementId': movement['stockMovementId'],
              'quantity': 1,
              'condition': 'damaged',
              'reason': 'Synthetic packaging damage',
              'photos': [
                {
                  'body': base64Encode([137, 80, 78, 71, 13, 10, 26, 10]),
                },
                {
                  'body': base64Encode([137, 80, 78, 71, 13, 10, 26, 10]),
                },
              ],
            },
          ],
        );
        await expectLater(
          backend.resume(),
          throwsA(
            isA<VisitApiException>().having(
              (e) => e.status,
              'scan pending',
              422,
            ),
          ),
        );
        expect(await backend.pending(), isNotNull);
      } else if (phase == 'finish') {
        final accepted = await backend.resume();
        expect(accepted?['status'], 'PENDING');
        expect(await backend.pending(), isNull);
        await File(f['resultFile'] as String)
            .writeAsString(jsonEncode(accepted));
      } else {
        final accepted = jsonDecode(
          await File(f['resultFile'] as String).readAsString(),
        ) as JsonObject;
        final result = await api.request(
          'GET',
          '/warehouse/return-requests/${accepted['id']}',
        );
        expect(result['status'], 'PROCESSED');
        final item = (result['lines'] as List).single;
        expect(item['condition'], 'damaged');
        expect(item['reason'], 'Synthetic packaging damage');
      }
    },
    skip: fixture == null
        ? 'Requires disposable synthetic Java API fixture'
        : false,
  );
}
