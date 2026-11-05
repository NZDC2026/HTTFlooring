import 'package:flutter/material.dart';
import 'package:htt_flooring_app/models/sales_user.dart';
import 'package:provider/provider.dart';

import '../../../data/mock_data.dart';
import '../../../models/customer.dart';
import '../../../models/product.dart';
import '../../../services/pricing_service.dart';
import '../../../theme/app_theme.dart';
import '../catalog_filters.dart';
import 'edit_price_screen.dart';

class CustomerPricingScreen extends StatefulWidget {
  const CustomerPricingScreen({super.key, required this.customer});

  final Customer customer;

  @override
  State<CustomerPricingScreen> createState() => _CustomerPricingScreenState();
}

class _CustomerPricingScreenState extends State<CustomerPricingScreen> {
  final TextEditingController _searchController = TextEditingController();

  String _query = '';
  static final _scotiaDemoPrices = {
    for (final (sku, colour, standardPrice, customerPrice) in const [
      ('DEMO-SCO-01', 'Natural Oak', 12.00, 9.50),
      ('DEMO-SCO-02', 'White', 10.00, 8.00),
      ('DEMO-SCO-03', 'Charcoal', 11.50, 9.00),
    ])
      Product(
        id: sku,
        sku: sku,
        name: 'Scotia $colour',
        category: 'Accessories',
        brand: 'Scotia',
        colour: colour,
        standardPrice: standardPrice,
        salesFloorPrice: 0,
        discount: 0,
        stockBoxes: 0,
        stockSqm: 0,
        sqmPerBox: 0,
        status: 'Demo',
      ): customerPrice,
  };

  String _category = 'All';
  String _installationStyle = 'All';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pricing = context.watch<PricingService>();
    final customer = widget.customer;

    final query = _query.toLowerCase();
    final styles = catalogStylesByCategory[_category];
    final groups = <(String, String?, String), List<Product>>{};
    for (final product in [...products, ..._scotiaDemoPrices.keys]) {
      if (_category != 'All' && product.category != _category) continue;
      if (_installationStyle != 'All' &&
          product.installationStyle != _installationStyle) {
        continue;
      }

      final brand = product.brand ?? product.name;
      final matchesSearch = [
        product.name,
        product.colour,
        product.sku,
        product.category,
        brand,
        product.installationStyle ?? '',
      ].any((value) => value.toLowerCase().contains(query));
      if (!matchesSearch) continue;

      final key = (product.category, product.installationStyle, brand);
      (groups[key] ??= []).add(product);
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Customer Pricing')),
      body: Column(
        children: [
          _customerHeader(customer),
          _search(),
          catalogFilterRow(catalogCategories, _category, (value) {
            setState(() {
              _category = value;
              _installationStyle = 'All';
            });
          }),
          if (styles != null)
            catalogFilterRow(styles, _installationStyle, (value) {
              setState(() => _installationStyle = value);
            }),
          Expanded(
            child: groups.isEmpty
                ? const _EmptyProductState()
                : ListView(
                    padding: const EdgeInsets.fromLTRB(18, 10, 18, 30),
                    children: [
                      for (final group in groups.entries)
                        Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: ExpansionTile(
                            key: PageStorageKey(group.key),
                            title: catalogSeriesTitle(
                              group.key.$3,
                              group.value,
                            ),
                            subtitle: Text(
                              [
                                group.key.$1,
                                ?group.key.$2,
                                if (_scotiaDemoPrices.containsKey(
                                  group.value.first,
                                ))
                                  'Demo prices',
                              ].join(' · '),
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
                                  child: _productCard(
                                    context,
                                    pricing,
                                    product,
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

  Widget _customerHeader(Customer customer) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
      decoration: const BoxDecoration(
        color: AppColors.card,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 25,
            backgroundColor: AppColors.copperLight,
            child: Text(
              _initials(customer.businessName),
              style: const TextStyle(
                color: AppColors.copper,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  customer.businessName,
                  style: const TextStyle(
                    color: AppColors.text,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${customer.type} · ${customer.region.label}',
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.ivory,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.lock_outline,
                  size: 12,
                  color: AppColors.muted,
                ),
                const SizedBox(width: 4),
                Text(
                  customer.region.label,
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _search() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 8),
      child: TextField(
        controller: _searchController,
        onChanged: (value) {
          setState(() {
            _query = value.trim();
          });
        },
        decoration: InputDecoration(
          hintText: 'Search brand, colour or SKU...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _query.isEmpty
              ? null
              : IconButton(
                  onPressed: () {
                    _searchController.clear();

                    setState(() {
                      _query = '';
                    });
                  },
                  icon: const Icon(Icons.close),
                ),
          filled: true,
          fillColor: AppColors.card,
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.green),
          ),
        ),
      ),
    );
  }

  Widget _productCard(
    BuildContext context,
    PricingService pricing,
    Product product,
  ) {
    final demoPrice = _scotiaDemoPrices[product];
    final unit = demoPrice == null ? 'm²' : 'piece';
    final customerPrice =
        demoPrice ??
        pricing.getCustomerPrice(
          customerId: widget.customer.id,
          product: product,
        );

    final discount = product.standardPrice <= 0
        ? 0.0
        : (product.standardPrice - customerPrice) / product.standardPrice * 100;

    final hasSpecialPrice = customerPrice < product.standardPrice;

    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: demoPrice == null
            ? () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => EditPriceScreen(
                      customer: widget.customer,
                      product: product,
                    ),
                  ),
                );

                if (mounted) {
                  setState(() {});
                }
              }
            : null,
        child: Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: AppColors.copperLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.texture, color: AppColors.copper),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            product.colour.isEmpty
                                ? product.name
                                : product.colour,
                            style: const TextStyle(
                              color: AppColors.text,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        if (demoPrice == null)
                          const Icon(
                            Icons.chevron_right,
                            color: AppColors.muted,
                            size: 20,
                          ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${product.sku} · ${product.category}',
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 10,
                      ),
                    ),
                    const SizedBox(height: 13),
                    Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'Customer Price',
                            style: TextStyle(
                              color: AppColors.muted,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        Text(
                          '\$${customerPrice.toStringAsFixed(2)} / $unit',
                          style: const TextStyle(
                            color: AppColors.copper,
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'Standard Price',
                            style: TextStyle(
                              color: AppColors.muted,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        Text(
                          '\$${product.standardPrice.toStringAsFixed(2)} / $unit',
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                    if (hasSpecialPrice) ...[
                      const SizedBox(height: 9),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.successLight,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'SAVE ${discount.toStringAsFixed(1)}%',
                            style: const TextStyle(
                              color: AppColors.success,
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _initials(String value) {
    final words = value
        .trim()
        .split(RegExp(r'\s+'))
        .where((word) => word.isNotEmpty)
        .toList();

    if (words.isEmpty) {
      return '?';
    }

    if (words.length == 1) {
      final word = words.first;

      return word.substring(0, word.length >= 2 ? 2 : 1).toUpperCase();
    }

    return '${words[0][0]}${words[1][0]}'.toUpperCase();
  }
}

class _EmptyProductState extends StatelessWidget {
  const _EmptyProductState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(36),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.search_off_outlined, size: 42, color: AppColors.muted),
            SizedBox(height: 12),
            Text(
              'No products found',
              style: TextStyle(
                color: AppColors.text,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: 5),
            Text(
              'Try another product name or SKU.',
              style: TextStyle(color: AppColors.muted, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
