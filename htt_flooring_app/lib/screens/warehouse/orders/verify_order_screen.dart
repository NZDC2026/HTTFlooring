import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../services/warehouse_order_service.dart';
import 'prepare_order_screen.dart';

class VerifyOrderScreen extends StatefulWidget {
  const VerifyOrderScreen({super.key});

  @override
  State<VerifyOrderScreen> createState() => _VerifyOrderScreenState();
}

class _VerifyOrderScreenState extends State<VerifyOrderScreen> {
  String? _orderId;

  @override
  Widget build(BuildContext context) {
    final service = context.watch<WarehouseOrderService>();
    final orderId = _orderId;
    final order = orderId == null ? null : service.findOrder(orderId);
    return Scaffold(
      appBar: AppBar(title: const Text('Verify Order')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DropdownButtonFormField<String>(
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Order'),
            items: [
              for (final item in service.orders)
                DropdownMenuItem(
                  value: item.id,
                  child: Text(
                    '${item.number} · ${item.customerName}',
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
            ],
            onChanged: (id) => setState(() => _orderId = id),
          ),
          if (order != null) ...[
            const SizedBox(height: 12),
            Text(
              order.items.isNotEmpty &&
                      order.items.every(
                        (item) =>
                            item.isPrepared &&
                            item.preparedBoxes == item.requiredBoxes,
                      )
                  ? 'All items match the required quantities and have preparation photos.'
                  : 'Order requires review. Check quantities and preparation photos.',
            ),
            for (final item in order.items)
              ListTile(
                title: Text(item.productName),
                subtitle: Text(
                  '${item.preparedBoxes} / ${item.requiredBoxes} boxes · ${item.preparationPhotos.length} photos',
                ),
                trailing: Icon(
                  item.isPrepared && item.preparedBoxes == item.requiredBoxes
                      ? Icons.check_circle_outline
                      : Icons.warning_amber_rounded,
                ),
              ),
            OutlinedButton(
              onPressed: () => Navigator.of(context).push<void>(
                MaterialPageRoute(
                  builder: (_) => PrepareOrderScreen(orderId: order.id),
                ),
              ),
              child: const Text('Open Order'),
            ),
          ],
        ],
      ),
    );
  }
}
