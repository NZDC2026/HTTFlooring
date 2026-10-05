import 'package:flutter/foundation.dart';

import '../data/mock_data.dart' as mock_data;
import '../models/customer.dart';
import '../models/customer_contact.dart';
import '../models/sales_user.dart';

class CustomerService extends ChangeNotifier {
  CustomerService()
    : _customers = List<Customer>.from(mock_data.customers),
      _contacts = List<CustomerContact>.from(mock_data.customerContacts);

  final List<Customer> _customers;
  final List<CustomerContact> _contacts;

  List<Customer> get customers => List.unmodifiable(_customers);

  List<CustomerContact> get contacts => List.unmodifiable(_contacts);

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

  Customer? findMatchingCustomer({
    required String businessName,
    required SalesRegion region,
  }) {
    final normalizedBusinessName = _normalizeBusinessName(businessName);

    if (normalizedBusinessName.isEmpty) {
      return null;
    }

    for (final customer in _customers) {
      if (customer.region != region) {
        continue;
      }

      if (_normalizeBusinessName(customer.businessName) ==
          normalizedBusinessName) {
        return customer;
      }
    }

    return null;
  }

  Customer createCustomer({
    required String businessName,
    required String address,
    required String abn,
    required SalesRegion region,
  }) {
    final customer = Customer(
      id: _generateCustomerId(),
      businessName: businessName.trim(),
      type: 'Trade Customer',
      region: region,
      address: address.trim(),
      abn: abn.trim(),
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

  List<CustomerContact> getContactsForCustomer(String customerId) {
    final results = _contacts
        .where((contact) => contact.customerId == customerId)
        .toList();

    results.sort((a, b) {
      if (a.isPrimary != b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }

      if (a.isAccountsContact != b.isAccountsContact) {
        return a.isAccountsContact ? -1 : 1;
      }

      return a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });

    return results;
  }

  CustomerContact? getPrimaryContact(String customerId) {
    final contacts = getContactsForCustomer(customerId);

    for (final contact in contacts) {
      if (contact.isPrimary) {
        return contact;
      }
    }

    return contacts.isEmpty ? null : contacts.first;
  }

  CustomerContact? getAccountsContact(String customerId) {
    final contacts = getContactsForCustomer(customerId);

    for (final contact in contacts) {
      if (contact.isAccountsContact) {
        return contact;
      }
    }

    return null;
  }

  CustomerContact? findContactDuplicate({
    required String customerId,
    required String phone,
    required String email,
  }) {
    final normalizedEmail = email.trim().toLowerCase();

    final normalizedPhone = _normalizePhone(phone);

    for (final contact in _contacts) {
      if (contact.customerId != customerId) {
        continue;
      }

      if (normalizedEmail.isNotEmpty &&
          contact.email.trim().toLowerCase() == normalizedEmail) {
        return contact;
      }

      if (normalizedPhone.isNotEmpty &&
          _normalizePhone(contact.phone) == normalizedPhone) {
        return contact;
      }
    }

    return null;
  }

  CustomerContact addContact({
    required String customerId,
    required String name,
    required String jobTitle,
    required String phone,
    required String email,
    bool isPrimary = false,
    bool isAccountsContact = false,
  }) {
    final existingContacts = getContactsForCustomer(customerId);

    final shouldBePrimary = existingContacts.isEmpty || isPrimary;

    if (shouldBePrimary) {
      for (var i = 0; i < _contacts.length; i++) {
        final contact = _contacts[i];

        if (contact.customerId == customerId && contact.isPrimary) {
          _contacts[i] = contact.copyWith(isPrimary: false);
        }
      }
    }

    final contact = CustomerContact(
      id: _generateContactId(),
      customerId: customerId,
      name: name.trim(),
      jobTitle: jobTitle.trim(),
      phone: phone.trim(),
      email: email.trim(),
      isPrimary: shouldBePrimary,
      isAccountsContact: isAccountsContact,
    );

    _contacts.add(contact);

    notifyListeners();

    return contact;
  }

  bool customerMatchesSearch(Customer customer, String query) {
    final normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.isEmpty) {
      return true;
    }

    if (customer.businessName.toLowerCase().contains(normalizedQuery) ||
        customer.address.toLowerCase().contains(normalizedQuery) ||
        customer.abn.toLowerCase().contains(normalizedQuery)) {
      return true;
    }

    final contacts = getContactsForCustomer(customer.id);

    return contacts.any(
      (contact) =>
          contact.name.toLowerCase().contains(normalizedQuery) ||
          contact.email.toLowerCase().contains(normalizedQuery) ||
          contact.phone.toLowerCase().contains(normalizedQuery),
    );
  }

  String _generateCustomerId() {
    return 'customer-${DateTime.now().microsecondsSinceEpoch}';
  }

  String _generateContactId() {
    return 'contact-${DateTime.now().microsecondsSinceEpoch}';
  }

  String _normalizeBusinessName(String value) {
    return value
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'\s+'), ' ')
        .replaceAll(RegExp(r'[^\w\s]'), '');
  }

  String _normalizePhone(String value) {
    return value.replaceAll(RegExp(r'\D'), '');
  }
}
