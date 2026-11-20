import 'sales_document.dart';

class CustomerSalesColour {
  const CustomerSalesColour(
    this.name,
    this.sku,
    this.value,
    this.area,
    this.boxes,
  );
  final String name, sku;
  final double value, area;
  final int boxes;
}

class CustomerSalesSeries {
  const CustomerSalesSeries({
    required this.name,
    required this.colours,
    this.previousArea = 0,
    this.previousValue = 0,
  });
  final String name;
  final List<CustomerSalesColour> colours;
  final double previousArea, previousValue;
  double get value => colours.fold(0, (n, c) => n + c.value);
  double get area => colours.fold(0, (n, c) => n + c.area);
  int get boxes => colours.fold(0, (n, c) => n + c.boxes);
}

class CustomerSalesCategory {
  const CustomerSalesCategory(this.name, this.series);
  final String name;
  final List<CustomerSalesSeries> series;
  double get value => series.fold(0, (n, s) => n + s.value);
  double get area => series.fold(0, (n, s) => n + s.area);
  int get boxes => series.fold(0, (n, s) => n + s.boxes);
  double get previousArea => series.fold(0, (n, s) => n + s.previousArea);
  double get previousValue => series.fold(0, (n, s) => n + s.previousValue);
  double metric(String unit) => unit == 'm²'
      ? area
      : unit == 'Boxes'
      ? boxes.toDouble()
      : value;
  List<CustomerSalesSeries> sortedSeries(String unit) => [...series]
    ..sort(
      (a, b) =>
          (unit == 'm²'
                  ? b.area
                  : unit == 'Boxes'
                  ? b.boxes.toDouble()
                  : b.value)
              .compareTo(
                unit == 'm²'
                    ? a.area
                    : unit == 'Boxes'
                    ? a.boxes.toDouble()
                    : a.value,
              ),
    );
}

class CustomerSalesSummary {
  const CustomerSalesSummary({
    required this.categories,
    required this.value,
    required this.area,
    required this.boxes,
    required this.previousValue,
    required this.previousArea,
    required this.previousBoxes,
  });
  final List<CustomerSalesCategory> categories;
  final double value, area, previousValue, previousArea;
  final int boxes, previousBoxes;
  List<CustomerSalesCategory> sorted(String unit) =>
      [...categories]..sort((a, b) => b.metric(unit).compareTo(a.metric(unit)));
  double metric(String unit) => unit == 'm²'
      ? area
      : unit == 'Boxes'
      ? boxes.toDouble()
      : value;
  static String change(double current, double previous) {
    if (previous == 0) return current == 0 ? '—' : 'New';
    final pct = (current / previous - 1) * 100;
    return '${pct < 0 ? 'Down' : 'Up'} ${pct.abs().toStringAsFixed(1)}%';
  }

  factory CustomerSalesSummary.reference(int days) {
    final index = days == 30
        ? 0
        : days == 90
        ? 1
        : 2;
    CustomerSalesSeries series(
      String name,
      String colour,
      String sku,
      List<double> values,
      List<double> areas,
      List<int> boxes,
      List<double> previousAreas, [
      List<double>? previousValues,
    ]) => CustomerSalesSeries(
      name: name,
      colours: [
        CustomerSalesColour(
          colour,
          sku,
          values[index],
          areas[index],
          boxes[index],
        ),
      ],
      previousArea: previousAreas[index],
      previousValue: previousValues?[index] ?? 0,
    );
    final categories = [
      CustomerSalesCategory('Engineered', [
        series(
          'Bonita',
          'Natural Oak',
          'BON-001',
          [11385, 19278.6, 35369.4],
          [165, 279.4, 512.6],
          [75, 127, 233],
          [114.4, 96.8, 0],
        ),
        series(
          'Heritage',
          'Natural Oak',
          'HER-001',
          [2332.8, 2332.8, 10614.24],
          [28.8, 28.8, 131.04],
          [20, 20, 91],
          [0, 0, 0],
        ),
      ]),
      CustomerSalesCategory('Hybrid', [
        series(
          'Guardian',
          'D3016',
          'GUA-016',
          [4180, 6165.5, 19541.5],
          [88, 129.8, 411.4],
          [40, 59, 187],
          [41.8, 61.6, 0],
        ),
      ]),
      CustomerSalesCategory('Laminate', [
        series(
          'AquaGlow',
          'Silver',
          'AQU-002',
          [1355.2, 3484.8, 8615.2],
          [30.8, 79.2, 195.8],
          [14, 36, 89],
          [48.4, 0, 0],
        ),
        series(
          'MTF',
          'White',
          'MTF-001',
          [1323.09, 2866.7, 5733.39],
          [43.38, 93.99, 187.98],
          [18, 39, 78],
          [50.61, 0, 0],
        ),
      ]),
      CustomerSalesCategory('Accessories', [
        series(
          'Scotia',
          'Natural Oak',
          'SCO-01',
          [285, 545, 1605],
          [0, 0, 0],
          [30, 56, 162],
          [0, 0, 0],
          [0, 230, 0],
        ),
      ]),
    ];
    return CustomerSalesSummary(
      categories: categories,
      value: [20861.09, 34673.40, 81478.73][index],
      area: [355.98, 611.19, 1438.82][index],
      boxes: [197, 337, 840][index],
      previousValue: [13555.69, 9837.44, 0.0][index],
      previousArea: [255.21, 158.4, 0.0][index],
      previousBoxes: [114, 95, 0][index],
    );
  }

