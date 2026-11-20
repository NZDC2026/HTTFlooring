import '../../../data/mock_data.dart' as catalog;
import '../../../models/product.dart';
import '../../../models/sales_user.dart';
import '../../../services/inventory_service.dart';

class StockColour {
  const StockColour({
    required this.product,
    required this.quantity,
    required this.area,
    this.low = false,
    this.incoming = 0,
    this.eta = '',
  });
  final Product product;
  final int quantity;
  final double area;
  final bool low;
  final double incoming;
  final String eta;
}

class StockSeries {
  const StockSeries({
    required this.id,
    required this.name,
    required this.category,
    required this.style,
    required this.dimensions,
    required this.unit,
    required this.priceUnit,
    required this.colours,
    this.signals = const [],
  });
  final String id, name, category, style, dimensions, unit, priceUnit;
  final List<StockColour> colours;
  final List<String> signals;
  int get quantity => colours.fold(0, (s, c) => s + c.quantity);
  double get area => colours.fold(0.0, (s, c) => s + c.area);
  int get lowCount => colours.where((c) => c.low).length;
  bool get flooring => category != 'Accessories';
}

List<StockSeries> inventoryCatalog({
  required bool demo,
  required SalesRegion region,
}) {
  if (!demo) {
    final grouped = <(String, String, String), List<Product>>{};
    for (final p in catalog.products) {
      final key = (
        p.category,
        p.installationStyle ?? 'Plank',
        p.brand ?? p.name,
      );
      (grouped[key] ??= []).add(p);
    }
    return grouped.entries
        .map(
          (e) => StockSeries(
            id: e.value.first.id,
            name: e.key.$3,
            category: e.key.$1,
            style: e.key.$2,
            dimensions: e.value.first.dimensions ?? 'Size unavailable',
            unit: 'boxes',
            priceUnit: 'm²',
            colours: e.value.map((p) {
              final inv = const InventoryService().getForProductAndRegion(
                p.id,
                region,
              );
              final metrics = const InventoryService().stockMetrics(
                p.id,
                region,
              );
              final qty = inv == null
                  ? 0
                  : (metrics['available'] ?? inv.stockBoxes).toInt();
              return StockColour(
                product: p,
                quantity: qty,
                area: qty * p.sqmPerBox,
                low: qty <= 24,
              );
            }).toList(),
          ),
        )
        .toList();
  }
  final result = <StockSeries>[];
  void flooring(
    String id,
    String name,
    String category,
    String style,
    String dims,
    int colourCount,
    int boxes,
    double area,
    int lows,
    double price,
    List<String> names,
    List<String> signals,
  ) {
    final quantities = List<int>.filled(colourCount, 0);
    if (id == 'bonita') {
      const fixed = {
        0: 288,
        1: 96,
        2: 42,
        3: 43,
        4: 44,
        5: 45,
        6: 46,
        7: 47,
        8: 16,
        9: 70,
        10: 71,
        11: 72,
      };
      for (final entry in fixed.entries) {
        quantities[entry.key] = entry.value;
      }
      var remaining = boxes - fixed.values.fold(0, (sum, value) => sum + value);
      final others = List.generate(
        colourCount,
        (i) => i,
      ).where((i) => !fixed.containsKey(i)).toList();
      for (var n = 0; n < others.length; n++) {
        quantities[others[n]] = remaining ~/ (others.length - n);
        remaining -= quantities[others[n]];
      }
    } else {
      final fixed = <int, int>{};
      if (id == 'guardian') fixed.addAll({0: 44, 1: 170, 6: 0, 11: 8});
      if (id == 'mtf') fixed.addAll({2: 0, 3: 0, 5: 92, 10: 8, 11: 12});
      if (id == 'heritage') fixed.addAll({2: 18, 6: 0, 9: 244, 8: 8});
      if (id == 'aquaglow') fixed.addAll({0: 76});
      var lowCount = fixed.values.where((n) => n <= 24).length;
      for (var i = colourCount - 1; i >= 0 && lowCount < lows; i--) {
        if (!fixed.containsKey(i)) {
          fixed[i] = 8 + (lowCount * 4);
          lowCount++;
        }
      }
      for (final e in fixed.entries) {
        quantities[e.key] = e.value;
      }
      var remaining = boxes - fixed.values.fold<int>(0, (sum, n) => sum + n);
      final rest = List.generate(
        colourCount,
        (i) => i,
      ).where((i) => !fixed.containsKey(i)).toList();
      for (var n = 0; n < rest.length; n++) {
        quantities[rest[n]] = remaining ~/ (rest.length - n);
        remaining -= quantities[rest[n]];
      }
    }
    final colours = <StockColour>[];
    for (var i = 0; i < colourCount; i++) {
      final colour = names[i % names.length];
      final original = catalog.products
          .where((p) => p.id == id && i == 0)
          .firstOrNull;
      final p = Product(
        id: original?.id ?? 'demo-inventory-$id-$i',
        sku: id == 'guardian'
            ? 'GUA-${(i + 16).toString().padLeft(3, '0')}'
            : id == 'aquaglow'
            ? 'AQU-${(i + 1).toString().padLeft(3, '0')}'
            : original?.sku ??
                  '${id.substring(0, 3).toUpperCase()}-${(i + 1).toString().padLeft(3, '0')}',
        name: '$name $colour',
        brand: name,
        colour: colour,
        category: category,
        installationStyle: style,
        dimensions: dims,
        standardPrice: id == 'bonita'
            ? const <double>[82, 84, 82, 82, 82, 82, 82, 85, 82, 85, 82, 85][i]
            : id == 'mtf' && (i == 2 || i == 3)
            ? 38
            : id == 'heritage' && i == 2
            ? 98
            : price,
        salesFloorPrice: id == 'mtf' ? 29 : original?.salesFloorPrice ?? price * .8,
        discount: original?.discount ?? 0,
        stockBoxes: quantities[i],
        stockSqm: quantities[i] * area / boxes,
        sqmPerBox: area / boxes,
        status: quantities[i] <= 24 ? 'Low Stock' : 'In Stock',
      );
      colours.add(
        StockColour(
          product: p,
          quantity: quantities[i],
          area: quantities[i] * area / boxes,
          low: quantities[i] <= 24,
          incoming: id == 'bonita'
              ? (i == 0
                    ? 880
                    : i == 4
                    ? 440
                    : i == 8 || i == 11
                    ? 660
                    : 0)
              : id == 'mtf'
              ? (i == 2 || i == 3
                    ? 723
                    : i == 5
                    ? 482
                    : 0)
              : id == 'heritage'
              ? (i == 9 || i == 6
                    ? 144
                    : i == 2
                    ? 173
                    : 0)
              : id == 'guardian'
              ? (i == 0
                    ? 440
                    : i == 6
                    ? 220
                    : 0)
              : 0,
          eta: id == 'bonita'
              ? (i == 0
                    ? '8 Dec'
                    : i == 4
                    ? '17 Dec'
                    : i == 8
                    ? '26 Nov'
                    : i == 11
                    ? '25 Nov'
                    : '')
              : id == 'mtf' && (i == 2 || i == 3 || i == 5)
              ? '25 Nov'
              : id == 'heritage' && i == 9
              ? '27 Nov'
              : id == 'heritage' && (i == 2 || i == 6)
              ? '28 Nov'
              : id == 'guardian' && (i == 0 || i == 6)
              ? '2 Dec'
              : '',
        ),
      );
    }
    result.add(
      StockSeries(
        id: id,
        name: name,
        category: category,
        style: style,
        dimensions: dims,
        unit: 'boxes',
        priceUnit: 'm²',
        colours: colours,
        signals: signals,
      ),
    );
  }

  flooring(
    'bonita',
    'Bonita',
    'Engineered Timber',
    'Plank',
    '1900 × 190 × 14/2 mm',
    12,
    880,
    1936,
    1,
    82,
    [
      'Natural Oak',
      'Coastal Oak',
      'Latte Oak',
      'Lime Wash',
      'Grey Wash',
      'Brescia',
      'White Oak',
      'Cuban',
      'Cotton Oak',
      'Smoked Brown',
      'Sandstone',
      'Espresso',
    ],
    ['Incoming'],
  );
  flooring(
    'heritage',
    'Heritage',
    'Engineered Timber',
    'Herringbone',
    '600 × 120 × 14/3 mm',
    10,
    1319,
    1899,
    3,
    95,
    [
      'Natural Oak',
      'White Oak',
      'Smoked Oak',
      'Coastal Oak',
      'Honey Oak',
      'Grey Oak',
      'Grey Wash',
      'Walnut',
      'Pearl Oak',
      'Sandstone',
    ],
    ['Incoming'],
  );
  flooring(
    'studio',
    'Studio',
    'Engineered Timber',
    'Chevron',
    '600 × 90 × 15/4 mm',
    10,
    729,
    948,
    2,
    110,
    [
      'Natural Oak',
      'Light Oak',
      'Smoked Oak',
      'White Oak',
      'Coastal Oak',
      'Honey Oak',
      'Classic Oak',
      'Walnut',
      'Pearl Oak',
      'Sand Oak',
    ],
    ['Incoming'],
  );
  flooring(
    'mtf',
    'MTF',
    'Laminate',
    'Plank',
    '1218 × 198 × 12 mm',
    12,
    1023,
    2465,
    4,
    36,
    [
      'White',
      'Light Oak',
      'Natural Oak',
      'Grey',
      'Honey Oak',
      'Beech',
      'Classic Oak',
      'Silver Oak',
      'Sand Oak',
      'Walnut',
      'Pearl Oak',
      'Cotton Oak',
    ],
    ['New', 'Incoming'],
  );
  flooring(
    'aquaglow',
    'AquaGlow',
    'Laminate',
    'Plank',
    '1220 × 200 × 8 mm',
    10,
    1463,
    3219,
    2,
    48,
    [
      'Silver',
      'Natural Oak',
      'Light Oak',
      'Smoked Oak',
      'Coastal Oak',
      'Honey Oak',
      'Classic Oak',
      'Walnut',
      'Pearl Oak',
      'Sand Oak',
    ],
    ['Clearance', 'Incoming'],
  );
  flooring(
    'guardian',
    'Guardian',
    'Hybrid',
    'Plank',
    '1520 × 228 × 6.5 mm',
    12,
    2201,
    4842,
    2,
    55,
    [for (var n = 3016; n <= 3027; n++) 'D$n'],
    ['Promotion', 'Incoming'],
  );
  void accessory(
    String id,
    String name,
    String style,
    String dims,
    String unit,
    String priceUnit,
    int options,
    int quantity,
    int lows,
    double price,
    List<String> signals,
  ) {
    final colours = List.generate(options, (i) {
      final qty = quantity ~/ options + (i < quantity % options ? 1 : 0);
      final p = Product(
        id: 'demo-inventory-$id-$i',
        sku:
            '${id.substring(0, 3).toUpperCase()}-${(i + 1).toString().padLeft(3, '0')}',
        name: name,
        brand: name,
        category: 'Accessories',
        colour: ['Natural Oak', 'Silver', 'Black'][i % 3],
        installationStyle: style,
        dimensions: dims,
        standardPrice: price,
        salesFloorPrice: price * .8,
        discount: 0,
        stockBoxes: qty,
        stockSqm: 0,
        sqmPerBox: 0,
        status: i >= options - lows ? 'Low Stock' : 'In Stock',
      );
      return StockColour(
        product: p,
        quantity: qty,
        area: 0,
        low: i >= options - lows,
      );
    });
    result.add(
      StockSeries(
        id: id,
        name: name,
        category: 'Accessories',
        style: style,
        dimensions: dims,
        unit: unit,
        priceUnit: priceUnit,
        colours: colours,
        signals: signals,
      ),
    );
  }

  accessory(
    'scotia',
    'Scotia',
    'Profiles',
    '2400 mm length',
    'lengths',
    'length',
    3,
    870,
    0,
    10,
    [],
  );
  accessory(
    'stair',
    'Stair Nose',
    'Profiles',
    '2400 mm length',
    'lengths',
    'length',
    3,
    140,
    1,
    68,
    ['Incoming'],
  );
  accessory(
    'skirting',
    'Skirting',
    'Profiles',
    '2400 × 90 × 12 mm',
    'lengths',
    'length',
    2,
    660,
    0,
    24,
    [],
  );
  accessory(
    'tmould',
    'T-Moulding',
    'Profiles',
    '2700 mm length',
    'lengths',
    'length',
    3,
    180,
    1,
    24,
    ['Incoming'],
  );
  accessory(
    'reducer',
    'Reducer',
    'Profiles',
    '2700 mm length',
    'lengths',
    'length',
    2,
    48,
    1,
    26,
    ['Incoming'],
  );
  accessory(
    'endcap',
    'End Cap',
    'Profiles',
    '2700 mm length',
    'lengths',
    'length',
    2,
    58,
    1,
    27,
    ['Incoming'],
  );
  accessory(
    'underlay',
    'Underlay',
    'Underlay & Barrier',
    'Roll 15 m²',
    'rolls',
    'roll',
    3,
    262,
    1,
    65,
    ['Promotion', 'Incoming'],
  );
  accessory(
    'barrier',
    'Moisture Barrier',
    'Underlay & Barrier',
    'Roll 25 m²',
    'rolls',
    'roll',
    1,
    110,
    0,
    42,
    [],
  );
  accessory(
    'adhesive',
    'Adhesive',
    'Adhesive',
    '15 kg pail',
    'pails',
    'pail',
    2,
    104,
    0,
    99,
    [],
  );
  accessory(
    'care',
    'Care & Cleaning',
    'Care',
    '1 L bottle',
    'units',
    'unit',
    3,
    354,
    1,
    24,
    ['New'],
  );
  accessory(
    'tools',
    'Installation Tools',
    'Tools',
    'Kit / pack',
    'packs',
    'pack',
    2,
    312,
    1,
    9,
    [],
  );
  return result;
}
