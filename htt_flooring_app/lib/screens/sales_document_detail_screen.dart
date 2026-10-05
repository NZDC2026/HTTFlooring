import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/sales_document.dart';
import '../models/sales_user.dart';
import '../services/sales_document_service.dart';
import '../theme/app_theme.dart';

class SalesDocumentDetailScreen extends StatelessWidget {
  final SalesDocument document;

  const SalesDocumentDetailScreen({super.key, required this.document});

  @override
  Widget build(BuildContext context) {
    final service = context.watch<SalesDocumentService>();

    // 不直接使用传进来的旧 document。
    // 转 Order 后重新读取最新状态。
    final currentDocument = service.findByNumber(document.number) ?? document;

    return Scaffold(
      backgroundColor: AppColors.background,

      appBar: AppBar(title: Text(_documentTitle(currentDocument.status))),

      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(18),
              children: [
                Text(
                  _documentLabel(currentDocument.status),
                  style: const TextStyle(
                    color: AppColors.copper,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.5,
                  ),
                ),

                const SizedBox(height: 5),

                Text(
                  currentDocument.number,
                  style: const TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w800,
                  ),
                ),

                const SizedBox(height: 8),

                _StatusBadge(status: currentDocument.status),

                if (currentDocument.status == SalesDocumentStatus.invoice) ...[
                  const SizedBox(height: 14),

                  _InvoiceInfoCard(document: currentDocument),
                ],

                const SizedBox(height: 24),

                // Customer
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CUSTOMER',
                        style: TextStyle(
                          color: AppColors.muted,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),

                      const SizedBox(height: 6),

                      Text(
                        currentDocument.customer.businessName,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),

                      const SizedBox(height: 3),

                      Text(
                        currentDocument.customer.region.label,
                        style: const TextStyle(color: AppColors.muted),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                const Text(
                  'Items',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),

                const SizedBox(height: 10),

                ...currentDocument.items.map(
                  (item) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.product.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                          ),
                        ),

                        const SizedBox(height: 3),

                        Text(
                          item.product.sku,
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 11,
                          ),
                        ),

                        const SizedBox(height: 12),

                        Row(
                          children: [
                            Expanded(child: Text('${item.boxes} boxes')),

                            Text('${item.sqm.toStringAsFixed(2)} m²'),
                          ],
                        ),

                        const SizedBox(height: 5),

                        Row(
                          children: [
                            const Expanded(
                              child: Text(
                                'Unit Price',
                                style: TextStyle(color: AppColors.muted),
                              ),
                            ),

                            Text(
                              '\$${item.unitPrice.toStringAsFixed(2)} / m²',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),

                        const Divider(height: 24),

                        Row(
                          children: [
                            const Expanded(
                              child: Text(
                                'Subtotal',
                                style: TextStyle(fontWeight: FontWeight.w600),
                              ),
                            ),

                            Text(
                              '\$${item.subtotal.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                // Totals
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      _MoneyRow(
                        label: 'Subtotal',
                        amount: currentDocument.subtotal,
                      ),

                      _MoneyRow(
                        label: 'GST (10%)',
                        amount: currentDocument.gst,
                      ),

                      const Divider(),

                      _MoneyRow(
                        label: 'Total',
                        amount: currentDocument.total,
                        total: true,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // Business number info
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.successLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.verified_outlined,
                        color: AppColors.success,
                      ),

                      const SizedBox(width: 10),

                      Expanded(
                        child: Text(
                          'Business number ${currentDocument.number} '
                          'is permanent and will remain the same '
                          'through Quotation, Order and Invoice.',
                          style: const TextStyle(
                            color: AppColors.success,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          _BottomAction(document: currentDocument),
        ],
      ),
    );
  }

  String _documentTitle(SalesDocumentStatus status) {
    switch (status) {
      case SalesDocumentStatus.quotation:
        return 'Quotation';

      case SalesDocumentStatus.order:
        return 'Order';

      case SalesDocumentStatus.invoice:
        return 'Invoice';

      case SalesDocumentStatus.cancelled:
        return 'Cancelled';
    }
  }

  String _documentLabel(SalesDocumentStatus status) {
    switch (status) {
      case SalesDocumentStatus.quotation:
        return 'QUOTATION';

      case SalesDocumentStatus.order:
        return 'SALES ORDER';

      case SalesDocumentStatus.invoice:
        return 'INVOICE';

      case SalesDocumentStatus.cancelled:
        return 'CANCELLED';
    }
  }
}

class _BottomAction extends StatelessWidget {
  final SalesDocument document;

  const _BottomAction({required this.document});

  @override
  Widget build(BuildContext context) {
    switch (document.status) {
      case SalesDocumentStatus.quotation:
        return _QuotationAction(document: document);

      case SalesDocumentStatus.order:
        return _OrderAction(document: document);

      case SalesDocumentStatus.invoice:
        return _InvoiceAction(document: document);

      case SalesDocumentStatus.cancelled:
        return const SizedBox.shrink();
    }
  }
}

class _QuotationAction extends StatelessWidget {
  final SalesDocument document;

  const _QuotationAction({required this.document});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        color: AppColors.card,
        child: FilledButton.icon(
          style: FilledButton.styleFrom(backgroundColor: AppColors.copper),
          onPressed: () {
            _confirmConvert(context);
          },
          icon: const Icon(Icons.shopping_cart_checkout),
          label: const Text('Convert to Order'),
        ),
      ),
    );
  }

  void _confirmConvert(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Convert to order?'),

          content: Text(
            'Quotation ${document.number} '
            'will become Sales Order ${document.number}. '
            'The business number will not change.',
          ),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('Cancel'),
            ),

            FilledButton(
              onPressed: () {
                final service = context.read<SalesDocumentService>();

                service.convertQuotationToOrder(document.number);

                Navigator.pop(dialogContext);

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Sales Order ${document.number} created.'),
                  ),
                );
              },
              child: const Text('Convert'),
            ),
          ],
        );
      },
    );
  }
}

