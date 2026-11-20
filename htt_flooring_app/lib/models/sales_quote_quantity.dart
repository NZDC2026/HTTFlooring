/// Quantities are requested in area or complete sale units. Flooring is always
/// rounded up to full boxes; this calculation never reserves inventory.
class SalesQuoteQuantity {
  const SalesQuoteQuantity({
    required this.requested,
    required this.count,
    required this.area,
    required this.flooring,
  });
  final double requested, area;
  final int count;
  final bool flooring;
  double get billableQuantity => flooring ? area : count.toDouble();
  static SalesQuoteQuantity? parse(
    String text, {
    required bool flooring,
    required bool boxes,
    double coverage = 0,
  }) {
    final value = double.tryParse(text.trim());
    if (value == null || !value.isFinite || value <= 0 || value > 1000000000) {
      return null;
    }
    if (!flooring || boxes) {
      if (value != value.roundToDouble()) return null;
      if (flooring && (!coverage.isFinite || coverage <= 0)) return null;
      return SalesQuoteQuantity(
        requested: value,
        count: value.toInt(),
        area: flooring ? value * coverage : 0,
        flooring: flooring,
      );
    }
    if (!coverage.isFinite || coverage <= 0) return null;
    final count = (value / coverage - 1e-9).ceil();
    if (count <= 0 || count > 1000000000) return null;
    return SalesQuoteQuantity(
      requested: value,
      count: count,
      area: count * coverage,
      flooring: true,
    );
  }
}
