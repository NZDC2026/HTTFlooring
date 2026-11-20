part of 'customer_detail_screen.dart';

class SalesQuoteRequestScreen extends StatefulWidget {
  const SalesQuoteRequestScreen({
    super.key,
    this.customer,
    this.initialProduct,
  });
  final Customer? customer;
  final Product? initialProduct;
  @override
  State<SalesQuoteRequestScreen> createState() => _ReferenceQuoteRequestState();
}

class _QuoteProduct {
  const _QuoteProduct(this.series, this.colour);
  final StockSeries series;
  final StockColour colour;
  Product get product => colour.product;
}

class _QuoteLineDraft {
  _QuoteLineDraft(
    this.selection, {
    String quantity = '',
    required this.coverage,
  }) : quantity = TextEditingController(text: quantity);
  final _QuoteProduct selection;
  final double coverage;
  final TextEditingController quantity;
  final price = TextEditingController();
  bool boxes = false;
  SalesQuoteQuantity? get calculation => SalesQuoteQuantity.parse(
    quantity.text,
    flooring: selection.series.flooring,
    boxes: boxes,
    coverage: coverage,
  );
  double? get specialPrice =>
      price.text.trim().isEmpty ? null : double.tryParse(price.text.trim());
  bool get priceValid =>
      price.text.trim().isEmpty ||
      (specialPrice != null && specialPrice!.isFinite && specialPrice! > 0);
  bool get belowFloor =>
      price.text.trim().isNotEmpty &&
      priceValid &&
      specialPrice! < selection.product.salesFloorPrice;
  void dispose() {
    quantity.dispose();
    price.dispose();
  }
}

