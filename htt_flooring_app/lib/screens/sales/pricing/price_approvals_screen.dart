import 'package:flutter/material.dart';

import '../../../theme/app_theme.dart';
import 'price_approval_detail_screen.dart';

enum PriceApprovalStatus { pending, approved, rejected }

class PriceApprovalDemo {
  const PriceApprovalDemo({
    required this.id,
    required this.customerName,
    required this.productName,
    required this.sku,
    required this.standardPrice,
    required this.currentPrice,
    required this.floorPrice,
    required this.requestedPrice,
    required this.requestedBy,
    required this.requestedAt,
    required this.reason,
    required this.status,
  });

  final String id;
  final String customerName;
  final String productName;
  final String sku;

  final double standardPrice;
  final double currentPrice;
  final double floorPrice;
  final double requestedPrice;

  final String requestedBy;
  final String requestedAt;
  final String reason;

  final PriceApprovalStatus status;

  PriceApprovalDemo copyWith({PriceApprovalStatus? status}) {
    return PriceApprovalDemo(
      id: id,
      customerName: customerName,
      productName: productName,
      sku: sku,
      standardPrice: standardPrice,
      currentPrice: currentPrice,
      floorPrice: floorPrice,
      requestedPrice: requestedPrice,
      requestedBy: requestedBy,
      requestedAt: requestedAt,
      reason: reason,
      status: status ?? this.status,
    );
  }
}

class PriceApprovalsScreen extends StatefulWidget {
  const PriceApprovalsScreen({super.key});

  @override
  State<PriceApprovalsScreen> createState() => _PriceApprovalsScreenState();
}

class _PriceApprovalsScreenState extends State<PriceApprovalsScreen> {
  PriceApprovalStatus _selectedStatus = PriceApprovalStatus.pending;

  late List<PriceApprovalDemo> _requests;

