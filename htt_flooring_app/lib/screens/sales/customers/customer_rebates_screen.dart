import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../models/customer.dart';
import '../../../models/customer_rebate.dart';
import '../../../services/customer_rebate_service.dart';
import '../../../services/app_session.dart';
import '../../../theme/app_theme.dart';

class CustomerRebatesScreen extends StatefulWidget {
  const CustomerRebatesScreen({super.key, required this.customer});
  final Customer customer;
  @override
  State<CustomerRebatesScreen> createState() => _CustomerRebatesScreenState();
}

class _CustomerRebatesScreenState extends State<CustomerRebatesScreen> {
  final _search = TextEditingController();
  String _cycle = 'All Cycles';
  late bool _sample =
      AppSession.demoLoginEnabled && widget.customer.id == 'abc';
  final _money = NumberFormat.currency(locale: 'en_AU', symbol: '\$');
  String _date(String value) =>
      DateFormat('dd MMM yyyy').format(DateTime.parse(value));
  String _area(double value) => '${NumberFormat('#,##0.00').format(value)} m²';
  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Widget _summary(String label, String value, String hint) => Container(
    padding: const EdgeInsets.all(13),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: AppColors.border),
      borderRadius: BorderRadius.circular(12),
    ),
    constraints: const BoxConstraints(minHeight: 120),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.muted),
        ),
        const SizedBox(height: 7),
        SizedBox(
          height: 27,
          width: double.infinity,
          child: FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              maxLines: 1,
              style: const TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w700,
                color: AppColors.green,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          hint,
          style: const TextStyle(fontSize: 10, color: AppColors.muted),
        ),
      ],
    ),
  );
  void _clear() {
    setState(() {
      _search.clear();
      _cycle = 'All Cycles';
    });
  }

  @override
  Widget build(BuildContext context) {
    final records = CustomerRebate.filter(
      _sample
          ? const CustomerRebateService().sampleFor(widget.customer.id)
          : <CustomerRebate>[],
      widget.customer.id,
    );
    final visible = CustomerRebate.filter(
      records,
      widget.customer.id,
      query: _search.text,
      cycle: _cycle,
    );
    final total = records.fold<int>(0, (sum, r) => sum + r.amountCents);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Rebate')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            widget.customer.businessName,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppColors.green,
            ),
          ),
          const SizedBox(height: 5),
          const Text(
            'Historical product rebates and settlement periods.',
            style: TextStyle(fontSize: 12, color: AppColors.muted),
          ),
          if (AppSession.demoLoginEnabled && widget.customer.id == 'abc')
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text(
                'Sample rebate history',
                style: TextStyle(fontSize: 13),
              ),
              subtitle: const Text(
                'Preview records only · not live settlements',
                style: TextStyle(fontSize: 11),
              ),
              value: _sample,
              onChanged: (v) => setState(() => _sample = v),
            ),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, c) => Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final summary in [
                  (
                    'Rebate Records',
                    '${records.length}',
                    'historical settlements',
                  ),
                  (
                    'Total Rebates',
                    _money.format(total / 100),
                    'AUD · excluding GST',
                  ),
                  (
                    'Latest Settlement',
                    records.isEmpty ? '—' : _date(records.first.settledOn),
                    'settlement date',
                  ),
                ])
                  SizedBox(
                    width: c.maxWidth < 340
                        ? c.maxWidth
                        : (c.maxWidth - 16) / 3,
                    child: _summary(summary.$1, summary.$2, summary.$3),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _search,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Search product, SKU or rebate number…',
              hintStyle: const TextStyle(fontSize: 12),
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _search.text.isEmpty
                  ? null
                  : IconButton(
                      tooltip: 'Clear search',
                      onPressed: () => setState(() => _search.clear()),
                      icon: const Icon(Icons.close),
                    ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 10),
          DropdownButtonFormField<String>(
            key: ValueKey(_cycle),
            initialValue: _cycle,
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Settlement Cycle'),
            items: [
              for (final cycle in ['All Cycles', 'Monthly', 'Quarterly'])
                DropdownMenuItem(value: cycle, child: Text(cycle)),
            ],
            onChanged: (v) => setState(() => _cycle = v!),
          ),
          const SizedBox(height: 14),
          if (visible.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Icon(
                      Icons.receipt_long_outlined,
                      color: AppColors.muted,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      records.isEmpty
                          ? 'No rebate history available for this customer.'
                          : 'No rebate records match your search.',
                      textAlign: TextAlign.center,
                    ),
                    if (records.isNotEmpty)
                      TextButton(
                        onPressed: _clear,
                        child: const Text('Clear Filters'),
                      ),
                  ],
                ),
              ),
            ),
          LayoutBuilder(
            builder: (context, c) => c.maxWidth >= 850
                ? _table(visible)
                : Column(children: [for (final r in visible) _record(r)]),
          ),
          const SizedBox(height: 10),
          Text(
            _sample
                ? 'Sample historical settlements · Amounts in AUD, excluding GST.'
                : 'Amounts in AUD, excluding GST.',
            style: const TextStyle(fontSize: 11, color: AppColors.muted),
          ),
        ],
      ),
    );
  }

  Widget _record(CustomerRebate r) => Card(
    margin: const EdgeInsets.only(bottom: 12),
    child: Padding(
      padding: const EdgeInsets.all(15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  r.number,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
              if (_sample)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 7,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.warningLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Sample',
                    style: TextStyle(fontSize: 10, color: AppColors.copper),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            r.productName,
            style: const TextStyle(
              color: AppColors.copper,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            r.sku,
            style: const TextStyle(fontSize: 11, color: AppColors.muted),
          ),
          const Divider(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _info('Minimum Quantity', _area(r.minimumQuantity)),
              ),
              Expanded(child: _info('Rebate / m²', _money.format(r.rate))),
            ],
          ),
          const SizedBox(height: 13),
          _info(
            'Cycle / Period',
            '${r.cycle}\n${_date(r.starts)} – ${_date(r.ends)}',
          ),
          const SizedBox(height: 13),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _info('Settled Quantity', _area(r.settledQuantity)),
              ),
              Expanded(
                child: _info(
                  'Rebate Amount',
                  _money.format(r.amountCents / 100),
                ),
              ),
            ],
          ),
          const SizedBox(height: 13),
          _info('Settled On', _date(r.settledOn)),
        ],
      ),
    ),
  );
  Widget _info(String label, String value) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(label, style: const TextStyle(fontSize: 11, color: AppColors.muted)),
      const SizedBox(height: 4),
      Text(
        value,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppColors.green,
        ),
      ),
    ],
  );
  Widget _table(List<CustomerRebate> records) => SingleChildScrollView(
    scrollDirection: Axis.horizontal,
    child: DataTable(
      columnSpacing: 28,
      headingRowColor: const WidgetStatePropertyAll(AppColors.ivory),
      columns: [
        for (final label in [
          'Rebate / Product',
          'Minimum Quantity',
          'Rebate / m²',
          'Cycle / Period',
          'Settled Quantity',
          'Rebate Amount',
          'Settled On',
        ])
          DataColumn(
            label: Text(
              label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
            ),
          ),
      ],
      dataRowMinHeight: 92,
      dataRowMaxHeight: 108,
      rows: [
        for (final r in records)
          DataRow(
            cells: [
              DataCell(
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(r.number),
                    Text(
                      r.productName,
                      style: const TextStyle(color: AppColors.copper),
                    ),
                    Text(
                      r.sku,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.muted,
                      ),
                    ),
                  ],
                ),
              ),
              DataCell(Text(_area(r.minimumQuantity))),
              DataCell(Text(_money.format(r.rate))),
              DataCell(
                Text('${r.cycle}\n${_date(r.starts)} – ${_date(r.ends)}'),
              ),
              DataCell(Text(_area(r.settledQuantity))),
              DataCell(Text(_money.format(r.amountCents / 100))),
              DataCell(Text(_date(r.settledOn))),
            ],
          ),
      ],
    ),
  );
}
