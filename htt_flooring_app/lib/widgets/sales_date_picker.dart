import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'sales_detail_ui.dart';

Future<DateTime?> pickSalesDate({
  required BuildContext context,
  required DateTime initialDate,
  required DateTime firstDate,
  required DateTime lastDate,
  String? helpText,
}) => showReferenceModal<DateTime>(
  context,
  (_) => _SalesDatePicker(
    initial: initialDate.isBefore(firstDate)
        ? firstDate
        : initialDate.isAfter(lastDate)
        ? lastDate
        : initialDate,
    first: DateUtils.dateOnly(firstDate),
    last: DateUtils.dateOnly(lastDate),
    title: helpText ?? 'Pick a date',
  ),
);

class _SalesDatePicker extends StatefulWidget {
  const _SalesDatePicker({
    required this.initial,
    required this.first,
    required this.last,
    required this.title,
  });
  final DateTime initial, first, last;
  final String title;
  @override
  State<_SalesDatePicker> createState() => _SalesDatePickerState();
}

class _SalesDatePickerState extends State<_SalesDatePicker> {
  late DateTime _month = DateTime(widget.initial.year, widget.initial.month);
  DateTime? _selected;
  bool _months = false;
  late int _year = _month.year;
  bool _allowed(DateTime d) =>
      !d.isBefore(widget.first) && !d.isAfter(widget.last);
  @override
  Widget build(BuildContext context) {
    final offset = (_month.weekday - 1) % 7;
    final count = DateUtils.getDaysInMonth(_month.year, _month.month);
    final cells = ((offset + count) / 7).ceil() * 7;
    final prev = DateTime(_month.year, _month.month, 0),
        next = DateTime(_month.year, _month.month + 1);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          widget.title,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextButton(
                onPressed: () => setState(() => _months = !_months),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      DateFormat('MMMM yyyy').format(_month),
                      style: const TextStyle(
                        fontSize: 14,
                        color: detailGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const DetailGlyph('down', size: 13),
                  ],
                ),
              ),
            ),
            IconButton(
              tooltip: 'Previous month',
              onPressed: prev.isBefore(widget.first)
                  ? null
                  : () => setState(
                      () => _month = DateTime(_month.year, _month.month - 1),
                    ),
              icon: const RotatedBox(
                quarterTurns: 2,
                child: DetailGlyph('chevron', size: 15),
              ),
            ),
            IconButton(
              tooltip: 'Next month',
              onPressed: next.isAfter(widget.last)
                  ? null
                  : () => setState(() => _month = next),
              icon: const DetailGlyph('chevron', size: 15),
            ),
          ],
        ),
        if (_months) ...[
          Row(
            children: [
              IconButton(
                tooltip: 'Previous year',
                onPressed: _year > widget.first.year
                    ? () => setState(() => _year--)
                    : null,
                icon: const RotatedBox(
                  quarterTurns: 2,
                  child: DetailGlyph('chevron', size: 14),
                ),
              ),
              Expanded(
                child: Text(
                  '$_year',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              IconButton(
                tooltip: 'Next year',
                onPressed: _year < widget.last.year
                    ? () => setState(() => _year++)
                    : null,
                icon: const DetailGlyph('chevron', size: 14),
              ),
            ],
          ),
          GridView.count(
            crossAxisCount: 3,
            childAspectRatio: 2.1,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              for (var m = 1; m <= 12; m++)
                TextButton(
                  onPressed:
                      DateTime(_year, m + 1, 0).isBefore(widget.first) ||
                          DateTime(_year, m).isAfter(widget.last)
                      ? null
                      : () => setState(() {
                          _month = DateTime(_year, m);
                          _months = false;
                        }),
                  child: Text(
                    DateFormat('MMM').format(DateTime(_year, m)),
                    style: const TextStyle(fontSize: 12),
                  ),
                ),
            ],
          ),
        ] else ...[
          Row(
            children: [
              for (final day in ['M', 'T', 'W', 'T', 'F', 'S', 'S'])
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 7),
                    child: Text(
                      day,
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 11, color: detailMuted),
                    ),
                  ),
                ),
            ],
          ),
          GridView.count(
            crossAxisCount: 7,
            childAspectRatio: 1.12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              for (var index = 0; index < cells; index++)
                if (index < offset || index >= offset + count)
                  const SizedBox()
                else
                  Builder(
                    builder: (context) {
                      final d = DateTime(
                        _month.year,
                        _month.month,
                        index - offset + 1,
                      );
                      final selected = DateUtils.isSameDay(d, _selected);
                      return Padding(
                        padding: const EdgeInsets.all(2),
                        child: TextButton(
                          onPressed: _allowed(d)
                              ? () => setState(() => _selected = d)
                              : null,
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                            backgroundColor: selected
                                ? detailGreen
                                : Colors.transparent,
                            foregroundColor: selected
                                ? Colors.white
                                : const Color(0xFF202D27),
                            disabledForegroundColor: const Color(0xFFB6BDB9),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text(
                            '${d.day}',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      );
                    },
                  ),
            ],
          ),
        ],
        const SizedBox(height: 12),
        if (_selected == null)
          const Text(
            'Pick a date',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          )
        else
          Text(
            DateFormat('EEE, d MMM yyyy').format(_selected!),
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
        const SizedBox(height: 5),
        Text(
          _selected == null
              ? 'Nothing selected'
              : _selected!.weekday >= 6
              ? 'Weekend'
              : '',
          style: const TextStyle(fontSize: 11, color: detailMuted),
        ),
        const SizedBox(height: 12),
        detailAction(
          'Confirm',
          'check',
          _selected == null ? null : () => Navigator.pop(context, _selected),
          filled: true,
        ),
      ],
    );
  }
}
