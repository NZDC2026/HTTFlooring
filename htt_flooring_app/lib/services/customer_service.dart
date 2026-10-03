import 'package:flutter/foundation.dart';

import '../data/mock_data.dart' as mock_data;
import '../models/customer.dart';
import '../models/sales_user.dart';

class CustomerService extends ChangeNotifier {
  CustomerService() : _customers = List<Customer>.from(mock_data.customers);

  final List<Customer> _customers;

  List<Customer> get customers => List.unmodifiable(_customers);

  List<Customer> getCustomersForRegion(SalesRegion region) {
    return _customers.where((customer) => customer.region == region).toList();
  }

  Customer? findById(String id) {
    for (final customer in _customers) {
      if (customer.id == id) {
        return customer;
      }
    }

    return null;
  }

  Customer? findDuplicate({
    required String businessName,
    required String phone,
    required String email,
    required SalesRegion region,
  }) {
    final normalizedBusinessName = _normalizeText(businessName);
    final normalizedPhone = _normalizePhone(phone);
    final normalizedEmail = email.trim().toLowerCase();

    for (final customer in _customers) {
      if (customer.region != region) {
        continue;
      }

      if (normalizedBusinessName.isNotEmpty &&
          _normalizeText(customer.businessName) == normalizedBusinessName) {
        return customer;
      }

      if (normalizedEmail.isNotEmpty &&
          customer.email.trim().toLowerCase() == normalizedEmail) {
        return customer;
      }

      if (normalizedPhone.isNotEmpty &&
          _normalizePhone(customer.phone) == normalizedPhone) {
        return customer;
      }
    }

    return null;
  }

  Customer createCustomer({
    required String businessName,
    required String contactName,
    required String phone,
    required String email,
    required String website,
    required String address,
    required SalesRegion region,
  }) {
    final customer = Customer(
      id: _generateCustomerId(),
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      type: 'Trade Customer',
      region: region,
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim(),
      address: address.trim(),
      abn: '',
      lastOrderDate: null,
      thisMonthOrders: 0,
      lastMonthOrders: 0,
      thisMonthOrderCount: 0,
      outstanding: 0,
      overdue: 0,
      oldestOverdueDays: 0,
      favourite: false,
    );

    _customers.add(customer);
    notifyListeners();

    return customer;
  }

  String _generateCustomerId() {
    return 'customer-${DateTime.now().microsecondsSinceEpoch}';
  }

  String _normalizeText(String value) {
    return value.trim().toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
  }

  String _normalizePhone(String value) {
    return value.replaceAll(RegExp(r'\D'), '');
  }
}
