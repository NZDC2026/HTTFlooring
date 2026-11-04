import 'package:file_selector/file_selector.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../models/customer_note.dart';
import '../services/visit_platform/camera_native.dart'
    if (dart.library.js_interop) '../services/visit_platform/camera_web.dart';
import 'activity_attachment_save.dart'
    if (dart.library.js_interop) 'activity_attachment_save_web.dart';

class ActivityAttachments extends StatefulWidget {
  const ActivityAttachments({
    super.key,
    required this.attachments,
    this.onChanged,
    this.allowFilePicker = true,
  });

  final List<ActivityAttachment> attachments;
  final bool allowFilePicker;
  final ValueChanged<List<ActivityAttachment>>? onChanged;

  @override
  State<ActivityAttachments> createState() => _ActivityAttachmentsState();
}

class _ActivityAttachmentsState extends State<ActivityAttachments> {
  static final _attachmentButtonStyle = OutlinedButton.styleFrom(
    padding: const EdgeInsets.symmetric(horizontal: 10),
    minimumSize: const Size(0, 36),
  );

  bool _picking = false;

  Future<void> _add({ImageSource? source}) async {
    setState(() => _picking = true);
    try {
      final XFile? file;
      if (source == ImageSource.camera) {
        final photo = await captureVisitPhoto(context);
        file = photo == null
            ? null
            : XFile.fromData(
                photo,
                name: 'Photo-${DateTime.now().millisecondsSinceEpoch}.jpg',
              );
      } else {
        file = source == null
            ? await openFile()
            : await ImagePicker().pickImage(source: source, imageQuality: 85);
      }
      if (file == null || !mounted) return;
      if (await file.length() > 10 * 1024 * 1024) {
        throw const FormatException(
          'Each attachment must be 10 MB or smaller.',
        );
      }
      final bytes = await file.readAsBytes();
      if (!mounted) return;
      widget.onChanged!([
        ...widget.attachments,
        ActivityAttachment(
          name: file.name,
          bytes: bytes,
          isPhoto:
              source != null ||
              RegExp(
                r'\.(jpe?g|png|gif|webp|bmp)$',
                caseSensitive: false,
              ).hasMatch(file.name),
        ),
      ]);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            error is FormatException
                ? error.message
                : 'Could not add the attachment.',
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _picking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final editable = widget.onChanged != null;
    if (!editable && widget.attachments.isEmpty) return const SizedBox.shrink();
    final canTakePhoto =
        kIsWeb ||
        defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS;
    final canSave = kIsWeb || !canTakePhoto;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 12),
        Text('Attachments', style: Theme.of(context).textTheme.titleSmall),
        for (final attachment in widget.attachments)
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(
              attachment.isPhoto ? Icons.image_outlined : Icons.attach_file,
            ),
            title: Text(attachment.name),
            onTap: attachment.isPhoto
                ? () => showDialog<void>(
                    context: context,
                    builder: (context) => Dialog(
                      child: InteractiveViewer(
                        child: Image.memory(
                          attachment.bytes,
                          errorBuilder: (_, _, _) => const Padding(
                            padding: EdgeInsets.all(16),
                            child: Text('This photo cannot be previewed.'),
                          ),
                        ),
                      ),
                    ),
                  )
                : canSave
                ? () => saveActivityAttachment(attachment)
                : null,
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (canSave)
                  IconButton(
                    tooltip: 'Download attachment',
                    onPressed: () => saveActivityAttachment(attachment),
                    icon: const Icon(Icons.download_outlined),
                  ),
                if (editable)
                  IconButton(
                    tooltip: 'Remove attachment',
                    onPressed: _picking
                        ? null
                        : () => widget.onChanged!(
                            widget.attachments
                                .where((file) => !identical(file, attachment))
                                .toList(),
                          ),
                    icon: const Icon(Icons.close),
                  ),
              ],
            ),
          ),
        if (editable) ...[
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              if (widget.allowFilePicker)
                OutlinedButton(
                  style: _attachmentButtonStyle,
                  onPressed: _picking ? null : () => _add(),
                  child: const Text('Add File'),
                ),
              OutlinedButton(
                style: _attachmentButtonStyle,
                onPressed: _picking
                    ? null
                    : () => _add(source: ImageSource.gallery),
                child: const Text('Add Photo'),
              ),
              if (canTakePhoto)
                OutlinedButton(
                  style: _attachmentButtonStyle,
                  onPressed: _picking
                      ? null
                      : () => _add(source: ImageSource.camera),
                  child: const Text('Take Photo'),
                ),
            ],
          ),
        ],
      ],
    );
  }
}
