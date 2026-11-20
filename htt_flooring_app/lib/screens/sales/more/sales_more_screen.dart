import '../../../services/local_sales_record_store.dart';
import '../customers/customer_board_data.dart';
import '../../../widgets/sales_task_completion.dart';
import '../../../widgets/sales_date_picker.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../inventory/inventory_screen.dart' show InventorySwatch;
import '../../../services/local_sales_request_store.dart';
import '../home/reminder_calendar_screen.dart';
import '../../../models/customer_note.dart';
import '../../../services/customer_service.dart';

import 'package:url_launcher/url_launcher.dart';

import '../../../models/sales_user.dart';

import 'dart:convert';

import '../inventory/inventory_catalog_data.dart';
import '../../../models/product.dart';
import '../../../models/customer.dart';
import '../customers/customer_directory_data.dart';
import '../customers/customer_detail_screen.dart';

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../services/app_session.dart';
import '../../../services/sales_session.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/sales_document_service.dart';
import '../home/sales_dashboard_support.dart';
import '../home/calendar_agenda_data.dart';
import '../customers/customer_notes_screen.dart';

part 'sales_more_pages.dart';
part 'sales_request_pages.dart';
part 'sales_support_pages.dart';
part 'sales_sample_picker.dart';
part 'sales_board_request.dart';

const _green = dashboardGreen;
const _muted = Color(0xFF6B7772);
const _line = Color(0xFFE5E9E6);
String _money(num n) =>
    NumberFormat.currency(symbol: '\$', decimalDigits: 0).format(n);
Widget _box(Widget child, {EdgeInsets padding = EdgeInsets.zero}) => Container(
  padding: padding,
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(14),
    border: Border.all(color: _line),
    boxShadow: const [
      BoxShadow(color: Color(0x09000000), blurRadius: 3, offset: Offset(0, 2)),
    ],
  ),
  child: Material(color: Colors.transparent, child: child),
);
Widget _heading(String s) => Padding(
  padding: const EdgeInsets.only(top: 18, bottom: 8),
  child: Text(
    s,
    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
  ),
);
Widget _badge(String s, {bool amber = false}) => Container(
  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
  decoration: BoxDecoration(
    color: amber ? const Color(0xFFFFF3DC) : const Color(0xFFE5F1E9),
    borderRadius: BorderRadius.circular(6),
  ),
  child: Text(
    s,
    style: TextStyle(
      fontSize: 11,
      color: amber ? const Color(0xFFAA7000) : const Color(0xFF167343),
    ),
  ),
);
Widget _menu(
  IconData icon,
  String title,
  String sub,
  VoidCallback onTap, {
  Widget? badge,
}) => InkWell(
  onTap: onTap,
  child: Padding(
    padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 11),
    child: Row(
      children: [
        Container(
          width: 33,
          height: 33,
          decoration: BoxDecoration(
            color: const Color(0xFFF0F2F3),
            borderRadius: BorderRadius.circular(10),
          ),
          child: _MoreIcon(icon, size: 17, color: const Color(0xFF52615B)),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 14)),
              const SizedBox(height: 2),
              Text(
                sub,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, color: _muted),
              ),
            ],
          ),
        ),
        if (badge != null) ...[badge, const SizedBox(width: 10)],
        const _MoreIcon(CupertinoIcons.chevron_right, size: 13, color: _muted),
      ],
    ),
  ),
);
Widget _group(List<Widget> children) => _box(
  Column(
    children: [
      for (var i = 0; i < children.length; i++) ...[
        if (i > 0) const Divider(height: 1, color: _line, indent: 13),
        children[i],
      ],
    ],
  ),
);

class SalesMoreScreen extends StatefulWidget {
  const SalesMoreScreen({super.key});
  @override
  State<SalesMoreScreen> createState() => _SalesMoreScreenState();
}

