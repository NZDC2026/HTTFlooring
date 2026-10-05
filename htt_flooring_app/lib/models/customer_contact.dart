class CustomerContact {
  const CustomerContact({
    required this.id,
    required this.customerId,
    required this.name,
    required this.jobTitle,
    required this.phone,
    required this.email,
    this.isPrimary = false,
    this.isAccountsContact = false,
  });

  final String id;
  final String customerId;

  final String name;
  final String jobTitle;
  final String phone;
  final String email;

  final bool isPrimary;
  final bool isAccountsContact;

  CustomerContact copyWith({
    String? id,
    String? customerId,
    String? name,
    String? jobTitle,
    String? phone,
    String? email,
    bool? isPrimary,
    bool? isAccountsContact,
  }) {
    return CustomerContact(
      id: id ?? this.id,
      customerId: customerId ?? this.customerId,
      name: name ?? this.name,
      jobTitle: jobTitle ?? this.jobTitle,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      isPrimary: isPrimary ?? this.isPrimary,
      isAccountsContact: isAccountsContact ?? this.isAccountsContact,
    );
  }
}
