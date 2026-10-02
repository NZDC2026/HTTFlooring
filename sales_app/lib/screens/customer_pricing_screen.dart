import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/pricing_service.dart';
import '../data/mock_data.dart';
import '../models/customer.dart';
import '../theme/app_theme.dart';
import 'edit_price_screen.dart';

class CustomerPricingScreen extends StatelessWidget {
  final Customer customer;

  const CustomerPricingScreen({super.key, required this.customer});

  @override
  Widget build(BuildContext context) {
    final pricing = context.watch<PricingService>();

    return Scaffold(
      appBar: AppBar(title: const Text('Customer Pricing')),

      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(15),
            color: AppColors.card,
            child: Row(
              children: [
                const CircleAvatar(
                  backgroundColor: AppColors.copper,
                  child: Text('AF', style: TextStyle(color: Colors.white)),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        customer.businessName,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      Text(customer.type, style: const TextStyle(fontSize: 11)),
                    ],
                  ),
                ),

                const Chip(label: Text('🔒 Sydney')),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search product or SKU...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          Expanded(
            child: ListView.separated(
              itemCount: products.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final product = products[index];
                final customerPrice = pricing.getCustomerPrice(
                  customerId: customer.id,
                  product: product,
                );

                final discount = product.standardPrice > 0
                    ? ((product.standardPrice - customerPrice) /
                              product.standardPrice *
                              100)
                          .round()
                    : 0;

                return ListTile(
                  leading: Container(
                    width: 55,
                    height: 55,
                    decoration: BoxDecoration(
                      color: AppColors.copperLight,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: const Icon(Icons.texture, color: AppColors.copper),
                  ),

                  title: Text(product.name),

                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(product.sku),

                      Text(
                        '\$${customerPrice.toStringAsFixed(2)} / m²',
                        style: const TextStyle(
                          color: AppColors.copper,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),

                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        color: AppColors.copperLight,
                        child: Text(
                          '$discount% OFF',
                          style: const TextStyle(
                            color: AppColors.copper,
                            fontSize: 10,
                          ),
                        ),
                      ),

                      Text(
                        'Standard \$${product.standardPrice.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 9),
                      ),
                    ],
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => EditPriceScreen(
                          customer: customer,
                          product: product,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
