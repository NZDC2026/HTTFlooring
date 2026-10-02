import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../data/mock_data.dart';
import '../models/customer.dart';
import '../models/customer_note.dart';
import '../services/customer_note_service.dart';
import '../services/quote_service.dart';
import '../services/sales_session.dart';
import '../services/sales_document_service.dart';
import '../theme/app_theme.dart';
import '../widgets/metric_card.dart';
import 'customer_notes_screen.dart';
import 'quote_screen.dart';
import 'select_customer_screen.dart';

class HomeScreen extends StatelessWidget {
  final ValueChanged<int> onNavigateToTab;

  const HomeScreen({super.key, required this.onNavigateToTab});

  Future<void> _startNewQuote(BuildContext context) async {
    final quote = context.read<QuoteService>();

    if (quote.hasItems) {
      final shouldStartNew = await showDialog<bool>(
        context: context,
        builder: (dialogContext) {
          return AlertDialog(
            title: const Text('Start new quote?'),
            content: const Text(
              'You already have an unfinished quote. '
              'Starting a new quote will discard it.',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(dialogContext, false);
                },
                child: const Text('Cancel'),
              ),
              FilledButton(
                onPressed: () {
                  Navigator.pop(dialogContext, true);
                },
                child: const Text('Start New'),
              ),
            ],
          );
        },
      );

