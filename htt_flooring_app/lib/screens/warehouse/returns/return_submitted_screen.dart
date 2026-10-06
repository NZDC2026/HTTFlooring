import 'package:flutter/material.dart';

import '../../../models/customer_return.dart';
import '../../../theme/app_theme.dart';

class ReturnSubmittedScreen extends StatelessWidget {
  const ReturnSubmittedScreen({super.key, required this.customerReturn});

  final CustomerReturn customerReturn;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Return Submitted')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(22),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: const BoxDecoration(
                    color: AppColors.successLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check,
                    color: AppColors.success,
                    size: 38,
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Return Submitted',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  customerReturn.referenceNumber,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  customerReturn.customerName,
                  style: const TextStyle(color: AppColors.muted),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Front Desk will review the return and create the official return or financial adjustment if approved.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.muted, height: 1.45),
                ),
                const SizedBox(height: 22),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Back to Returns'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
