import 'package:flutter/material.dart';

import '../../../models/customer.dart';
import '../../../theme/app_theme.dart';

class CustomerDisplaysScreen extends StatefulWidget {
  static ({int displayed, int total}) get demoCoverage {
    final catalogue = _CustomerDisplaysScreenState._sampleCatalogue;
    final displayed = _CustomerDisplaysScreenState._sampleDisplayed;
    return (
      displayed: displayed.values.fold(
        0,
        (sum, colours) => sum + colours.length,
      ),
      total: catalogue.values
          .expand((patterns) => patterns.values)
          .expand((series) => series.values)
          .fold(0, (sum, colours) => sum + colours.length),
    );
  }

  const CustomerDisplaysScreen({super.key, required this.customer});

  final Customer customer;

  @override
  State<CustomerDisplaysScreen> createState() => _CustomerDisplaysScreenState();
}

class _CustomerDisplaysScreenState extends State<CustomerDisplaysScreen> {
  static const _sampleCatalogue = {
    'Engineered': {
      'Plank': {
        'Bonita': ['Natural Oak', 'Coastal Oak'],
      },
      'Herringbone': {
        'Heritage': ['Natural Oak', 'Smoked Oak', 'White Oak'],
      },
      'Chevron': {
        'Studio': ['Honey Oak', 'Walnut'],
      },
    },
    'Laminate': {
      'Plank': {
        'MTF': ['White', 'Black', 'Natural Oak', 'Grey'],
      },
      'Herringbone': <String, List<String>>{},
    },
    'Hybrid': {
      'Plank': {
        'Guardian': ['D3016', 'D3017'],
      },
      'Herringbone': <String, List<String>>{},
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

  static const _expandedDivider = Border(
    bottom: BorderSide(color: AppColors.border),
  );

  bool _showAvailable = true;
  bool _showDisplayed = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Displays')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            widget.customer.businessName,
            style: Theme.of(context).textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w700, color: AppColors.green),
          ),
          const SizedBox(height: 8),
          if (widget.customer.id == 'abc') ...[
            const Text('Sample display boards · Demo data'),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.inventory_2_outlined),
                title: const Text('Available (In Stock)'),
                subtitle: const Text(
                  'Sample boards that can be placed at customer stores',
                ),
                trailing: Icon(
                  _showAvailable ? Icons.expand_less : Icons.chevron_right,
                ),
                onTap: () => setState(() => _showAvailable = !_showAvailable),
              ),
            ),
            if (_showAvailable) ...[
              const SizedBox(height: 12),
              ..._categoryTiles(isDisplayed: false),
            ],
            const SizedBox(height: 10),
            const Divider(color: AppColors.border),
            const SizedBox(height: 10),
            Card(
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  ListTile(
                    tileColor: AppColors.copperLight.withValues(alpha: 0.35),
                    leading: const Icon(Icons.storefront_outlined),
                    title: const Text('Displayed (At Customer)'),
                    subtitle: const Text(
                      'Sample boards currently displayed at this customer',
                    ),
                    trailing: Icon(
                      _showDisplayed ? Icons.expand_less : Icons.chevron_right,
                    ),
                    onTap: () =>
                        setState(() => _showDisplayed = !_showDisplayed),
                  ),
                  _displayedPreview(),
                  if (_showDisplayed)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Column(
                        children: _categoryTiles(isDisplayed: true),
                      ),
                    ),
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

  List<Widget> _categoryTiles({required bool isDisplayed}) {
    return [
      for (final category in _sampleCatalogue.entries)
        Card(
          margin: const EdgeInsets.only(bottom: 10),
          clipBehavior: Clip.antiAlias,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: AppColors.border),
          ),
          child: ExpansionTile(
            key: PageStorageKey('$isDisplayed/${category.key}'),
            initiallyExpanded: !isDisplayed && category.key == 'Engineered',
            leading: isDisplayed ? null : const Icon(Icons.layers_outlined),
            title: Text(
              category.key,
              style: isDisplayed
                  ? null
                  : const TextStyle(fontWeight: FontWeight.w700),
            ),
            textColor: AppColors.green,
            collapsedTextColor: AppColors.green,
            backgroundColor: isDisplayed
                ? AppColors.card
                : AppColors.successLight.withValues(alpha: 0.3),
            shape: isDisplayed ? _expandedDivider : const Border(),
            childrenPadding: isDisplayed
                ? const EdgeInsetsDirectional.only(start: 8, end: 8)
                : EdgeInsets.zero,
            children: [
              for (final style in category.value.entries)
                _styleTile('$isDisplayed/${category.key}', style, isDisplayed),
            ],
          ),
        ),
    ];
  }

  Widget _displayedPreview() {
    const preview = [
      ('Engineered', 'Bonita', Color(0xFFD1A168), Icons.view_agenda_outlined),
      ('Herringbone', 'Heritage', Color(0xFFB7814B), Icons.waves),
      ('Laminate', 'MTF', Color(0xFF78614C), Icons.view_agenda_outlined),
      ('Chevron', 'Studio', Color(0xFFB48B56), Icons.keyboard_double_arrow_up),
      ('Hybrid', 'Guardian', Color(0xFF9B775A), Icons.view_agenda_outlined),
    ];
    final boards = preview
        .where((board) => _displayedBySeries[board.$2]?.isNotEmpty ?? false)
        .take(3)
        .toList();
    if (boards.isEmpty) {
      return const ListTile(title: Text('No boards currently displayed.'));
    }

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          Row(
            children: [
              for (final (label, _, colour, icon) in boards)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Container(
                      height: 102,
                      alignment: Alignment.bottomCenter,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        gradient: LinearGradient(
                          colors: [
                            Color.lerp(colour, Colors.white, 0.28)!,
                            colour,
                          ],
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Icon(icon, color: Colors.white, size: 28),
                          const SizedBox(height: 8),
                          DecoratedBox(
                            decoration: BoxDecoration(
                              color: AppColors.card,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 4,
                                vertical: 3,
                              ),
                              child: Text(
                                label,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
          Container(height: 5, color: AppColors.copperLight),
        ],
      ),
    );
  }

  Widget _styleTile(
    String categoryPath,
    MapEntry<String, Map<String, List<String>>> style,
    bool isDisplayed,
  ) {
    final path = '$categoryPath/${style.key}';
    final series = _seriesTiles(path, style.value, isDisplayed);
    return ExpansionTile(
      key: PageStorageKey(path),
      leading: isDisplayed
          ? null
          : Icon(switch (style.key) {
              'Herringbone' => Icons.waves,
              'Chevron' => Icons.keyboard_double_arrow_up,
              _ => Icons.view_agenda_outlined,
            }, color: AppColors.copper),
      title: Text('- ${style.key}'),
      shape: _expandedDivider,
      childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 4),
      children: [
        if (series.isEmpty)
          ListTile(
            dense: true,
            title: Text(
              isDisplayed ? 'No colours displayed.' : 'No undisplayed colours.',
            ),
          ),
        ...series,
      ],
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
          title: Text('- ${series.key}'),
          shape: _expandedDivider,
          subtitle: Text(
            colours.length == 1 ? '1 colour' : '${colours.length} colours',
          ),
          children: colours.map((colour) {
            final targetStatus = isDisplayed ? 'Undisplayed' : 'Displayed';
            return ListTile(
              dense: true,
              contentPadding: const EdgeInsetsDirectional.only(
                start: 24,
                end: 8,
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
