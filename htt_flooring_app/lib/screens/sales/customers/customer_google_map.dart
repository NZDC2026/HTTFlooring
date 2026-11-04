import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter_platform_interface/google_maps_flutter_platform_interface.dart'
    as web;
import 'package:google_navigation_flutter/google_navigation_flutter.dart'
    as native;

import '../../../models/customer_location.dart';

class CustomerGoogleMap extends StatefulWidget {
  const CustomerGoogleMap({
    super.key,
    required this.center,
    required this.zoom,
    required this.locations,
    required this.onSelect,
  });

  final web.LatLng center;
  final double zoom;
  final List<CustomerLocation> locations;
  final ValueChanged<CustomerLocation> onSelect;

  @override
  State<CustomerGoogleMap> createState() => _CustomerGoogleMapState();
}

class _CustomerGoogleMapState extends State<CustomerGoogleMap> {
  static int _nextMapId = 0;
  late final int _mapId = _nextMapId++;
  StreamSubscription<web.MarkerTapEvent>? _webMarkerTaps;
  final _nativeLocations = <String, CustomerLocation>{};

  @override
  void dispose() {
    _webMarkerTaps?.cancel();
    if (kIsWeb) web.GoogleMapsFlutterPlatform.instance.dispose(mapId: _mapId);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      return web.GoogleMapsFlutterPlatform.instance.buildViewWithConfiguration(
        _mapId,
        (mapId) {
          if (!mounted) return;
          _webMarkerTaps = web.GoogleMapsFlutterPlatform.instance
              .onMarkerTap(mapId: mapId)
              .listen((event) {
                for (final location in widget.locations) {
                  if (location.id == event.value.value) {
                    widget.onSelect(location);
                    break;
                  }
                }
              });
        },
        widgetConfiguration: web.MapWidgetConfiguration(
          initialCameraPosition: web.CameraPosition(
            target: widget.center,
            zoom: widget.zoom,
          ),
          textDirection: Directionality.of(context),
        ),
        mapConfiguration: const web.MapConfiguration(
          webGestureHandling: web.WebGestureHandling.greedy,
        ),
        mapObjects: web.MapObjects(
          markers: {
            for (final location in widget.locations)
              web.Marker(
                markerId: web.MarkerId(location.id),
                position: web.LatLng(location.latitude, location.longitude),
                infoWindow: web.InfoWindow(title: location.name),
              ),
          },
        ),
      );
    }
    return native.GoogleMapsMapView(
      initialCameraPosition: native.CameraPosition(
        target: native.LatLng(
          latitude: widget.center.latitude,
          longitude: widget.center.longitude,
        ),
        zoom: widget.zoom,
      ),
      onViewCreated: (controller) async {
        final markers = await controller.addMarkers([
          for (final location in widget.locations)
            native.MarkerOptions(
              position: native.LatLng(
                latitude: location.latitude,
                longitude: location.longitude,
              ),
              infoWindow: native.InfoWindow(title: location.name),
            ),
        ]);
        for (var index = 0; index < markers.length; index++) {
          if (markers[index] case final marker?) {
            _nativeLocations[marker.markerId] = widget.locations[index];
          }
        }
      },
      onMarkerClicked: (id) {
        if (_nativeLocations[id] case final location?) {
          widget.onSelect(location);
        }
      },
    );
  }
}
