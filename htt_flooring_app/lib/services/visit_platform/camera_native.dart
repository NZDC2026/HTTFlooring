import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

Future<Uint8List?> captureVisitPhoto(BuildContext context) async {
  final file = await ImagePicker().pickImage(
    source: ImageSource.camera,
    maxWidth: 1920,
    maxHeight: 1920,
    imageQuality: 85,
  );
  return file?.readAsBytes();
}
