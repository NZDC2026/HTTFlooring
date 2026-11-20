part of 'customer_detail_screen.dart';

extension _CustomerReferenceBoards on _ReferenceCustomerDetailState {
  List<StockSeries> get _boardSeries =>
      _catalog.where((s) => s.flooring).toList();
  int get _boardLocation => (_metadata['boardLocation'] as int?) ?? 0;
  List<String> get _boardLocations => [
    if (_abc) ...['George St Showroom', 'Chatswood Store'],
    ..._boardRequests
        .map((r) => '${r['delivery'] ?? ''}')
        .where((v) => v.isNotEmpty),
  ].toSet().toList();
  String get _boardStore => _boardLocations.isNotEmpty
      ? _boardLocations[_boardLocation.clamp(0, _boardLocations.length - 1)]
      : _customer.address.isEmpty
      ? _customer.businessName
      : _customer.address;
  List<Map<String, dynamic>> get _deliveredBoards =>
      _boardRequests.where((r) => r['done'] == true).toList();
  int get _boardPanelCount =>
      (_abc ? 21 : 0) +
      _deliveredBoards.fold<int>(
        0,
        (n, r) =>
            n +
            salesBoardPanelQuantities(r).values.fold<int>(0, (n, q) => n + q),
      );
  int _locationPanelCount(String location) =>
      (_abc
          ? (location == 'George St Showroom'
                ? 18
                : location == 'Chatswood Store'
                ? 3
                : 0)
          : 0) +
      _deliveredBoards
          .where((r) => r['delivery'] == location)
          .fold<int>(
            0,
            (n, r) =>
                n +
                salesBoardPanelQuantities(r).values
                    .fold<int>(0, (n, q) => n + q),
          );
  int get _boardCount =>
      (_abc ? 9 : 0) +
      _deliveredBoards
          .where((r) => salesBoardPanelQuantities(r).isNotEmpty)
          .map((r) => ('${r['series']}', '${r['delivery']}'))
          .toSet()
          .where(
            (pair) =>
                !_abc ||
                customerBoardFixture(
                      _boardSeries
                              .where((s) => s.name == pair.$1)
                              .firstOrNull
                              ?.id ??
                          '',
                      pair.$2 == 'George St Showroom' ? 0 : 1,
                    ) ==
                    null,
          )
          .length;
  int _swatchQuantity(StockSeries series) =>
      (_abc && _boardLocation == 0 && series.id == 'bonita'
          ? 2
          : _abc && _boardLocation == 1 && series.id == 'guardian'
          ? 1
          : 0) +
      _deliveredBoards
          .where(
            (r) =>
                r['series'] == series.name &&
                r['delivery'] == _boardStore &&
                r['boardType'] == 'Swatches',
          )
          .fold<int>(0, (n, r) => n + ((r['sets'] as num?)?.toInt() ?? 1));
  Map<String, int> get _standHoldings {
    final result = <String, int>{
      if (_abc && _boardLocation == 0) ...{'Bonita': 2, 'Guardian': 1},
      if (_abc && _boardLocation == 1) 'Bonita': 1,
    };
    for (final record in _deliveredBoards.where(
      (r) => r['delivery'] == _boardStore && r['boardType'] == 'Stand',
    )) {
      final name = '${record['series']}';
      final count = (record['sets'] as num?)?.toInt() ?? 1;
      result.update(name, (n) => n + count, ifAbsent: () => count);
    }
    return result;
  }

  CustomerBoardFixture? _heldBoard(StockSeries series) {
    final base =
        _abc && ['George St Showroom', 'Chatswood Store'].contains(_boardStore)
        ? customerBoardFixture(
            series.id,
            _boardStore == 'Chatswood Store' ? 1 : 0,
          )
        : null;
    final held = <String, int>{...?base?.held};
    final matching = _deliveredBoards
        .where(
          (r) => r['series'] == series.name && r['delivery'] == _boardStore,
        )
        .toList();
    for (final record in matching) {
      for (final entry in salesBoardPanelQuantities(record).entries)
        held.update(
          entry.key,
          (n) => n + entry.value,
          ifAbsent: () => entry.value,
        );
    }
    if (held.isEmpty) return null;
    return CustomerBoardFixture(
      base?.id ?? '${matching.first['id']}',
      base?.since ??
          DateFormat('d MMM yyyy').format(
            DateTime.tryParse('${matching.first['completedAt']}') ??
                DateTime.now(),
          ),
      base?.age ?? 'recently',
      held,
      base?.colours ?? series.colours.map((c) => c.product.colour).toList(),
      warning: base?.warning,
      newColours: base?.newColours ?? const [],
    );
  }

