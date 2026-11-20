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
  Widget _customerDocumentPreview() {
    final docs =
        referenceCustomerDocuments(context, _customer)
            .where(
              (d) =>
                  d.status ==
                  [
                    SalesDocumentStatus.quotation,
                    SalesDocumentStatus.order,
                    SalesDocumentStatus.invoice,
                  ][_documentTab],
            )
            .toList()
          ..sort(
            (a, b) => (b.invoiceDate ?? b.createdAt).compareTo(
              a.invoiceDate ?? a.createdAt,
            ),
          );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_documentTab == 2 && docs.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 9),
            child: Text(
              '${_cash(docs.fold<double>(0, (n, d) => n + d.balanceDue), cents: true)} outstanding · incl GST',
              style: const TextStyle(fontSize: 11, color: detailMuted),
            ),
          ),
        detailCard(
          Column(
            children: [
              for (final d in docs) ...[
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 2,
                  ),
                  leading: const DetailGlyph(
                    'doc',
                    size: 18,
                    color: detailMuted,
                  ),
                  title: Text(
                    d.number,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    '${DateFormat('d MMM yyyy').format(d.invoiceDate ?? d.createdAt)}${d.dueDate == null ? '' : ' · due ${DateFormat('d MMM').format(d.dueDate!)}'}',
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  ),
                  trailing: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _cash(d.total, cents: true),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      detailBadge(
                        d.status == SalesDocumentStatus.quotation
                            ? 'Draft'
                            : d.status == SalesDocumentStatus.order
                            ? 'Confirmed'
                            : d.balanceDue == 0
                            ? 'Paid'
                            : 'Outstanding',
                      ),
                    ],
                  ),
                  onTap: () => dashboardOpen(
                    context,
                    SalesDocumentDetailScreen(document: d),
                  ),
                ),
                if (d != docs.last) const Divider(height: 1, color: detailLine),
              ],
              if (docs.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(20),
                  child: Text(
                    'No documents recorded.',
                    style: TextStyle(fontSize: 13, color: detailMuted),
                  ),
                ),
            ],
          ),
        ),
      ],
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
