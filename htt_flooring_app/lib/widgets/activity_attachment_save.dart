import 'package:file_selector/file_selector.dart';

import '../models/customer_note.dart';

Future<void> saveActivityAttachment(ActivityAttachment attachment) async {
  final location = await getSaveLocation(suggestedName: attachment.name);
  if (location == null) return;
  await XFile.fromData(
    attachment.bytes,
    name: attachment.name,
  ).saveTo(location.path);
}
