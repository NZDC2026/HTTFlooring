import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/pricing_service.dart';
import '../models/product.dart';
import '../models/customer.dart';
import 'select_customer_screen.dart';
import 'configure_quote_item_screen.dart';
import '../theme/app_theme.dart';

class ProductDetailScreen extends StatelessWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,

      appBar: AppBar(title: const Text('Product')),

      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            height: 230,
            decoration: BoxDecoration(
              color: AppColors.copperLight,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.texture, size: 80, color: AppColors.copper),
          ),

          const SizedBox(height: 22),

          Text(
            product.name,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 29,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: 3),

          Text(
            '${product.sku} · ${product.category}',
            style: const TextStyle(color: AppColors.muted),
          ),

          const SizedBox(height: 25),

          _sectionTitle('Inventory'),

          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                const Row(
                  children: [
                    Icon(Icons.location_on_outlined, size: 18),
                    SizedBox(width: 6),
                    Text(
                      'Sydney',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    Spacer(),
                    Icon(Icons.lock_outline, size: 14, color: AppColors.muted),
                  ],
                ),

                const Divider(height: 25),

                Row(
                  children: [
                    Expanded(
                      child: _inventoryMetric('Boxes', '${product.stockBoxes}'),
                    ),

                    Expanded(
                      child: _inventoryMetric(
                        'Available',
                        '${product.stockSqm.toStringAsFixed(2)} m²',
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 15),

                Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.successLight,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      product.status,
                      style: const TextStyle(
                        color: AppColors.success,
                        fontWeight: FontWeight.w700,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 25),

          _sectionTitle('Product Details'),

          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                _detailRow('Colour', product.colour),
                _detailRow('Category', product.category),
                _detailRow(
                  'Pack Size',
                  '${product.sqmPerBox.toStringAsFixed(2)} m²',
                ),
              ],
            ),
          ),

          const SizedBox(height: 25),

          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.copperLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, size: 18, color: AppColors.copper),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Select a customer before viewing customer-specific pricing or creating a quote.',
                    style: TextStyle(color: AppColors.copper, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.copper,
              padding: const EdgeInsets.all(16),
            ),
            onPressed: () async {
              final customer = await Navigator.push<Customer>(
                context,
                MaterialPageRoute(builder: (_) => const SelectCustomerScreen()),
              );

              if (customer == null || !context.mounted) {
                return;
              }

              final customerPrice = context
                  .read<PricingService>()
                  .getCustomerPrice(customerId: customer.id, product: product);

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ConfigureQuoteItemScreen(
                    customer: customer,
                    product: product,
                    initialPrice: customerPrice,
                  ),
                ),
              );
            },
            icon: const Icon(Icons.person_search_outlined),
            label: const Text('Select Customer'),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
    );
  }

  Widget _inventoryMetric(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.muted, fontSize: 11),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Text(label, style: const TextStyle(color: AppColors.muted)),
          ),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
