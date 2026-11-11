import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:htt_flooring_app/services/app_session.dart';
import 'package:htt_flooring_app/screens/warehouse/returns/customer_returns_screen.dart';
void main() {
  testWidgets('disconnected return workspace shows read-only sample and no legacy records', (tester) async {
    final session = AppSession();
    await tester.pumpWidget(ChangeNotifierProvider.value(value: session, child: const MaterialApp(home: CustomerReturnsScreen())));
    await tester.pumpAndSettle();
    expect(find.text('Upload evidence and submit'), findsNothing);
    expect(find.textContaining('Local legacy records are not uploaded'), findsOneWidget);
    await tester.tap(find.text('Sample')); await tester.pumpAndSettle();
    expect(find.text('Sample return · read-only'), findsOneWidget);
    expect(find.textContaining('No request, stock movement or notification is created'), findsOneWidget);
    await tester.tap(find.text('Close')); await tester.pumpAndSettle();
    session.signOut(); await tester.pumpAndSettle();
    expect(find.text('Upload evidence and submit'), findsNothing);
  });
}
