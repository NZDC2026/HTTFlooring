import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/customer.dart';
import '../models/sales_document.dart';
import '../services/sales_document_service.dart';
import '../theme/app_theme.dart';
import 'sales_document_detail_screen.dart';

class CustomerOrdersScreen extends StatelessWidget {
  final Customer customer;

  const CustomerOrdersScreen({super.key, required this.customer});

  @override
  Widget build(BuildContext context) {
    final documentService = context.watch<SalesDocumentService>();

    final orders = documentService.getCustomerOrders(customer.id)
      ..sort((a, b) {
        final aDate = a.convertedToOrderAt ?? a.createdAt;

        final bDate = b.convertedToOrderAt ?? b.createdAt;

        return bDate.compareTo(aDate);
      });

    final totalValue = orders.fold<double>(
      0,
      (total, order) => total + order.total,
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Sales Orders')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            customer.businessName,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 25,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            '${orders.length} active sales '
            '${orders.length == 1 ? 'order' : 'orders'}',
            style: const TextStyle(color: AppColors.muted),
          ),

          const SizedBox(height: 20),

          Row(
            children: [
              Expanded(
                child: _OrderSummaryCard(
                  label: 'ORDERS',
                  value: orders.length.toString(),
                ),
              ),

              const SizedBox(width: 10),

              Expanded(
                child: _OrderSummaryCard(
                  label: 'TOTAL VALUE',
                  value: '\$${totalValue.toStringAsFixed(2)}',
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          const Text(
            'Orders',
            style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
          ),

          const SizedBox(height: 12),

          if (orders.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: const Column(
                children: [
                  Icon(
                    Icons.shopping_cart_outlined,
                    size: 32,
                    color: AppColors.muted,
                  ),
                  SizedBox(height: 10),
                  Text(
                    'No active sales orders',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Orders for this customer will appear here.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.muted, fontSize: 12),
                  ),
                ],
              ),
            )
          else
            ...orders.map((order) => _CustomerOrderCard(order: order)),
        ],
      ),
    );
  }
}

class _CustomerOrderCard extends StatelessWidget {
  final SalesDocument order;

  const _CustomerOrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final orderDate = order.convertedToOrderAt ?? order.createdAt;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => SalesDocumentDetailScreen(document: order),
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.copperLight,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: const Icon(
                    Icons.shopping_cart_outlined,
                    color: AppColors.copper,
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              order.number,
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),

                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.copperLight,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'SALES ORDER',
                              style: TextStyle(
                                color: AppColors.copper,
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 6),

                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${order.items.length} '
                              '${order.items.length == 1 ? 'item' : 'items'}',
                              style: const TextStyle(
                                color: AppColors.muted,
                                fontSize: 12,
                              ),
                            ),
                          ),

                          Text(
                            '\$${order.total.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: AppColors.text,
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 4),

                      Text(
                        DateFormat('dd MMM yyyy').format(orderDate),
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 4),

                const Icon(Icons.chevron_right, color: AppColors.muted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OrderSummaryCard extends StatelessWidget {
  final String label;
  final String value;

  const _OrderSummaryCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 6),

          Text(
            value,
            style: const TextStyle(
              color: AppColors.text,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
