import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';

import 'sales_detail_ui.dart';

Future<TimeOfDay?> pickSalesVisitTime({
  required BuildContext context,
  required DateTime date,
  required TimeOfDay initial,
  List<({DateTime start, DateTime end, String label})> booked = const [],
}) async {
  var hour = (initial.hour + 11) % 12,
      minute = (initial.minute / 5).floor().clamp(0, 11),
      period = initial.hour < 12 ? 0 : 1;
  final controllers = [
    FixedExtentScrollController(initialItem: hour),
    FixedExtentScrollController(initialItem: minute),
    FixedExtentScrollController(initialItem: period),
  ];
  TimeOfDay selected() =>
      TimeOfDay(hour: (hour + 1) % 12 + period * 12, minute: minute * 5);
  final today = DateUtils.isSameDay(date, DateTime.now());
  try {
    return await showDetailSheet<TimeOfDay>(
      context,
      (sheet) => StatefulBuilder(
        builder: (sheet, update) {
          final time = selected();
          final start = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
          final end = start.add(const Duration(minutes: 45));
          final conflicts = booked
              .where((b) => start.isBefore(b.end) && end.isAfter(b.start))
              .toList();
          final label =
              '${DateFormat('h:mm a').format(start)} – ${DateFormat('h:mm a').format(end)}';
          return Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text(
                    'Time',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(width: 7),
                  Expanded(
                    child: Text(
                      '${today ? 'Today ' : ''}${DateFormat('d MMM').format(date)} · visit ~45 min',
                      style: const TextStyle(fontSize: 11, color: detailMuted),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              SizedBox(
                height: 200,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xffedf3ef),
                        borderRadius: BorderRadius.circular(9),
                      ),
                    ),
                    Row(
                      children: [
                        for (var column = 0; column < 3; column++)
                          Expanded(
                            child: CupertinoPicker(
                              scrollController: controllers[column],
                              itemExtent: 40,
                              selectionOverlay: const SizedBox(),
                              onSelectedItemChanged: (value) => update(() {
                                if (column == 0) {
                                  hour = value;
                                } else if (column == 1) {
                                  minute = value;
                                } else {
                                  period = value;
                                }
                              }),
                              children: [
                                for (
                                  var index = 0;
                                  index < (column == 2 ? 2 : 12);
                                  index++
                                )
                                  Center(
                                    child: Text(
                                      column == 0
                                          ? '${index + 1}'
                                          : column == 1
                                          ? '${index * 5}'.padLeft(2, '0')
                                          : index == 0
                                          ? 'AM'
                                          : 'PM',
                                      style: TextStyle(
                                        fontFamily: 'HttReference',
                                        fontSize:
                                            (column == 0
                                                    ? hour
                                                    : column == 1
                                                    ? minute
                                                    : period) ==
                                                index
                                            ? 22
                                            : 19,
                                        fontWeight:
                                            (column == 0
                                                    ? hour
                                                    : column == 1
                                                    ? minute
                                                    : period) ==
                                                index
                                            ? FontWeight.w600
                                            : FontWeight.w400,
                                        color:
                                            (column == 0
                                                    ? hour
                                                    : column == 1
                                                    ? minute
                                                    : period) ==
                                                index
                                            ? const Color(0xff1d2924)
                                            : const Color(0xff8e9993),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(11),
                decoration: BoxDecoration(
                  color: conflicts.isEmpty
                      ? const Color(0xffe5f3eb)
                      : const Color(0xffffeded),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Text(
                  conflicts.isEmpty
                      ? '✓  $label is free'
                      : '$label overlaps ${conflicts.map((b) => b.label).join(', ')}',
                  style: TextStyle(
                    fontSize: 12,
                    color: conflicts.isEmpty ? detailGreen : Colors.red,
                  ),
                ),
              ),
              if (booked.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Wrap(
                    spacing: 7,
                    runSpacing: 5,
                    children: [
                      const Text(
                        'Booked',
                        style: TextStyle(fontSize: 10, color: detailMuted),
                      ),
                      for (final item in booked)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xffedf0f2),
                            borderRadius: BorderRadius.circular(5),
                          ),
                          child: Text(
                            '${DateFormat('h:mm a').format(item.start)} ${item.label}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: detailMuted,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              const Divider(color: detailLine),
              const SizedBox(height: 7),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Visit time',
                          style: TextStyle(fontSize: 10, color: detailMuted),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          DateFormat('h:mm a').format(start),
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    width: 120,
                    child: detailAction(
                      'Confirm',
                      'check',
                      () => Navigator.pop(sheet, time),
                      filled: true,
                    ),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  } finally {
    for (final controller in controllers) controller.dispose();
  }
}
