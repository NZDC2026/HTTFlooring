import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/customer.dart';
import '../models/sales_user.dart';
import '../services/customer_service.dart';
import '../services/document_number_service.dart';
import '../services/quote_service.dart';
import '../services/sales_document_service.dart';
import '../services/sales_session.dart';
import '../theme/app_theme.dart';
import 'quote_product_picker_screen.dart';

class QuoteScreen extends StatelessWidget {
  const QuoteScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final quote = context.watch<QuoteService>();
    final customerService = context.watch<CustomerService>();

    final frozenCustomer = quote.customer;

    if (frozenCustomer == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Quotation')),
        body: const Center(child: Text('No customer selected.')),
      );
    }

    // Draft quotation:
    // Always display the latest live Customer data.
    //
    // Created quotation:
    // Always display the frozen Customer snapshot
    // captured at Create & Lock.
    final Customer customer;

    if (quote.isCreated) {
      customer = frozenCustomer;
    } else {
      customer = customerService.findById(frozenCustomer.id) ?? frozenCustomer;
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Quotation')),

      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(18),
              children: [
                const Text(
                  'QUOTE',
                  style: TextStyle(
                    color: AppColors.copper,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.5,
                  ),
                ),

                const SizedBox(height: 5),

                Text(
                  quote.documentNumber == null
                      ? 'Draft'
                      : quote.documentNumber!,

                  style: const TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                const SizedBox(height: 8),

                // Quote 状态
                Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: quote.isCreated
                          ? AppColors.successLight
                          : AppColors.warningLight,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          quote.isCreated
                              ? Icons.lock_outline
                              : Icons.edit_outlined,
                          size: 14,
                          color: quote.isCreated
                              ? AppColors.success
                              : AppColors.warning,
                        ),

                        const SizedBox(width: 5),

                        Text(
                          quote.isCreated ? 'CREATED · LOCKED' : 'DRAFT',
                          style: TextStyle(
                            color: quote.isCreated
                                ? AppColors.success
                                : AppColors.warning,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 22),

                // Customer
                Container(
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CUSTOMER',
                        style: TextStyle(color: AppColors.muted, fontSize: 10),
                      ),

                      const SizedBox(height: 5),

                      Text(
                        customer.businessName,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),

                      Text(
                        '${customer.region.label} 🔒',
                        style: const TextStyle(color: AppColors.muted),
                      ),

                      if (!quote.isCreated && customer.archived) ...[
                        const SizedBox(height: 10),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.dangerLight,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.archive_outlined,
                                size: 17,
                                color: AppColors.danger,
                              ),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'This customer has been archived. '
                                  'This draft cannot be created.',
                                  style: TextStyle(
                                    color: AppColors.danger,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
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

                const SizedBox(height: 25),

                const Text(
                  'Items',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                ),

                const SizedBox(height: 10),

                // Empty Quote
                if (quote.items.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Column(
                      children: [
                        Icon(
                          Icons.inventory_2_outlined,
                          size: 36,
                          color: AppColors.muted,
                        ),

                        SizedBox(height: 10),

                        Text(
                          'No products added',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),

                // Quote Items
                ...quote.items.asMap().entries.map((entry) {
                  final index = entry.key;

                  final item = entry.value;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                item.product.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),

                            // Draft 才允许删除
                            if (!quote.isCreated)
                              IconButton(
                                onPressed: () {
                                  quote.removeItem(index);
                                },
                                icon: const Icon(Icons.close, size: 18),
                              ),
                          ],
                        ),

                        Text(
                          item.product.sku,
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 11,
                          ),
                        ),

                        const SizedBox(height: 8),

                        Text(
                          '${item.boxes} boxes · '
                          '${item.sqm.toStringAsFixed(2)} m²',
                        ),

                        Text('\$${item.unitPrice.toStringAsFixed(2)} / m²'),

                        const SizedBox(height: 7),

                        Align(
                          alignment: Alignment.centerRight,
                          child: Text(
                            '\$${item.subtotal.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),

                const SizedBox(height: 10),

                // 正式创建以后彻底隐藏 Add Product
                if (!quote.isCreated)
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const QuoteProductPickerScreen(),
                        ),
                      );
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Add Product'),
                  ),

                const SizedBox(height: 25),

                // Totals
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      _row('Subtotal', quote.subtotal),

                      _row('GST (10%)', quote.gst),

                      const Divider(),

                      _row('Total', quote.total, total: true),
                    ],
                  ),
                ),

                if (quote.isCreated) ...[
                  const SizedBox(height: 18),

                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.successLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.lock_outline, color: AppColors.success),

                        SizedBox(width: 10),

                        Expanded(
                          child: Text(
                            'This quotation has been created and is locked. '
                            'Customer, products, quantities and prices can no longer be changed.',
                            style: TextStyle(
                              color: AppColors.success,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
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

          // Bottom actions
          SafeArea(
            top: false,
            child: Container(
              padding: const EdgeInsets.all(16),
              color: AppColors.card,

              child: quote.isCreated
                  // Created 后不再显示编辑按钮
                  ? SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: null,
                        icon: const Icon(Icons.lock_outline),
                        label: const Text('Quotation Locked'),
                      ),
                    )
                  // Draft
                  : Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Draft saved.')),
                              );
                            },
                            child: const Text('Save Draft'),
                          ),
                        ),

                        const SizedBox(width: 10),

                        Expanded(
                          child: FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.copper,
                            ),

                            // 没有产品不能 Create
                            onPressed: quote.items.isEmpty
                                ? null
                                : () {
                                    _confirmQuote(context);
                                  },

                            child: const Text('Create Quote'),
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(String label, double value, {bool total = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontWeight: total ? FontWeight.w700 : FontWeight.normal,
              ),
            ),
          ),

          Text(
            '\$${value.toStringAsFixed(2)}',
            style: TextStyle(
              fontSize: total ? 21 : 14,
              fontWeight: total ? FontWeight.w800 : FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  void _confirmQuote(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Create quotation?'),
          content: const Text(
            'Once created, this quotation will be locked. '
            'Customer, products, quantities and prices can no longer be changed.',
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
                final quote = context.read<QuoteService>();

                // 1. Already created.
                if (quote.isCreated) {
                  Navigator.pop(dialogContext);
                  return;
                }

                // 2. Quote must contain products.
                if (quote.items.isEmpty) {
                  Navigator.pop(dialogContext);

                  _showQuoteError(
                    context,
                    title: 'No Products',
                    message: 'Add at least one product before creating the quotation.',
                  );

                  return;
                }

                // 3. Quote must have a customer.
                final draftCustomer = quote.customer;

                if (draftCustomer == null) {
                  Navigator.pop(dialogContext);

                  _showQuoteError(
                    context,
                    title: 'Customer Required',
                    message: 'Please select an active customer before creating the quotation.',
                  );

                  return;
                }

                final customerService = context.read<CustomerService>();

                // IMPORTANT:
                // Always get the latest customer from CustomerService.
                // Do not trust the Customer object stored in QuoteService.
                final currentCustomer = customerService.findById(
                  draftCustomer.id,
                );

                // 4. Customer may have been removed / unavailable.
                if (currentCustomer == null) {
                  Navigator.pop(dialogContext);

                  _showQuoteError(
                    context,
                    title: 'Customer Unavailable',
                    message:
                        '${draftCustomer.businessName} is no longer available.\n\n'
                        'Please select an active customer.',
                  );

                  return;
                }

                // 5. Customer may have been archived after
                // the quote draft was opened.
                if (currentCustomer.archived) {
                  Navigator.pop(dialogContext);

                  _showQuoteError(
                    context,
                    title: 'Customer Unavailable',
                    message:
                        '${currentCustomer.businessName} has been archived '
                        'and can no longer be used for new quotations.\n\n'
                        'Please select an active customer.',
                  );

                  return;
                }

                // 6. Check region access again using the
                // current SalesSession.
                final session = context.read<SalesSession>();

                if (!session.canAccessRegion(currentCustomer.region)) {
                  Navigator.pop(dialogContext);

                  _showQuoteError(
                    context,
                    title: 'Region Access Denied',
                    message:
                        '${currentCustomer.businessName} belongs to '
                        '${currentCustomer.region.label}.\n\n'
                        'Your current account cannot create quotations '
                        'for this region.',
                  );

                  return;
                }

                // Refresh the draft with the latest customer data.
                //
                // This keeps the same customerId but updates fields such as
                // business name, address and ABN before Create & Lock.
                quote.refreshCustomerSnapshot(currentCustomer);

                // ------------------------------------------------
                // ALL VALIDATION HAS PASSED.
                //
                // Do not issue an HTT number before this point.
                // ------------------------------------------------

                final numberService = context.read<DocumentNumberService>();

                final number = numberService.issueNumber();

                quote.assignDocumentNumber(number);

                final documentService = context.read<SalesDocumentService>();

                documentService.createQuotation(
                  number: number,

                  // Use the CURRENT customer rather than the
                  // stale Customer object stored in the draft.
                  customer: currentCustomer,

                  items: quote.items,
                );

                Navigator.pop(dialogContext);

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Quotation $number created and locked.'),
                  ),
                );
              },
              child: const Text('Create & Lock'),
            ),
          ],
        );
      },
    );
  }

  void _showQuoteError(
    BuildContext context, {
    required String title,
    required String message,
  }) {
    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: AppColors.warning),
              const SizedBox(width: 10),
              Expanded(child: Text(title)),
            ],
          ),
          content: Text(message),
          actions: [
            FilledButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }
}