class _OrderAction extends StatelessWidget {
  final SalesDocument document;

  const _OrderAction({required this.document});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        color: AppColors.card,
        child: FilledButton.icon(
          style: FilledButton.styleFrom(backgroundColor: AppColors.copper),
          onPressed: () {
            _confirmConvertToInvoice(context);
          },
          icon: const Icon(Icons.receipt_long_outlined),
          label: const Text('Convert to Invoice'),
        ),
      ),
    );
  }

  void _confirmConvertToInvoice(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Convert to invoice?'),
          content: Text(
            'Sales Order ${document.number} '
            'will become Invoice ${document.number}. '
            'The business number will remain unchanged.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                final service = context.read<SalesDocumentService>();

                service.convertOrderToInvoice(document.number);

                Navigator.pop(dialogContext);

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Invoice ${document.number} created.'),
                  ),
                );
              },
              child: const Text('Create Invoice'),
            ),
          ],
        );
      },
    );
  }
}

class _InvoiceAction extends StatelessWidget {
  final SalesDocument document;

  const _InvoiceAction({required this.document});

  @override
  Widget build(BuildContext context) {
    final paymentStatus = document.invoicePaymentStatus;

    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.all(16),
        color: AppColors.card,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: _InvoiceSummaryValue(
                    label: 'AMOUNT PAID',
                    value: '\$${document.amountPaid.toStringAsFixed(2)}',
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: _InvoiceSummaryValue(
                    label: 'BALANCE DUE',
                    value: '\$${document.balanceDue.toStringAsFixed(2)}',
                    highlight: document.balanceDue > 0,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            if (paymentStatus != InvoicePaymentStatus.paid)
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.copper,
                  ),
                  onPressed: () {
                    _showRecordPayment(context);
                  },
                  icon: const Icon(Icons.payments_outlined),
                  label: const Text('Record Payment'),
                ),
              ),

            if (paymentStatus == InvoicePaymentStatus.paid)
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: null,
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text('Invoice Paid'),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _showRecordPayment(BuildContext context) {
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Record Payment'),

          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Invoice ${document.number}'),

              const SizedBox(height: 5),

              Text(
                'Balance Due: '
                '\$${document.balanceDue.toStringAsFixed(2)}',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),

              const SizedBox(height: 16),

              TextField(
                controller: controller,

                autofocus: true,

                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),

                decoration: const InputDecoration(
                  labelText: 'Payment Amount',
                  prefixText: '\$ ',
                ),
              ),
            ],
          ),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('Cancel'),
            ),

            FilledButton(
              onPressed: () {
                final amount = double.tryParse(controller.text.trim());

                if (amount == null || amount <= 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Enter a valid payment amount.'),
                    ),
                  );

                  return;
                }

                if (amount > document.balanceDue) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Payment cannot exceed \$${document.balanceDue.toStringAsFixed(2)}.',
                      ),
                    ),
                  );

                  return;
                }

                final service = context.read<SalesDocumentService>();

                service.recordPayment(number: document.number, amount: amount);

                Navigator.pop(dialogContext);

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Payment of \$${amount.toStringAsFixed(2)} recorded.',
                    ),
                  ),
                );
              },

              child: const Text('Record'),
            ),
          ],
        );
      },
    );
  }
}

