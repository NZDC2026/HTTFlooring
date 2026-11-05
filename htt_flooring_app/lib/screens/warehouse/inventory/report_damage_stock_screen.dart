import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../data/mock_data.dart' as catalog;
import '../../../services/app_session.dart';
import '../../../theme/app_theme.dart';

class ReportDamageStockScreen extends StatefulWidget {
  const ReportDamageStockScreen({super.key});
  @override
  State<ReportDamageStockScreen> createState() =>
      _ReportDamageStockScreenState();
}

class _ReportDamageStockScreenState extends State<ReportDamageStockScreen> {
  String? _productId;
  String _reason = 'Forklift Damage';
  String _action = 'Quarantine';
  int _quantity = 2;
  final _notes = TextEditingController();
  final _photos = <Uint8List>[];
  bool _saving = false;
  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<void> _selectProduct() async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (sheet) => SafeArea(
        child: SizedBox(
          height: 420,
          child: ListView(
            children: [
              const ListTile(
                title: Text(
                  'Select Product / SKU',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
              for (final p in catalog.products)
                ListTile(
                  title: Text(p.name),
                  subtitle: Text(p.sku),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.pop(sheet, p.id),
                ),
            ],
          ),
        ),
      ),
    );
    if (selected != null && mounted) setState(() => _productId = selected);
  }

