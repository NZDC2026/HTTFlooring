import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class ProductBarcodeScannerScreen extends StatefulWidget {
  const ProductBarcodeScannerScreen({super.key});

  @override
  State<ProductBarcodeScannerScreen> createState() =>
      _ProductBarcodeScannerScreenState();
}

class _ProductBarcodeScannerScreenState
    extends State<ProductBarcodeScannerScreen> {
  bool _returned = false;

  void _onDetect(BarcodeCapture capture) {
    if (_returned || !mounted) return;
    final value = capture.barcodes
        .map((barcode) => barcode.rawValue?.trim())
        .whereType<String>()
        .where((value) => value.isNotEmpty)
        .firstOrNull;
    if (value == null) return;
    _returned = true;
    Navigator.pop(context, value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan Barcode')),
      body: Column(
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('Point the camera at the product barcode.'),
          ),
          Expanded(
            child: MobileScanner(
              onDetect: _onDetect,
              errorBuilder: (context, error) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.camera_alt_outlined, size: 40),
                      const SizedBox(height: 12),
                      const Text(
                        'Camera could not start. Allow camera access in browser or device settings, then try again.',
                        textAlign: TextAlign.center,
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Back to Barcode / SKU Entry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
