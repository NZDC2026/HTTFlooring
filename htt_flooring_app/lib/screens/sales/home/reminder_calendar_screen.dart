import '../../../widgets/sales_time_picker.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../more/sales_more_screen.dart' show chooseSalesCustomer;
import '../../../widgets/sales_task_completion.dart';
import '../../../widgets/sales_date_picker.dart';

import 'dart:convert';
import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../models/customer.dart';
import '../../../models/customer_note.dart';
import '../../../models/customer_location.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_service.dart';
import '../../../services/customer_location_service.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/sales_session.dart';
import '../customers/customer_directory_data.dart';
import '../customers/customer_detail_screen.dart';
import '../customers/customer_map_screen.dart';
import '../customers/customer_notes_screen.dart';
import '../customers/sales_visit_screen.dart';
import '../customers/visit_check_in_screen.dart';
import 'calendar_agenda_data.dart';
import 'sales_dashboard_support.dart';

part 'calendar_agenda_actions.dart';

const _agendaBlue = Color(0xFF2167D5);
const _agendaGreen = Color(0xFF198B54);
const _agendaRed = Color(0xFFD93650);
const _agendaMuted = Color(0xFF69766F);
const _agendaBorder = Color(0xFFE1E7E3);
const _agendaPale = Color(0xFFEAF3EE);

enum _CalendarView { week, month, list }

enum _CalendarFilter { all, visits, followUps }

class ReminderCalendarScreen extends StatefulWidget {
  const ReminderCalendarScreen({super.key});
  @override
  State<ReminderCalendarScreen> createState() => _ReminderCalendarScreenState();
}

