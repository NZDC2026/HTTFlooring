import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter_platform_interface/google_maps_flutter_platform_interface.dart';
import 'package:google_navigation_flutter/google_navigation_flutter.dart'
    show GoogleMapsNavigator;
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../models/customer_location.dart';
import '../../../services/app_session.dart';
import '../../../models/sales_user.dart';
import '../../../services/google_maps_loader.dart'
    if (dart.library.js_interop) '../../../services/google_maps_loader_web.dart';
import '../../../services/customer_location_service.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_session.dart';
import '../../../services/sales_document_service.dart';
import '../../../theme/app_theme.dart';

import 'customer_detail_screen.dart';
import 'customer_google_map.dart';
import 'customer_navigation_screen.dart';
import 'customer_visit_age.dart';
import 'sales_visit_screen.dart';
import 'visit_check_in_screen.dart';

class CustomerMapScreen extends StatefulWidget {
  const CustomerMapScreen({
    super.key,
    this.initialDistanceKm = 20,
    this.customerId,
  });

  final double initialDistanceKm;
  final String? customerId;

  @override
  State<CustomerMapScreen> createState() => _CustomerMapScreenState();
}

class _CustomerMapScreenState extends State<CustomerMapScreen> {
  late double _distanceKm;
  static const _useGoogleMap = false;
  final _mapTransform = TransformationController();
  late final Future<bool> _mapReady = loadGoogleMaps();

  bool _showMap = true;
  bool _openingNavigation = false;

  CustomerLocation? _selectedLocation;

  @override
  void initState() {
    super.initState();

    _distanceKm = widget.initialDistanceKm;
  }

