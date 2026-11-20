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
    final c = await chooseSalesCustomer(
      context,
      prices: true,
      current: _customer,
      onClear: () => setState(() => _customer = null),
    );
    if (c != null && mounted) {
      seedCustomerReferencePrices(
        context,
        c,
        inventoryCatalog(
          demo: SalesDashboardData(context).sample,
          region: c.region,
        ),
      );
      setState(() => _customer = c);
    }
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
                      _filter == 'Low' && c.low && c.quantity > 0 ||
                      _filter == 'Out' && c.quantity == 0 ||
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
    context.watch<PricingService>();
    final count = s.colours.length;
    return Scaffold(
      backgroundColor: const Color(0xfff3f5f4),
      appBar: dashboardBar(
        'Series',
        actions: [_inventoryCustomerButton(_customer, _choose)],
      ),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          Text(
            '${s.category} · ${s.style}'.toUpperCase(),
            style: const TextStyle(
              fontSize: 10,
              color: _stockMuted,
              letterSpacing: .5,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            s.name,
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            '${s.dimensions}${s.flooring ? ' · ${_stockNumber(s.colours.first.product.sqmPerBox)} m²/box' : ''} · from \$${s.colours.map((c) => c.product.standardPrice).reduce((a, b) => a < b ? a : b).toStringAsFixed(2)}/${s.priceUnit}',
            style: const TextStyle(fontSize: 11, color: _stockMuted),
          ),
          const SizedBox(height: 13),
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (var i = 0; i < 3; i++) ...[
                  if (i > 0) const SizedBox(width: 8),
                  Expanded(
                    child: detailCard(
                      Padding(
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              ['In stock', 'Incoming', 'Low stock'][i],
                              style: const TextStyle(
                                fontSize: 11,
                                color: _stockMuted,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text.rich(
                              TextSpan(
                                children: [
                                  TextSpan(
                                    text: i == 0
                                        ? _stockNumber(
                                            s.flooring
                                                ? s.area.round()
                                                : s.quantity,
                                          )
                                        : i == 1
                                        ? '+${_stockNumber(incoming)}'
                                        : '${s.lowCount}',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w700,
                                      color: i == 1
                                          ? const Color(0xff1561b2)
                                          : i == 2
                                          ? _stockAmber
                                          : detailGreen,
                                    ),
                                  ),
                                  if (i < 2)
                                    TextSpan(
                                      text: ' ${s.flooring ? 'm²' : s.unit}',
                                      style: const TextStyle(
                                        fontSize: 10,
                                        color: _stockMuted,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              i == 0
                                  ? '${s.quantity} ${s.unit}'
                                  : i == 1
                                  ? 'next ${s.id == 'bonita' ? '25 Nov' : s.colours.where((c) => c.incoming > 0).firstOrNull?.eta ?? '—'}'
                                  : 'of $count ${s.flooring ? 'colours' : 'options'}',
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
                ],
              ],
            ),
          ),
          _stockPanel(
            'Colours',
            'layers',
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          onChanged: (v) => setState(() => _query = v),
                          style: const TextStyle(fontSize: 13),
                          decoration: detailInput(hint: 'Find a colour')
                              .copyWith(
                                fillColor: Colors.white,
                                prefixIcon: const Icon(Icons.search, size: 17),
                              ),
                        ),
                      ),
                      const SizedBox(width: 7),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(9),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _sort,
                            isDense: true,
                            items: ['A–Z', 'Most', 'Least']
                                .map(
                                  (v) => DropdownMenuItem(
                                    value: v,
                                    child: Text(
                                      v,
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                  ),
                                )
                                .toList(),
                            onChanged: (v) {
                              if (v != null) setState(() => _sort = v);
                            },
                          ),
                        ),
                      ),
                      for (final grid in [true, false])
                        SizedBox(
                          width: 37,
                          child: IconButton(
                            tooltip: grid ? 'Grid view' : 'List view',
                            onPressed: () => setState(() => _grid = grid),
                            style: IconButton.styleFrom(
                              backgroundColor: _grid == grid
                                  ? Colors.white
                                  : Colors.transparent,
                            ),
                            icon: Icon(
                              grid
                                  ? Icons.grid_view_rounded
                                  : Icons.format_list_bulleted,
                              size: 17,
                              color: _grid == grid ? detailGreen : _stockMuted,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 5,
                    runSpacing: 5,
                    children: [
                      for (final f in [
                        'All',
                        'In stock',
                        'Low',
                        if (s.colours.any((c) => c.quantity == 0)) 'Out',
                        'Incoming',
                      ])
                        ChoiceChip(
                          showCheckmark: false,
                          label: Text(
                            '$f ${f == 'All'
                                ? count
                                : f == 'Low'
                                ? s.colours.where((c) => c.low && c.quantity > 0).length
                                : f == 'Out'
                                ? s.colours.where((c) => c.quantity == 0).length
                                : f == 'Incoming'
                                ? s.colours.where((c) => c.incoming > 0).length
                                : s.colours.where((c) => !c.low && c.quantity > 0).length}',
                            style: TextStyle(
                              fontSize: 10,
                              color: _filter == f
                                  ? Colors.white
                                  : f == 'Low'
                                  ? _stockAmber
                                  : f == 'Incoming'
                                  ? const Color(0xff1561b2)
                                  : _stockMuted,
                            ),
                          ),
                          selected: _filter == f,
                          selectedColor: detailGreen,
                          backgroundColor: Colors.white,
                          onSelected: (_) => setState(() => _filter = f),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (colours.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(20),
                      child: Text(
                        'No matching colours.',
                        style: TextStyle(fontSize: 12, color: _stockMuted),
                      ),
                    ),
                  if (_grid)
                    LayoutBuilder(
                      builder: (_, constraints) => GridView.count(
                        crossAxisCount: 3,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisExtent: (constraints.maxWidth - 14) / 3 + 85,
                        mainAxisSpacing: 7,
                        crossAxisSpacing: 7,
                        children: [
                          for (final c in colours) _colour(s, c, true),
                        ],
                      ),
                    )
                  else
                    for (final c in colours)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: _colour(s, c, false),
                      ),
                ],
              ),
            ),
            trailing: '${colours.length} of $count',
          ),
          const SizedBox(height: 14),
          _inventorySpecifications(
            s,
            _spec,
            () => setState(() => _spec = !_spec),
          ),
          const SizedBox(height: 15),
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
    Widget badge(String label, {bool incoming = false}) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 3),
      decoration: BoxDecoration(
        color: incoming ? const Color(0xffe5efff) : const Color(0xfffff3dc),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontSize: 9,
          color: incoming ? const Color(0xff1764d9) : _stockAmber,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
    Widget amount() => Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: '${_stockNumber(s.flooring ? c.area.round() : c.quantity)} ',
            style: TextStyle(
              fontSize: grid ? 12 : 14,
              fontWeight: FontWeight.w600,
              color: c.low ? _stockAmber : const Color(0xff18241f),
            ),
          ),
          TextSpan(
            text: s.flooring ? 'm²  ${c.quantity} bx' : s.unit,
            style: TextStyle(fontSize: grid ? 8 : 10, color: _stockMuted),
          ),
        ],
      ),
    );
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: c.low && grid
            ? Border.all(color: const Color(0xffdab461), width: 1.5)
            : null,
      ),
      child: detailCard(
        InkWell(
          onTap: () => dashboardOpen(
            context,
            InventoryColourDetails(series: s, colour: c, customer: _customer),
          ),
          child: Padding(
            padding: EdgeInsets.all(grid ? 6 : 10),
            child: grid
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      LayoutBuilder(
                        builder: (_, constraints) => Stack(
                          children: [
                            InventorySwatch(
                              seed: c.product.colour,
                              size: constraints.maxWidth,
                              single: true,
                            ),
                            if (c.low)
                              Positioned(
                                top: 4,
                                left: 4,
                                child: badge(
                                  c.quantity == 0 ? 'Out of stock' : 'Low',
                                ),
                              ),
                            if (c.incoming > 0)
                              Positioned(
                                bottom: 0,
                                left: 0,
                                right: 0,
                                child: badge(
                                  '+${_stockNumber(c.incoming)} · ${c.eta}',
                                  incoming: true,
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        c.product.colour,
                        maxLines: 1,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        c.product.sku,
                        style: const TextStyle(fontSize: 9, color: _stockMuted),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '\$${price.toStringAsFixed(2)}/${s.priceUnit}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: detailGreen,
                        ),
                      ),
                      const SizedBox(height: 4),
                      amount(),
                    ],
                  )
                : Row(
                    children: [
                      InventorySwatch(
                        seed: c.product.colour,
                        size: 30,
                        single: true,
                      ),
                      const SizedBox(width: 11),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              c.product.colour,
                              style: const TextStyle(fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${c.product.sku} · \$${price.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 10,
                                color: _stockMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            amount(),
                            if (c.low || c.incoming > 0) ...[
                              const SizedBox(height: 4),
                              if (c.low)
                                badge(c.quantity == 0 ? 'Out of stock' : 'Low'),
                              if (c.incoming > 0)
                                badge(
                                  '+${_stockNumber(c.incoming)} ${s.flooring ? 'm²' : s.unit} · ${c.eta}',
                                  incoming: true,
                                ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
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
    final c = await chooseSalesCustomer(
      context,
      prices: true,
      current: _customer,
      onClear: () => setState(() => _customer = null),
    );
    if (c != null && mounted) {
      seedCustomerReferencePrices(
        context,
        c,
        inventoryCatalog(
          demo: SalesDashboardData(context).sample,
          region: c.region,
        ),
      );
      setState(() => _customer = c);
    }
  }

  Future<void> _request(bool quote) async {
    if (quote) {
      await Navigator.push<void>(
        context,
        MaterialPageRoute(
          builder: (_) => SalesQuoteRequestScreen(
            customer: _customer,
            initialProduct: widget.colour.product,
          ),
        ),
      );
    } else {
      await requestSalesOffcut(
        context,
        customer: _customer,
        product: widget.colour.product,
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
    final calculation = SalesQuoteQuantity.parse(
      _area.text,
      flooring: s.flooring,
      boxes: _boxes,
      coverage: sqm,
    );

    return Scaffold(
      backgroundColor: const Color(0xfff3f5f4),
      appBar: dashboardBar(
        s.name,
        actions: [_inventoryCustomerButton(_customer, _choose)],
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
                    if (calculation == null)
                      Text(
                        _area.text.trim().isEmpty
                            ? 'Enter the floor area to see boxes needed, stock and batch cover.'
                            : 'Enter a valid positive quantity${_boxes ? ' in whole boxes' : ''}.',
                        style: TextStyle(
                          fontSize: 11,
                          color: _area.text.trim().isEmpty
                              ? _stockMuted
                              : Colors.red,
                        ),
                      )
                    else
                      _inventoryJobResult(s, c, calculation, boxes: _boxes),
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
          const SizedBox(height: 14),
          _inventorySpecifications(
            s,
            _spec,
            () => setState(() => _spec = !_spec),
          ),
          detailHeading(
            'Other ${s.name} colours',
            action: '${s.colours.length - 1}',
          ),
          SizedBox(
            height: 112,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                for (final other in s.colours.where(
                  (o) => o.product.id != p.id,
                ))
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
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

Widget _inventoryCustomerButton(Customer? customer, VoidCallback onTap) =>
    Padding(
      padding: const EdgeInsets.only(right: 12, top: 7, bottom: 7),
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          backgroundColor: customer == null
              ? const Color(0xfff1f7f4)
              : detailGreen,
          foregroundColor: customer == null ? detailGreen : Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
          side: const BorderSide(color: Color(0xffc7d9d0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.person_outline, size: 16),
            const SizedBox(width: 6),
            Text(
              customer == null
                  ? 'Customer'
                  : customer.businessName
                        .split(' ')
                        .where((s) => s.isNotEmpty)
                        .take(2)
                        .map((s) => s[0])
                        .join(),
              style: const TextStyle(fontSize: 12),
            ),
            const SizedBox(width: 5),
            const Icon(Icons.keyboard_arrow_down, size: 15),
          ],
        ),
      ),
    );

Widget _inventorySpecifications(StockSeries s, bool open, VoidCallback onTap) {
  final specs = <String, (String, Map<String, String>)>{
    'bonita': (
      '14/2 mm · 25 yr',
      {
        'Construction': '14 mm engineered, 2 mm oak wear layer',
        'Finish': 'Matt UV lacquer',
        'Installation': 'Floating or direct stick',
        'Underlay': '3 mm acoustic',
        'Warranty': '25 years residential',
      },
    ),
    'heritage': (
      '14/3 mm · 25 yr',
      {
        'Construction': '14 mm engineered, 3 mm oak wear layer',
        'Finish': 'Natural oil',
        'Installation': 'Direct stick only',
        'Pattern': 'A + B boards (herringbone)',
        'Warranty': '25 years residential',
      },
    ),
    'studio': (
      '15/4 mm · 30 yr',
      {
        'Construction': '15 mm engineered, 4 mm oak wear layer',
        'Finish': 'Hard-wax oil',
        'Installation': 'Direct stick only',
        'Pattern': '45° chevron',
        'Warranty': '30 years residential',
      },
    ),
    'mtf': (
      '12 mm · 20 yr',
      {
        'Thickness': '12 mm',
        'Rating': 'AC4 commercial',
        'Edge': '4-sided V-groove',
        'Installation': 'Click floating',
        'Warranty': '20 years residential',
      },
    ),
    'aquaglow': (
      '8 mm · 15 yr',
      {
        'Thickness': '8 mm',
        'Rating': 'AC3 residential',
        'Core': 'Water-resistant HDF',
        'Installation': 'Click floating',
        'Warranty': '15 years residential',
      },
    ),
    'guardian': (
      '6.5 mm · Lifetime',
      {
        'Thickness': '6.5 mm + 1.5 mm IXPE underlay',
        'Wear layer': '0.5 mm',
        'Core': 'Rigid SPC, 100% waterproof',
        'Installation': 'Click floating',
        'Warranty': 'Lifetime residential',
      },
    ),
    'scotia': (
      'Quarter round 18 mm · MDF, foil wrapped',
      {
        'Length': '2400 mm',
        'Profile': 'Quarter round 18 mm',
        'Material': 'MDF, foil wrapped',
      },
    ),
    'skirting': (
      '12 mm · 2400 mm',
      {
        'Length': '2400 mm',
        'Height': '90 mm',
        'Material': 'MDF primed / oak veneer',
      },
    ),
    'tmould': (
      'Same-height floors, doorways · Aluminium, laminated',
      {
        'Length': '2700 mm',
        'Use': 'Same-height floors, doorways',
        'Material': 'Aluminium, laminated',
      },
    ),
    'reducer': (
      'Floor to lower surface · Aluminium, laminated',
      {
        'Length': '2700 mm',
        'Use': 'Floor to lower surface',
        'Material': 'Aluminium, laminated',
      },
    ),
    'endcap': (
      'Sliding doors, fireplaces · Aluminium',
      {
        'Length': '2700 mm',
        'Use': 'Sliding doors, fireplaces',
        'Material': 'Aluminium',
      },
    ),
    'underlay': (
      '2 mm / 3 mm · Acoustic, AAAC 5-star (3 mm)',
      {
        'Coverage': '15 m² per roll',
        'Thickness': '2 mm / 3 mm',
        'Rating': 'Acoustic, AAAC 5-star (3 mm)',
      },
    ),
    'barrier': (
      '200 µm · Over concrete slabs',
      {
        'Size': '25 m² roll',
        'Thickness': '200 µm',
        'Use': 'Over concrete slabs',
      },
    ),
    'adhesive': (
      'MS polymer, solvent free · ≈ 15 m² per pail',
      {
        'Size': '15 kg pail',
        'Type': 'MS polymer, solvent free',
        'Coverage': '≈ 15 m² per pail',
      },
    ),
    'care': (
      'pH-neutral · Timber, hybrid and laminate',
      {
        'Size': '1 L',
        'Type': 'pH-neutral',
        'Use': 'Timber, hybrid and laminate',
      },
    ),
    'tools': (
      'Floating floors',
      {
        'Includes': 'Spacers, tapping block, pull bar',
        'Use': 'Floating floors',
      },
    ),
    'stair': (
      'Bullnose, 14 mm rebate · Solid oak',
      {
        'Length': '2400 mm',
        'Profile': 'Bullnose, 14 mm rebate',
        'Material': 'Solid oak',
      },
    ),
  };
  final spec = specs[s.id];
  final rows =
      spec?.$2 ??
      <String, String>{
        'Category': s.category,
        'Style': s.style,
        'Dimensions': s.dimensions,
        if (s.flooring)
          'Coverage':
              '${_stockNumber(s.colours.first.product.sqmPerBox)} m²/box',
      };
  return detailCard(
    Column(
      children: [
        ListTile(
          dense: true,
          title: const Text(
            'Specifications',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
          subtitle: Text(
            spec?.$1 ?? s.dimensions,
            style: const TextStyle(fontSize: 11, color: _stockMuted),
          ),
          trailing: Icon(
            open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
            size: 17,
            color: _stockMuted,
          ),
          onTap: onTap,
        ),
        if (open)
          Padding(
            padding: const EdgeInsets.fromLTRB(13, 0, 13, 13),
            child: Column(
              children: [
                for (final row in rows.entries)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 88,
                          child: Text(
                            row.key,
                            style: const TextStyle(
                              fontSize: 11,
                              color: _stockMuted,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            row.value,
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
      ],
    ),
  );
}

Widget _inventoryJobResult(
  StockSeries series,
  StockColour colour,
  SalesQuoteQuantity quantity, {
  bool boxes = false,
}) {
  final lot = colour.product.sku == 'BON-001';
  final sufficient = quantity.count <= colour.quantity;
  final oneBatch = lot ? quantity.count <= 210 : null;
  final incomingBoxes = colour.product.sqmPerBox > 0
      ? ((colour.incoming + 1e-8) / colour.product.sqmPerBox).floor()
      : 0;
  Widget notice(String text, {bool blue = false}) => Container(
    width: double.infinity,
    margin: const EdgeInsets.only(top: 9),
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(
      color: blue ? const Color(0xffe7f0ff) : Colors.white,
      borderRadius: BorderRadius.circular(9),
    ),
    child: Text(
      text,
      style: TextStyle(
        fontSize: 11,
        color: blue ? const Color(0xff2167cd) : _stockMuted,
        height: 1.5,
      ),
    ),
  );
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        boxes
            ? '${quantity.count} boxes = ${_stockNumber(quantity.area)} m²'
            : '${_stockNumber(quantity.requested)} m² = ${quantity.count} boxes (${_stockNumber(quantity.area)} m²)',
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
      ),
      const SizedBox(height: 10),
      IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            for (final item in [
              (
                'Order',
                '${quantity.count} boxes',
                '${_stockNumber(quantity.area)} m²',
              ),
              (
                'Stock',
                sufficient
                    ? '✓ In stock'
                    : 'Short ${quantity.count - colour.quantity} boxes',
                sufficient
                    ? '${colour.quantity - quantity.count} boxes left'
                    : '${colour.quantity} boxes available',
              ),
              (
                'One batch',
                oneBatch == null
                    ? 'Check'
                    : oneBatch
                    ? 'Yes'
                    : 'No',
                lot ? 'max lot 210 bx' : 'Ask the warehouse',
              ),
            ])
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: detailCard(
                    Padding(
                      padding: const EdgeInsets.all(8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.$1,
                            style: const TextStyle(
                              fontSize: 10,
                              color: _stockMuted,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            item.$2,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: item.$1 == 'Stock' && !sufficient
                                  ? Colors.red
                                  : detailGreen,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.$3,
                            style: const TextStyle(
                              fontSize: 9,
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
      if (lot)
        notice(
          quantity.count <= 210
              ? 'One batch: BN-2408 · 210 boxes in lot'
              : 'No single batch has ${quantity.count} boxes — other batches:\nBN-2408   210 boxes in lot   use ${quantity.count < 210 ? quantity.count : 210}\nBN-2410   118 boxes in lot   use ${(quantity.count - 210).clamp(0, 118)}${quantity.count > 328 ? '\nShort ${quantity.count - 328} boxes across existing batches.' : ''}',
        ),
      if (incomingBoxes >= quantity.count && oneBatch == false)
        notice(
          'New batch ${colour.eta}: $incomingBoxes boxes — enough for one batch if the customer can wait',
          blue: true,
        ),
    ],
  );
}
