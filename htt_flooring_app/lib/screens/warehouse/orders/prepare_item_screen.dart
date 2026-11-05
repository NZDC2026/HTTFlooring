import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../models/warehouse_order_item.dart';
import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';

class PrepareItemScreen extends StatefulWidget {
  const PrepareItemScreen({
    super.key,
    required this.orderId,
    required this.itemId,
  });
  final String orderId;
  final String itemId;

  @override
  State<PrepareItemScreen> createState() => _PrepareItemScreenState();
}

class _PrepareItemScreenState extends State<PrepareItemScreen> {
  bool _confirmed = false;
  bool _reportIssue = false;
  String get orderId => widget.orderId;
  String get itemId => widget.itemId;

  @override
  Widget build(BuildContext context) {
    final service = context.watch<WarehouseOrderService>();
    final order = service.findOrder(orderId);
    if (order == null) {
      return const Scaffold(body: Center(child: Text('Order not found')));
    }
    final checked = order.items.where((i) => i.checksComplete).length;
    final complete =
        _confirmed &&
        !_reportIssue &&
        order.preparationPhotos.length >= 2 &&
        order.items.isNotEmpty &&
        order.items.every((i) => i.checksComplete && i.preparedBoxes > 0);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Verification Checklist')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  order.customerName,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                order.statusLabel,
                style: const TextStyle(color: AppColors.copper),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            '${order.number} · Customer ${order.fulfilmentLabel}',
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
          const SizedBox(height: 14),
          _card(
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Verification Checklist',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                    Text(
                      '$checked / ${order.items.length} Products',
                      style: const TextStyle(color: AppColors.green),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                LinearProgressIndicator(
                  value: order.items.isEmpty ? 0 : checked / order.items.length,
                  minHeight: 6,
                  borderRadius: BorderRadius.circular(6),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Check each item before confirming.',
                  style: TextStyle(fontSize: 12, color: AppColors.muted),
                ),
              ],
            ),
          ),
          for (var index = 0; index < order.items.length; index++) ...[
            const SizedBox(height: 14),
            _item(context, service, order.items[index], index),
          ],
          const SizedBox(height: 14),
          _card(
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Final Confirmation',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 10),
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                  title: const Text(
                    'All items match the order and are ready for release.',
                    style: TextStyle(fontSize: 14),
                  ),
                  value: _confirmed,
                  onChanged: (value) => setState(() {
                    _confirmed = value ?? false;
                    if (_confirmed) _reportIssue = false;
                  }),
                ),
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                  title: const Text(
                    'Report an issue / discrepancy',
                    style: TextStyle(fontSize: 14),
                  ),
                  value: _reportIssue,
                  onChanged: (value) => setState(() {
                    _reportIssue = value ?? false;
                    if (_reportIssue) _confirmed = false;
                  }),
                ),
                if (_reportIssue)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Text(
                      'Verification is on hold. Resolve the issue before confirming release.',
                      style: TextStyle(fontSize: 12, color: AppColors.danger),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _card(
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Divider(),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Overall Preparation Photos',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                    Text(
                      '${order.preparationPhotos.length}/2 minimum',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.copper,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (var i = 0; i < order.preparationPhotos.length; i++)
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: FutureBuilder<Uint8List>(
                              future: XFile(order.preparationPhotos[i])
                                  .readAsBytes(),
                              builder: (context, snapshot) => snapshot.hasData
                                  ? Image.memory(
                                      snapshot.data!,
                                      width: 80,
                                      height: 80,
                                      fit: BoxFit.cover,
                                    )
                                  : const SizedBox(
                                      width: 80,
                                      height: 80,
                                      child: Icon(Icons.image_outlined),
                                    ),
                            ),
                          ),
                          Positioned(
                            right: 0,
                            top: 0,
                            child: IconButton.filledTonal(
                              visualDensity: VisualDensity.compact,
                              iconSize: 16,
                              onPressed: () => service
                                  .removeOrderPreparationPhoto(orderId, i),
                              icon: const Icon(Icons.close),
                            ),
                          ),
                        ],
                      ),
                    OutlinedButton.icon(
                      onPressed: () =>
                          _photo(context, service, ImageSource.camera),
                      icon: const Icon(Icons.camera_alt_outlined),
                      label: const Text('Take Photo'),
                    ),
                    OutlinedButton.icon(
                      onPressed: () =>
                          _photo(context, service, ImageSource.gallery),
                      icon: const Icon(Icons.photo_library_outlined),
                      label: const Text('Upload Photo'),
                    ),
                  ],
                ),
                if (order.preparationPhotos.length < 2)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Text(
                      'Take at least 2 photos showing all prepared goods together.',
                      style: TextStyle(fontSize: 11, color: AppColors.copper),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton.icon(
            onPressed: !complete
                ? null
                : () {
                    for (final item in order.items) {
                      if (!service.markItemPrepared(orderId, item.id)) return;
                    }
                    Navigator.pop(context);
                  },
            icon: const Icon(Icons.check),
            label: const Text('Complete Verification'),
          ),
        ),
      ),
    );
  }

  Widget _item(
    BuildContext context,
    WarehouseOrderService service,
    WarehouseOrderItem item,
    int index,
  ) => _card(
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Item ${index + 1} · ${item.productName}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            Icon(
              item.checksComplete ? Icons.check_circle : Icons.circle,
              size: 18,
              color: item.checksComplete
                  ? AppColors.success
                  : const Color(0xFFA1AAA4),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _field('SKU', item.sku)),
            Expanded(child: _field('Quantity', '${item.requiredBoxes} Boxes')),
          ],
        ),
        const SizedBox(height: 10),
        _field('Batch', 'Not recorded'),
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 10),
          child: Divider(),
        ),
        for (var check = 0; check < 3; check++)
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            dense: true,
            visualDensity: VisualDensity.compact,
            controlAffinity: ListTileControlAffinity.leading,
            title: Text(
              [
                'Correct Product / Colour',
                'Quantity Checked',
                'No Visible Damage',
              ][check],
              style: const TextStyle(fontSize: 14),
            ),
            value: [
              item.productChecked,
              item.quantityChecked,
              item.damageChecked,
            ][check],
            onChanged: (value) => service.setPreparationCheck(
              orderId,
              item.id,
              check,
              value ?? false,
            ),
          ),
        const SizedBox(height: 8),
        Row(
          children: [
            const Expanded(
              child: Text('Prepared Quantity', style: TextStyle(fontSize: 12)),
            ),
            IconButton(
              onPressed: item.preparedBoxes == 0
                  ? null
                  : () => service.setPreparedBoxes(
                      orderId,
                      item.id,
                      item.preparedBoxes - 1,
                    ),
              icon: const Icon(Icons.remove_circle_outline),
            ),
            Text('${item.preparedBoxes} boxes'),
            IconButton(
              onPressed: item.preparedBoxes >= item.requiredBoxes
                  ? null
                  : () => service.setPreparedBoxes(
                      orderId,
                      item.id,
                      item.preparedBoxes + 1,
                    ),
              icon: const Icon(Icons.add_circle_outline),
            ),
          ],
        ),
      ],
    ),
  );

  Widget _field(String label, String value) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(label, style: const TextStyle(fontSize: 10, color: AppColors.muted)),
      const SizedBox(height: 3),
      Text(
        value,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
      ),
    ],
  );
  Widget _card(Widget child) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
    ),
    child: child,
  );
  Future<void> _photo(
    BuildContext context,
    WarehouseOrderService service,
    ImageSource source,
  ) async {
    try {
      final image = await ImagePicker().pickImage(
        source: source,
        imageQuality: 80,
      );
      if (image != null) service.addOrderPreparationPhoto(orderId, image.path);
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Unable to add photo. Please try again.'),
          ),
        );
      }
    }
  }
}
