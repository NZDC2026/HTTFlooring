import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/mock_data.dart';
import '../../../models/product.dart';
import '../../../models/sales_user.dart';
import '../../../models/warehouse_inventory.dart';
import '../../../services/app_session.dart';
import '../../../services/inventory_service.dart';
import 'stock_level_check_screen.dart';

enum _InventoryFilter { all, inStock, lowStock, outOfStock }

class WarehouseInventoryScreen extends StatefulWidget {
  const WarehouseInventoryScreen({super.key});

  @override
  State<WarehouseInventoryScreen> createState() =>
      _WarehouseInventoryScreenState();
}

class _WarehouseInventoryScreenState extends State<WarehouseInventoryScreen> {
  final InventoryService _inventoryService = const InventoryService();
  final TextEditingController _searchController = TextEditingController();

  _InventoryFilter _filter = _InventoryFilter.all;
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
              row.product.colour.toLowerCase().contains(query);

          if (!matchesSearch) {
            return false;
          }

          switch (_filter) {
            case _InventoryFilter.all:
              return true;
            case _InventoryFilter.inStock:
              return row.status == _WarehouseStockStatus.inStock;
            case _InventoryFilter.lowStock:
              return row.status == _WarehouseStockStatus.lowStock;
            case _InventoryFilter.outOfStock:
              return row.status == _WarehouseStockStatus.outOfStock;
          }
        })
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<AppSession>();
    final region = _regionFromSession(session);
    final rows = _rowsFor(region);

    return Scaffold(
      backgroundColor: const Color(0xFFF4F0E9),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0E342B),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text('Inventory Lookup'),
        actions: [
          IconButton(
            tooltip: 'Stock Level Check',
            onPressed: () => _openStockLevelCheck(context),
            icon: const Icon(Icons.fact_check_outlined),
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
            _FilterBar(
              selected: _filter,
              onSelected: (filter) {
                setState(() {
                  _filter = filter;
                });
              },
            ),
            Expanded(
              child: rows.isEmpty
                  ? _EmptyState(
                      hasSearch: _query.trim().isNotEmpty,
                      onReset: () {
                        _searchController.clear();
                        setState(() {
                          _query = '';
                          _filter = _InventoryFilter.all;
                        });
                      },
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 112),
                      itemCount: rows.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        return _ProductCard(row: rows[index]);
                      },
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
            icon: const Icon(Icons.fact_check_outlined),
            label: const Text('Stock Level Check'),
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

  void _openStockLevelCheck(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const StockLevelCheckScreen()),
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
              hintText: 'Search by name, colour or SKU...',
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

class _FilterBar extends StatelessWidget {
  const _FilterBar({required this.selected, required this.onSelected});

  final _InventoryFilter selected;
  final ValueChanged<_InventoryFilter> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        children: [
          _FilterChip(
            label: 'All',
            selected: selected == _InventoryFilter.all,
            onTap: () => onSelected(_InventoryFilter.all),
          ),
          _FilterChip(
            label: 'In Stock',
            selected: selected == _InventoryFilter.inStock,
            onTap: () => onSelected(_InventoryFilter.inStock),
          ),
          _FilterChip(
            label: 'Low Stock',
            selected: selected == _InventoryFilter.lowStock,
            onTap: () => onSelected(_InventoryFilter.lowStock),
          ),
          _FilterChip(
            label: 'Out of Stock',
            selected: selected == _InventoryFilter.outOfStock,
            onTap: () => onSelected(_InventoryFilter.outOfStock),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: const Color(0xFF0E342B),
        backgroundColor: const Color(0xFFFFFDF9),
        side: const BorderSide(color: Color(0xFFE3DED5)),
        labelStyle: TextStyle(
          color: selected ? Colors.white : const Color(0xFF17221F),
          fontWeight: FontWeight.w600,
        ),
        showCheckmark: false,
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.row});

  final _WarehouseProductRow row;

  @override
  Widget build(BuildContext context) {
    final inventory = row.inventory;

    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFDF9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE3DED5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFFF8E5D6),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.inventory_2_outlined,
              color: Color(0xFFB96532),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  row.product.name,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF17221F),
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${row.product.sku} · ${row.product.category}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF777B78),
                  ),
                ),
                const SizedBox(height: 10),
                if (inventory == null)
                  const Text(
                    'No warehouse inventory record',
                    style: TextStyle(fontSize: 13, color: Color(0xFFD83B32)),
                  )
                else
                  Wrap(
                    spacing: 12,
                    runSpacing: 4,
                    children: [
                      _StockValue(
                        icon: Icons.inventory_2_outlined,
                        text: '${inventory.stockBoxes} boxes',
                      ),
                      _StockValue(
                        icon: Icons.square_foot_outlined,
                        text: '${inventory.stockSqm.toStringAsFixed(2)} m²',
                      ),
                    ],
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          _StatusBadge(status: row.status),
        ],
      ),
    );
  }
}

class _StockValue extends StatelessWidget {
  const _StockValue({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: const Color(0xFF777B78)),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF17221F),
          ),
        ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final _WarehouseStockStatus status;

  @override
  Widget build(BuildContext context) {
    late final String label;
    late final Color foreground;
    late final Color background;

    switch (status) {
      case _WarehouseStockStatus.inStock:
        label = 'In Stock';
        foreground = const Color(0xFF258453);
        background = const Color(0xFFE2F2E7);
      case _WarehouseStockStatus.lowStock:
        label = 'Low Stock';
        foreground = const Color(0xFFD9892D);
        background = const Color(0xFFFFE9D3);
      case _WarehouseStockStatus.outOfStock:
        label = 'Out';
        foreground = const Color(0xFFD83B32);
        background = const Color(0xFFFFE3DF);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: foreground,
        ),
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