class _ReferenceQuoteRequestState extends State<SalesQuoteRequestScreen> {
  late Customer? _customer = widget.customer;
  final _note = TextEditingController();
  final _items = <_QuoteLineDraft>[];
  DateTime _needed = DateUtils.dateOnly(DateTime.now())
      .add(const Duration(days: 2));
  int _hold = 7;
  String _batch = 'One batch only';
  String? _error;
  bool _saving = false;
  List<StockSeries> get _catalog => inventoryCatalog(
    demo: SalesDashboardData(context).sample,
    region: _customer?.region ?? context.read<SalesSession>().region,
  );
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (_customer != null) {
        seedCustomerReferencePrices(context, _customer!, _catalog);
      }
      if (widget.initialProduct != null) {
        _add(_findProduct(widget.initialProduct!), initial: true);
      }
    });
  }

  _QuoteProduct _findProduct(Product product) {
    for (final s in _catalog) {
      for (final c in s.colours) {
        if (c.product.id == product.id || c.product.sku == product.sku) {
          return _QuoteProduct(s, c);
        }
      }
    }
    final c = StockColour(
      product: product,
      quantity: product.stockBoxes,
      area: product.stockSqm,
    );
    return _QuoteProduct(
      StockSeries(
        id: product.brand ?? product.id,
        name: product.brand ?? product.name,
        category: product.category,
        style: product.installationStyle ?? 'Plank',
        dimensions: product.dimensions ?? '',
        unit: product.category == 'Accessories' ? 'units' : 'boxes',
        priceUnit: product.category == 'Accessories' ? 'unit' : 'm²',
        colours: [c],
      ),
      c,
    );
  }

  void _refreshLine() {
    if (mounted) setState(() => _error = null);
  }

  void _add(_QuoteProduct selection, {bool initial = false}) {
    if (_items.any(
      (line) => line.selection.product.id == selection.product.id,
    )) {
      return;
    }
    final line = _QuoteLineDraft(
      selection,
      coverage: SalesDashboardData(context).sample
          ? (const {
                  'bonita': 2.2,
                  'heritage': 1.44,
                  'mtf': 2.41,
                  'aquaglow': 2.2,
                  'guardian': 2.2,
                }[selection.series.id] ??
                selection.product.sqmPerBox)
          : selection.product.sqmPerBox,
      quantity: initial ? (selection.series.flooring ? '22' : '1') : '',
    );
    line.quantity.addListener(_refreshLine);
    line.price.addListener(_refreshLine);
    setState(() => _items.add(line));
  }

  void _remove(_QuoteLineDraft line) {
    setState(() => _items.remove(line));
    WidgetsBinding.instance.addPostFrameCallback((_) => line.dispose());
  }

  @override
  void dispose() {
    for (final line in _items) {
      line.dispose();
    }
    _note.dispose();
    super.dispose();
  }

  Future<void> _pickCustomer() async {
    final customer = await chooseSalesCustomer(context);
    if (customer != null && mounted) {
      seedCustomerReferencePrices(
        context,
        customer,
        inventoryCatalog(
          demo: SalesDashboardData(context).sample,
          region: customer.region,
        ),
      );
      setState(() => _customer = customer);
    }
  }

  Future<void> _pickProduct() async {
    final selected = await showDetailSheet<_QuoteProduct>(
      context,
      (_) => _QuoteProductPicker(catalog: _catalog),
    );
    if (selected != null && mounted) _add(selected);
  }

  bool _knownBatches(_QuoteLineDraft line) =>
      SalesDashboardData(context).sample &&
      line.selection.product.sku == 'BON-001';
  bool get _needsBatches => _items.any(
    (line) => _knownBatches(line) && (line.calculation?.count ?? 0) > 210,
  );
  double _price(_QuoteLineDraft line) =>
      line.specialPrice ??
      (_customer == null
          ? line.selection.product.standardPrice
          : context.read<PricingService>().getCustomerPrice(
              customerId: _customer!.id,
              product: line.selection.product,
            ));
  void _invalid(String text) {
    setState(() => _error = text);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }

  Future<void> _send() async {
    if (_saving) return;
    if (_customer == null) {
      _invalid('Select a customer.');
      return;
    }
    if (_items.isEmpty) {
      _invalid('Add at least one product.');
      return;
    }
    if (_items.any((line) => line.calculation == null)) {
      _invalid(
        'Enter a valid quantity for every product. Boxes and sale units must be whole numbers.',
      );
      return;
    }
    if (_items.any((line) => !line.priceValid)) {
      _invalid('Enter a valid special price or leave it blank.');
      return;
    }
    final below = _items.where((line) => line.belowFloor).toList();
    FocusScope.of(context).unfocus();
    setState(() => _saving = true);
    try {
      if (below.isNotEmpty) {
        final approval = await showReferenceModal<bool>(
          context,
          (sheet) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.warning_amber_rounded,
                color: Color(0xFFD88700),
                size: 30,
              ),
              const SizedBox(height: 10),
              const Text(
                'Below floor price',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 10),
              const Text(
                'This price is under the floor price. It needs manager approval before the customer can get it.',
                style: TextStyle(fontSize: 13, height: 1.5),
              ),
              const SizedBox(height: 14),
              for (final line in below)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          line.selection.product.name,
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            _quoteMoney(line.specialPrice!),
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            'floor ${_quoteMoney(line.selection.product.salesFloorPrice)}',
                            style: const TextStyle(
                              fontSize: 10,
                              color: detailMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: detailAction(
                      'Change price',
                      'chevron',
                      () => Navigator.pop(sheet, false),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: detailAction(
                      'Send for approval',
                      'mail',
                      () => Navigator.pop(sheet, true),
                      filled: true,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
        if (approval != true || !mounted) return;
      }
      if (!mounted) return;
      final userId = context.read<AppSession>().currentUser.id;
      final today = DateUtils.dateOnly(DateTime.now());
      final records = [
        for (final line in _items)
          <String, dynamic>{
            'productId': line.selection.product.id,
            'name': line.selection.product.name,
            'sku': line.selection.product.sku,
            'quantity': line.calculation!.requested,
            'quantityUnit': line.selection.series.flooring
                ? (line.boxes ? 'boxes' : 'm²')
                : line.selection.series.unit,
            'boxes': line.selection.series.flooring
                ? line.calculation!.count
                : 0,
            'units': line.calculation!.count,
            'sqm': line.calculation!.area,
            'price': _price(line),
            'priceUnit': line.selection.series.priceUnit,
            'subtotal': line.calculation!.billableQuantity * _price(line),
            'requiresApproval': line.belowFloor,
            'available': line.selection.colour.quantity,
            'short': (line.calculation!.count - line.selection.colour.quantity)
                .clamp(0, line.calculation!.count),
          },
      ];
      await LocalSalesRequestStore.append(userId, {
        'kind': 'Quote',
        'customerId': _customer!.id,
        'customer': _customer!.businessName,
        'items': records,
        'neededBy': _needed.toIso8601String(),
        'holdDays': _hold,
        'holdUntil': today.add(Duration(days: _hold)).toIso8601String(),
        'holdStatus': 'Requested',
        'batchPreference': _needsBatches ? _batch : 'One batch only',
        'requiresManagerApproval': below.isNotEmpty,
        'subtotal': records.fold<double>(
          0,
          (sum, row) => sum + (row['subtotal'] as num).toDouble(),
        ),
        'note': _note.text.trim(),
      });
      if (!mounted) return;
      final messenger = ScaffoldMessenger.of(context);
      if (Navigator.canPop(context)) Navigator.pop(context, true);
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            below.isEmpty
                ? 'Quote request saved · hold requested for $_hold days'
                : 'Quote request saved · price needs manager approval',
          ),
        ),
      );
    } catch (_) {
      if (mounted) {
        _invalid(
          'Could not save the quote request. Your entries are kept. Try again.',
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _pickNeeded() async {
    final date = await pickSalesDate(
      context: context,
      initialDate: _needed,
      firstDate: DateUtils.dateOnly(DateTime.now()),
      lastDate: DateTime(DateTime.now().year + 3),
      helpText: 'Needed by',
    );
    if (date != null && mounted) setState(() => _needed = date);
  }

  @override
  Widget build(BuildContext context) {
    context.watch<PricingService>();
    final record = _customer == null
        ? null
        : CustomerDirectoryData(context).rows
              .where((r) => r.customer.id == _customer!.id)
              .firstOrNull;
    final days = _needed.difference(DateUtils.dateOnly(DateTime.now())).inDays;
    return PopScope(
      canPop: !_saving,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: dashboardBar('Request a quote'),
        bottomNavigationBar: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: detailAction(
                    'Cancel',
                    'chevron',
                    _saving ? null : () => Navigator.pop(context),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: detailAction(
                    _saving ? 'Saving…' : 'Send to office',
                    'mail',
                    _saving ? null : _send,
                    filled: true,
                  ),
                ),
              ],
            ),
          ),
        ),
        body: AbsorbPointer(
          absorbing: _saving,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 28),
            children: [
              const Text(
                'The office prepares the quote and holds the stock.',
                style: TextStyle(fontSize: 12, color: detailMuted),
              ),
              detailLabel('Customer', required: true),
              detailCard(
                ListTile(
                  dense: true,
                  leading: const DetailGlyph('person', size: 18),
                  title: Text(
                    _customer?.businessName ?? 'Select customer',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: _customer == null
                      ? null
                      : Text(
                          record == null
                              ? '${_customer!.type} · ${_customer!.region.label}'
                              : 'Grade ${record.tier} · ${record.suburb}${record.distance == null ? '' : ' · ${record.distance} km'}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: detailMuted,
                          ),
                        ),
                  trailing: const DetailGlyph('down', size: 14),
                  onTap: _saving ? null : _pickCustomer,
                ),
              ),
              detailLabel('Products', required: true),
              for (final line in _items)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _line(line),
                ),
              detailAddAction(
                _items.isEmpty ? 'Add product' : 'Add another product',
                _saving ? null : _pickProduct,
              ),
              if (_needsBatches) ...[
                detailLabel('Batches'),
                for (final item in [
                  ('One batch only', 'Wait for a new batch if needed'),
                  (
                    'Mix batches OK',
                    'Customer lays each batch in separate rooms',
                  ),
                  ('Office to advise', 'Let the office suggest'),
                ])
                  Padding(
                    padding: const EdgeInsets.only(bottom: 7),
                    child: detailCard(
                      ListTile(
                        dense: true,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 10,
                        ),
                        leading: Icon(
                          _batch == item.$1
                              ? Icons.radio_button_checked
                              : Icons.radio_button_off,
                          size: 19,
                          color: _batch == item.$1 ? detailGreen : detailMuted,
                        ),
                        title: Text(
                          item.$1,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: Text(
                          item.$2,
                          style: const TextStyle(
                            fontSize: 10,
                            color: detailMuted,
                          ),
                        ),
                        onTap: () => setState(() => _batch = item.$1),
                      ),
                    ),
                  ),
              ],
              detailLabel('Needed by'),
              detailCard(
                ListTile(
                  dense: true,
                  leading: const DetailGlyph('calendar', size: 18),
                  title: Text(
                    DateFormat('EEE d MMM').format(_needed),
                    style: const TextStyle(fontSize: 13),
                  ),
                  subtitle: Text(
                    days == 0
                        ? 'Today'
                        : days == 1
                        ? 'Tomorrow'
                        : 'in $days days',
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  ),
                  trailing: const DetailGlyph('down', size: 14),
                  onTap: _pickNeeded,
                ),
              ),
              detailLabel('Hold stock for'),
              Row(
                children: [
                  for (final days in [3, 7]) ...[
                    if (days == 7) const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _hold = days),
                        style: OutlinedButton.styleFrom(
                          backgroundColor: _hold == days
                              ? detailGreen
                              : Colors.white,
                          foregroundColor: _hold == days
                              ? Colors.white
                              : detailGreen,
                          side: const BorderSide(color: Color(0xffe4e8e6)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(9),
                          ),
                          minimumSize: const Size(0, 38),
                        ),
                        child: Text(
                          '$days days',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 6),
              Text(
                _customer == null || _items.isEmpty
                    ? 'Request a $_hold day stock hold once the customer and products are added.'
                    : 'Requested hold: quantities above until ${DateFormat('d MMM').format(DateTime.now().add(Duration(days: _hold)))}.',
                style: const TextStyle(
                  fontSize: 11,
                  color: detailMuted,
                  height: 1.5,
                ),
              ),
              detailLabel('Notes'),
              TextField(
                key: const ValueKey('quote-notes'),
                controller: _note,
                maxLines: 3,
                style: const TextStyle(fontSize: 12),
                decoration: detailInput(
                  hint: 'Trims, underlay, delivery, pricing discussed, competitor…',
                ).copyWith(fillColor: Colors.white),
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    _error!,
                    style: const TextStyle(color: Colors.red, fontSize: 12),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _line(_QuoteLineDraft line) {
    final selected = line.selection,
        p = selected.product,
        calc = line.calculation;
    final hasText = line.quantity.text.trim().isNotEmpty;
    final short = calc == null
        ? 0
        : (calc.count - selected.colour.quantity).clamp(0, calc.count);
    final known = _knownBatches(line);
    return detailCard(
      Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '${p.sku} · ${selected.series.flooring ? '${_quoteNumber(selected.colour.area)} m² · ' : ''}${selected.colour.quantity} ${selected.series.unit} available',
                        style: const TextStyle(
                          fontSize: 11,
                          color: detailMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: 'Remove',
                  constraints: const BoxConstraints(),
                  padding: const EdgeInsets.all(4),
                  onPressed: () => _remove(line),
                  icon: const Icon(Icons.close, size: 17, color: detailMuted),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    key: ValueKey('quote-quantity-${p.sku}'),
                    controller: line.quantity,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: detailInput(hint: 'Quantity').copyWith(
                      suffixText: selected.series.flooring
                          ? (line.boxes ? 'boxes' : 'm²')
                          : selected.series.unit,
                    ),
                  ),
                ),
                if (selected.series.flooring) ...[
                  const SizedBox(width: 8),
                  for (final boxes in [false, true])
                    Padding(
                      padding: const EdgeInsets.only(left: 4),
                      child: ChoiceChip(
                        showCheckmark: false,
                        label: Text(
                          boxes ? 'Boxes' : 'm²',
                          style: const TextStyle(fontSize: 11),
                        ),
                        selected: line.boxes == boxes,
                        onSelected: (_) => setState(() => line.boxes = boxes),
                      ),
                    ),
                ],
              ],
            ),
            if (hasText && calc == null)
              const Padding(
                padding: EdgeInsets.only(top: 5),
                child: Text(
                  'Enter a valid quantity. Boxes and sale units must be whole numbers.',
                  style: TextStyle(fontSize: 10, color: Colors.red),
                ),
              ),
            detailLabel('Special price  optional'),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    key: ValueKey('quote-price-${p.sku}'),
                    controller: line.price,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: detailInput(hint: 'Optional')
                        .copyWith(prefixText: '\$ '),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '/${selected.series.priceUnit}',
                  style: const TextStyle(fontSize: 12, color: detailMuted),
                ),
              ],
            ),
            if (!line.priceValid)
              const Padding(
                padding: EdgeInsets.only(top: 6),
                child: Text(
                  'Enter a valid special price.',
                  style: TextStyle(fontSize: 11, color: Colors.red),
                ),
              ),
            if (line.belowFloor)
              const Padding(
                padding: EdgeInsets.only(top: 6),
                child: Text(
                  'Below floor — needs manager approval',
                  style: TextStyle(fontSize: 11, color: Color(0xFFB66F00)),
                ),
              ),
            if (calc != null) ...[
              const SizedBox(height: 10),
              Text(
                selected.series.flooring
                    ? '${line.boxes ? '${calc.count} boxes = ${calc.area.toStringAsFixed(1)} m²' : '${_quoteNumber(calc.requested)} m² = ${calc.count} boxes (${calc.area.toStringAsFixed(1)} m²)'} · ${short > 0 ? 'short $short' : '✓ in stock'}'
                    : '${calc.count} ${selected.series.unit} · ${short > 0 ? 'short $short' : '✓ in stock'}',
                style: TextStyle(
                  fontSize: 11,
                  color: short > 0 ? const Color(0xFFB66F00) : detailGreen,
                ),
              ),
              if (known) ...[
                const SizedBox(height: 9),
                if (calc.count <= 210)
                  Text(
                    'One batch: BN-2408 · 210 boxes in lot',
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  )
                else ...[
                  Text(
                    'No single batch has ${calc.count} boxes — other batches:',
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  ),
                  const SizedBox(height: 5),
                  for (final batch in [
                    ('BN-2408', 210, calc.count.clamp(0, 210)),
                    ('BN-2410', 118, (calc.count - 210).clamp(0, 118)),
                  ])
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${batch.$1} · ${batch.$2} boxes in lot',
                              style: const TextStyle(fontSize: 10),
                            ),
                          ),
                          Text(
                            'use ${batch.$3}',
                            style: const TextStyle(
                              fontSize: 10,
                              color: detailMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (selected.colour.incoming > 0)
                    Text(
                      'New batch ${selected.colour.eta}: ${(selected.colour.incoming / p.sqmPerBox).round()} boxes${selected.colour.incoming / p.sqmPerBox >= calc.count ? ' — enough for one batch if the customer can wait' : ''}',
                      style: const TextStyle(
                        fontSize: 10,
                        color: Color(0xFF2265CB),
                        height: 1.5,
                      ),
                    ),
                ],
              ],
            ],
          ],
        ),
      ),
    );
  }
}

