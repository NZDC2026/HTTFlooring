import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/customer_product_sales.dart';
import '../data/customer_product_sales_demo.dart';
import '../models/sales_document.dart';
import '../services/sales_document_service.dart';
import '../theme/app_theme.dart';

class CustomerProductSalesCard extends StatefulWidget {
  const CustomerProductSalesCard({
    super.key,
    required this.customerId,
    this.now,
  });
  final String customerId;
  final DateTime? now;
  @override
  State<CustomerProductSalesCard> createState() =>
      _CustomerProductSalesCardState();
}

class _CustomerProductSalesCardState extends State<CustomerProductSalesCard> {
  int _days = 30;
  bool? _demoOverride;
  @override
  Widget build(BuildContext context) {
    final service = context.watch<SalesDocumentService>();
    final now = widget.now ?? DateTime.now();
    final showDemo =
        _demoOverride ??
        !service.documents.any(
          (d) =>
              d.customer.id == widget.customerId &&
              d.status == SalesDocumentStatus.invoice,
        );
    final report = CustomerProductSales(
      documents: showDemo
          ? customerProductSalesDemo(widget.customerId, now)
          : service.documents,
      customerId: widget.customerId,
      now: now,
      days: _days,
    );
    final date = DateFormat('d MMM yyyy');
    String period(DateTime start, DateTime end) =>
        '${date.format(start)} – ${date.format(DateTime(end.year, end.month, end.day - 1))}';
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Product Sales',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.text,
            ),
          ),
          Material(
            color: Colors.transparent,
            child: SwitchListTile.adaptive(
              contentPadding: EdgeInsets.zero,
              dense: true,
              title: const Text('Demo data'),
              subtitle: Text(
                showDemo
                    ? 'Sample sales for preview only'
                    : 'Showing actual invoices',
              ),
              value: showDemo,
              onChanged: (value) => setState(() => _demoOverride = value),
            ),
          ),
          const SizedBox(height: 12),
          SegmentedButton<int>(
            segments: const [
              ButtonSegment(value: 30, label: Text('Last 30 days')),
              ButtonSegment(value: 90, label: Text('Last 90 days')),
            ],
            selected: {_days},
            onSelectionChanged: (v) => setState(() => _days = v.first),
          ),
          const SizedBox(height: 12),
          Text(
            period(report.start, report.end),
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
          ),
          Text(
            'vs ${period(report.previousStart, report.start)}',
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
          const SizedBox(height: 8),
          const Text(
            'Invoiced volume · trend by m² · returns not deducted',
            style: TextStyle(color: AppColors.muted, fontSize: 11),
          ),
          if (report.products.isEmpty) ...[
            const SizedBox(height: 20),
            const Text(
              'No product sales in these periods.',
              style: TextStyle(color: AppColors.muted),
            ),
          ] else ...[
            for (final product in report.products) _productRow(product),
          ],
        ],
      ),
    );
  }

  Widget _productRow(ProductSalesTrend product) {
    final colour = product.direction > 0
        ? AppColors.success
        : product.direction < 0
        ? AppColors.danger
        : AppColors.muted;
    final percent = product.changePercent;
    final label = product.previousSqm == 0 && product.currentSqm > 0
        ? 'New'
        : product.direction == 0
        ? 'No change'
        : '${product.direction > 0 ? 'Up' : 'Down'} ${percent!.abs().toStringAsFixed(1)}%';
    return Padding(
      padding: const EdgeInsets.only(top: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            product.name,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
          ),
          Text(
            product.sku,
            style: const TextStyle(color: AppColors.muted, fontSize: 11),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                '${product.currentSqm.toStringAsFixed(2)} m² · ${product.currentBoxes} boxes',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    product.direction > 0
                        ? Icons.trending_up
                        : product.direction < 0
                        ? Icons.trending_down
                        : Icons.trending_flat,
                    size: 18,
                    color: colour,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    label,
                    style: TextStyle(
                      color: colour,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Previous: ${product.previousSqm.toStringAsFixed(2)} m² · ${product.previousBoxes} boxes',
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