  factory CustomerSalesSummary.fromInvoices(
    Iterable<SalesDocument> documents, {
    required DateTime today,
    required int days,
  }) {
    final end = DateTime(
      today.year,
      today.month,
      today.day,
    ).add(const Duration(days: 1));
    final start = end.subtract(Duration(days: days));
    final previousStart = start.subtract(Duration(days: days));
    final current = <String, Map<String, Map<String, CustomerSalesColour>>>{};
    final previous = <String, Map<String, (double, double)>>{};
    double value = 0, area = 0, previousValue = 0, previousArea = 0;
    int boxes = 0, previousBoxes = 0;
    for (final doc in documents) {
      if (doc.status != SalesDocumentStatus.invoice) continue;
      final date = doc.invoiceDate ?? doc.createdAt;
      if (date.isBefore(previousStart) || !date.isBefore(end)) continue;
      final isCurrent = !date.isBefore(start);
      for (final line in doc.items) {
        final product = line.product;
        final category = product.category == 'Engineered Timber'
            ? 'Engineered'
            : product.category;
        final suffix = product.colour.trim();
        final name = suffix.isNotEmpty && product.name.endsWith(suffix)
            ? product.name
                  .substring(0, product.name.length - suffix.length)
                  .trim()
                  .replaceFirst(RegExp(r'[–—-]$'), '')
                  .trim()
            : product.name;
        if (!isCurrent) {
          previousValue += line.subtotal;
          previousArea += line.sqm;
          previousBoxes += line.boxes;
          final group = previous.putIfAbsent(category, () => {});
          final old = group[name] ?? (0.0, 0.0);
          group[name] = (old.$1 + line.subtotal, old.$2 + line.sqm);
          continue;
        }
        value += line.subtotal;
        area += line.sqm;
        boxes += line.boxes;
        final group = current
            .putIfAbsent(category, () => {})
            .putIfAbsent(name, () => {});
        final old = group[product.sku];
        group[product.sku] = CustomerSalesColour(
          product.colour,
          product.sku,
          (old?.value ?? 0) + line.subtotal,
          (old?.area ?? 0) + line.sqm,
          (old?.boxes ?? 0) + line.boxes,
        );
      }
    }
    return CustomerSalesSummary(
      categories: [
        for (final cat in current.entries)
          CustomerSalesCategory(cat.key, [
            for (final s in cat.value.entries)
              CustomerSalesSeries(
                name: s.key,
                colours: s.value.values.toList(),
                previousValue: previous[cat.key]?[s.key]?.$1 ?? 0,
                previousArea: previous[cat.key]?[s.key]?.$2 ?? 0,
              ),
          ]),
      ],
      value: value,
      area: area,
      boxes: boxes,
      previousValue: previousValue,
      previousArea: previousArea,
      previousBoxes: previousBoxes,
    );
  }
}
