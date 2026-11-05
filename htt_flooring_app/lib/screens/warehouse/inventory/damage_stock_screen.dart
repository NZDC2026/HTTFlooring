import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../data/mock_data.dart' as catalog;
import '../../../services/app_session.dart';
import '../../../services/inventory_service.dart';
import '../../../theme/app_theme.dart';
import 'report_damage_stock_screen.dart';

class DamageStockScreen extends StatefulWidget {
  const DamageStockScreen({super.key});
  @override
  State<DamageStockScreen> createState() => _DamageStockScreenState();
}

class _DamageStockScreenState extends State<DamageStockScreen> {
  List<Map<String, dynamic>> _reports = [];
  bool _demo = true;
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _load();
  }

  Future<void> _load() async {
    final key = 'damage_reports_${context.read<AppSession>().regionCode}_v1';
    final prefs = await SharedPreferences.getInstance();
    final rows = (jsonDecode(prefs.getString(key) ?? '[]') as List)
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();
    if (mounted) setState(() => _reports = rows);
  }

  Future<void> _add() async {
    await Navigator.push(
      context,
      MaterialPageRoute<bool>(builder: (_) => const ReportDamageStockScreen()),
    );
    if (mounted) await _load();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<AppSession>();
    final rows = <Map<String, dynamic>>[
      ..._reports,
      for (final p in catalog.products)
        if ((const InventoryService().stockMetrics(
                  p.id,
                  session.region,
                )['damage'] ??
                0) >
            0)
          {
            'productId': p.id,
            'quantity': const InventoryService().stockMetrics(
              p.id,
              session.region,
            )['damage'],
            'status': 'Recorded',
            'reason': 'Stock count',
          },
      if (_demo) ...[
        {
          'productId': 'bonita',
          'quantity': 3,
          'status': 'Sample',
          'reason': 'Forklift Damage',
          'action': 'Quarantine',
        },
        {
          'productId': 'guardian',
          'quantity': 2,
          'status': 'Sample',
          'reason': 'Packaging Damage',
          'action': 'Supplier Claim',
        },
      ],
    ];
    final total = rows.fold<num>(
      0,
      (sum, row) => sum + (row['quantity'] as num),
    );
    return Scaffold(
      appBar: AppBar(title: const Text('Damage Stock')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            '${session.regionName} Warehouse',
            style: const TextStyle(color: AppColors.muted),
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Demo data'),
            subtitle: const Text('Sample records for preview'),
            value: _demo,
            onChanged: (v) => setState(() => _demo = v),
          ),
          Text(
            '$total boxes · ${rows.map((e) => e['productId']).toSet().length} products',
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),
          if (rows.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text('No damage stock recorded.'),
              ),
            ),
          for (final row in rows)
            Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                leading: const Icon(
                  Icons.warning_amber_outlined,
                  color: AppColors.copper,
                ),
                title: Text(
                  catalog.products
                          .where((p) => p.id == row['productId'])
                          .firstOrNull
                          ?.name ??
                      'Unknown product',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                subtitle: Text(
                  '${row['reason']} · ${row['action'] ?? row['status']}\n${row['status']}',
                ),
                isThreeLine: true,
                trailing: Text(
                  '${row['quantity']} boxes',
                  style: const TextStyle(
                    color: AppColors.danger,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _add,
        icon: const Icon(Icons.add),
        label: const Text('Add Damage Stock'),
      ),
    );
  }
}
