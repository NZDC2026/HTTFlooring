import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/mock_data.dart';
import '../../../models/product.dart';
import '../../../models/sales_user.dart';
import '../../../models/warehouse_inventory.dart';
import '../../../services/app_session.dart';
import '../../../services/stock_adjustment_service.dart';
import '../../../services/inventory_service.dart';
import '../../sales/catalog_filters.dart';
import 'stock_level_check_screen.dart';
import 'stock_adjustment_history_screen.dart';

class WarehouseInventoryScreen extends StatefulWidget {
  const WarehouseInventoryScreen({super.key});

  @override
  State<WarehouseInventoryScreen> createState() =>
      _WarehouseInventoryScreenState();
}

class _WarehouseInventoryScreenState extends State<WarehouseInventoryScreen> {
  final InventoryService _inventoryService = const InventoryService();
  final TextEditingController _searchController = TextEditingController();

  String _category = 'All';
  String _style = 'All';
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  SalesRegion _regionFromSession(AppSession session) {
    final regionName = session.regionName.toLowerCase();
    return regionName.contains('melbourne')
        ? SalesRegion.melbourne
        : SalesRegion.sydney;
  }

  List<_WarehouseProductRow> _rowsFor(SalesRegion region) {
    return products
        .map(
          (product) => _WarehouseProductRow(
            product: product,
            inventory: _inventoryService.getForProductAndRegion(
              product.id,
              region,
            ),
          ),
        )
        .where((row) {
          final query = _query.trim().toLowerCase();

          final matchesSearch =
              query.isEmpty ||
              row.product.name.toLowerCase().contains(query) ||
              row.product.sku.toLowerCase().contains(query) ||
              row.product.category.toLowerCase().contains(query) ||
              row.product.colour.toLowerCase().contains(query) ||
              (row.product.brand ?? '').toLowerCase().contains(query) ||
              (row.product.installationStyle ?? '').toLowerCase().contains(
                query,
              );

          return matchesSearch &&
              (_category == 'All' || row.product.category == _category) &&
              (_style == 'All' || row.product.installationStyle == _style);
        })
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<ValueNotifier<int>?>();
    final session = context.watch<AppSession>();
    final region = _regionFromSession(session);
    final rows = _rowsFor(region);
    final groups = <(String, String?, String), List<_WarehouseProductRow>>{};
    for (final row in rows) {
      final product = row.product;
      final key = (
        product.category,
        product.installationStyle,
        product.brand ?? product.name,
      );
      (groups[key] ??= []).add(row);
    }
    final styles = catalogStylesByCategory[_category];

    return Scaffold(
      backgroundColor: const Color(0xFFF4F0E9),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0E342B),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Inventory Lookup',
          style: TextStyle(
            fontFamily: 'sans-serif',
            fontSize: 23,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: [
          IconButton(
            tooltip: 'Stock Adjustment History',
            onPressed: () => _openStockLevelCheck(context),
            icon: const Icon(Icons.history),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            _Header(
              regionName: session.regionName,
              controller: _searchController,
              onChanged: (value) {
                setState(() {
                  _query = value;
                });
              },
              onClear: () {
                _searchController.clear();
                setState(() {
                  _query = '';
                });
              },
            ),
            catalogFilterRow(catalogCategories, _category, (category) {
              setState(() {
                _category = category;
                _style = 'All';
              });
            }),
            if (styles != null)
              catalogFilterRow(styles, _style, (style) {
                setState(() => _style = style);
              }),
            Expanded(
              child: rows.isEmpty
                  ? _EmptyState(
                      hasSearch: _query.trim().isNotEmpty,
                      onReset: () {
                        _searchController.clear();
                        setState(() {
                          _query = '';
                          _category = 'All';
                          _style = 'All';
                        });
                      },
                    )
                  : ListView(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 112),
                      children: [
                        for (final group in groups.entries)
                          Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            child: Theme(
                              data: Theme.of(context)
                                  .copyWith(dividerColor: Colors.transparent),
                              child: ExpansionTile(
                                initiallyExpanded:
                                    group.key == groups.keys.first,
                                tilePadding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                ),
                                childrenPadding: const EdgeInsets.fromLTRB(
                                  8,
                                  0,
                                  8,
                                  8,
                                ),
                                title: Row(
                                  children: [
                                    Expanded(
                                      child: catalogSeriesTitle(group.key.$3, [
                                        for (final row in group.value)
                                          row.product,
                                      ]),
                                    ),
                                    const SizedBox(width: 6),
                                    OutlinedButton.icon(
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: const Color(
                                          0xFF166337,
                                        ),
                                        side: const BorderSide(
                                          color: Color(0xFF3C9A5D),
                                        ),
                                        minimumSize: const Size(0, 30),
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 7,
                                        ),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            7,
                                          ),
                                        ),
                                      ),
                                      onPressed: () => Navigator.push(
                                        context,
                                        MaterialPageRoute<void>(
                                          builder: (_) => StockLevelCheckScreen(
                                            brand: group.key.$3,
                                            products: [
                                              for (final p in products.where(
                                                (p) =>
                                                    p.category ==
                                                        group.key.$1 &&
                                                    p.installationStyle ==
                                                        group.key.$2 &&
                                                    (p.brand ?? p.name) ==
                                                        group.key.$3,
                                              ))
                                                StockCheckProduct(
                                                  id: p.id,
                                                  name: p.colour,
                                                  sku: p.sku,
                                                  dimensions: p.dimensions,
                                                  systemBoxes:
                                                      _inventoryService
                                                          .getForProductAndRegion(
                                                            p.id,
                                                            region,
                                                          )
                                                          ?.stockBoxes ??
                                                      0,
                                                ),
                                            ],
                                          ),
                                        ),
                                      ),
                                      icon: const Icon(
                                        Icons.edit_outlined,
                                        size: 14,
                                      ),
                                      label: const Text(
                                        'Adjust Stock',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                subtitle: Text(
                                  [group.key.$1, ?group.key.$2].join(' · '),
                                  style: const TextStyle(fontSize: 12),
                                ),
                                children: [
                                  for (final row in group.value)
                                    _colourCard(context, row, region),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
            ),
          ],
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton.icon(
            onPressed: () => _openStockLevelCheck(context),
            icon: const Icon(Icons.history),
            label: const Text('Stock Adjustment History'),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF0E342B),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _colourCard(
    BuildContext context,
    _WarehouseProductRow row,
    SalesRegion region,
  ) {
    final p = row.product;
    final stock = row.inventory;
    final values = _inventoryService.stockMetrics(p.id, region);
    final onHand = values['onHand'] ?? stock?.stockBoxes ?? 0;
    Widget metric(String label, String value, Color background, Color colour) =>
        Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 2),
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: background,
              borderRadius: BorderRadius.circular(9),
            ),
            child: Column(
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 21,
                    fontWeight: FontWeight.w800,
                    color: colour,
                  ),
                ),
              ],
            ),
          ),
        );
    return Container(
      margin: const EdgeInsets.only(bottom: 9),
      padding: const EdgeInsets.all(9),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: const Color(0xFFE9E5DE)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: 46,
                  height: 44,
                  child: CustomPaint(painter: _WoodSwatch()),
                ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      p.colour,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      p.sku,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF777B78),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 9),
          Row(
            children: [
              metric(
                'On Hand',
                '$onHand',
                const Color(0xFFEDF5E7),
                const Color(0xFF1F3527),
              ),
              metric(
                'Reserved',
                values['reserved']?.toString() ?? '—',
                const Color(0xFFFFF0D9),
                const Color(0xFFAD6D29),
              ),
              metric(
                'Damaged',
                values['damage']?.toString() ?? '—',
                const Color(0xFFFFE7E3),
                const Color(0xFFD3342C),
              ),
              metric(
                'Available',
                values['available']?.toString() ?? '—',
                const Color(0xFFE6F4D9),
                const Color(0xFF234B27),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 15,
                color: Color(0xFF777B78),
              ),
              const SizedBox(width: 4),
              const Expanded(
                child: Text('Bin Location  —', style: TextStyle(fontSize: 10)),
              ),
              const Icon(Icons.square_foot_outlined, size: 15),
              const SizedBox(width: 4),
              Text(
                values['area'] == null
                    ? 'Area  —'
                    : 'Area  ${values['area']!.toStringAsFixed(2)} m²',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _openStockLevelCheck(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const StockAdjustmentHistoryScreen(),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.regionName,
    required this.controller,
    required this.onChanged,
    required this.onClear,
  });

  final String regionName;
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$regionName Warehouse',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Color(0xFF777B78),
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Check current warehouse stock levels.',
            style: TextStyle(fontSize: 14, color: Color(0xFF17221F)),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: controller,
            onChanged: onChanged,
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(
              hintText: 'Search brand, colour or SKU...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: controller.text.isEmpty
                  ? null
                  : IconButton(
                      onPressed: onClear,
                      icon: const Icon(Icons.close),
                    ),
              filled: true,
              fillColor: const Color(0xFFFFFDF9),
              contentPadding: const EdgeInsets.symmetric(vertical: 14),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFFE3DED5)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFFE3DED5)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(
                  color: Color(0xFF0E342B),
                  width: 1.4,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.hasSearch, required this.onReset});

  final bool hasSearch;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.inventory_2_outlined,
              size: 48,
              color: Color(0xFF777B78),
            ),
            const SizedBox(height: 14),
            Text(
              hasSearch ? 'No matching products' : 'No products in this filter',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF17221F),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Try another search or stock filter.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF777B78)),
            ),
            const SizedBox(height: 16),
            OutlinedButton(onPressed: onReset, child: const Text('Show All')),
          ],
        ),
      ),
    );
  }
}

