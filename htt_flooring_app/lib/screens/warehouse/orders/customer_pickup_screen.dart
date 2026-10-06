import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/warehouse_order.dart';
import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';
import 'dispatch_photo_screen.dart';

class CustomerPickupScreen extends StatefulWidget {
  const CustomerPickupScreen({super.key, required this.orderId});

  final String orderId;

  @override
  State<CustomerPickupScreen> createState() => _CustomerPickupScreenState();
}

class _CustomerPickupScreenState extends State<CustomerPickupScreen> {
  final _nameController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final service = context.watch<WarehouseOrderService>();
    final order = service.findOrder(widget.orderId);

    if (order == null) {
      return const Scaffold(body: Center(child: Text('Order not found')));
    }

    final isPickup = order.fulfilmentType == WarehouseFulfilmentType.pickup;
    final alreadyConfirmed =
        order.status == WarehouseOrderStatus.readyForDispatch ||
        order.status == WarehouseOrderStatus.completed;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Customer Pickup')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.number,
                  style: const TextStyle(
                    color: AppColors.copper,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  order.customerName,
                  style: const TextStyle(
                    color: AppColors.text,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${order.totalPreparedBoxes} boxes prepared',
                  style: const TextStyle(color: AppColors.muted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text(
            isPickup ? 'Customer Arrived' : 'Delivery by Transport',
            style: const TextStyle(
              color: AppColors.text,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            isPickup ? 'Confirm who is collecting the prepared order.' : 'Confirm the driver or transport company collecting the order.',
            style: const TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 18),
          TextField(
            controller: _nameController,
            enabled: !alreadyConfirmed,
            textCapitalization: TextCapitalization.words,
            decoration: InputDecoration(
              labelText: order.collectedByLabel,
              hintText: isPickup
                  ? 'e.g. John Smith'
                  : 'e.g. Mainfreight / David',
              filled: true,
              fillColor: AppColors.card,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
          if (alreadyConfirmed) ...[
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.successLight,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AppColors.success),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Confirmed: ${order.collectedBy}',
                      style: const TextStyle(
                        color: AppColors.success,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.green,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            onPressed: alreadyConfirmed
                ? () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => DispatchPhotoScreen(orderId: order.id),
                    ),
                  )
                : () {
                    final success = service.confirmPickupOrTransport(
                      order.id,
                      _nameController.text,
                    );
                    if (!success) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            isPickup
                                ? 'Enter the customer or collector name.'
                                : 'Enter the driver or transport name.',
                          ),
                        ),
                      );
                      return;
                    }
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DispatchPhotoScreen(orderId: order.id),
                      ),
                    );
                  },
            icon: Icon(
              alreadyConfirmed ? Icons.camera_alt_outlined : Icons.check,
            ),
            label: Text(
              alreadyConfirmed
                  ? 'Continue to Dispatch Photos'
                  : isPickup
                  ? 'Confirm Pickup'
                  : 'Confirm Transport Pickup',
            ),
          ),
        ),
      ),
    );
  }
}
