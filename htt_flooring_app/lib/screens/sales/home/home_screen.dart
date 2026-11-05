import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../models/customer.dart';
import '../../../models/customer_note.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/customer_location_service.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';

import '../customers/customer_map_screen.dart';
import '../customers/customer_detail_screen.dart';
import '../customers/customer_notes_screen.dart';
import '../customers/sales_visit_screen.dart';
import '../quote/select_customer_screen.dart';

import 'customer_alerts_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.onNavigateToTab});

  final ValueChanged<int> onNavigateToTab;

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();

    final customerService = context.watch<CustomerService>();

    final appSession = context.watch<AppSession>();
    final userId = appSession.currentUser.id;
    final notes = context.watch<CustomerNoteService>();
    final locations = context.watch<CustomerLocationService>();
    final today = DateUtils.dateOnly(DateTime.now());
    final tasks = [
      for (final task in notes.pendingFollowUps)
        if (task.assignees.any((user) => user.id == userId))
          if (customerService.findById(task.customerId) case final customer?)
            if (!customer.archived && session.canAccessRegion(customer.region))
              (task: task, customer: customer),
    ];
    final dueToday = tasks
        .where(
          (entry) =>
              DateUtils.isSameDay(entry.task.followUpDate?.toLocal(), today),
        )
        .toList();
    final overdue = tasks
        .where(
          (entry) =>
              entry.task.followUpDate?.toLocal().isBefore(today) ?? false,
        )
        .toList();
    final visits = dueToday
        .where((entry) => entry.task.followUpType == 'Customer Visit')
        .toList();
    final visitReminders = <({Customer customer, int days, bool demo})>[];
    final calendarToday = DateTime.utc(today.year, today.month, today.day);
    for (final customer in customerService.customers) {
      if (customer.archived || !session.canAccessRegion(customer.region)) {
        continue;
      }
      final lastVisit = notes
          .getCustomerNotes(customer.id)
          .where(
            (note) => !note.isFollowUp && note.noteType == 'Customer Visit',
          )
          .firstOrNull
          ?.createdAt
          .toLocal();
      final days = lastVisit == null
          ? (appSession.employeeAccessToken?.isNotEmpty == true
                ? null
                : locations.demoDaysSinceVisit(customer.id))
          : calendarToday
                .difference(
                  DateTime.utc(lastVisit.year, lastVisit.month, lastVisit.day),
                )
                .inDays;
      if (days != null && days >= 30) {
        visitReminders.add((
          customer: customer,
          days: days,
          demo: lastVisit == null,
        ));
      }
    }
    visitReminders.sort((a, b) => b.days.compareTo(a.days));
    Widget reminderTile(({Customer customer, int days, bool demo}) entry) {
      return InkWell(
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute(
            builder: (_) => CustomerDetailScreen(customer: entry.customer),
          ),
        ),
        child: _dashboardStatusTile(
          entry.customer.businessName,
          entry.demo ? 'Last visit · Demo' : 'Last visit',
          Icons.location_on_outlined,
          status: '${entry.days} days ago',
        ),
      );
    }

    void openVisitReminders() {
      Navigator.of(context).push<void>(
        MaterialPageRoute(
          builder: (_) => Scaffold(
            appBar: AppBar(title: const Text('Due for Visit')),
            body: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                for (final entry in visitReminders) reminderTile(entry),
                if (visitReminders.isEmpty)
                  const Text(
                    'No customers with a recorded visit 30 or more days ago.',
                  ),
              ],
            ),
          ),
        ),
      );
    }

    final showDemo = tasks.isEmpty;
    final taskPreviews = [
      ...dueToday,
      ...overdue,
      ...tasks.where(
        (entry) => !dueToday.contains(entry) && !overdue.contains(entry),
      ),
    ].take(3);

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: AppColors.darkGreen,
        title: const Row(
          children: [
            Icon(Icons.layers_outlined, color: Colors.white, size: 23),
            SizedBox(width: 6),
            Flexible(
              child: Text(
                'HTT Flooring CRM',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: 'sans-serif',
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Customer Alerts',
            icon: const Icon(Icons.notifications_none, color: Colors.white),
            onPressed: () => Navigator.of(context).push<void>(
              MaterialPageRoute(builder: (_) => const CustomerAlertsScreen()),
            ),
          ),
          IconButton(
            tooltip: 'Profile',
            icon: const Icon(
              Icons.account_circle_outlined,
              color: Colors.white,
            ),
            onPressed: () => onNavigateToTab(4),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            spacing: 8,
            runSpacing: 4,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Good morning,'),
                  Text(
                    session.salespersonName,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Text(
                    '${session.regionName} Store',
                    style: const TextStyle(color: AppColors.copper),
                  ),
                ],
              ),
              ActionChip(
                avatar: const Icon(Icons.calendar_today_outlined, size: 16),
                label: Text(DateFormat('EEE, d MMM yyyy').format(today)),
                onPressed: () => onNavigateToTab(3),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _panel(
            Row(
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('My Sales (MTD) · Demo'),
                      Text(
                        r'$42,580',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        '+18.6% vs last month',
                        style: TextStyle(
                          color: AppColors.success,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Target'),
                    Text(
                      r'$65,000',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(width: 10),
                const SizedBox.square(
                  dimension: 44,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      CircularProgressIndicator(
                        value: 0.655,
                        color: AppColors.success,
                        backgroundColor: AppColors.border,
                        strokeWidth: 4,
                      ),
                      Text(
                        '66%',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          _dashboardGrid([
            _summaryCard(
              icon: Icons.event_available_outlined,
              title: 'Due Today',
              value: '${showDemo ? 3 : dueToday.length}',
              color: AppColors.copper,
              tint: AppColors.warningLight,
              onTap: () => _openTaskList(context, 'Due Today', dueToday),
            ),
            _summaryCard(
              icon: Icons.warning_amber_rounded,
              title: 'Overdue',
              value: '${showDemo ? 2 : overdue.length}',
              color: AppColors.danger,
              tint: AppColors.dangerLight,
              onTap: () => _openTaskList(context, 'Overdue', overdue),
            ),
            _summaryCard(
              icon: Icons.calendar_today_outlined,
              title: 'Today’s Visits',
              value: '${showDemo ? 2 : visits.length}',
              color: AppColors.success,
              tint: AppColors.successLight,
              onTap: () => onNavigateToTab(3),
            ),
            _summaryCard(
              icon: Icons.people_outline,
              title: 'Due for Visit',
              value: '${visitReminders.length}',
              color: const Color(0xFF1659A3),
              tint: const Color(0xFFE4EEF9),
              onTap: openVisitReminders,
            ),
          ], maxColumns: 4),
          const SizedBox(height: 12),
          _dashboardCard(
            title:
                'Customers Not Visited in 30+ Days (${visitReminders.length})',
            action: 'View All',
            onAction: openVisitReminders,
            children: [
              if (visitReminders.isEmpty)
                const Text(
                  'No customers with a recorded visit 30 or more days ago.',
                  style: TextStyle(color: AppColors.muted, fontSize: 13),
                ),
              for (final entry in visitReminders.take(3)) reminderTile(entry),
            ],
          ),
          const SizedBox(height: 12),
          _dashboardCard(
            title: showDemo ? 'My Tasks · Demo' : 'My Tasks (${tasks.length})',
            action: 'View All',
            onAction: () => _openTaskList(context, 'My Tasks', tasks),
            children: [
              if (showDemo) ...[
                _dashboardStatusTile(
                  'Payment Follow-up',
                  'ABC Flooring · INV-10548 (AUD 8,750)',
                  Icons.schedule,
                  status: 'Due Today',
                ),
                _dashboardStatusTile(
                  'Sample Delivery',
                  'City Timber Floors · Heritage samples',
                  Icons.local_shipping_outlined,
                  status: 'Today',
                  color: AppColors.success,
                  tint: AppColors.successLight,
                ),
                _dashboardStatusTile(
                  'Quotation Follow-up',
                  'Northern Floors · New project',
                  Icons.warning_amber_rounded,
                  status: 'Overdue',
                  color: AppColors.danger,
                  tint: AppColors.dangerLight,
                ),
              ],
              for (final preview in taskPreviews)
                _taskTile(context, preview, Icons.pending_actions_outlined),
            ],
          ),
          const SizedBox(height: 12),
          _dashboardCard(
            title: showDemo
                ? 'Today’s Visits (2) · Demo'
                : 'Today’s Visits (${visits.length})',
            action: 'View Calendar',
            onAction: () => onNavigateToTab(3),
            children: [
              if (showDemo) ...[
                _visitTile(
                  context,
                  'ABC Flooring',
                  '15 George Street, Sydney',
                  '10:30 AM',
                  customer: customerService.customers
                      .where(
                        (customer) =>
                            customer.businessName == 'ABC Flooring' &&
                            session.canAccessRegion(customer.region),
                      )
                      .firstOrNull,
                ),
                const Divider(height: 1),
                _visitTile(
                  context,
                  'City Timber Floors',
                  '88 Victoria Road, Parramatta',
                  '2:00 PM',
                ),
              ],
              if (!showDemo && visits.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 8),
                  child: Text(
                    'No visits scheduled today',
                    style: TextStyle(color: AppColors.muted, fontSize: 13),
                  ),
                ),
              for (final visit in visits)
                _visitTile(
                  context,
                  visit.customer.businessName,
                  visit.customer.address,
                  'Today',
                  customer: visit.customer,
                  onTap: () => _openTask(context, visit),
                ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Quick Access',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 10),
          _dashboardGrid([
            _quickAction(
              icon: Icons.location_on_outlined,
              title: 'Check In',
              onTap: () => Navigator.of(context).push<void>(
                MaterialPageRoute(builder: (_) => const SalesVisitScreen()),
              ),
            ),
            _quickAction(
              icon: Icons.people_outline,
              title: 'Find Customers',
              onTap: () => onNavigateToTab(1),
            ),
            _quickAction(
              icon: Icons.inventory_2_outlined,
              title: 'Inventory Lookup',
              onTap: () => onNavigateToTab(2),
            ),
            _quickAction(
              icon: Icons.edit_outlined,
              title: 'Add Note',
              onTap: () => _addActivity(context, followUp: false),
            ),
            _quickAction(
              icon: Icons.event_available_outlined,
              title: 'Add Follow-up',
              onTap: () => _addActivity(context, followUp: true),
            ),
            _quickAction(
              icon: Icons.location_searching,
              title: 'Nearby Customers',
              onTap: () => Navigator.of(context).push<void>(
                MaterialPageRoute(
                  builder: (_) =>
                      const CustomerMapScreen(initialDistanceKm: 20),
                ),
              ),
            ),
          ], maxColumns: 3),
        ],
      ),
    );
  }

  void _openTaskList(
    BuildContext context,
    String title,
    List<({CustomerNote task, Customer customer})> tasks,
  ) {
    Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: tasks.isEmpty
              ? const Center(child: Text('No tasks to show'))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: tasks.length,
                  separatorBuilder: (_, _) => const Divider(),
                  itemBuilder: (context, index) => _taskTile(
                    context,
                    tasks[index],
                    Icons.event_note_outlined,
                  ),
                ),
        ),
      ),
    );
  }

  Widget _taskTile(
    BuildContext context,
    ({CustomerNote task, Customer customer}) entry,
    IconData icon,
  ) {
    final due = entry.task.followUpDate?.toLocal();
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: AppColors.copper, size: 20),
      title: Text(
        entry.customer.businessName,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
      ),
      subtitle: Text(
        [
          entry.task.followUpType ?? entry.task.content,
          if (due != null) DateFormat('d MMM yyyy').format(due),
        ].join(' · '),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => Navigator.of(context).push<void>(
        MaterialPageRoute(
          builder: (_) =>
              FollowUpDetail(customer: entry.customer, taskId: entry.task.id),
        ),
      ),
    );
  }

  void _openTask(
    BuildContext context,
    ({CustomerNote task, Customer customer}) entry,
  ) {
    Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) =>
            FollowUpDetail(customer: entry.customer, taskId: entry.task.id),
      ),
    );
  }

  Widget _dashboardStatusTile(
    String title,
    String subtitle,
    IconData icon, {
    required String status,
    Color color = AppColors.copper,
    Color tint = AppColors.warningLight,
  }) {
    return Column(
      children: [
        const Divider(height: 1),
        IntrinsicHeight(
          child: Row(
            children: [
              Container(
                width: 3,
                margin: const EdgeInsets.symmetric(vertical: 6),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 6),
              _iconBadge(icon, color, tint),
              const SizedBox(width: 7),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 7),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(subtitle, style: const TextStyle(fontSize: 11)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 4),
              _statusBadge(status, color, tint),
            ],
          ),
        ),
      ],
    );
  }

  Widget _iconBadge(IconData icon, Color color, Color tint) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: tint,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(5),
        child: Icon(icon, color: color, size: 19),
      ),
    );
  }

  Widget _statusBadge(String label, Color color, Color tint) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: tint,
        borderRadius: BorderRadius.circular(9),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 3),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontSize: 10,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  Widget _visitTile(
    BuildContext context,
    String title,
    String address,
    String time, {
    Customer? customer,
    VoidCallback? onTap,
  }) {
    final contacts = customer == null
        ? []
        : context.read<CustomerService>().getContactsForCustomer(customer.id);
    final phone = (customer?.companyPhone.trim().isNotEmpty ?? false)
        ? customer!.companyPhone
        : contacts
                  .where((contact) => contact.phone.trim().isNotEmpty)
                  .firstOrNull
                  ?.phone ??
              '';
    final number = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    return Row(
      children: [
        _statusBadge(time, AppColors.green, AppColors.successLight),
        const SizedBox(width: 6),
        const Icon(Icons.circle, size: 7, color: AppColors.green),
        const SizedBox(width: 6),
        Expanded(
          child: InkWell(
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  if (address.isNotEmpty)
                    Text(address, style: const TextStyle(fontSize: 11)),
                ],
              ),
            ),
          ),
        ),
        IconButton(
          tooltip: 'Call',
          visualDensity: VisualDensity.compact,
          icon: const Icon(Icons.phone_outlined, size: 17),
          onPressed: number.isEmpty
              ? null
              : () async {
                  final opened = await launchUrl(
                    Uri(scheme: 'tel', path: number),
                  );
                  if (!opened && context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Unable to open the phone app.'),
                      ),
                    );
                  }
                },
        ),
        IconButton.filled(
          tooltip: 'Open customer map',
          visualDensity: VisualDensity.compact,
          icon: const Icon(Icons.near_me_outlined, size: 17),
          onPressed: customer == null
              ? null
              : () => Navigator.of(context).push<void>(
                  MaterialPageRoute(
                    builder: (_) => CustomerMapScreen(customerId: customer.id),
                  ),
                ),
        ),
      ],
    );
  }

  Widget _dashboardCard({
    required String title,
    required String action,
    required VoidCallback onAction,
    required List<Widget> children,
  }) {
    return _panel(
      Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              TextButton(
                onPressed: onAction,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(action),
                    const Icon(Icons.chevron_right, size: 16),
                  ],
                ),
              ),
            ],
          ),
          ...children,
        ],
      ),
    );
  }

  Widget _dashboardGrid(List<Widget> cards, {required int maxColumns}) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const gap = 8.0;
        final columns = ((constraints.maxWidth + gap) / 72).floor().clamp(
          1,
          maxColumns,
        );
        final width = (constraints.maxWidth - gap * (columns - 1)) / columns;
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: [
            for (final card in cards) SizedBox(width: width, child: card),
          ],
        );
      },
    );
  }

  Future<void> _addActivity(
    BuildContext context, {
    required bool followUp,
  }) async {
    final customer = await Navigator.of(context).push<Customer>(
      MaterialPageRoute(builder: (_) => const SelectCustomerScreen()),
    );
    if (!context.mounted || customer == null) return;
    await Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => followUp
            ? AddFollowUpScreen(customer: customer)
            : AddNoteScreen(customer: customer),
      ),
    );
  }

  Widget _summaryCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
    required Color tint,
    required VoidCallback onTap,
  }) {
    return _panel(
      Column(
        children: [
          _iconBadge(icon, color, tint),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800),
          ),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11),
          ),
        ],
      ),
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 8),
    );
  }

  Widget _panel(
    Widget child, {
    VoidCallback? onTap,
    EdgeInsets padding = const EdgeInsets.all(12),
  }) {
    return Material(
      color: AppColors.card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(padding: padding, child: child),
      ),
    );
  }

  Widget _quickAction({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 80),
        padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 9),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Icon(icon, color: AppColors.green, size: 25),
            const SizedBox(height: 6),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.text,
                fontSize: 12,
                height: 1.2,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
