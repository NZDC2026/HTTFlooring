import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/warehouse_order.dart';
import '../../../widgets/handover_fields.dart';
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
  final _handoverKey = GlobalKey<HandoverFieldsState>();
  bool _saving = false;

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

    return PopScope(
      canPop: !_saving,
      child: AbsorbPointer(
        absorbing: _saving,
        child: Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(title: const Text('Customer Pickup')),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _OrderSummary(order: order),
              const SizedBox(height: 22),
              const Text(
                'How is this order being collected?',
                style: TextStyle(
                  color: AppColors.text,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Select the collection method before confirming dispatch.',
                style: TextStyle(color: AppColors.muted),
              ),
              const SizedBox(height: 14),
              _FulfilmentOption(
                selected: isPickup,
                enabled: !alreadyConfirmed && !_saving,
                icon: Icons.person_outline,
                title: 'Customer Arrived',
                subtitle:
                    'Customer or authorised collector picks up the order.',
                onTap: () {
                  _handoverKey.currentState?.resetSignature();
                  service.setFulfilmentType(
                    order.id,
                    WarehouseFulfilmentType.pickup,
                  );
                },
              ),
              const SizedBox(height: 10),
              _FulfilmentOption(
                selected: !isPickup,
                enabled: !alreadyConfirmed && !_saving,
                icon: Icons.local_shipping_outlined,
                title: 'Delivery by Transport',
                subtitle: 'Driver or transport company collects the order.',
                onTap: () {
                  _handoverKey.currentState?.resetSignature();
                  service.setFulfilmentType(
                    order.id,
                    WarehouseFulfilmentType.transport,
                  );
                },
              ),
              const SizedBox(height: 24),
              Text(
                isPickup ? 'Customer Arrived' : 'Delivery by Transport',
                style: const TextStyle(
                  color: AppColors.text,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                isPickup ? 'Confirm who is collecting the prepared order.' : 'Confirm the driver or transport company collecting the order.',
                style: const TextStyle(color: AppColors.muted),
              ),
              const SizedBox(height: 16),
              HandoverFields(
                key: _handoverKey,
                nameLabel: isPickup ? 'Collector Name' : 'Driver Name',
                signatureLabel: isPickup
                    ? 'Collector Signature'
                    : 'Driver Signature',
                proof: order.handoverProof,
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
                onPressed: _saving
                    ? null
                    : alreadyConfirmed
                    ? () => _openDispatchPhotos(context, order.id)
                    : () async {
                        final proof = _handoverKey.currentState!
                            .validateAndRead();
                        if (proof == null) return;
                        setState(() => _saving = true);
                        try {
                          final success = await service
                              .confirmPickupOrTransport(order.id, proof);
                          if (!context.mounted) return;
                          if (success) {
                            _openDispatchPhotos(context, order.id);
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'The order must be prepared before confirmation.',
                                ),
                              ),
                            );
                          }
                        } catch (_) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Could not save confirmation. Please retry.',
                                ),
                              ),
                            );
                          }
                        } finally {
                          if (mounted) setState(() => _saving = false);
                        }
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
        ),
      ),
    );
  }

  void _openDispatchPhotos(BuildContext context, String orderId) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => DispatchPhotoScreen(orderId: orderId)),
    );
  }
}

class _OrderSummary extends StatelessWidget {
  const _OrderSummary({required this.order});

  final WarehouseOrder order;

  @override
  Widget build(BuildContext context) {
    return Container(
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
    );
  }
}

class _FulfilmentOption extends StatelessWidget {
  const _FulfilmentOption({
    required this.selected,
    required this.enabled,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final bool selected;
  final bool enabled;
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: enabled ? onTap : null,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: selected ? AppColors.successLight : AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? AppColors.green : AppColors.border,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: selected ? AppColors.green : AppColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: selected ? Colors.white : AppColors.green,
              ),
            ),
            const SizedBox(width: 13),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: AppColors.text,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: selected ? AppColors.green : AppColors.muted,
            ),
          ],
        ),
      ),
    );
  }
}
