import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/customer_note.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';
import '../customers/customer_notes_screen.dart';

class ReminderCalendarScreen extends StatefulWidget {
  const ReminderCalendarScreen({super.key});

  @override
  State<ReminderCalendarScreen> createState() => _ReminderCalendarScreenState();
}

class _ReminderCalendarScreenState extends State<ReminderCalendarScreen> {
  final DateTime _today = DateUtils.dateOnly(DateTime.now());
  late DateTime _selected = _today;
  bool _showDemo = true;
  late DateTime _month = DateTime(_selected.year, _selected.month);

  void _changeMonth(int offset) {
    setState(() {
      _month = DateTime(_month.year, _month.month + offset);
      _selected = _month;
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
    final reminders = <DateTime, List<CustomerNote>>{};
    for (final task in context.watch<CustomerNoteService>().pendingFollowUps) {
      final customer = customers.findById(task.customerId);
      final day = _reminderDay(task);
      if (day != null &&
          customer != null &&
          session.canAccessRegion(customer.region)) {
        (reminders[day] ??= []).add(task);
      }
    }
    final demoReminders = _showDemo
        ? {
            _today: ['Call customer to confirm the showroom visit'],
            DateTime(_today.year, _today.month, _today.day + 2): [
              'Follow up on the flooring quote',
              'Confirm the sample board delivery',
            ],
            DateTime(_today.year, _today.month, _today.day + 5): [
              'Check whether the payment was received',
            ],
          }
        : const <DateTime, List<String>>{};
    final demoForDay = demoReminders[_selected] ?? const <String>[];
    final highlightedDays = {...reminders.keys, ...demoReminders.keys};
    final visible = reminders[_selected] ?? const <CustomerNote>[];
    final localizations = MaterialLocalizations.of(context);
    final start = DateUtils.firstDayOffset(
      _month.year,
      _month.month,
      localizations,
    );
    final days = DateUtils.getDaysInMonth(_month.year, _month.month);

    return Scaffold(
      appBar: AppBar(title: const Text('Calendar')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Demo reminders'),
            value: _showDemo,
            onChanged: (value) => setState(() => _showDemo = value),
          ),
          Row(
            children: [
              IconButton(
                tooltip: 'Previous month',
                onPressed: () => _changeMonth(-1),
                icon: const Icon(Icons.chevron_left),
              ),
              Expanded(
                child: Text(
                  DateFormat.yMMMM().format(_month),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              IconButton(
                tooltip: 'Next month',
                onPressed: () => _changeMonth(1),
                icon: const Icon(Icons.chevron_right),
              ),
            ],
          ),
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
          GridView.count(
            crossAxisCount: 7,
            childAspectRatio: 1.05,
            mainAxisSpacing: 3,
            crossAxisSpacing: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              for (var index = 0; index < start; index++) const SizedBox(),
              for (var day = 1; day <= days; day++)
                _dayCell(
                  DateTime(_month.year, _month.month, day),
                  highlightedDays,
                ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            DateFormat.yMMMMd().format(_selected),
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          if (visible.isEmpty && demoForDay.isEmpty)
            const Text('No reminders for this date.'),
          for (final reminder in demoForDay)
            _reminderCard(title: reminder, subtitle: 'Demo', demo: true),
          for (final task in visible)
            _reminderCard(
              title: task.content,
              subtitle: customers.findById(task.customerId)!.businessName,
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => CustomerNotesScreen(
                    customer: customers.findById(task.customerId)!,
                  ),
                ),
              ),
            ),
        ],
      ),
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

  Widget _dayCell(DateTime day, Set<DateTime> highlightedDays) {
    final selected = day == _selected;
    final hasReminder = highlightedDays.contains(day);
    return Semantics(
      selected: selected,
      label:
          '${DateFormat.yMMMMd().format(day)}${hasReminder ? ', has reminders' : ''}',
      child: Material(
        color: hasReminder ? AppColors.copperLight : Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: selected
              ? const BorderSide(color: AppColors.green, width: 2)
              : BorderSide.none,
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: () => setState(() => _selected = day),
          child: Center(
            child: Text(
              '${day.day}',
              semanticsLabel: "",
              style: TextStyle(
                color: hasReminder ? AppColors.copper : AppColors.text,
                fontWeight: hasReminder || selected
                    ? FontWeight.bold
                    : FontWeight.normal,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
