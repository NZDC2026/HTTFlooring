import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter_platform_interface/google_maps_flutter_platform_interface.dart'
    as maps;

import '../../../services/customer_location_service.dart';
import '../home/sales_dashboard_support.dart';
import 'customer_directory_data.dart';
import 'customer_google_map.dart';

class CustomerDirectoryMapPanel extends StatefulWidget {
  const CustomerDirectoryMapPanel({
    super.key,
    required this.rows,
    required this.demo,
    required this.onOpen,
  });
  final List<DirectoryCustomer> rows;
  final bool demo;
  final ValueChanged<DirectoryCustomer> onOpen;
  @override
  State<CustomerDirectoryMapPanel> createState() =>
      _CustomerDirectoryMapPanelState();
}

class _CustomerDirectoryMapPanelState extends State<CustomerDirectoryMapPanel> {
  int _radius = 50, _page = 0;
  String? _selected;
  String _identity = '';
  static const _positions = <String, Offset>{
    'ABC Flooring': Offset(.22, .36),
    'Harbour Floors': Offset(.30, .24),
    'Metro Surfaces': Offset(.06, .44),
    'Premier Floorcraft': Offset(.44, .50),
    'Timber World': Offset(.08, .60),
    'Bondi Floor Studio': Offset(.58, .12),
    'North Shore Hardwood': Offset(.82, .07),
    'Floor Direct': Offset(.88, .46),
    'Coastal Carpets & Floors': Offset(.25, .76),
    'City Timber Floors': Offset(.70, .40),
    'Sutherland Supplies': Offset(.40, .88),
    'Northern Floors': Offset(.52, .56),
    'Westside Laminates': Offset(.84, .10),
  };
  @override
  void didUpdateWidget(covariant CustomerDirectoryMapPanel old) {
    super.didUpdateWidget(old);
    final key = widget.rows.map((r) => r.customer.id).join('|');
    if (key != _identity) {
      _identity = key;
      _page = 0;
      _selected = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final rows = widget.rows
        .where((r) => r.distance != null && r.distance! <= _radius)
        .toList();
    final pages = (rows.length / 5).ceil();
    final page = pages == 0 ? 0 : _page.clamp(0, pages - 1);
    final start = page * 5;
    final shown = rows.skip(start).take(5).toList();
    final locs = context
        .watch<CustomerLocationService>()
        .locations
        .where((l) => rows.any((r) => r.customer.id == l.customerId))
        .toList();
    final selected = rows.where((r) => r.customer.id == _selected).firstOrNull;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(2, 7, 2, 10),
            child: Row(
              children: [
                Text(
                  '${rows.length} on map',
                  style: const TextStyle(fontSize: 11, color: _muted),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Sales this month · ex GST',
                    textAlign: TextAlign.end,
                    style: TextStyle(fontSize: 11, color: _muted),
                  ),
                ),
              ],
            ),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              height: 252,
              child: widget.demo
                  ? LayoutBuilder(
                      builder: (context, constraints) => Stack(
                        children: [
                          Positioned.fill(
                            child: CustomPaint(painter: _DemoStreetPainter()),
                          ),
                          for (final r in rows)
                            if (_positions.containsKey(r.customer.businessName))
                              Positioned(
                                left:
                                    _positions[r.customer.businessName]!.dx *
                                        constraints.maxWidth -
                                    12,
                                top:
                                    _positions[r.customer.businessName]!.dy *
                                        252 -
                                    14,
                                child: Semantics(
                                  button: true,
                                  label: 'Map pin: ${r.customer.businessName}',
                                  selected: _selected == r.customer.id,
                                  child: Tooltip(
                                    message: r.customer.businessName,
                                    child: InkWell(
                                      onTap: () => setState(
                                        () => _selected = r.customer.id,
                                      ),
                                      child: SizedBox(
                                        width: 26,
                                        height: 30,
                                        child: CustomPaint(
                                          painter: _MapPinPainter(
                                            r.attention
                                                ? const Color(0xFFE45049)
                                                : const Color(0xFF228354),
                                            selected:
                                                _selected == r.customer.id,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          Positioned(
                            left: constraints.maxWidth * .50 - 7,
                            top: 252 * .50 - 7,
                            child: Semantics(
                              label: 'Demo current location',
                              child: Container(
                                width: 14,
                                height: 14,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF2169D5),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 2,
                                  ),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Color(0xFF2169D5),
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  : locs.isEmpty
                  ? const ColoredBox(
                      color: Color(0xFFE8E7DF),
                      child: Center(
                        child: Padding(
                          padding: EdgeInsets.all(20),
                          child: Text(
                            'No customer locations in this range',
                            style: TextStyle(fontSize: 13, color: _muted),
                          ),
                        ),
                      ),
                    )
                  : CustomerGoogleMap(
                      center: maps.LatLng(
                        locs.first.latitude,
                        locs.first.longitude,
                      ),
                      zoom: _radius <= 5
                          ? 13
                          : _radius <= 10
                          ? 12
                          : _radius <= 20
                          ? 11
                          : 10,
                      locations: locs,
                      onSelect: (l) {
                        final r = rows
                            .where((r) => r.customer.id == l.customerId)
                            .firstOrNull;
                        if (r != null) {
                          setState(() => _selected = r.customer.id);
                        }
                      },
                    ),
            ),
          ),
          if (selected != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Material(
                color: const Color(0xFFF1F7F4),
                borderRadius: BorderRadius.circular(10),
                child: InkWell(
                  onTap: () => widget.onOpen(selected),
                  child: Padding(
                    padding: const EdgeInsets.all(11),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            selected.customer.businessName,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const Icon(Icons.chevron_right, size: 18),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          const SizedBox(height: 10),
          Row(
            children: [
              for (final radius in [5, 10, 20, 50]) ...[
                if (radius != 5) const SizedBox(width: 8),
                Expanded(
                  child: Semantics(
                    button: true,
                    selected: radius == _radius,
                    child: InkWell(
                      onTap: () => setState(() {
                        _radius = radius;
                        _page = 0;
                        _selected = null;
                      }),
                      borderRadius: BorderRadius.circular(24),
                      child: Container(
                        height: 32,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: radius == _radius
                              ? dashboardGreen
                              : Colors.white,
                          border: Border.all(
                            color: radius == _radius
                                ? dashboardGreen
                                : const Color(0xFFDFE5E1),
                          ),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Text(
                          '$radius km',
                          style: TextStyle(
                            fontSize: 12,
                            color: radius == _radius
                                ? Colors.white
                                : const Color(0xFF34473C),
                            fontWeight: radius == _radius
                                ? FontWeight.w600
                                : FontWeight.w400,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 12),
          Container(
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0C000000),
                  blurRadius: 3,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            foregroundDecoration: BoxDecoration(
              border: Border.all(color: const Color(0xFFE4E9E6)),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 11,
                  ),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Nearby customers',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEDF0EE),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${rows.length}',
                          style: const TextStyle(fontSize: 11, color: _muted),
                        ),
                      ),
                    ],
                  ),
                ),
                if (rows.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(20),
                    child: Text(
                      'No customers in this range',
                      style: TextStyle(fontSize: 12, color: _muted),
                    ),
                  ),
                for (final r in shown)
                  Material(
                    color: _selected == r.customer.id
                        ? const Color(0xFFF0F7F3)
                        : Colors.white,
                    child: InkWell(
                      onTap: () => widget.onOpen(r),
                      child: Container(
                        decoration: const BoxDecoration(
                          border: Border(
                            top: BorderSide(color: Color(0xFFF0F2F0)),
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: r.attention
                                    ? const Color(0xFFE45049)
                                    : const Color(0xFF228354),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    r.customer.businessName,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Wrap(
                                    crossAxisAlignment:
                                        WrapCrossAlignment.center,
                                    spacing: 3,
                                    children: [
                                      Text(
                                        '${r.suburb} · ${NumberFormat('0.#').format(r.distance)} km ·',
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: _muted,
                                        ),
                                      ),
                                      Container(
                                        width: 7,
                                        height: 7,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: _visitColor(r.visitDays),
                                        ),
                                      ),
                                      Text(
                                        r.visitDays == null
                                            ? 'No history'
                                            : '${r.visitDays}d',
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: _visitColor(r.visitDays),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  NumberFormat.currency(
                                    symbol: r'$',
                                    decimalDigits: 0,
                                  ).format(r.overdue > 0 ? r.overdue : r.sales),
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: r.overdue > 0
                                        ? const Color(0xFFD92F24)
                                        : const Color(0xFF1D2923),
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  r.overdue > 0 ? 'overdue' : 'this month',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    color: _muted,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                if (pages > 1)
                  Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFFF8FAF9),
                      border: Border(top: BorderSide(color: Color(0xFFEDF0EE))),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    child: Row(
                      children: [
                        _pageButton(
                          'Previous page',
                          Icons.chevron_left,
                          page > 0
                              ? () => setState(() => _page = page - 1)
                              : null,
                        ),
                        for (var i = 0; i < pages; i++)
                          Padding(
                            padding: const EdgeInsets.only(left: 6),
                            child: InkWell(
                              onTap: () => setState(() => _page = i),
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                width: 32,
                                height: 32,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: i == page
                                      ? dashboardGreen
                                      : Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: i == page
                                        ? dashboardGreen
                                        : const Color(0xFFE1E6E3),
                                  ),
                                ),
                                child: Text(
                                  '${i + 1}',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: i == page
                                        ? FontWeight.w700
                                        : FontWeight.w400,
                                    color: i == page
                                        ? Colors.white
                                        : const Color(0xFF23372C),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        const SizedBox(width: 6),
                        _pageButton(
                          'Next page',
                          Icons.chevron_right,
                          page + 1 < pages
                              ? () => setState(() => _page = page + 1)
                              : null,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${start + 1}–${start + shown.length} of ${rows.length}',
                            textAlign: TextAlign.end,
                            style: const TextStyle(fontSize: 11, color: _muted),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static const _muted = Color(0xFF65716C);
  Color _visitColor(int? days) => days == null
      ? const Color(0xFF98A39D)
      : days <= 14
      ? const Color(0xFF239E58)
      : days <= 42
      ? const Color(0xFFE46626)
      : const Color(0xFFB48B0B);
  Widget _pageButton(String label, IconData icon, VoidCallback? tap) => Tooltip(
    message: label,
    child: InkWell(
      onTap: tap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 30,
        height: 32,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: tap == null ? .5 : 1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFE6EBE8)),
        ),
        child: Icon(
          icon,
          size: 17,
          color: tap == null
              ? const Color(0xFFC1CAC4)
              : const Color(0xFF263C30),
        ),
      ),
    ),
  );
}

class _DemoStreetPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawColor(const Color(0xFFE8E7DF), BlendMode.src);
    final p = Paint()
      ..color = Colors.white
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    void line(Offset a, Offset b, double width) {
      p.strokeWidth = width;
      canvas.drawLine(
        Offset(a.dx * size.width, a.dy * size.height),
        Offset(b.dx * size.width, b.dy * size.height),
        p,
      );
    }

    line(const Offset(.18, 0), const Offset(.72, 1), 3.5);
    line(const Offset(0, .22), const Offset(1, .58), 3);
    line(const Offset(0, .60), const Offset(1, .28), 1.7);
    line(const Offset(.72, 0), const Offset(.36, 1), 2);
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

class _MapPinPainter extends CustomPainter {
  _MapPinPainter(this.color, {this.selected = false});
  final Color color;
  final bool selected;
  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.translate(size.width / 2, 1);
    if (selected) {
      canvas.drawCircle(
        const Offset(0, 11),
        12,
        Paint()..color = color.withValues(alpha: .18),
      );
    }
    final p = Paint()..color = color;
    final path = Path()
      ..moveTo(0, 25)
      ..cubicTo(-3, 21, -8, 15, -8, 10)
      ..cubicTo(-8, -1, 8, -1, 8, 10)
      ..cubicTo(8, 15, 3, 21, 0, 25)
      ..close();
    canvas.drawPath(path, p);
    canvas.drawCircle(const Offset(0, 9), 2.7, Paint()..color = Colors.white);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_MapPinPainter old) =>
      old.color != color || old.selected != selected;
}
