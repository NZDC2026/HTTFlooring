import 'dart:convert';
import 'dart:js_interop';
import 'dart:math';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:web/web.dart' as web;

Future<Uint8List?> captureVisitPhoto(BuildContext context) async {
  final stream = await web.window.navigator.mediaDevices
      .getUserMedia(
        web.MediaStreamConstraints(
          video: web.MediaTrackConstraints(
            facingMode: web.ConstrainDOMStringParameters(
              ideal: 'environment'.toJS,
            ),
            width: web.ConstrainULongRange(ideal: 1920),
            height: web.ConstrainULongRange(ideal: 1080),
          ),
          audio: false.toJS,
        ),
      )
      .toDart;
  try {
    if (!context.mounted) return null;
    return await showDialog<Uint8List>(
      context: context,
      builder: (_) => _CameraDialog(stream),
    );
  } finally {
    for (final track in stream.getTracks().toDart) {
      track.stop();
    }
  }
}

class _CameraDialog extends StatefulWidget {
  const _CameraDialog(this.stream);

  final web.MediaStream stream;

  @override
  State<_CameraDialog> createState() => _CameraDialogState();
}

class _CameraDialogState extends State<_CameraDialog> {
  web.HTMLVideoElement? _video;
  bool _ready = false;

  void _capture() {
    final video = _video!;
    final scale = min(1.0, 1920 / max(video.videoWidth, video.videoHeight));
    final canvas = web.HTMLCanvasElement()
      ..width = (video.videoWidth * scale).round()
      ..height = (video.videoHeight * scale).round();
    final drawing = canvas.getContext('2d') as web.CanvasRenderingContext2D;
    drawing.drawImage(video, 0, 0, canvas.width, canvas.height);
    final jpeg = canvas.toDataURL('image/jpeg', 0.85.toJS);
    Navigator.of(context).pop(base64Decode(jpeg.split(',').last));
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('On-site Camera'),
      content: SizedBox(
        width: 400,
        height: 250,
        child: HtmlElementView.fromTagName(
          tagName: 'video',
          onElementCreated: (element) {
            final video = element as web.HTMLVideoElement;
            _video = video;
            video
              ..autoplay = true
              ..muted = true
              ..playsInline = true
              ..onplaying = ((web.Event _) {
                if (mounted) setState(() => _ready = video.videoWidth > 0);
              }).toJS
              ..srcObject = widget.stream;
            video.style
              ..width = '100%'
              ..height = '100%'
              ..objectFit = 'contain'
              ..pointerEvents = 'none';
          },
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _ready ? _capture : null,
          child: const Text('Capture'),
        ),
      ],
    );
  }
}