class _SalesMoreScreenState extends State<SalesMoreScreen> {
  DateTime? _refreshed;
  int? _samplesCount;
  int _officeCount = 0;
  bool _countsLoaded = false;
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_countsLoaded) {
      _countsLoaded = true;
      _loadCounts();
    }
  }

  Future<void> _loadCounts() async {
    final userId = context.read<AppSession>().currentUser.id;
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('sales-sample-requests-$userId');
    final office = await LocalSalesRequestStore.read(userId);
    if (mounted) {
      setState(() {
        _officeCount = office.where((r) => r['status'] == 'Waiting').length;
        if (raw != null) {
          _samplesCount = (jsonDecode(raw) as List)
              .where((r) => (r as Map)['done'] != true)
              .length;
        }
      });
    }
  }

  Future<void> _openRequests() async {
    await Navigator.push<void>(
      context,
      MaterialPageRoute(builder: (_) => const _SalesRequestsScreen()),
    );
    if (mounted) await _loadCounts();
  }

  Future<void> _openSamples() async {
    await Navigator.push<void>(
      context,
      MaterialPageRoute(
        builder: (_) => const _SalesRequestsScreen(samples: true),
      ),
    );
    if (mounted) await _loadCounts();
  }

  void _refresh() {
    setState(() => _refreshed = DateTime.now());
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Local data refreshed. Server synchronization is not configured.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppSession>();
    final region = context.watch<SalesSession>().regionName;
    final data = SalesDashboardData(context);
    final sales = data.sample ? 42025.0 : data.sales;
    final ratio = (sales / 65000).clamp(0.0, 1.0);
    final initials = app.userName
        .split(' ')
        .where((s) => s.isNotEmpty)
        .take(2)
        .map((s) => s[0])
        .join();
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar('More'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
        children: [
          InkWell(
            onTap: () => dashboardOpen(context, const SalesPerformanceScreen()),
            child: _box(
              Padding(
                padding: const EdgeInsets.all(13),
                child: Column(
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 23,
                          backgroundColor: const Color(0xFF197D50),
                          child: Text(
                            initials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        const SizedBox(width: 13),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                app.userName,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '${app.roleLabel} · $region Store',
                                style: const TextStyle(
                                  color: _muted,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const _MoreIcon(CupertinoIcons.chevron_right, size: 13),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'This month · ex GST',
                            style: TextStyle(fontSize: 11, color: _muted),
                          ),
                        ),
                        Text(
                          _money(sales),
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                        const Text(
                          ' / \$65,000',
                          style: TextStyle(fontSize: 11, color: _muted),
                        ),
                      ],
                    ),
                    const SizedBox(height: 7),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: ratio,
                        minHeight: 5,
                        color: const Color(0xFF197D50),
                        backgroundColor: _line,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        '${(ratio * 100).round()}% of target · tap for my performance',
                        style: const TextStyle(fontSize: 11, color: _muted),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          _heading('Sales'),
          _group([
            _menu(
              CupertinoIcons.calendar,
              'Tasks',
              'All follow-ups — overdue, today, upcoming',
              () => dashboardOpen(context, const SalesTasksScreen()),
              badge: _badge('${data.sample ? 14 : data.due.length} today'),
            ),
            _menu(
              CupertinoIcons.cube,
              'Samples',
              'Swatches and display board requests',
              _openSamples,
              badge: _badge(
                '${_samplesCount ?? (data.sample ? 3 : data.tasks.where((t) => t.followUpType == 'Sample Delivery').length)} open',
              ),
            ),
            _menu(
              CupertinoIcons.paperplane,
              'Requests',
              'Prices, quotes, contacts and archive requests',
              _openRequests,
              badge: _badge(
                '${(data.sample ? 4 : 0) + _officeCount} waiting',
                amber: true,
              ),
            ),
          ]),
          _heading('App'),
          _group([
            _menu(
              CupertinoIcons.arrow_2_circlepath,
              'Sync now',
              _refreshed == null
                  ? 'Refresh customer and sales data'
                  : 'Local refresh ${DateFormat('d MMM yyyy · h:mm a').format(_refreshed!)}',
              _refresh,
            ),
            _menu(
              CupertinoIcons.sun_max,
              'Settings',
              'Notifications and offline data',
              () => dashboardOpen(context, const SalesSettingsScreen()),
            ),
            _menu(
              CupertinoIcons.question_circle,
              'Help & support',
              'FAQ and feedback',
              () => dashboardOpen(context, const _MoreInfoScreen(help: true)),
            ),
            _menu(
              CupertinoIcons.info_circle,
              'About',
              'Version 2.0 · prototype',
              () => dashboardOpen(context, const _MoreInfoScreen()),
            ),
          ]),
          const SizedBox(height: 18),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFFD4243B),
              side: const BorderSide(color: Color(0xFFF4CDD3)),
              minimumSize: const Size(double.infinity, 44),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onPressed: app.signOut,
            icon: const _MoreIcon(CupertinoIcons.square_arrow_right, size: 15),
            label: const Text('Log out', style: TextStyle(fontSize: 13)),
          ),
        ],
      ),
    );
  }
}

class _MoreIcon extends StatelessWidget {
  const _MoreIcon(this.icon, {this.size = 20, this.color});
  final IconData icon;
  final double size;
  final Color? color;
  @override
  Widget build(BuildContext context) => Center(
    widthFactor: 1,
    heightFactor: 1,
    child: SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _MoreGlyph(
          icon,
          color ?? IconTheme.of(context).color ?? _green,
        ),
      ),
    ),
  );
}

