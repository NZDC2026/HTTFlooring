import 'package:flutter/material.dart';

import '../../../theme/app_theme.dart';

class CustomerReturnsScreen extends StatelessWidget {
  const CustomerReturnsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Returns'),
      ),
      body: const Center(
        child: Text(
          'Customer Returns',
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