  @override
  void initState() {
    super.initState();

    _requests = const [
      PriceApprovalDemo(
        id: 'PA-1001',
        customerName: 'ABC Flooring',
        productName: 'Hybrid Oak Natural',
        sku: 'HF001',
        standardPrice: 39.90,
        currentPrice: 36.50,
        floorPrice: 32.00,
        requestedPrice: 30.00,
        requestedBy: 'James Wilson',
        requestedAt: 'Today · 2:35 PM',
        reason: 'Customer requested project pricing for a large residential development.',
        status: PriceApprovalStatus.pending,
      ),
      PriceApprovalDemo(
        id: 'PA-1002',
        customerName: 'Sydney Floors',
        productName: 'European Oak',
        sku: 'EO102',
        standardPrice: 69.90,
        currentPrice: 62.00,
        floorPrice: 58.00,
        requestedPrice: 55.00,
        requestedBy: 'James Wilson',
        requestedAt: 'Today · 11:20 AM',
        reason: 'Competitive quote required for a commercial project.',
        status: PriceApprovalStatus.pending,
      ),
      PriceApprovalDemo(
        id: 'PA-0998',
        customerName: 'Metro Flooring',
        productName: 'Premium Hybrid Grey',
        sku: 'PH208',
        standardPrice: 45.90,
        currentPrice: 41.00,
        floorPrice: 37.00,
        requestedPrice: 36.00,
        requestedBy: 'James Wilson',
        requestedAt: '3 Oct · 4:15 PM',
        reason: 'Volume pricing requested for repeat customer.',
        status: PriceApprovalStatus.approved,
      ),
      PriceApprovalDemo(
        id: 'PA-0995',
        customerName: 'BuildRight Interiors',
        productName: 'Classic Oak',
        sku: 'CO310',
        standardPrice: 54.90,
        currentPrice: 49.00,
        floorPrice: 44.00,
        requestedPrice: 38.00,
        requestedBy: 'James Wilson',
        requestedAt: '1 Oct · 10:10 AM',
        reason: 'Customer requested additional discount.',
        status: PriceApprovalStatus.rejected,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _requests
        .where((request) => request.status == _selectedStatus)
        .toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Price Approvals')),
      body: Column(
        children: [
          _buildSummary(),

          Padding(
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 12),
            child: Row(
              children: [
                Expanded(
                  child: _filterButton(
                    label: 'Pending',
                    status: PriceApprovalStatus.pending,
                    count: _count(PriceApprovalStatus.pending),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _filterButton(
                    label: 'Approved',
                    status: PriceApprovalStatus.approved,
                    count: _count(PriceApprovalStatus.approved),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _filterButton(
                    label: 'Rejected',
                    status: PriceApprovalStatus.rejected,
                    count: _count(PriceApprovalStatus.rejected),
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: filtered.isEmpty
                ? _emptyState()
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 30),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      return _approvalCard(filtered[index]);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummary() {
    final pending = _count(PriceApprovalStatus.pending);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 20),
      color: AppColors.green,
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.approval_outlined, color: Colors.white),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Price Authority',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '$pending requests require review',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.75),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
            decoration: BoxDecoration(
              color: AppColors.warningLight,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$pending Pending',
              style: const TextStyle(
                color: AppColors.warning,
                fontWeight: FontWeight.w700,
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterButton({
    required String label,
    required PriceApprovalStatus status,
    required int count,
  }) {
    final selected = _selectedStatus == status;

    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: () {
        setState(() {
          _selectedStatus = status;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(vertical: 11),
        decoration: BoxDecoration(
          color: selected ? AppColors.green : AppColors.card,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected ? AppColors.green : AppColors.border,
          ),
        ),
        child: Column(
          children: [
            Text(
              '$count',
              style: TextStyle(
                color: selected ? Colors.white : AppColors.text,
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                color: selected ? Colors.white : AppColors.muted,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _approvalCard(PriceApprovalDemo request) {
    final difference = request.requestedPrice - request.floorPrice;

    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () async {
          final updated = await Navigator.push<PriceApprovalDemo>(
            context,
            MaterialPageRoute(
              builder: (_) => PriceApprovalDetailScreen(approval: request),
            ),
          );

          if (updated == null) {
            return;
          }

          setState(() {
            final index = _requests.indexWhere((item) => item.id == updated.id);

            if (index != -1) {
              _requests[index] = updated;
            }
          });
        },
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      request.customerName,
                      style: const TextStyle(
                        color: AppColors.text,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  _statusChip(request.status),
                ],
              ),

              const SizedBox(height: 7),

              Text(
                request.productName,
                style: const TextStyle(
                  color: AppColors.text,
                  fontWeight: FontWeight.w600,
                ),
              ),

              const SizedBox(height: 3),

              Text(
                request.sku,
                style: const TextStyle(color: AppColors.muted, fontSize: 11),
              ),

              const SizedBox(height: 15),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.ivory,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Expanded(child: _priceValue('FLOOR', request.floorPrice)),
                    const Icon(
                      Icons.arrow_forward,
                      color: AppColors.muted,
                      size: 18,
                    ),
                    Expanded(
                      child: _priceValue(
                        'REQUESTED',
                        request.requestedPrice,
                        highlight: true,
                      ),
                    ),
                    Expanded(
                      child: _priceValue(
                        'DIFFERENCE',
                        difference,
                        danger: difference < 0,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              Row(
                children: [
                  const Icon(
                    Icons.person_outline,
                    size: 15,
                    color: AppColors.muted,
                  ),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      request.requestedBy,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 11,
                      ),
                    ),
                  ),
                  Text(
                    request.requestedAt,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(width: 5),
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

  Widget _priceValue(
    String label,
    double value, {
    bool highlight = false,
    bool danger = false,
  }) {
    Color valueColor = AppColors.text;

    if (highlight) {
      valueColor = AppColors.copper;
    }

    if (danger) {
      valueColor = AppColors.danger;
    }

    final prefix = label == 'DIFFERENCE' && value > 0 ? '+' : '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.muted,
            fontSize: 9,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 5),
        Text(
          '$prefix\$${value.toStringAsFixed(2)}',
          style: TextStyle(
            color: valueColor,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _statusChip(PriceApprovalStatus status) {
    Color background;
    Color foreground;
    String label;

    switch (status) {
      case PriceApprovalStatus.pending:
        background = AppColors.warningLight;
        foreground = AppColors.warning;
        label = 'PENDING';

      case PriceApprovalStatus.approved:
        background = AppColors.successLight;
        foreground = AppColors.success;
        label = 'APPROVED';

      case PriceApprovalStatus.rejected:
        background = AppColors.dangerLight;
        foreground = AppColors.danger;
        label = 'REJECTED';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: foreground,
          fontSize: 9,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Widget _emptyState() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_outline, size: 46, color: AppColors.muted),
            SizedBox(height: 12),
            Text(
              'No approval requests',
              style: TextStyle(
                color: AppColors.text,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: 5),
            Text(
              'There are no requests in this category.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.muted, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  int _count(PriceApprovalStatus status) {
    return _requests.where((request) => request.status == status).length;
  }
}
