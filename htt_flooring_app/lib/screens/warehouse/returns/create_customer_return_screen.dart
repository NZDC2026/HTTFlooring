import 'package:flutter/material.dart';

import 'customer_returns_screen.dart';

/// Compatibility entry point: creation now uses verified warehouse orders and
/// server acknowledgement, never the legacy device-only return repository.
class CreateCustomerReturnScreen extends StatelessWidget {
  const CreateCustomerReturnScreen({super.key});
  @override
  Widget build(BuildContext context) => const CustomerReturnsScreen();
}
