import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../models/product.dart';
import '../../../services/pricing_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';
import '../quote/configure_quote_item_screen.dart';
import '../quote/select_customer_screen.dart';

class ProductDetailScreen extends StatelessWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Product Details')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          // --------------------------------------------------
          // Product hero
          // --------------------------------------------------
          Container(
            height: 210,
            decoration: BoxDecoration(
              color: AppColors.copperLight,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Stack(
              children: [
                const Center(
                  child: Icon(Icons.texture, size: 82, color: AppColors.copper),
                ),
                Positioned(
                  top: 14,
                  right: 14,
                  child: _statusChip(product.status),
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          Text(
            product.name,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 29,
              height: 1.15,
              fontWeight: FontWeight.w600,
              color: AppColors.text,
            ),
          ),

          const SizedBox(height: 7),

          Text(
            '${product.sku} · ${product.category} · ${product.colour}',
            style: const TextStyle(color: AppColors.muted, fontSize: 13),
          ),

          const SizedBox(height: 28),

          // --------------------------------------------------
          // Inventory
          // --------------------------------------------------
          _sectionTitle('Inventory'),

          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.warehouse_outlined,
                      size: 19,
                      color: AppColors.green,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${session.regionName} Warehouse',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.text,
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.lock_outline,
                      size: 15,
                      color: AppColors.muted,
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                const Divider(height: 1, color: AppColors.border),

                const SizedBox(height: 18),

                Row(
                  children: [
                    Expanded(
                      child: _inventoryMetric(
                        'Boxes',
                        '${product.stockBoxes}',
                        Icons.inventory_2_outlined,
                      ),
                    ),
                    Container(width: 1, height: 52, color: AppColors.border),
                    const SizedBox(width: 18),
                    Expanded(
                      child: _inventoryMetric(
                        'Available',
                        '${product.stockSqm.toStringAsFixed(2)} m²',
                        Icons.square_foot_outlined,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 18),

                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.successLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.check_circle_outline,
                        size: 17,
                        color: AppColors.success,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        product.status,
                        style: const TextStyle(
                          color: AppColors.success,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          // --------------------------------------------------
          // Pricing
          // --------------------------------------------------
          _sectionTitle('Pricing'),

          const SizedBox(height: 10),

          Container(
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _priceRow(
                  label: 'Standard Price',
                  value: '\$${product.standardPrice.toStringAsFixed(2)} / m²',
                ),

                const Divider(
                  height: 1,
                  indent: 16,
                  endIndent: 16,
                  color: AppColors.border,
                ),

                _priceRow(
                  label: 'Sales Floor',
                  value: '\$${product.salesFloorPrice.toStringAsFixed(2)} / m²',
                  valueColor: AppColors.copper,
                ),

                if (product.discount > 0) ...[
                  const Divider(
                    height: 1,
                    indent: 16,
                    endIndent: 16,
                    color: AppColors.border,
                  ),
                  _priceRow(
                    label: 'Promotion',
                    value: '${product.discount.toStringAsFixed(0)}% OFF',
                    valueColor: AppColors.success,
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 12),

          const Text(
            'Customer-specific pricing is shown after selecting a customer.',
            style: TextStyle(color: AppColors.muted, fontSize: 12),
          ),

          const SizedBox(height: 28),

          // --------------------------------------------------
          // Product information
          // --------------------------------------------------
          _sectionTitle('Product Information'),

          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _detailRow('SKU', product.sku),
                _divider(),
                _detailRow('Category', product.category),
                _divider(),
                _detailRow('Colour', product.colour),
                _divider(),
                _detailRow('Unit', 'Box / m²'),
                _divider(),
                _detailRow(
                  'Coverage',
                  '${product.sqmPerBox.toStringAsFixed(3)} m² / box',
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          // --------------------------------------------------
          // Customer pricing / quote CTA
          // --------------------------------------------------
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: AppColors.copperLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, size: 19, color: AppColors.copper),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Select a customer to view their pricing and add this product to a quotation.',
                    style: TextStyle(
                      color: AppColors.copper,
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: () async {
                final customer = await Navigator.push<Customer>(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const SelectCustomerScreen(),
                  ),
                );

                if (customer == null || !context.mounted) {
                  return;
                }

                final customerPrice = context
                    .read<PricingService>()
                    .getCustomerPrice(
                      customerId: customer.id,
                      product: product,
                    );

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
              label: const Text(
                'Check Customer Pricing',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // Components
  // ==========================================================

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontFamily: 'serif',
        fontSize: 19,
        fontWeight: FontWeight.w700,
        color: AppColors.text,
      ),
    );
  }

  Widget _inventoryMetric(String label, String value, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.copper),
        const SizedBox(width: 9),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(color: AppColors.muted, fontSize: 11),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  color: AppColors.text,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _priceRow({
    required String label,
    required String value,
    Color valueColor = AppColors.text,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(color: AppColors.muted, fontSize: 13),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 13),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(color: AppColors.muted, fontSize: 13),
            ),
          ),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                color: AppColors.text,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() {
    return const Divider(height: 1, color: AppColors.border);
  }

  Widget _statusChip(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.successLight,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: const TextStyle(
          color: AppColors.success,
          fontWeight: FontWeight.w700,
          fontSize: 11,
        ),
      ),
    );
  }
}
