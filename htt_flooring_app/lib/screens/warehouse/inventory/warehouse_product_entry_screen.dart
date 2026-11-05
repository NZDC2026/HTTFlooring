import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/mock_data.dart';
import '../../../models/product.dart';
import '../../../models/sales_user.dart';
import '../../../services/app_session.dart';
import '../../../services/inventory_service.dart';
import 'product_barcode_scanner_screen.dart';

class WarehouseProductEntryScreen extends StatefulWidget {
  const WarehouseProductEntryScreen({super.key, this.receiving = false});

  final bool receiving;

  @override
  State<WarehouseProductEntryScreen> createState() =>
      _WarehouseProductEntryScreenState();
}

class _WarehouseProductEntryScreenState
    extends State<WarehouseProductEntryScreen> {
  final _code = TextEditingController();
  final _quantity = TextEditingController();
  Product? _product;
  String? _error;
  bool _saving = false;

  @override
  void dispose() {
    _code.dispose();
    _quantity.dispose();
    super.dispose();
  }

  Future<void> _scan() async {
    final value = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const ProductBarcodeScannerScreen()),
    );
    if (!mounted || value == null) return;
    _code.text = value.trim();
    _lookup();
  }

  void _lookup() {
    final code = _code.text.trim().toLowerCase();
    final product = products
        .where(
          (item) =>
              item.sku.toLowerCase() == code ||
              item.barcode?.toLowerCase() == code,
        )
        .firstOrNull;
    setState(() {
      _product = product;
      _error = product == null
          ? 'No product matches this barcode or SKU.'
          : null;
    });
  }

  Future<void> _receive(Product product) async {
    if (_saving) return;
    final boxes = int.tryParse(_quantity.text.trim());
    if (boxes == null || boxes <= 0) {
      setState(() => _error = 'Enter a positive whole number of boxes.');
      return;
    }
    final region = context.read<AppSession>().region;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await const InventoryService().receiveBoxes(product.id, region, boxes);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Received $boxes boxes of ${product.name}.')),
      );
      Navigator.pop(context);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _error = 'Could not save the receipt. Try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final region = context.watch<AppSession>().region;
    final product = _product;
    final stock = product == null
        ? null
        : const InventoryService().getForProductAndRegion(product.id, region);
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.receiving ? 'Goods Receiving' : 'Scan Product'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('${region.label} Warehouse'),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _saving ? null : _scan,
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('Scan Barcode'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _code,
            autofocus: true,
            enabled: !_saving,
            onChanged: (_) => setState(() {
              _product = null;
              _error = null;
            }),
            onSubmitted: (_) => _lookup(),
            decoration: const InputDecoration(
              labelText: 'Barcode / Product SKU',
              helperText: 'Scan a SKU with a keyboard scanner or type it in.',
              helperMaxLines: 2,
            ),
          ),
          OutlinedButton(
            onPressed: _saving ? null : _lookup,
            child: const Text('Find Product'),
          ),
          if (product != null)
            ListTile(
              title: Text(product.name),
              subtitle: Text(
                stock == null
                    ? '${product.sku} · No stock record'
                    : '${product.sku} · ${stock.stockBoxes} boxes in stock',
              ),
            ),
          if (widget.receiving && product != null && stock != null) ...[
            TextField(
              controller: _quantity,
              enabled: !_saving,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Boxes received'),
            ),
            FilledButton(
              onPressed: _saving ? null : () => _receive(product),
              child: const Text('Receive Stock'),
            ),
          ],
          if (_error != null)
            Text(
              _error!,
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
        ],
      ),
    );
  }
}
