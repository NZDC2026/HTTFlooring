import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/warehouse_order.dart';
import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';
import 'prepare_order_screen.dart';

class PickingListScreen extends StatefulWidget {
  const PickingListScreen({super.key});
  @override
  State<PickingListScreen> createState() => _PickingListScreenState();
}

class _PickingListScreenState extends State<PickingListScreen> {
  int _dayFilter = 0;
  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final orders = context.watch<WarehouseOrderService>().orders.where((o) {
      if (o.status != WarehouseOrderStatus.toPick) return false;
      if (_dayFilter == 0) return true;
      final target = _dayFilter == 1 ? now : now.add(const Duration(days: 1));
      return o.fulfilmentDate.year == target.year &&
          o.fulfilmentDate.month == target.month &&
          o.fulfilmentDate.day == target.day;
    }).toList();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Picking List')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 0, label: Text('All')),
                ButtonSegment(value: 1, label: Text('Today')),
                ButtonSegment(value: 2, label: Text('Tomorrow')),
              ],
              selected: {_dayFilter},
              onSelectionChanged: (v) => setState(() => _dayFilter = v.first),
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 28),
              itemCount: orders.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (_, i) {
                final o = orders[i];
                return Card(
                  color: AppColors.card,
                  child: ListTile(
                    title: Text(
                      o.number,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    subtitle: Text(
                      '${o.customerName}\n${o.items.length} items · ${o.totalRequiredBoxes} boxes',
                    ),
                    isThreeLine: true,
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PrepareOrderScreen(orderId: o.id),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
