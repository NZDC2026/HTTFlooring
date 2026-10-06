import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../models/customer_return_item.dart';
import '../../../services/customer_return_service.dart';
import '../../../theme/app_theme.dart';
import 'return_submitted_screen.dart';

class CreateCustomerReturnScreen extends StatefulWidget {
  const CreateCustomerReturnScreen({super.key});

  @override
  State<CreateCustomerReturnScreen> createState() =>
      _CreateCustomerReturnScreenState();
}

class _CreateCustomerReturnScreenState
    extends State<CreateCustomerReturnScreen> {
  static const _customers = <(String, String)>[
    ('abc', 'ABC Flooring'),
    ('harbour', 'Harbour Floors'),
    ('metro', 'Metro Flooring'),
  ];
  static const _products = <(String, String, String)>[
    ('bonita', 'Bonita Oak', 'BON-OAK'),
    ('guardian', 'Guardian Hybrid', 'GUA-HYB'),
    ('aquaglow', 'AquaGlow Laminate', 'AQU-LAM'),
  ];

  final _picker = ImagePicker();
  final _reasonController = TextEditingController();
  String _customerId = 'abc';
  String _productId = 'bonita';
  int _quantity = 1;
  ReturnItemCondition _condition = ReturnItemCondition.good;
  final List<String> _photos = [];
  final List<CustomerReturnItem> _items = [];

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _addPhoto(ImageSource source) async {
    final image = await _picker.pickImage(source: source, imageQuality: 75);
    if (image == null || !mounted) return;
    setState(() => _photos.add(image.path));
  }

  void _addItem() {
    if (_reasonController.text.trim().isEmpty || _photos.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add a reason and at least 2 photos.')),
      );
      return;
    }
    final product = _products.firstWhere((item) => item.$1 == _productId);
    setState(() {
      _items.add(
        CustomerReturnItem(
          productId: product.$1,
          productName: product.$2,
          sku: product.$3,
          quantity: _quantity,
          reason: _reasonController.text.trim(),
          condition: _condition,
          photoPaths: List.unmodifiable(_photos),
        ),
      );
      _quantity = 1;
      _condition = ReturnItemCondition.good;
      _reasonController.clear();
      _photos.clear();
    });
  }

  void _submit() {
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add at least one return item.')),
      );
      return;
    }
    final customer = _customers.firstWhere((item) => item.$1 == _customerId);
    final result = CustomerReturnService.instance.submit(
      customerId: customer.$1,
      customerName: customer.$2,
      items: _items,
    );
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => ReturnSubmittedScreen(customerReturn: result),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Create Customer Return')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _section(
            'Customer',
            DropdownButtonFormField<String>(
              initialValue: _customerId,
              items: _customers
                  .map((c) => DropdownMenuItem(value: c.$1, child: Text(c.$2)))
                  .toList(),
              onChanged: (value) =>
                  setState(() => _customerId = value ?? _customerId),
            ),
          ),
          _section(
            'Return Item',
            Column(
              children: [
                DropdownButtonFormField<String>(
                  initialValue: _productId,
                  items: _products
                      .map(
                        (p) => DropdownMenuItem(
                          value: p.$1,
                          child: Text('${p.$2} · ${p.$3}'),
                        ),
                      )
                      .toList(),
                  onChanged: (value) =>
                      setState(() => _productId = value ?? _productId),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Return Quantity',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                    IconButton(
                      onPressed: _quantity > 1
                          ? () => setState(() => _quantity--)
                          : null,
                      icon: const Icon(Icons.remove_circle_outline),
                    ),
                    Text(
                      '$_quantity',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    IconButton(
                      onPressed: () => setState(() => _quantity++),
                      icon: const Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                TextField(
                  controller: _reasonController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Reason for return',
                  ),
                ),
                const SizedBox(height: 16),
                SegmentedButton<ReturnItemCondition>(
                  segments: const [
                    ButtonSegment(
                      value: ReturnItemCondition.good,
                      label: Text('Good'),
                    ),
                    ButtonSegment(
                      value: ReturnItemCondition.damaged,
                      label: Text('Damaged'),
                    ),
                  ],
                  selected: {_condition},
                  onSelectionChanged: (value) =>
                      setState(() => _condition = value.first),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Photos · minimum 2',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                    Text(
                      '${_photos.length}/2',
                      style: TextStyle(
                        color: _photos.length >= 2
                            ? AppColors.success
                            : AppColors.warning,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (_photos.isNotEmpty)
                  SizedBox(
                    height: 82,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _photos.length,
                      separatorBuilder: (_, _) => const SizedBox(width: 8),
                      itemBuilder: (context, index) => ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.file(
                          File(_photos[index]),
                          width: 82,
                          height: 82,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _addPhoto(ImageSource.camera),
                        icon: const Icon(Icons.camera_alt_outlined),
                        label: const Text('Camera'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _addPhoto(ImageSource.gallery),
                        icon: const Icon(Icons.photo_library_outlined),
                        label: const Text('Gallery'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.tonal(
                    onPressed: _addItem,
                    child: const Text('Add Return Item'),
                  ),
                ),
              ],
            ),
          ),
          if (_items.isNotEmpty)
            _section(
              'Items to Submit',
              Column(
                children: _items.asMap().entries.map((entry) {
                  final item = entry.value;
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      item.productName,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      '${item.quantity} · ${item.conditionLabel} · ${item.photoPaths.length} photos',
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () =>
                          setState(() => _items.removeAt(entry.key)),
                    ),
                  );
                }).toList(),
              ),
            ),
          const SizedBox(height: 8),
          SizedBox(
            height: 52,
            child: FilledButton(
              onPressed: _items.isEmpty ? null : _submit,
              child: const Text('Submit to Front Desk'),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _section(String title, Widget child) => Container(
    margin: const EdgeInsets.only(bottom: 16),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(18),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: AppColors.text,
          ),
        ),
        const SizedBox(height: 14),
        child,
      ],
    ),
  );
}
