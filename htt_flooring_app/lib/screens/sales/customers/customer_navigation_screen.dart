import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_navigation_flutter/google_navigation_flutter.dart';

import '../../../models/customer_location.dart';

class CustomerNavigationScreen extends StatefulWidget {
  const CustomerNavigationScreen({super.key, required this.location});

  final CustomerLocation location;

  @override
  State<CustomerNavigationScreen> createState() =>
      _CustomerNavigationScreenState();
}

class _CustomerNavigationScreenState extends State<CustomerNavigationScreen> {
  bool _ready = false;
  bool _busy = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _prepare();
    });
  }

  Future<void> _prepare() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        throw const FormatException('Turn on Location Services to navigate.');
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission != LocationPermission.always &&
          permission != LocationPermission.whileInUse) {
        throw const FormatException('Allow location access to navigate.');
      }
      if (!await GoogleMapsNavigator.areTermsAccepted() &&
          !await GoogleMapsNavigator.showTermsAndConditionsDialog(
            'Google Maps Navigation',
            'HTT Flooring',
          )) {
        throw const FormatException('Accept the navigation terms to continue.');
      }
      await GoogleMapsNavigator.initializeNavigationSession();
      if (mounted) setState(() => _ready = true);
    } on FormatException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Unable to initialize navigation.');
    } finally {
      if (mounted && !_ready) setState(() => _busy = false);
    }
  }

  Future<void> _start(GoogleNavigationViewController controller) async {
    try {
      final location = widget.location;
      final status = await GoogleMapsNavigator.setDestinations(
        Destinations(
          displayOptions: NavigationDisplayOptions(
            showDestinationMarkers: true,
          ),
          waypoints: [
            NavigationWaypoint.withLatLngTarget(
              title: location.name,
              target: LatLng(
                latitude: location.latitude,
                longitude: location.longitude,
              ),
            ),
          ],
        ),
      );
      if (status != NavigationRouteStatus.statusOk) {
        throw const FormatException(
          'No driving route is available from your current location.',
        );
      }
      await GoogleMapsNavigator.setAudioGuidance(
        NavigationAudioGuidanceSettings(
          guidanceType: NavigationAudioGuidanceType.alertsAndGuidance,
        ),
      );
      await GoogleMapsNavigator.startGuidance();
      await controller.followMyLocation(CameraPerspective.tilted);
    } on FormatException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Unable to start guidance.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_busy,
      child: Scaffold(
        appBar: AppBar(title: Text(widget.location.name)),
        body: Stack(
          fit: StackFit.expand,
          children: [
            if (_ready)
              GoogleMapsNavigationView(
                onViewCreated: _start,
                initialNavigationUIEnabledPreference:
                    NavigationUIEnabledPreference.automatic,
              ),
            if (_busy) const Center(child: CircularProgressIndicator()),
            if (_error case final error?)
              Align(
                alignment: Alignment.center,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(error),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
