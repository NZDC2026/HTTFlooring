import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/sales_user.dart';
import '../services/document_number_service.dart';
import '../services/quote_service.dart';
import '../services/sales_document_service.dart';
import '../theme/app_theme.dart';
import 'quote_product_picker_screen.dart';

class QuoteScreen extends StatelessWidget {
  const QuoteScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final quote = context.watch<QuoteService>();

    final customer = quote.customer;

    if (customer == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Quotation')),
        body: const Center(child: Text('No customer selected.')),
      );
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

                // 双重保护
                if (quote.isCreated) {
                  Navigator.pop(dialogContext);
                  return;
                }

                if (quote.items.isEmpty) {
                  Navigator.pop(dialogContext);
                  return;
                }

                final numberService = context.read<DocumentNumberService>();

                final number = numberService.issueNumber();

                quote.assignDocumentNumber(number);

                final documentService = context.read<SalesDocumentService>();

                documentService.createQuotation(
                  number: number,
                  customer: quote.customer!,
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
}
