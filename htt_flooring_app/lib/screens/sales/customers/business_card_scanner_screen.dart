import 'package:flutter/material.dart';

import '../../../models/business_card_scan_result.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../home/sales_dashboard_support.dart';
import 'business_card_photo_input.dart';
import 'sales_customer_form.dart';

class BusinessCardScannerScreen extends StatelessWidget {
  const BusinessCardScannerScreen({super.key});
  void _review(BuildContext context, BusinessCardScanResult result) =>
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => SalesCustomerForm(initial: result)),
      );
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.white,
    appBar: dashboardBar('Scan business card'),
    body: ListView(
      padding: const EdgeInsets.all(14),
      children: [
        const Text(
          'Fill from business card',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 10),
        const Text(
          'Capture the whole business card in a clear, well-lit photo. Check the recognised details before saving.',
          style: TextStyle(fontSize: 12, color: detailMuted, height: 1.5),
        ),
        const SizedBox(height: 20),
        detailCard(
          Padding(
            padding: const EdgeInsets.all(14),
            child: BusinessCardPhotoInput(
              onScanned: (r) => _review(context, r),
            ),
          ),
        ),
        const SizedBox(height: 20),
        detailAction(
          'Enter details manually',
          'doc',
          () => _review(context, const BusinessCardScanResult()),
        ),
      ],
    ),
  );
}
