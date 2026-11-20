part of 'sales_more_screen.dart';

Future<Set<String>?> _pickSampleColours(
  BuildContext context,
  Set<String> initial, {
  bool board = false,
}) {
  final catalogue = inventoryCatalog(
    demo: SalesDashboardData(context).sample,
    region: context.read<SalesSession>().region,
  ).where((s) => s.flooring).toList();
  final selected = {...initial}, open = <String>{};
  String query = '';
  return showDetailSheet<Set<String>>(
    context,
    (sheet) => StatefulBuilder(
      builder: (context, update) => SizedBox(
        height: MediaQuery.sizeOf(context).height * .68,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    board ? 'Pick colour panels' : 'Pick swatches',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(sheet, selected),
                  child: const Text(
                    'Done',
                    style: TextStyle(fontSize: 13, color: detailGreen),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            TextField(
              onChanged: (v) => update(() => query = v.toLowerCase()),
              decoration: detailInput(hint: 'Search series, colour or SKU'),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: ListView(
                children: [
                  for (final category in [
                    'Engineered Timber',
                    'Laminate',
                    'Hybrid',
                  ]) ...[
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const DetailGlyph('layers', size: 19),
                      title: Text(
                        category,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      subtitle: Text(
                        '${catalogue.where((s) => s.category == category).length} series · ${catalogue.where((s) => s.category == category).fold<int>(0, (n, s) => n + s.colours.length)} colours',
                        style: const TextStyle(
                          fontSize: 11,
                          color: detailMuted,
                        ),
                      ),
                      trailing: DetailGlyph(
                        open.contains(category) ? 'down' : 'chevron',
                        size: 15,
                      ),
                      onTap: () => update(
                        () => open.contains(category)
                            ? open.remove(category)
                            : open.add(category),
                      ),
                    ),
                    if (open.contains(category) || query.isNotEmpty)
                      for (final series in catalogue.where(
                        (s) =>
                            s.category == category &&
                            ('$s ${s.name}'.toLowerCase().contains(query) ||
                                s.colours.any(
                                  (c) => '${c.product.colour} ${c.product.sku}'
                                      .toLowerCase()
                                      .contains(query),
                                )),
                      )) ...[
                        Padding(
                          padding: const EdgeInsets.only(left: 12),
                          child: ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: InventorySwatch(
                              seed: series.name,
                              size: 34,
                            ),
                            title: Text(
                              series.name,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            subtitle: Text(
                              '${series.style} · ${series.dimensions}',
                              style: const TextStyle(
                                fontSize: 10,
                                color: detailMuted,
                              ),
                            ),
                            trailing: DetailGlyph(
                              open.contains(series.id) ? 'down' : 'chevron',
                              size: 13,
                            ),
                            onTap: () => update(
                              () => open.contains(series.id)
                                  ? open.remove(series.id)
                                  : open.add(series.id),
                            ),
                          ),
                        ),
                        if (open.contains(series.id) || query.isNotEmpty)
                          for (final c in series.colours.where(
                            (c) =>
                                query.isEmpty ||
                                '${series.name} ${c.product.colour} ${c.product.sku}'
                                    .toLowerCase()
                                    .contains(query),
                          ))
                            Padding(
                              padding: const EdgeInsets.only(left: 20),
                              child: CheckboxListTile(
                                dense: true,
                                contentPadding: EdgeInsets.zero,
                                controlAffinity:
                                    ListTileControlAffinity.trailing,
                                secondary: InventorySwatch(
                                  seed: c.product.colour,
                                  size: 28,
                                  single: true,
                                ),
                                title: Text(
                                  c.product.colour,
                                  style: const TextStyle(fontSize: 12),
                                ),
                                subtitle: Text(
                                  '${c.product.sku} · ${c.area.toStringAsFixed(0)} m²${c.incoming > 0 ? ' · incoming' : ''}',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    color: detailMuted,
                                  ),
                                ),
                                value: selected.contains(c.product.id),
                                onChanged: (v) => update(
                                  () => v == true
                                      ? selected.add(c.product.id)
                                      : selected.remove(c.product.id),
                                ),
                              ),
                            ),
                      ],
                  ],
                ],
              ),
            ),
            if (selected.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  '${selected.length} selected',
                  style: const TextStyle(fontSize: 11, color: detailGreen),
                ),
              ),
          ],
        ),
      ),
    ),
  );
}
