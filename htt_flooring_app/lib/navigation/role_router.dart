import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/app_user.dart';
import '../services/app_session.dart';
import 'sales_navigation.dart';
import 'warehouse_navigation.dart';

class RoleRouter extends StatelessWidget {
  const RoleRouter({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<AppSession>();
    if (!session.isSignedIn) return const _LoginScreen();

    final role = session.role;

    switch (role) {
      case UserRole.warehouse:
        return const WarehouseNavigation();

      case UserRole.sales:
      case UserRole.manager:
      case UserRole.admin:
        return const SalesNavigation();
    }
  }
}

class _LoginScreen extends StatelessWidget {
  const _LoginScreen();

  @override
  Widget build(BuildContext context) {
    final session = context.read<AppSession>();
    return Scaffold(
      appBar: AppBar(title: const Text('HTT Flooring CRM')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 360),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Sign in',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),
                if (AppSession.demoLoginEnabled) ...[
                  const Text('Choose a demo workspace to continue.'),
                  const SizedBox(height: 20),
                  FilledButton.icon(
                    icon: const Icon(Icons.people_outline),
                    label: const Text('Sales Demo'),
                    onPressed: () => session.signInDemo(warehouse: false),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    icon: const Icon(Icons.inventory_2_outlined),
                    label: const Text('Warehouse Demo'),
                    onPressed: () => session.signInDemo(warehouse: true),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
