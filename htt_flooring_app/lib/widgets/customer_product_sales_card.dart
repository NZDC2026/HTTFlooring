import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/customer_product_sales.dart';
import '../data/customer_product_sales_demo.dart';
import '../models/sales_document.dart';
import '../services/sales_document_service.dart';
import '../theme/app_theme.dart';

enum _SalesMetric { value, volume, boxes }

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
  _SalesMetric _metric = _SalesMetric.value;
  bool _expanded = true;
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
      annual: _days == 365,
    );
    final total = ProductSalesGroup('Total');
    for (final group in report.groups) {
      total.add(group.trend);
    }
    final groups = [...report.groups]
      ..sort((a, b) => _amount(b.trend).compareTo(_amount(a.trend)));
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
      child: Material(
        type: MaterialType.transparency,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text(
                'Product Sales',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
              ),
              trailing: Icon(_expanded ? Icons.expand_less : Icons.expand_more),
              onTap: () => setState(() => _expanded = !_expanded),
            ),
            if (_expanded) ...[
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
              SizedBox(
                width: double.infinity,
                child: SegmentedButton<int>(
                  showSelectedIcon: false,
                  style: const ButtonStyle(
                    padding: WidgetStatePropertyAll(
                      EdgeInsets.symmetric(horizontal: 4),
                    ),
                    textStyle: WidgetStatePropertyAll(TextStyle(fontSize: 11)),
                  ),
                  segments: const [
                    ButtonSegment(value: 30, label: Text('Last 30 days')),
                    ButtonSegment(value: 90, label: Text('Last 90 days')),
                    ButtonSegment(value: 365, label: Text('Last 12 months')),
                  ],
                  selected: {_days},
                  onSelectionChanged: (v) => setState(() => _days = v.first),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                period(report.start, report.end),
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
              Text(
                'vs ${period(report.previousStart, report.start)}',
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _summary(
                    'Total Sales',
                    _money(total.trend.currentSales),
                    total.trend.currentSales,
                    total.trend.previousSales,
                  ),
                  const SizedBox(width: 6),
                  _summary(
                    'Total Volume',
                    '${total.trend.currentSqm.toStringAsFixed(2)} m²',
                    total.trend.currentSqm,
                    total.trend.previousSqm,
                  ),
                  const SizedBox(width: 6),
                  _summary(
                    'Total Boxes',
                    '${total.trend.currentBoxes}',
                    total.trend.currentBoxes,
                    total.trend.previousBoxes,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text(
                'Sales by Product',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              Wrap(
                spacing: 6,
                children: [
                  for (final metric in _SalesMetric.values)
                    FilterChip(
                      label: Text(
                        'By ${metric.name[0].toUpperCase()}${metric.name.substring(1)}',
                      ),
                      selected: _metric == metric,
                      showCheckmark: false,
                      onSelected: (_) => setState(() => _metric = metric),
                    ),
                ],
              ),
              if (report.products.isEmpty)
                const Text(
                  'No product sales in these periods.',
                  style: TextStyle(color: AppColors.muted),
                ),
              for (final group in groups)
                _groupRow(
                  group,
                  group.trend.name,
                  total: _amount(total.trend).toDouble(),
                ),
              const SizedBox(height: 14),
              _panel(
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Total Sales Trend (AUD)',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    _change(
                      total.trend.currentSales,
                      total.trend.previousSales,
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      height: 96,
                      child: CustomPaint(
                        painter: _SalesLine(report.salesBuckets),
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(DateFormat.MMMd().format(report.start)),
                        Text(
                          DateFormat.MMMd().format(
                            DateTime(
                              report.end.year,
                              report.end.month,
                              report.end.day - 1,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Sales excl. GST · category trends by m² · returns not deducted',
                style: TextStyle(color: AppColors.muted, fontSize: 11),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _groupRow(ProductSalesGroup group, String path, {double? total}) {
    return ExpansionTile(
      key: PageStorageKey(path),
      tilePadding: EdgeInsets.zero,
      childrenPadding: const EdgeInsets.only(left: 12),
      leading: total == null
          ? null
          : CircleAvatar(
              backgroundColor: AppColors.copperLight,
              foregroundColor: AppColors.copper,
              child: Icon(
                group.trend.name == 'Accessories'
                    ? Icons.inventory_2_outlined
                    : Icons.layers_outlined,
                size: 18,
              ),
            ),
      title: Text(
        group.trend.name,
        style: const TextStyle(fontWeight: FontWeight.w700),
      ),
      subtitle: total == null
          ? _trend(group.trend)
          : _categorySummary(group.trend, total),
      children: [
        for (final series in group.series.values)
          _groupRow(series, '$path/${series.trend.name}'),
        for (final product in group.colours)
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(product.colour.isEmpty ? product.name : product.colour),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [Text(product.sku), _trend(product)],
            ),
          ),
        if (group.series.isEmpty && group.colours.isEmpty)
          const ListTile(title: Text('No sales in these periods.')),
      ],
    );
  }

  String _money(double value) =>
      NumberFormat.simpleCurrency(name: 'AUD', decimalDigits: 2).format(value);

  num _amount(ProductSalesTrend trend) => switch (_metric) {
    _SalesMetric.value => trend.currentSales,
    _SalesMetric.volume => trend.currentSqm,
    _SalesMetric.boxes => trend.currentBoxes,
  };

  Widget _panel(Widget child) => Container(
    padding: const EdgeInsets.all(8),
    decoration: BoxDecoration(
      color: AppColors.ivory,
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: AppColors.border),
    ),
    child: child,
  );

  Widget _summary(String title, String value, num current, num previous) =>
      Expanded(
        child: _panel(
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 10, color: AppColors.muted),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
              _change(current, previous),
            ],
          ),
        ),
      );

  Widget _change(num current, num previous, {bool category = false}) {
    final difference = current - previous;
    final unchanged = difference.abs() < 0.000001;
    final label = unchanged
        ? (category ? 'No change' : '0.0%')
        : previous == 0
        ? 'New'
        : category
        ? '${difference > 0 ? 'Up' : 'Down'} ${(difference.abs() / previous.abs() * 100).toStringAsFixed(1)}%'
        : '${difference > 0 ? '+' : ''}${(difference / previous.abs() * 100).toStringAsFixed(1)}%';
    return Text(
      label,
      style: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: unchanged
            ? AppColors.muted
            : difference > 0
            ? AppColors.success
            : AppColors.danger,
      ),
    );
  }

  Widget _categorySummary(ProductSalesTrend trend, double total) {
    final share = total <= 0 ? 0.0 : (_amount(trend) / total).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${_money(trend.currentSales)} · ${trend.currentSqm.toStringAsFixed(2)} m² · ${trend.currentBoxes} boxes',
          style: const TextStyle(fontSize: 11),
        ),
        const SizedBox(height: 5),
        LinearProgressIndicator(
          value: share,
          color: AppColors.green,
          backgroundColor: AppColors.border,
        ),
        Text(
          '${(share * 100).toStringAsFixed(1)}% of total',
          style: const TextStyle(fontSize: 10, color: AppColors.muted),
        ),
        _change(trend.currentSqm, trend.previousSqm, category: true),
      ],
    );
  }

  Widget _trend(ProductSalesTrend product) {
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
                  style: TextStyle(color: colour, fontWeight: FontWeight.w700),
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
    );
  }
}

class _SalesLine extends CustomPainter {
  _SalesLine(this.values);

  final List<double> values;

  @override
  void paint(Canvas canvas, Size size) {
    final maximum = values.fold(0.0, (max, value) => value > max ? value : max);
    final minimum = values.fold(0.0, (min, value) => value < min ? value : min);
    final range = maximum - minimum;
    final points = [
      for (var i = 0; i < values.length; i++)
        Offset(
          4 + i * (size.width - 8) / (values.length - 1),
          range == 0
              ? size.height - 4
              : 4 + (maximum - values[i]) / range * (size.height - 8),
        ),
    ];
    final line = Path()..addPolygon(points, false);
    final area = Path.from(line)
      ..lineTo(points.last.dx, size.height)
      ..lineTo(points.first.dx, size.height)
      ..close();
    canvas.drawPath(area, Paint()..color = AppColors.successLight);
    canvas.drawPath(
      line,
      Paint()
        ..color = AppColors.success
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
    for (final point in points) {
      canvas.drawCircle(point, 2.5, Paint()..color = AppColors.success);
    }
  }

  @override
  bool shouldRepaint(_SalesLine oldDelegate) => oldDelegate.values != values;
}
