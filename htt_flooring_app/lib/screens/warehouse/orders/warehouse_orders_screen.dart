import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../../../models/warehouse_order.dart';
import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';
import 'prepare_order_screen.dart';

class WarehouseOrdersScreen extends StatefulWidget {
  const WarehouseOrdersScreen({
    super.key,
    this.initialFilter,
    this.initialQuery = '',
    this.pickupInvoices = false,
  });

  final WarehouseOrderStatus? initialFilter;
  final String initialQuery;
  final bool pickupInvoices;
  @override
  State<WarehouseOrdersScreen> createState() => _WarehouseOrdersScreenState();
}

class _WarehouseOrdersScreenState extends State<WarehouseOrdersScreen> {
  late WarehouseOrderStatus? _filter = widget.initialFilter;
  bool _scheduled = false;
  late String _query = widget.initialQuery;

  @override
  Widget build(BuildContext context) {
    final service = context.watch<WarehouseOrderService>();
    final orders = service.orders.where((order) {
      final statusOk = _scheduled
          ? order.fulfilmentType == WarehouseFulfilmentType.pickup &&
                order.status != WarehouseOrderStatus.completed
          : _filter == null ||
                order.status == _filter ||
                (_filter == WarehouseOrderStatus.prepared &&
                    order.status == WarehouseOrderStatus.readyForDispatch);
      final q = _query.trim().toLowerCase();
      final searchOk =
          q.isEmpty ||
          order.number.toLowerCase().contains(q) ||
          order.customerName.toLowerCase().contains(q);
      final pickupOk =
          !widget.pickupInvoices ||
          (order.fulfilmentType == WarehouseFulfilmentType.pickup &&
              order.status != WarehouseOrderStatus.completed &&
              DateUtils.isSameDay(
                order.fulfilmentDate.toLocal(),
                DateTime.now(),
              ));
      return statusOk && searchOk && pickupOk;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        automaticallyImplyLeading: true,
        title: Text(widget.pickupInvoices ? 'Pickup Orders' : 'Orders'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: TextFormField(
              initialValue: _query,
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                hintText: 'Search order or customer...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: AppColors.card,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
            ),
          ),
          SizedBox(
            height: 52,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              scrollDirection: Axis.horizontal,
              children: [
                _chip('All', null),
                _chip('To Pick', WarehouseOrderStatus.toPick),
                _chip('Preparing', WarehouseOrderStatus.preparing),
                _chip('Ready', WarehouseOrderStatus.prepared),
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: const Text('Scheduled Pickups'),
                    selected: _scheduled,
                    showCheckmark: false,
                    onSelected: (_) => setState(() {
                      _scheduled = true;
                      _filter = null;
                    }),
                  ),
                ),
                _chip('Dispatched', WarehouseOrderStatus.completed),
              ],
            ),
          ),
          Expanded(
            child: orders.isEmpty
                ? const Center(
                    child: Text(
                      'No warehouse orders',
                      style: TextStyle(color: AppColors.muted),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
                    itemCount: orders.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (_, index) =>
                        _orderCard(context, orders[index]),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _chip(String label, WarehouseOrderStatus? status) {
    final selected = !_scheduled && _filter == status;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        showCheckmark: false,
        selectedColor: AppColors.copperLight,
        backgroundColor: AppColors.card,
        side: BorderSide(color: selected ? AppColors.copper : AppColors.border),
        onSelected: (_) => setState(() {
          _scheduled = false;
          _filter = status;
        }),
      ),
    );
  }

  Widget _orderCard(BuildContext context, WarehouseOrder order) {
    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => PrepareOrderScreen(orderId: order.id),
          ),
        ),
        child: Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      order.number,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppColors.text,
                      ),
                    ),
                  ),
                  if (order.isUrgentPickup) ...[
                    const Text(
                      'Urgent',
                      style: TextStyle(
                        color: Colors.red,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  _status(order.statusLabel),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                order.customerName,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.text,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Pickup date: ${DateFormat('d MMM yyyy · h:mm a').format(order.fulfilmentDate.toLocal())}',
                style: const TextStyle(fontSize: 11, color: AppColors.muted),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(
                    Icons.inventory_2_outlined,
                    size: 15,
                    color: AppColors.muted,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    '${order.items.length} items · ${order.totalRequiredBoxes} boxes',
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.muted,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    order.fulfilmentLabel,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.copper,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.chevron_right,
                    size: 18,
                    color: AppColors.muted,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _status(String label) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
    decoration: BoxDecoration(
      color: AppColors.copperLight,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(
      label,
      style: const TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w800,
        color: AppColors.copper,
      ),
    ),
  );
}
