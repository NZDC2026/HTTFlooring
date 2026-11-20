import 'visit_in_progress_screen.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../home/sales_dashboard_support.dart';

import 'dart:async';
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../../services/app_session.dart';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';

import '../../../services/customer_location_service.dart';

import '../../../models/customer_location.dart';
import '../../../services/visit_backend.dart';
import '../../../services/visit_platform/camera_native.dart'
    if (dart.library.js_interop) '../../../services/visit_platform/camera_web.dart';

class VisitCheckInScreen extends StatefulWidget {
  const VisitCheckInScreen({
    super.key,
    required this.backend,
    required this.branch,
  });

  factory VisitCheckInScreen.demo(CustomerLocation location) =>
      VisitCheckInScreen(
        backend: null,
        branch: {
          'customerId': location.customerId,
          'name': location.name,
          'addressLine1': location.address,
          'latitude': location.latitude,
          'longitude': location.longitude,
        },
      );

  final VisitBackend? backend;
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
  bool _submitted = false;
  Position? _capturedPosition;
  double? _distance;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _resumeVisit());
  }

  Future<void> _resumeVisit() async {
    try {
      final user = context.read<AppSession>().currentUser;
      final key = 'active-visit-${user.id}-${widget.branch['customerId']}';
      final raw = (await SharedPreferences.getInstance()).getString(key);
      if (raw == null || !mounted) return;
      final record = jsonDecode(raw) as Map<String, dynamic>;
      final photo = base64Decode(record['checkInPhoto'] as String);
      final started = DateTime.parse(record['started'] as String);
      final saved = await Navigator.push<bool>(
        context,
        MaterialPageRoute(
          builder: (_) => VisitInProgressScreen(
            customerId: widget.branch['customerId'] as String,
            name: widget.branch['name'] as String,
            checkedInAt: started,
            photo: photo,
            demo: widget.backend == null,
          ),
        ),
      );
      if (mounted) Navigator.pop(context, saved);
    } catch (_) {
      // Older or incomplete drafts fall back to verified check-in.
    }
  }

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
    if (mounted) setState(() => _distance = distance);
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
      final backend = widget.backend;
      _capturedPosition = position;
      if (backend == null) {
        setState(() {
          _photo = bytes;
          _message = null;
        });
        return;
      }
      await backend.stage(widget.branch, {
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
      if (!_submitted) {
        await widget.backend!.submitPending();
        _submitted = true;
      }
      if (mounted) await _openVisit();
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

  Future<void> _finish() async {
    if (_photo == null || _capturedPosition == null || _busy) return;
    if (widget.backend != null) {
      await _submit();
      return;
    }
    setState(() => _busy = true);
    try {
      await context.read<CustomerLocationService>().recordDemoVisit(
        widget.branch['customerId'] as String,
        _capturedPosition!.timestamp,
      );
      if (mounted) await _openVisit();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _openVisit() async {
    final saved = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => VisitInProgressScreen(
          customerId: widget.branch['customerId'] as String,
          name: widget.branch['name'] as String,
          checkedInAt: _capturedPosition!.timestamp,
          photo: _photo!,
          demo: widget.backend == null,
        ),
      ),
    );
    if (mounted && saved == true) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.branch['name'] as String;
    final initials = name
        .split(' ')
        .where((w) => w.isNotEmpty)
        .take(2)
        .map((w) => w[0])
        .join();
    return PopScope(
      canPop: !_busy,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: dashboardBar('Check in'),
        body: ListView(
          padding: const EdgeInsets.all(14),
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: detailPale,
                  child: Text(
                    initials,
                    style: const TextStyle(
                      fontSize: 16,
                      color: detailGreen,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 5),
                      const Text(
                        'Trade Customer',
                        style: TextStyle(fontSize: 12, color: detailMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const DetailGlyph('pin', size: 16, color: detailMuted),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    visitAddress(widget.branch),
                    style: const TextStyle(
                      fontSize: 12,
                      color: detailMuted,
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            detailCard(
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    const DetailGlyph('pin', size: 19),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _distance == null
                                ? 'Verify your location on site'
                                : "You're ${_distance!.round()} m from $name",
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            _distance == null
                                ? 'Camera capture checks your location within ${radiusMetres.round()} m.'
                                : 'Within ${radiusMetres.round()} m · location confirmed',
                            style: const TextStyle(
                              fontSize: 11,
                              color: detailMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: const Color(0xFFF7F9F7),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: detailLine),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Row(
                    children: [
                      DetailGlyph('camera', size: 22),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Take an on-site photo',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(height: 5),
                            Text(
                              'Camera only · stamped with time and location',
                              style: TextStyle(
                                fontSize: 11,
                                color: detailMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (_photo != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.memory(
                        _photo!,
                        height: 210,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _capturedPosition?.timestamp.toLocal().toString() ?? '',
                      style: const TextStyle(fontSize: 10, color: detailMuted),
                    ),
                    const SizedBox(height: 10),
                  ],
                  detailAction(
                    _busy
                        ? 'Checking…'
                        : _photo == null
                        ? 'Open camera'
                        : 'Retake photo',
                    'camera',
                    _busy || !_supportsCamera ? null : _capture,
                  ),
                ],
              ),
            ),
            if (_message != null)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Text(
                  _message!,
                  style: const TextStyle(fontSize: 12, color: Colors.red),
                ),
              ),
            const SizedBox(height: 20),
            detailAction(
              _busy
                  ? 'Checking…'
                  : _staged && _message != null
                  ? 'Retry check-in'
                  : 'Check in',
              'pin',
              _busy || _photo == null ? null : _finish,
              filled: true,
            ),
            const SizedBox(height: 14),
            const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DetailGlyph('clock', size: 14, color: detailMuted),
                SizedBox(width: 7),
                Expanded(
                  child: Text(
                    "No signal? The photo and capture time stay on this phone. Retry check-in when you're back online.",
                    style: TextStyle(
                      fontSize: 11,
                      color: detailMuted,
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
            if (widget.backend == null)
              const Padding(
                padding: EdgeInsets.only(top: 10),
                child: Text(
                  'Demo check-in stays on this device.',
                  style: TextStyle(fontSize: 10, color: detailMuted),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
