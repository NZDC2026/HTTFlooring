import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../services/warehouse_order_service.dart';
import '../orders/prepare_order_screen.dart';
import '../returns/customer_returns_screen.dart';

class WarehouseActivitiesScreen extends StatelessWidget {
  const WarehouseActivitiesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final orders = context.watch<WarehouseOrderService>().orders;
    final events = [
      for (final order in orders) ...[
        if (order.pickupConfirmedAt != null)
          (
            order: order,
            date: order.pickupConfirmedAt!,
            label: 'Pickup confirmed',
          ),
        if (order.completedAt != null)
          (order: order, date: order.completedAt!, label: 'Dispatched'),
      ],
    ]..sort((a, b) => b.date.compareTo(a.date));
    return Scaffold(
      appBar: AppBar(
        title: const Text('Activities'),
        actions: [
          IconButton(
            tooltip: 'Customer Returns',
            icon: const Icon(Icons.assignment_return_outlined),
            onPressed: () => Navigator.of(context).push<void>(
              MaterialPageRoute(builder: (_) => const CustomerReturnsScreen()),
            ),
          ),
        ],
      ),
      body: events.isEmpty
          ? const Center(child: Text('No recorded warehouse activities yet.'))
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: events.length,
              separatorBuilder: (_, _) => const Divider(),
              itemBuilder: (context, index) {
                final event = events[index];
                return ListTile(
                  leading: const Icon(
                    Icons.check_circle_outline,
                    color: Colors.green,
                  ),
                  title: Text(event.label),
                  subtitle: Text(
                    '${event.order.number} · ${event.order.customerName}',
                  ),
                  trailing: Text(
                    DateFormat('d MMM · h:mm a').format(event.date.toLocal()),
                  ),
                  onTap: () => Navigator.of(context).push<void>(
                    MaterialPageRoute(
                      builder: (_) =>
                          PrepareOrderScreen(orderId: event.order.id),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
