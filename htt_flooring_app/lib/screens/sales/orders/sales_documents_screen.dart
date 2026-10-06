import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/sales_document.dart';
import '../../../services/sales_document_service.dart';
import '../../../theme/app_theme.dart';
import 'sales_document_detail_screen.dart';

enum _DocumentFilter { all, quotations, invoices }

class SalesDocumentsScreen extends StatefulWidget {
  const SalesDocumentsScreen({super.key});

  @override
  State<SalesDocumentsScreen> createState() => _SalesDocumentsScreenState();
}

class _SalesDocumentsScreenState extends State<SalesDocumentsScreen> {
  _DocumentFilter _filter = _DocumentFilter.all;

  @override
  Widget build(BuildContext context) {
    final service = context.watch<SalesDocumentService>();

    // Sales intentionally excludes internal warehouse Orders.
    final salesDocuments =
        service.documents
            .where(
              (document) =>
                  document.status == SalesDocumentStatus.quotation ||
                  document.status == SalesDocumentStatus.invoice,
            )
            .toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    final visibleDocuments = salesDocuments.where((document) {
      switch (_filter) {
        case _DocumentFilter.all:
          return true;
        case _DocumentFilter.quotations:
          return document.status == SalesDocumentStatus.quotation;
        case _DocumentFilter.invoices:
          return document.status == SalesDocumentStatus.invoice;
      }
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Sales Documents'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          _SummaryHeader(
            quotationCount: service.quotations.length,
            invoiceCount: service.invoices.length,
            outstanding: service.totalOutstanding,
          ),
          _FilterBar(
            selected: _filter,
            onChanged: (value) => setState(() => _filter = value),
          ),
          Expanded(
            child: visibleDocuments.isEmpty
                ? _EmptyDocuments(filter: _filter)
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
                    itemCount: visibleDocuments.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) =>
                        _DocumentCard(document: visibleDocuments[index]),
                  ),
          ),
        ],
      ),
    );
  }
}

class _SummaryHeader extends StatelessWidget {
  const _SummaryHeader({
    required this.quotationCount,
    required this.invoiceCount,
    required this.outstanding,
  });

  final int quotationCount;
  final int invoiceCount;
  final double outstanding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.green,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 18),
      child: Row(
        children: [
          Expanded(child: _metric('QUOTATIONS', '$quotationCount')),
          Container(width: 1, height: 42, color: Colors.white24),
          Expanded(child: _metric('INVOICES', '$invoiceCount')),
          Container(width: 1, height: 42, color: Colors.white24),
          Expanded(
            child: _metric(
              'OUTSTANDING',
              '\$${outstanding.toStringAsFixed(0)}',
            ),
          ),
        ],
      ),
    );
  }

  Widget _metric(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 9,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _FilterBar extends StatelessWidget {
  const _FilterBar({required this.selected, required this.onChanged});

  final _DocumentFilter selected;
  final ValueChanged<_DocumentFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.card,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        children: [
          _chip('All', _DocumentFilter.all),
          const SizedBox(width: 8),
          _chip('Quotations', _DocumentFilter.quotations),
          const SizedBox(width: 8),
          _chip('Invoices', _DocumentFilter.invoices),
        ],
      ),
    );
  }

  Widget _chip(String label, _DocumentFilter value) {
    final isSelected = selected == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      showCheckmark: false,
      selectedColor: AppColors.copperLight,
      backgroundColor: AppColors.background,
      side: BorderSide(color: isSelected ? AppColors.copper : AppColors.border),
      labelStyle: TextStyle(
        color: isSelected ? AppColors.copper : AppColors.text,
        fontSize: 11,
        fontWeight: FontWeight.w600,
      ),
      onSelected: (_) => onChanged(value),
    );
  }
}

class _DocumentCard extends StatelessWidget {
  const _DocumentCard({required this.document});

  final SalesDocument document;

  @override
  Widget build(BuildContext context) {
    final isInvoice = document.status == SalesDocumentStatus.invoice;

    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => SalesDocumentDetailScreen(document: document),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: isInvoice
                      ? AppColors.successLight
                      : AppColors.copperLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  isInvoice
                      ? Icons.receipt_long_outlined
                      : Icons.description_outlined,
                  color: isInvoice ? AppColors.success : AppColors.copper,
                ),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            document.number,
                            style: const TextStyle(
                              color: AppColors.text,
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        _StatusBadge(document: document),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      document.customer.businessName,
                      style: const TextStyle(
                        color: AppColors.text,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${document.items.length} item${document.items.length == 1 ? '' : 's'} · ${_formatDate(document.createdAt)}',
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 11,
                      ),
                    ),
                    const SizedBox(height: 9),
                    Row(
                      children: [
                        Text(
                          '\$${document.total.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: AppColors.copper,
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        if (isInvoice && document.balanceDue > 0) ...[
                          const Spacer(),
                          Text(
                            'Balance \$${document.balanceDue.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: AppColors.muted,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              const Padding(
                padding: EdgeInsets.only(top: 12),
                child: Icon(Icons.chevron_right, color: AppColors.muted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.document});

  final SalesDocument document;

  @override
  Widget build(BuildContext context) {
    String label;
    Color background;
    Color foreground;

    if (document.status == SalesDocumentStatus.quotation) {
      label = 'QUOTATION';
      background = AppColors.copperLight;
      foreground = AppColors.copper;
    } else {
      switch (document.invoicePaymentStatus) {
        case null:
        case InvoicePaymentStatus.unpaid:
          label = 'UNPAID';
          background = AppColors.warningLight;
          foreground = AppColors.warning;
          break;
        case InvoicePaymentStatus.partiallyPaid:
          label = 'PART PAID';
          background = AppColors.copperLight;
          foreground = AppColors.copper;
          break;
        case InvoicePaymentStatus.paid:
          label = 'PAID';
          background = AppColors.successLight;
          foreground = AppColors.success;
          break;
        case InvoicePaymentStatus.overdue:
          label = 'OVERDUE';
          background = AppColors.dangerLight;
          foreground = AppColors.danger;
          break;
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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

class _EmptyDocuments extends StatelessWidget {
  const _EmptyDocuments({required this.filter});

  final _DocumentFilter filter;

  @override
  Widget build(BuildContext context) {
    final message = switch (filter) {
      _DocumentFilter.all => 'No sales documents yet',
      _DocumentFilter.quotations => 'No quotations yet',
      _DocumentFilter.invoices => 'No invoices yet',
    };

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.description_outlined,
              size: 48,
              color: AppColors.muted,
            ),
            const SizedBox(height: 13),
            Text(
              message,
              style: const TextStyle(
                color: AppColors.text,
                fontSize: 17,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Sales uses Quotations and Invoices. Internal warehouse orders are not shown here.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.muted, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}

String _formatDate(DateTime date) {
  final day = date.day.toString().padLeft(2, '0');
  final month = date.month.toString().padLeft(2, '0');
  return '$day/$month/${date.year}';
}