  Future<void> _photo() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (sheet) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined),
              title: const Text('Take Photo'),
              onTap: () => Navigator.pop(sheet, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Upload Photo'),
              onTap: () => Navigator.pop(sheet, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;
    try {
      final photo = await ImagePicker().pickImage(
        source: source,
        imageQuality: 70,
        maxWidth: 1600,
      );
      if (photo == null) return;
      final bytes = await photo.readAsBytes();
      if (mounted) setState(() => _photos.add(bytes));
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to add photo. Please retry.')),
        );
    }
  }

  Future<void> _submit() async {
    if (_productId == null || _photos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Select a product and add at least one damage photo.'),
        ),
      );
      return;
    }
    setState(() => _saving = true);
    final session = context.read<AppSession>();
    try {
      final prefs = await SharedPreferences.getInstance();
      final key = 'damage_reports_${session.regionCode}_v1';
      final rows = List<Map<String, dynamic>>.from(
        (jsonDecode(prefs.getString(key) ?? '[]') as List).map(
          (r) => Map<String, dynamic>.from(r as Map),
        ),
      );
      rows.insert(0, {
        'id': 'DS-${DateTime.now().millisecondsSinceEpoch}',
        'productId': _productId,
        'quantity': _quantity,
        'reason': _reason,
        'action': _action,
        'notes': _notes.text.trim(),
        'photos': _photos.map(base64Encode).toList(),
        'status': 'Pending Approval',
        'createdAt': DateTime.now().toIso8601String(),
      });
      if (!await prefs.setString(key, jsonEncode(rows)))
        throw StateError('Save failed');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Damage report saved for approval in this demo.'),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Unable to save. Your report is retained; please retry.',
            ),
          ),
        );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Widget _label(IconData icon, String text, {bool required = false}) => Padding(
    padding: const EdgeInsets.only(bottom: 7),
    child: Row(
      children: [
        Icon(icon, size: 17, color: AppColors.green),
        const SizedBox(width: 7),
        Text(
          text,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
        ),
        if (required)
          const Text(' *', style: TextStyle(color: AppColors.danger)),
      ],
    ),
  );
  @override
  Widget build(BuildContext context) {
    final session = context.watch<AppSession>();
    final p = _productId == null
        ? null
        : catalog.products.firstWhere((p) => p.id == _productId);
    return Scaffold(
      backgroundColor: const Color(0xFFF8F5EF),
      appBar: AppBar(
        title: const Text(
          'Report Damage Stock',
          style: TextStyle(fontSize: 19, fontWeight: FontWeight.w600),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        children: [
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Row(
              children: [
                const Icon(
                  Icons.inventory_2_outlined,
                  size: 38,
                  color: AppColors.copper,
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Damage Stock',
                        style: TextStyle(
                          fontSize: 21,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      SizedBox(height: 3),
                      Text(
                        'Report damaged goods, quarantine stock\nand submit for approval.',
                        style: TextStyle(fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _label(Icons.warehouse_outlined, 'Warehouse', required: true),
                Text(
                  '${session.regionName} Warehouse',
                  style: const TextStyle(fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _label(Icons.inventory_2_outlined, 'Product / SKU', required: true),
          Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            child: ListTile(
              onTap: _saving ? null : _selectProduct,
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFFD8B58C),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.layers_outlined, color: Colors.white),
              ),
              title: Text(
                p?.name ?? 'Select product',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
              subtitle: Text(
                p == null
                    ? 'Choose a product / colour'
                    : '${p.sku}  |  ${p.category} · ${p.installationStyle ?? ''}',
                style: const TextStyle(fontSize: 10),
              ),
              trailing: const Icon(Icons.chevron_right),
            ),
          ),
          const SizedBox(height: 15),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  children: [
                    _label(
                      Icons.layers_outlined,
                      'Damage Quantity',
                      required: true,
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            visualDensity: VisualDensity.compact,
                            onPressed: _quantity <= 1 || _saving
                                ? null
                                : () => setState(() => _quantity--),
                            icon: const Icon(Icons.remove, size: 17),
                          ),
                          Expanded(
                            child: Text(
                              '$_quantity',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          IconButton(
                            visualDensity: VisualDensity.compact,
                            onPressed: _saving
                                ? null
                                : () => setState(() => _quantity++),
                            icon: const Icon(Icons.add, size: 17),
                          ),
                          const Padding(
                            padding: EdgeInsets.only(right: 7),
                            child: Text(
                              'boxes',
                              style: TextStyle(fontSize: 10),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  children: [
                    _label(
                      Icons.warning_amber_outlined,
                      'Damage Reason',
                      required: true,
                    ),
                    DropdownButtonFormField<String>(
                      initialValue: _reason,
                      isExpanded: true,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.text,
                      ),
                      decoration: const InputDecoration(
                        isDense: true,
                        contentPadding: EdgeInsets.all(10),
                      ),
                      items: [
                        for (final reason in [
                          'Forklift Damage',
                          'Water Damage',
                          'Transport Damage',
                          'Packaging Damage',
                          'Other',
                        ])
                          DropdownMenuItem(value: reason, child: Text(reason)),
                      ],
                      onChanged: _saving
                          ? null
                          : (v) => setState(() => _reason = v!),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _label(Icons.layers_outlined, 'Stock Action', required: true),
          Row(
            children: [
              for (final entry in [
                (Icons.lock_outline, 'Quarantine', 'Hold for inspection'),
                (
                  Icons.local_shipping_outlined,
                  'Supplier Claim',
                  'Return / Claim',
                ),
                (Icons.delete_outline, 'Write-off', 'Dispose after approval'),
              ])
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 5),
                    child: InkWell(
                      onTap: _saving
                          ? null
                          : () => setState(() => _action = entry.$2),
                      child: Container(
                        height: 88,
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: _action == entry.$2
                              ? AppColors.successLight
                              : Colors.white,
                          border: Border.all(
                            color: _action == entry.$2
                                ? AppColors.success
                                : AppColors.border,
                          ),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(entry.$1, size: 22, color: AppColors.green),
                            const SizedBox(height: 5),
                            Text(
                              entry.$2,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              entry.$3,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 9,
                                color: AppColors.muted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 15),
          _label(Icons.notes, 'Notes'),
          TextField(
            controller: _notes,
            maxLength: 200,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: 'Describe the damage (optional)…',
              hintStyle: TextStyle(fontSize: 12),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 8),
          _label(Icons.camera_alt_outlined, 'Damage Photos * (1–4 photos)'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (var i = 0; i < _photos.length; i++)
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.memory(
                        _photos[i],
                        width: 86,
                        height: 86,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 0,
                      right: 0,
                      child: InkWell(
                        onTap: _saving
                            ? null
                            : () => setState(() => _photos.removeAt(i)),
                        child: const CircleAvatar(
                          radius: 11,
                          backgroundColor: Colors.black54,
                          child: Icon(
                            Icons.close,
                            size: 15,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              if (_photos.length < 4)
                InkWell(
                  onTap: _saving ? null : _photo,
                  child: Container(
                    width: 86,
                    height: 86,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add, size: 25),
                        SizedBox(height: 6),
                        Text('Add Photo', style: TextStyle(fontSize: 11)),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: FilledButton.icon(
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onPressed: _saving ? null : _submit,
          icon: const Icon(Icons.send_outlined, size: 18),
          label: Text(_saving ? 'Saving…' : 'Submit for Approval'),
        ),
      ),
    );
  }
}