class _WarehouseProductRow {
  const _WarehouseProductRow({required this.product, required this.inventory});

  final Product product;
  final WarehouseInventory? inventory;

  _WarehouseStockStatus get status {
    final boxes = inventory?.stockBoxes ?? 0;

    if (boxes <= 0) {
      return _WarehouseStockStatus.outOfStock;
    }

    if (boxes <= 20) {
      return _WarehouseStockStatus.lowStock;
    }

    return _WarehouseStockStatus.inStock;
  }
}

enum _WarehouseStockStatus { inStock, lowStock, outOfStock }

class _WoodSwatch extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(
      Offset.zero & size,
      Paint()
        ..shader = const LinearGradient(
          colors: [Color(0xFFC18B4A), Color(0xFFF2CA8A), Color(0xFFAF773F)],
        ).createShader(Offset.zero & size),
    );
    canvas.save();
    canvas.clipRect(Offset.zero & size);
    for (var i = -12; i < 20; i++) {
      final x = i * 5.0;
      canvas.drawLine(
        Offset(x, 0),
        Offset(x + size.height, size.height),
        Paint()
          ..color = const Color(0x6686532B)
          ..strokeWidth = (i % 4 == 0 ? 1.5 : 0.5),
      );
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(_WoodSwatch old) => false;
}
