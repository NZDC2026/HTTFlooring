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
    this.previousRequestId,
    this.initialActual = const {},
  });
  final StockCheckProduct? product;
  final List<StockCheckProduct>? products;
  final String? brand;
  final String? previousRequestId;
  final Map<String, int> initialActual;
  @override
  State<StockLevelCheckScreen> createState() => _StockLevelCheckScreenState();
}

class _StockLevelCheckScreenState extends State<StockLevelCheckScreen> {
  final _form = GlobalKey<FormState>();
  final _fields = <String, Map<String, TextEditingController>>{};
  List<StockCheckProduct> _products = [];
  final _original = <String, int>{};
  bool _saving = false;
  String _query = '';
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
      if (widget.initialActual[p.id] != null) {
        _fields[p.id]!['onHand']!.text = widget.initialActual[p.id].toString();
      }
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
    if (_products.any(
      (p) => (int.tryParse(_fields[p.id]!['onHand']!.text) ?? -1) < 0,
    )) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Enter valid quantities for all products.'),
        ),
      );
      return;
    }
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
      if (widget.previousRequestId != null &&
          (rows.isEmpty ||
              (rows.first as Map)['id'] != widget.previousRequestId)) {
        throw StateError('Only the latest request can be readjusted');
      }
      rows.insert(0, {
        'id': 'SA-${DateTime.now().millisecondsSinceEpoch}',
        'status': 'Pending Approval',
        'createdAt': DateTime.now().toIso8601String(),
        'region': region,
        if (widget.previousRequestId != null)
          'previousRequestId': widget.previousRequestId,
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

  @override
  Widget build(BuildContext context) {
    final visible = _products
        .where(
          (p) =>
              '${p.name} ${p.sku}'.toLowerCase().contains(_query.toLowerCase()),
        )
        .toList();
    return Scaffold(
      backgroundColor: const Color(0xFFF6F3ED),
      appBar: AppBar(
        title: const Text(
          'Stock Level Check',
          style: TextStyle(
            fontFamily: 'sans-serif',
            fontSize: 21,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
          children: [
            TextField(
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                hintText: 'Search product or SKU…',
                hintStyle: const TextStyle(fontSize: 13),
                prefixIcon: const Icon(Icons.search, size: 21),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 11),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
            ),
            const SizedBox(height: 14),
            if (widget.brand != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Text(
                  widget.brand!,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.green,
                  ),
                ),
              ),
            if (visible.isEmpty)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Text('No matching products'),
              ),
            for (final p in visible) _stockCard(p),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 8, 16, 18),
        child: FilledButton.icon(
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          onPressed: _saving ? null : _submit,
          icon: const Icon(Icons.check, size: 20),
          label: Text(
            _saving ? 'Saving…' : 'Save & Submit for Approval',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
          ),
        ),
      ),
    );
  }

  Widget _stockCard(StockCheckProduct p) {
    final original = _original[p.id]!;
    final text = _fields[p.id]!['onHand']!.text;
    final actual = int.tryParse(text);
    final difference = actual == null ? null : actual - original;
    final different = difference != null && difference != 0;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFEFB),
        border: Border.all(color: const Color(0xFFEAE5DD)),
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 7,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(7),
                child: SizedBox(
                  width: 45,
                  height: 40,
                  child: CustomPaint(painter: _CountWoodPainter()),
                ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      p.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      p.sku,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.muted,
                      ),
                    ),
                  ],
                ),
              ),
              if (different)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDDF0D7),
                    borderRadius: BorderRadius.circular(7),
                  ),
                  child: const Text(
                    'Different',
                    style: TextStyle(
                      fontSize: 10,
                      color: Color(0xFF20532A),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0EAE1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'System Stock',
                        style: TextStyle(fontSize: 11),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '$original boxes',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Actual Stock', style: TextStyle(fontSize: 11)),
                    const SizedBox(height: 4),
                    TextFormField(
                      controller: _fields[p.id]!['onHand'],
                      readOnly: _saving,
                      onChanged: (_) => setState(() {}),
                      keyboardType: TextInputType.number,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Enter quantity',
                        hintStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        ),
                        suffixText: 'boxes',
                        suffixStyle: const TextStyle(fontSize: 12),
                        isDense: true,
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 10,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(7),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                      ),
                      validator: (v) {
                        final n = int.tryParse(v ?? '');
                        return n == null || n < 0
                            ? 'Enter a valid quantity'
                            : null;
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (different) ...[
            const SizedBox(height: 9),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFFFE8E4),
                borderRadius: BorderRadius.circular(7),
              ),
              child: Row(
                children: [
                  const Text('Difference', style: TextStyle(fontSize: 12)),
                  const SizedBox(width: 12),
                  Text(
                    '${difference > 0 ? '+' : ''}$difference boxes',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AppColors.danger,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CountWoodPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(
      Offset.zero & size,
      Paint()
        ..shader = const LinearGradient(
          colors: [Color(0xFFBA874E), Color(0xFFF0CC91), Color(0xFFC3935D)],
        ).createShader(Offset.zero & size),
    );
    canvas.save();
    canvas.clipRect(Offset.zero & size);
    for (var i = -10; i < 20; i++) {
      final x = i * 4.0;
      canvas.drawLine(
        Offset(x, 0),
        Offset(x + size.height, size.height),
        Paint()
          ..color = const Color(0x66865733)
          ..strokeWidth = i % 5 == 0 ? 1.3 : 0.5,
      );
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(_CountWoodPainter old) => false;
}
