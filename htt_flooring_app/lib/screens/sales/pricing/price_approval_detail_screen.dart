import 'package:flutter/material.dart';

import '../../../theme/app_theme.dart';
import 'price_approvals_screen.dart';

class PriceApprovalDetailScreen extends StatefulWidget {
  const PriceApprovalDetailScreen({super.key, required this.approval});

  final PriceApprovalDemo approval;

  @override
  State<PriceApprovalDetailScreen> createState() =>
      _PriceApprovalDetailScreenState();
}

class _PriceApprovalDetailScreenState extends State<PriceApprovalDetailScreen> {
  late PriceApprovalDemo _approval;

  @override
  void initState() {
    super.initState();
    _approval = widget.approval;
  }

  @override
  Widget build(BuildContext context) {
    final difference = _approval.requestedPrice - _approval.floorPrice;

    final discount = _approval.standardPrice <= 0
        ? 0.0
        : (1 - (_approval.requestedPrice / _approval.standardPrice)) * 100;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Approval Detail')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
        children: [
          _statusHeader(),

          const SizedBox(height: 24),

          _sectionTitle('Request'),

          const SizedBox(height: 10),

          _card(
            children: [
              _detailRow('Request ID', _approval.id),
              _divider(),
              _detailRow('Requested By', _approval.requestedBy),
              _divider(),
              _detailRow('Requested', _approval.requestedAt),
            ],
          ),

          const SizedBox(height: 24),

          _sectionTitle('Customer'),

          const SizedBox(height: 10),

          _card(
            children: [
              ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 4,
                ),
                leading: Container(
                  width: 42,
                  height: 42,
                  decoration: const BoxDecoration(
                    color: AppColors.copperLight,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    _initials(_approval.customerName),
                    style: const TextStyle(
                      color: AppColors.copper,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                title: Text(
                  _approval.customerName,
                  style: const TextStyle(
                    color: AppColors.text,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                subtitle: const Text(
                  'Customer account',
                  style: TextStyle(color: AppColors.muted, fontSize: 11),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          _sectionTitle('Product'),

          const SizedBox(height: 10),

          _card(
            children: [
              ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 5,
                ),
                leading: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.ivory,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: const Icon(Icons.texture, color: AppColors.copper),
                ),
                title: Text(
                  _approval.productName,
                  style: const TextStyle(
                    color: AppColors.text,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                subtitle: Text(
                  _approval.sku,
                  style: const TextStyle(color: AppColors.muted, fontSize: 11),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          _sectionTitle('Price Authority'),

          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _priceRow('Standard Price', _approval.standardPrice),
                _divider(),
                _priceRow('Current Customer Price', _approval.currentPrice),
                _divider(),
                _priceRow(
                  'Sales Floor',
                  _approval.floorPrice,
                  valueColor: AppColors.green,
                ),
                _divider(),
                _priceRow(
                  'Requested Price',
                  _approval.requestedPrice,
                  valueColor: AppColors.copper,
                  strong: true,
                ),

                const SizedBox(height: 14),

                Container(
                  padding: const EdgeInsets.all(13),
                  decoration: BoxDecoration(
                    color: AppColors.dangerLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Expanded(
                            child: Text(
                              'Below Sales Floor',
                              style: TextStyle(
                                color: AppColors.danger,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          Text(
                            '${difference.toStringAsFixed(2)} / m²',
                            style: const TextStyle(
                              color: AppColors.danger,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 7),
                      Row(
                        children: [
                          const Expanded(
                            child: Text(
                              'Discount from standard',
                              style: TextStyle(
                                color: AppColors.muted,
                                fontSize: 11,
                              ),
                            ),
                          ),
                          Text(
                            '${discount.toStringAsFixed(1)}%',
                            style: const TextStyle(
                              color: AppColors.text,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          _sectionTitle('Reason'),

          const SizedBox(height: 10),

          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              _approval.reason,
              style: const TextStyle(
                color: AppColors.text,
                height: 1.5,
                fontSize: 13,
              ),
            ),
          ),

          if (_approval.status != PriceApprovalStatus.pending) ...[
            const SizedBox(height: 24),
            _decisionResult(),
          ],
        ],
      ),

      bottomNavigationBar: _approval.status == PriceApprovalStatus.pending
          ? _approvalActions()
          : null,
    );
  }

  Widget _statusHeader() {
    Color background;
    Color foreground;
    IconData icon;
    String title;
    String subtitle;

    switch (_approval.status) {
      case PriceApprovalStatus.pending:
        background = AppColors.warningLight;
        foreground = AppColors.warning;
        icon = Icons.schedule_outlined;
        title = 'Pending Approval';
        subtitle = 'This price is below the authorised sales floor.';

      case PriceApprovalStatus.approved:
        background = AppColors.successLight;
        foreground = AppColors.success;
        icon = Icons.check_circle_outline;
        title = 'Approved';
        subtitle = 'This price request has been approved.';

      case PriceApprovalStatus.rejected:
        background = AppColors.dangerLight;
        foreground = AppColors.danger;
        icon = Icons.cancel_outlined;
        title = 'Rejected';
        subtitle = 'This price request has been rejected.';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, color: foreground, size: 30),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: foreground,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: foreground,
                    fontSize: 11,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _approvalActions() {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        decoration: const BoxDecoration(
          color: AppColors.card,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.danger,
                  side: const BorderSide(color: AppColors.danger),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: _reject,
                icon: const Icon(Icons.close),
                label: const Text('Reject'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.success,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: _approve,
                icon: const Icon(Icons.check),
                label: const Text('Approve'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _approve() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Approve Price?'),
          content: Text(
            'Approve \$${_approval.requestedPrice.toStringAsFixed(2)} / m² '
            'for ${_approval.customerName}?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('Approve'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) {
      return;
    }

    setState(() {
      _approval = _approval.copyWith(status: PriceApprovalStatus.approved);
    });

    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text('Price approved.')));
  }

  Future<void> _reject() async {
    final reasonController = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Reject Request'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Add a reason for rejecting this price request.'),
              const SizedBox(height: 14),
              TextField(
                controller: reasonController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Rejection reason',
                  hintText: 'e.g. Price is below acceptable margin',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
              onPressed: () {
                if (reasonController.text.trim().isEmpty) {
                  return;
                }

                Navigator.pop(dialogContext, true);
              },
              child: const Text('Reject'),
            ),
          ],
        );
      },
    );

    reasonController.dispose();

    if (confirmed != true || !mounted) {
      return;
    }

    setState(() {
      _approval = _approval.copyWith(status: PriceApprovalStatus.rejected);
    });

    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text('Price request rejected.')));
  }

  Widget _decisionResult() {
    final approved = _approval.status == PriceApprovalStatus.approved;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: approved ? AppColors.successLight : AppColors.dangerLight,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(
            approved ? Icons.check_circle_outline : Icons.cancel_outlined,
            color: approved ? AppColors.success : AppColors.danger,
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Text(
              approved
                  ? 'Approved price: \$${_approval.requestedPrice.toStringAsFixed(2)} / m²'
                  : 'This request has been rejected.',
              style: TextStyle(
                color: approved ? AppColors.success : AppColors.danger,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: AppColors.text,
        fontSize: 15,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  Widget _card({required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(children: children),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 14),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(color: AppColors.muted, fontSize: 12),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.text,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _priceRow(
    String label,
    double value, {
    Color valueColor = AppColors.text,
    bool strong = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(color: AppColors.muted, fontSize: 12),
            ),
          ),
          Text(
            '\$${value.toStringAsFixed(2)} / m²',
            style: TextStyle(
              color: valueColor,
              fontSize: strong ? 16 : 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() {
    return const Divider(height: 1, color: AppColors.border);
  }

  String _initials(String value) {
    final parts = value
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList();

    if (parts.isEmpty) {
      return '?';
    }

    if (parts.length == 1) {
      return parts.first.substring(0, 1).toUpperCase();
    }

    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }
}
