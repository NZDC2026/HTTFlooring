class BusinessCardScanResult {
  final String businessName;
  final String contactName;
  final String phone;
  final String email;
  final String website;
  final String address;
  final String rawText;

  const BusinessCardScanResult({
    this.businessName = '',
    this.contactName = '',
    this.phone = '',
    this.email = '',
    this.website = '',
    this.address = '',
    this.rawText = '',
  });
}
