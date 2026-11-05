import 'package:flutter/material.dart';

import '../../models/product.dart';
import '../../theme/app_theme.dart';

const catalogCategories = [
  'All',
  'Engineered Timber',
  'Hybrid',
  'Laminate',
  'Accessories',
];
const catalogStylesByCategory = {
  'Engineered Timber': ['All', 'Plank', 'Herringbone', 'Chevron'],
  'Hybrid': ['All', 'Plank', 'Herringbone'],
  'Laminate': ['All', 'Plank', 'Herringbone'],
};

Widget catalogSeriesTitle(String name, List<Product> products) {
  final dimensions = products
      .map((product) => product.dimensions)
      .whereType<String>()
      .toSet()
      .join(' · ');

  return Text.rich(
    TextSpan(
      text: name,
      children: [
        TextSpan(
          text: dimensions.isEmpty ? ' · Size unavailable' : ' · $dimensions',
          style: const TextStyle(fontSize: 12),
        ),
      ],
    ),
  );
}

Widget catalogFilterRow(
  List<String> options,
  String selected,
  ValueChanged<String> onSelected,
) {
  return Padding(
    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
    child: Align(
      alignment: AlignmentDirectional.centerStart,
      child: Wrap(
        spacing: 8,
        runSpacing: 6,
        children: [
          for (final option in options)
            ChoiceChip(
              label: Text(option),
              selected: selected == option,
              showCheckmark: false,
              selectedColor: AppColors.green,
              backgroundColor: AppColors.card,
              labelStyle: TextStyle(
                color: selected == option ? Colors.white : AppColors.text,
                fontSize: 12,
              ),
              onSelected: (_) => onSelected(option),
            ),
        ],
      ),
    ),
  );
}
