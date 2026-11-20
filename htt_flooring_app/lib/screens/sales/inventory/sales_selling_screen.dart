import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/product.dart';
import '../../../services/sales_session.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../home/sales_dashboard_support.dart';
import 'inventory_catalog_data.dart';
import 'inventory_screen.dart';

class SalesSellingScreen extends StatefulWidget {
  const SalesSellingScreen({super.key, required this.type});
  final String type;
  @override
  State<SalesSellingScreen> createState() => _SalesSellingState();
}

class _SalesSellingState extends State<SalesSellingScreen> {
  final Set<String> _open = {};
  String _n(num n) => NumberFormat('#,##0').format(n);
  late List<StockSeries> _catalog;
  StockSeries _base(String id) => _catalog.firstWhere((s) => s.id == id);
  StockColour _colour(
    String id,
    String name,
    String sku,
    int boxes,
    double area,
    double price, {
    double incoming = 0,
    String eta = '',
    bool low = false,
  }) {
    final s = _base(id), p = s.colours.first.product;
    return StockColour(
      product: Product(
        id: 'demo-selling-$sku',
        name: '${s.name} $name',
        brand: s.name,
        colour: name,
        sku: sku,
        category: s.category,
        installationStyle: s.style,
        dimensions: s.dimensions,
        standardPrice: price,
        salesFloorPrice: p.salesFloorPrice,
        discount: 0,
        stockBoxes: boxes,
        stockSqm: area,
        sqmPerBox: p.sqmPerBox,
        status: boxes == 0
            ? 'Out of Stock'
            : low
            ? 'Low Stock'
            : 'In Stock',
      ),
      quantity: boxes,
      area: area,
      incoming: incoming,
      eta: eta,
      low: low,
    );
  }

  StockSeries _full(String id, List<StockColour> selected) {
    final s = _base(id), colours = [...s.colours];
    for (final c in selected) {
      var index = colours.indexWhere(
        (o) =>
            o.product.sku == c.product.sku ||
            o.product.colour == c.product.colour,
      );
      if (index < 0) {
        final num = int.tryParse(c.product.sku.split('-').last) ?? 1;
        index = id == 'guardian' ? num - 16 : num - 1;
      }
      if (index >= 0 && index < colours.length) colours[index] = c;
    }
    return StockSeries(
      id: s.id,
      name: s.name,
      category: s.category,
      style: s.style,
      dimensions: s.dimensions,
      unit: s.unit,
      priceUnit: s.priceUnit,
      colours: colours,
      signals: s.signals,
    );
  }

  @override
  Widget build(BuildContext context) {
    final demo = SalesDashboardData(context).sample;
    _catalog = inventoryCatalog(
      demo: demo,
      region: context.watch<SalesSession>().region,
    );
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar(widget.type == 'All' ? 'Selling now' : widget.type),
      body: !demo
          ? const Center(
              child: Text(
                'No selling updates available.',
                style: TextStyle(fontSize: 13, color: detailMuted),
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(12),
              children: [
                if (widget.type == 'Incoming')
                  ..._incoming()
                else ...[
                  if (widget.type == 'All' || widget.type == 'Promotion')
                    ..._promotion(),
                  if (widget.type == 'All' || widget.type == 'Clearance')
                    ..._clearance(),
                  if (widget.type == 'All' || widget.type == 'New')
                    ..._newRange(),
                ],
              ],
            ),
    );
  }

