import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/warehouse_order.dart';
import '../../../services/app_session.dart';
import '../../../services/inventory_service.dart';
import '../../../services/warehouse_order_service.dart';
import '../../../theme/app_theme.dart';
import '../returns/customer_returns_screen.dart';
import 'warehouse_activities_screen.dart';
import '../inventory/warehouse_product_entry_screen.dart';
import '../orders/verify_order_screen.dart';
import '../inventory/warehouse_inventory_screen.dart';
import '../more/warehouse_more_screen.dart';
import '../orders/picking_list_screen.dart';
import '../orders/prepare_order_screen.dart';
import '../orders/warehouse_orders_screen.dart';

class WarehouseHomeScreen extends StatelessWidget {
  const WarehouseHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    context.watch<ValueNotifier<int>?>();
    final session = context.watch<AppSession>();
    final orders = context.watch<WarehouseOrderService>();
    final now = DateTime.now();
    final pickups =
        orders.orders
            .where(
              (order) =>
                  order.fulfilmentType == WarehouseFulfilmentType.pickup &&
                  order.status != WarehouseOrderStatus.completed &&
                  DateUtils.isSameDay(order.fulfilmentDate.toLocal(), now),
            )
            .toList()
          ..sort((a, b) => a.fulfilmentDate.compareTo(b.fulfilmentDate));
    final pendingCollection = pickups
        .where(
          (order) =>
              order.status == WarehouseOrderStatus.prepared ||
              order.status == WarehouseOrderStatus.readyForDispatch,
        )
        .length;
    final dispatched = orders.orders
        .where(
          (order) =>
              order.completedAt != null &&
              DateUtils.isSameDay(order.completedAt!.toLocal(), now),
        )
        .length;
    final recent =
        orders.orders
            .where(
              (order) =>
                  order.completedAt != null || order.pickupConfirmedAt != null,
            )
            .toList()
          ..sort(
            (a, b) => (b.completedAt ?? b.pickupConfirmedAt!).compareTo(
              a.completedAt ?? a.pickupConfirmedAt!,
            ),
          );
    final next = pickups.firstOrNull;
    final urgent = pickups
        .where(
          (order) =>
              order.fulfilmentDate.isBefore(now) && !order.allItemsPrepared,
        )
        .length;
    final shortages = const InventoryService().inventory
        .where(
          (item) =>
              item.region == session.region && item.statusLabel != 'In Stock',
        )
        .length;

