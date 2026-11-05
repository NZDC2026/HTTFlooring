import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';

import '../../../data/mock_data.dart' as catalog;
import '../../../services/app_session.dart';
import '../../../services/inventory_service.dart';
import '../../../services/stock_adjustment_service.dart';
import '../../../theme/app_theme.dart';

class StockLevelCheckScreen extends StatefulWidget {
  const StockLevelCheckScreen({
    super.key,
    this.product,
    this.products,
    this.brand,
  });
  final StockCheckProduct? product;
  final List<StockCheckProduct>? products;
  final String? brand;
  @override
  State<StockLevelCheckScreen> createState() => _StockLevelCheckScreenState();
}

class _StockLevelCheckScreenState extends State<StockLevelCheckScreen> {
  final _form = GlobalKey<FormState>();
  final _fields = <String, Map<String, TextEditingController>>{};
  List<StockCheckProduct> _products = [];
  final _original = <String, int>{};
  bool _saving = false;
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_fields.isNotEmpty) return;
    final region = context.read<AppSession>().region;
    const inventory = InventoryService();
    _products =
        widget.products ??
        (widget.product == null
            ? [
                for (final p in catalog.products)
                  StockCheckProduct(
                    id: p.id,
                    name: p.colour,
                    sku: p.sku,
                    dimensions: p.dimensions,
                    systemBoxes:
                        inventory
                            .getForProductAndRegion(p.id, region)
                            ?.stockBoxes ??
                        0,
                  ),
              ]
            : [widget.product!]);
    for (final p in _products) {
      final values = inventory.stockMetrics(p.id, region);
      _fields[p.id] = {
        for (final key in ['onHand', 'damage', 'reserved', 'available', 'area'])
          key: TextEditingController(
            text: '${values[key] ?? (key == 'onHand' ? p.systemBoxes : 0)}',
          ),
      };
      _original[p.id] = int.parse(_fields[p.id]!['onHand']!.text);
    }
  }

  @override
  void dispose() {
    for (final map in _fields.values) {
      for (final c in map.values) {
        c.dispose();
      }
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    final lines = [
      for (final p in _products)
        if (int.parse(_fields[p.id]!['onHand']!.text) != _original[p.id])
          {
            'productId': p.id,
            'productName': p.name,
            'sku': p.sku,
            'systemBoxes': _original[p.id],
            'actualBoxes': int.parse(_fields[p.id]!['onHand']!.text),
          },
    ];
    if (lines.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Change On Hand before submitting.')),
      );
      return;
    }
    final region = context.read<AppSession>().regionCode;
    setState(() => _saving = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final key = 'stock_adjustment_requests_${region}_v1';
      final rows = jsonDecode(prefs.getString(key) ?? '[]') as List;
      rows.insert(0, {
        'id': 'SA-${DateTime.now().millisecondsSinceEpoch}',
        'status': 'Pending Approval',
        'createdAt': DateTime.now().toIso8601String(),
        'region': region,
        'lines': lines,
      });
      if (!await prefs.setString(key, jsonEncode(rows)))
        throw StateError('Save failed');
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (dialog) => AlertDialog(
          title: const Text('Submitted for Approval'),
          content: const Text(
            'Your stock changes have been saved as a pending approval in this demo. Current inventory has not been changed.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialog),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      if (mounted) Navigator.pop(context);
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to save. Please retry.')),
        );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Widget _number(
    StockCheckProduct p,
    String key,
    String label, {
    bool decimal = false,
  }) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(label, style: const TextStyle(fontSize: 11, color: AppColors.muted)),
      const SizedBox(height: 5),
      TextFormField(
        controller: _fields[p.id]![key],
        readOnly: key != 'onHand' || _saving,
        enableInteractiveSelection: key == 'onHand',
        keyboardType: TextInputType.numberWithOptions(decimal: decimal),
        style: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w600,
          color: key == 'damage'
              ? AppColors.danger
              : key == 'reserved'
              ? AppColors.copper
              : AppColors.green,
        ),
        decoration: InputDecoration(
          isDense: true,
          filled: key == 'onHand',
          contentPadding: EdgeInsets.symmetric(
            horizontal: key == 'onHand' ? 7 : 0,
            vertical: 10,
          ),
          border: key == 'onHand'
              ? const OutlineInputBorder()
              : InputBorder.none,
          enabledBorder: key == 'onHand'
              ? const OutlineInputBorder(
                  borderSide: BorderSide(color: AppColors.border),
                )
              : InputBorder.none,
          focusedBorder: key == 'onHand'
              ? const OutlineInputBorder(
                  borderSide: BorderSide(color: AppColors.green),
                )
              : InputBorder.none,
        ),
        validator: (v) {
          final n = num.tryParse(v ?? '');
          return n == null ||
                  !n.isFinite ||
                  n < 0 ||
                  (!decimal && n != n.roundToDouble())
              ? 'Invalid'
              : null;
        },
      ),
      if (!decimal)
        const Padding(
          padding: EdgeInsets.only(top: 4),
          child: Text(
            'boxes',
            style: TextStyle(fontSize: 10, color: AppColors.muted),
          ),
        ),
    ],
  );
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.background,
    appBar: AppBar(title: const Text('Stock Level Check')),
    body: Form(
      key: _form,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (widget.brand != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                widget.brand!,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppColors.green,
                ),
              ),
            ),
          for (final p in _products)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    p.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    [
                      p.sku,
                      if (p.dimensions != null) p.dimensions!,
                    ].join(' · '),
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.muted,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: _number(p, 'onHand', 'On Hand')),
                      const SizedBox(width: 8),
                      Expanded(child: _number(p, 'damage', 'Damage')),
                      const SizedBox(width: 8),
                      Expanded(child: _number(p, 'reserved', 'Reserved')),
                      const SizedBox(width: 8),
                      Expanded(child: _number(p, 'available', 'Available')),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _number(p, 'area', 'Available Area (m²)', decimal: true),
                ],
              ),
            ),
        ],
      ),
    ),
    bottomNavigationBar: SafeArea(
      minimum: const EdgeInsets.all(16),
      child: FilledButton.icon(
        onPressed: _saving ? null : _submit,
        icon: const Icon(Icons.send_outlined, size: 18),
        label: Text(_saving ? 'Saving…' : 'Save & Submit for Approval'),
      ),
    ),
  );
}
