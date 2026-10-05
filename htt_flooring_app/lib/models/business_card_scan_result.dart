class BusinessCardScanResult {
  final String businessName;
  final String contactName;
  final String jobTitle;
  final String phone;
  final String email;
  final String website;
  final String address;
  final String abn;
  final String rawText;

  const BusinessCardScanResult({
    this.businessName = '',
    this.contactName = '',
    this.jobTitle = '',
    this.phone = '',
    this.email = '',
    this.website = '',
    this.address = '',
    this.abn = '',
    this.rawText = '',
  });
}
