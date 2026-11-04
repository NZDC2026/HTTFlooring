import 'package:flutter/material.dart';

import '../../../models/customer.dart';
import '../../../theme/app_theme.dart';

class CustomerDisplaysScreen extends StatelessWidget {
  const CustomerDisplaysScreen({super.key, required this.customer});

  final Customer customer;

  static const _sampleCatalogue = {
    'Engineered': {
      'Bonita': ['Natural Oak', 'Coastal Oak'],
    },
    'Laminate': {
      'MTF': ['White', 'Black', 'Natural Oak', 'Grey'],
    },
    'Hybrid': {
      'Guardian': ['D3016', 'D3017'],
    },
  };

  static const _sampleDisplayed = {
    'Bonita': {'Natural Oak'},
    'MTF': {'White', 'Black'},
    'Guardian': {'D3016', 'D3017'},
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Displays')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            customer.businessName,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          if (customer.id == 'abc') ...[
            const Text('Sample display boards · Demo data'),
            const SizedBox(height: 12),
            for (final category in _sampleCatalogue.entries)
              Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ExpansionTile(
                  key: PageStorageKey(category.key),
                  childrenPadding: const EdgeInsets.fromLTRB(8, 4, 8, 8),
                  title: Text(category.key),
                  children: [
                    for (final series in category.value.entries)
                      _seriesTile(category.key, series),
                  ],
                ),
              ),
          ] else
            const Text(
              'No display board information available for this customer.',
            ),
        ],
      ),
    );
  }

  Widget _seriesTile(String category, MapEntry<String, List<String>> series) {
    final displayed = _sampleDisplayed[series.key] ?? const <String>{};
    final missing = series.value
        .where((colour) => !displayed.contains(colour))
        .length;

    return ExpansionTile(
      key: PageStorageKey('$category/${series.key}'),
      title: Text(series.key),
      subtitle: Text(
        missing == 0
            ? 'All colours displayed'
            : '$missing missing · ${series.value.length} colours',
        style: TextStyle(
          color: missing == 0 ? AppColors.success : AppColors.danger,
        ),
      ),
      children: [
        for (final colour in series.value)
          ListTile(
            dense: true,
            contentPadding: const EdgeInsetsDirectional.only(
              start: 32,
              end: 16,
            ),
            title: Text(colour),
            trailing: displayed.contains(colour)
                ? const Text(
                    'Displayed',
                    style: TextStyle(color: AppColors.success),
                  )
                : const Text(
                    'Missing',
                    style: TextStyle(color: AppColors.danger),
                  ),
          ),
      ],
    );
  }
}
