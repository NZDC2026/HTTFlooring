import 'package:flutter/foundation.dart';

import '../repositories/customer_repository.dart';
import '../data/mock_data.dart' as mock_data;
import '../models/customer.dart';
import '../models/customer_contact.dart';
import '../models/sales_user.dart';

class CustomerService extends ChangeNotifier {
  CustomerService({CustomerRepository? repository})
    : _repository = repository ?? CustomerRepository(),
      _customers = List<Customer>.from(mock_data.customers),
      _contacts = List<CustomerContact>.from(mock_data.customerContacts) {
    _loadPersistedData();
  }

  final CustomerRepository _repository;
  final List<Customer> _customers;
  final List<CustomerContact> _contacts;

  Future<void> _loadPersistedData() async {
    final savedCustomers = await _repository.loadCustomers();

    final savedContacts = await _repository.loadContacts();

    if (savedCustomers != null) {
      _customers
        ..clear()
        ..addAll(savedCustomers);
    }

    if (savedContacts != null) {
      _contacts
        ..clear()
        ..addAll(savedContacts);
    }

    notifyListeners();
  }

  Future<void> _persist() async {
    await _repository.saveAll(customers: _customers, contacts: _contacts);
  }

  List<Customer> get customers =>
      List.unmodifiable(_customers.where((customer) => !customer.archived));

  List<Customer> get archivedCustomers =>
      List.unmodifiable(_customers.where((customer) => customer.archived));

  List<Customer> get allCustomers => List.unmodifiable(_customers);

  List<CustomerContact> get contacts => List.unmodifiable(_contacts);

  List<Customer> getCustomersForRegion(SalesRegion region) {
    return _customers
        .where((customer) => customer.region == region && !customer.archived)
        .toList();
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
    String abn = '',
  }) {
    final normalizedAbn = _normalizeAbn(abn);

    // 1. ABN is the strongest company identifier.
    if (normalizedAbn.isNotEmpty) {
      for (final customer in _customers) {
        if (customer.region != region || customer.archived) {
          continue;
        }

        final customerAbn = _normalizeAbn(customer.abn);

        if (customerAbn.isNotEmpty && customerAbn == normalizedAbn) {
          return customer;
        }
      }
    }

    // 2. Fall back to company name + region.
    final normalizedBusinessName = _normalizeBusinessName(businessName);

    if (normalizedBusinessName.isEmpty) {
      return null;
    }

    for (final customer in _customers) {
      if (customer.region != region || customer.archived) {
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
      archived: false,
      archivedAt: null,
    );

    _customers.add(customer);

    notifyListeners();

    _persist();

    return customer;
  }

  void updateCustomer({
    required String customerId,
    required String businessName,
    required String address,
    required String abn,
  }) {
    final index = _customers.indexWhere(
      (customer) => customer.id == customerId,
    );

    if (index == -1) {
      return;
    }

    final current = _customers[index];

    _customers[index] = Customer(
      id: current.id,
      businessName: businessName.trim(),
      type: current.type,
      region: current.region,
      address: address.trim(),
      abn: abn.trim(),
      lastOrderDate: current.lastOrderDate,
      thisMonthOrders: current.thisMonthOrders,
      lastMonthOrders: current.lastMonthOrders,
      thisMonthOrderCount: current.thisMonthOrderCount,
      outstanding: current.outstanding,
      overdue: current.overdue,
      oldestOverdueDays: current.oldestOverdueDays,
      favourite: current.favourite,
      archived: current.archived,
      archivedAt: current.archivedAt,
    );

    notifyListeners();
    _persist();
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

    _persist();

    return contact;
  }

  void updateContact({
    required String contactId,
    required String name,
    required String jobTitle,
    required String phone,
    required String email,
    required bool isPrimary,
    required bool isAccountsContact,
  }) {
    final index = _contacts.indexWhere((contact) => contact.id == contactId);

    if (index == -1) {
      return;
    }

    final current = _contacts[index];

    if (isPrimary) {
      for (var i = 0; i < _contacts.length; i++) {
        final contact = _contacts[i];

        if (contact.customerId == current.customerId &&
            contact.id != current.id &&
            contact.isPrimary) {
          _contacts[i] = contact.copyWith(isPrimary: false);
        }
      }
    }

    _contacts[index] = current.copyWith(
      name: name.trim(),
      jobTitle: jobTitle.trim(),
      phone: phone.trim(),
      email: email.trim(),
      isPrimary: isPrimary,
      isAccountsContact: isAccountsContact,
    );

    notifyListeners();
    _persist();
  }

  void deleteContact(String contactId) {
    final index = _contacts.indexWhere((contact) => contact.id == contactId);

    if (index == -1) {
      return;
    }

    final deletedContact = _contacts[index];
    final customerId = deletedContact.customerId;
    final wasPrimary = deletedContact.isPrimary;

    _contacts.removeAt(index);

    // If the deleted contact was Primary,
    // automatically promote another contact.
    if (wasPrimary) {
      final remainingContacts = _contacts
          .where((contact) => contact.customerId == customerId)
          .toList();

      if (remainingContacts.isNotEmpty) {
        final replacement = remainingContacts.first;

        final replacementIndex = _contacts.indexWhere(
          (contact) => contact.id == replacement.id,
        );

        if (replacementIndex != -1) {
          _contacts[replacementIndex] = replacement.copyWith(isPrimary: true);
        }
      }
    }

    notifyListeners();
    _persist();
  }

  void archiveCustomer(String customerId) {
    final index = _customers.indexWhere(
      (customer) => customer.id == customerId,
    );

    if (index == -1) {
      return;
    }

    final current = _customers[index];

    if (current.archived) {
      return;
    }

    _customers[index] = Customer(
      id: current.id,
      businessName: current.businessName,
      type: current.type,
      region: current.region,
      address: current.address,
      abn: current.abn,
      lastOrderDate: current.lastOrderDate,
      thisMonthOrders: current.thisMonthOrders,
      lastMonthOrders: current.lastMonthOrders,
      thisMonthOrderCount: current.thisMonthOrderCount,
      outstanding: current.outstanding,
      overdue: current.overdue,
      oldestOverdueDays: current.oldestOverdueDays,
      favourite: current.favourite,
      archived: true,
      archivedAt: DateTime.now(),
    );

    notifyListeners();
    _persist();
  }

  void restoreCustomer(String customerId) {
    final index = _customers.indexWhere(
      (customer) => customer.id == customerId,
    );

    if (index == -1) {
      return;
    }

    final current = _customers[index];

    if (!current.archived) {
      return;
    }

    _customers[index] = Customer(
      id: current.id,
      businessName: current.businessName,
      type: current.type,
      region: current.region,
      address: current.address,
      abn: current.abn,
      lastOrderDate: current.lastOrderDate,
      thisMonthOrders: current.thisMonthOrders,
      lastMonthOrders: current.lastMonthOrders,
      thisMonthOrderCount: current.thisMonthOrderCount,
      outstanding: current.outstanding,
      overdue: current.overdue,
      oldestOverdueDays: current.oldestOverdueDays,
      favourite: current.favourite,
      archived: false,
      archivedAt: null,
    );

    notifyListeners();
    _persist();
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

  String _normalizeAbn(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');

    if (digits.length != 11) {
      return '';
    }

    return digits;
  }

  String _normalizePhone(String value) {
    return value.replaceAll(RegExp(r'\D'), '');
  }
}
