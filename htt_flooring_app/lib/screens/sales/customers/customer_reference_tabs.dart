part of 'customer_detail_screen.dart';

extension _CustomerReferenceTabs on _ReferenceCustomerDetailState {
  Widget _segments(
    List<String> labels,
    String value,
    ValueChanged<String> change,
  ) => Container(
    padding: const EdgeInsets.all(3),
    decoration: BoxDecoration(
      color: const Color(0xFFEDF0EE),
      borderRadius: BorderRadius.circular(10),
    ),
    child: Row(
      children: [
        for (final label in labels)
          Expanded(
            child: InkWell(
              onTap: () => change(label),
              child: Container(
                alignment: Alignment.center,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: label == value ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: label == value
                        ? FontWeight.w600
                        : FontWeight.w400,
                    color: label == value ? detailGreen : detailMuted,
                  ),
                ),
              ),
            ),
          ),
      ],
    ),
  );
  Widget _sales() {
    final now = DateTime.now();
    final invoices = context
        .read<SalesDocumentService>()
        .getCustomerInvoices(_customer.id)
        .where(
          (d) => now.difference(d.invoiceDate ?? d.createdAt).inDays < _period,
        )
        .toList();
    final amount = _abc
        ? (_period == 30
              ? 20861.09
              : _period == 90
              ? 68420.32
              : 231780.45)
        : invoices.fold<double>(0, (s, d) => s + d.subtotal);
    final volume = _abc
        ? (_period == 30
              ? 355.98
              : _period == 90
              ? 1164.2
              : 3896.8)
        : invoices.fold<double>(
            0,
            (s, d) => s + d.items.fold<double>(0, (s, i) => s + i.sqm),
          );
    final boxes = _abc
        ? (_period == 30
              ? 197
              : _period == 90
              ? 643
              : 2171)
        : invoices.fold<int>(
            0,
            (s, d) => s + d.items.fold<int>(0, (s, i) => s + i.boxes),
          );
    final categories = <String, double>{};
    for (final d in invoices) {
      for (final i in d.items) {
        categories.update(
          i.product.category,
          (v) => v + i.subtotal,
          ifAbsent: () => i.subtotal,
        );
      }
    }
    final summary = _abc
        ? <String, double>{
            'Engineered': 13717.8,
            'Hybrid': 4180,
            'Laminate': 2678.29,
            'Accessories': 285,
          }
        : categories;
    String categoryMetric(String name, double value) {
      if (_salesUnit == 'Value') return _cash(value, cents: true);
      if (_abc) {
        final area = {
          'Engineered': 193.8,
          'Hybrid': 88.0,
          'Laminate': 74.2,
          'Accessories': 0.0,
        };
        final count = {
          'Engineered': 95,
          'Hybrid': 40,
          'Laminate': 32,
          'Accessories': 30,
        };
        return _salesUnit == 'm²'
            ? '${area[name] ?? 0} m²'
            : '${count[name] ?? 0} boxes';
      }
      final lines = invoices
          .expand((d) => d.items)
          .where((i) => i.product.category == name);
      return _salesUnit == 'm²'
          ? '${lines.fold<double>(0, (sum, i) => sum + i.sqm).toStringAsFixed(2)} m²'
          : '${lines.fold<int>(0, (sum, i) => sum + i.boxes)} boxes';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 14),
        _segments(
          ['Last 30 days', 'Last 90 days', 'Last 12 months'],
          _period == 30
              ? 'Last 30 days'
              : _period == 90
              ? 'Last 90 days'
              : 'Last 12 months',
          (v) => _refresh(
            () => _period = v == 'Last 30 days'
                ? 30
                : v == 'Last 90 days'
                ? 90
                : 365,
          ),
        ),
        const SizedBox(height: 12),
        detailCard(
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 13),
            child: Row(
              children: [
                _stat(
                  'Sales · ex GST',
                  _cash(amount, cents: true),
                  _abc ? 'Up 53.9%' : '',
                  color: detailGreen,
                ),
                _stat(
                  'Volume',
                  '${NumberFormat('#,##0.00').format(volume)} m²',
                  _abc ? 'Up 39.5%' : '',
                ),
                _stat('Boxes / pcs', '$boxes', _abc ? 'Up 72.8%' : ''),
              ],
            ),
          ),
        ),
        const SizedBox(height: 7),
        Text(
          '${_day(now.subtract(Duration(days: _period - 1)))} – ${_day(now)} · vs previous $_period days',
          style: const TextStyle(fontSize: 10, color: detailMuted),
        ),
        const SizedBox(height: 14),
        detailCard(
          Padding(
            padding: const EdgeInsets.all(13),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Sales trend',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 3),
                const Text(
                  'Weekly · ex GST       This period       Previous',
                  style: TextStyle(fontSize: 10, color: detailMuted),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 126,
                  width: double.infinity,
                  child: CustomPaint(
                    painter: _CustomerTrend(
                      _abc
                          ? const [0, 0, 0, 15156, 5705]
                          : List<double>.generate(
                              5,
                              (i) => invoices
                                  .where(
                                    (d) =>
                                        now
                                                .difference(
                                                  d.invoiceDate ?? d.createdAt,
                                                )
                                                .inDays ~/
                                            mathMax(1, _period ~/ 5) ==
                                        i,
                                  )
                                  .fold<double>(
                                    0,
                                    (sum, d) => sum + d.subtotal,
                                  ),
                            ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        detailHeading('By product'),
        _segments(
          ['Value', 'm²', 'Boxes'],
          _salesUnit,
          (v) => _refresh(() => _salesUnit = v),
        ),
        const SizedBox(height: 10),
        detailCard(
          Column(
            children: [
              for (final e in summary.entries) ...[
                InkWell(
                  onTap: () => _refresh(
                    () => _productOpen.contains(e.key)
                        ? _productOpen.remove(e.key)
                        : _productOpen.add(e.key),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(13),
                    child: Row(
                      children: [
                        DetailGlyph(
                          e.key == 'Accessories' ? 'box' : 'layers',
                          size: 18,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                e.key,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                categoryMetric(e.key, e.value),
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: detailMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (_abc)
                          detailBadge(
                            e.key == 'Laminate'
                                ? 'Down 25.1%'
                                : e.key == 'Accessories'
                                ? 'New'
                                : 'Up ${e.key == 'Engineered' ? '69.4' : '110.5'}%',
                          ),
                        const SizedBox(width: 8),
                        DetailGlyph(
                          _productOpen.contains(e.key) ? 'down' : 'chevron',
                          size: 13,
                        ),
                      ],
                    ),
                  ),
                ),
                if (_productOpen.contains(e.key))
                  Padding(
                    padding: const EdgeInsets.fromLTRB(18, 0, 18, 12),
                    child: Column(
                      children: [
                        for (final s in _catalog.where(
                          (s) => s.category.contains(e.key),
                        ))
                          ListTile(
                            dense: true,
                            contentPadding: EdgeInsets.zero,
                            title: Text(
                              s.name,
                              style: const TextStyle(fontSize: 12),
                            ),
                            subtitle: Text(
                              '${s.colours.length} colours',
                              style: const TextStyle(
                                fontSize: 10,
                                color: detailMuted,
                              ),
                            ),
                            trailing: Text(
                              'From ${_cash(s.colours.first.product.standardPrice, cents: true)}/m²',
                              style: const TextStyle(fontSize: 11),
                            ),
                          ),
                      ],
                    ),
                  ),
                const Divider(height: 1, color: detailLine),
              ],
            ],
          ),
        ),
        const SizedBox(height: 9),
        const Text(
          'All figures ex GST, from invoices. Change compares m² (value for accessories).',
          style: TextStyle(fontSize: 10, color: detailMuted, height: 1.5),
        ),
        detailHeading(
          'Documents',
          action: '+ Request quote',
          onTap: _openQuoteRequest,
        ),
        _segments(
          ['Quotes', 'Orders', 'Invoices'],
          ['Quotes', 'Orders', 'Invoices'][_documentTab],
          (v) => _refresh(
            () => _documentTab = ['Quotes', 'Orders', 'Invoices'].indexOf(v),
          ),
        ),
        const SizedBox(height: 9),
        _customerDocumentPreview(),
      ],
    );
  }

  Widget _customerDocumentPreview() {
    final docs = referenceCustomerDocuments(context, _customer)
        .where(
          (d) =>
              d.status ==
              [
                SalesDocumentStatus.quotation,
                SalesDocumentStatus.order,
                SalesDocumentStatus.invoice,
              ][_documentTab],
        )
        .toList();
    return detailCard(
      Column(
        children: [
          for (final d in docs)
            ListTile(
              title: Text(
                d.number,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              subtitle: Text(
                _day(d.createdAt),
                style: const TextStyle(fontSize: 11, color: detailMuted),
              ),
              trailing: Text(
                _cash(d.total, cents: true),
                style: const TextStyle(fontSize: 13),
              ),
              onTap: () => dashboardOpen(
                context,
                SalesDocumentDetailScreen(document: d),
              ),
            ),
          if (docs.isEmpty && !_abc)
            const Padding(
              padding: EdgeInsets.all(20),
              child: Text(
                'No documents recorded.',
                style: TextStyle(fontSize: 13, color: detailMuted),
              ),
            ),
        ],
      ),
    );
  }

  Widget _activity() {
    final actual = context.read<CustomerNoteService>().getCustomerNotes(
      _customer.id,
    );
    final demos = _abc ? _referenceNotes() : <CustomerNote>[];
    final all = [...actual, ...demos]
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    final rows = all
        .where(
          (n) =>
              _activityFilter == 'All' ||
              (_activityFilter == 'Visits'
                  ? n.noteType == 'Customer Visit'
                  : _activityFilter == 'Notes'
                  ? !n.isFollowUp && n.noteType != 'Customer Visit'
                  : n.isFollowUp),
        )
        .toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: detailAction(
            'Note & Task',
            'plus',
            _addActivity,
            filled: true,
          ),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final f in ['All', 'Visits', 'Notes', 'Follow-ups'])
                Padding(
                  padding: const EdgeInsets.only(right: 7),
                  child: ChoiceChip(
                    label: Text(
                      '$f (${all.where((n) => f == 'All' || (f == 'Visits'
                              ? n.noteType == 'Customer Visit'
                              : f == 'Notes'
                              ? !n.isFollowUp && n.noteType != 'Customer Visit'
                              : n.isFollowUp)).length})',
                      style: TextStyle(
                        fontSize: 11,
                        color: _activityFilter == f
                            ? Colors.white
                            : detailMuted,
                      ),
                    ),
                    showCheckmark: false,
                    selected: _activityFilter == f,
                    onSelected: (_) => _refresh(() => _activityFilter = f),
                    selectedColor: detailGreen,
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: const BorderSide(color: detailLine),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        detailCard(
          Column(
            children: [
              for (final n in rows) ...[
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 5,
                  ),
                  leading: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: n.isFollowUp
                          ? const Color(0xFFFFF3DA)
                          : detailPale,
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: DetailGlyph(
                      n.noteType == 'Customer Visit'
                          ? 'pin'
                          : n.isFollowUp
                          ? 'calendar'
                          : 'doc',
                      size: 16,
                    ),
                  ),
                  title: Text(
                    n.isFollowUp ? n.content : n.noteType ?? 'Note',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13),
                  ),
                  subtitle: Text(
                    n.isFollowUp
                        ? '${n.followUpType ?? 'Task'} · follow-up'
                        : n.content,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: detailMuted),
                  ),
                  trailing: detailBadge(
                    n.isCompleted
                        ? 'Completed'
                        : n.isFollowUp
                        ? 'Today'
                        : _day(n.createdAt),
                  ),
                  onTap: () => _openReferenceActivity(
                    n,
                    isExample: demos.any((d) => d.id == n.id),
                  ),
                ),
                const Divider(height: 1, color: detailLine),
              ],
              if (rows.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(22),
                  child: Text(
                    'No activity yet.',
                    style: TextStyle(fontSize: 13, color: detailMuted),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  List<CustomerNote> _referenceNotes() {
    final today = DateUtils.dateOnly(DateTime.now());
    final user = context.read<AppSession>().currentUser;
    return [
      for (final e in <(String, String, String, int, bool)>[
        (
          'Product Feedback',
          'Customer interested in the new MTF colours.',
          '',
          0,
          false,
        ),
        (
          'Task',
          'INV-10548 due today (\$8,682.96 incl. GST)',
          'Payment Follow-up',
          0,
          false,
        ),
        (
          'Task',
          'Deliver Heritage Smoked Oak colour panel (DBR-0412)',
          'Sample Delivery',
          0,
          false,
        ),
        (
          'Task',
          'Payment received and verified. INV-10490 settled.',
          'Payment Follow-up',
          -1,
          true,
        ),
        (
          'Task',
          'Chase QT-1004 — John wants Bonita for the Mosman showroom',
          'Quotation / Order Follow-up',
          0,
          false,
        ),
        (
          'Task',
          'Quarterly display check — Mosman showroom',
          'Customer Visit',
          -1,
          true,
        ),
        (
          'Sales Discussion',
          'Discussed the showroom quote and delivery options.',
          '',
          -1,
          false,
        ),
        (
          'Customer Visit',
          'Reviewed Bonita stock for the showroom refit. Order SO-2051 confirmed.',
          '',
          -3,
          false,
        ),
        ('Customer Visit', 'Checked display boards.', '', -17, false),
      ])
        CustomerNote(
          id: 'customer-example-${e.$1}-${e.$2.hashCode}',
          customerId: _customer.id,
          type: e.$1 == 'Task'
              ? CustomerNoteType.followUp
              : CustomerNoteType.note,
          content: e.$2,
          createdAt: today.add(Duration(days: e.$4)),
          followUpDate: e.$1 == 'Task' ? today : null,
          followUpStatus: e.$1 == 'Task'
              ? (e.$5 ? FollowUpStatus.completed : FollowUpStatus.pending)
              : null,
          noteType: e.$1 == 'Task' ? null : e.$1,
          followUpType: e.$3.isEmpty ? null : e.$3,
          creatorId: user.id,
          authorName: user.name,
          assignees: [user],
          priority: 'Normal',
          reminder: '1 day before',
        ),
    ];
  }

  Future<void> _openReferenceActivity(
    CustomerNote note, {
    required bool isExample,
  }) async {
    final service = isExample
        ? CustomerNoteService(initialNotes: [note])
        : context.read<CustomerNoteService>();
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChangeNotifierProvider.value(
          value: service,
          child: note.isFollowUp
              ? FollowUpDetail(customer: _customer, taskId: note.id)
              : AddNoteScreen(customer: _customer, existing: note),
        ),
      ),
    );
    if (isExample) service.dispose();
    if (mounted) _refresh(() {});
  }

  bool _matchesPriceSeries(StockSeries s) =>
      '${s.name} ${s.colours.map((c) => '${c.product.colour} ${c.product.sku}').join(' ')}'
          .toLowerCase()
          .contains(_priceQuery.toLowerCase());
  Widget _pricing() => Column(
    children: [
      const SizedBox(height: 12),
      TextField(
        onChanged: (v) => _refresh(() => _priceQuery = v),
        decoration: detailInput(hint: 'Search series, colour or SKU')
            .copyWith(prefixIcon: const Icon(Icons.search, size: 17)),
      ),
      const SizedBox(height: 12),
      for (final cat in [
        'Engineered Timber',
        'Hybrid',
        'Laminate',
        'Accessories',
      ])
        if (_catalog.any((s) => s.category == cat && _matchesPriceSeries(s)))
          _priceCategory(cat),
      if (!_catalog.any(_matchesPriceSeries))
        const Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'No matching prices.',
            style: TextStyle(fontSize: 12, color: detailMuted),
          ),
        ),
    ],
  );
  Widget _priceCategory(String category) {
    final series = _catalog
        .where((s) => s.category == category && _matchesPriceSeries(s))
        .toList();
    final colours = series.expand((s) => s.colours).toList();
    final pricing = context.read<PricingService>();
    final saving = colours.isEmpty
        ? 0.0
        : colours
                  .map(
                    (c) => c.product.standardPrice == 0
                        ? 0.0
                        : (1 -
                                  pricing.getCustomerPrice(
                                        customerId: _customer.id,
                                        product: c.product,
                                      ) /
                                      c.product.standardPrice) *
                              100,
                  )
                  .reduce((a, b) => a + b) /
              colours.length;
    final open = _priceOpen.contains(category) || _priceQuery.isNotEmpty;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: detailCard(
        Column(
          children: [
            ListTile(
              leading: DetailGlyph(
                category == 'Accessories' ? 'box' : 'layers',
                size: 20,
              ),
              title: Text(
                category == 'Engineered Timber' ? 'Engineered' : category,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              subtitle: Text(
                '${series.length} series · avg save ${saving.toStringAsFixed(1)}%',
                style: const TextStyle(fontSize: 11, color: detailMuted),
              ),
              trailing: DetailGlyph(open ? 'down' : 'chevron', size: 14),
              onTap: () => _refresh(
                () => _priceOpen.contains(category)
                    ? _priceOpen.remove(category)
                    : _priceOpen.add(category),
              ),
            ),
            if (open)
              for (final row in series) _priceSeries(row),
          ],
        ),
      ),
    );
  }

  Widget _priceSeries(StockSeries series) {
    final pricing = context.read<PricingService>();
    final prices =
        series.colours
            .map(
              (c) => pricing.getCustomerPrice(
                customerId: _customer.id,
                product: c.product,
              ),
            )
            .toList()
          ..sort();
    final standard = series.colours.first.product.standardPrice;
    final price = prices.first;
    final saving = standard == 0 ? 0.0 : (1 - price / standard) * 100;
    return Column(
      children: [
        const Divider(height: 1, color: detailLine),
        ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 14),
          leading: InventorySwatch(seed: series.id, size: 34),
          title: Text(
            series.name,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
          subtitle: Text(
            '${series.colours.length} colours',
            style: const TextStyle(fontSize: 11, color: detailMuted),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'from ${_cash(price, cents: true)} /${series.priceUnit}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: detailGreen,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'std ${_cash(standard, cents: true)} · −${saving.toStringAsFixed(1)}%',
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  ),
                ],
              ),
              const SizedBox(width: 7),
              const DetailGlyph('chevron', size: 13),
            ],
          ),
          onTap: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => CustomerSeriesPriceScreen(
                  customer: _customer,
                  series: series,
                ),
              ),
            );
            if (mounted) _refresh(() {});
          },
        ),
      ],
    );
  }

  Widget _rebate() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const SizedBox(height: 14),
      detailCard(
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Row(
            children: [
              _stat(
                'Settled 2026',
                _abc ? '\$1,496.00' : '\$0',
                '${_abc ? 2 : 0} rebates',
              ),
              _stat('In progress', _abc ? '2' : '0', 'Q4 2026'),
              _stat('Earned so far', '\$0.00', 'this period'),
            ],
          ),
        ),
      ),
      detailHeading('In progress', action: 'Q4 2026 · 43 days left'),
      if (_abc) ...[
        for (final r in [
          ('Bonita Natural Oak', 300.0, 3.0, 279.4),
          ('Guardian D3016', 200.0, 2.0, 129.8),
        ])
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: detailCard(
              Padding(
                padding: const EdgeInsets.all(13),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      r.$1,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Min ${r.$2.toInt()} m² · ${_cash(r.$3, cents: true)}/m² rebate',
                            style: const TextStyle(
                              fontSize: 11,
                              color: detailMuted,
                            ),
                          ),
                        ),
                        Text(
                          _cash(r.$2 * r.$3, cents: true),
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 11),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: r.$4 / r.$2,
                        color: detailGreen,
                        backgroundColor: detailLine,
                        minHeight: 5,
                      ),
                    ),
                    const SizedBox(height: 7),
                    Text(
                      '${r.$4.toStringAsFixed(2)} m² of ${r.$2.toInt()} m² · ${(r.$2 - r.$4).toStringAsFixed(2)} m² to go',
                      style: const TextStyle(fontSize: 11, color: detailMuted),
                    ),
                  ],
                ),
              ),
            ),
          ),
        detailHeading('Settled'),
        detailCard(
          Column(
            children: [
              for (final r in [
                (
                  'Bonita Natural Oak',
                  'Jul–Sep 2026 · 352 m² × \$3.00',
                  '\$1,056.00',
                  'paid 15 Oct',
                ),
                (
                  'Guardian D3016',
                  'Apr–Jun 2026 · 220 m² × \$2.00',
                  '\$440.00',
                  'paid 14 Jul',
                ),
              ])
                ListTile(
                  leading: const DetailGlyph('doc', size: 18),
                  title: Text(
                    r.$1,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    r.$2,
                    style: const TextStyle(fontSize: 11, color: detailMuted),
                  ),
                  trailing: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        r.$3,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        r.$4,
                        style: const TextStyle(
                          fontSize: 10,
                          color: detailMuted,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ] else
        const Padding(
          padding: EdgeInsets.all(20),
          child: Text(
            'No rebate records for this customer.',
            style: TextStyle(fontSize: 13, color: detailMuted),
          ),
        ),
      const SizedBox(height: 12),
      detailAction(
        'View rebate history',
        'doc',
        () =>
            dashboardOpen(context, CustomerRebatesScreen(customer: _customer)),
      ),
      const SizedBox(height: 10),
      const Text(
        'All amounts ex GST. Progress counts invoiced m² in the period.',
        style: TextStyle(fontSize: 10, color: detailMuted),
      ),
    ],
  );
}

int mathMax(int a, int b) => a > b ? a : b;

class _CustomerTrend extends CustomPainter {
  _CustomerTrend(this.values);
  final List<double> values;
  @override
  void paint(Canvas c, Size s) {
    final max = values.fold<double>(1, (a, b) => a > b ? a : b);
    final grid = Paint()
      ..color = detailLine
      ..strokeWidth = 1;
    for (var i = 0; i < 3; i++) {
      c.drawLine(
        Offset(0, s.height * i / 2),
        Offset(s.width, s.height * i / 2),
        grid,
      );
    }
    final width = s.width / values.length;
    for (var i = 0; i < values.length; i++) {
      final h = values[i] / max * (s.height - 12);
      c.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(i * width + width * .2, s.height - h, width * .55, h),
          const Radius.circular(3),
        ),
        Paint()..color = detailGreen,
      );
    }
  }

  @override
  bool shouldRepaint(_CustomerTrend old) => old.values != values;
}
