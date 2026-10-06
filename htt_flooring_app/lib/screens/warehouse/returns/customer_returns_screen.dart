import 'package:flutter/material.dart';

import '../../../models/customer_return.dart';
import '../../../services/customer_return_service.dart';
import '../../../theme/app_theme.dart';
import 'create_customer_return_screen.dart';

class CustomerReturnsScreen extends StatefulWidget {
  const CustomerReturnsScreen({super.key});

  @override
  State<CustomerReturnsScreen> createState() => _CustomerReturnsScreenState();
}

class _CustomerReturnsScreenState extends State<CustomerReturnsScreen> {
  int _filter = 0;

  @override
  Widget build(BuildContext context) {
    final service = CustomerReturnService.instance;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Customer Returns')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => const CreateCustomerReturnScreen(),
            ),
          );
          if (mounted) setState(() {});
        },
        icon: const Icon(Icons.add),
        label: const Text('New Return'),
      ),
      body: AnimatedBuilder(
        animation: service,
        builder: (context, _) {
          final items = switch (_filter) {
            1 => service.pending,
            2 => service.processed,
            _ => service.returns,
          };
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Text(
                'Customer Returns',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: AppColors.text,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Submit customer returns to Front Desk for processing.',
                style: TextStyle(color: AppColors.muted),
              ),
              const SizedBox(height: 18),
              SegmentedButton<int>(
                segments: const [
                  ButtonSegment(value: 0, label: Text('All')),
                  ButtonSegment(value: 1, label: Text('Pending')),
                  ButtonSegment(value: 2, label: Text('Processed')),
                ],
                selected: {_filter},
                onSelectionChanged: (value) =>
                    setState(() => _filter = value.first),
              ),
              const SizedBox(height: 18),
              if (items.isEmpty)
                Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: const Column(
                    children: [
                      Icon(
                        Icons.assignment_return_outlined,
                        size: 42,
                        color: AppColors.muted,
                      ),
                      SizedBox(height: 12),
                      Text(
                        'No returns in this view',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.text,
                        ),
                      ),
                    ],
                  ),
                )
              else
                ...items.map(_returnCard),
              const SizedBox(height: 90),
            ],
          );
        },
      ),
    );
  }

  Widget _returnCard(CustomerReturn item) {
    final pending = item.status == CustomerReturnStatus.pending;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.referenceNumber,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      color: AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    item.customerName,
                    style: const TextStyle(color: AppColors.text),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    '${item.items.length} item(s) · ${item.totalQuantity} unit(s)',
                    style: const TextStyle(color: AppColors.muted),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: pending
                    ? AppColors.warningLight
                    : AppColors.successLight,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                item.statusLabel,
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: pending ? AppColors.warning : AppColors.success,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
