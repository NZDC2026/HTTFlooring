import 'customer.dart';
import 'sales_user.dart';

class CustomerSnapshot {
  const CustomerSnapshot({
    required this.id,
    required this.businessName,
    required this.type,
    required this.region,
    required this.address,
    required this.abn,
  });

  final String id;
  final String businessName;
  final String type;
  final SalesRegion region;
  final String address;
  final String abn;

  factory CustomerSnapshot.fromCustomer(Customer customer) {
    return CustomerSnapshot(
      id: customer.id,
      businessName: customer.businessName,
      type: customer.type,
      region: customer.region,
      address: customer.address,
      abn: customer.abn,
    );
  }
}