String _quoteMoney(num n) => NumberFormat.currency(symbol: '\$').format(n);
String _quoteNumber(num n) => NumberFormat('#,##0.##').format(n);

class _QuoteProductPicker extends StatefulWidget {
  const _QuoteProductPicker({required this.catalog});
  final List<StockSeries> catalog;
  @override
  State<_QuoteProductPicker> createState() => _QuoteProductPickerState();
}

class _QuoteProductPickerState extends State<_QuoteProductPicker> {
  String _query = '';
  final _openCategories = <String>{}, _openSeries = <String>{};
  bool _matches(StockSeries s, StockColour c) =>
      '${s.name} ${c.product.colour} ${c.product.sku}'.toLowerCase().contains(
        _query.toLowerCase(),
      );
  @override
  Widget build(BuildContext context) => Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const Text(
        'Add product',
        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
      const SizedBox(height: 12),
      TextField(
        key: const ValueKey('quote-product-search'),
        onChanged: (v) => setState(() => _query = v),
        decoration: detailInput(hint: 'Search series, colour or SKU')
            .copyWith(prefixIcon: const Icon(Icons.search, size: 17)),
      ),
      const SizedBox(height: 10),
      ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * .6,
        ),
        child: ListView(
          shrinkWrap: true,
          children: [
            for (final category in [
              'Engineered Timber',
              'Laminate',
              'Hybrid',
              'Accessories',
            ])
              if (widget.catalog.any(
                (s) =>
                    s.category == category &&
                    s.colours.any((c) => _matches(s, c)),
              )) ...[
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: DetailGlyph(
                    category == 'Accessories' ? 'box' : 'layers',
                    size: 20,
                  ),
                  title: Text(
                    category,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    '${widget.catalog.where((s) => s.category == category).length} series · ${widget.catalog.where((s) => s.category == category).fold<int>(0, (n, s) => n + s.colours.length)} ${category == 'Accessories' ? 'items' : 'colours'}',
                    style: const TextStyle(fontSize: 11, color: detailMuted),
                  ),
                  trailing: DetailGlyph(
                    _openCategories.contains(category) || _query.isNotEmpty
                        ? 'down'
                        : 'chevron',
                    size: 14,
                  ),
                  onTap: () => setState(
                    () => _openCategories.contains(category)
                        ? _openCategories.remove(category)
                        : _openCategories.add(category),
                  ),
                ),
                if (_openCategories.contains(category) || _query.isNotEmpty)
                  for (final s in widget.catalog.where(
                    (s) =>
                        s.category == category &&
                        s.colours.any((c) => _matches(s, c)),
                  )) ...[
                    ListTile(
                      contentPadding: const EdgeInsets.only(left: 12),
                      leading: InventorySwatch(seed: s.id, size: 32),
                      title: Text(
                        s.name,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      subtitle: Text(
                        '${s.style} · ${s.dimensions}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: detailMuted,
                        ),
                      ),
                      trailing: Text(
                        '${_quoteNumber(s.flooring ? s.area : s.quantity)} ${s.flooring ? 'm²' : s.unit}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: detailGreen,
                        ),
                      ),
                      onTap: () => setState(
                        () => _openSeries.contains(s.id)
                            ? _openSeries.remove(s.id)
                            : _openSeries.add(s.id),
                      ),
                    ),
                    if (_openSeries.contains(s.id) || _query.isNotEmpty)
                      for (final c in s.colours.where((c) => _matches(s, c)))
                        ListTile(
                          contentPadding: const EdgeInsets.only(left: 22),
                          leading: InventorySwatch(
                            seed: c.product.colour,
                            size: 26,
                            single: true,
                          ),
                          title: Text(
                            c.product.colour,
                            style: const TextStyle(fontSize: 12),
                          ),
                          subtitle: Text(
                            '${c.product.sku} · ${_quoteNumber(s.flooring ? c.area : c.quantity)} ${s.flooring ? 'm²' : s.unit}${c.incoming > 0 ? ' · incoming' : ''}',
                            style: const TextStyle(
                              fontSize: 10,
                              color: detailMuted,
                            ),
                          ),
                          trailing: const DetailGlyph('chevron', size: 12),
                          onTap: () =>
                              Navigator.pop(context, _QuoteProduct(s, c)),
                        ),
                  ],
              ],
            if (!widget.catalog.any(
              (s) => s.colours.any((c) => _matches(s, c)),
            ))
              const Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  'No matching products.',
                  style: TextStyle(fontSize: 12, color: detailMuted),
                ),
              ),
          ],
        ),
      ),
    ],
  );
}
