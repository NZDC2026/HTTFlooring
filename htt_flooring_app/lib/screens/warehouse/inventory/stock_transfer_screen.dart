import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/mock_data.dart';
import '../../../models/sales_user.dart';
import '../../../services/app_session.dart';
import '../../../services/inventory_service.dart';

class StockTransferScreen extends StatefulWidget {
  const StockTransferScreen({super.key});

  @override
  State<StockTransferScreen> createState() => _StockTransferScreenState();
}

class _StockTransferScreenState extends State<StockTransferScreen> {
  String? _productId;
  SalesRegion? _destination;
  final _quantity = TextEditingController();
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _quantity.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_saving) return;
    final source = context.read<AppSession>().region;
    final quantity = int.tryParse(_quantity.text.trim());
    if (_productId == null ||
        _destination == null ||
        quantity == null ||
        quantity <= 0) {
      setState(
        () =>
            _error = 'Select a product, destination and positive box quantity.',
      );
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await const InventoryService().transferBoxes(
        _productId!,
        source,
        _destination!,
        quantity,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Stock transfer saved.')));
      Navigator.pop(context);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _error = 'Transfer could not be saved. Check available stock.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final source = context.watch<AppSession>().region;
    return Scaffold(
      appBar: AppBar(title: const Text('Stock Transfer')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('From ${source.label} Warehouse'),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Product'),
            items: [
              for (final product in products)
                DropdownMenuItem(value: product.id, child: Text(product.name)),
            ],
            onChanged: _saving
                ? null
                : (value) => setState(() => _productId = value),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<SalesRegion>(
            decoration: const InputDecoration(
              labelText: 'Destination warehouse',
            ),
            items: [
              for (final region in SalesRegion.values.where(
                (region) => region != source,
              ))
                DropdownMenuItem(value: region, child: Text(region.label)),
            ],
            onChanged: _saving
                ? null
                : (value) => setState(() => _destination = value),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _quantity,
            enabled: !_saving,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Boxes to transfer'),
          ),
          if (_error != null)
            Text(_error!, style: const TextStyle(color: Colors.red)),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _saving ? null : _save,
            child: const Text('Confirm Transfer'),
          ),
        ],
      ),
    );
  }
}
