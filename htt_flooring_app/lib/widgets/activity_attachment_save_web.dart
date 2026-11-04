import 'dart:js_interop';

import 'package:web/web.dart' as web;

import '../models/customer_note.dart';

Future<void> saveActivityAttachment(ActivityAttachment attachment) async {
  final blob = web.Blob([attachment.bytes.toJS].toJS);
  final url = web.URL.createObjectURL(blob);
  web.HTMLAnchorElement()
    ..href = url
    ..download = attachment.name
    ..click();
  await Future<void>.delayed(const Duration(seconds: 1));
  web.URL.revokeObjectURL(url);
}
