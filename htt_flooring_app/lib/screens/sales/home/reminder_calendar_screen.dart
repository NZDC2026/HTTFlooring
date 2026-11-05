import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../models/customer_note.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';
import '../customers/customer_notes_screen.dart';
import '../quote/select_customer_screen.dart';

class ReminderCalendarScreen extends StatefulWidget {
  const ReminderCalendarScreen({super.key});

  @override
  State<ReminderCalendarScreen> createState() => _ReminderCalendarScreenState();
}

class _ReminderCalendarScreenState extends State<ReminderCalendarScreen> {
  final DateTime _today = DateUtils.dateOnly(DateTime.now());
  late DateTime _selected = _today;
  bool _showDemo = true;
  final _reminderHeading = GlobalKey();
  late DateTime _month = DateTime(_selected.year, _selected.month);

  void _changeMonth(int offset) {
    setState(() {
      _month = DateTime(_month.year, _month.month + offset);
      _selected = _month;
    });
  }

  DateTime _allowedDueDate(DateTime day) {
    final today = DateUtils.dateOnly(DateTime.now());
    final lastDate = DateTime(today.year + 2, today.month, today.day);
    return day.isBefore(today)
        ? today
        : day.isAfter(lastDate)
        ? lastDate
        : day;
  }

  Future<void> _addNote() async {
    final customer = await Navigator.of(context).push<Customer>(
      MaterialPageRoute(builder: (_) => const SelectCustomerScreen()),
    );
    if (!mounted || customer == null) return;
    await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => AddNoteScreen(customer: customer)),
    );
  }

  Future<void> _addReminder() async {
    final date = _allowedDueDate(_selected);
    await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => AddFollowUpScreen(initialDueDate: date),
      ),
    );
  }

  void _selectDay(DateTime day) {
    setState(() {
      _selected = day;
      _month = DateTime(day.year, day.month);
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final heading = _reminderHeading.currentContext;
      if (heading == null) return;
      Scrollable.ensureVisible(
        heading,
        duration: const Duration(milliseconds: 200),
        alignmentPolicy: ScrollPositionAlignmentPolicy.keepVisibleAtEnd,
      );
    });
  }

  DateTime? _reminderDay(CustomerNote task) {
    final due = task.followUpDate?.toLocal();
    final offset = switch (task.reminder) {
      'On due date' => 0,
      '1 day before' => 1,
      '1 week before' => 7,
      _ => null,
    };
    if (task.reminder == 'Custom date') {
      final date = task.reminderDate?.toLocal();
      return date == null ? null : DateUtils.dateOnly(date);
    }
    if (due == null || offset == null) return null;
    return DateTime(due.year, due.month, due.day - offset);
  }

  @override
  Widget build(BuildContext context) {
    final customers = context.watch<CustomerService>();
    final session = context.watch<SalesSession>();
    final userId = context.watch<AppSession>().currentUser.id;
    final reminders = <DateTime, List<CustomerNote>>{};
    for (final task in context.watch<CustomerNoteService>().pendingFollowUps) {
      final customer = customers.findById(task.customerId);
      final day = _reminderDay(task);
      if (day != null &&
          (task.customerId.isEmpty
              ? task.creatorId == userId ||
                    task.assignees.any((user) => user.id == userId)
              : customer != null && session.canAccessRegion(customer.region))) {
        (reminders[day] ??= []).add(task);
      }
    }
    final demoReminders = _showDemo
        ? {
            _today: ['Call customer to confirm the showroom visit'],
            DateTime(_today.year, _today.month, _today.day + 2): [
              'Follow up on the flooring quote',
              'Confirm the sample board delivery',
              'Confirm the next showroom visit',
            ],
            DateTime(_today.year, _today.month, _today.day + 5): [
              'Check whether the payment was received',
            ],
          }
        : const <DateTime, List<String>>{};
    final demoForDay = demoReminders[_selected] ?? const <String>[];
    final previewByDate = <DateTime, List<({String title, bool demo})>>{
      for (final day in {...reminders.keys, ...demoReminders.keys})
        day: [
          for (final task in reminders[day] ?? const <CustomerNote>[])
            (
              title: task.content.trim().replaceAll(RegExp(r'\s+'), ' '),
              demo: false,
            ),
          for (final title in demoReminders[day] ?? const <String>[])
            (title: title, demo: true),
        ],
    };
    final visible = reminders[_selected] ?? const <CustomerNote>[];
    final localizations = MaterialLocalizations.of(context);
    final start = DateUtils.firstDayOffset(
      _month.year,
      _month.month,
      localizations,
    );
    final days = DateUtils.getDaysInMonth(_month.year, _month.month);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Calendar'),
        actions: [
          IconButton(
            tooltip: 'Add reminder',
            onPressed: _addReminder,
            icon: const Icon(Icons.add, color: Colors.white),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _surface(
              SwitchListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                secondary: const Icon(
                  Icons.notifications_active_outlined,
                  color: AppColors.copper,
                ),
                title: const Text(
                  'Demo reminders',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                value: _showDemo,
                onChanged: (value) => setState(() => _showDemo = value),
              ),
            ),
            const SizedBox(height: 12),
            _surface(
              Padding(
                padding: const EdgeInsets.all(7),
                child: Column(
                  children: [
                    Row(
                      children: [
                        IconButton(
                          style: IconButton.styleFrom(
                            backgroundColor: AppColors.background,
                          ),
                          tooltip: 'Previous month',
                          onPressed: () => _changeMonth(-1),
                          icon: const Icon(Icons.chevron_left),
                        ),
                        Expanded(
                          child: Text(
                            DateFormat.yMMMM().format(_month),
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontFamily: 'serif',
                              fontSize: 23,
                              fontWeight: FontWeight.w700,
                              color: AppColors.darkGreen,
                            ),
                          ),
                        ),
                        IconButton(
                          style: IconButton.styleFrom(
                            backgroundColor: AppColors.background,
                          ),
                          tooltip: 'Next month',
                          onPressed: () => _changeMonth(1),
                          icon: const Icon(Icons.chevron_right),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Container(width: 36, height: 2, color: AppColors.copper),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        for (var index = 0; index < 7; index++)
                          Expanded(
                            child: Center(
                              child: Text(
                                localizations.narrowWeekdays[(localizations
                                            .firstDayOfWeekIndex +
                                        index) %
                                    7],
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    GridView.count(
                      crossAxisCount: 7,
                      mainAxisExtent:
                          26 + MediaQuery.textScalerOf(context).scale(50),
                      mainAxisSpacing: 3,
                      crossAxisSpacing: 3,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      children: [
                        for (
                          var index = 0;
                          index < ((start + days + 6) ~/ 7) * 7;
                          index++
                        )
                          _dayCell(
                            DateTime(
                              _month.year,
                              _month.month,
                              index - start + 1,
                            ),
                            previewByDate,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _addNote,
                    child: const Text('Add Note'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: FilledButton(
                    onPressed: _addReminder,
                    child: const Text('Add Follow-up'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              key: _reminderHeading,
              children: [
                Expanded(
                  child: Text(
                    DateFormat.yMMMMd().format(_selected),
                    style: const TextStyle(
                      fontFamily: 'serif',
                      fontSize: 21,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                DecoratedBox(
                  decoration: BoxDecoration(
                    color: AppColors.copperLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    child: Text(
                      '${visible.length + demoForDay.length} ${visible.length + demoForDay.length == 1 ? 'Event' : 'Events'}',
                      style: const TextStyle(fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (visible.isEmpty && demoForDay.isEmpty)
              const Text('No reminders for this date.'),
            for (final reminder in demoForDay)
              _reminderCard(
                title: reminder,
                subtitle: 'Demo',
                demo: true,
                onTap: () => Navigator.of(context).push<bool>(
                  MaterialPageRoute(
                    builder: (_) => AddFollowUpScreen(
                      initialDueDate: _allowedDueDate(_selected),
                      initialDescription: reminder,
                    ),
                  ),
                ),
              ),
            for (final task in visible)
              _reminderCard(
                title: task.content,
                subtitle:
                    customers.findById(task.customerId)?.businessName ??
                    'No customer',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<bool>(
                    builder: (_) => AddFollowUpScreen(
                      existing: task,
                      customer: customers.findById(task.customerId),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _surface(Widget child) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x100E342B),
            blurRadius: 14,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );
  }

  Widget _reminderCard({
    required String title,
    required String subtitle,
    bool demo = false,
    VoidCallback? onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        horizontalTitleGap: 12,
        leading: const CircleAvatar(
          radius: 17,
          backgroundColor: AppColors.copperLight,
          foregroundColor: AppColors.copper,
          child: Icon(Icons.notifications_outlined, size: 18),
        ),
        title: Text(
          title,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Align(
            alignment: AlignmentDirectional.centerStart,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: demo ? AppColors.copperLight : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Padding(
                padding: demo
                    ? const EdgeInsets.symmetric(horizontal: 7, vertical: 2)
                    : EdgeInsets.zero,
                child: Text(
                  subtitle,
                  style: const TextStyle(fontSize: 12, color: AppColors.text),
                ),
              ),
            ),
          ),
        ),
        trailing: onTap == null ? null : const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }

  Widget _dayCell(
    DateTime day,
    Map<DateTime, List<({String title, bool demo})>> previewByDate,
  ) {
    final selected = day == _selected;
    final inMonth = day.month == _month.month;
    final previews = previewByDate[day] ?? const [];
    const previewLimit = 2;
    return Semantics(
      selected: selected,
      label: '${DateFormat.yMMMMd().format(day)}, ${previews.length} reminders',
      child: Material(
        color: selected ? AppColors.green : AppColors.ivory,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(6),
          side: BorderSide(
            color: selected ? AppColors.green : AppColors.border,
            width: selected ? 2 : 1,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => _selectDay(day),
          child: ExcludeSemantics(
            child: Padding(
              padding: const EdgeInsets.all(3),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    '${day.day}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: selected
                          ? Colors.white
                          : !inMonth
                          ? AppColors.muted
                          : AppColors.text,
                      fontWeight: selected || day == _today
                          ? FontWeight.bold
                          : FontWeight.normal,
                    ),
                  ),
                  for (final preview in previews.take(previewLimit))
                    Container(
                      margin: const EdgeInsets.only(top: 2),
                      padding: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        color: selected
                            ? Colors.white12
                            : preview.demo
                            ? AppColors.copperLight
                            : AppColors.successLight,
                        borderRadius: BorderRadius.circular(3),
                      ),
                      child: Text(
                        preview.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 10,
                          color: selected ? Colors.white : AppColors.text,
                        ),
                      ),
                    ),
                  if (previews.length > previewLimit)
                    Text(
                      '+${previews.length - previewLimit}',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 10,
                        color: selected ? Colors.white : AppColors.green,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
