import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../models/product.dart';
import '../../../models/sales_user.dart';
import '../../../models/warehouse_inventory.dart';
import '../../../services/inventory_service.dart';
import '../../../services/pricing_service.dart';
import '../../../theme/app_theme.dart';
import '../quote/configure_quote_item_screen.dart';
import '../quote/select_customer_screen.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({super.key, required this.product});

  final Product product;

  static const InventoryService _inventoryService = InventoryService();

  @override
  Widget build(BuildContext context) {
    final sydney = _inventoryService.getForProductAndRegion(
      product.id,
      SalesRegion.sydney,
    );

    final melbourne = _inventoryService.getForProductAndRegion(
      product.id,
      SalesRegion.melbourne,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Product Details')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          _productHero(),
          const SizedBox(height: 26),

          _sectionTitle('Standard Price'),
          const SizedBox(height: 10),
          _standardPriceCard(),

          const SizedBox(height: 26),

          _sectionTitle('Warehouse Inventory'),
          const SizedBox(height: 10),

          _warehouseCard(region: SalesRegion.sydney, inventory: sydney),

          const SizedBox(height: 10),

          _warehouseCard(region: SalesRegion.melbourne, inventory: melbourne),

          const SizedBox(height: 26),

          _sectionTitle('Product Information'),
          const SizedBox(height: 10),
          _productInformation(),

          const SizedBox(height: 26),

          _pricingInfo(),

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
              onPressed: () {
                _checkCustomerPricing(context);
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

  Widget _productHero() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 78,
          height: 78,
          decoration: BoxDecoration(
            color: AppColors.copperLight,
            borderRadius: BorderRadius.circular(14),
          ),
          child: const Icon(Icons.texture, color: AppColors.copper, size: 36),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                product.name,
                style: const TextStyle(
                  color: AppColors.text,
                  fontFamily: 'serif',
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  height: 1.1,
                ),
              ),
              const SizedBox(height: 7),
              Text(
                '${product.sku} · '
                '${product.category}',
                style: const TextStyle(color: AppColors.muted, fontSize: 11),
              ),
              const SizedBox(height: 4),
              Text(
                product.colour,
                style: const TextStyle(color: AppColors.muted, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _standardPriceCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Standard Price',
                  style: TextStyle(color: AppColors.muted, fontSize: 11),
                ),
                const SizedBox(height: 5),
                Text(
                  '\$${product.standardPrice.toStringAsFixed(2)} / m²',
                  style: const TextStyle(
                    color: AppColors.copper,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          if (product.discount > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.successLight,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${product.discount}% OFF',
                style: const TextStyle(
                  color: AppColors.success,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _warehouseCard({
    required SalesRegion region,
    required WarehouseInventory? inventory,
  }) {
    final boxes = inventory?.stockBoxes ?? 0;
    final sqm = inventory?.stockSqm ?? 0;
    final inStock = boxes > 0;

    final status = inventory?.statusLabel ?? 'Out of Stock';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppColors.ivory,
                  borderRadius: BorderRadius.circular(9),
                ),
                child: const Icon(
                  Icons.warehouse_outlined,
                  color: AppColors.copper,
                  size: 20,
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Text(
                  '${region.label} Warehouse',
                  style: const TextStyle(
                    color: AppColors.text,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              _statusChip(status, inStock),
            ],
          ),
          const SizedBox(height: 15),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 15),
          Row(
            children: [
              Expanded(child: _inventoryMetric('Boxes', '$boxes')),
              Container(width: 1, height: 38, color: AppColors.border),
              Expanded(
                child: _inventoryMetric(
                  'Square Metres',
                  '${sqm.toStringAsFixed(2)} m²',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _productInformation() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
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
            '${product.sqmPerBox.toStringAsFixed(2)} m² / box',
          ),
        ],
      ),
    );
  }

  Widget _pricingInfo() {
    return Container(
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
              'Select a customer to view their '
              'customer-specific price for this product.',
              style: TextStyle(
                color: AppColors.copper,
                fontSize: 12,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _checkCustomerPricing(BuildContext context) async {
    final customer = await Navigator.push<Customer>(
      context,
      MaterialPageRoute(builder: (_) => const SelectCustomerScreen()),
    );

    if (customer == null || !context.mounted) {
      return;
    }

    final customerPrice = context.read<PricingService>().getCustomerPrice(
      customerId: customer.id,
      product: product,
    );

    if (!context.mounted) {
      return;
    }

    _showCustomerPrice(context, customer, customerPrice);
  }

  void _showCustomerPrice(
    BuildContext context,
    Customer customer,
    double customerPrice,
  ) {
    final discount = product.standardPrice <= 0
        ? 0.0
        : (product.standardPrice - customerPrice) / product.standardPrice * 100;

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 42,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Customer Pricing',
                  style: TextStyle(
                    color: AppColors.text,
                    fontFamily: 'serif',
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  customer.businessName,
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
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
                          Text(
                            product.sku,
                            style: const TextStyle(
                              color: AppColors.muted,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      _bottomSheetPriceRow(
                        'Standard Price',
                        product.standardPrice,
                      ),
                      const SizedBox(height: 10),
                      _bottomSheetPriceRow(
                        'Customer Price',
                        customerPrice,
                        highlight: true,
                      ),
                      if (discount > 0) ...[
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Text(
                              'Customer Saving',
                              style: TextStyle(
                                color: AppColors.muted,
                                fontSize: 11,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              '${discount.toStringAsFixed(1)}%',
                              style: const TextStyle(
                                color: AppColors.success,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.green,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                    onPressed: () {
                      Navigator.pop(sheetContext);

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
                    icon: const Icon(Icons.add_shopping_cart),
                    label: const Text(
                      'Add to Quote',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () {
                      Navigator.pop(sheetContext);
                    },
                    child: const Text('Close'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _bottomSheetPriceRow(
    String label,
    double price, {
    bool highlight = false,
  }) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(color: AppColors.muted, fontSize: 11),
          ),
        ),
        Text(
          '\$${price.toStringAsFixed(2)} / m²',
          style: TextStyle(
            color: highlight ? AppColors.copper : AppColors.text,
            fontSize: highlight ? 17 : 13,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }

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

  Widget _inventoryMetric(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.muted, fontSize: 10),
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.text,
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
              style: const TextStyle(color: AppColors.muted, fontSize: 12),
            ),
          ),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                color: AppColors.text,
                fontSize: 12,
                fontWeight: FontWeight.w600,
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

  Widget _statusChip(String status, bool inStock) {
    final lowStock = status == 'Low Stock';

    final backgroundColor = !inStock
        ? AppColors.dangerLight
        : lowStock
        ? AppColors.warningLight
        : AppColors.successLight;

    final foregroundColor = !inStock
        ? AppColors.danger
        : lowStock
        ? AppColors.warning
        : AppColors.success;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: foregroundColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            status,
            style: TextStyle(
              color: foregroundColor,
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
