import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/warehouse_order.dart';
import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';
import 'prepare_item_screen.dart';
import 'customer_pickup_screen.dart';

class PrepareOrderScreen extends StatelessWidget {
  const PrepareOrderScreen({super.key, required this.orderId});
  final String orderId;

  @override
  Widget build(BuildContext context) {
    final service = context.watch<WarehouseOrderService>();
    final order = service.findOrder(orderId);
    if (order == null) {
      return const Scaffold(body: Center(child: Text('Order not found')));
    }
    final started = order.status != WarehouseOrderStatus.toPick;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text(order.number)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
        children: [
          Text(
            order.customerName,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            '${order.fulfilmentLabel} · ${order.totalRequiredBoxes} boxes',
            style: const TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Items',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.text,
                  ),
                ),
              ),
              Text(
                '${order.preparedItemCount}/${order.items.length} prepared',
                style: const TextStyle(color: AppColors.muted, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...order.items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Material(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(14),
                child: InkWell(
                  borderRadius: BorderRadius.circular(14),
                  onTap: !started
                      ? null
                      : () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => PrepareItemScreen(
                              orderId: order.id,
                              itemId: item.id,
                            ),
                          ),
                        ),
                  child: Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 46,
                          height: 46,
                          decoration: BoxDecoration(
                            color: item.isPrepared
                                ? AppColors.successLight
                                : AppColors.copperLight,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            item.isPrepared
                                ? Icons.check
                                : Icons.inventory_2_outlined,
                            color: item.isPrepared
                                ? AppColors.success
                                : AppColors.copper,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.productName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.text,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                item.sku,
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: AppColors.muted,
                                ),
                              ),
                              const SizedBox(height: 7),
                              Text(
                                '${item.preparedBoxes} / ${item.requiredBoxes} boxes',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.muted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          item.isPrepared ? 'Prepared' : 'Not Prepared',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: item.isPrepared
                                ? AppColors.success
                                : AppColors.copper,
                          ),
                        ),
                        if (started)
                          const Icon(
                            Icons.chevron_right,
                            color: AppColors.muted,
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          if (order.status == WarehouseOrderStatus.prepared) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.successLight,
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle, color: AppColors.success),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Preparation Completed',
                      style: TextStyle(
                        color: AppColors.success,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
      bottomNavigationBar:
          order.status == WarehouseOrderStatus.toPick ||
              order.status == WarehouseOrderStatus.prepared
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.green,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: order.status == WarehouseOrderStatus.toPick
                      ? () => service.startPreparing(order.id)
                      : () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                CustomerPickupScreen(orderId: order.id),
                          ),
                        ),
                  icon: Icon(
                    order.status == WarehouseOrderStatus.toPick
                        ? Icons.play_arrow
                        : Icons.local_shipping_outlined,
                  ),
                  label: Text(
                    order.status == WarehouseOrderStatus.toPick
                        ? 'Start Preparing'
                        : order.fulfilmentType == WarehouseFulfilmentType.pickup
                        ? 'Customer Pickup'
                        : 'Transport Pickup',
                  ),
                ),
              ),
            )
          : null,
    );
  }
}
