import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../models/sales_document.dart';
import '../../../services/sales_document_service.dart';
import '../../../theme/app_theme.dart';
import '../orders/sales_document_detail_screen.dart';

enum _InvoiceFilter { all, outstanding, overdue, paid }

class CustomerInvoicesScreen extends StatefulWidget {
  final Customer customer;

  const CustomerInvoicesScreen({super.key, required this.customer});

  @override
  State<CustomerInvoicesScreen> createState() => _CustomerInvoicesScreenState();
}

class _CustomerInvoicesScreenState extends State<CustomerInvoicesScreen> {
  _InvoiceFilter _filter = _InvoiceFilter.all;

  @override
  Widget build(BuildContext context) {
    final service = context.watch<SalesDocumentService>();

    final invoices = service.getCustomerInvoices(widget.customer.id)
      ..sort((a, b) {
        final aDate = a.invoiceDate ?? a.createdAt;

        final bDate = b.invoiceDate ?? b.createdAt;

        return bDate.compareTo(aDate);
      });

    final outstandingInvoices = invoices
        .where((invoice) => invoice.balanceDue > 0)
        .toList();

    final overdueInvoices = invoices
        .where(
          (invoice) =>
              invoice.invoicePaymentStatus == InvoicePaymentStatus.overdue,
        )
        .toList();

    final paidInvoices = invoices
        .where(
          (invoice) =>
              invoice.invoicePaymentStatus == InvoicePaymentStatus.paid,
        )
        .toList();

    final outstanding = service.getCustomerOutstanding(widget.customer.id);

    final overdue = service.getCustomerOverdue(widget.customer.id);

    final oldestOverdueDays = service.getCustomerOldestOverdueDays(
      widget.customer.id,
    );

    final List<SalesDocument> filteredInvoices;

    switch (_filter) {
      case _InvoiceFilter.all:
        filteredInvoices = invoices;
        break;

      case _InvoiceFilter.outstanding:
        filteredInvoices = outstandingInvoices;
        break;

      case _InvoiceFilter.overdue:
        filteredInvoices = overdueInvoices;
        break;

      case _InvoiceFilter.paid:
        filteredInvoices = paidInvoices;
        break;
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Invoices')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            widget.customer.businessName,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 25,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            '${invoices.length} '
            '${invoices.length == 1 ? 'invoice' : 'invoices'}',
            style: const TextStyle(color: AppColors.muted),
          ),

          const SizedBox(height: 20),

          Row(
            children: [
              Expanded(
                child: _SummaryCard(
                  label: 'OUTSTANDING',
                  value: '\$${outstanding.toStringAsFixed(2)}',
                  danger: outstanding > 0,
                ),
              ),

              const SizedBox(width: 10),

              Expanded(
                child: _SummaryCard(
                  label: 'OVERDUE',
                  value: '\$${overdue.toStringAsFixed(2)}',
                  danger: overdue > 0,
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          _SummaryCard(
            label: 'OLDEST OVERDUE',
            value: oldestOverdueDays > 0 ? '$oldestOverdueDays days' : '—',
            danger: oldestOverdueDays > 0,
          ),

          const SizedBox(height: 24),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _FilterChip(
                  label: 'All',
                  count: invoices.length,
                  selected: _filter == _InvoiceFilter.all,
                  onTap: () {
                    setState(() {
                      _filter = _InvoiceFilter.all;
                    });
                  },
                ),

                const SizedBox(width: 8),

                _FilterChip(
                  label: 'Outstanding',
                  count: outstandingInvoices.length,
                  selected: _filter == _InvoiceFilter.outstanding,
                  onTap: () {
                    setState(() {
                      _filter = _InvoiceFilter.outstanding;
                    });
                  },
                ),

                const SizedBox(width: 8),

                _FilterChip(
                  label: 'Overdue',
                  count: overdueInvoices.length,
                  selected: _filter == _InvoiceFilter.overdue,
                  danger: overdueInvoices.isNotEmpty,
                  onTap: () {
                    setState(() {
                      _filter = _InvoiceFilter.overdue;
                    });
                  },
                ),

                const SizedBox(width: 8),

                _FilterChip(
                  label: 'Paid',
                  count: paidInvoices.length,
                  selected: _filter == _InvoiceFilter.paid,
                  onTap: () {
                    setState(() {
                      _filter = _InvoiceFilter.paid;
                    });
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          if (invoices.isEmpty)
            const _EmptyInvoices()
          else if (filteredInvoices.isEmpty)
            const _EmptyFilter()
          else
            ...filteredInvoices.map(
              (invoice) => _InvoiceCard(invoice: invoice),
            ),
        ],
      ),
    );
  }
}

class _InvoiceCard extends StatelessWidget {
  final SalesDocument invoice;

  const _InvoiceCard({required this.invoice});

  @override
  Widget build(BuildContext context) {
    final status = invoice.invoicePaymentStatus;

    final String statusLabel;
    final Color statusColor;
    final Color statusBackground;

    switch (status) {
      case InvoicePaymentStatus.unpaid:
        statusLabel = 'UNPAID';
        statusColor = AppColors.warning;
        statusBackground = AppColors.warningLight;
        break;

      case InvoicePaymentStatus.partiallyPaid:
        statusLabel = 'PARTIALLY PAID';
        statusColor = AppColors.copper;
        statusBackground = AppColors.copperLight;
        break;

      case InvoicePaymentStatus.paid:
        statusLabel = 'PAID';
        statusColor = AppColors.success;
        statusBackground = AppColors.successLight;
        break;

      case InvoicePaymentStatus.overdue:
        statusLabel = 'OVERDUE';
        statusColor = AppColors.danger;
        statusBackground = AppColors.dangerLight;
        break;

      case null:
        statusLabel = 'INVOICE';
        statusColor = AppColors.muted;
        statusBackground = AppColors.background;
        break;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => SalesDocumentDetailScreen(document: invoice),
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: statusBackground,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Icon(Icons.receipt_long_outlined, color: statusColor),
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
                              invoice.number,
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),

                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 7,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: statusBackground,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              statusLabel,
                              style: TextStyle(
                                color: statusColor,
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 7),

                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              'Total \$${invoice.total.toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: AppColors.muted,
                                fontSize: 12,
                              ),
                            ),
                          ),

                          Text(
                            '\$${invoice.balanceDue.toStringAsFixed(2)} due',
                            style: TextStyle(
                              color: invoice.balanceDue > 0
                                  ? AppColors.danger
                                  : AppColors.success,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 4),

                      Text(
                        invoice.invoiceDate == null
                            ? 'Invoice date —'
                            : 'Invoice ${DateFormat('dd MMM yyyy').format(invoice.invoiceDate!)}',
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 11,
                        ),
                      ),

                      const SizedBox(height: 2),

                      Text(
                        invoice.dueDate == null
                            ? 'Due —'
                            : 'Due ${DateFormat('dd MMM yyyy').format(invoice.dueDate!)}',
                        style: TextStyle(
                          color: status == InvoicePaymentStatus.overdue
                              ? AppColors.danger
                              : AppColors.muted,
                          fontSize: 11,
                          fontWeight: status == InvoicePaymentStatus.overdue
                              ? FontWeight.w700
                              : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 4),

                const Icon(Icons.chevron_right, color: AppColors.muted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final int count;
  final bool selected;
  final bool danger;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.count,
    required this.selected,
    required this.onTap,
    this.danger = false,
  });

  @override
  Widget build(BuildContext context) {
    final foreground = selected
        ? Colors.white
        : danger
        ? AppColors.danger
        : AppColors.text;

    final background = selected
        ? danger
              ? AppColors.danger
              : AppColors.green
        : danger
        ? AppColors.dangerLight
        : AppColors.card;

    return Material(
      color: background,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: selected
                  ? background
                  : danger
                  ? AppColors.danger
                  : AppColors.border,
            ),
          ),
          child: Text(
            '$label $count',
            style: TextStyle(
              color: foreground,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final bool danger;

  const _SummaryCard({
    required this.label,
    required this.value,
    this.danger = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: danger ? AppColors.dangerLight : AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: danger ? AppColors.danger : AppColors.text,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyInvoices extends StatelessWidget {
  const _EmptyInvoices();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: const Column(
        children: [
          Icon(Icons.receipt_long_outlined, size: 32, color: AppColors.muted),
          SizedBox(height: 10),
          Text('No invoices', style: TextStyle(fontWeight: FontWeight.w700)),
          SizedBox(height: 4),
          Text(
            'Invoices for this customer will appear here.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _EmptyFilter extends StatelessWidget {
  const _EmptyFilter();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: const Text(
        'No invoices in this category.',
        textAlign: TextAlign.center,
        style: TextStyle(color: AppColors.muted),
      ),
    );
  }
}