  Widget _hero(
    String label,
    String title,
    String description, {
    required String first,
    required String last,
    required String centre,
    required double progress,
    required String footer,
    Color color = detailGreen,
  }) => Padding(
    padding: const EdgeInsets.only(bottom: 14),
    child: Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .04),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: detailLine),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              DashboardIcon(
                label.startsWith('NEW')
                    ? CupertinoIcons.star
                    : label.startsWith('PROMOTION')
                    ? CupertinoIcons.tag
                    : Icons.trending_down,
                size: 16,
                color: color,
              ),
              const SizedBox(width: 7),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    letterSpacing: .6,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(
              fontSize: 21,
              fontWeight: FontWeight.w600,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            description,
            style: const TextStyle(
              fontSize: 12,
              color: detailMuted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              Text(
                first,
                style: const TextStyle(fontSize: 10, color: detailMuted),
              ),
              const Spacer(),
              detailBadge(centre),
              const Spacer(),
              Text(
                last,
                style: const TextStyle(fontSize: 10, color: detailMuted),
              ),
            ],
          ),
          const SizedBox(height: 9),
          ClipRRect(
            borderRadius: BorderRadius.circular(5),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              color: color,
              backgroundColor: const Color(0xFFE8ECE9),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            footer,
            style: const TextStyle(fontSize: 10, color: detailMuted),
          ),
        ],
      ),
    ),
  );
  List<Widget> _promotion() {
    final colors = [
      _colour(
        'guardian',
        'D3016',
        'GUA-016',
        44,
        97,
        55,
        incoming: 440,
        eta: '2 Dec',
      ),
      _colour('guardian', 'D3017', 'GUA-017', 170, 374, 55),
    ];
    return [
      _hero(
        'PROMOTION · 1 SERIES · 2 COLOURS',
        'Guardian hybrid — extra 5% off over 200 m²',
        'For orders confirmed by 30 Nov. Applies on top of the customer price, subject to floor price.',
        first: '1 Nov',
        last: '30 Nov',
        centre: '12 days left',
        progress: .59,
        footer: '59% elapsed · ends 30 Nov 2026',
      ),
      _series('guardian', colors),
      const SizedBox(height: 16),
    ];
  }

  List<Widget> _clearance() {
    final colors = [_colour('aquaglow', 'Silver', 'AQU-001', 76, 167, 48)];
    return [
      _hero(
        'CLEARANCE · 1 SERIES · 1 COLOUR',
        'AquaGlow Silver — clear remaining stock',
        'Priority to move the remaining boxes before the range update. Ends when sold out.',
        first: 'Sold 164 bx',
        last: 'of 240 bx',
        centre: '167 m² · 76 boxes left',
        progress: .68,
        footer: '68% sold · no end date, runs until sold out',
        color: const Color(0xFFC83D3D),
      ),
      _series('aquaglow', colors),
      const SizedBox(height: 16),
    ];
  }

  List<Widget> _newRange() {
    final colors = [
      _colour(
        'mtf',
        'Natural Oak',
        'MTF-003',
        0,
        0,
        38,
        incoming: 723,
        eta: '25 Nov',
      ),
      _colour('mtf', 'Grey', 'MTF-004', 0, 0, 38, incoming: 723, eta: '25 Nov'),
    ];
    return [
      _hero(
        'NEW · 1 SERIES · 2 COLOURS',
        'MTF laminate — 2 new colours',
        'Natural Oak and Grey join the MTF range. First stock arrives 25 Nov.',
        first: '1 Nov',
        last: '31 Dec',
        centre: '43 days left',
        progress: .28,
        footer: '28% elapsed · ends 31 Dec 2026',
        color: const Color(0xFFAA7800),
      ),
      _series('mtf', colors),
      const SizedBox(height: 16),
    ];
  }

  List<Widget> _incoming() {
    final bonita = _base('bonita');
    final groups = <String, List<StockColour>>{
      'bonita': [
        bonita.colours.firstWhere((c) => c.product.colour == 'Espresso'),
        bonita.colours.firstWhere((c) => c.product.colour == 'Cotton Oak'),
      ],
      'mtf': [
        _colour(
          'mtf',
          'Natural Oak',
          'MTF-003',
          0,
          0,
          38,
          incoming: 723,
          eta: '25 Nov',
        ),
        _colour(
          'mtf',
          'Grey',
          'MTF-004',
          0,
          0,
          38,
          incoming: 723,
          eta: '25 Nov',
        ),
        _colour(
          'mtf',
          'Beech',
          'MTF-006',
          92,
          222,
          36,
          incoming: 482,
          eta: '25 Nov',
        ),
      ],
      'heritage': [
        _colour(
          'heritage',
          'Sandstone',
          'HER-010',
          244,
          351,
          95,
          incoming: 144,
          eta: '27 Nov',
        ),
        _colour(
          'heritage',
          'Smoked Oak',
          'HER-003',
          18,
          26,
          98,
          incoming: 173,
          eta: '28 Nov',
          low: true,
        ),
        _colour(
          'heritage',
          'Grey Wash',
          'HER-007',
          0,
          0,
          95,
          incoming: 144,
          eta: '28 Nov',
        ),
      ],
      'reducer': [
        _colour(
          'reducer',
          'Silver',
          'RDC-02',
          0,
          0,
          26,
          incoming: 80,
          eta: '30 Nov',
        ),
      ],
      'guardian': [
        _colour(
          'guardian',
          'D3016',
          'GUA-016',
          44,
          97,
          55,
          incoming: 440,
          eta: '2 Dec',
        ),
        _colour(
          'guardian',
          'D3022',
          'GUA-022',
          0,
          0,
          55,
          incoming: 220,
          eta: '2 Dec',
        ),
      ],
    };
    return [
      const Text(
        'INCOMING · 5 SERIES · 11 COLOURS',
        style: TextStyle(
          fontSize: 10,
          color: detailGreen,
          fontWeight: FontWeight.w600,
          letterSpacing: .5,
        ),
      ),
      const SizedBox(height: 10),
      const Text(
        'Arriving in the next 14 days',
        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
      ),
      const SizedBox(height: 14),
      detailCard(
        Padding(
          padding: const EdgeInsets.all(13),
          child: Row(
            children: [
              for (final m in [
                ('+4,369', 'm² arriving'),
                ('25 Nov', 'next arrival'),
                ('6', 'delivery dates'),
              ])
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        m.$1,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        m.$2,
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
      ),
      const SizedBox(height: 14),
      for (final entry in groups.entries)
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: _series(entry.key, entry.value, incoming: true),
        ),
    ];
  }

  Widget _series(String id, List<StockColour> colors, {bool incoming = false}) {
    final s = _full(id, colors), open = _open.contains(id);
    final amount = colors.fold<double>(
      0,
      (sum, c) => sum + (incoming ? c.incoming : c.area),
    );
    final boxes = incoming && s.flooring
        ? (amount / s.colours.first.product.sqmPerBox).round()
        : colors.fold<int>(0, (sum, c) => sum + c.quantity);
    final header = InkWell(
      onTap: () => setState(() => open ? _open.remove(id) : _open.add(id)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            InventorySwatch(seed: s.name, size: 42),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: s.name,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        TextSpan(
                          text:
                              '  ${colors.length} ${colors.length == 1 ? 'colour' : 'colours'}',
                          style: const TextStyle(
                            fontSize: 10,
                            color: detailMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    s.dimensions,
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'From \$${colors.map((c) => c.product.standardPrice).reduce((a, b) => a < b ? a : b).toStringAsFixed(2)}/${s.priceUnit}',
                    style: const TextStyle(fontSize: 10),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 4),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${incoming ? '+' : ''}${_n(amount)} ${s.flooring ? 'm²' : s.unit}',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (s.flooring)
                  Text(
                    '$boxes boxes',
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  ),
                if (incoming || colors.any((c) => c.incoming > 0))
                  detailBadge(incoming ? colors.first.eta : 'Incoming'),
              ],
            ),
            const SizedBox(width: 7),
            DetailGlyph(
              open ? 'down' : 'chevron',
              size: 12,
              color: detailMuted,
            ),
          ],
        ),
      ),
    );
    return detailCard(
      Column(
        children: [
          header,
          if (open)
            Container(
              decoration: const BoxDecoration(
                color: detailPale,
                border: Border(top: BorderSide(color: detailLine)),
              ),
              padding: const EdgeInsets.all(8),
              child: Column(
                children: [
                  for (final c in colors)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: _colourRow(s, c),
                    ),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => dashboardOpen(
                        context,
                        InventorySeriesDetails(series: s),
                      ),
                      child: Text(
                        'Series details · all ${s.colours.length} colours  ›',
                        style: const TextStyle(
                          fontSize: 11,
                          color: detailGreen,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _colourRow(StockSeries s, StockColour c) => detailCard(
    InkWell(
      onTap: () =>
          dashboardOpen(context, InventoryColourDetails(series: s, colour: c)),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Row(
          children: [
            InventorySwatch(seed: c.product.colour, size: 28, single: true),
            const SizedBox(width: 9),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(c.product.colour, style: const TextStyle(fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(
                    '${c.product.sku} · \$${c.product.standardPrice.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${_n(c.area)} ${s.flooring ? 'm²' : s.unit}${s.flooring ? ' ${c.quantity} bx' : ''}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (c.incoming > 0)
                  Text(
                    '+${_n(c.incoming)}${s.flooring ? ' m²' : ''} · ${c.eta}',
                    style: const TextStyle(
                      fontSize: 9,
                      color: Color(0xFF2167CD),
                    ),
                  ),
                if (c.quantity == 0)
                  const Text(
                    'Out of stock',
                    style: TextStyle(fontSize: 9, color: Colors.red),
                  ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}
