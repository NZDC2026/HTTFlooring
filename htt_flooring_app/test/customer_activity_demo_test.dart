import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/models/customer.dart';
import 'package:htt_flooring_app/models/sales_user.dart';
import 'package:htt_flooring_app/screens/sales/customers/customer_notes_screen.dart';
import 'package:htt_flooring_app/services/app_session.dart';
import 'package:htt_flooring_app/services/customer_note_service.dart';
import 'package:provider/provider.dart';

void main() {
  testWidgets('demo follow-up uses the editor without writing real records', (
    tester,
  ) async {
    final realService = CustomerNoteService();
    final session = AppSession();
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider.value(value: realService),
          ChangeNotifierProvider.value(value: session),
        ],
        child: const MaterialApp(
          home: CustomerNotesScreen(
            customer: Customer(
              id: 'other-customer',
              businessName: 'Test Flooring',
              type: 'Trade Customer',
              region: SalesRegion.sydney,
              address: '',
              abn: '',
              lastOrderDate: null,
              thisMonthOrders: 0,
              lastMonthOrders: 0,
              thisMonthOrderCount: 0,
              outstanding: 0,
              overdue: 0,
              oldestOverdueDays: 0,
              favourite: false,
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('Demo activities'));
    await tester.pumpAndSettle();
    final task = find.text('Deliver Heritage sample board');
    await tester.scrollUntilVisible(task, 200);
    await tester.ensureVisible(task);
    await tester.pumpAndSettle();
    await tester.tap(task);
    await tester.pumpAndSettle();
    expect(find.text('Follow-up Detail'), findsOneWidget);
    await tester.tap(find.byTooltip('Edit Follow-up'));
    await tester.pumpAndSettle();
    expect(find.text('Edit Follow-up'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    final comment = find.byType(EditableText);
    await tester.scrollUntilVisible(
      comment,
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.enterText(comment, 'Sample delivered.');
    await tester.pump();
    await tester.ensureVisible(find.text('Send Comment'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Send Comment'));
    await tester.pumpAndSettle();
    expect(find.text('Sample delivered.'), findsOneWidget);
    expect(realService.notes, isEmpty);
  });
}
