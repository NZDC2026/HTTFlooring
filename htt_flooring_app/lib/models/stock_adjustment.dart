enum StockAdjustmentStatus { pending, approved, rejected }

class StockAdjustmentLine {
  const StockAdjustmentLine({
    required this.productId,
    required this.productName,
    required this.sku,
    required this.systemBoxes,
    required this.actualBoxes,
  });

  final String productId;
  final String productName;
  final String sku;
  final int systemBoxes;
  final int actualBoxes;

  int get differenceBoxes => actualBoxes - systemBoxes;
}

class StockAdjustment {
  const StockAdjustment({
    required this.id,
    required this.region,
    required this.createdAt,
    required this.lines,
    this.status = StockAdjustmentStatus.pending,
  });

  final String id;
  final String region;
  final DateTime createdAt;
  final List<StockAdjustmentLine> lines;
  final StockAdjustmentStatus status;

  int get totalDifference =>
      lines.fold(0, (total, line) => total + line.differenceBoxes);
}
