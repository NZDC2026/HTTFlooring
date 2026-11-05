import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../services/app_session.dart';
import '../../../services/inventory_service.dart';
import '../../../services/stock_adjustment_service.dart';
import '../../../theme/app_theme.dart';
import 'stock_level_check_screen.dart';

class StockAdjustmentHistoryScreen extends StatefulWidget {
  const StockAdjustmentHistoryScreen({super.key});
  @override
  State<StockAdjustmentHistoryScreen> createState() =>
      _StockAdjustmentHistoryScreenState();
}

class _StockAdjustmentHistoryScreenState
    extends State<StockAdjustmentHistoryScreen> {
  List<Map<String, dynamic>> _rows = [];
  bool _loading = true;
  String? _error;
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _load();
  }

  Future<void> _load() async {
    final region = context.read<AppSession>().regionCode;
    try {
      final prefs = await SharedPreferences.getInstance();
      final rows = (jsonDecode(
        prefs.getString('stock_adjustment_requests_${region}_v1') ?? '[]',
      ) as List).map((e) => Map<String, dynamic>.from(e as Map)).toList();
      rows.sort(
        (a, b) =>
            DateTime.parse(b['createdAt'] as String)
                .compareTo(DateTime.parse(a['createdAt'] as String)),
      );
      if (mounted)
        setState(() {
          _rows = rows;
          _loading = false;
          _error = null;
        });
    } catch (_) {
      if (mounted)
        setState(() {
          _loading = false;
          _error = 'Unable to load history.';
        });
    }
  }

  Future<void> _readjust(Map<String, dynamic> row) async {
    final region = context.read<AppSession>().region;
    final lines = (row['lines'] as List)
        .map((v) => Map<String, dynamic>.from(v as Map))
        .toList();
    await Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (_) => StockLevelCheckScreen(
          previousRequestId: row['id'] as String,
          initialActual: {
            for (final line in lines)
              line['productId'] as String: (line['actualBoxes'] as num).toInt(),
          },
          products: [
            for (final line in lines)
              StockCheckProduct(
                id: line['productId'] as String,
                name: line['productName'] as String,
                sku: line['sku'] as String,
                systemBoxes:
                    const InventoryService()
                        .getForProductAndRegion(
                          line['productId'] as String,
                          region,
                        )
                        ?.stockBoxes ??
                    (line['systemBoxes'] as num).toInt(),
              ),
          ],
        ),
      ),
    );
    if (mounted) await _load();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text(
        'Stock Adjustment History',
        style: TextStyle(
          fontFamily: 'sans-serif',
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
      ),
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
        ? Center(
            child: TextButton(onPressed: _load, child: Text('$_error Retry')),
          )
        : RefreshIndicator(
            onRefresh: _load,
            child: ListView(
              padding: const EdgeInsets.all(16),
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                Text(
                  '${context.watch<AppSession>().regionName} Warehouse',
                  style: const TextStyle(color: AppColors.muted),
                ),
                const SizedBox(height: 12),
                if (_rows.isEmpty)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text('No stock adjustment history yet.'),
                    ),
                  ),
                for (var index = 0; index < _rows.length; index++)
                  _card(_rows[index], index == 0),
              ],
            ),
          ),
  );
  Widget _card(Map<String, dynamic> row, bool latest) {
    final lines = (row['lines'] as List).cast<Map>();
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.history, size: 20, color: AppColors.green),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    row['id'] as String,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                if (latest)
                  const Text(
                    'Latest',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.success,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              DateFormat('d MMM yyyy · h:mm a')
                  .format(DateTime.parse(row['createdAt'] as String).toLocal()),
              style: const TextStyle(fontSize: 11, color: AppColors.muted),
            ),
            const SizedBox(height: 6),
            Text(
              row['status'] as String,
              style: const TextStyle(fontSize: 12, color: AppColors.copper),
            ),
            if (row['previousRequestId'] != null)
              Padding(
                padding: const EdgeInsets.only(top: 5),
                child: Text(
                  'Readjustment of ${row['previousRequestId']}',
                  style: const TextStyle(fontSize: 11, color: AppColors.muted),
                ),
              ),
            const Divider(),
            for (final line in lines)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 5),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            line['productName'] as String,
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          Text(
                            line['sku'] as String,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.muted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '${line['systemBoxes']} → ${line['actualBoxes']} boxes',
                      style: const TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              ),
            if (latest) ...[
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _readjust(row),
                  icon: const Icon(Icons.edit_outlined, size: 17),
                  label: const Text('Request Stock Readjustment'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
