import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/customer.dart';
import '../models/product.dart';
import '../services/pricing_service.dart';
import '../theme/app_theme.dart';

class EditPriceScreen extends StatefulWidget {
  final Customer customer;
  final Product product;

  const EditPriceScreen({
    super.key,
    required this.customer,
    required this.product,
  });

  @override
  State<EditPriceScreen> createState() => _EditPriceScreenState();
}

class _EditPriceScreenState extends State<EditPriceScreen> {
  late final TextEditingController _priceController;

  double? _currentPrice;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (_currentPrice != null) {
      return;
    }

    final pricing = context.read<PricingService>();

    _currentPrice = pricing.getCustomerPrice(
      customerId: widget.customer.id,
      product: widget.product,
    );

    _priceController = TextEditingController(
      text: _currentPrice!.toStringAsFixed(2),
    );
  }

  double get newPrice => double.tryParse(_priceController.text) ?? 0;

  bool get belowFloor => newPrice < widget.product.salesFloorPrice;

  double get discount {
    if (widget.product.standardPrice <= 0) {
      return 0;
    }

    return (widget.product.standardPrice - newPrice) /
        widget.product.standardPrice *
        100;
  }

  @override
  void dispose() {
    _priceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final customer = widget.customer;

    return Scaffold(
      backgroundColor: AppColors.background,

      appBar: AppBar(title: const Text('Customer Pricing')),

      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            customer.businessName,
            style: const TextStyle(
              color: AppColors.copper,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 5),

          Text(
            product.name,
            style: const TextStyle(fontSize: 27, fontWeight: FontWeight.w700),
          ),

          const SizedBox(height: 3),

          Text(
            '${product.sku} · ${product.category}',
            style: const TextStyle(color: AppColors.muted),
          ),

          const SizedBox(height: 28),

          _sectionTitle('Pricing'),

          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _priceRow('Standard Price', product.standardPrice),

                const Divider(),

                _priceRow(
                  'Current Customer Price',
                  _currentPrice!,
                  valueColor: AppColors.copper,
                ),

                const Divider(),

                _priceRow(
                  'Your Minimum Price',
                  product.salesFloorPrice,
                  valueColor: AppColors.danger,
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          _sectionTitle('New Customer Price'),

          const SizedBox(height: 12),

          TextField(
            controller: _priceController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            onChanged: (_) {
              setState(() {});
            },
            decoration: const InputDecoration(
              labelText: 'Price',
              prefixText: '\$ ',
              suffixText: '/ m²',
            ),
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              const Text(
                'Discount from standard',
                style: TextStyle(color: AppColors.muted),
              ),

              const Spacer(),

              Text(
                '${discount.toStringAsFixed(1)}%',
                style: TextStyle(
                  color: belowFloor ? AppColors.danger : AppColors.copper,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),

          if (belowFloor) ...[const SizedBox(height: 20), _buildFloorWarning()],

          const SizedBox(height: 30),

          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.copper,
              padding: const EdgeInsets.all(17),
            ),

            onPressed: newPrice <= 0
                ? null
                : belowFloor
                ? () {
                    _showAdminRequired();
                  }
                : () {
                    _savePrice();
                  },

            child: Text(
              belowFloor ? 'Request Admin Approval' : 'Save Customer Price',
            ),
          ),

          const SizedBox(height: 12),

          if (!belowFloor)
            const Center(
              child: Text(
                'This price is within your authorised pricing range.',
                style: TextStyle(color: AppColors.success, fontSize: 11),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFloorWarning() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.dangerLight,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.lock_outline, color: AppColors.danger),

          const SizedBox(width: 10),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Admin approval required',
                  style: TextStyle(
                    color: AppColors.danger,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                const SizedBox(height: 5),

                Text(
                  'Your minimum authorised price is '
                  '\$${widget.product.salesFloorPrice.toStringAsFixed(2)} / m². '
                  'Sales users cannot save a price below this amount.',
                  style: const TextStyle(color: AppColors.danger, fontSize: 12),
                ),
              ],
            ),
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

  Widget _priceRow(String label, double value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(label, style: const TextStyle(color: AppColors.muted)),
          ),

          Text(
            '\$${value.toStringAsFixed(2)} / m²',
            style: TextStyle(
              color: valueColor ?? AppColors.text,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  void _savePrice() {
    final pricing = context.read<PricingService>();

    pricing.setCustomerPrice(
      customerId: widget.customer.id,
      product: widget.product,
      price: newPrice,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '${widget.customer.businessName} price updated to '
          '\$${newPrice.toStringAsFixed(2)} / m²',
        ),
      ),
    );

    Navigator.pop(context);
  }

  void _showAdminRequired() {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Admin approval required'),

          content: Text(
            'Requested price:\n'
            '\$${newPrice.toStringAsFixed(2)} / m²\n\n'
            'Your minimum:\n'
            '\$${widget.product.salesFloorPrice.toStringAsFixed(2)} / m²\n\n'
            'Only an administrator can approve a customer price below your minimum pricing authority.',
          ),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('Cancel'),
            ),

            FilledButton(
              onPressed: () {
                Navigator.pop(dialogContext);

                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Admin approval request created.'),
                  ),
                );
              },
              child: const Text('Request Admin'),
            ),
          ],
        );
      },
    );
  }
}
