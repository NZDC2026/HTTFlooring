import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../models/business_card_scan_result.dart';
import '../../../services/business_card_scanner_service.dart';
import '../../../services/visit_platform/camera_native.dart'
    if (dart.library.js_interop) '../../../services/visit_platform/camera_web.dart';

class BusinessCardPhotoInput extends StatefulWidget {
  const BusinessCardPhotoInput({super.key, required this.onScanned});

  final ValueChanged<BusinessCardScanResult> onScanned;

  @override
  State<BusinessCardPhotoInput> createState() => _BusinessCardPhotoInputState();
}

class _BusinessCardPhotoInputState extends State<BusinessCardPhotoInput> {
  Uint8List? _cardPhoto;
  bool _readingCard = false;

  Future<void> _addCardPhoto({required bool takePhoto}) async {
    setState(() => _readingCard = true);
    try {
      final photo = takePhoto && kIsWeb
          ? null
          : await ImagePicker().pickImage(
              source: takePhoto ? ImageSource.camera : ImageSource.gallery,
              maxWidth: 2400,
              imageQuality: 90,
            );
      if (!mounted) return;
      final bytes = takePhoto && kIsWeb
          ? await captureVisitPhoto(context)
          : await photo?.readAsBytes();
      if (!mounted || bytes == null) return;
      setState(() => _cardPhoto = bytes);

      if (photo == null ||
          kIsWeb ||
          (defaultTargetPlatform != TargetPlatform.android &&
              defaultTargetPlatform != TargetPlatform.iOS)) {
        return;
      }

      final result = await BusinessCardScannerService().scanImage(photo.path);
      if (!mounted) return;
      widget.onScanned(result);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not read the business card.')),
      );
    } finally {
      if (mounted) setState(() => _readingCard = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            if (kIsWeb ||
                defaultTargetPlatform == TargetPlatform.android ||
                defaultTargetPlatform == TargetPlatform.iOS)
              OutlinedButton.icon(
                onPressed: _readingCard
                    ? null
                    : () => _addCardPhoto(takePhoto: true),
                icon: const Icon(Icons.camera_alt_outlined, size: 18),
                label: const Text('Take Photo'),
              ),
            OutlinedButton.icon(
              onPressed: _readingCard
                  ? null
                  : () => _addCardPhoto(takePhoto: false),
              icon: const Icon(Icons.upload_outlined, size: 18),
              label: const Text('Upload Photo'),
            ),
          ],
        ),
        if (_readingCard) const LinearProgressIndicator(),
        if (_cardPhoto case final photo?) ...[
          const SizedBox(height: 8),
          Image.memory(photo, height: 140, fit: BoxFit.contain),
          if (kIsWeb)
            const Text(
              'Use the card photo as a reference when filling in the details.',
            ),
        ],
      ],
    );
  }
}
