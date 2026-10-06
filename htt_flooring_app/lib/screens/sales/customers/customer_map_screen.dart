import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../models/customer_location.dart';
import '../../../services/customer_location_service.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';

import 'customer_detail_screen.dart';

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

  bool _showMap = true;

  CustomerLocation? _selectedLocation;

  @override
  void initState() {
    super.initState();

    _distanceKm = widget.initialDistanceKm;
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
            child: _showMap ? _mapView(locations) : _listView(locations),
          ),

          _distanceFilters(),

          if (_selectedLocation != null) _customerPreview(_selectedLocation!),
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

  Widget _mapView(List<CustomerLocation> locations) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Container(
          width: double.infinity,
          color: const Color(0xFFE8E5DD),
          child: Stack(
            children: [
              const Positioned.fill(
                child: CustomPaint(painter: _MapBackgroundPainter()),
              ),

              const Positioned(
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                child: Center(child: _CurrentLocationMarker()),
              ),

              ..._buildMarkers(locations),

              Positioned(
                right: 14,
                bottom: 14,
                child: FloatingActionButton.small(
                  heroTag: 'customer-map-location',
                  backgroundColor: AppColors.card,
                  foregroundColor: AppColors.green,
                  onPressed: () {
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

  List<Widget> _buildMarkers(List<CustomerLocation> locations) {
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
        left: MediaQuery.sizeOf(context).width * position.dx - 45,
        top: MediaQuery.sizeOf(context).height * 0.40 * position.dy,
        child: _CustomerMarker(
          location: location,
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

          const SizedBox(height: 16),

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
    required this.onTap,
  });

  final CustomerLocation location;
  final bool selected;
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
            child: Text(
              location.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: selected ? Colors.white : AppColors.text,
                fontSize: 10,
                fontWeight: FontWeight.w700,
              ),
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
