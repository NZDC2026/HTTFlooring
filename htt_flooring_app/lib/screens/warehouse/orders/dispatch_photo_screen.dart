import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../models/warehouse_order.dart';
import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';

class DispatchPhotoScreen extends StatefulWidget {
  const DispatchPhotoScreen({super.key, required this.orderId});

  final String orderId;

  @override
  State<DispatchPhotoScreen> createState() => _DispatchPhotoScreenState();
}

class _DispatchPhotoScreenState extends State<DispatchPhotoScreen> {
  final _picker = ImagePicker();
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _addPhoto(ImageSource source) async {
    final image = await _picker.pickImage(
      source: source,
      imageQuality: 80,
      maxWidth: 1600,
    );
    if (image == null || !mounted) {
      return;
    }
    context.read<WarehouseOrderService>().addDispatchPhoto(
      widget.orderId,
      image.path,
    );
  }

  void _showPhotoSource() {
    showModalBottomSheet<void>(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined),
              title: const Text('Take Photo'),
              onTap: () {
                Navigator.pop(sheetContext);
                _addPhoto(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Choose from Library'),
              onTap: () {
                Navigator.pop(sheetContext);
                _addPhoto(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final service = context.watch<WarehouseOrderService>();
    final order = service.findOrder(widget.orderId);

    if (order == null) {
      return const Scaffold(body: Center(child: Text('Order not found')));
    }

    final completed = order.status == WarehouseOrderStatus.completed;
    final canComplete = order.hasMinimumDispatchPhotos && !completed;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Dispatched Photos')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
        children: [
          Text(
            order.number,
            style: const TextStyle(
              color: AppColors.copper,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            order.customerName,
            style: const TextStyle(
              color: AppColors.text,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '${order.fulfilmentLabel} · ${order.collectedBy}',
            style: const TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 24),
          const Text(
            'Dispatch Photos',
            style: TextStyle(
              color: AppColors.text,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '${order.dispatchPhotos.length}/2 minimum photos added',
            style: TextStyle(
              color: order.hasMinimumDispatchPhotos
                  ? AppColors.success
                  : AppColors.copper,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.25,
            ),
            itemCount: order.dispatchPhotos.length + (completed ? 0 : 1),
            itemBuilder: (context, index) {
              if (index == order.dispatchPhotos.length) {
                return InkWell(
                  borderRadius: BorderRadius.circular(14),
                  onTap: _showPhotoSource,
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.add_a_photo_outlined,
                          color: AppColors.green,
                          size: 30,
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Add Photo',
                          style: TextStyle(
                            color: AppColors.green,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }

              final path = order.dispatchPhotos[index];
              return ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.file(
                      File(path),
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => Container(
                        color: AppColors.copperLight,
                        child: const Icon(
                          Icons.image_outlined,
                          color: AppColors.copper,
                        ),
                      ),
                    ),
                    if (!completed)
                      Positioned(
                        top: 6,
                        right: 6,
                        child: IconButton.filled(
                          visualDensity: VisualDensity.compact,
                          onPressed: () =>
                              service.removeDispatchPhoto(order.id, index),
                          icon: const Icon(Icons.close, size: 18),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 22),
          TextField(
            controller: _notesController,
            enabled: !completed,
            maxLines: 4,
            decoration: InputDecoration(
              labelText: 'Dispatch Notes',
              hintText: 'Optional notes about pickup or dispatch...',
              filled: true,
              fillColor: AppColors.card,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
          if (completed) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.successLight,
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle, color: AppColors.success),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Order Completed',
                      style: TextStyle(
                        color: AppColors.success,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
      bottomNavigationBar: completed
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.green,
                    disabledBackgroundColor: AppColors.border,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: canComplete
                      ? () {
                          final success = service.markCompleted(
                            order.id,
                            notes: _notesController.text,
                          );
                          if (!success) {
                            return;
                          }
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${order.number} completed.'),
                            ),
                          );
                          Navigator.popUntil(context, (route) => route.isFirst);
                        }
                      : null,
                  icon: const Icon(Icons.check_circle_outline),
                  label: Text(
                    order.hasMinimumDispatchPhotos
                        ? 'Mark as Completed'
                        : 'Add at least 2 photos',
                  ),
                ),
              ),
            ),
    );
  }
}
