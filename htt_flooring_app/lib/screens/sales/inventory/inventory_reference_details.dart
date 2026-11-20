part of 'inventory_screen.dart';

String _stockNumber(num n) => NumberFormat('#,##0.##').format(n);
Widget _detailPad(Widget child) =>
    Padding(padding: const EdgeInsets.all(12), child: child);
Widget _stockPanel(
  String title,
  String icon,
  Widget body, {
  String? trailing,
}) => Padding(
  padding: const EdgeInsets.only(top: 14),
  child: Container(
    decoration: BoxDecoration(
      color: _stockPale,
      borderRadius: BorderRadius.circular(15),
      border: Border.all(color: dashboardGreen),
    ),
    clipBehavior: Clip.antiAlias,
    child: Column(
      children: [
        Container(
          color: dashboardGreen,
          padding: const EdgeInsets.all(11),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: .18),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: DetailGlyph(icon, color: Colors.white, size: 16),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              if (trailing != null)
                Text(
                  trailing,
                  style: const TextStyle(
                    color: Color(0xFFCCDED5),
                    fontSize: 11,
                  ),
                ),
            ],
          ),
        ),
        body,
      ],
    ),
  ),
);

class InventorySeriesDetails extends StatefulWidget {
  const InventorySeriesDetails({
    super.key,
    required this.series,
    this.customer,
  });
  final StockSeries series;
  final Customer? customer;
  @override
  State<InventorySeriesDetails> createState() => _InventorySeriesDetailsState();
}

class _InventorySeriesDetailsState extends State<InventorySeriesDetails> {
  String _query = '', _filter = 'All', _sort = 'A–Z';
  bool _grid = false, _spec = false;
  Customer? _customer;
  @override
  void initState() {
    super.initState();
    _customer = widget.customer;
  }