  List<Map<String, dynamic>> get _returnRequests =>
      ((_metadata['boardReturns'] as List?) ?? [])
          .map((r) => Map<String, dynamic>.from(r as Map))
          .toList();
  Future<void> _loadBoardRequests() async {
    final id = context.read<AppSession>().currentUser.id;
    final rows = await readSalesSampleRecords(id, demo: _sample);
    if (mounted)
      _refresh(
        () => _boardRequests = rows
            .where(
              (r) =>
                  r['board'] == true &&
                  (r['customerId'] == _customer.id ||
                      r['customer'] == _customer.businessName),
            )
            .toList(),
      );
  }

  bool _pendingBoard(StockSeries series) => _boardRequests.any(
    (r) =>
        r['series'] == series.name &&
        r['delivery'] == _boardStore &&
        r['done'] != true,
  );
  bool _returnPending(StockSeries series) =>
      _metadata['return-${series.id}-$_boardLocation'] == true ||
      _metadata['return-${series.id}'] == true;
  Widget _boards() {
    final requests = _metadata['boardTab'] == 'Requests';
    final pending = _boardRequests.where((r) => r['done'] != true).toList();
    final returns = _returnRequests;
    final count = pending.length + returns.length;
    final allCount = _boardRequests.length + returns.length;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 14),
        detailCard(
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                _stat('On display', '$_boardPanelCount', 'colour panels'),
                _stat('In progress', '$count', 'requests'),
                _stat('To update', _abc ? '3' : '0', 'boards'),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _segments(
          ['Boards  $_boardCount', 'Requests  $allCount'],
          requests ? 'Requests  $allCount' : 'Boards  $_boardCount',
          (v) => _refresh(
            () => _metadata['boardTab'] = v.startsWith('Requests')
                ? 'Requests'
                : 'Boards',
          ),
        ),
        const SizedBox(height: 10),
        if (requests) ...[
          for (final r in [..._boardRequests, ...returns])
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: detailCard(
                ListTile(
                  title: Text(
                    '${r['id']}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    '${r['series']} · ${r['return'] == true ? 'Return · ${r['reason']}' : (r['colours'] as List? ?? []).join(', ')}\n${r['delivery'] ?? ''}',
                    style: const TextStyle(fontSize: 11, color: detailMuted),
                  ),
                  trailing: detailBadge(
                    r['done'] == true
                        ? 'Completed'
                        : '${r['status'] ?? 'Requested'}',
                  ),
                  onTap: () => showReferenceModal<void>(
                    context,
                    (_) => Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${r['series']}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 7),
                        Text(
                          '${r['id']} · ${r['done'] == true ? 'Completed' : r['status']}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: detailMuted,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '${r['delivery'] ?? ''}',
                          style: const TextStyle(fontSize: 12),
                        ),
                        if (r['return'] == true)
                          Text(
                            'Reason: ${r['reason']}',
                            style: const TextStyle(fontSize: 12),
                          ),
                        if (r['colours'] is List) ...[
                          const SizedBox(height: 10),
                          for (final c in r['colours'] as List)
                            Text(
                              '$c',
                              style: const TextStyle(fontSize: 12, height: 1.8),
                            ),
                        ],
                        if ('${r['note'] ?? ''}'.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 12),
                            child: Text(
                              'Note: ${r['note']}',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          if (allCount == 0)
            const Padding(
              padding: EdgeInsets.all(20),
              child: Text(
                'No display board requests.',
                style: TextStyle(fontSize: 13, color: detailMuted),
              ),
            ),
        ] else ...[
          if (_boardLocations.length > 1)
            Wrap(
              spacing: 7,
              runSpacing: 7,
              children: [
                for (var i = 0; i < _boardLocations.length; i++)
                  ChoiceChip(
                    showCheckmark: false,
                    label: Text(
                      '${_boardLocations[i]}  ${_locationPanelCount(_boardLocations[i])}',
                      style: TextStyle(
                        fontSize: 11,
                        color: _boardLocation == i ? Colors.white : detailGreen,
                      ),
                    ),
                    selected: _boardLocation == i,
                    selectedColor: detailGreen,
                    backgroundColor: Colors.white,
                    onSelected: (_) {
                      _refresh(() => _metadata['boardLocation'] = i);
                      _saveMeta();
                    },
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                      side: const BorderSide(color: detailLine),
                    ),
                  ),
              ],
            ),
          for (final category in [
            'Engineered Timber',
            'Hybrid',
            'Laminate',
          ]) ...[
            Padding(
              padding: const EdgeInsets.only(top: 18, bottom: 8),
              child: Text(
                category == 'Engineered Timber'
                    ? 'ENGINEERED'
                    : category.toUpperCase(),
                style: const TextStyle(
                  fontSize: 10,
                  color: detailMuted,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            detailCard(
              Column(
                children: [
                  for (final s in _boardSeries.where(
                    (s) => s.category == category,
                  )) ...[
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          InventorySwatch(seed: s.id, size: 32),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  s.name,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  '${s.style} · ${s.colours.length} colours',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    color: detailMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: () => _heldBoard(s) == null
                                ? _requestBoard(s)
                                : _boardPanel(s),
                            child: Text(
                              _returnPending(s)
                                  ? 'Return requested'
                                  : _heldBoard(s) != null
                                  ? '${_heldBoard(s)!.held.length}/${_heldBoard(s)!.colours.length}${_heldBoard(s)!.warning != null || _heldBoard(s)!.newColours.isNotEmpty ? ' ⚠' : ''}'
                                  : _pendingBoard(s)
                                  ? '◷ Panels'
                                  : '+ Panels',
                              style: const TextStyle(
                                fontSize: 11,
                                color: detailGreen,
                              ),
                            ),
                          ),
                          TextButton(
                            onPressed: () => _requestBoard(s, swatch: true),
                            child: Text(
                              _swatchQuantity(s) > 0
                                  ? '✓ Swatch ×${_swatchQuantity(s)}'
                                  : '+ Swatch',
                              style: const TextStyle(
                                fontSize: 10,
                                color: detailGreen,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: detailLine),
                  ],
                ],
              ),
            ),
          ],
          const SizedBox(height: 14),
          detailCard(
            ListTile(
              title: Text(
                'Stands · ${_standHoldings.values.fold<int>(0, (n, q) => n + q)}',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              subtitle: Text(
                _standHoldings.isEmpty
                    ? 'No stands recorded'
                    : _standHoldings.entries
                          .map((e) => '${e.key} ×${e.value}')
                          .join(' · '),
                style: const TextStyle(fontSize: 11, color: detailMuted),
              ),
              trailing: TextButton(
                onPressed: () => _requestBoard(_boardSeries.first, stand: true),
                child: const Text('+ Stand', style: TextStyle(fontSize: 11)),
              ),
            ),
          ),
        ],
        const SizedBox(height: 14),
        SizedBox(
          width: double.infinity,
          child: detailAction(
            'Request a new board',
            'plus',
            () => _requestBoard(_boardSeries.first, generic: true),
            filled: true,
          ),
        ),
        const SizedBox(height: 10),
        const Text(
          '✓ on display · ◷ requested · ⚠ worth updating. Boards remain HTT property.',
          style: TextStyle(fontSize: 10, color: detailMuted, height: 1.5),
        ),
      ],
    );
  }

  Future<void> _requestBoard(
    StockSeries series, {
    bool swatch = false,
    bool stand = false,
    bool generic = false,
  }) async {
    try {
      final result = await requestCustomerDisplayBoard(
        context,
        _customer,
        seriesId: generic ? null : series.id,
        store: _boardStore,
        type: stand
            ? 'Stand'
            : swatch
            ? 'Swatches'
            : 'Colour Panels',
        details: !generic,
      );
      if (result != null && mounted) await _loadBoardRequests();
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Could not save the display board request. Try again.',
            ),
          ),
        );
    }
  }

  void _boardPanel(StockSeries series) {
    final held = _heldBoard(series);
    if (held == null) {
      _requestBoard(series);
      return;
    }
    showReferenceModal<void>(
      context,
      (sheet) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              InventorySwatch(
                seed: held.held.keys.first,
                size: 48,
                single: true,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      series.name,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      held.id,
                      style: const TextStyle(fontSize: 11, color: detailMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Colour Panel · $_boardStore · on display ${held.age} (since ${held.since})',
            style: const TextStyle(
              fontSize: 12,
              color: detailMuted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '${held.held.values.fold(0, (a, b) => a + b)} panels received in total — quantity per colour:',
            style: const TextStyle(fontSize: 12),
          ),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, box) => Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final color in held.colours)
                  SizedBox(
                    width: (box.maxWidth - 16) / 3,
                    child: CustomPaint(
                      foregroundPainter: held.held.containsKey(color)
                          ? null
                          : _BoardDashedBorder(),
                      child: Container(
                        height: 100,
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: held.held.containsKey(color)
                              ? detailPale
                              : Colors.white,
                          border: held.held.containsKey(color)
                              ? Border.all(color: detailGreen)
                              : null,
                          borderRadius: BorderRadius.circular(9),
                        ),
                        child: Column(
                          children: [
                            InventorySwatch(
                              seed: color,
                              size: 38,
                              single: true,
                            ),
                            const SizedBox(height: 6),
                            Expanded(
                              child: Text(
                                '$color${held.held.containsKey(color) ? ' × ${held.held[color]}' : ''}${held.newColours.contains(color) ? '  NEW' : ''}',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: held.held.containsKey(color)
                                      ? FontWeight.w600
                                      : FontWeight.w400,
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
          ),
          const SizedBox(height: 10),
          const Text(
            'Dashed = colours not on this board',
            style: TextStyle(fontSize: 10, color: detailMuted),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Text(
              held.newColours.isNotEmpty
                  ? '${held.newColours.length} new colours not on this board: ${held.newColours.join(', ')}'
                  : '${held.colours.length - held.held.length} more colours available in this series',
              style: const TextStyle(fontSize: 11, color: detailGreen),
            ),
          ),
          if (held.warning != null)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Text(
                held.warning!,
                style: const TextStyle(
                  fontSize: 11,
                  color: Color(0xFFB67600),
                  height: 1.5,
                ),
              ),
            ),
          const SizedBox(height: 14),
          detailAction(
            _returnPending(series) ? 'Return requested' : 'Return this board',
            'box',
            _returnPending(series)
                ? null
                : () {
                    Navigator.pop(sheet);
                    _returnBoard(series);
                  },
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: detailAction(
                  'Close',
                  'chevron',
                  () => Navigator.pop(sheet),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: detailAction('Request more panels', 'plus', () {
                  Navigator.pop(sheet);
                  _requestBoard(series);
                }, filled: true),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _returnBoard(StockSeries series) async {
    final held = _heldBoard(series);
    if (held == null || _returnPending(series)) return;
    final userId = context.read<AppSession>().currentUser.id;
    final store = _boardStore, location = _boardLocation;
    final note = TextEditingController();
    String? reason;
    final result = await showReferenceModal<Map<String, dynamic>>(
      context,
      (sheet) => StatefulBuilder(
        builder: (sheet, update) => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            detailBadge(
              'RETURN',
              color: const Color(0xFF976700),
              background: const Color(0xFFFFF3DB),
            ),
            const SizedBox(height: 8),
            Text(
              '${series.name}  ${held.id}',
              style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 6),
            Text(
              'Colour Panel · $store. The warehouse arranges pick up.',
              style: const TextStyle(
                fontSize: 12,
                color: detailMuted,
                height: 1.5,
              ),
            ),
            detailLabel('Reason'),
            Wrap(
              spacing: 5,
              runSpacing: 5,
              children: [
                for (final r in [
                  'Damaged',
                  'Range discontinued',
                  'Store refit',
                  'Not needed any more',
                  'Other',
                ])
                  ChoiceChip(
                    showCheckmark: false,
                    label: Text(r, style: const TextStyle(fontSize: 11)),
                    selected: reason == r,
                    onSelected: (_) => update(() => reason = r),
                  ),
              ],
            ),
            detailLabel('Note for the warehouse (optional)'),
            TextField(
              controller: note,
              key: const ValueKey('board-return-note'),
              decoration: detailInput(),
              minLines: 1,
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: detailAction(
                    'Back',
                    'chevron',
                    () => Navigator.pop(sheet),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: detailAction(
                    'Send return request',
                    'mail',
                    () => Navigator.pop(sheet, {
                      'reason': reason ?? 'Other',
                      'note': note.text.trim(),
                    }),
                    filled: true,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
    note.dispose();
    if (result == null || !mounted) return;
    final record = {
      'id': 'RET-${DateTime.now().microsecondsSinceEpoch}',
      'return': true,
      'series': series.name,
      'boardId': held.id,
      'customerId': _customer.id,
      'customer': _customer.businessName,
      'reason': result['reason'],
      'note': result['note'],
      'delivery': store,
      'status': 'Requested',
      'date': DateTime.now().toIso8601String(),
    };
    try {
      await LocalSalesRequestStore.append(userId, {
        'kind': 'Board return',
        ...record,
      });
      if (!mounted) return;
      _refresh(() {
        _metadata['return-${series.id}-$location'] = true;
        _metadata['boardReturns'] = [..._returnRequests, record];
        _metadata['boardTab'] = 'Requests';
      });
      await _saveMeta();
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Board return request saved for warehouse review.'),
          ),
        );
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not save the return request. Try again.'),
          ),
        );
    }
  }
}

class _BoardDashedBorder extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = detailLine
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    final path = Path()
      ..addRRect(
        RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(9)),
      );
    for (final metric in path.computeMetrics()) {
      for (double d = 0; d < metric.length; d += 7) {
        canvas.drawPath(
          metric.extractPath(d, (d + 4).clamp(0, metric.length)),
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(_BoardDashedBorder oldDelegate) => false;
}
