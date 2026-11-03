import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../../../services/visit_backend.dart';
import '../../../services/visit_platform/camera_native.dart'
    if (dart.library.js_interop) '../../../services/visit_platform/camera_web.dart';

class VisitCheckInScreen extends StatefulWidget {
  const VisitCheckInScreen({
    super.key,
    required this.backend,
    required this.branch,
  });

  final VisitBackend backend;
  final JsonObject branch;

  @override
  State<VisitCheckInScreen> createState() => _VisitCheckInScreenState();
}

class _VisitCheckInScreenState extends State<VisitCheckInScreen> {
  static const radiusMetres = 50.0;
  bool _busy = false;
  Uint8List? _photo;
  String? _message;
  bool _staged = false;

  bool get _supportsCamera =>
      kIsWeb ||
      defaultTargetPlatform == TargetPlatform.android ||
      defaultTargetPlatform == TargetPlatform.iOS;

  Future<Position> _verifyLocation() async {
    final latitude = (widget.branch['latitude'] as num).toDouble();
    final longitude = (widget.branch['longitude'] as num).toDouble();
    final position = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        timeLimit: Duration(seconds: 20),
      ),
    );
    final distance = Geolocator.distanceBetween(
      position.latitude,
      position.longitude,
      latitude,
      longitude,
    );
    if (position.isMocked || !distance.isFinite) {
      throw const FormatException('A valid device location is required.');
    }
    if (distance > radiusMetres) {
      throw FormatException(
        'You are ${distance.toStringAsFixed(1)} m away. Move within 50 m.',
      );
    }
    final accuracy = position.accuracy;
    if (!accuracy.isFinite ||
        accuracy < 1 ||
        distance + accuracy > radiusMetres) {
      throw const FormatException(
        'Location accuracy is too low to confirm you are within 50 m. '
        'Move closer or try again with a clearer view of the sky.',
      );
    }
    return position;
  }

  Future<void> _capture() async {
    setState(() {
      _busy = true;
      _message = null;
    });
    try {
      if (!kIsWeb) {
        if (!await Geolocator.isLocationServiceEnabled()) {
          throw const FormatException(
            'Turn on Location Services and try again.',
          );
        }
        var permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
        }
        if (permission == LocationPermission.deniedForever) {
          throw const FormatException(
            'Allow precise location in app settings.',
          );
        }
        if (permission != LocationPermission.always &&
            permission != LocationPermission.whileInUse) {
          throw const FormatException('Location permission is required.');
        }
      }
      await _verifyLocation();
      if (!mounted) return;
      final bytes = await captureVisitPhoto(context);
      if (bytes == null || !mounted) return;
      final position = await _verifyLocation();
      if (!mounted) return;
      await widget.backend.stage(widget.branch, {
        'latitude': double.parse(position.latitude.toStringAsFixed(7)),
        'longitude': double.parse(position.longitude.toStringAsFixed(7)),
        'accuracyMetres': position.accuracy,
        'capturedAt': position.timestamp.toUtc().toIso8601String(),
      }, bytes);
      if (!mounted) return;
      setState(() {
        _photo = bytes;
        _staged = true;
      });
      await _submit();
    } on FormatException catch (error) {
      if (mounted) setState(() => _message = error.message);
    } on TimeoutException {
      if (mounted) setState(() => _message = 'Location timed out. Try again.');
    } catch (_) {
      if (mounted) {
        setState(() {
          _message =
              'Could not verify location or take a photo. '
              'Check location and camera access and try again.';
        });
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _submit() async {
    setState(() {
      _busy = true;
      _message = null;
    });
    try {
      await widget.backend.submitPending();
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) {
        setState(() {
          _message = error is VisitApiException
              ? '$error Photo saved for retry.'
              : 'Could not submit the visit. Photo saved for retry.';
        });
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_busy,
      child: Scaffold(
        appBar: AppBar(title: const Text('Visit Check-in')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              widget.branch['name'] as String,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(visitAddress(widget.branch)),
            const SizedBox(height: 16),
            const Text('Take an on-site photo within 50 m of this address.'),
            if (!_supportsCamera)
              const Text(
                'Use the Android or iOS app, or a browser with camera access.',
              ),
            if (_message case final message?) Text(message),
            if (_photo case final photo?) ...[
              const SizedBox(height: 16),
              Image.memory(photo, height: 240, fit: BoxFit.contain),
            ],
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _busy || !_supportsCamera
                  ? null
                  : (_staged ? _submit : _capture),
              icon: const Icon(Icons.camera_alt_outlined),
              label: Text(
                _busy
                    ? 'Checking…'
                    : _staged
                    ? 'Retry Submission'
                    : 'Take Photo',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