  Future<void> _choose() async {
    final c = await chooseSalesCustomer(context);
    if (c != null && mounted) setState(() => _customer = c);
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.series;
    final colours =
        s.colours
            .where(
              (c) =>
                  (_query.isEmpty ||
                      '${c.product.colour} ${c.product.sku}'
                          .toLowerCase()
                          .contains(_query.toLowerCase())) &&
                  (_filter == 'All' ||
                      _filter == 'Low' && c.low ||
                      _filter == 'Incoming' && c.incoming > 0 ||
                      _filter == 'In stock' && !c.low && c.quantity > 0),
            )
            .toList()
          ..sort(
            (a, b) => _sort == 'A–Z'
                ? a.product.colour.compareTo(b.product.colour)
                : _sort == 'Most'
                ? b.quantity.compareTo(a.quantity)
                : a.quantity.compareTo(b.quantity),
          );
    final incoming = s.colours.fold<double>(0, (v, c) => v + c.incoming);
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar(
        'Series',
        actions: [
          TextButton(
            onPressed: _choose,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const DetailGlyph('person', size: 15),
                const SizedBox(width: 6),
                Text(
                  _customer == null
                      ? 'Customer'
                      : _customer!.businessName
                            .split(' ')
                            .map((word) => word.isEmpty ? '' : word[0])
                            .take(2)
                            .join(),
                  style: const TextStyle(fontSize: 12, color: dashboardGreen),
                ),
                const SizedBox(width: 5),
                const DetailGlyph('down', size: 12),
              ],
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          Text(
            '${s.category} · ${s.style}'.toUpperCase(),
            style: const TextStyle(fontSize: 10, color: _stockMuted),
          ),
          const SizedBox(height: 6),
          Text(
            s.name,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 5),
          Text(
            '${s.dimensions}${s.flooring ? ' · ${_stockNumber(s.colours.first.product.sqmPerBox)} m²/box' : ''} · from \$${s.colours.first.product.standardPrice.toStringAsFixed(2)}/${s.priceUnit}',
            style: const TextStyle(fontSize: 11, color: _stockMuted),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              for (final value in [
                (
                  'In stock',
                  '${_stockNumber(s.flooring ? s.area : s.quantity)} ${s.flooring ? 'm²' : s.unit}',
                  '${s.quantity} ${s.unit}',
                ),
                (
                  'Incoming',
                  '+${_stockNumber(incoming)} ${s.flooring ? 'm²' : s.unit}',
                  'next ${s.id == 'bonita' ? '25 Nov' : s.colours.where((c) => c.incoming > 0).firstOrNull?.eta ?? '—'}',
                ),
                (
                  'Low stock',
                  '${s.lowCount}',
                  'of ${s.colours.length} colours',
                ),
              ])
                Expanded(
                  child: detailCard(
                    _detailPad(
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            value.$1,
                            style: const TextStyle(
                              fontSize: 10,
                              color: _stockMuted,
                            ),
                          ),
                          const SizedBox(height: 7),
                          Text(
                            value.$2,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            value.$3,
                            style: const TextStyle(
                              fontSize: 10,
                              color: _stockMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
          detailHeading(
            'Colours',
            action: '${colours.length} of ${s.colours.length}',
          ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  onChanged: (v) => setState(() => _query = v),
                  decoration: detailInput(hint: 'Search colour or SKU...'),
                ),
              ),
              const SizedBox(width: 8),
              DropdownButton<String>(
                value: _sort,
                items: ['A–Z', 'Most', 'Least']
                    .map(
                      (v) => DropdownMenuItem(
                        value: v,
                        child: Text(v, style: const TextStyle(fontSize: 12)),
                      ),
                    )
                    .toList(),
                onChanged: (v) => setState(() => _sort = v!),
              ),
              IconButton(
                tooltip: _grid ? 'List view' : 'Grid view',
                onPressed: () => setState(() => _grid = !_grid),
                icon: DetailGlyph(_grid ? 'doc' : 'box'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            children: [
              for (final f in ['All', 'In stock', 'Low', 'Incoming'])
                ChoiceChip(
                  showCheckmark: false,
                  label: Text(
                    '$f ${f == 'All'
                        ? s.colours.length
                        : f == 'Low'
                        ? s.lowCount
                        : f == 'Incoming'
                        ? s.colours.where((c) => c.incoming > 0).length
                        : s.colours.where((c) => !c.low && c.quantity > 0).length}',
                    style: TextStyle(
                      fontSize: 11,
                      color: _filter == f ? Colors.white : _stockMuted,
                    ),
                  ),
                  selected: _filter == f,
                  selectedColor: dashboardGreen,
                  onSelected: (_) => setState(() => _filter = f),
                ),
            ],
          ),
          const SizedBox(height: 10),
          if (_grid)
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.2,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              children: [for (final c in colours) _colour(s, c, true)],
            )
          else
            for (final c in colours)
              Padding(
                padding: const EdgeInsets.only(bottom: 7),
                child: _colour(s, c, false),
              ),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text(
              'Specifications',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              s.dimensions,
              style: const TextStyle(fontSize: 11, color: _stockMuted),
            ),
            trailing: DetailGlyph(_spec ? 'down' : 'chevron'),
            onTap: () => setState(() => _spec = !_spec),
          ),
          if (_spec)
            Text(
              '${s.category} · ${s.style}\n${s.dimensions}\nCoverage: ${s.colours.first.product.sqmPerBox} m²/box',
              style: const TextStyle(fontSize: 12, height: 1.8),
            ),
        ],
      ),
    );
  }

  Widget _colour(StockSeries s, StockColour c, bool grid) {
    final price = _customer == null
        ? c.product.standardPrice
        : context.read<PricingService>().getCustomerPrice(
            customerId: _customer!.id,
            product: c.product,
          );
    final text = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          c.product.colour,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 4),
        Text(
          '${c.product.sku} · \$${price.toStringAsFixed(2)}',
          style: const TextStyle(fontSize: 10, color: _stockMuted),
        ),
        const SizedBox(height: 7),
        Text(
          s.flooring
              ? '${_stockNumber(c.area.round())} m²  ${c.quantity} bx'
              : '${c.quantity} ${s.unit}',
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        ),
        if (c.low || c.incoming > 0)
          Text(
            '${c.low ? 'Low  ' : ''}${c.incoming > 0 ? '+${_stockNumber(c.incoming)} ${s.flooring ? 'm²' : s.unit} · ${c.eta}' : ''}',
            style: const TextStyle(fontSize: 10, color: Color(0xFF2167CD)),
          ),
      ],
    );
    return detailCard(
      InkWell(
        onTap: () => dashboardOpen(
          context,
          InventoryColourDetails(series: s, colour: c, customer: _customer),
        ),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: grid
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    InventorySwatch(
                      seed: c.product.colour,
                      size: 44,
                      single: true,
                    ),
                    const SizedBox(height: 8),
                    text,
                  ],
                )
              : Row(
                  children: [
                    InventorySwatch(
                      seed: c.product.colour,
                      size: 42,
                      single: true,
                    ),
                    const SizedBox(width: 11),
                    Expanded(child: text),
                    const DetailGlyph('chevron', size: 14, color: _stockMuted),
                  ],
                ),
        ),
      ),
    );
  }
}

class InventoryColourDetails extends StatefulWidget {
  const InventoryColourDetails({
    super.key,
    required this.series,
    required this.colour,
    this.customer,
  });
  final StockSeries series;
  final StockColour colour;
  final Customer? customer;
  @override
  State<InventoryColourDetails> createState() => _InventoryColourDetailsState();
}

class _InventoryColourDetailsState extends State<InventoryColourDetails> {
  final _area = TextEditingController();
  bool _levels = false, _boxes = false, _spec = false;
  Customer? _customer;
  @override
  void initState() {
    super.initState();
    _customer = widget.customer;
  }

