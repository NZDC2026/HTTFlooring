import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/customer.dart';
import '../models/customer_contact.dart';

class CustomerRepository {
  static const String _customersKey = 'htt_customers';

  static const String _contactsKey = 'htt_customer_contacts';

  Future<List<Customer>?> loadCustomers() async {
    final preferences = await SharedPreferences.getInstance();

    final rawJson = preferences.getString(_customersKey);

    if (rawJson == null) {
      return null;
    }

    try {
      final decoded = jsonDecode(rawJson);

      if (decoded is! List) {
        return null;
      }

      return decoded
          .map(
            (item) => Customer.fromJson(Map<String, dynamic>.from(item as Map)),
          )
          .toList();
    } catch (_) {
      return null;
    }
  }

  Future<List<CustomerContact>?> loadContacts() async {
    final preferences = await SharedPreferences.getInstance();

    final rawJson = preferences.getString(_contactsKey);

    if (rawJson == null) {
      return null;
    }

    try {
      final decoded = jsonDecode(rawJson);

      if (decoded is! List) {
        return null;
      }

      return decoded
          .map(
            (item) => CustomerContact.fromJson(
              Map<String, dynamic>.from(item as Map),
            ),
          )
          .toList();
    } catch (_) {
      return null;
    }
  }

  Future<void> saveCustomers(List<Customer> customers) async {
    final preferences = await SharedPreferences.getInstance();

    final encoded = jsonEncode(
      customers.map((customer) => customer.toJson()).toList(),
    );

    await preferences.setString(_customersKey, encoded);
  }

  Future<void> saveContacts(List<CustomerContact> contacts) async {
    final preferences = await SharedPreferences.getInstance();

    final encoded = jsonEncode(
      contacts.map((contact) => contact.toJson()).toList(),
    );

    await preferences.setString(_contactsKey, encoded);
  }

  Future<void> saveAll({
    required List<Customer> customers,
    required List<CustomerContact> contacts,
  }) async {
    await saveCustomers(customers);
    await saveContacts(contacts);
  }

  Future<void> clear() async {
    final preferences = await SharedPreferences.getInstance();

    await preferences.remove(_customersKey);
    await preferences.remove(_contactsKey);
  }
}