      if (shouldStartNew != true) {
        return;
      }
    }

    quote.clear();

    if (!context.mounted) {
      return;
    }

    final customer = await Navigator.push<Customer>(
      context,
      MaterialPageRoute(builder: (_) => const SelectCustomerScreen()),
    );

    if (customer == null || !context.mounted) {
      return;
    }

    quote.selectCustomer(customer);

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const QuoteScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();

    final noteService = context.watch<CustomerNoteService>();

    final documentService = context.watch<SalesDocumentService>();

    final regionCustomers = customers
        .where((customer) => session.canAccessRegion(customer.region))
        .toList();

    final dueFollowUps = _getDueFollowUps(
      noteService.pendingFollowUps,
      session,
    );

    final overdueSummary = _getOverdueSummary(documentService, session);

    final monthlySales = _getMonthlySales(documentService, session);

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const SizedBox(height: 15),

          const Text(
            'Good morning,',
            style: TextStyle(fontFamily: 'serif', fontSize: 29),
          ),

          Text(
            session.salespersonName,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 34,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: 6),

          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 17),

              const SizedBox(width: 5),

              Text(
                '${session.regionName} Sales',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),

              const SizedBox(width: 5),

              const Icon(Icons.lock_outline, size: 14),
            ],
          ),

          const SizedBox(height: 25),

          Row(
            children: [
              Expanded(
                child: MetricCard(
                  label: 'Customers',
                  value: regionCustomers.length.toString(),
                  caption: session.regionName,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: MetricCard(
                  label: 'Follow Up',
                  value: dueFollowUps.length.toString(),
                  caption: 'Due Today',
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: MetricCard(
                  label: 'Sales This Month',
                  value:
                      '\$${NumberFormat('#,##0.00').format(monthlySales.amount)}',
                  caption:
                      '${monthlySales.orderCount} '
                      '${monthlySales.orderCount == 1 ? 'Order' : 'Orders'}',
                ),
              ),

              SizedBox(width: 12),

              Expanded(
                child: MetricCard(
                  label: 'Overdue Accounts',
                  value:
                      '\$${NumberFormat('#,##0.00').format(overdueSummary.amount)}',
                  caption:
                      '${overdueSummary.customerCount} '
                      '${overdueSummary.customerCount == 1 ? 'Customer' : 'Customers'}',
                  danger: overdueSummary.amount > 0,
                ),
              ),
            ],
          ),

          const SizedBox(height: 30),

          const Text(
            'Quick Access',
            style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
          ),

          const SizedBox(height: 12),

          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            childAspectRatio: 2.3,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            children: [
              _buildQuickAction(
                Icons.people_outline,
                'Customers',
                onTap: () {
                  onNavigateToTab(1);
                },
              ),

              _buildQuickAction(
                Icons.inventory_2_outlined,
                'Inventory',
                onTap: () {
                  onNavigateToTab(2);
                },
              ),

              _buildQuickAction(
                Icons.description_outlined,
                'New Quote',
                onTap: () {
                  _startNewQuote(context);
                },
              ),

              _buildQuickAction(Icons.sell_outlined, 'Pricing'),

              _buildQuickAction(
                Icons.document_scanner_outlined,
                'Scan Business Card',
              ),

              _buildQuickAction(Icons.location_on_outlined, 'Map View'),
            ],
          ),

          const SizedBox(height: 30),

          Row(
            children: [
              const Expanded(
                child: Text(
                  "Today's Follow-ups",
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                ),
              ),

              if (dueFollowUps.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 9,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.copperLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    dueFollowUps.length.toString(),
                    style: const TextStyle(
                      color: AppColors.copper,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 12),

          if (dueFollowUps.isEmpty)
            const _NoFollowUpsCard()
          else
            ...dueFollowUps.map(
              (note) => _FollowUpCard(note: note, session: session),
            ),

          const SizedBox(height: 20),
        ],
      ),
    );
  }

  List<CustomerNote> _getDueFollowUps(
    List<CustomerNote> followUps,
    SalesSession session,
  ) {
    final now = DateTime.now();

    final today = DateTime(now.year, now.month, now.day);

    final results = followUps.where((note) {
      if (note.followUpDate == null) {
        return false;
      }

      Customer? customer;

      for (final item in customers) {
        if (item.id == note.customerId) {
          customer = item;
          break;
        }
      }

      if (customer == null) {
        return false;
      }

      if (!session.canAccessRegion(customer.region)) {
        return false;
      }

      final followUpDate = DateTime(
        note.followUpDate!.year,
        note.followUpDate!.month,
        note.followUpDate!.day,
      );

      return !followUpDate.isAfter(today);
    }).toList();

    results.sort((a, b) {
      final aDate = a.followUpDate!;
      final bDate = b.followUpDate!;

      return aDate.compareTo(bDate);
    });

    return results;
  }

  _OverdueSummary _getOverdueSummary(
    SalesDocumentService documentService,
    SalesSession session,
  ) {
    double totalAmount = 0;

    final overdueCustomerIds = <String>{};

    for (final invoice in documentService.overdueInvoices) {
      if (!session.canAccessRegion(invoice.customer.region)) {
        continue;
      }

      totalAmount += invoice.balanceDue;

      overdueCustomerIds.add(invoice.customer.id);
    }

    return _OverdueSummary(
      amount: totalAmount,
      customerCount: overdueCustomerIds.length,
    );
  }

  _MonthlySalesSummary _getMonthlySales(
    SalesDocumentService documentService,
    SalesSession session,
  ) {
    final now = DateTime.now();

    double totalAmount = 0;
    int orderCount = 0;

    for (final document in documentService.documents) {
      final orderDate = document.convertedToOrderAt;

      if (orderDate == null) {
        continue;
      }

      if (!session.canAccessRegion(document.customer.region)) {
        continue;
      }

      final isCurrentMonth =
          orderDate.year == now.year && orderDate.month == now.month;

      if (!isCurrentMonth) {
        continue;
      }

      totalAmount += document.total;
      orderCount++;
    }

    return _MonthlySalesSummary(amount: totalAmount, orderCount: orderCount);
  }

  Widget _buildQuickAction(IconData icon, String title, {VoidCallback? onTap}) {
    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              SizedBox(width: 34, child: Center(child: Icon(icon, size: 24))),

              const SizedBox(width: 10),

              Expanded(
                child: Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.visible,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    height: 1.15,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OverdueSummary {
  final double amount;
  final int customerCount;

  const _OverdueSummary({required this.amount, required this.customerCount});
}

class _MonthlySalesSummary {
  final double amount;
  final int orderCount;

  const _MonthlySalesSummary({required this.amount, required this.orderCount});
}

class _FollowUpCard extends StatelessWidget {
  final CustomerNote note;
  final SalesSession session;

  const _FollowUpCard({required this.note, required this.session});

  @override
  Widget build(BuildContext context) {
    final noteService = context.read<CustomerNoteService>();

    final customer = _findCustomer(note.customerId);

    final overdue = _isOverdue(note);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: customer == null
              ? null
              : () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CustomerNotesScreen(customer: customer),
                    ),
                  );
                },
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: overdue ? AppColors.danger : AppColors.border,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: overdue
                        ? AppColors.dangerLight
                        : AppColors.copperLight,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Icon(
                    overdue
                        ? Icons.warning_amber_rounded
                        : Icons.event_outlined,
                    color: overdue ? AppColors.danger : AppColors.copper,
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              customer?.businessName ?? 'Customer',
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),

                          _FollowUpStatusBadge(note: note),
                        ],
                      ),

                      const SizedBox(height: 5),

                      Text(
                        note.content,
                        style: const TextStyle(
                          color: AppColors.text,
                          fontSize: 13,
                          height: 1.35,
                        ),
                      ),

                      const SizedBox(height: 8),

                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today_outlined,
                            size: 13,
                            color: overdue ? AppColors.danger : AppColors.muted,
                          ),

                          const SizedBox(width: 5),

                          Expanded(
                            child: Text(
                              _dateText(note),
                              style: TextStyle(
                                color: overdue
                                    ? AppColors.danger
                                    : AppColors.muted,
                                fontSize: 11,
                                fontWeight: overdue
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 10),

                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            noteService.completeFollowUp(note.id);
                          },
                          icon: const Icon(Icons.check, size: 16),
                          label: const Text('Mark Done'),
                        ),
                      ),
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

  Customer? _findCustomer(String customerId) {
    for (final customer in customers) {
      if (customer.id == customerId &&
          session.canAccessRegion(customer.region)) {
        return customer;
      }
    }

    return null;
  }

  bool _isOverdue(CustomerNote note) {
    if (note.followUpDate == null) {
      return false;
    }

    final now = DateTime.now();

    final today = DateTime(now.year, now.month, now.day);

    final date = DateTime(
      note.followUpDate!.year,
      note.followUpDate!.month,
      note.followUpDate!.day,
    );

    return date.isBefore(today);
  }

  String _dateText(CustomerNote note) {
    if (note.followUpDate == null) {
      return 'No date';
    }

    final now = DateTime.now();

    final today = DateTime(now.year, now.month, now.day);

    final date = DateTime(
      note.followUpDate!.year,
      note.followUpDate!.month,
      note.followUpDate!.day,
    );

    final difference = today.difference(date).inDays;

    if (difference == 0) {
      return 'Today';
    }

    if (difference == 1) {
      return 'Yesterday · 1 day overdue';
    }

    if (difference > 1) {
      return '${DateFormat('dd MMM').format(date)} · '
          '$difference days overdue';
    }

    return DateFormat('dd MMM yyyy').format(date);
  }
}

class _FollowUpStatusBadge extends StatelessWidget {
  final CustomerNote note;

  const _FollowUpStatusBadge({required this.note});

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();

    final today = DateTime(now.year, now.month, now.day);

    final date = note.followUpDate == null
        ? today
        : DateTime(
            note.followUpDate!.year,
            note.followUpDate!.month,
            note.followUpDate!.day,
          );

    final overdue = date.isBefore(today);

    final label = overdue ? 'OVERDUE' : 'TODAY';

    final foreground = overdue ? AppColors.danger : AppColors.copper;

    final background = overdue ? AppColors.dangerLight : AppColors.copperLight;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: foreground,
          fontSize: 9,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _NoFollowUpsCard extends StatelessWidget {
  const _NoFollowUpsCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: const Column(
        children: [
          Icon(Icons.check_circle_outline, size: 32, color: AppColors.success),

          SizedBox(height: 9),

          Text('All caught up', style: TextStyle(fontWeight: FontWeight.w700)),

          SizedBox(height: 4),

          Text(
            'No customer follow-ups are due today.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