  @override
  void dispose() {
    _area.dispose();
    super.dispose();
  }

  Future<void> _choose() async {
    final c = await chooseSalesCustomer(context);
    if (c != null && mounted) setState(() => _customer = c);
  }

  Future<void> _request(bool quote) async {
    final c = _customer ?? await chooseSalesCustomer(context);
    if (!mounted || c == null) return;
    if (quote) {
      dashboardOpen(
        context,
        SalesQuoteRequestScreen(
          customer: c,
          initialProduct: widget.colour.product,
        ),
      );
    } else {
      dashboardOpen(
        context,
        SalesSamplesScreen(
          createOnOpen: true,
          initialCustomer: c,
          initialBoard: false,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.series, c = widget.colour, p = c.product;
    final demo = SalesDashboardData(context).sample;
    final metrics = demo
        ? null
        : const InventoryService().stockMetrics(
            p.id,
            context.read<SalesSession>().region,
          );
    final reserved = demo
        ? (p.sku == 'BON-001' ? 40 : 0)
        : (metrics?['reserved'] ?? 0).toInt();
    final onHand = demo
        ? c.quantity + reserved
        : (metrics?['onHand'] ?? c.quantity).toInt();
    final sqm = p.sqmPerBox > 0 ? p.sqmPerBox : 1.0;
    final price = _customer == null
        ? p.standardPrice
        : context.watch<PricingService>().getCustomerPrice(
            customerId: _customer!.id,
            product: p,
          );
    final input = double.tryParse(_area.text) ?? 0;
    final boxes = (_boxes ? input : input / sqm).ceil();
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar(
        s.name,
        actions: [
          TextButton(
            onPressed: _choose,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const DetailGlyph('person', size: 15),
                const SizedBox(width: 6),
                Text(
                  _customer == null
                      ? 'Customer'
                      : _customer!.businessName
                            .split(' ')
                            .map((word) => word.isEmpty ? '' : word[0])
                            .take(2)
                            .join(),
                  style: const TextStyle(fontSize: 12, color: dashboardGreen),
                ),
                const SizedBox(width: 5),
                const DetailGlyph('down', size: 12),
              ],
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          Row(
            children: [
              InventorySwatch(seed: p.colour, size: 90, single: true),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${s.name} · ${s.category.replaceAll(' Timber', '')} ${s.style}',
                      style: const TextStyle(fontSize: 11, color: _stockMuted),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      p.colour,
                      style: const TextStyle(
                        fontSize: 21,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      p.sku,
                      style: const TextStyle(fontSize: 11, color: _stockMuted),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${s.dimensions}${s.flooring ? ' · ${_stockNumber(sqm)} m²/box' : ''}',
                      style: const TextStyle(fontSize: 11, color: _stockMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          detailCard(
            _detailPad(
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _customer == null
                        ? 'Standard price'
                        : 'Price for ${_customer!.businessName}',
                    style: const TextStyle(fontSize: 11, color: _stockMuted),
                  ),
                  const SizedBox(height: 4),
                  Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: '\$${price.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        TextSpan(
                          text: ' /${s.priceUnit} ex GST',
                          style: const TextStyle(
                            fontSize: 11,
                            color: _stockMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  InkWell(
                    onTap: () => setState(() => _levels = !_levels),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      child: Row(
                        children: [
                          const DetailGlyph('layers', size: 14),
                          const SizedBox(width: 5),
                          const Text(
                            'Price levels',
                            style: TextStyle(fontSize: 12),
                          ),
                          DetailGlyph(_levels ? 'down' : 'chevron', size: 13),
                        ],
                      ),
                    ),
                  ),
                  if (_levels)
                    for (final level in [
                      ('Standard', p.standardPrice),
                      ('VIP', p.standardPrice * .9),
                      ('VVIP', p.standardPrice * .85),
                      ('Container', p.standardPrice * .8),
                      ('Floor', p.salesFloorPrice),
                    ])
                      Container(
                        decoration: BoxDecoration(
                          border: Border(top: BorderSide(color: _stockBorder)),
                        ),
                        padding: const EdgeInsets.symmetric(
                          vertical: 9,
                          horizontal: 8,
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 82,
                              child: Text(
                                level.$1,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: level.$1 == 'Floor'
                                      ? Colors.red
                                      : _stockMuted,
                                ),
                              ),
                            ),
                            Text(
                              '\$${level.$2.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                ],
              ),
            ),
          ),
          _stockPanel(
            'Stock',
            'box',
            Padding(
              padding: const EdgeInsets.all(9),
              child: Row(
                children: [
                  for (final m in [
                    ('Available', c.quantity),
                    ('On hand', onHand),
                    ('Reserved', reserved),
                  ])
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 3),
                        child: detailCard(
                          _detailPad(
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  m.$1,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: _stockMuted,
                                  ),
                                ),
                                const SizedBox(height: 5),
                                Text(
                                  '${_stockNumber(s.flooring ? (m.$2 * sqm).round() : m.$2)} ${s.flooring ? 'm²' : s.unit}',
                                  style: const TextStyle(
                                    fontSize: 19,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                if (s.flooring)
                                  Text(
                                    '${m.$2} ${s.unit}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: _stockMuted,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            trailing: context.watch<SalesSession>().regionName,
          ),
          if (c.incoming > 0)
            _stockPanel(
              'Incoming shipments',
              'box',
              _detailPad(
                Row(
                  children: [
                    const DetailGlyph('box', color: Color(0xFF2167CD)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            s.flooring
                                ? '${_stockNumber(c.incoming)} m² · ${(c.incoming / sqm).round()} boxes'
                                : '${_stockNumber(c.incoming)} ${s.unit}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            demo && p.sku == 'BON-001'
                                ? 'SHP-2802 · On water · In transit'
                                : 'Incoming stock',
                            style: const TextStyle(
                              fontSize: 10,
                              color: _stockMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      c.eta,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF2167CD),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              trailing:
                  '${_stockNumber(c.incoming)} ${s.flooring ? 'm²' : s.unit}',
            ),
          if (s.flooring)
            _stockPanel(
              'Job calculator',
              'layers',
              _detailPad(
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Floor area',
                      style: TextStyle(fontSize: 11, color: _stockMuted),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _area,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                            ),
                            onChanged: (_) => setState(() {}),
                            decoration: detailInput(
                              hint: _boxes ? 'Boxes' : 'm²',
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        for (final unit in ['m²', 'Boxes'])
                          TextButton(
                            onPressed: () =>
                                setState(() => _boxes = unit == 'Boxes'),
                            style: TextButton.styleFrom(
                              backgroundColor:
                                  (_boxes ? unit == 'Boxes' : unit == 'm²')
                                  ? Colors.white
                                  : Colors.transparent,
                            ),
                            child: Text(
                              unit,
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (input <= 0)
                      const Text(
                        'Enter the floor area to see boxes needed, stock and batch cover.',
                        style: TextStyle(fontSize: 11, color: _stockMuted),
                      )
                    else
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${_stockNumber(_boxes ? input * sqm : input)} m² = $boxes boxes (${_stockNumber(boxes * sqm)} m²)',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            boxes <= c.quantity
                                ? '✓ In stock · ${c.quantity - boxes} boxes left'
                                : 'Stock shortfall · ${boxes - c.quantity} boxes required',
                            style: TextStyle(
                              fontSize: 12,
                              color: boxes <= c.quantity
                                  ? dashboardGreen
                                  : Colors.red,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ),
          if (demo && p.sku == 'BON-001')
            _stockPanel(
              'Batches (dye lots)',
              'box',
              _detailPad(
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'BN-2408   462 m² · 210 boxes\nBN-2410   260 m² · 118 boxes',
                      style: const TextStyle(fontSize: 12, height: 1.9),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Supply one job from a single batch where possible.',
                      style: TextStyle(fontSize: 11, color: _stockMuted),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: detailAction(
                  'Request quote',
                  'doc',
                  () => _request(true),
                  filled: true,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: detailAction(
                  s.flooring ? 'Request offcut' : 'Request sample',
                  'box',
                  () => _request(false),
                ),
              ),
            ],
          ),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text(
              'Specifications',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              s.dimensions,
              style: const TextStyle(fontSize: 11, color: _stockMuted),
            ),
            trailing: DetailGlyph(_spec ? 'down' : 'chevron'),
            onTap: () => setState(() => _spec = !_spec),
          ),
          if (_spec)
            Text(
              '${s.category} · ${s.style}\n${s.dimensions}${s.flooring ? '\nCoverage: $sqm m²/box' : ''}',
              style: const TextStyle(fontSize: 12, height: 1.8),
            ),
          detailHeading(
            'Other ${s.name} colours',
            action: '${s.colours.length - 1}',
          ),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final other in s.colours.where((o) => o.product.id != p.id))
                SizedBox(
                  width: 100,
                  child: detailCard(
                    InkWell(
                      onTap: () => Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) => InventoryColourDetails(
                            series: s,
                            colour: other,
                            customer: _customer,
                          ),
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(9),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            InventorySwatch(
                              seed: other.product.colour,
                              size: 38,
                              single: true,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              other.product.colour,
                              style: const TextStyle(fontSize: 11),
                            ),
                            Text(
                              '${_stockNumber(s.flooring ? other.area.round() : other.quantity)} ${s.flooring ? 'm²' : s.unit}',
                              style: const TextStyle(
                                fontSize: 10,
                                color: _stockMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
