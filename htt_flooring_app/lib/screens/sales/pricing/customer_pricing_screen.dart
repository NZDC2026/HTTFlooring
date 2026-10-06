import 'package:flutter/material.dart';
import 'package:htt_flooring_app/models/sales_user.dart';
import 'package:provider/provider.dart';

import '../../../data/mock_data.dart';
import '../../../models/customer.dart';
import '../../../models/product.dart';
import '../../../services/pricing_service.dart';
import '../../../theme/app_theme.dart';
import 'edit_price_screen.dart';

enum _PricingFilter { all, special, tiers }

class CustomerPricingScreen extends StatefulWidget {
  const CustomerPricingScreen({super.key, required this.customer});

  final Customer customer;

  @override
  State<CustomerPricingScreen> createState() => _CustomerPricingScreenState();
}

class _CustomerPricingScreenState extends State<CustomerPricingScreen> {
  final TextEditingController _searchController = TextEditingController();

  String _query = '';
  _PricingFilter _filter = _PricingFilter.all;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pricing = context.watch<PricingService>();
    final customer = widget.customer;

    final filteredProducts = products.where((product) {
      if (_query.isNotEmpty) {
        final query = _query.toLowerCase();

        final matchesSearch =
            product.name.toLowerCase().contains(query) ||
            product.sku.toLowerCase().contains(query) ||
            product.category.toLowerCase().contains(query);

        if (!matchesSearch) {
          return false;
        }
      }

      final customerPrice = pricing.getCustomerPrice(
        customerId: customer.id,
        product: product,
      );

      switch (_filter) {
        case _PricingFilter.all:
          return true;

        case _PricingFilter.special:
          return customerPrice < product.standardPrice;

        case _PricingFilter.tiers:
          return customerPrice < product.standardPrice;
      }
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Customer Pricing')),
      body: Column(
        children: [
          _customerHeader(customer),
          _search(),
          _filters(),
          Expanded(
            child: filteredProducts.isEmpty
                ? const _EmptyProductState()
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(18, 10, 18, 30),
                    itemCount: filteredProducts.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final product = filteredProducts[index];

                      return _productCard(context, pricing, product);
                    },
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
          hintText: 'Search product or SKU...',
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

  Widget _filters() {
    return SizedBox(
      height: 50,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 5),
        children: [
          _filterChip('All', _PricingFilter.all),
          _filterChip('Special Prices', _PricingFilter.special),
          _filterChip('Price Tiers', _PricingFilter.tiers),
        ],
      ),
    );
  }

  Widget _filterChip(String label, _PricingFilter value) {
    final selected = _filter == value;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        showCheckmark: false,
        selectedColor: AppColors.copperLight,
        backgroundColor: AppColors.card,
        side: BorderSide(color: selected ? AppColors.copper : AppColors.border),
        labelStyle: TextStyle(
          color: selected ? AppColors.copper : AppColors.text,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
        onSelected: (_) {
          setState(() {
            _filter = value;
          });
        },
      ),
    );
  }

  Widget _productCard(
    BuildContext context,
    PricingService pricing,
    Product product,
  ) {
    final customerPrice = pricing.getCustomerPrice(
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
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) =>
                  EditPriceScreen(customer: widget.customer, product: product),
            ),
          );

          if (mounted) {
            setState(() {});
          }
        },
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
                            product.name,
                            style: const TextStyle(
                              color: AppColors.text,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
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
                          '\$${customerPrice.toStringAsFixed(2)} / m²',
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
                          '\$${product.standardPrice.toStringAsFixed(2)} / m²',
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
