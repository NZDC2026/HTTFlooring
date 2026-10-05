import 'package:flutter/foundation.dart';

import '../models/customer_location.dart';
import '../models/sales_user.dart';

class CustomerLocationService extends ChangeNotifier {
  final List<CustomerLocation> _locations = const [
    CustomerLocation(
      id: 'abc-main',
      customerId: 'abc',
      name: 'ABC Flooring',
      address: '15 George Street, Sydney NSW',
      latitude: -33.8665,
      longitude: 151.2067,
      region: SalesRegion.sydney,
      type: CustomerLocationType.showroom,
      isPrimary: true,
      distanceKm: 2.4,
    ),
    CustomerLocation(
      id: 'timber-main',
      customerId: 'timber',
      name: 'Timber World',
      address: '88 Smith Street, Sydney NSW',
      latitude: -33.8790,
      longitude: 151.2020,
      region: SalesRegion.sydney,
      type: CustomerLocationType.store,
      isPrimary: true,
      distanceKm: 6.8,
    ),
    CustomerLocation(
      id: 'floor-direct-main',
      customerId: 'floor-direct',
      name: 'Floor Direct',
      address: '42 Parramatta Road, Sydney NSW',
      latitude: -33.8870,
      longitude: 151.1770,
      region: SalesRegion.sydney,
      type: CustomerLocationType.showroom,
      isPrimary: true,
      distanceKm: 12.6,
    ),
    CustomerLocation(
      id: 'mel-floor-main',
      customerId: 'mel-floor',
      name: 'Melbourne Flooring Co.',
      address: '120 Collins Street, Melbourne VIC',
      latitude: -37.8140,
      longitude: 144.9633,
      region: SalesRegion.melbourne,
      type: CustomerLocationType.showroom,
      isPrimary: true,
      distanceKm: 4.2,
    ),
  ];

  List<CustomerLocation> get locations => List.unmodifiable(_locations);

  List<CustomerLocation> getForRegion(
    SalesRegion region, {
    double? maxDistanceKm,
  }) {
    final results = _locations.where((location) {
      if (location.region != region) {
        return false;
      }

      if (maxDistanceKm != null && location.distanceKm > maxDistanceKm) {
        return false;
      }

      return true;
    }).toList();

    results.sort((a, b) => a.distanceKm.compareTo(b.distanceKm));

    return results;
  }

  List<CustomerLocation> getForCustomer(String customerId) {
    return _locations
        .where((location) => location.customerId == customerId)
        .toList();
  }
}
