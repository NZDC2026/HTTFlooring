import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';

class PrepareItemScreen extends StatelessWidget {
  const PrepareItemScreen({
    super.key,
    required this.orderId,
    required this.itemId,
  });
  final String orderId;
  final String itemId;

  @override
  Widget build(BuildContext context) {
    final service = context.watch<WarehouseOrderService>();
    final item = service.findItem(orderId, itemId);
    if (item == null) {
      return const Scaffold(body: Center(child: Text('Item not found')));
    }
    final canComplete =
        item.preparedBoxes > 0 && item.preparationPhotos.length >= 2;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Prepare Item')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
        children: [
          Text(
            item.productName,
            style: const TextStyle(
              fontFamily: 'serif',
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 5),
          Text(item.sku, style: const TextStyle(color: AppColors.muted)),
          const SizedBox(height: 26),
          _card(
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'Required Quantity',
                    style: TextStyle(color: AppColors.muted),
                  ),
                ),
                Text(
                  '${item.requiredBoxes} boxes',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.text,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Prepared Quantity',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 10),
          _card(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton.filledTonal(
                  onPressed: item.preparedBoxes <= 0
                      ? null
                      : () => service.setPreparedBoxes(
                          orderId,
                          itemId,
                          item.preparedBoxes - 1,
                        ),
                  icon: const Icon(Icons.remove),
                ),
                const SizedBox(width: 22),
                Text(
                  '${item.preparedBoxes}',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(width: 5),
                const Text('boxes', style: TextStyle(color: AppColors.muted)),
                const SizedBox(width: 22),
                IconButton.filledTonal(
                  onPressed: item.preparedBoxes >= item.requiredBoxes
                      ? null
                      : () => service.setPreparedBoxes(
                          orderId,
                          itemId,
                          item.preparedBoxes + 1,
                        ),
                  icon: const Icon(Icons.add),
                ),
              ],
            ),
          ),
          const SizedBox(height: 26),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Preparation Photos',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.text,
                  ),
                ),
              ),
              Text(
                '${item.preparationPhotos.length}/2 minimum',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: item.preparationPhotos.length >= 2
                      ? AppColors.success
                      : AppColors.copper,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              ...List.generate(
                item.preparationPhotos.length,
                (index) => _photoTile(
                  context,
                  service,
                  item.preparationPhotos[index],
                  index,
                ),
              ),
              _addPhotoTile(context, service),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(13),
            decoration: BoxDecoration(
              color: item.preparationPhotos.length >= 2
                  ? AppColors.successLight
                  : AppColors.warningLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  item.preparationPhotos.length >= 2
                      ? Icons.check_circle_outline
                      : Icons.info_outline,
                  size: 19,
                  color: item.preparationPhotos.length >= 2
                      ? AppColors.success
                      : AppColors.warning,
                ),
                const SizedBox(width: 9),
                Expanded(
                  child: Text(
                    item.preparationPhotos.length >= 2
                        ? 'Photo requirement complete.'
                        : 'At least 2 preparation photos are required.',
                    style: TextStyle(
                      fontSize: 11,
                      color: item.preparationPhotos.length >= 2
                          ? AppColors.success
                          : AppColors.warning,
                    ),
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
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.green,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            onPressed: !canComplete
                ? null
                : () {
                    final ok = service.markItemPrepared(orderId, itemId);
                    if (ok) Navigator.pop(context);
                  },
            icon: const Icon(Icons.check),
            label: const Text('Mark as Prepared'),
          ),
        ),
      ),
    );
  }

  Widget _card({required Widget child}) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border),
    ),
    child: child,
  );

  Widget _addPhotoTile(BuildContext context, WarehouseOrderService service) =>
      InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _pickPhoto(context, service),
        child: Container(
          width: 105,
          height: 105,
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.add_a_photo_outlined, color: AppColors.copper),
              SizedBox(height: 6),
              Text(
                'Add Photo',
                style: TextStyle(
                  fontSize: 10,
                  color: AppColors.copper,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      );

  Widget _photoTile(
    BuildContext context,
    WarehouseOrderService service,
    String path,
    int index,
  ) {
    final file = File(path);
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: file.existsSync()
              ? Image.file(file, width: 105, height: 105, fit: BoxFit.cover)
              : Container(
                  width: 105,
                  height: 105,
                  color: AppColors.successLight,
                  child: const Icon(
                    Icons.image_outlined,
                    color: AppColors.success,
                  ),
                ),
        ),
        Positioned(
          right: 3,
          top: 3,
          child: InkWell(
            onTap: () => service.removePreparationPhoto(orderId, itemId, index),
            child: const CircleAvatar(
              radius: 11,
              backgroundColor: Colors.black54,
              child: Icon(Icons.close, size: 13, color: Colors.white),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _pickPhoto(
    BuildContext context,
    WarehouseOrderService service,
  ) async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined),
              title: const Text('Take Photo'),
              onTap: () => Navigator.pop(sheetContext, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Choose from Library'),
              onTap: () => Navigator.pop(sheetContext, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;
    final image = await picker.pickImage(source: source, imageQuality: 80);
    if (image != null) service.addPreparationPhoto(orderId, itemId, image.path);
  }
}
