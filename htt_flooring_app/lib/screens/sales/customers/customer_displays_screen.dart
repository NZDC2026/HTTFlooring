import 'package:flutter/material.dart';

import '../../../models/customer.dart';
import '../../../theme/app_theme.dart';

class CustomerDisplaysScreen extends StatefulWidget {
  const CustomerDisplaysScreen({super.key, required this.customer});

  final Customer customer;

  @override
  State<CustomerDisplaysScreen> createState() => _CustomerDisplaysScreenState();
}

class _CustomerDisplaysScreenState extends State<CustomerDisplaysScreen> {
  static const _engineeredStyles = <String, Map<String, List<String>>>{
    'Plank': {
      'Bonita': ['Natural Oak', 'Coastal Oak'],
    },
    'Herringbone': {
      'Heritage': ['Natural Oak', 'Smoked Oak', 'White Oak'],
    },
    'Chevron': {
      'Studio': ['Honey Oak', 'Walnut'],
    },
  };

  static const _sampleCatalogue = <String, Map<String, List<String>>>{
    'Engineered': {},
    'Laminate': {
      'MTF': ['White', 'Black', 'Natural Oak', 'Grey'],
    },
    'Hybrid': {
      'Guardian': ['D3016', 'D3017'],
    },
  };

  static const _sampleDisplayed = {
    'Heritage': {'Natural Oak', 'White Oak'},
    'Studio': {'Honey Oak'},
    'Bonita': {'Natural Oak'},
    'MTF': {'White', 'Black'},
    'Guardian': {'D3016', 'D3017'},
  };

  final _displayedBySeries = {
    for (final entry in _sampleDisplayed.entries) entry.key: {...entry.value},
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Displays')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            widget.customer.businessName,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          if (widget.customer.id == 'abc') ...[
            const Text('Sample display boards · Demo data'),
            const SizedBox(height: 12),
            _section(context, isDisplayed: true),
            const SizedBox(height: 12),
            _section(context, isDisplayed: false),
          ] else
            const Text(
              'No display board information available for this customer.',
            ),
        ],
      ),
    );
  }

  Widget _section(BuildContext context, {required bool isDisplayed}) {
    final label = isDisplayed ? 'Displayed' : 'Undisplayed';
    final statusColor = isDisplayed ? AppColors.success : AppColors.danger;
    final categories = <Widget>[];

    for (final category in _sampleCatalogue.entries) {
      final path = '$label/${category.key}';
      final children = category.key == 'Engineered'
          ? [
              for (final style in _engineeredStyles.entries)
                if (_seriesTiles('$path/${style.key}', style.value, isDisplayed)
                    case final tiles when tiles.isNotEmpty)
                  ExpansionTile(
                    key: PageStorageKey('$path/${style.key}'),
                    title: Text(style.key),
                    childrenPadding: const EdgeInsetsDirectional.only(
                      start: 12,
                    ),
                    children: tiles,
                  ),
            ]
          : _seriesTiles(path, category.value, isDisplayed);

      categories.add(
        Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ExpansionTile(
            key: PageStorageKey(path),
            childrenPadding: const EdgeInsets.fromLTRB(8, 4, 8, 8),
            title: Text(category.key),
            children: children.isEmpty
                ? [
                    ListTile(
                      dense: true,
                      title: Text(
                        isDisplayed
                            ? 'No colours displayed.'
                            : 'No undisplayed colours.',
                      ),
                    ),
                  ]
                : children,
          ),
        ),
      );
    }

    return Card(
      margin: EdgeInsets.zero,
      child: ExpansionTile(
        key: PageStorageKey(label),
        textColor: statusColor,
        collapsedTextColor: statusColor,
        title: Text(label),
        childrenPadding: const EdgeInsets.fromLTRB(8, 4, 8, 0),
        children: categories,
      ),
    );
  }

  List<Widget> _seriesTiles(
    String path,
    Map<String, List<String>> seriesByName,
    bool isDisplayed,
  ) {
    final tiles = <Widget>[];
    for (final series in seriesByName.entries) {
      final displayed = _displayedBySeries.putIfAbsent(
        series.key,
        () => <String>{},
      );
      final colours = series.value
          .where((colour) => displayed.contains(colour) == isDisplayed)
          .toList();
      if (colours.isEmpty) continue;

      tiles.add(
        ExpansionTile(
          key: PageStorageKey('$path/${series.key}'),
          title: Text(series.key),
          subtitle: Text(
            colours.length == 1 ? '1 colour' : '${colours.length} colours',
          ),
          children: colours.map((colour) {
            final targetStatus = isDisplayed ? 'Undisplayed' : 'Displayed';
            return ListTile(
              dense: true,
              contentPadding: const EdgeInsetsDirectional.only(
                start: 32,
                end: 16,
              ),
              textColor: isDisplayed ? AppColors.success : AppColors.danger,
              title: Text(colour),
              trailing: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: isDisplayed
                      ? AppColors.danger
                      : AppColors.success,
                ),
                onPressed: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (dialogContext) => AlertDialog(
                      title: const Text('Confirm display status'),
                      content: Text(
                        'Mark ${series.key} · $colour as $targetStatus?',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(dialogContext, false),
                          child: const Text('Cancel'),
                        ),
                        FilledButton(
                          onPressed: () => Navigator.pop(dialogContext, true),
                          child: const Text('Confirm'),
                        ),
                      ],
                    ),
                  );
                  if (!mounted || confirmed != true) return;

                  setState(() {
                    if (isDisplayed) {
                      displayed.remove(colour);
                    } else {
                      displayed.add(colour);
                    }
                  });
                },
                child: Text(targetStatus),
              ),
            );
          }).toList(),
        ),
      );
    }
    return tiles;
  }
}
