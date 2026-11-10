import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/widgets/app_shell.dart';

void main() {
  for (final width in [390.0, 1024.0]) {
    testWidgets('shell preserves destination callbacks at width $width', (
      tester,
    ) async {
      tester.view.physicalSize = Size(width, 900);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      var selected = 0;
      await tester.pumpWidget(
        MaterialApp(
          home: AppShell(
            currentIndex: 0,
            onDestinationSelected: (value) => selected = value,
            child: const Center(child: Text('Existing business content')),
          ),
        ),
      );
      expect(find.text('Existing business content'), findsOneWidget);
      expect(
        find.byType(width < 760 ? NavigationBar : NavigationRail),
        findsOneWidget,
      );
      await tester.tap(find.text('Inventory'));
      await tester.pumpAndSettle();
      expect(selected, 2);
      expect(tester.takeException(), isNull);
    });
  }
}
