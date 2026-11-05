import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/mock_data.dart';
import '../../../models/customer.dart';
import '../../../models/product.dart';
import '../../../models/sales_user.dart';
import '../../../services/customer_service.dart';
import '../../../services/inventory_service.dart';
import '../../../services/pricing_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';
import '../catalog_filters.dart';
import '../quote/select_customer_screen.dart';
import 'product_detail_screen.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final TextEditingController _searchController = TextEditingController();

  final InventoryService _inventoryService = const InventoryService();

  String _category = 'All';
  String _style = 'All';

  String? _customerId;

  Customer? get _customer {
    final id = _customerId;
    if (id == null) return null;
    final customer = context.watch<CustomerService>().findById(id);
    final session = context.watch<SalesSession>();
    if (customer == null ||
        customer.archived ||
        !session.canAccessRegion(customer.region)) {
      return null;
    }
    return customer;
  }

  Future<void> _selectCustomer() async {
    final customer = await Navigator.of(context).push<Customer>(
      MaterialPageRoute(builder: (_) => const SelectCustomerScreen()),
    );
    if (mounted && customer != null) {
      setState(() => _customerId = customer.id);
    }
  }

  List<Product> get filteredProducts {
    final query = _searchController.text.trim().toLowerCase();

    return products.where((product) {
      final matchesSearch =
          query.isEmpty ||
          product.name.toLowerCase().contains(query) ||
          product.sku.toLowerCase().contains(query) ||
          product.colour.toLowerCase().contains(query) ||
          product.category.toLowerCase().contains(query) ||
          (product.brand ?? '').toLowerCase().contains(query) ||
          (product.installationStyle ?? '').toLowerCase().contains(query);

      return matchesSearch &&
          (_category == 'All' || product.category == _category) &&
          (_style == 'All' || product.installationStyle == _style);
    }).toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final groups = <(String, String?, String), List<Product>>{};
    for (final product in filteredProducts) {
      final key = (
        product.category,
        product.installationStyle,
        product.brand ?? product.name,
      );
      (groups[key] ??= []).add(product);
    }
    final styles = catalogStylesByCategory[_category];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Inventory Lookup'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          _buildSearch(),
          catalogFilterRow(catalogCategories, _category, (value) {
            setState(() {
              _category = value;
              _style = 'All';
            });
          }),
          if (styles != null)
            catalogFilterRow(styles, _style, (value) {
              setState(() => _style = value);
            }),
          Expanded(
            child: groups.isEmpty
                ? _buildEmptyState()
                : ListView(
                    padding: const EdgeInsets.fromLTRB(18, 8, 18, 28),
                    children: [
                      for (final group in groups.entries)
                        Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: ExpansionTile(
                            key: PageStorageKey(group.key),
                            initiallyExpanded: _searchController.text
                                .trim()
                                .isNotEmpty,
                            title: catalogSeriesTitle(
                              group.key.$3,
                              group.value,
                            ),
                            subtitle: Text(
                              [group.key.$1, ?group.key.$2].join(' · '),
                            ),
                            childrenPadding: const EdgeInsets.fromLTRB(
                              8,
                              0,
                              8,
                              8,
                            ),
                            children: [
                              for (final product in group.value)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 6),
                                  child: _buildProductCard(product),
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

  Widget _buildSearch() {
    final customer = _customer;
    return Container(
      color: AppColors.green,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Check stock in your warehouse',
            style: TextStyle(
              color: Colors.white,
              fontSize: 17,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${context.watch<SalesSession>().regionName} inventory',
            style: TextStyle(color: Colors.white70, fontSize: 11),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _searchController,
            onChanged: (_) {
              setState(() {});
            },
            decoration: InputDecoration(
              hintText: 'Search brand, colour or SKU...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isEmpty
                  ? null
                  : IconButton(
                      onPressed: () {
                        _searchController.clear();

                        setState(() {});
                      },
                      icon: const Icon(Icons.close),
                    ),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 13),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _selectCustomer,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white54),
                    minimumSize: const Size(0, 44),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.person_outline, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          customer?.businessName ?? 'Select Customer',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.expand_more, size: 18),
                    ],
                  ),
                ),
              ),
              if (customer != null)
                IconButton(
                  tooltip: 'Clear customer',
                  color: Colors.white,
                  onPressed: () => setState(() => _customerId = null),
                  icon: const Icon(Icons.close),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(Product product) {
    final customer = _customer;
    final pricing = context.watch<PricingService>();
    final customerPrice = customer == null
        ? null
        : pricing.getCustomerPriceOverride(
            customerId: customer.id,
            product: product,
          );
    final region = context.watch<SalesSession>().region;
    final inventory = _inventoryService.getForProductAndRegion(
      product.id,
      region,
    );
    final pieces = inventory?.stockPieces;
    final stock = inventory == null
        ? 'Unavailable'
        : pieces != null
        ? '$pieces pcs'
        : '${inventory.stockBoxes} boxes';
    final available =
        inventory != null && product.category != 'Accessories' && pieces == null
        ? '${inventory.stockSqm.toStringAsFixed(2)} m²'
        : stock;

    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ProductDetailScreen(product: product),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      color: AppColors.copperLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.texture,
                      color: AppColors.copper,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 13),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.colour.isEmpty
                              ? product.name
                              : product.colour,
                          style: const TextStyle(
                            color: AppColors.text,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '${product.sku} · '
                          '${product.category}',
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 10,
                          ),
                        ),
                        const SizedBox(height: 7),
                        Text(
                          customerPrice == null
                              ? 'Standard Price · \$${product.standardPrice.toStringAsFixed(2)} / m²'
                              : 'Customer Price · \$${customerPrice.toStringAsFixed(2)} / m²',
                          style: const TextStyle(
                            color: AppColors.copper,
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        if (customerPrice != null)
                          Text(
                            'Standard Price · \$${product.standardPrice.toStringAsFixed(2)} / m²',
                            style: const TextStyle(
                              color: AppColors.muted,
                              fontSize: 12,
                            ),
                          ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: AppColors.muted),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(height: 1, color: AppColors.border),
              const SizedBox(height: 13),
              Row(
                children: [
                  Expanded(child: _stockSummary(region.label, stock)),
                  Container(width: 1, height: 36, color: AppColors.border),
                  Expanded(child: _stockSummary('Available', available)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _stockSummary(String label, String quantity) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            quantity,
            style: const TextStyle(
              color: AppColors.text,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(30),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inventory_2_outlined, size: 42, color: AppColors.muted),
            SizedBox(height: 12),
            Text(
              'No products found',
              style: TextStyle(
                color: AppColors.text,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'Try another product, colour or SKU.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.muted),
            ),
          ],
        ),
      ),
    );
  }
}