class _InvoiceSummaryValue extends StatelessWidget {
  final String label;

  final String value;

  final bool highlight;

  const _InvoiceSummaryValue({
    required this.label,
    required this.value,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background,
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

          const SizedBox(height: 5),

          Text(
            value,
            style: TextStyle(
              color: highlight ? AppColors.danger : AppColors.text,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final SalesDocumentStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final String label;
    final Color background;
    final Color foreground;
    final IconData icon;

    switch (status) {
      case SalesDocumentStatus.quotation:
        label = 'QUOTATION';
        background = AppColors.copperLight;
        foreground = AppColors.copper;
        icon = Icons.description_outlined;
        break;

      case SalesDocumentStatus.order:
        label = 'SALES ORDER';
        background = AppColors.successLight;
        foreground = AppColors.success;
        icon = Icons.shopping_cart_outlined;
        break;

      case SalesDocumentStatus.invoice:
        label = 'INVOICE';
        background = AppColors.successLight;
        foreground = AppColors.success;
        icon = Icons.receipt_long_outlined;
        break;

      case SalesDocumentStatus.cancelled:
        label = 'CANCELLED';
        background = AppColors.dangerLight;
        foreground = AppColors.danger;
        icon = Icons.cancel_outlined;
        break;
    }

    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: foreground),

            const SizedBox(width: 5),

            Text(
              label,
              style: TextStyle(
                color: foreground,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MoneyRow extends StatelessWidget {
  final String label;
  final double amount;
  final bool total;

  const _MoneyRow({
    required this.label,
    required this.amount,
    this.total = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontWeight: total ? FontWeight.w800 : FontWeight.normal,
              ),
            ),
          ),

          Text(
            '\$${amount.toStringAsFixed(2)}',
            style: TextStyle(
              fontSize: total ? 21 : 14,
              fontWeight: total ? FontWeight.w800 : FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _InvoiceInfoCard extends StatelessWidget {
  final SalesDocument document;

  const _InvoiceInfoCard({required this.document});

  @override
  Widget build(BuildContext context) {
    final paymentStatus = document.invoicePaymentStatus!;

    final String statusLabel;

    final Color statusColor;

    final Color statusBackground;

    switch (paymentStatus) {
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
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'PAYMENT STATUS',
                  style: TextStyle(
                    color: AppColors.muted,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBackground,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  statusLabel,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          _InvoiceInfoRow(
            label: 'Invoice Date',
            value: _formatInvoiceDate(document.invoiceDate),
          ),

          _InvoiceInfoRow(
            label: 'Due Date',
            value: _formatInvoiceDate(document.dueDate),
          ),

          _InvoiceInfoRow(
            label: 'Amount Paid',
            value: '\$${document.amountPaid.toStringAsFixed(2)}',
          ),

          _InvoiceInfoRow(
            label: 'Balance Due',
            value: '\$${document.balanceDue.toStringAsFixed(2)}',
            strong: true,
          ),

          if (document.overdueDays > 0)
            _InvoiceInfoRow(
              label: 'Overdue',
              value: '${document.overdueDays} days',
              danger: true,
            ),
        ],
      ),
    );
  }
}

class _InvoiceInfoRow extends StatelessWidget {
  final String label;

  final String value;

  final bool strong;

  final bool danger;

  const _InvoiceInfoRow({
    required this.label,
    required this.value,
    this.strong = false,
    this.danger = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(label, style: const TextStyle(color: AppColors.muted)),
          ),

          Text(
            value,
            style: TextStyle(
              color: danger ? AppColors.danger : AppColors.text,
              fontWeight: strong || danger ? FontWeight.w800 : FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

String _formatInvoiceDate(DateTime? date) {
  if (date == null) {
    return '—';
  }

  final day = date.day.toString().padLeft(2, '0');

  final month = date.month.toString().padLeft(2, '0');

  return '$day/$month/${date.year}';
}
