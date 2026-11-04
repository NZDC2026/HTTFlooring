import 'package:flutter/material.dart';

({String label, Color color}) customerVisitAge(
  int? days, {
  required bool signedIn,
}) {
  const gray = Color(0xFF98A2B3);
  if (signedIn) {
    return (label: 'History unavailable', color: gray);
  }
  final label = switch (days) {
    null => 'No demo visit',
    0 => 'Today · Demo',
    1 => '1 day ago · Demo',
    _ => '$days days ago · Demo',
  };
  final color = switch (days) {
    null => gray,
    <= 7 => const Color(0xFF00C853),
    <= 30 => const Color(0xFFF0AB00),
    <= 60 => const Color(0xFFFF6900),
    _ => const Color(0xFFE60012),
  };
  return (label: label, color: color);
}

class VisitAge extends StatelessWidget {
  const VisitAge({super.key, required this.visit, required this.fontSize});

  final ({String label, Color color}) visit;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.circle, size: 9, color: visit.color),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            visit.label,
            textAlign: TextAlign.end,
            style: TextStyle(fontSize: fontSize, color: visit.color),
          ),
        ),
      ],
    );
  }
}
