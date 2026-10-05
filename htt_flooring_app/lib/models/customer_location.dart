import 'sales_user.dart';

enum CustomerLocationType { store, showroom, warehouse, site }

class CustomerLocation {
  const CustomerLocation({
    required this.id,
    required this.customerId,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.region,
    required this.type,
    this.isPrimary = false,
    this.distanceKm = 0,
  });

  final String id;
  final String customerId;

  final String name;
  final String address;

  final double latitude;
  final double longitude;

  final SalesRegion region;
  final CustomerLocationType type;

  final bool isPrimary;

  // Prototype only.
  // Later this will come from the user's real location.
  final double distanceKm;

  String get typeLabel {
    switch (type) {
      case CustomerLocationType.store:
        return 'Store';

      case CustomerLocationType.showroom:
        return 'Showroom';

      case CustomerLocationType.warehouse:
        return 'Warehouse';

      case CustomerLocationType.site:
        return 'Site';
    }
  }
}