  @override
  void dispose() {
    _mapTransform.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();

    final locationService = context.watch<CustomerLocationService>();

    final regionLocations = locationService.getForRegion(
      session.region,
      maxDistanceKm: _distanceKm,
    );

    final locations = widget.customerId == null
        ? regionLocations
        : regionLocations
              .where((location) => location.customerId == widget.customerId)
              .toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Customers')),
      body: Column(
        children: [
          _topControls(),

          Expanded(
            child: _showMap
                ? _mapView(locations, session.region)
                : _listView(locations),
          ),

          _distanceFilters(),

          if (_selectedLocation case final location?)
            Flexible(
              child: SingleChildScrollView(child: _customerPreview(location)),
            ),
        ],
      ),
    );
  }

  Widget _topControls() {
    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 10),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Expanded(
              child: _viewButton(
                icon: Icons.map_outlined,
                label: 'Map',
                selected: _showMap,
                onTap: () {
                  setState(() {
                    _showMap = true;
                  });
                },
              ),
            ),
            Expanded(
              child: _viewButton(
                icon: Icons.list,
                label: 'List',
                selected: !_showMap,
                onTap: () {
                  setState(() {
                    _showMap = false;
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _viewButton({
    required IconData icon,
    required String label,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(9),
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(vertical: 11),
        decoration: BoxDecoration(
          color: selected ? AppColors.green : Colors.transparent,
          borderRadius: BorderRadius.circular(9),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: selected ? Colors.white : AppColors.muted,
            ),
            const SizedBox(width: 7),
            Text(
              label,
              style: TextStyle(
                color: selected ? Colors.white : AppColors.text,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _mapView(List<CustomerLocation> locations, SalesRegion region) {
    if (!_useGoogleMap) return _schematicMap(locations);

    final focus = locations.firstOrNull;
    final center = focus == null
        ? switch (region) {
            SalesRegion.sydney => const LatLng(-33.8688, 151.2093),
            SalesRegion.melbourne => const LatLng(-37.8136, 144.9631),
          }
        : LatLng(focus.latitude, focus.longitude);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: FutureBuilder<bool>(
          future: _mapReady,
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.data != true) {
              return Center(
                child: OutlinedButton.icon(
                  onPressed: () => launchUrl(
                    Uri.https('www.google.com', '/maps/search/', {
                      'api': '1',
                      'query': '${center.latitude},${center.longitude}',
                    }),
                    mode: LaunchMode.externalApplication,
                  ),
                  icon: const Icon(Icons.map_outlined),
                  label: const Text('Open in Google Maps'),
                ),
              );
            }

            return CustomerGoogleMap(
              key: ValueKey((
                center,
                _distanceKm,
                locations.map((location) => location.id).join(','),
              )),
              center: center,
              zoom: _distanceKm <= 5
                  ? 13
                  : _distanceKm <= 20
                  ? 11
                  : 10,
              locations: locations,
              onSelect: (location) =>
                  setState(() => _selectedLocation = location),
            );
          },
        ),
      ),
    );
  }

  Widget _schematicMap(List<CustomerLocation> locations) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Container(
          width: double.infinity,
          color: const Color(0xFFE8E5DD),
          child: Stack(
            children: [
              Positioned.fill(
                child: LayoutBuilder(
                  builder: (context, constraints) => InteractiveViewer(
                    transformationController: _mapTransform,
                    maxScale: 4,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        const CustomPaint(painter: _MapBackgroundPainter()),
                        const Center(child: _CurrentLocationMarker()),
                        ..._buildMarkers(locations, constraints.biggest),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                right: 14,
                bottom: 14,
                child: FloatingActionButton.small(
                  heroTag: 'customer-map-location',
                  backgroundColor: AppColors.card,
                  foregroundColor: AppColors.green,
                  onPressed: () {
                    _mapTransform.value = Matrix4.identity();
                    setState(() {
                      _selectedLocation = null;
                    });
                  },
                  child: const Icon(Icons.my_location),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  ({String label, Color color}) _lastVisit(CustomerLocation location) {
    return customerVisitAge(
      context.watch<CustomerLocationService>().demoDaysSinceVisit(
        location.customerId,
      ),
      signedIn:
          context.watch<AppSession>().employeeAccessToken?.isNotEmpty == true,
    );
  }

  List<Widget> _buildMarkers(List<CustomerLocation> locations, Size mapSize) {
    final positions = <Offset>[
      const Offset(0.22, 0.25),
      const Offset(0.70, 0.29),
      const Offset(0.25, 0.70),
      const Offset(0.72, 0.68),
      const Offset(0.47, 0.17),
    ];

    return List.generate(locations.length, (index) {
      final location = locations[index];

      final position = positions[index % positions.length];

      return Positioned(
        left: mapSize.width * position.dx - 45,
        top: mapSize.height * position.dy,
        child: _CustomerMarker(
          location: location,
          lastVisit: _lastVisit(location),
          selected: _selectedLocation?.id == location.id,
          onTap: () {
            setState(() {
              _selectedLocation = location;
            });
          },
        ),
      );
    });
  }

  Widget _listView(List<CustomerLocation> locations) {
    if (locations.isEmpty) {
      return const Center(
        child: Text(
          'No customers within this distance.',
          style: TextStyle(color: AppColors.muted),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(18, 4, 18, 16),
      itemCount: locations.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final location = locations[index];

        return InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            setState(() {
              _selectedLocation = location;
            });
          },
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.copperLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.storefront_outlined,
                    color: AppColors.copper,
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        location.name,
                        style: const TextStyle(
                          color: AppColors.text,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        location.address,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '${location.distanceKm.toStringAsFixed(1)} km',
                  style: const TextStyle(
                    color: AppColors.green,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _distanceFilters() {
    const values = [5.0, 10.0, 20.0, 50.0];

    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 12),
      child: Row(
        children: values.map((distance) {
          final selected = _distanceKm == distance;

          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 3),
              child: InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () {
                  setState(() {
                    _distanceKm = distance;
                    _selectedLocation = null;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  decoration: BoxDecoration(
                    color: selected ? AppColors.green : AppColors.card,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: selected ? AppColors.green : AppColors.border,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '${distance.toInt()} km',
                    style: TextStyle(
                      color: selected ? Colors.white : AppColors.text,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _customerPreview(CustomerLocation location) {
    final customers = context.watch<CustomerService>();
    final customer = customers.findById(location.customerId);
    final contact = customers.getPrimaryContact(location.customerId);
    final documents = context.watch<SalesDocumentService>();
    final currency = NumberFormat.simpleCurrency(locale: 'en_AU', name: 'AUD');
    final overdue = customer == null
        ? null
        : documents.getCustomerOverdue(customer.id);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
      decoration: const BoxDecoration(
        color: AppColors.card,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  location.name,
                  style: const TextStyle(
                    color: AppColors.text,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              IconButton(
                onPressed: () {
                  setState(() {
                    _selectedLocation = null;
                  });
                },
                icon: const Icon(Icons.close, size: 20),
              ),
            ],
          ),

          Text(
            location.address,
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),

          const SizedBox(height: 7),

          Row(
            children: [
              _smallBadge(location.typeLabel),
              const SizedBox(width: 8),
              Text(
                '${location.distanceKm.toStringAsFixed(1)} km away',
                style: const TextStyle(
                  color: AppColors.green,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),
          _previewDetail('Primary contact', contact?.name ?? 'Unavailable'),
          if (contact != null) ...[
            if (contact.jobTitle.isNotEmpty)
              _previewDetail('Role', contact.jobTitle),
            if (contact.phone.isNotEmpty)
              _previewDetail('Phone', contact.phone),
            if (contact.email.isNotEmpty)
              _previewDetail('Email', contact.email),
          ],
          _previewDetail(
            'Purchases this month',
            customer == null
                ? 'Unavailable'
                : currency.format(customer.thisMonthOrders),
          ),
          _previewDetail(
            'Purchases last month',
            customer == null
                ? 'Unavailable'
                : currency.format(customer.lastMonthOrders),
          ),
          _previewDetail(
            'Overdue',
            overdue == null ? 'Unavailable' : currency.format(overdue),
            color: AppColors.danger,
          ),
          _previewDetail(
            'Last visit',
            '',
            trailing: VisitAge(visit: _lastVisit(location), fontSize: 12),
          ),
          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () {
                final hasSession =
                    context
                        .read<AppSession>()
                        .employeeAccessToken
                        ?.isNotEmpty ==
                    true;
                Navigator.of(context).push<bool>(
                  MaterialPageRoute(
                    builder: (_) => hasSession
                        ? SalesVisitScreen(initialSearch: location.name)
                        : VisitCheckInScreen.demo(location),
                  ),
                );
              },
              icon: const Icon(Icons.location_on_outlined),
              label: const Text('Check In'),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: FilledButton(
                  onPressed: () {
                    _openCustomer(location);
                  },
                  child: const Text('View Customer'),
                ),
              ),

              const SizedBox(width: 10),

              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    _openDirections(location);
                  },
                  icon: const Icon(Icons.directions_outlined, size: 18),
                  label: const Text('Directions'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _previewDetail(
    String label,
    String value, {
    Color? color,
    Widget? trailing,
  }) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(fontSize: 12, color: color ?? AppColors.muted),
            ),
          ),
          Expanded(
            child:
                trailing ??
                Text(
                  value,
                  textAlign: TextAlign.end,
                  style: TextStyle(fontSize: 12, color: color),
                ),
          ),
        ],
      ),
    );
  }

  Widget _smallBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.copperLight,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.copper,
          fontSize: 10,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  void _openCustomer(CustomerLocation location) {
    final customer = context.read<CustomerService>().findById(
      location.customerId,
    );

    if (customer == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Customer could not be found.')),
      );

      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CustomerDetailScreen(customer: customer),
      ),
    );
  }

  Future<void> _openDirections(CustomerLocation location) async {
    if (_openingNavigation) return;
    if (!kIsWeb && await _mapReady) {
      if (!mounted || _openingNavigation) return;
      _openingNavigation = true;
      try {
        await Navigator.of(context).push<void>(
          MaterialPageRoute(
            builder: (_) => CustomerNavigationScreen(location: location),
          ),
        );
        if (await GoogleMapsNavigator.isInitialized()) {
          await GoogleMapsNavigator.cleanup();
        }
      } finally {
        _openingNavigation = false;
      }
      return;
    }
    final uri = Uri.https('www.google.com', '/maps/dir/', {
      'api': '1',
      'destination': '${location.latitude},${location.longitude}',
    });

    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open directions.')),
      );
    }
  }
}

class _CustomerMarker extends StatelessWidget {
  const _CustomerMarker({
    required this.location,
    required this.selected,
    required this.lastVisit,
    required this.onTap,
  });

  final CustomerLocation location;
  final bool selected;
  final ({String label, Color color}) lastVisit;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            constraints: const BoxConstraints(maxWidth: 105),
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
            decoration: BoxDecoration(
              color: selected ? AppColors.green : AppColors.card,
              borderRadius: BorderRadius.circular(9),
              border: Border.all(
                color: selected ? AppColors.green : AppColors.border,
              ),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 5,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  location.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: selected ? Colors.white : AppColors.text,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                VisitAge(visit: lastVisit, fontSize: 9),
              ],
            ),
          ),
          Icon(
            Icons.location_on,
            color: selected ? AppColors.green : AppColors.copper,
            size: selected ? 36 : 31,
          ),
        ],
      ),
    );
  }
}

class _CurrentLocationMarker extends StatelessWidget {
  const _CurrentLocationMarker();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        color: AppColors.green,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 4),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 7)],
      ),
    );
  }
}

class _MapBackgroundPainter extends CustomPainter {
  const _MapBackgroundPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final roadPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 13
      ..strokeCap = StrokeCap.round;

    final smallRoadPaint = Paint()
      ..color = Colors.white70
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(
      Offset(-20, size.height * 0.25),
      Offset(size.width + 20, size.height * 0.70),
      roadPaint,
    );

    canvas.drawLine(
      Offset(size.width * 0.15, -20),
      Offset(size.width * 0.72, size.height + 20),
      roadPaint,
    );

    canvas.drawLine(
      Offset(-20, size.height * 0.72),
      Offset(size.width + 20, size.height * 0.40),
      smallRoadPaint,
    );

    canvas.drawLine(
      Offset(size.width * 0.72, -20),
      Offset(size.width * 0.35, size.height + 20),
      smallRoadPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return false;
  }
}
