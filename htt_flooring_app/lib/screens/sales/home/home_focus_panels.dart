import '../more/sales_more_screen.dart';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../models/customer_note.dart';
import '../customers/customer_directory_data.dart';
import '../customers/customers_screen.dart';
import 'sales_dashboard_support.dart';

class HomeTaskPreview extends StatelessWidget {
  const HomeTaskPreview({super.key, required this.data});
  final SalesDashboardData data;
  @override
  Widget build(BuildContext context) {
    final demo =
        data.sample &&
        data.tasks.every((t) => t.id.startsWith('sample-dashboard-'));
    final samples = [
      (
        'ABC Flooring',
        'Payment',
        'INV-10548 due today (\$8,682.96 incl. GST)',
        0,
      ),
      (
        'Deliver Heritage swatches (Natural Oak, White Oak)',
        'Swatches',
        'follow-up',
        1,
      ),
      ('Follow up QT-1003 — Hornsby townhouses', 'Quote', 'follow-up', 2),
      (
        'INV-10145 overdue 83 days — account on hold',
        'Payment',
        'follow-up',
        0,
      ),
    ];
    final tasks = data.due.take(4).toList();
    final count = demo ? 4 : tasks.length;
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                '${data.due.length} due today · showing $count',
                style: const TextStyle(fontSize: 11, color: Color(0xFF65716C)),
              ),
            ),
            TextButton(
              onPressed: () => dashboardOpen(context, const SalesTasksScreen()),
              child: const Text(
                'View all  ›',
                style: TextStyle(fontSize: 12, color: Color(0xFF087D46)),
              ),
            ),
          ],
        ),
        Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: const Color(0xFFE5EAE7)),
            borderRadius: BorderRadius.circular(15),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0B000000),
                blurRadius: 3,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              if (count == 0)
                const Padding(
                  padding: EdgeInsets.all(20),
                  child: Text(
                    'No tasks due today',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              for (var i = 0; i < count; i++)
                Builder(
                  builder: (context) {
                    final t = tasks.isEmpty
                        ? data.tasks[i]
                        : tasks[i % tasks.length];
                    final name = demo
                        ? samples[i].$1
                        : data.customer(t.customerId)?.businessName ??
                              'General task';
                    final type = demo
                        ? samples[i].$2
                        : t.followUpType ?? 'Follow-up';
                    final subtitle = demo ? samples[i].$3 : t.content;
                    final kind = demo ? samples[i].$4 : 2;
                    final color = kind == 0
                        ? const Color(0xFFAE6A00)
                        : kind == 1
                        ? const Color(0xFF7540CC)
                        : const Color(0xFF176BDF);
                    return Material(
                      color: Colors.white,
                      child: InkWell(
                        onTap: () => dashboardOpen(
                          context,
                          DashboardTaskDetail(
                            task: demo
                                ? CustomerNote(
                                    id: t.id,
                                    customerId: t.customerId,
                                    type: CustomerNoteType.followUp,
                                    content: '$name · $subtitle',
                                    createdAt: t.createdAt,
                                    followUpDate: t.followUpDate,
                                    followUpType: type,
                                    assignees: t.assignees,
                                  )
                                : t,
                          ),
                        ),
                        child: Container(
                          decoration: const BoxDecoration(
                            border: Border(
                              bottom: BorderSide(color: Color(0xFFF0F2F0)),
                            ),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 12,
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: .10),
                                  borderRadius: BorderRadius.circular(9),
                                ),
                                child: Center(
                                  child: kind == 0
                                      ? Text(
                                          r'$',
                                          style: TextStyle(
                                            fontSize: 17,
                                            color: color,
                                          ),
                                        )
                                      : DashboardIcon(
                                          kind == 1
                                              ? Icons.inventory_2_outlined
                                              : Icons.description_outlined,
                                          size: 16,
                                          color: color,
                                        ),
                                ),
                              ),
                              const SizedBox(width: 11),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      name,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        height: 1.4,
                                      ),
                                    ),
                                    Text.rich(
                                      TextSpan(
                                        children: [
                                          TextSpan(
                                            text: type,
                                            style: TextStyle(
                                              color: color,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                          TextSpan(text: ' · $subtitle'),
                                        ],
                                      ),
                                      style: const TextStyle(
                                        fontSize: 11.5,
                                        height: 1.4,
                                        color: Color(0xFF65716C),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 9),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE4F2EA),
                                  borderRadius: BorderRadius.circular(7),
                                ),
                                child: const Text(
                                  'Today',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: dashboardGreen,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class HomeAttentionPreview extends StatelessWidget {
  const HomeAttentionPreview({super.key, required this.data});
  final CustomerDirectoryData data;
  @override
  Widget build(BuildContext context) => Column(
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '${data.filtered(CustomerListFilter.attention).length} customers',
            style: const TextStyle(fontSize: 11, color: Color(0xFF65716C)),
          ),
          TextButton(
            onPressed: () => dashboardOpen(
              context,
              const CustomersScreen(
                initialFilter: CustomerListFilter.attention,
                showBack: true,
              ),
            ),
            child: const Text(
              'Open  ›',
              style: TextStyle(fontSize: 12, color: Color(0xFF087D46)),
            ),
          ),
        ],
      ),
      Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE5EAE7)),
          borderRadius: BorderRadius.circular(15),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0B000000),
              blurRadius: 3,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            for (final row in [
              (
                'Overdue payment',
                '${NumberFormat.currency(symbol: r'$', decimalDigits: 0).format(data.overdueTotal)} overdue',
                data.rows.where((r) => r.overdue > 0).length,
                Icons.attach_money,
                'payment',
              ),
              (
                'On hold',
                'Orders blocked',
                data.rows.where((r) => r.onHold).length,
                Icons.lock_outline,
                'hold',
              ),
              (
                'No recent visit',
                'A 14 · B 30 · C 60 days',
                data.rows.where((r) => r.noRecentVisit).length,
                Icons.location_on_outlined,
                'visit',
              ),
            ])
              Material(
                color: Colors.white,
                child: InkWell(
                  onTap: () => dashboardOpen(
                    context,
                    CustomersScreen(
                      initialFilter: CustomerListFilter.attention,
                      showBack: true,
                      initialAttentionGroup: row.$5,
                    ),
                  ),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 12,
                    ),
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Color(0xFFF0F2F0)),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFECF0),
                            borderRadius: BorderRadius.circular(9),
                          ),
                          child: row.$4 == Icons.attach_money
                              ? const Center(
                                  child: Text(
                                    r'$',
                                    style: TextStyle(
                                      fontSize: 17,
                                      color: Color(0xFFDE1843),
                                    ),
                                  ),
                                )
                              : Icon(
                                  row.$4,
                                  size: 16,
                                  color: const Color(0xFFDE1843),
                                ),
                        ),
                        const SizedBox(width: 11),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                row.$1,
                                style: const TextStyle(fontSize: 13),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                row.$2,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF65716C),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFE7E8),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${row.$3}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFCE2025),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Icon(Icons.chevron_right, size: 16),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    ],
  );
}
