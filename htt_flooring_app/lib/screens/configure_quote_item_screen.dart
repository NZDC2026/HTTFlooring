import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/customer.dart';
import '../models/product.dart';
import '../services/quote_service.dart';
import '../theme/app_theme.dart';

class ConfigureQuoteItemScreen extends StatefulWidget {
  final Customer customer;
  final Product product;
  final double initialPrice;

  const ConfigureQuoteItemScreen({
    super.key,
    required this.customer,
    required this.product,
    required this.initialPrice,
  });

  @override
  State<ConfigureQuoteItemScreen> createState() =>
      _ConfigureQuoteItemScreenState();
}

class _ConfigureQuoteItemScreenState extends State<ConfigureQuoteItemScreen> {
  late final TextEditingController priceController;

  late final TextEditingController boxesController;

  late final TextEditingController sqmController;

  bool updatingQuantity = false;

  @override
  void initState() {
    super.initState();

    priceController = TextEditingController(
      text: widget.initialPrice.toStringAsFixed(2),
    );

    boxesController = TextEditingController(text: '1');

    sqmController = TextEditingController(
      text: widget.product.sqmPerBox.toStringAsFixed(2),
    );
  }

  double get price => double.tryParse(priceController.text) ?? 0;

  int get boxes => int.tryParse(boxesController.text) ?? 0;

  double get sqm => double.tryParse(sqmController.text) ?? 0;

  bool get belowFloor => price < widget.product.salesFloorPrice;

  bool get exceedsStock => boxes > widget.product.stockBoxes;

  double get subtotal => sqm * price;

  void updateFromBoxes(String value) {
    if (updatingQuantity) {
      return;
    }

    updatingQuantity = true;

    final valueBoxes = int.tryParse(value) ?? 0;

    final calculatedSqm = valueBoxes * widget.product.sqmPerBox;

    sqmController.text = calculatedSqm.toStringAsFixed(2);

    updatingQuantity = false;

    setState(() {});
  }

  void updateFromSqm(String value) {
    if (updatingQuantity) {
      return;
    }

    updatingQuantity = true;

    final requestedSqm = double.tryParse(value) ?? 0;

    // Flooring is sold as whole packs.
    final requiredBoxes = requestedSqm <= 0
        ? 0
        : (requestedSqm / widget.product.sqmPerBox).ceil();

    boxesController.text = requiredBoxes.toString();

    final actualSqm = requiredBoxes * widget.product.sqmPerBox;

    sqmController.text = actualSqm.toStringAsFixed(2);

    updatingQuantity = false;

    setState(() {});
  }

  @override
  void dispose() {
    priceController.dispose();
    boxesController.dispose();
    sqmController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final customer = widget.customer;

    return Scaffold(
      appBar: AppBar(title: const Text('Add to Quote')),

      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            customer.businessName,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.copper,
              fontWeight: FontWeight.w700,
            ),
          ),

          Text(
            product.name,
            style: const TextStyle(fontSize: 27, fontWeight: FontWeight.w700),
          ),

          Text(
            '${product.sku} · '
            '${product.category}',
            style: const TextStyle(color: AppColors.muted),
          ),

          const SizedBox(height: 25),

          _sectionTitle('Customer Price'),

          const SizedBox(height: 10),

          _priceRow('Standard Price', product.standardPrice),

          _priceRow('Customer Price', widget.initialPrice),

          _priceRow('Your Minimum', product.salesFloorPrice, highlight: true),

          const SizedBox(height: 14),

          TextField(
            controller: priceController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            onChanged: (_) {
              setState(() {});
            },
            decoration: const InputDecoration(
              labelText: 'Quote Price',
              prefixText: '\$ ',
              suffixText: '/ m²',
            ),
          ),

          const SizedBox(height: 10),

          if (belowFloor)
            _warning(
              'Below your pricing authority. '
              'Minimum allowed price is '
              '\$${product.salesFloorPrice.toStringAsFixed(2)} / m². '
              'An administrator is required '
              'for a lower price.',
            ),

          const SizedBox(height: 28),

          _sectionTitle('Quantity'),

          const SizedBox(height: 5),

          Text(
            'Pack size: '
            '${product.sqmPerBox.toStringAsFixed(2)} m² / box',
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),

          const SizedBox(height: 14),

          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: TextField(
                  controller: boxesController,
                  keyboardType: TextInputType.number,
                  onChanged: updateFromBoxes,
                  decoration: const InputDecoration(
                    labelText: 'Boxes',
                    suffixText: 'boxes',
                  ),
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: TextField(
                  controller: sqmController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  onChanged: updateFromSqm,
                  decoration: const InputDecoration(
                    labelText: 'Area',
                    suffixText: 'm²',
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          Text(
            'Available: '
            '${product.stockBoxes} boxes · '
            '${product.stockSqm.toStringAsFixed(2)} m²',
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),

          if (exceedsStock) ...[
            const SizedBox(height: 10),

            _warning(
              'Requested quantity exceeds '
              'available stock.',
            ),
          ],

          const SizedBox(height: 28),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _summaryRow('Boxes', '$boxes'),

                _summaryRow('Area', '${sqm.toStringAsFixed(2)} m²'),

                _summaryRow('Unit Price', '\$${price.toStringAsFixed(2)} / m²'),

                const Divider(),

                _summaryRow(
                  'Subtotal',
                  '\$${subtotal.toStringAsFixed(2)}',
                  strong: true,
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.copper,
              padding: const EdgeInsets.all(17),
            ),

            onPressed: belowFloor || exceedsStock || boxes <= 0 || price <= 0
                ? null
                : () {
                    final quote = context.read<QuoteService>();

                    quote.selectCustomer(customer);

                    quote.addItem(
                      product: product,
                      boxes: boxes,
                      sqm: sqm,
                      unitPrice: price,
                    );

                    Navigator.pop(context, true);
                  },

            child: const Text('Add to Quote'),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Text(
      text,
      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
    );
  }

  Widget _priceRow(String label, double value, {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Expanded(
            child: Text(label, style: const TextStyle(color: AppColors.muted)),
          ),

          Text(
            '\$${value.toStringAsFixed(2)} / m²',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: highlight ? AppColors.copper : AppColors.text,
            ),
          ),
        ],
      ),
    );
  }

  Widget _warning(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.dangerLight,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.warning_amber_rounded,
            color: AppColors.danger,
            size: 18,
          ),

          const SizedBox(width: 8),

          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: AppColors.danger, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool strong = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(child: Text(label)),

          Text(
            value,
            style: TextStyle(
              fontWeight: strong ? FontWeight.w800 : FontWeight.w600,
              fontSize: strong ? 18 : 14,
            ),
          ),
        ],
      ),
    );
  }
}
