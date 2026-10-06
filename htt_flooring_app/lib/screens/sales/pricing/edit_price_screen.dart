import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../models/product.dart';
import '../../../services/pricing_service.dart';
import '../../../theme/app_theme.dart';

class EditPriceScreen extends StatefulWidget {
  const EditPriceScreen({
    super.key,
    required this.customer,
    required this.product,
  });

  final Customer customer;
  final Product product;

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
      appBar: AppBar(title: const Text('Edit Customer Price')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 30),
        children: [
          Text(
            customer.businessName,
            style: const TextStyle(
              color: AppColors.copper,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            product.name,
            style: const TextStyle(
              color: AppColors.text,
              fontFamily: 'serif',
              fontSize: 27,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            '${product.sku} · ${product.category}',
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
          const SizedBox(height: 26),
          const Text(
            'Current Pricing',
            style: TextStyle(
              color: AppColors.text,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 11),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _priceRow('Standard Price', product.standardPrice),
                const Divider(height: 24, color: AppColors.border),
                _priceRow(
                  'Customer Price',
                  _currentPrice!,
                  valueColor: AppColors.copper,
                ),
                const Divider(height: 24, color: AppColors.border),
                _priceRow(
                  'Sales Floor Price',
                  product.salesFloorPrice,
                  valueColor: AppColors.danger,
                ),
              ],
            ),
          ),
          const SizedBox(height: 26),
          const Text(
            'New Customer Price',
            style: TextStyle(
              color: AppColors.text,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 11),
          TextField(
            controller: _priceController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            onChanged: (_) {
              setState(() {});
            },
            decoration: InputDecoration(
              prefixText: '\$ ',
              suffixText: '/ m²',
              hintText: '0.00',
              filled: true,
              fillColor: AppColors.card,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: belowFloor ? AppColors.danger : AppColors.border,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: belowFloor ? AppColors.danger : AppColors.green,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Text(
                'Discount from standard',
                style: TextStyle(color: AppColors.muted, fontSize: 12),
              ),
              const Spacer(),
              Text(
                '${discount.toStringAsFixed(1)}%',
                style: TextStyle(
                  color: belowFloor ? AppColors.danger : AppColors.copper,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          if (belowFloor) ...[const SizedBox(height: 18), _floorWarning()],
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: belowFloor
                    ? AppColors.copper
                    : AppColors.green,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: newPrice <= 0
                  ? null
                  : belowFloor
                  ? _requestApproval
                  : _savePrice,
              icon: Icon(belowFloor ? Icons.lock_outline : Icons.check),
              label: Text(
                belowFloor ? 'Request Manager Approval' : 'Save Customer Price',
              ),
            ),
          ),
          if (!belowFloor) ...[
            const SizedBox(height: 11),
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.check_circle_outline,
                  size: 15,
                  color: AppColors.success,
                ),
                SizedBox(width: 5),
                Flexible(
                  child: Text(
                    'Within your authorised pricing range',
                    style: TextStyle(color: AppColors.success, fontSize: 11),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _floorWarning() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.dangerLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.danger.withValues(alpha: 0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.lock_outline, color: AppColors.danger, size: 21),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Manager approval required',
                  style: TextStyle(
                    color: AppColors.danger,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  'The requested price is below your '
                  'sales floor of '
                  '\$${widget.product.salesFloorPrice.toStringAsFixed(2)} / m².',
                  style: const TextStyle(
                    color: AppColors.danger,
                    fontSize: 11,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _priceRow(String label, double value, {Color? valueColor}) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ),
        Text(
          '\$${value.toStringAsFixed(2)} / m²',
          style: TextStyle(
            color: valueColor ?? AppColors.text,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  void _savePrice() {
    context.read<PricingService>().setCustomerPrice(
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

  void _requestApproval() {
    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Request Manager Approval'),
          content: Text(
            '${widget.product.name}\n\n'
            'Requested price: '
            '\$${newPrice.toStringAsFixed(2)} / m²\n'
            'Sales floor: '
            '\$${widget.product.salesFloorPrice.toStringAsFixed(2)} / m²\n\n'
            'This price cannot be saved until it is approved.',
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
                    content: Text('Price approval request submitted.'),
                  ),
                );
              },
              child: const Text('Submit Request'),
            ),
          ],
        );
      },
    );
  }
}
