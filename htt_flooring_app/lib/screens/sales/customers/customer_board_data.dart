class CustomerBoardFixture {
  const CustomerBoardFixture(
    this.id,
    this.since,
    this.age,
    this.held,
    this.colours, {
    this.warning,
    this.newColours = const [],
  });
  final String id, since, age;
  final Map<String, int> held;
  final List<String> colours, newColours;
  final String? warning;
}

CustomerBoardFixture? customerBoardFixture(String series, int location) {
  const bonita = [
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
  ];
  if (location == 1)
    return series == 'bonita'
        ? const CustomerBoardFixture('DB-1080', '5 Apr 2026', '7 months', {
            'Natural Oak': 2,
            'Coastal Oak': 1,
          }, bonita)
        : null;
  return switch (series) {
    'bonita' => const CustomerBoardFixture(
      'DB-1044',
      '12 Mar 2025',
      '1.7 years',
      {'Natural Oak': 3},
      bonita,
    ),
    'heritage' => const CustomerBoardFixture(
      'DB-1052',
      '2 Sep 2025',
      '1.3 years',
      {'Natural Oak': 2, 'White Oak': 1},
      [
        'Natural Oak',
        'White Oak',
        'Smoked Oak',
        'Latte Oak',
        'Lime Wash',
        'Cotton Oak',
        'Grey Wash',
        'Smoked Brown',
        'Espresso',
        'Sandstone',
      ],
    ),
    'studio' => const CustomerBoardFixture(
      'DB-0961',
      '10 Jun 2024',
      '2.4 years',
      {'Honey Oak': 1},
      [
        'Honey Oak',
        'Walnut',
        'Natural Oak',
        'White Oak',
        'Smoked Oak',
        'Grey Wash',
        'Latte Oak',
        'Brescia',
        'Espresso',
        'Cotton Oak',
      ],
      warning: 'On display 2.4 years — may need refreshing',
    ),
    'guardian' => const CustomerBoardFixture(
      'DB-1071',
      '18 Feb 2026',
      '9 months',
      {'D3016': 2, 'D3017': 1},
      [
        'D3016',
        'D3017',
        'D3018',
        'D3019',
        'D3020',
        'D3021',
        'D3022',
        'D3023',
        'D3024',
        'D3025',
        'D3026',
        'D3027',
      ],
    ),
    'mtf' => const CustomerBoardFixture(
      'DB-1066',
      '20 Nov 2025',
      '1.0 years',
      {'White': 2, 'Black': 2},
      [
        'White',
        'Black',
        'Natural Oak',
        'Grey',
        'Ash',
        'Beech',
        'Walnut',
        'Concrete',
        'Driftwood',
        'Charcoal',
        'Linen',
        'Maple',
      ],
      newColours: ['Natural Oak', 'Grey'],
    ),
    'aquaglow' => const CustomerBoardFixture(
      'DB-0987',
      '20 Aug 2024',
      '2.3 years',
      {'Silver': 4},
      [
        'Silver',
        'Natural Oak',
        'Sand Ash',
        'Grey',
        'Pearl',
        'Smoke',
        'Coffee',
        'Linen',
        'Driftwood',
        'Charcoal',
      ],
      warning: 'Some colours are on clearance — consider replacing this board\nOn display 2.2 years — may need refreshing',
    ),
    _ => null,
  };
}

Map<String, int> salesBoardPanelQuantities(Map<String, dynamic> record) {
  if (record['boardType'] == 'Stand' || record['boardType'] == 'Swatches')
    return {};
  final values = <String, int>{};
  for (final value in record['colours'] as List? ?? const []) {
    final text = '$value';
    final match = RegExp(r'^(.*?)\s*[×x]\s*(\d+)\s*$').firstMatch(text);
    final name = match?.group(1)?.trim() ?? text.trim();
    final count = match == null ? 1 : int.tryParse(match.group(2)!) ?? 0;
    if (name.isNotEmpty && count > 0)
      values.update(name, (old) => old + count, ifAbsent: () => count);
  }
  return values;
}
