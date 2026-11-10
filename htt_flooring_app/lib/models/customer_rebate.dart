class CustomerRebate {
  const CustomerRebate({
    required this.customerId,
    required this.number,
    required this.productName,
    required this.sku,
    required this.minimumQuantity,
    required this.settledQuantity,
    required this.rate,
    required this.cycle,
    required this.starts,
    required this.ends,
    required this.settledOn,
  });
  final String customerId,
      number,
      productName,
      sku,
      cycle,
      starts,
      ends,
      settledOn;
  final double minimumQuantity, settledQuantity, rate;
  int get amountCents => (settledQuantity * rate * 100).round();
  static List<CustomerRebate> filter(
    Iterable<CustomerRebate> records,
    String customerId, {
    String query = '',
    String cycle = 'All Cycles',
  }) {
    final q = query.trim().toLowerCase();
    return records
        .where(
          (r) =>
              r.customerId == customerId &&
              (cycle == 'All Cycles' || r.cycle == cycle) &&
              '${r.number} ${r.productName} ${r.sku}'.toLowerCase().contains(q),
        )
        .toList()
      ..sort((a, b) => b.settledOn.compareTo(a.settledOn));
  }
}
