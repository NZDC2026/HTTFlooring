part of 'customer_detail_screen.dart';

extension _CustomerSalesTab on _ReferenceCustomerDetailState {
  Widget _sales() {
    final now = DateUtils.dateOnly(DateTime.now());
    final invoices = context.read<SalesDocumentService>().getCustomerInvoices(
      _customer.id,
    );
    final data = _abc
        ? CustomerSalesSummary.reference(_period)
        : CustomerSalesSummary.fromInvoices(
            invoices,
            today: now,
            days: _period,
          );
    final documents = referenceCustomerDocuments(context, _customer);
    final units = ['Value', 'm²', 'Boxes'];
    final start = now.subtract(Duration(days: _period - 1));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 14),
        _segments(
          ['Last 30 days', 'Last 90 days', 'Last 12 months'],
          _period == 30
              ? 'Last 30 days'
              : _period == 90
              ? 'Last 90 days'
              : 'Last 12 months',
          (v) => _refresh(
            () => _period = v == 'Last 30 days'
                ? 30
                : v == 'Last 90 days'
                ? 90
                : 365,
          ),
        ),
        const SizedBox(height: 12),
        detailCard(
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 13),
            child: Row(
              children: [
                _stat(
                  'Sales · ex GST',
                  _cash(data.value, cents: true),
                  CustomerSalesSummary.change(data.value, data.previousValue),
                  color: detailGreen,
                ),
                _stat(
                  'Volume',
                  '${data.area.toStringAsFixed(2)} m²',
                  CustomerSalesSummary.change(data.area, data.previousArea),
                ),
                _stat(
                  'Boxes / pcs',
                  '${data.boxes}',
                  CustomerSalesSummary.change(
                    data.boxes.toDouble(),
                    data.previousBoxes.toDouble(),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 7),
        Text(
          '${DateFormat('d MMM').format(start)} – ${DateFormat('d MMM').format(now)} · vs previous ${_period == 365 ? '12 months' : '$_period days'}',
          style: const TextStyle(fontSize: 10, color: detailMuted),
        ),
        const SizedBox(height: 14),
        _salesTrend(now, invoices),
        const SizedBox(height: 16),
        Row(
          children: [
            const Expanded(
              child: Text(
                'By product',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
            ),
            SizedBox(
              width: 198,
              child: _segments(
                units,
                _salesUnit,
                (v) => _refresh(() => _salesUnit = v),
              ),
            ),
          ],
        ),
        const SizedBox(height: 9),
        if (data.categories.isEmpty)
          detailCard(
            const Padding(
              padding: EdgeInsets.all(20),
              child: Text(
                'No invoiced sales in this period.',
                style: TextStyle(fontSize: 12, color: detailMuted),
              ),
            ),
          ),
        if (data.categories.isNotEmpty)
          detailCard(
            Column(
              children: [
                for (final category in data.sorted(_salesUnit)) ...[
                  _salesCategory(category, data),
                  if (category != data.sorted(_salesUnit).last)
                    const Divider(height: 1, color: detailLine),
                ],
              ],
            ),
          ),
        const SizedBox(height: 9),
        const Text(
          'All figures ex GST, from invoices. Change compares m² (value for accessories).',
          style: TextStyle(fontSize: 10, color: detailMuted, height: 1.5),
        ),
        detailHeading(
          'Documents',
          action: '+ Request quote',
          onTap: _openQuoteRequest,
        ),
        Container(
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            color: const Color(0xffedf0ee),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              for (var index = 0; index < 3; index++)
                Expanded(
                  child: InkWell(
                    key: ValueKey(
                      'sales-documents-${['Quotes', 'Orders', 'Invoices'][index]}',
                    ),
                    onTap: () => _refresh(() => _documentTab = index),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 9),
                      decoration: BoxDecoration(
                        color: _documentTab == index
                            ? Colors.white
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            ['Quotes', 'Orders', 'Invoices'][index],
                            style: TextStyle(
                              fontSize: 11,
                              color: _documentTab == index
                                  ? detailGreen
                                  : detailMuted,
                              fontWeight: _documentTab == index
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                          ),
                          const SizedBox(width: 5),
                          detailBadge(
                            '${documents.where((d) => d.status == [SalesDocumentStatus.quotation, SalesDocumentStatus.order, SalesDocumentStatus.invoice][index]).length}',
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 9),
        _customerDocumentPreview(),
      ],
    );
  }

  Widget _salesChange(String label) => Text(
    label,
    style: TextStyle(
      fontSize: 10,
      fontWeight: FontWeight.w600,
      color: label.startsWith('Down') ? const Color(0xffc5362b) : detailGreen,
    ),
  );

  Widget _salesCategory(
    CustomerSalesCategory category,
    CustomerSalesSummary summary,
  ) {
    final open = _productOpen.contains(category.name);
    final total = summary.metric(_salesUnit);
    final share = total == 0 ? 0.0 : category.metric(_salesUnit) / total;
    final change = CustomerSalesSummary.change(
      category.name == 'Accessories' ? category.value : category.area,
      category.name == 'Accessories'
          ? category.previousValue
          : category.previousArea,
    );
    return Column(
      children: [
        InkWell(
          key: ValueKey('sales-category-${category.name}'),
          onTap: () => _refresh(
            () => open
                ? _productOpen.remove(category.name)
                : _productOpen.add(category.name),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xffe6f3ec),
                    borderRadius: BorderRadius.circular(9),
                  ),
                  alignment: Alignment.center,
                  child: DetailGlyph(
                    category.name == 'Accessories' ? 'box' : 'layers',
                    size: 16,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              category.name,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          _salesChange(change),
                        ],
                      ),
                      const SizedBox(height: 5),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: share.clamp(0, 1),
                          minHeight: 4,
                          color: detailGreen,
                          backgroundColor: const Color(0xffe7ebe8),
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '${_cash(category.value, cents: true)} · ${category.area.toStringAsFixed(1)} m² · ${category.boxes} · ${(share * 100).toStringAsFixed(1)}% of total',
                        style: const TextStyle(fontSize: 9, color: detailMuted),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  size: 16,
                  color: detailMuted,
                ),
              ],
            ),
          ),
        ),
        if (open)
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 2),
            child: Column(
              children: [
                for (final series in category.sortedSeries(_salesUnit))
                  Container(
                    key: ValueKey('sales-series-${series.name}'),
                    padding: const EdgeInsets.fromLTRB(42, 10, 0, 10),
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: detailLine)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                series.name,
                                style: const TextStyle(fontSize: 12),
                              ),
                            ),
                            _salesChange(
                              CustomerSalesSummary.change(
                                category.name == 'Accessories'
                                    ? series.value
                                    : series.area,
                                category.name == 'Accessories'
                                    ? series.previousValue
                                    : series.previousArea,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '${_cash(series.value, cents: true)} · ${series.area.toStringAsFixed(1)} m² · previous ${series.previousArea.toStringAsFixed(1)} m²',
                          style: const TextStyle(
                            fontSize: 9,
                            color: detailMuted,
                          ),
                        ),
                        const SizedBox(height: 6),
                        for (final colour in [
                          ...series.colours,
                        ]..sort((a, b) => b.value.compareTo(a.value)))
                          Padding(
                            padding: const EdgeInsets.only(top: 3),
                            child: Row(
                              children: [
                                InventorySwatch(
                                  seed: colour.name,
                                  size: 12,
                                  single: true,
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    '${colour.name} · ${colour.sku}',
                                    style: const TextStyle(fontSize: 10),
                                  ),
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  _cash(colour.value, cents: true),
                                  style: const TextStyle(fontSize: 10),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _salesTrend(DateTime now, List<SalesDocument> invoices) {
    late List<double> current, previous;
    late List<String> labels;
    double? demoMax;
    final start = now.subtract(Duration(days: _period - 1));
    if (_abc) {
      if (_period == 30) {
        current = [0, 0, 29.46010481595, 100, 0];
        previous = [0, 0, 0, 37.33621270394, 52.08203435055];
        demoMax = 15156;
      } else if (_period == 90) {
        current = [0, 1.32510477247, 0, 69.070117919, 0, 100];
        previous = [8.09588050409, 0, 10.83120254787, 31.19857255637, 0, 0];
        demoMax = 19621.09;
      } else {
        current = [
          51.12307983594,
          19.06668797465,
          1.07032042072,
          16.7184049716,
          14.44393716998,
          34.0254861746,
          5.86277237348,
          30.43659108113,
          0,
          .95959761857,
          20.88494092385,
          100,
        ];
        previous = List.filled(12, 0);
        demoMax = 27095;
      }
      current = current.map((v) => v / 100 * demoMax!).toList();
      previous = previous.map((v) => v / 100 * demoMax!).toList();
    } else {
      current = List.filled(
        _period == 30
            ? 5
            : _period == 90
            ? 6
            : 12,
        0,
      );
      previous = List.filled(current.length, 0);
      for (final doc in invoices) {
        final date = doc.invoiceDate ?? doc.createdAt;
        final age = DateUtils.dateOnly(date).difference(start).inDays;
        if (age >= _period || age < -_period) continue;
        final bucket =
            ((age < 0 ? age + _period : age) * current.length / _period)
                .floor()
                .clamp(0, current.length - 1);
        if (age < 0) {
          previous[bucket] += doc.subtotal;
        } else {
          current[bucket] += doc.subtotal;
        }
      }
    }
    if (_period == 365) {
      labels = List.generate(
        12,
        (i) => DateFormat('MMM').format(DateTime(now.year, now.month - 11 + i)),
      );
    } else {
      labels = List.generate(current.length, (i) {
        final a = start.add(
          Duration(days: (i * _period / current.length).floor()),
        );
        final b = start.add(
          Duration(days: ((i + 1) * _period / current.length).floor() - 1),
        );
        return '${a.day}–${b.day} ${DateFormat('MMM').format(b)}';
      });
    }
    return detailCard(
      Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Sales trend',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${_period == 30
                            ? 'Weekly'
                            : _period == 90
                            ? 'Fortnightly'
                            : 'Monthly'} · ex GST',
                        style: const TextStyle(
                          fontSize: 10,
                          color: detailMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                for (final item in [
                  ('This period', detailGreen),
                  ('Previous', const Color(0xffd9dfdc)),
                ])
                  Padding(
                    padding: const EdgeInsets.only(left: 8, top: 2),
                    child: Row(
                      children: [
                        Container(
                          width: 7,
                          height: 7,
                          decoration: BoxDecoration(
                            color: item.$2,
                            borderRadius: BorderRadius.circular(1),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          item.$1,
                          style: const TextStyle(
                            fontSize: 9,
                            color: detailMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 174,
              width: double.infinity,
              child: CustomPaint(
                painter: _CustomerSalesTrend(
                  current,
                  previous,
                  labels,
                  maximum: demoMax,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CustomerSalesTrend extends CustomPainter {
  _CustomerSalesTrend(this.current, this.previous, this.labels, {this.maximum});
  final List<double> current, previous;
  final List<String> labels;
  final double? maximum;
  @override
  void paint(Canvas canvas, Size size) {
    final max =
        maximum ??
        [...current, ...previous].fold<double>(1, (a, b) => a > b ? a : b);
    final plotHeight = size.height - 27;
    void text(
      String value,
      Offset position, {
      Color color = detailMuted,
      double fontSize = 8,
      bool right = false,
      Color? fill,
    }) {
      final painter = TextPainter(
        text: TextSpan(
          text: value,
          style: TextStyle(
            color: color,
            fontSize: fontSize,
            fontFamily: 'HttReference',
          ),
        ),
        textDirection: ui.TextDirection.ltr,
      )..layout();
      final x = right ? position.dx - painter.width : position.dx;
      if (fill != null) {
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(
              x - 3,
              position.dy - 2,
              painter.width + 6,
              painter.height + 4,
            ),
            const Radius.circular(3),
          ),
          Paint()..color = fill,
        );
      }
      painter.paint(canvas, Offset(x, position.dy));
    }

    for (final fraction in [.5, 1.0]) {
      final y = plotHeight * (1 - fraction);
      final paint = Paint()
        ..color = detailLine
        ..strokeWidth = .7;
      for (double x = 0; x < size.width; x += 4) {
        canvas.drawLine(Offset(x, y), Offset(x + 2, y), paint);
      }
      text(
        NumberFormat.currency(
          symbol: '\$',
          decimalDigits: 0,
        ).format(max * fraction),
        Offset(0, y - 12),
        fontSize: 8,
      );
    }
    final width = size.width / current.length;
    final barWidth = (width * .29).clamp(3.0, 14.0);
    final top = current.fold<double>(0, (a, b) => a > b ? a : b);
    for (var i = 0; i < current.length; i++) {
      final centre = (i + .5) * width;
      for (final pair in [
        (previous[i], centre - barWidth - 1, const Color(0xffd9dfdc)),
        (
          current[i],
          centre + 1,
          current[i] == top ? detailGreen : const Color(0xff91c3ad),
        ),
      ]) {
        final height = (pair.$1 / max * plotHeight).clamp(0.0, plotHeight);
        if (height > 0) {
          canvas.drawRRect(
            RRect.fromRectAndRadius(
              Rect.fromLTWH(pair.$2, plotHeight - height, barWidth, height),
              const Radius.circular(2),
            ),
            Paint()..color = pair.$3,
          );
        }
      }
      final label = TextPainter(
        text: TextSpan(
          text: labels[i],
          style: TextStyle(
            fontSize: current.length > 6 ? 7 : 8,
            color: detailMuted,
            fontFamily: 'HttReference',
          ),
        ),
        textDirection: ui.TextDirection.ltr,
      )..layout(maxWidth: width + 4);
      label.paint(canvas, Offset(centre - label.width / 2, plotHeight + 7));
      if (current[i] == top && top > 0) {
        text(
          NumberFormat.currency(symbol: '\$', decimalDigits: 0).format(top),
          Offset(
            (centre - 13).clamp(0.0, size.width - 40),
            plotHeight - top / max * plotHeight - 17,
          ),
          color: detailGreen,
          fontSize: 8,
          fill: const Color(0xffe5f1e9),
        );
      }
    }
  }

  @override
  bool shouldRepaint(_CustomerSalesTrend old) =>
      old.current != current ||
      old.previous != previous ||
      old.labels != labels;
}
