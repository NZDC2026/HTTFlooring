import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../services/business_card_scanner_service.dart';
import '../../../theme/app_theme.dart';
import 'business_card_review_screen.dart';

class BusinessCardScannerScreen extends StatefulWidget {
  const BusinessCardScannerScreen({super.key});

  @override
  State<BusinessCardScannerScreen> createState() =>
      _BusinessCardScannerScreenState();
}

class _BusinessCardScannerScreenState extends State<BusinessCardScannerScreen> {
  final ImagePicker _picker = ImagePicker();

  final BusinessCardScannerService _scanner = BusinessCardScannerService();

  XFile? _image;

  bool _processing = false;

  Future<void> _pickAndScan(ImageSource source) async {
    if (_processing) {
      return;
    }

    try {
      final image = await _picker.pickImage(
        source: source,
        imageQuality: 95,
        maxWidth: 2400,
      );

      if (image == null || !mounted) {
        return;
      }

      setState(() {
        _image = image;
        _processing = true;
      });

      final result = await _scanner.scanImage(image.path);

      if (!mounted) {
        return;
      }

      setState(() {
        _processing = false;
      });

      if (result.rawText.trim().isEmpty) {
        _showNoTextFound();
        return;
      }

      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => BusinessCardReviewScreen(result: result),
        ),
      );
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _processing = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to scan business card: $error')),
      );
    }
  }

  void _showNoTextFound() {
    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('No text found'),
          content: const Text(
            'Try again with a clearer photo and make sure the entire business card is visible.',
          ),
          actions: [
            FilledButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Scan Business Card')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            const SizedBox(height: 8),

            const Text(
              'Business Card Scanner',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'serif',
                fontSize: 27,
                fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'Take a photo or choose an existing business card image.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.muted,
                fontSize: 13,
                height: 1.45,
              ),
            ),

            const SizedBox(height: 26),

            Container(
              width: double.infinity,
              height: 320,
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                color: AppColors.darkGreen,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (_image != null)
                    Image.file(File(_image!.path), fit: BoxFit.contain)
                  else
                    const _EmptyPreview(),

                  if (_processing)
                    Container(
                      color: Colors.black54,
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(),

                          SizedBox(height: 16),

                          Text(
                            'Reading business card...',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            SizedBox(
              height: 52,
              child: FilledButton.icon(
                onPressed: _processing
                    ? null
                    : () {
                        _pickAndScan(ImageSource.camera);
                      },
                icon: const Icon(Icons.camera_alt_outlined),
                label: const Text('Scan with Camera'),
              ),
            ),

            const SizedBox(height: 10),

            SizedBox(
              height: 52,
              child: OutlinedButton.icon(
                onPressed: _processing
                    ? null
                    : () {
                        _pickAndScan(ImageSource.gallery);
                      },
                icon: const Icon(Icons.photo_library_outlined),
                label: const Text('Choose from Photos'),
              ),
            ),

            const SizedBox(height: 14),

            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.lock_outline, size: 13, color: AppColors.muted),

                SizedBox(width: 5),

                Flexible(
                  child: Text(
                    'Review extracted details before creating a customer.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.muted, fontSize: 10),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyPreview extends StatelessWidget {
  const _EmptyPreview();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 330),
            child: AspectRatio(
              aspectRatio: 1.65,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white70, width: 2),
                ),
                child: const Center(
                  child: Icon(
                    Icons.contact_page_outlined,
                    size: 55,
                    color: Colors.white70,
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 20),

          const Text(
            'Position the entire business card inside the photo',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
