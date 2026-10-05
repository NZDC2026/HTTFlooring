import 'package:flutter/material.dart';

import '../../../theme/app_theme.dart';

class WarehouseOrdersScreen extends StatelessWidget {
  const WarehouseOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Orders'),
      ),
      body: const Center(
        child: Text(
          'Warehouse Orders',
          style: TextStyle(
            color: AppColors.text,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