class _MoreGlyph extends CustomPainter {
  _MoreGlyph(this.icon, this.color);
  final IconData icon;
  final Color color;
  @override
  void paint(Canvas canvas, Size size) {
    canvas.scale(size.width / 24, size.height / 24);
    final p = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final path = Path();
    void line(double x, double y, double x2, double y2) {
      path.moveTo(x, y);
      path.lineTo(x2, y2);
    }

    if (icon == CupertinoIcons.chevron_right) {
      path.moveTo(9, 5);
      path.lineTo(16, 12);
      path.lineTo(9, 19);
    } else if (icon == CupertinoIcons.chevron_down) {
      path.moveTo(5, 9);
      path.lineTo(12, 16);
      path.lineTo(19, 9);
    } else if (icon == CupertinoIcons.plus) {
      line(12, 4, 12, 20);
      line(4, 12, 20, 12);
    } else if (icon == CupertinoIcons.search) {
      canvas.drawCircle(const Offset(10, 10), 6, p);
      line(14.5, 14.5, 21, 21);
    } else if (icon == CupertinoIcons.cube) {
      path.moveTo(12, 3);
      path.lineTo(21, 8);
      path.lineTo(21, 17);
      path.lineTo(12, 22);
      path.lineTo(3, 17);
      path.lineTo(3, 8);
      path.close();
      line(3, 8, 12, 13);
      line(12, 13, 21, 8);
      line(12, 13, 12, 22);
      line(8, 5, 17, 10);
    } else if (icon == CupertinoIcons.paperplane) {
      path.moveTo(3, 11);
      path.lineTo(21, 3);
      path.lineTo(15, 21);
      path.lineTo(10, 15);
      path.close();
      line(10, 15, 21, 3);
    } else if (icon == CupertinoIcons.arrow_2_circlepath) {
      path.addArc(const Rect.fromLTWH(5, 5, 14, 14), .3, 4.9);
      path.moveTo(4, 4);
      path.lineTo(4, 10);
      path.lineTo(10, 10);
      path.moveTo(20, 20);
      path.lineTo(20, 14);
      path.lineTo(14, 14);
    } else if (icon == CupertinoIcons.sun_max) {
      canvas.drawCircle(const Offset(12, 12), 4, p);
      for (final xy in [
        [12.0, 2.0, 12.0, 4.0],
        [12.0, 20.0, 12.0, 22.0],
        [2.0, 12.0, 4.0, 12.0],
        [20.0, 12.0, 22.0, 12.0],
        [5.0, 5.0, 6.5, 6.5],
        [17.5, 17.5, 19.0, 19.0],
        [5.0, 19.0, 6.5, 17.5],
        [17.5, 6.5, 19.0, 5.0],
      ]) {
        line(xy[0], xy[1], xy[2], xy[3]);
      }
    } else if (icon == CupertinoIcons.lock) {
      path.addRRect(
        RRect.fromRectAndRadius(
          const Rect.fromLTWH(5, 10, 14, 11),
          const Radius.circular(2),
        ),
      );
      path.moveTo(8, 10);
      path.lineTo(8, 6);
      path.cubicTo(8, 1, 16, 1, 16, 6);
      path.lineTo(16, 10);
      line(12, 14, 12, 17);
    } else if (icon == CupertinoIcons.square_arrow_right) {
      path.moveTo(10, 4);
      path.lineTo(4, 4);
      path.lineTo(4, 20);
      path.lineTo(10, 20);
      line(10, 12, 21, 12);
      path.moveTo(17, 8);
      path.lineTo(21, 12);
      path.lineTo(17, 16);
    } else if (icon == CupertinoIcons.person_2) {
      canvas.drawCircle(const Offset(9, 7), 3, p);
      canvas.drawCircle(const Offset(18, 8), 2.5, p);
      path.moveTo(2, 20);
      path.cubicTo(2, 11, 16, 11, 16, 20);
      path.moveTo(17, 13);
      path.cubicTo(21, 13, 23, 16, 23, 20);
    } else if (icon == CupertinoIcons.info_circle ||
        icon == CupertinoIcons.question_circle ||
        icon == CupertinoIcons.check_mark_circled) {
      canvas.drawCircle(const Offset(12, 12), 9, p);
      if (icon == CupertinoIcons.info_circle) {
        line(12, 11, 12, 17);
        canvas.drawCircle(const Offset(12, 7), .7, Paint()..color = color);
      } else if (icon == CupertinoIcons.check_mark_circled) {
        path.moveTo(7, 12);
        path.lineTo(10, 15);
        path.lineTo(17, 8);
      } else {
        path.moveTo(9, 8);
        path.cubicTo(9, 3, 18, 6, 15, 10);
        path.lineTo(12, 13);
        line(12, 13, 12, 14);
        canvas.drawCircle(const Offset(12, 18), .6, Paint()..color = color);
      }
    } else {
      path.addRRect(
        RRect.fromRectAndRadius(
          const Rect.fromLTWH(4, 5, 16, 16),
          const Radius.circular(2),
        ),
      );
      line(4, 10, 20, 10);
      line(8, 3, 8, 7);
      line(16, 3, 16, 7);
      path.moveTo(8, 15);
      path.lineTo(11, 18);
      path.lineTo(16, 13);
    }
    canvas.drawPath(path, p);
  }

  @override
  bool shouldRepaint(_MoreGlyph old) => old.icon != icon || old.color != color;
}
