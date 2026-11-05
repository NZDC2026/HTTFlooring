import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/warehouse_order.dart';
import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';
import 'prepare_order_screen.dart';

enum WarehouseOperationList {
  toPick,
  picking,
  readyForPickup,
  todaysPickups,
  dispatched,
  pendingCollection,
}

class PickingListScreen extends StatefulWidget {
  const PickingListScreen({
    super.key,
    this.operation = WarehouseOperationList.toPick,
  });
  final WarehouseOperationList operation;
  @override
  State<PickingListScreen> createState() => _PickingListScreenState();
}

class _PickingListScreenState extends State<PickingListScreen> {
  int _dayFilter = 0;
  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final orders = context.watch<WarehouseOrderService>().orders.where((o) {
      final todayPickup =
          o.fulfilmentType == WarehouseFulfilmentType.pickup &&
          o.status != WarehouseOrderStatus.completed &&
          DateUtils.isSameDay(o.fulfilmentDate.toLocal(), now);
      final ready =
          o.status == WarehouseOrderStatus.prepared ||
          o.status == WarehouseOrderStatus.readyForDispatch;
      final matches = switch (widget.operation) {
        WarehouseOperationList.toPick =>
          o.status == WarehouseOrderStatus.toPick,
        WarehouseOperationList.picking =>
          o.status == WarehouseOrderStatus.preparing,
        WarehouseOperationList.readyForPickup ||
        WarehouseOperationList.pendingCollection => todayPickup && ready,
        WarehouseOperationList.todaysPickups => todayPickup,
        WarehouseOperationList.dispatched =>
          o.completedAt != null &&
              DateUtils.isSameDay(o.completedAt!.toLocal(), now),
      };
      if (!matches) return false;
      if (_dayFilter == 0) return true;
      final target = _dayFilter == 1 ? now : now.add(const Duration(days: 1));
      return o.fulfilmentDate.year == target.year &&
          o.fulfilmentDate.month == target.month &&
          o.fulfilmentDate.day == target.day;
    }).toList();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(switch (widget.operation) {
          WarehouseOperationList.toPick => 'Preparing List',
          WarehouseOperationList.picking => 'Preparing',
          WarehouseOperationList.readyForPickup => 'Ready',
          WarehouseOperationList.todaysPickups => 'Scheduled Pickups',
          WarehouseOperationList.dispatched => 'Dispatched',
          WarehouseOperationList.pendingCollection => 'Pending Collection',
        }),
      ),
      body: Column(
        children: [
          if (widget.operation == WarehouseOperationList.toPick ||
              widget.operation == WarehouseOperationList.picking)
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
            child: orders.isEmpty
                ? const Center(child: Text('No matching orders'))
                : ListView.separated(
                    padding: EdgeInsets.fromLTRB(
                      16,
                      widget.operation == WarehouseOperationList.toPick ||
                              widget.operation == WarehouseOperationList.picking
                          ? 0
                          : 16,
                      16,
                      28,
                    ),
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