    void open(Widget page) =>
        Navigator.of(context)
            .push<void>(MaterialPageRoute(builder: (_) => page));
    void showPickups() => showModalBottomSheet<void>(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            const ListTile(title: Text('Today’s Pickups')),
            if (pickups.isEmpty)
              const ListTile(subtitle: Text('No pending pickups today')),
            for (final order in pickups)
              ListTile(
                title: Text(order.customerName),
                subtitle: Text('${order.number} · ${order.statusLabel}'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(sheetContext);
                  open(PrepareOrderScreen(orderId: order.id));
                },
              ),
          ],
        ),
      ),
    );

    void showAlerts() => showModalBottomSheet<void>(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text('$urgent urgent pickups'),
              onTap: () {
                Navigator.pop(sheetContext);
                showPickups();
              },
            ),
            ListTile(
              title: Text('$shortages stock shortages'),
              onTap: () {
                Navigator.pop(sheetContext);
                open(const WarehouseInventoryScreen());
              },
            ),
          ],
        ),
      ),
    );

    return Theme(
      data: Theme.of(context).copyWith(
        textTheme: Theme.of(context).textTheme
            .apply(fontFamily: 'Arial', bodyColor: const Color(0xFF101916)),
      ),
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F3ED),
        appBar: AppBar(
          toolbarHeight: 54,
          actionsIconTheme: const IconThemeData(size: 21),
          titleSpacing: 16,
          actionsPadding: const EdgeInsets.only(right: 6),
          iconTheme: const IconThemeData(color: Colors.white, size: 22),
          automaticallyImplyLeading: false,
          title: const Text(
            'HTT Flooring CRM  |  Warehouse',
            style: TextStyle(
              fontFamily: 'sans-serif',
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          actions: [
            IconButton(
              constraints: const BoxConstraints.tightFor(width: 30, height: 40),
              padding: EdgeInsets.zero,

              tooltip: 'Scan Product',
              icon: const _WarehouseSymbol(
                icon: Icons.qr_code_scanner,
                color: Colors.white,
                size: 21,
              ),
              onPressed: () => open(const WarehouseProductEntryScreen()),
            ),
            IconButton(
              constraints: const BoxConstraints.tightFor(width: 30, height: 40),
              padding: EdgeInsets.zero,
              tooltip: 'Warehouse alerts',
              icon: const Icon(Icons.notifications_none),
              onPressed: showAlerts,
            ),
            IconButton(
              constraints: const BoxConstraints.tightFor(width: 30, height: 40),
              padding: EdgeInsets.zero,
              tooltip: 'Profile',
              onPressed: () => open(const WarehouseMoreScreen()),
              icon: const Icon(Icons.account_circle_outlined),
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
          children: [
            SizedBox(
              height: 88,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  const Positioned(
                    right: -16,
                    top: -14,
                    bottom: -12,
                    width: 230,
                    child: _ReferencePhoto(
                      region: Rect.fromLTWH(395, 180, 429, 155),
                    ),
                  ),
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            const Color(0xFFF7F3ED),
                            const Color(0xFFF7F3ED).withValues(alpha: 0.9),
                            const Color(0xFFF7F3ED).withValues(alpha: 0),
                          ],
                          stops: const [0, 0.35, 0.8],
                        ),
                      ),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Good morning,',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        session.userName,
                        style: const TextStyle(
                          fontSize: 29,
                          height: 1.05,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 7),
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            size: 17,
                            color: AppColors.copper,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            'Warehouse · ${session.regionName} Store',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.copper,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              textInputAction: TextInputAction.search,
              onSubmitted: (query) =>
                  open(WarehouseOrdersScreen(initialQuery: query.trim())),
              decoration: InputDecoration(
                hintText: 'Search Order No. / Customer',
                hintStyle: const TextStyle(fontSize: 13),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(28),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  tooltip: 'Scan Product',
                  icon: const _WarehouseSymbol(
                    icon: Icons.qr_code_scanner,
                    color: AppColors.green,
                    size: 21,
                  ),
                  onPressed: () => open(const WarehouseProductEntryScreen()),
                ),
                filled: true,
                fillColor: AppColors.card,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      minimumSize: const Size(0, 32),
                    ),
                    onPressed: () => open(
                      const WarehouseOrdersScreen(
                        initialFilter: WarehouseOrderStatus.readyForDispatch,
                      ),
                    ),
                    icon: const Icon(Icons.local_shipping_outlined, size: 17),
                    label: const Text(
                      'Dispatch',
                      style: TextStyle(fontSize: 11),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFFDFA),
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      minimumSize: const Size(0, 32),
                    ),
                    onPressed: () => open(const WarehouseActivitiesScreen()),
                    child: const Text(
                      'Activities',
                      style: TextStyle(fontSize: 11),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFFDFA),
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      minimumSize: const Size(0, 32),
                    ),
                    onPressed: showPickups,
                    child: const Text(
                      'Today’s Pickups',
                      maxLines: 1,
                      style: TextStyle(fontSize: 11),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Material(
              color: AppColors.copperLight,
              clipBehavior: Clip.antiAlias,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(
                  color: AppColors.copper.withValues(alpha: 0.35),
                ),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 2,
                ),
                leading: const Icon(
                  Icons.warning_amber_rounded,
                  color: AppColors.copper,
                  size: 26,
                ),
                title: const Text(
                  'Warehouse Alerts',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                subtitle: Text(
                  '$urgent urgent pickup · $shortages stock shortage · $pendingCollection pending collection',
                  style: const TextStyle(fontSize: 10),
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Badge(
                      backgroundColor: AppColors.copper,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      label: Text(
                        '${urgent + shortages + pendingCollection} Alerts',
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.chevron_right, size: 19),
                  ],
                ),
                onTap: showAlerts,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Expanded(child: _Heading('Today’s Operations')),
                TextButton(
                  onPressed: () => open(const WarehouseOrdersScreen()),
                  child: const Text('View All Orders ›'),
                ),
              ],
            ),
            _grid(
              context,
              columns: 3,
              children: [
                _tile(
                  title: 'To Pick',
                  value: orders.toPickCount,
                  icon: Icons.inventory_2_outlined,
                  color: AppColors.copper,
                  background: AppColors.copperLight,
                  onTap: () => open(const PickingListScreen()),
                ),
                _tile(
                  title: 'Picking',
                  value: orders.preparingCount,
                  icon: Icons.shopping_cart_outlined,
                  color: Colors.blue.shade800,
                  background: Colors.blue.shade50,
                  onTap: () => open(
                    const WarehouseOrdersScreen(
                      initialFilter: WarehouseOrderStatus.preparing,
                    ),
                  ),
                ),
                _tile(
                  title: 'Ready for Pickup',
                  value: pickups
                      .where(
                        (order) =>
                            order.status == WarehouseOrderStatus.prepared ||
                            order.status ==
                                WarehouseOrderStatus.readyForDispatch,
                      )
                      .length,
                  icon: Icons.check_circle_outline,
                  color: AppColors.success,
                  background: AppColors.successLight,
                  onTap: showPickups,
                ),
                _tile(
                  title: 'Today’s Pickups',
                  value: pickups.length,
                  icon: Icons.local_shipping_outlined,
                  color: Colors.indigo.shade700,
                  background: Colors.indigo.shade50,
                  onTap: showPickups,
                ),
                _tile(
                  title: 'Dispatched',
                  value: dispatched,
                  icon: Icons.local_shipping_outlined,
                  background: AppColors.successLight,
                  onTap: () => open(
                    const WarehouseOrdersScreen(
                      initialFilter: WarehouseOrderStatus.completed,
                    ),
                  ),
                ),
                _tile(
                  title: 'Pending Collection',
                  value: pendingCollection,
                  icon: Icons.schedule,
                  background: AppColors.copperLight,
                  onTap: showPickups,
                ),
              ],
            ),
            const SizedBox(height: 12),
            _NextPickup(
              order: next,
              onTap: next == null
                  ? null
                  : () => open(PrepareOrderScreen(orderId: next.id)),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: _Heading('Quick Actions'),
            ),
            _grid(
              context,
              columns: 3,
              children: [
                _tile(
                  title: 'Scan Product',
                  icon: Icons.qr_code_scanner,
                  onTap: () => open(const WarehouseProductEntryScreen()),
                ),
                _tile(
                  title: 'Picking List',
                  icon: Icons.format_list_bulleted,
                  onTap: () => open(const PickingListScreen()),
                ),
                _tile(
                  title: 'Verify Order',
                  icon: Icons.verified_user_outlined,
                  onTap: () => open(const VerifyOrderScreen()),
                ),
                _tile(
                  title: 'Goods Receiving',
                  icon: Icons.add_box_outlined,
                  onTap: () =>
                      open(const WarehouseProductEntryScreen(receiving: true)),
                ),
                _tile(
                  title: 'Inventory Lookup',
                  icon: Icons.manage_search,
                  onTap: () => open(const WarehouseInventoryScreen()),
                ),
                _tile(
                  title: 'Return',
                  icon: Icons.assignment_return_outlined,
                  onTap: () => open(const CustomerReturnsScreen()),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.history),
                    title: const Text('Recent Activities'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => open(const WarehouseActivitiesScreen()),
                  ),
                  if (recent.isEmpty)
                    for (final entry in const [
                      (
                        'Dispatched',
                        'SO-10546 · City Timber Floors',
                        '9:30 AM',
                        Icons.local_shipping_outlined,
                        AppColors.success,
                      ),
                      (
                        'Picked',
                        'SO-10547 · Oakwood Interiors',
                        '8:55 AM',
                        Icons.inventory_2_outlined,
                        Colors.blue,
                      ),
                      (
                        'Check-in',
                        'ABC Flooring · BXA-728',
                        '8:22 AM',
                        Icons.person_pin_circle_outlined,
                        AppColors.copper,
                      ),
                    ])
                      ListTile(
                        leading: Icon(entry.$4, color: entry.$5),
                        title: Text(
                          '${entry.$1} · Demo',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        subtitle: Text(
                          entry.$2,
                          style: const TextStyle(fontSize: 11),
                        ),
                        trailing: Text(
                          entry.$3,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.muted,
                          ),
                        ),
                      ),
                  for (final order in recent.take(3))
                    ListTile(
                      leading: const Icon(
                        Icons.check_circle_outline,
                        color: AppColors.success,
                      ),
                      title: Text(
                        order.completedAt != null
                            ? 'Dispatched'
                            : 'Pickup confirmed',
                      ),
                      subtitle: Text('${order.number} · ${order.customerName}'),
                      trailing: Text(
                        DateFormat.jm().format(
                          (order.completedAt ?? order.pickupConfirmedAt!)
                              .toLocal(),
                        ),
                      ),
                      onTap: () => open(PrepareOrderScreen(orderId: order.id)),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _grid(
    BuildContext context, {
    required int columns,
    required List<Widget> children,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final count = constraints.maxWidth < 320 && columns > 2 ? 3 : columns;
        final width = (constraints.maxWidth - (count - 1) * 8) / count;
        return Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final child in children)
              SizedBox(
                width: width,
                height: MediaQuery.textScalerOf(context)
                    .scale(columns == 6 ? 64 : 96),
                child: child,
              ),
          ],
        );
      },
    );
  }

  Widget _tile({
    required String title,
    required IconData icon,
    int? value,
    Color color = AppColors.green,
    Color background = AppColors.card,
    VoidCallback? onTap,
  }) {
    final radius = BorderRadius.circular(13);
    final operation = value != null;
    return Material(
      color: Colors.transparent,
      child: Ink(
        decoration: BoxDecoration(
          borderRadius: radius,
          border: Border.all(color: operation ? background : AppColors.border),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFFFFFDFA),
              operation ? background : const Color(0xFFFAF7F2),
            ],
          ),
          boxShadow: operation
              ? []
              : const [
                  BoxShadow(
                    color: Color(0x0A34241C),
                    blurRadius: 5,
                    offset: Offset(0, 2),
                  ),
                ],
        ),
        child: InkWell(
          borderRadius: radius,
          onTap: onTap,
          child: Padding(
            padding: EdgeInsets.all(operation ? 8 : 4),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  padding: EdgeInsets.all(operation ? 4 : 0),
                  decoration: BoxDecoration(
                    color: operation ? background : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: _WarehouseSymbol(
                    icon: icon,
                    color: color,
                    size: operation ? 20 : 23,
                  ),
                ),
                if (value != null)
                  Text(
                    '$value',
                    style: const TextStyle(
                      fontSize: 23,
                      height: 1.05,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                SizedBox(height: operation ? 3 : 7),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  style: TextStyle(
                    fontSize: operation ? 11 : 12,
                    height: 1.15,
                    fontWeight: operation ? FontWeight.w400 : FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Heading extends StatelessWidget {
  const _Heading(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Text(
    text,
    style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
  );
}

class _NextPickup extends StatelessWidget {
  const _NextPickup({required this.order, required this.onTap});
  final WarehouseOrder? order;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final pickup = order;
    final progress = pickup == null || pickup.totalRequiredBoxes == 0
        ? 0.0
        : (pickup.totalPreparedBoxes / pickup.totalRequiredBoxes)
              .clamp(0.0, 1.0)
              .toDouble();
    return Material(
      color: const Color(0xFF00432E),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: DefaultTextStyle(
            style: const TextStyle(color: Colors.white, fontSize: 13),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.local_shipping_outlined, color: Colors.white),
                    SizedBox(width: 8),
                    Text(
                      'Next Pickup',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (pickup == null)
                  const Text('No pickups scheduled today')
                else ...[
                  SizedBox(
                    height: 58,
                    width: double.infinity,
                    child: Stack(
                      children: [
                        const Positioned(
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 140,
                          child: _ReferencePhoto(
                            region: Rect.fromLTWH(520, 1030, 224, 103),
                          ),
                        ),
                        Positioned.fill(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  const Color(0xFF00432E),
                                  const Color(0xFF00432E).withValues(alpha: 0),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Text(
                          pickup.customerName,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '${pickup.number} · ${DateFormat.jm().format(pickup.fulfilmentDate.toLocal())} · ${pickup.totalRequiredBoxes} boxes',
                  ),
                  const SizedBox(height: 10),
                  LinearProgressIndicator(
                    value: progress,
                    minHeight: 10,
                    borderRadius: BorderRadius.circular(8),
                    color: Colors.greenAccent,
                    backgroundColor: const Color(0xFFDEDCD7),
                  ),
                  const SizedBox(height: 5),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Picking Progress'),
                      Text('${(progress * 100).round()}%'),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ReferencePhoto extends StatefulWidget {
  const _ReferencePhoto({required this.region});
  final Rect region;
  @override
  State<_ReferencePhoto> createState() => _ReferencePhotoState();
}

class _ReferencePhotoState extends State<_ReferencePhoto> {
  ui.Image? _image;
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await rootBundle.load(
      'assets/warehouse/dashboard_reference.png',
    );
    final codec = await ui.instantiateImageCodec(data.buffer.asUint8List());
    final frame = await codec.getNextFrame();
    codec.dispose();
    if (!mounted) {
      frame.image.dispose();
      return;
    }
    setState(() => _image = frame.image);
  }

  @override
  void dispose() {
    _image?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      CustomPaint(painter: _PhotoPainter(_image, widget.region));
}

class _PhotoPainter extends CustomPainter {
  _PhotoPainter(this.image, this.region);
  final ui.Image? image;
  final Rect region;
  @override
  void paint(Canvas canvas, Size size) {
    if (image == null) return;
    final fitted = applyBoxFit(BoxFit.cover, region.size, size);
    final source = Alignment.center.inscribe(fitted.source, region);
    canvas.drawImageRect(
      image!,
      source,
      Offset.zero & size,
      Paint()..filterQuality = FilterQuality.high,
    );
  }

  @override
  bool shouldRepaint(_PhotoPainter old) =>
      old.image != image || old.region != region;
}

class _WarehouseSymbol extends StatelessWidget {
  const _WarehouseSymbol({
    required this.icon,
    required this.color,
    required this.size,
  });
  final IconData icon;
  final Color color;
  final double size;
  @override
  Widget build(BuildContext context) {
    if (icon != Icons.qr_code_scanner &&
        icon != Icons.verified_user_outlined &&
        icon != Icons.add_box_outlined &&
        icon != Icons.manage_search) {
      return Icon(icon, color: color, size: size);
    }
    return CustomPaint(
      size: Size.square(size),
      painter: _SymbolPainter(icon, color),
    );
  }
}

class _SymbolPainter extends CustomPainter {
  _SymbolPainter(this.icon, this.color);
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
    if (icon == Icons.qr_code_scanner) {
      for (final rect in [
        const Rect.fromLTWH(2, 2, 5, 5),
        const Rect.fromLTWH(17, 2, 5, 5),
        const Rect.fromLTWH(2, 17, 5, 5),
        const Rect.fromLTWH(17, 17, 5, 5),
      ]) {
        final left = rect.left == 2;
        final top = rect.top == 2;
        final x = left ? 2.0 : 22.0;
        final y = top ? 2.0 : 22.0;
        canvas.drawPath(
          Path()
            ..moveTo(x, y + (top ? 4 : -4))
            ..lineTo(x, y)
            ..lineTo(x + (left ? 4 : -4), y),
          p,
        );
      }
      for (final x in [7.0, 10.0, 13.0, 17.0]) {
        canvas.drawLine(Offset(x, 8), Offset(x, 16), p);
      }
    } else if (icon == Icons.verified_user_outlined) {
      canvas.drawPath(
        Path()
          ..moveTo(12, 2)
          ..lineTo(21, 6)
          ..lineTo(20, 15)
          ..quadraticBezierTo(18, 20, 12, 23)
          ..quadraticBezierTo(6, 20, 4, 15)
          ..lineTo(3, 6)
          ..close(),
        p,
      );
      canvas.drawPath(
        Path()
          ..moveTo(7, 12)
          ..lineTo(10, 15)
          ..lineTo(17, 8),
        p,
      );
    } else {
      canvas.drawPath(
        Path()
          ..moveTo(3, 7)
          ..lineTo(12, 2)
          ..lineTo(21, 7)
          ..lineTo(12, 12)
          ..close()
          ..moveTo(3, 7)
          ..lineTo(3, 17)
          ..lineTo(12, 22)
          ..lineTo(12, 12)
          ..moveTo(21, 7)
          ..lineTo(21, 15),
        p,
      );
      if (icon == Icons.manage_search) {
        canvas.drawCircle(const Offset(17, 17), 4, p);
        canvas.drawLine(const Offset(20, 20), const Offset(23, 23), p);
      } else {
        canvas.drawLine(const Offset(17, 15), const Offset(17, 23), p);
        canvas.drawLine(const Offset(13, 19), const Offset(21, 19), p);
      }
    }
  }

  @override
  bool shouldRepaint(_SymbolPainter old) =>
      old.icon != icon || old.color != color;
}
