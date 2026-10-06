import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../services/app_session.dart';
import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';
import '../inventory/warehouse_inventory_screen.dart';
import '../orders/picking_list_screen.dart';
import '../orders/warehouse_orders_screen.dart';
import '../returns/customer_returns_screen.dart';

class WarehouseHomeScreen extends StatelessWidget {
  const WarehouseHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<AppSession>();
    final orders = context.watch<WarehouseOrderService>();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Warehouse'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 30),
        children: [
          const Text(
            'Good morning,',
            style: TextStyle(color: AppColors.muted, fontSize: 13),
          ),
          const SizedBox(height: 3),
          Text(
            session.userName,
            style: const TextStyle(
              color: AppColors.text,
              fontFamily: 'serif',
              fontSize: 28,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            'Warehouse · ${session.regionName} Store',
            style: const TextStyle(
              color: AppColors.copper,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 28),
          const Text(
            'Today',
            style: TextStyle(
              color: AppColors.text,
              fontFamily: 'serif',
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _StatusCard(
                  value: '${orders.toPickCount}',
                  label: 'To Pick',
                  icon: Icons.inventory_2_outlined,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const PickingListScreen(),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _StatusCard(
                  value: '${orders.preparingCount}',
                  label: 'To Prepare',
                  icon: Icons.construction_outlined,
                  onTap: () => _openOrders(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _StatusCard(
                  value: '${orders.preparedCount}',
                  label: 'Prepared',
                  icon: Icons.check_circle_outline,
                  onTap: () => _openOrders(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _StatusCard(
                  value: '1',
                  label: 'Customer Today',
                  icon: Icons.person_outline,
                  onTap: () => _openOrders(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 30),
          const Text(
            'Quick Actions',
            style: TextStyle(
              color: AppColors.text,
              fontFamily: 'serif',
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          _QuickAction(
            icon: Icons.format_list_bulleted,
            title: 'Picking List',
            subtitle: 'View orders waiting to be picked',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PickingListScreen()),
            ),
          ),
          const SizedBox(height: 10),
          _QuickAction(
            icon: Icons.inventory_outlined,
            title: 'Prepare Order',
            subtitle: 'Continue order preparation',
            onTap: () => _openOrders(context),
          ),
          const SizedBox(height: 10),
          _QuickAction(
            icon: Icons.assignment_return_outlined,
            title: 'Customer Return',
            subtitle: 'Create a warehouse return request',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const CustomerReturnsScreen()),
            ),
          ),
          const SizedBox(height: 10),
          _QuickAction(
            icon: Icons.fact_check_outlined,
            title: 'Stock Level Check',
            subtitle: 'Compare system and actual stock',
            onTap: () => _openInventory(context),
          ),
          const SizedBox(height: 10),
          _QuickAction(
            icon: Icons.search,
            title: 'Inventory Lookup',
            subtitle: 'Check warehouse stock levels',
            onTap: () => _openInventory(context),
          ),
          const SizedBox(height: 10),
          _QuickAction(
            icon: Icons.receipt_long_outlined,
            title: 'All Orders',
            subtitle: 'View warehouse fulfilment orders',
            onTap: () => _openOrders(context),
          ),
        ],
      ),
    );
  }

  static void _openOrders(BuildContext context) => Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => const WarehouseOrdersScreen()),
  );
  static void _openInventory(BuildContext context) => Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => const WarehouseInventoryScreen()),
  );
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({
    required this.value,
    required this.label,
    required this.icon,
    required this.onTap,
  });
  final String value;
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Material(
    color: AppColors.card,
    borderRadius: BorderRadius.circular(14),
    child: InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: AppColors.copperLight,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Icon(icon, size: 18, color: AppColors.copper),
                ),
                const Spacer(),
                const Icon(
                  Icons.chevron_right,
                  size: 18,
                  color: AppColors.muted,
                ),
              ],
            ),
            const SizedBox(height: 15),
            Text(
              value,
              style: const TextStyle(
                color: AppColors.text,
                fontSize: 26,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                color: AppColors.muted,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Material(
    color: AppColors.card,
    borderRadius: BorderRadius.circular(14),
    child: InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.copperLight,
                borderRadius: BorderRadius.circular(11),
              ),
              child: Icon(icon, size: 21, color: AppColors.copper),
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
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.muted),
          ],
        ),
      ),
    ),
  );
}