class _ReminderCalendarScreenState extends State<ReminderCalendarScreen> {
  final DateTime _today = DateUtils.dateOnly(DateTime.now());
  late DateTime _selected = _today;
  _CalendarView _view = _CalendarView.week;
  _CalendarFilter _filter = _CalendarFilter.all;
  bool _visitsOpen = true,
      _choosingMonth = false,
      _onlyMine = false,
      _tasksOpen = false,
      _completedTab = false,
      _more = false,
      _loaded = false;
  late int _pickerYear = _selected.year;
  final Map<String, bool> _completion = {};
  final Map<String, DateTime> _dates = {};
  final Map<String, int> _durations = {};
  String get _prefsKey =>
      'calendar-agenda-${context.read<AppSession>().currentUser.id}';
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loaded = true;
      _load();
    }
  }

  Future<void> _load() async {
    await restoreNextSalesFollowUps(context);
    if (!mounted) return;
    final key = _prefsKey;
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    try {
      final raw = jsonDecode(prefs.getString(key) ?? '{}') as Map;
      setState(() {
        _completion.addAll(Map<String, bool>.from(raw['completed'] ?? {}));
        for (final e in Map<String, dynamic>.from(raw['dates'] ?? {}).entries) {
          final date = DateTime.tryParse(e.value.toString());
          if (date != null) _dates[e.key] = date;
        }
        _durations.addAll(Map<String, int>.from(raw['durations'] ?? {}));
      });
    } catch (_) {
      /* Ignore an obsolete local preview state. */
    }
  }

  void _update(VoidCallback action) => setState(action);
  Future<void> _save() async {
    final key = _prefsKey;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      key,
      jsonEncode({
        'completed': _completion,
        'dates': _dates.map((k, v) => MapEntry(k, v.toIso8601String())),
        'durations': _durations,
      }),
    );
  }

  List<AgendaEvent> _filterEvents(List<AgendaEvent> rows) => rows
      .where(
        (e) =>
            (_filter == _CalendarFilter.all ||
            (_filter == _CalendarFilter.visits
                ? e.kind == AgendaKind.visit
                : e.kind != AgendaKind.visit)),
      )
      .toList();
  void _select(DateTime day) {
    setState(() {
      _selected = DateUtils.dateOnly(day);
      _more = false;
      _completedTab = false;
    });
  }

  void _move(int direction) {
    if (_view == _CalendarView.month) {
      final month = DateTime(_selected.year, _selected.month + direction);
      final days = DateUtils.getDaysInMonth(month.year, month.month);
      _select(DateTime(month.year, month.month, _selected.day.clamp(1, days)));
    } else {
      _select(_selected.add(Duration(days: 7 * direction)));
    }
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AppSession>();
    context.watch<CustomerNoteService>();
    context.watch<CustomerService>();
    context.watch<CustomerLocationService>();
    context.watch<SalesSession>();
    final data = CalendarAgendaData(
      context,
      today: _today,
      completion: _completion,
      dates: _dates,
      durations: _durations,
    );
    final events = _filterEvents(
      data.events.where((e) => !_onlyMine || e.assignedToMe).toList(),
    );
    final days = _view == _CalendarView.list
        ? (<DateTime>{
            _selected,
            ...events
                .where(
                  (e) =>
                      !DateUtils.dateOnly(e.at).isBefore(_selected) &&
                      e.at.isBefore(_selected.add(const Duration(days: 31))),
                )
                .map((e) => DateUtils.dateOnly(e.at)),
          }.toList()..sort())
        : [_selected];
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        toolbarHeight: 52,
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1D2B24),
        elevation: 0,
        scrolledUnderElevation: 0,
        titleSpacing: 14,
        title: const Text(
          'Calendar',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
        actions: [
          Center(
            child: Container(
              width: 156,
              height: 32,
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: const Color(0xFFEDF0EE),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  for (final v in _CalendarView.values)
                    Expanded(
                      child: Semantics(
                        button: true,
                        selected: _view == v,
                        child: Material(
                          color: _view == v ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(7),
                          child: InkWell(
                            onTap: () => setState(() => _view = v),
                            borderRadius: BorderRadius.circular(7),
                            child: Center(
                              child: Text(
                                switch (v) {
                                  _CalendarView.week => 'Week',
                                  _CalendarView.month => 'Month',
                                  _CalendarView.list => 'List',
                                },
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: _view == v
                                      ? FontWeight.w600
                                      : FontWeight.w400,
                                  color: const Color(0xFF52625A),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          IconButton(
            tooltip: 'Only mine',
            onPressed: () => setState(() => _onlyMine = !_onlyMine),
            icon: Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: _onlyMine ? dashboardGreen : Colors.transparent,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: _CalendarPerson(
                  color: _onlyMine ? Colors.white : dashboardGreen,
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        key: const ValueKey('calendar-add'),
        tooltip: 'Add to calendar',
        onPressed: _addMenu,
        backgroundColor: dashboardGreen,
        foregroundColor: Colors.white,
        elevation: 5,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: const Icon(Icons.add, size: 29),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 86),
        children: [
          Row(
            children: [
              Expanded(
                child: Wrap(
                  spacing: 6,
                  children: [
                    for (final f in _CalendarFilter.values) _filterChip(f),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              if (_onlyMine)
                const Text(
                  'Only mine',
                  style: TextStyle(
                    color: Color(0xFF168047),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
            ],
          ),
          if (_view != _CalendarView.list) ...[
            const SizedBox(height: 10),
            _dateCard(events),
          ],
          for (final day in days)
            _agendaDay(
              day,
              events.where((e) => DateUtils.isSameDay(e.at, day)).toList(),
            ),
          if (data.demo)
            const Padding(
              padding: EdgeInsets.only(top: 16),
              child: Text(
                'Demo calendar · sample visits and follow-ups',
                style: TextStyle(fontSize: 10, color: Color(0xFF98A29B)),
              ),
            ),
        ],
      ),
    );
  }

  Widget _filterChip(_CalendarFilter f) {
    final active = f == _filter;
    final title = switch (f) {
      _CalendarFilter.all => 'All',
      _CalendarFilter.visits => 'Visits',
      _CalendarFilter.followUps => 'Follow-ups',
    };
    return Semantics(
      button: true,
      selected: active,
      child: InkWell(
        onTap: () => setState(() => _filter = f),
        borderRadius: BorderRadius.circular(22),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 7),
          decoration: BoxDecoration(
            color: active ? dashboardGreen : Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: active ? dashboardGreen : _agendaBorder),
          ),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 11,
              color: active ? Colors.white : const Color(0xFF33473B),
              fontWeight: active ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ),
      ),
    );
  }

  Widget _dateCard(List<AgendaEvent> events) => Container(
    padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: _agendaBorder),
      boxShadow: const [
        BoxShadow(
          color: Color(0x0C000000),
          blurRadius: 3,
          offset: Offset(0, 2),
        ),
      ],
    ),
    child: Column(
      children: [
        Row(
          children: [
            Expanded(
              child: TextButton(
                onPressed: _pickDate,
                style: TextButton.styleFrom(
                  alignment: Alignment.centerLeft,
                  padding: const EdgeInsets.symmetric(horizontal: 7),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(
                      child: Text(
                        DateFormat('MMMM yyyy').format(_selected),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: dashboardGreen,
                        ),
                      ),
                    ),
                    const SizedBox(width: 3),
                    Transform.rotate(
                      angle: _choosingMonth ? -1.5708 : 1.5708,
                      child: const Icon(
                        Icons.chevron_right,
                        size: 15,
                        color: dashboardGreen,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (!_choosingMonth && !DateUtils.isSameDay(_selected, _today))
              SizedBox(
                height: 28,
                child: OutlinedButton(
                  onPressed: () => _select(_today),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    side: const BorderSide(color: Color(0xFFD2DDD6)),
                  ),
                  child: const Text(
                    'Today',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF07844A),
                    ),
                  ),
                ),
              ),
            if (!_choosingMonth)
              IconButton(
                tooltip: _view == _CalendarView.month
                    ? 'Previous month'
                    : 'Previous week',
                onPressed: () => _move(-1),
                icon: const Icon(Icons.chevron_left, size: 20),
              ),
            if (!_choosingMonth)
              IconButton(
                tooltip: _view == _CalendarView.month
                    ? 'Next month'
                    : 'Next week',
                onPressed: () => _move(1),
                icon: const Icon(Icons.chevron_right, size: 20),
              ),
          ],
        ),
        if (_choosingMonth)
          _monthPicker()
        else ...[
          if (_view == _CalendarView.week) _week(events) else _month(events),
          const Divider(height: 14, color: Color(0xFFE8EDE9)),
          Padding(
            padding: const EdgeInsets.only(bottom: 9),
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 12,
              runSpacing: 4,
              children: [
                _legend(
                  _agendaBlue,
                  _view == _CalendarView.month ? 'Visit' : 'Visits',
                ),
                _legend(
                  _agendaGreen,
                  _view == _CalendarView.month ? 'Follow-up' : 'Follow-ups',
                ),
                _legend(_agendaRed, 'Overdue'),
                if (_view == _CalendarView.month)
                  _legend(const Color(0xFF9AA5AC), 'Done'),
              ],
            ),
          ),
        ],
      ],
    ),
  );
  Widget _monthPicker() => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Column(
      children: [
        Row(
          children: [
            IconButton(
              tooltip: 'Previous year',
              onPressed: () => setState(() => _pickerYear--),
              icon: const Icon(Icons.chevron_left, size: 18),
            ),
            Expanded(
              child: Center(
                child: Text(
                  '$_pickerYear',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            IconButton(
              tooltip: 'Next year',
              onPressed: () => setState(() => _pickerYear++),
              icon: const Icon(Icons.chevron_right, size: 18),
            ),
          ],
        ),
        for (var row = 0; row < 3; row++)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Row(
              children: [
                for (var col = 0; col < 4; col++)
                  Expanded(child: _monthChoice(row * 4 + col + 1)),
              ],
            ),
          ),
      ],
    ),
  );
  Widget _monthChoice(int month) {
    final active = _pickerYear == _selected.year && month == _selected.month;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 3),
      child: Material(
        color: active ? dashboardGreen : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(9),
          side: const BorderSide(color: _agendaBorder),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(9),
          onTap: () {
            _select(
              DateTime(
                _pickerYear,
                month,
                _selected.day.clamp(
                  1,
                  DateUtils.getDaysInMonth(_pickerYear, month),
                ),
              ),
            );
            setState(() => _choosingMonth = false);
          },
          child: SizedBox(
            height: 36,
            child: Center(
              child: Text(
                DateFormat('MMM').format(DateTime(_pickerYear, month)),
                style: TextStyle(
                  fontSize: 12,
                  color: active ? Colors.white : const Color(0xFF24342B),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _week(List<AgendaEvent> events) {
    final start = _selected.subtract(Duration(days: _selected.weekday - 1));
    return Row(
      children: [
        for (var i = 0; i < 7; i++)
          Expanded(
            child: _dateTile(start.add(Duration(days: i)), events, week: true),
          ),
      ],
    );
  }

  Widget _month(List<AgendaEvent> events) {
    final first = DateTime(_selected.year, _selected.month);
    final offset = first.weekday - 1;
    final days = DateUtils.getDaysInMonth(first.year, first.month);
    final tiles = ((offset + days) / 7).ceil() * 7;
    return Column(
      children: [
        Row(
          children: [
            for (final day in ['M', 'T', 'W', 'T', 'F', 'S', 'S'])
              Expanded(
                child: Center(
                  child: Text(
                    day,
                    style: const TextStyle(fontSize: 10, color: _agendaMuted),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 6),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: tiles,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            mainAxisExtent: 44,
          ),
          itemBuilder: (context, i) {
            final day = i - offset + 1;
            if (day < 1 || day > days) return const SizedBox.shrink();
            return _dateTile(
              DateTime(first.year, first.month, day),
              events,
              week: false,
            );
          },
        ),
      ],
    );
  }

  Widget _dateTile(
    DateTime day,
    List<AgendaEvent> events, {
    required bool week,
  }) {
    final selected = DateUtils.isSameDay(day, _selected),
        today = DateUtils.isSameDay(day, _today);
    final rows = events.where((e) => DateUtils.isSameDay(e.at, day)).toList();
    final visits = rows
        .where((e) => e.kind == AgendaKind.visit && !e.completed)
        .length;
    final tasks = rows
        .where((e) => e.kind != AgendaKind.visit && !e.completed)
        .length;
    final done = rows.any((e) => e.completed);
    final overdue = day.isBefore(_today);
    final fg = selected
        ? Colors.white
        : day.weekday >= 6
        ? const Color(0xFF929B95)
        : const Color(0xFF192D21);
    return Semantics(
      button: true,
      selected: selected,
      label: DateFormat('EEEE d MMMM yyyy').format(day),
      child: InkWell(
        key: ValueKey('calendar-day-${DateFormat('yyyy-MM-dd').format(day)}'),
        onTap: () => _select(day),
        onLongPress: () {
          _select(day);
          _addMenu();
        },
        borderRadius: BorderRadius.circular(13),
        child: Center(
          child: Container(
            width: week ? 44 : 46,
            height: week ? 88 : 42,
            margin: const EdgeInsets.symmetric(horizontal: 1),
            padding: EdgeInsets.symmetric(vertical: week ? 8 : 5),
            decoration: BoxDecoration(
              color: selected ? dashboardGreen : Colors.transparent,
              borderRadius: BorderRadius.circular(week ? 14 : 11),
              border: today && !selected
                  ? Border.all(color: const Color(0xFF78AE91))
                  : null,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (week)
                  Text(
                    DateFormat('EEE').format(day),
                    style: TextStyle(
                      fontSize: 10,
                      color: selected ? const Color(0xFFD0E2D8) : _agendaMuted,
                    ),
                  ),
                Text(
                  '${day.day}',
                  style: TextStyle(
                    fontSize: week ? 16 : 12,
                    fontWeight: week || selected
                        ? FontWeight.w600
                        : FontWeight.w400,
                    color: fg,
                  ),
                ),
                SizedBox(
                  height: week ? 18 : 7,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (visits > 0)
                        _dayMark(visits, _agendaBlue, week, selected),
                      if (tasks > 0)
                        _dayMark(
                          tasks,
                          overdue ? _agendaRed : _agendaGreen,
                          week,
                          selected,
                        ),
                      if (!week && done)
                        _dayMark(1, const Color(0xFF9AA5AC), false, selected),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _dayMark(int count, Color color, bool number, bool selected) =>
      Container(
        margin: const EdgeInsets.symmetric(horizontal: 1),
        width: number ? 18 : 6,
        height: number ? 18 : 6,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: number
              ? color
              : selected
              ? Colors.white
              : color,
          shape: BoxShape.circle,
          border: number && selected
              ? Border.all(color: Colors.white, width: 1)
              : null,
        ),
        child: number
            ? Text(
                '$count',
                style: const TextStyle(
                  fontSize: 10,
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              )
            : null,
      );
  Widget _legend(Color color, String title) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Container(
        width: 9,
        height: 9,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      ),
      const SizedBox(width: 5),
      Text(title, style: const TextStyle(fontSize: 10, color: _agendaMuted)),
    ],
  );
  Widget _agendaDay(DateTime day, List<AgendaEvent> events) {
    final visits = events
        .where((e) => e.kind == AgendaKind.visit && !e.completed)
        .toList();
    final tasks = events.where((e) => e.kind == AgendaKind.followUp).toList();
    final notes = events.where((e) => e.kind == AgendaKind.note).toList();
    final todo = tasks.where((e) => !e.completed).length;
    final label = DateUtils.isSameDay(day, _today)
        ? 'Today'
        : DateUtils.isSameDay(day, _today.add(const Duration(days: 1)))
        ? 'Tomorrow'
        : DateFormat('EEE').format(day);
    final parts = [
      if (visits.isNotEmpty) '${visits.length} visits',
      if (todo > 0) '$todo follow-ups',
      if (notes.isNotEmpty) '${notes.length} notes',
      if (todo == 0 && tasks.isNotEmpty) '${tasks.length} completed',
    ];
    final summary = _view == _CalendarView.list
        ? DateFormat('d MMM yyyy').format(day)
        : '${DateFormat('d MMM').format(day)} · ${parts.isEmpty ? 'Nothing planned' : parts.join(' · ')}';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(2, 16, 2, 14),
          child: Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 7,
            runSpacing: 4,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                summary,
                style: const TextStyle(fontSize: 11, color: _agendaMuted),
              ),
            ],
          ),
        ),
        if (visits.isNotEmpty) _visitGroup(visits),
        if (tasks.isNotEmpty) ...[
          if (visits.isNotEmpty) const SizedBox(height: 12),
          _taskGroup(tasks),
        ],
        if (notes.isNotEmpty) ...[
          const SizedBox(height: 12),
          _notesGroup(notes),
        ],
        if (visits.isEmpty && tasks.isEmpty && notes.isEmpty)
          _emptyActions(day),
      ],
    );
  }

  Widget _group({
    required String title,
    required IconData icon,
    required Widget badge,
    required bool open,
    required VoidCallback onToggle,
    required Widget child,
    Widget? extra,
  }) => Container(
    clipBehavior: Clip.antiAlias,
    decoration: BoxDecoration(
      color: open ? _agendaPale : Colors.white,
      borderRadius: BorderRadius.circular(15),
      border: Border.all(color: open ? dashboardGreen : _agendaBorder),
      boxShadow: const [
        BoxShadow(
          color: Color(0x0C000000),
          blurRadius: 3,
          offset: Offset(0, 2),
        ),
      ],
    ),
    foregroundDecoration: BoxDecoration(
      borderRadius: BorderRadius.circular(15),
      border: Border.all(color: open ? dashboardGreen : _agendaBorder),
    ),
    child: Column(
      children: [
        Material(
          color: open ? dashboardGreen : Colors.white,
          child: InkWell(
            onTap: onToggle,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 11),
              child: Row(
                children: [
                  Container(
                    width: 35,
                    height: 35,
                    decoration: BoxDecoration(
                      color: open
                          ? Colors.white.withValues(alpha: .18)
                          : dashboardGreen,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: icon == Icons.event_available_outlined
                        ? const Center(
                            child: _AgendaGlyph(
                              'calendar',
                              size: 18,
                              color: Colors.white,
                            ),
                          )
                        : Icon(icon, size: 18, color: Colors.white),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 9,
                      runSpacing: 4,
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: open ? Colors.white : dashboardGreen,
                          ),
                        ),
                        badge,
                      ],
                    ),
                  ),
                  ?extra,
                  const SizedBox(width: 9),
                  Transform.rotate(
                    angle: open ? 1.5708 : 0,
                    child: Icon(
                      Icons.chevron_right,
                      size: 16,
                      color: open
                          ? const Color(0xFFC9DED2)
                          : const Color(0xFF8D9B93),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (open) child,
      ],
    ),
  );
  Widget _count(int count, {bool blue = false}) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(
      color: blue ? const Color(0xFFE6EFFF) : const Color(0xFFE0F0E6),
      borderRadius: BorderRadius.circular(6),
    ),
    child: Text(
      '$count',
      style: TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        color: blue ? _agendaBlue : const Color(0xFF16794B),
      ),
    ),
  );
  Widget _visitGroup(List<AgendaEvent> visits) => _group(
    title: 'Visits',
    icon: Icons.location_on_outlined,
    badge: _count(visits.length, blue: true),
    open: _visitsOpen,
    onToggle: () => setState(() => _visitsOpen = !_visitsOpen),
    extra: TextButton(
      onPressed: () => _planRoute(visits),
      style: TextButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 2),
        minimumSize: const Size(0, 28),
        foregroundColor: _visitsOpen ? Colors.white : dashboardGreen,
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _RouteGlyph(),
          SizedBox(width: 4),
          Text(
            'Plan route',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w400),
          ),
        ],
      ),
    ),
    child: Padding(
      padding: const EdgeInsets.all(8),
      child: Column(
        children: [
          for (var i = 0; i < visits.length; i++) ...[
            _visitCard(visits[i]),
            if (i < visits.length - 1)
              Container(
                margin: const EdgeInsets.only(left: 7),
                padding: const EdgeInsets.fromLTRB(12, 14, 0, 14),
                decoration: const BoxDecoration(
                  border: Border(left: BorderSide(color: Color(0xFFCDDBD2))),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.local_shipping_outlined,
                      size: 12,
                      color: _agendaMuted,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        visits[i].demo && visits[i + 1].demo
                            ? '8.9 km · ~23 min drive · 165 min free'
                            : '${visits[i + 1].at.difference(visits[i].end).inMinutes.clamp(0, 1440)} min until next visit',
                        style: const TextStyle(
                          fontSize: 11,
                          color: _agendaMuted,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ],
      ),
    ),
  );
  Widget _visitCard(AgendaEvent e) => Container(
    clipBehavior: Clip.antiAlias,
    decoration: BoxDecoration(
      color: _agendaBlue,
      borderRadius: BorderRadius.circular(12),
    ),
    padding: const EdgeInsets.only(left: 3),
    child: Material(
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${DateFormat('h:mm a').format(e.at)} – ${DateFormat('h:mm a').format(e.end)}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: _agendaBlue,
              ),
            ),
            const SizedBox(height: 4),
            InkWell(
              onTap: () => _openEvent(e),
              child: Text(
                e.customerName,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 3),
            Text(
              e.description,
              style: const TextStyle(
                fontSize: 11,
                height: 1.4,
                color: _agendaMuted,
              ),
            ),
            if (e.address.isNotEmpty)
              Text(
                e.address,
                style: const TextStyle(
                  fontSize: 11,
                  height: 1.5,
                  color: _agendaMuted,
                ),
              ),
            const SizedBox(height: 11),
            Row(
              children: [
                Expanded(
                  child: _visitButton(
                    'Check in',
                    Icons.location_on_outlined,
                    () => _checkIn(e),
                    dark: true,
                  ),
                ),
                const SizedBox(width: 7),
                Expanded(
                  child: _visitButton(
                    'Go',
                    Icons.near_me_outlined,
                    e.address.isEmpty
                        ? null
                        : () => _launch(
                            Uri.https('www.google.com', '/maps/dir/', {
                              'api': '1',
                              'destination': e.address,
                            }),
                          ),
                  ),
                ),
                const SizedBox(width: 7),
                Expanded(
                  child: _visitButton(
                    e.contact.isEmpty ? 'Contact' : e.contact.split(' ').first,
                    Icons.phone_outlined,
                    () => _call(e),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
  Widget _visitButton(
    String text,
    IconData icon,
    VoidCallback? tap, {
    bool dark = false,
  }) => Material(
    color: dark ? dashboardGreen : Colors.white,
    borderRadius: BorderRadius.circular(11),
    child: InkWell(
      onTap: tap,
      borderRadius: BorderRadius.circular(11),
      child: Container(
        height: 36,
        decoration: BoxDecoration(
          border: Border.all(
            color: dark ? dashboardGreen : const Color(0xFFD4DED7),
          ),
          borderRadius: BorderRadius.circular(11),
          boxShadow: const [
            BoxShadow(
              color: Color(0x09000000),
              blurRadius: 2,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon == Icons.near_me_outlined)
              _AgendaGlyph(
                'go',
                size: 14,
                color: dark ? Colors.white : dashboardGreen,
              )
            else
              Icon(icon, size: 14, color: dark ? Colors.white : dashboardGreen),
            const SizedBox(width: 5),
            Flexible(
              child: Text(
                text,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: dark ? Colors.white : dashboardGreen,
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
  Widget _taskGroup(List<AgendaEvent> tasks) {
    final todo = tasks.where((e) => !e.completed).toList(),
        done = tasks.where((e) => e.completed).toList();
    final rows = _completedTab ? done : todo;
    return _group(
      title: 'Follow-ups due',
      icon: Icons.event_available_outlined,
      badge: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _count(todo.length),
          if (!_tasksOpen) ...[
            const SizedBox(width: 10),
            Text(
              '${done.length} done',
              style: const TextStyle(fontSize: 10, color: _agendaMuted),
            ),
          ],
        ],
      ),
      open: _tasksOpen,
      onToggle: () => setState(() => _tasksOpen = !_tasksOpen),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          children: [
            Container(
              height: 34,
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: const Color(0xFFE7F0EA),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  for (final completed in [false, true])
                    Expanded(
                      child: Material(
                        color: _completedTab == completed
                            ? Colors.white
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(7),
                        child: InkWell(
                          onTap: () => setState(() {
                            _completedTab = completed;
                            _more = false;
                          }),
                          child: Center(
                            child: Text(
                              '${completed ? 'Completed' : 'To do'}  ${completed ? done.length : todo.length}',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: _completedTab == completed
                                    ? FontWeight.w600
                                    : FontWeight.w400,
                                color: const Color(0xFF51645A),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 7),
            if (rows.isEmpty)
              const Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  'No follow-ups in this group',
                  style: TextStyle(fontSize: 12, color: _agendaMuted),
                ),
              ),
            for (final e in (_more ? rows : rows.take(3))) _taskCard(e),
            if (rows.length > 3)
              TextButton(
                onPressed: () => setState(() => _more = !_more),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _more ? 'Show less' : 'Show ${rows.length - 3} more',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF087D46),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Transform.rotate(
                      angle: _more ? -1.5708 : 1.5708,
                      child: const Icon(
                        Icons.chevron_right,
                        size: 14,
                        color: Color(0xFF087D46),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _taskCard(AgendaEvent e) => CalendarFollowUpCard(
    event: e,
    onOpen: () => _openEvent(e),
    onComplete: () => _complete(e),
    onCall: () => _call(e),
    onReschedule: () => _reschedule(e),
  );

  Widget _notesGroup(List<AgendaEvent> notes) => Container(
    margin: const EdgeInsets.only(top: 3),
    decoration: BoxDecoration(
      border: Border.all(color: _agendaBorder),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Column(
      children: [
        const ListTile(
          dense: true,
          title: Text(
            'Notes',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: dashboardGreen,
            ),
          ),
        ),
        for (final e in notes)
          ListTile(
            dense: true,
            title: Text(
              e.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 12),
            ),
            subtitle: Text(
              e.customerName,
              style: const TextStyle(fontSize: 11),
            ),
            trailing: const Icon(Icons.chevron_right, size: 16),
            onTap: () => _openEvent(e),
          ),
      ],
    ),
  );
  Widget _emptyActions(DateTime day) => Container(
    padding: const EdgeInsets.all(11),
    decoration: BoxDecoration(
      border: Border.all(color: _agendaBorder),
      borderRadius: BorderRadius.circular(14),
      boxShadow: const [
        BoxShadow(
          color: Color(0x08000000),
          blurRadius: 3,
          offset: Offset(0, 2),
        ),
      ],
    ),
    child: Row(
      children: [
        Expanded(
          child: _visitButton(
            'Schedule visit',
            Icons.location_on_outlined,
            _schedule,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _visitButton(
            'Add follow-up',
            Icons.add,
            () => _newFollowUp(),
            dark: true,
          ),
        ),
      ],
    ),
  );
}

class _CalendarPerson extends StatelessWidget {
  const _CalendarPerson({this.color = dashboardGreen});
  final Color color;
  @override
  Widget build(BuildContext context) => SizedBox(
    width: 20,
    height: 20,
    child: CustomPaint(painter: _CalendarPersonPainter(color)),
  );
}

class _CalendarPersonPainter extends CustomPainter {
  _CalendarPersonPainter(this.color);
  final Color color;
  @override
  void paint(Canvas c, Size s) {
    final p = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.3
      ..color = color;
    c.drawCircle(Offset(s.width / 2, 5), 3.2, p);
    final path = Path()
      ..moveTo(4, 18)
      ..cubicTo(4, 9, 16, 9, 16, 18);
    c.drawPath(path, p);
  }

  @override
  bool shouldRepaint(_CalendarPersonPainter old) => old.color != color;
}

class _RouteGlyph extends StatelessWidget {
  const _RouteGlyph();
  @override
  Widget build(BuildContext context) => SizedBox(
    width: 13,
    height: 13,
    child: CustomPaint(
      painter: _RoutePainter(IconTheme.of(context).color ?? Colors.white),
    ),
  );
}

class _RoutePainter extends CustomPainter {
  _RoutePainter(this.color);
  final Color color;
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(const Offset(3, 10), 2, p);
    canvas.drawCircle(const Offset(10, 3), 2, p);
    canvas.drawPath(
      Path()
        ..moveTo(5, 10)
        ..lineTo(9, 10)
        ..cubicTo(14, 10, 11, 6, 7, 6)
        ..cubicTo(2, 6, 2, 3, 8, 3),
      p,
    );
  }

  @override
  bool shouldRepaint(_RoutePainter old) => old.color != color;
}

class _AgendaGlyph extends StatelessWidget {
  const _AgendaGlyph(this.kind, {this.size = 18, this.color = Colors.white});
  final String kind;
  final double size;
  final Color color;
  @override
  Widget build(BuildContext context) => SizedBox(
    width: size,
    height: size,
    child: CustomPaint(painter: _AgendaGlyphPainter(kind, color)),
  );
}

class _AgendaGlyphPainter extends CustomPainter {
  _AgendaGlyphPainter(this.kind, this.color);
  final String kind;
  final Color color;
  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / 24, size.height / 24);
    final p = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final path = Path();
    if (kind == 'calendar') {
      path.addRRect(
        RRect.fromRectAndRadius(
          const Rect.fromLTWH(3, 5, 18, 16),
          const Radius.circular(2),
        ),
      );
      path.moveTo(7, 2);
      path.lineTo(7, 8);
      path.moveTo(17, 2);
      path.lineTo(17, 8);
      path.moveTo(3, 10);
      path.lineTo(21, 10);
      path.moveTo(8, 15);
      path.lineTo(11, 18);
      path.lineTo(16, 13);
    } else {
      path.moveTo(12, 2);
      path.lineTo(22, 12);
      path.lineTo(12, 22);
      path.lineTo(2, 12);
      path.close();
      path.moveTo(8, 16);
      path.lineTo(8, 11);
      path.lineTo(16, 11);
      path.moveTo(12, 7);
      path.lineTo(16, 11);
      path.lineTo(12, 15);
    }
    canvas.drawPath(path, p);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_AgendaGlyphPainter old) =>
      old.kind != kind || old.color != color;
}

class CalendarFollowUpCard extends StatelessWidget {
  const CalendarFollowUpCard({
    super.key,
    required this.event,
    required this.onOpen,
    required this.onComplete,
    required this.onCall,
    required this.onReschedule,
  });
  final AgendaEvent event;
  final VoidCallback onOpen, onComplete, onCall, onReschedule;
  @override
  Widget build(BuildContext context) {
    final e = event;
    return Container(
      margin: const EdgeInsets.only(bottom: 7),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EBE6)),
      ),
      child: Material(
        type: MaterialType.transparency,
        child: InkWell(
          onTap: onOpen,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 12),
            child: Row(
              children: [
                Tooltip(
                  message: e.completed
                      ? 'Reopen follow-up'
                      : 'Complete follow-up',
                  child: InkWell(
                    onTap: onComplete,
                    customBorder: const CircleBorder(),
                    child: Container(
                      width: 25,
                      height: 25,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: e.completed ? _agendaGreen : Colors.transparent,
                        border: Border.all(
                          color: e.completed
                              ? _agendaGreen
                              : const Color(0xFF9EABB1),
                          width: 1.7,
                        ),
                      ),
                      child: e.completed
                          ? const Icon(
                              Icons.check,
                              size: 17,
                              color: Colors.white,
                            )
                          : null,
                    ),
                  ),
                ),
                const SizedBox(width: 11),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        e.customerName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13),
                      ),
                      const SizedBox(height: 4),
                      Wrap(
                        spacing: 5,
                        runSpacing: 3,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          _typeTag(e),
                          if (e.inProgress && !e.completed)
                            const Text(
                              'In progress',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFFAD7100),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        e.description,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 10.5,
                          color: _agendaMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 4),
                SizedBox(
                  width: 57,
                  child: TextButton(
                    onPressed: onCall,
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      foregroundColor: const Color(0xFF52625A),
                    ),
                    child: Column(
                      children: [
                        const Icon(
                          Icons.phone_outlined,
                          size: 12,
                          color: Color(0xFF14824C),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          e.contact.isEmpty
                              ? 'Contact'
                              : e.contact.split(' ').first,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(
                  width: 29,
                  child: IconButton(
                    tooltip: 'Reschedule follow-up',
                    onPressed: onReschedule,
                    padding: EdgeInsets.zero,
                    icon: const Icon(
                      Icons.schedule,
                      size: 16,
                      color: Color(0xFF13844C),
                    ),
                  ),
                ),
                const Icon(
                  Icons.chevron_right,
                  size: 14,
                  color: Color(0xFF9FACA4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _typeTag(AgendaEvent e) {
    final color = e.type == 'Payment'
        ? const Color(0xFFAB6B00)
        : e.type == 'Swatches'
        ? const Color(0xFF7441C5)
        : _agendaBlue;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .10),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (e.type == 'Payment')
            Text(r'$', style: TextStyle(fontSize: 11, color: color))
          else
            DashboardIcon(
              e.type == 'Swatches'
                  ? CupertinoIcons.cube_box
                  : CupertinoIcons.doc,
              size: 11,
              color: color,
            ),
          const SizedBox(width: 4),
          Text(e.type, style: TextStyle(fontSize: 10, color: color)),
        ],
      ),
    );
  }
}
