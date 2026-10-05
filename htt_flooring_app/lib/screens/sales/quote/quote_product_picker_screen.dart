import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/mock_data.dart';
import '../../../services/pricing_service.dart';
import '../../../services/quote_service.dart';
import '../../../theme/app_theme.dart';

import 'configure_quote_item_screen.dart';

class QuoteProductPickerScreen extends StatefulWidget {
  const QuoteProductPickerScreen({super.key});

  @override
  State<QuoteProductPickerScreen> createState() {
    return _QuoteProductPickerScreenState();
  }
}

class _QuoteProductPickerScreenState extends State<QuoteProductPickerScreen> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final quote = context.watch<QuoteService>();

    final customer = quote.customer;

    if (customer == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Add Product')),

        body: const Center(child: Text('Please select a customer first.')),
      );
    }

    final visibleProducts = products.where((product) {
      if (_search.isEmpty) {
        return true;
      }

      final query = _search.toLowerCase();

      return product.name.toLowerCase().contains(query) ||
          product.sku.toLowerCase().contains(query) ||
          product.colour.toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,

      appBar: AppBar(title: const Text('Add Product')),

      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            color: AppColors.copperLight,

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'CUSTOMER',
                  style: TextStyle(color: AppColors.muted, fontSize: 10),
                ),

                const SizedBox(height: 3),

                Text(
                  customer.businessName,
                  style: const TextStyle(
                    color: AppColors.copper,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(14),
            child: TextField(
              onChanged: (value) {
                setState(() {
                  _search = value;
                });
              },

              decoration: const InputDecoration(
                hintText: 'Search product or SKU...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),

          Expanded(
            child: ListView.separated(
              itemCount: visibleProducts.length,

              separatorBuilder: (_, _) => const Divider(height: 1),

              itemBuilder: (context, index) {
                final product = visibleProducts[index];

                final customerPrice = context
                    .read<PricingService>()
                    .getCustomerPrice(
                      customerId: customer.id,
                      product: product,
                    );

                return ListTile(
                  leading: Container(
                    width: 52,
                    height: 52,

                    decoration: BoxDecoration(
                      color: AppColors.copperLight,
                      borderRadius: BorderRadius.circular(8),
                    ),

                    child: const Icon(Icons.texture, color: AppColors.copper),
                  ),

                  title: Text(
                    product.name,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),

                  subtitle: Text(
                    '${product.sku}\n'
                    '\$${customerPrice.toStringAsFixed(2)} / m²',
                  ),

                  isThreeLine: true,

                  trailing: const Icon(Icons.chevron_right),

                  onTap: () async {
                    final added = await Navigator.push<bool>(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ConfigureQuoteItemScreen(
                          customer: customer,
                          product: product,
                          initialPrice: customerPrice,
                        ),
                      ),
                    );

                    if (added == true && context.mounted) {
                      // 产品添加成功后，
                      // Product Picker 自动关闭
                      Navigator.pop(context);
                    }
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
