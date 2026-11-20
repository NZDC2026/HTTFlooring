import '../../../models/sales_quote_quantity.dart';
import '../customers/customer_series_price_screen.dart';
import 'sales_selling_screen.dart';

import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../services/app_session.dart';
import '../../../services/inventory_service.dart';
import '../../../services/pricing_service.dart';
import '../../../services/sales_session.dart';
import '../customers/customer_directory_data.dart';
import '../home/sales_dashboard_support.dart';
import 'inventory_catalog_data.dart';
import '../../../models/product.dart';
import 'product_detail_screen.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../customers/customer_detail_screen.dart';
import '../more/sales_more_screen.dart';

part 'inventory_reference_details.dart';

const _stockMuted = Color(0xFF69766F);
const _stockBorder = Color(0xFFE3E9E5);
const _stockPale = Color(0xFFEAF3EF);
const _stockAmber = Color(0xFFA56B00);
const _categories = ['Engineered Timber', 'Laminate', 'Hybrid', 'Accessories'];

void openInventoryProduct(BuildContext context, Product product) {
  final data = inventoryCatalog(
    demo: SalesDashboardData(context).sample,
    region: context.read<SalesSession>().region,
  );
  for (final series in data) {
    final colour = series.colours
        .where(
          (c) => c.product.id == product.id || c.product.sku == product.sku,
        )
        .firstOrNull;
    if (colour != null) {
      dashboardOpen(
        context,
        InventoryColourDetails(series: series, colour: colour),
      );
      return;
    }
  }
  dashboardOpen(context, ProductDetailScreen(product: product));
}

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});
  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final _search = TextEditingController();
  final Set<String> _openCategories = {}, _openSeries = {};
  String _category = 'All', _style = 'All';
  final String _signal = '';
  String? _customerId;
  bool _low = false;
  @override
  void initState() {
    super.initState();
    InventoryService.receiptChanges.addListener(_stockChanged);
  }

  void _stockChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    InventoryService.receiptChanges.removeListener(_stockChanged);
    _search.dispose();
    super.dispose();
  }

  bool get _demo =>
      AppSession.demoLoginEnabled &&
      (context.read<AppSession>().employeeAccessToken?.isEmpty ?? true);
  double _price(StockColour c, Customer? customer) => customer == null
      ? c.product.standardPrice
      : context.read<PricingService>().getCustomerPrice(
          customerId: customer.id,
          product: c.product,
        );
  List<StockSeries> _matching(List<StockSeries> catalog, {String? category}) {
    final q = _search.text.trim().toLowerCase();
    return catalog
        .where(
          (s) =>
              (category == null || s.category == category) &&
              (!_low || s.lowCount > 0) &&
              (_signal.isEmpty || s.signals.contains(_signal)) &&
              (q.isEmpty ||
                  '${s.name} ${s.category} ${s.style} ${s.dimensions}'
                      .toLowerCase()
                      .contains(q) ||
                  s.colours.any(
                    (c) => '${c.product.colour} ${c.product.sku}'
                        .toLowerCase()
                        .contains(q),
                  )),
        )
        .toList();
  }

  Future<void> _selectCustomer() async {
    final data = CustomerDirectoryData(context);
    final customers = [...data.rows]
      ..sort((a, b) {
        if (a.dueVisit != b.dueVisit) return a.dueVisit ? -1 : 1;
        return (a.distance ?? 9999).compareTo(b.distance ?? 9999);
      });
    String query = '';
    final result = await showGeneralDialog<String>(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Close customer prices',
      barrierColor: const Color(0x66000000),
      transitionDuration: const Duration(milliseconds: 180),
      pageBuilder: (dialog, _, _) => Stack(
        children: [
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 3, sigmaY: 3),
              child: GestureDetector(
                onTap: () => Navigator.pop(dialog),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: DraggableScrollableSheet(
              initialChildSize: .80,
              minChildSize: .4,
              maxChildSize: .96,
              expand: false,
              builder: (sheet, controller) => Material(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(23),
                ),
                clipBehavior: Clip.antiAlias,
                child: StatefulBuilder(
                  builder: (context, update) => SafeArea(
                    top: false,
                    child: Scrollbar(
                      controller: controller,
                      thumbVisibility: true,
                      thickness: 5,
                      radius: const Radius.circular(6),
                      child: ListView(
                        controller: controller,
                        padding: EdgeInsets.fromLTRB(
                          18,
                          10,
                          18,
                          MediaQuery.viewInsetsOf(context).bottom + 18,
                        ),
                        children: [
                          Center(
                            child: Container(
                              width: 38,
                              height: 4,
                              decoration: BoxDecoration(
                                color: const Color(0xFFD5DDD8),
                                borderRadius: BorderRadius.circular(5),
                              ),
                            ),
                          ),
                          const SizedBox(height: 13),
                          Row(
                            children: [
                              const Expanded(
                                child: Text(
                                  'Show prices for',
                                  style: TextStyle(
                                    height: 1.2,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              if (_customerId != null)
                                TextButton(
                                  onPressed: () =>
                                      Navigator.pop(dialog, '__clear__'),
                                  child: const Text(
                                    'Clear',
                                    style: TextStyle(
                                      height: 1.2,
                                      fontSize: 12,
                                      color: Color(0xFF087D46),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 9),
                          SizedBox(
                            height: 42,
                            child: TextField(
                              onChanged: (v) => update(() => query = v),
                              style: const TextStyle(fontSize: 13),
                              decoration: InputDecoration(
                                filled: false,
                                prefixIcon: const Icon(
                                  Icons.search,
                                  size: 17,
                                  color: Color(0xFF95A099),
                                ),
                                hintText: 'Search name or suburb',
                                hintStyle: const TextStyle(
                                  height: 1.2,
                                  fontSize: 13,
                                  color: Color(0xFF98A39D),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 10,
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(11),
                                  borderSide: const BorderSide(
                                    color: _stockBorder,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(11),
                                  borderSide: const BorderSide(
                                    color: _stockBorder,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          for (final r in customers.where(
                            (r) => '${r.customer.businessName} ${r.suburb}'
                                .toLowerCase()
                                .contains(query.toLowerCase()),
                          ))
                            Material(
                              color: r.customer.id == _customerId
                                  ? const Color(0xFFF1F8F4)
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              child: InkWell(
                                onTap: () =>
                                    Navigator.pop(dialog, r.customer.id),
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  decoration: const BoxDecoration(
                                    border: Border(
                                      bottom: BorderSide(
                                        color: Color(0xFFE9EEEB),
                                      ),
                                    ),
                                  ),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 5,
                                    vertical: 10,
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 28,
                                        height: 28,
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          color: r.tier == 'A'
                                              ? const Color(0xFFE3F1E9)
                                              : r.tier == 'B'
                                              ? const Color(0xFFE8EFFF)
                                              : const Color(0xFFEDF0F2),
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: Text(
                                          r.tier,
                                          style: TextStyle(
                                            height: 1.2,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            color: r.tier == 'A'
                                                ? const Color(0xFF157440)
                                                : r.tier == 'B'
                                                ? const Color(0xFF2167CE)
                                                : const Color(0xFF555F65),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              r.customer.businessName,
                                              style: const TextStyle(
                                                height: 1.2,
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 3),
                                            Text.rich(
                                              TextSpan(
                                                children: [
                                                  TextSpan(
                                                    text:
                                                        '${r.suburb}${r.distance == null ? '' : ' · ${NumberFormat('0.#').format(r.distance)} km'} · ',
                                                  ),
                                                  TextSpan(
                                                    text: r.visitDays == null
                                                        ? 'No visit history'
                                                        : 'visited ${r.visitDays} days ago',
                                                    style: TextStyle(
                                                      height: 1.2,
                                                      color: r.visitDays == null
                                                          ? _stockMuted
                                                          : r.visitDays! <= 6
                                                          ? const Color(
                                                              0xFF23A359,
                                                            )
                                                          : r.visitDays! <= 20
                                                          ? const Color(
                                                              0xFFB68A08,
                                                            )
                                                          : const Color(
                                                              0xFFE46626,
                                                            ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              style: const TextStyle(
                                                height: 1.2,
                                                fontSize: 10.5,
                                                color: _stockMuted,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (r.dueVisit)
                                        const Padding(
                                          padding: EdgeInsets.only(left: 5),
                                          child: _StockTag('Due'),
                                        ),
                                      if (r.customer.id == _customerId)
                                        const Padding(
                                          padding: EdgeInsets.only(left: 10),
                                          child: Icon(
                                            Icons.check,
                                            size: 16,
                                            color: Color(0xFF139152),
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
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
    if (!mounted || result == null) return;
    setState(() => _customerId = result == '__clear__' ? null : result);
  }

  void _about() => showGeneralDialog<void>(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Close stock information',
    barrierColor: const Color(0x66000000),
    transitionDuration: const Duration(milliseconds: 150),
    pageBuilder: (dialog, _, _) => Stack(
      children: [
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 3, sigmaY: 3),
            child: GestureDetector(
              onTap: () => Navigator.pop(dialog),
              child: Container(color: Colors.transparent),
            ),
          ),
        ),
        Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Material(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${context.read<SalesSession>().regionName} Warehouse stock',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: 'Available',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                          TextSpan(
                            text: ' = on hand − stock reserved for confirmed orders and holds − damaged stock.',
                          ),
                        ],
                      ),
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.5,
                        color: _stockMuted,
                      ),
                    ),
                    const SizedBox(height: 15),
                    const Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: '+400 · 8 Dec',
                            style: TextStyle(color: Color(0xFF2167CD)),
                          ),
                          TextSpan(
                            text: ' = incoming shipment and its arrival date.',
                          ),
                        ],
                      ),
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.5,
                        color: _stockMuted,
                      ),
                    ),
                    const SizedBox(height: 15),
                    const Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(text: 'Tap '),
                          TextSpan(
                            text: r'$',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                          TextSpan(
                            text: ' to pick a customer and see their prices.',
                          ),
                        ],
                      ),
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.5,
                        color: _stockMuted,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 44,
                      child: FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: dashboardGreen,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () => Navigator.pop(dialog),
                        child: const Text(
                          'Got it',
                          style: TextStyle(
                            fontSize: 13,
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
        ),
      ],
    ),
  );
  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();
    context.watch<AppSession>();
    context.watch<PricingService>();
    final directory = CustomerDirectoryData(context);
    final customer = directory.rows
        .where((r) => r.customer.id == _customerId)
        .firstOrNull
        ?.customer;
    final catalog = inventoryCatalog(demo: _demo, region: session.region);
    final all = _matching(catalog);
    final visible = all
        .where(
          (s) =>
              (_category == 'All' || s.category == _category) &&
              (_category == 'All' || _style == 'All' || s.style == _style),
        )
        .toList();
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        toolbarHeight: 52,
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF203229),
        elevation: 0,
        scrolledUnderElevation: 0,
        titleSpacing: 14,
        title: const Text(
          'Inventory',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
        actions: [
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFE5F3EB),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const InventoryGlyph(
                    'Warehouse',
                    size: 12,
                    color: Color(0xFF24764E),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    session.regionName,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF24764E),
                    ),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            tooltip: 'About stock',
            onPressed: _about,
            icon: const Icon(Icons.info_outline, size: 19),
          ),
        ],
      ),
      body: ValueListenableBuilder<int>(
        valueListenable: InventoryService.receiptChanges,
        builder: (context, _, _) => ListView(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 24),
          children: [
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 42,
                    child: TextField(
                      controller: _search,
                      onChanged: (_) => setState(() {
                        if (_search.text.isNotEmpty) {
                          _openCategories.addAll(_categories);
                        }
                      }),
                      style: const TextStyle(fontSize: 13),
                      decoration: InputDecoration(
                        filled: false,
                        prefixIcon: const Icon(
                          Icons.search,
                          size: 17,
                          color: Color(0xFF98A39D),
                        ),
                        hintText: 'Series, colour, SKU',
                        hintStyle: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF98A39D),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 10,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(11),
                          borderSide: const BorderSide(color: _stockBorder),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(11),
                          borderSide: const BorderSide(color: _stockBorder),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  height: 42,
                  child: OutlinedButton(
                    onPressed: _selectCustomer,
                    style: OutlinedButton.styleFrom(
                      backgroundColor: customer == null
                          ? const Color(0xFFF3F8F5)
                          : dashboardGreen,
                      foregroundColor: customer == null
                          ? dashboardGreen
                          : Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 11),
                      side: BorderSide(
                        color: customer == null
                            ? const Color(0xFFC6DDD0)
                            : dashboardGreen,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        InventoryGlyph(
                          'Customer',
                          size: 15,
                          color: customer == null
                              ? dashboardGreen
                              : Colors.white,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          customer == null
                              ? 'Customer'
                              : customer.businessName
                                    .split(' ')
                                    .where((s) => s.isNotEmpty)
                                    .take(2)
                                    .map((s) => s[0])
                                    .join(),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Transform.rotate(
                          angle: 1.5708,
                          child: const Icon(Icons.chevron_right, size: 13),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              height: 46,
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: const Color(0xFFEDF0EE),
                borderRadius: BorderRadius.circular(11),
              ),
              child: Row(
                children: [
                  for (final cat in ['All', ..._categories])
                    Expanded(
                      flex: cat == 'All' ? 6 : 10,
                      child: Material(
                        color: _category == cat
                            ? Colors.white
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        child: InkWell(
                          onTap: () => setState(() {
                            _category = cat;
                            _style = 'All';
                            if (cat == 'Engineered Timber') {
                              _openSeries.add('bonita');
                            }
                          }),
                          borderRadius: BorderRadius.circular(8),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '${all.where((s) => cat == 'All' || s.category == cat).length}',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: _category == cat
                                      ? const Color(0xFF0A8550)
                                      : _stockMuted,
                                ),
                              ),
                              const SizedBox(height: 2),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Text(
                                  cat == 'Engineered Timber'
                                      ? 'Engineered'
                                      : cat,
                                  style: TextStyle(
                                    fontSize: 9.5,
                                    color: _category == cat
                                        ? dashboardGreen
                                        : _stockMuted,
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
            if (_category != 'All') ...[
              const SizedBox(height: 9),
              _styleFilters(all),
            ],
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 1),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      '${visible.length} series',
                      style: const TextStyle(fontSize: 11, color: _stockMuted),
                    ),
                  ),
                  SizedBox(
                    width: 30,
                    height: 20,
                    child: OverflowBox(
                      maxWidth: 54,
                      maxHeight: 40,
                      child: Transform.scale(
                        scale: .55,
                        alignment: Alignment.center,
                        child: Switch(
                          value: _low,
                          activeThumbColor: Colors.white,
                          activeTrackColor: const Color(0xFFC48C10),
                          inactiveThumbColor: Colors.white,
                          inactiveTrackColor: const Color(0xFFD9DFDC),
                          trackOutlineColor: const WidgetStatePropertyAll(
                            Colors.transparent,
                          ),
                          onChanged: (v) => setState(() {
                            _low = v;
                            if (v) {
                              _openCategories.addAll(_categories);
                              _openSeries.add('bonita');
                            }
                          }),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 2),
                  GestureDetector(
                    onTap: () => setState(() {
                      _low = !_low;
                      if (_low) {
                        _openCategories.addAll(_categories);
                        _openSeries.add('bonita');
                      }
                    }),
                    child: Text(
                      'Low stock only',
                      style: TextStyle(
                        fontSize: 10.5,
                        color: _low ? _stockAmber : _stockMuted,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (!_low && _category == 'All') ...[
              _signals(catalog),
              const SizedBox(height: 14),
            ],
            if (visible.isEmpty)
              const Padding(
                padding: EdgeInsets.all(28),
                child: Text(
                  'No products match these filters',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: _stockMuted),
                ),
              ),
            if (_category != 'All')
              _focusedSeries(visible, customer)
            else ...[
              for (final category in _categories)
                if (visible.any((s) => s.category == category))
                  _categoryCard(
                    category,
                    visible.where((s) => s.category == category).toList(),
                    catalog.where((s) => s.category == category).toList(),
                    customer,
                  ),
            ],
            Padding(
              padding: const EdgeInsets.fromLTRB(2, 2, 2, 0),
              child: Text(
                '${_demo ? 'ⓘ Demo inventory' : 'ⓘ Prices excl. GST'} · ${session.regionName} stock${_demo ? ' · prices excl. GST' : ' · local snapshot'}',
                style: const TextStyle(fontSize: 10, color: _stockMuted),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _styleFilters(List<StockSeries> catalog) {
    final rows = catalog.where((s) => s.category == _category).toList();
    final styles = _category == 'Accessories'
        ? ['All', 'Profiles', 'Underlay & Barrier', 'Adhesive', 'Care', 'Tools']
        : ['All', 'Plank', 'Herringbone', 'Chevron'];
    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: [
        for (final style in styles)
          Builder(
            builder: (context) {
              final count = rows
                  .where((s) => style == 'All' || s.style == style)
                  .length;
              final active = _style == style;
              final label = style == 'Underlay & Barrier' ? 'Underlay' : style;
              return Semantics(
                button: true,
                selected: active,
                enabled: count > 0,
                child: InkWell(
                  onTap: count == 0
                      ? null
                      : () => setState(() => _style = style),
                  borderRadius: BorderRadius.circular(22),
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: _category == 'Accessories' ? 9 : 14,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color: active ? dashboardGreen : Colors.white,
                      border: Border.all(
                        color: active
                            ? dashboardGreen
                            : const Color(0xFFE5E1D9),
                      ),
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(text: label),
                          TextSpan(
                            text: '  $count',
                            style: TextStyle(
                              fontSize: 9,
                              color: active
                                  ? const Color(0xFFD0E6D9)
                                  : count == 0
                                  ? const Color(0xFFC7CBC8)
                                  : const Color(0xFF8C9991),
                            ),
                          ),
                        ],
                      ),
                      style: TextStyle(
                        fontSize: _category == 'Accessories' ? 10.5 : 11,
                        color: active
                            ? Colors.white
                            : count == 0
                            ? const Color(0xFFB8BFBA)
                            : const Color(0xFF56665C),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _focusedSeries(List<StockSeries> rows, Customer? customer) => Column(
    children: [
      for (final style in rows.map((s) => s.style).toSet()) ...[
        Padding(
          padding: const EdgeInsets.fromLTRB(1, 8, 1, 10),
          child: Row(
            children: [
              InventoryGlyph(style, size: 15, color: const Color(0xFF12804C)),
              const SizedBox(width: 8),
              Text(
                style,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: dashboardGreen,
                ),
              ),
              const SizedBox(width: 7),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: const Color(0xFFE0F0E6),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${rows.where((s) => s.style == style).length}',
                  style: const TextStyle(fontSize: 9, color: Color(0xFF54836B)),
                ),
              ),
            ],
          ),
        ),
        for (final series in rows.where((s) => s.style == style))
          _seriesCard(series, customer),
      ],
    ],
  );

  Widget _signals(List<StockSeries> catalog) => Container(
    padding: const EdgeInsets.symmetric(vertical: 9),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: _stockBorder),
      borderRadius: BorderRadius.circular(15),
      boxShadow: const [
        BoxShadow(
          color: Color(0x0C000000),
          blurRadius: 3,
          offset: Offset(0, 2),
        ),
      ],
    ),
    child: Row(
      children: [
        for (final entry in [
          (
            CupertinoIcons.star,
            'New',
            const Color(0xFFAA7100),
            const Color(0xFFFFF3D9),
          ),
          (
            Icons.local_shipping_outlined,
            'Incoming',
            const Color(0xFF2167CD),
            const Color(0xFFE6EFFF),
          ),
          (
            CupertinoIcons.tag,
            'Promotion',
            const Color(0xFF187B4A),
            const Color(0xFFE4F2EA),
          ),
          (
            Icons.trending_down,
            'Clearance',
            const Color(0xFFDF3C45),
            const Color(0xFFFFE7EA),
          ),
        ])
          Expanded(
            child: InkWell(
              onTap: () =>
                  dashboardOpen(context, SalesSellingScreen(type: entry.$2)),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: entry.$4,
                          borderRadius: BorderRadius.circular(7),
                        ),
                        child: DashboardIcon(
                          entry.$1,
                          size: 13,
                          color: entry.$3,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        '${catalog.where((s) => s.signals.contains(entry.$2)).length}',
                        style: const TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    entry.$2,
                    style: TextStyle(
                      fontSize: 10,
                      color: _signal == entry.$2 ? dashboardGreen : _stockMuted,
                      fontWeight: _signal == entry.$2
                          ? FontWeight.w700
                          : FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    ),
  );
  Widget _categoryCard(
    String category,
    List<StockSeries> visible,
    List<StockSeries> complete,
    Customer? customer,
  ) {
    final open = _openCategories.contains(category);
    final floor = category != 'Accessories';
    final area = complete.fold(0.0, (s, c) => s + c.area),
        qty = complete.fold(0, (s, c) => s + c.quantity),
        low = complete.fold(0, (s, c) => s + c.lowCount);
    final styles = visible.map((s) => s.style).toSet().toList();
    return Container(
      margin: const EdgeInsets.only(bottom: 13),
      foregroundDecoration: BoxDecoration(
        border: Border.all(color: open ? dashboardGreen : _stockBorder),
        borderRadius: BorderRadius.circular(17),
      ),
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: open ? _stockPale : Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(color: open ? dashboardGreen : _stockBorder),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D000000),
            blurRadius: 3,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Material(
            color: open ? dashboardGreen : Colors.white,
            child: InkWell(
              onTap: () => setState(
                () => open
                    ? _openCategories.remove(category)
                    : _openCategories.add(category),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 41,
                      height: 41,
                      decoration: BoxDecoration(
                        color: open
                            ? Colors.white.withValues(alpha: .20)
                            : dashboardGreen,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: InventoryGlyph(
                          category,
                          size: 22,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            category,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: open ? Colors.white : dashboardGreen,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            category == 'Accessories'
                                ? 'Profiles, underlay, adhesive & more'
                                : '${complete.length} series · ${complete.map((s) => s.style).toSet().length > 1 ? '${complete.map((s) => s.style).toSet().length} styles' : complete.first.style}',
                            style: TextStyle(
                              fontSize: 10.5,
                              color: open
                                  ? const Color(0xFFBCD4C7)
                                  : _stockMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(
                                text: NumberFormat('#,##0')
                                    .format(floor ? area : visible.length),
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              TextSpan(
                                text: floor ? ' m²' : ' types',
                                style: const TextStyle(fontSize: 9),
                              ),
                            ],
                          ),
                          style: TextStyle(
                            color: open
                                ? Colors.white
                                : const Color(0xFF1B2D23),
                          ),
                        ),
                        if (floor)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(
                              '${NumberFormat('#,##0').format(qty)} boxes',
                              style: TextStyle(
                                fontSize: 10,
                                color: open
                                    ? const Color(0xFFBCD4C7)
                                    : _stockMuted,
                              ),
                            ),
                          ),
                        if (low > 0)
                          Padding(
                            padding: const EdgeInsets.only(top: 3),
                            child: _StockTag('$low low'),
                          ),
                      ],
                    ),
                    const SizedBox(width: 10),
                    Transform.rotate(
                      angle: open ? -1.5708 : 1.5708,
                      child: Icon(
                        Icons.chevron_right,
                        size: 15,
                        color: open
                            ? const Color(0xFFBCD4C7)
                            : const Color(0xFF8A9991),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (open)
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 5, 12, 12),
              child: Column(
                children: [
                  for (final style in styles) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(0, 7, 0, 9),
                      child: Row(
                        children: [
                          InventoryGlyph(
                            style,
                            size: 15,
                            color: dashboardGreen,
                          ),
                          const SizedBox(width: 7),
                          Text(
                            style,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: dashboardGreen,
                            ),
                          ),
                          const SizedBox(width: 7),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 1,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDDEEE4),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '${visible.where((s) => s.style == style).length}',
                              style: const TextStyle(
                                fontSize: 9,
                                color: Color(0xFF54836B),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    for (final series in visible.where((s) => s.style == style))
                      _seriesCard(series, customer),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _seriesCard(StockSeries series, Customer? customer) {
    final open = _openSeries.contains(series.id);
    final q = _search.text.toLowerCase();
    final colours = series.colours
        .where(
          (c) =>
              (!_low || c.low) &&
              (q.isEmpty ||
                  '${series.name} ${series.category} ${series.style}'
                      .toLowerCase()
                      .contains(q) ||
                  '${c.product.colour} ${c.product.sku}'.toLowerCase().contains(
                    q,
                  )),
        )
        .toList();
    final minPrice = series.colours
        .map((c) => _price(c, customer))
        .reduce((a, b) => a < b ? a : b);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      foregroundDecoration: BoxDecoration(
        border: Border.all(
          color: open ? const Color(0xFFCFE2D8) : const Color(0xFFE5EBE7),
        ),
        borderRadius: BorderRadius.circular(15),
      ),
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: open ? _stockPale : Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: open ? const Color(0xFFCFE2D8) : const Color(0xFFE5EBE7),
        ),
      ),
      child: Column(
        children: [
          Material(
            color: Colors.white,
            child: InkWell(
              onTap: () => setState(
                () => open
                    ? _openSeries.remove(series.id)
                    : _openSeries.add(series.id),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 11,
                  vertical: 12,
                ),
                child: Row(
                  children: [
                    InventorySwatch(
                      seed: series.id,
                      size: 42,
                      single: series.colours.length == 1,
                    ),
                    const SizedBox(width: 11),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            spacing: 5,
                            runSpacing: 3,
                            children: [
                              Text(
                                series.name,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEDF1EF),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${series.colours.length} ${series.flooring || series.style == 'Profiles'
                                      ? 'colours'
                                      : series.colours.length == 1
                                      ? 'option'
                                      : 'options'}',
                                  style: const TextStyle(
                                    fontSize: 9,
                                    color: _stockMuted,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text(
                            series.dimensions,
                            style: const TextStyle(
                              fontSize: 10.5,
                              color: _stockMuted,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            'From \$${minPrice.toStringAsFixed(2)}/${series.priceUnit}',
                            style: const TextStyle(
                              fontSize: 10.5,
                              color: Color(0xFF34483B),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(
                                text: NumberFormat('#,##0').format(
                                  series.flooring
                                      ? series.area
                                      : series.quantity,
                                ),
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              TextSpan(
                                text: series.flooring
                                    ? ' m²'
                                    : ' ${series.unit}',
                                style: const TextStyle(
                                  fontSize: 9,
                                  color: _stockMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (series.flooring)
                          Padding(
                            padding: const EdgeInsets.only(top: 3),
                            child: Text(
                              '${NumberFormat('#,##0').format(series.quantity)} boxes',
                              style: const TextStyle(
                                fontSize: 10,
                                color: _stockMuted,
                              ),
                            ),
                          ),
                        if (series.lowCount > 0)
                          Padding(
                            padding: const EdgeInsets.only(top: 3),
                            child: _StockTag('${series.lowCount} low'),
                          ),
                      ],
                    ),
                    const SizedBox(width: 8),
                    Transform.rotate(
                      angle: open ? -1.5708 : 1.5708,
                      child: const Icon(
                        Icons.chevron_right,
                        size: 14,
                        color: Color(0xFF8D9D94),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (open) ...[
            Container(height: 1, color: _stockBorder),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                children: [
                  for (final c in (_low ? colours : colours.take(5)))
                    _colourRow(series, c, customer),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => dashboardOpen(
                        context,
                        InventorySeriesDetails(
                          series: series,
                          customer: customer,
                        ),
                      ),
                      style: TextButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                      ),
                      child: Text(
                        _low
                            ? 'Series details  ›'
                            : 'View all ${series.colours.length} ${series.flooring || series.style == 'Profiles' ? 'colours' : 'options'}  ›',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF087D46),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _colourRow(
    StockSeries series,
    StockColour c,
    Customer? customer,
  ) => Material(
    color: Colors.white,
    borderRadius: BorderRadius.circular(11),
    child: InkWell(
      onTap: () => dashboardOpen(
        context,
        InventoryColourDetails(series: series, colour: c, customer: customer),
      ),
      borderRadius: BorderRadius.circular(11),
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          border: Border.all(color: _stockBorder),
          borderRadius: BorderRadius.circular(11),
        ),
        child: Row(
          children: [
            InventorySwatch(seed: c.product.colour, size: 28, single: true),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.product.colour,
                    style: const TextStyle(fontSize: 12, height: 1.2),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${c.product.sku} · \$${_price(c, customer).toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 10,
                      height: 1.2,
                      color: _stockMuted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 7),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: NumberFormat('#,##0')
                            .format(series.flooring ? c.area : c.quantity),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      TextSpan(
                        text: ' ${series.flooring ? 'm²' : series.unit}',
                        style: const TextStyle(fontSize: 9),
                      ),
                      if (series.flooring)
                        TextSpan(
                          text: '  ${c.quantity} bx',
                          style: const TextStyle(fontSize: 10),
                        ),
                    ],
                  ),
                  style: TextStyle(
                    height: 1.2,
                    color: c.low ? _stockAmber : const Color(0xFF26392D),
                  ),
                ),
                if (c.low)
                  const Padding(
                    padding: EdgeInsets.only(top: 3),
                    child: _StockTag('Low'),
                  ),
                if (c.incoming > 0)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE7EFFF),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '+${NumberFormat('#,##0').format(c.incoming)} m² · ${c.eta}',
                        style: const TextStyle(
                          fontSize: 9,
                          color: Color(0xFF2167CD),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}

class _StockTag extends StatelessWidget {
  const _StockTag(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
    decoration: BoxDecoration(
      color: const Color(0xFFFFF3DA),
      borderRadius: BorderRadius.circular(6),
    ),
    child: Text(
      text,
      style: const TextStyle(
        fontSize: 9.5,
        fontWeight: FontWeight.w500,
        color: _stockAmber,
      ),
    ),
  );
}

class InventorySwatch extends StatelessWidget {
  const InventorySwatch({
    super.key,
    required this.seed,
    required this.size,
    this.single = false,
  });
  final String seed;
  final double size;
  final bool single;
  @override
  Widget build(BuildContext context) => SizedBox(
    width: size,
    height: size,
    child: ClipRRect(
      borderRadius: BorderRadius.circular(9),
      child: CustomPaint(painter: _SwatchPainter(seed, single)),
    ),
  );
}

class _SwatchPainter extends CustomPainter {
  _SwatchPainter(this.seed, this.single);
  final String seed;
  final bool single;
  @override
  void paint(Canvas canvas, Size size) {
    final palettes = <List<Color>>[
      [
        const Color(0xFFBD925E),
        const Color(0xFFDACFBA),
        const Color(0xFFAA916D),
      ],
      [
        const Color(0xFFDDD9D0),
        const Color(0xFF4D504B),
        const Color(0xFFB8915C),
      ],
      [
        const Color(0xFFAFC2B9),
        const Color(0xFFBBCDD5),
        const Color(0xFF88AC9B),
      ],
    ];
    final n = seed.codeUnits.fold(0, (s, c) => s + c);
    final key = seed.toLowerCase();
    var colors = key.contains('tools')
        ? [
            const Color(0xFFDDAF38),
            const Color(0xFFC6A04B),
            const Color(0xFFB28A31),
          ]
        : key.contains('care') || key.contains('clean')
        ? palettes[2]
        : key.contains('mtf') ||
              key.contains('aquaglow') ||
              key.contains('underlay') ||
              key.contains('silver')
        ? palettes[1]
        : key.contains('cotton')
        ? [
            const Color(0xFFD9CFBE),
            const Color(0xFFBEB7A9),
            const Color(0xFFC9C1B2),
          ]
        : [
            const Color(0xFFBB8B50),
            const Color(0xFFCCC0A7),
            Color(n.isEven ? 0xFFAD8A5E : 0xFF967859),
          ];
    const reference = <String, List<Color>>{
      'natural oak': [Color(0xFFB88B55), Color(0xFFA77D4C), Color(0xFFA77D4C)],
      'coastal oak': [Color(0xFFD0B895), Color(0xFFB8A181), Color(0xFFB8A181)],
      'latte oak': [Color(0xFFC6A17B), Color(0xFFB38D6B), Color(0xFFB38D6B)],
      'lime wash': [Color(0xFFD9D0BE), Color(0xFFC1B8A8), Color(0xFFC1B8A8)],
      'grey wash': [Color(0xFFAAA79F), Color(0xFF99978F), Color(0xFF99978F)],
      'scotia': [Color(0xFFBA8B56), Color(0xFFD6D5CF), Color(0xFF303030)],
      'skirting': [Color(0xFFDDD9D0), Color(0xFF2C2C2C), Color(0xFFB88C58)],
      'tmould': [Color(0xFFC29159), Color(0xFF9A9690), Color(0xFFAFB3B3)],
      'reducer': [Color(0xFFBE905C), Color(0xFFAFB4B8), Color(0xFFAFB4B8)],
      'endcap': [Color(0xFFBA8B56), Color(0xFF2C2C2C), Color(0xFF2C2C2C)],
      'barrier': [Color(0xFFD1D8DC), Color(0xFFB8C2C7), Color(0xFFB8C2C7)],
      'adhesive': [Color(0xFFDDD6C5), Color(0xFFCCC7B8), Color(0xFFCCC7B8)],
      'tools': [Color(0xFFDDAF38), Color(0xFFC6A04B), Color(0xFFC6A04B)],
    };
    colors = reference[key] ?? colors;
    if (single) {
      canvas.drawRect(
        Offset.zero & size,
        Paint()
          ..shader = LinearGradient(colors: [colors[0], colors[1]])
              .createShader(Offset.zero & size),
      );
    } else {
      canvas.drawRect(
        Rect.fromLTWH(0, 0, size.width * .49, size.height),
        Paint()..color = colors[0],
      );
      if (colors[1] == colors[2]) {
        canvas.drawRect(
          Rect.fromLTWH(size.width * .52, 0, size.width * .48, size.height),
          Paint()..color = colors[1],
        );
        return;
      }
      canvas.drawRect(
        Rect.fromLTWH(size.width * .52, 0, size.width * .48, size.height * .48),
        Paint()..color = colors[1],
      );
      canvas.drawRect(
        Rect.fromLTWH(
          size.width * .52,
          size.height * .52,
          size.width * .48,
          size.height * .48,
        ),
        Paint()..color = colors[2],
      );
    }
  }

  @override
  bool shouldRepaint(_SwatchPainter old) =>
      old.seed != seed || old.single != single;
}

class InventoryGlyph extends StatelessWidget {
  const InventoryGlyph(
    this.kind, {
    super.key,
    this.size = 20,
    this.color = dashboardGreen,
  });
  final String kind;
  final double size;
  final Color color;
  @override
  Widget build(BuildContext context) => SizedBox(
    width: size,
    height: size,
    child: CustomPaint(painter: _InventoryGlyphPainter(kind, color)),
  );
}

class _InventoryGlyphPainter extends CustomPainter {
  _InventoryGlyphPainter(this.kind, this.color);
  final String kind;
  final Color color;
  @override
  void paint(Canvas c, Size s) {
    c.save();
    c.scale(s.width / 24, s.height / 24);
    final p = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final path = Path();
    if (kind == 'Warehouse') {
      path.moveTo(3, 21);
      path.lineTo(3, 8);
      path.lineTo(12, 3);
      path.lineTo(21, 8);
      path.lineTo(21, 21);
      path.moveTo(7, 21);
      path.lineTo(7, 12);
      path.lineTo(17, 12);
      path.lineTo(17, 21);
      path.moveTo(7, 16);
      path.lineTo(17, 16);
    } else if (kind == 'Customer') {
      c.drawCircle(const Offset(12, 7), 4, p);
      path.moveTo(4, 22);
      path.cubicTo(4, 12, 20, 12, 20, 22);
    } else if (kind == 'Engineered Timber' || kind == 'Underlay & Barrier') {
      path.moveTo(3, 8);
      path.lineTo(12, 3);
      path.lineTo(21, 8);
      path.lineTo(12, 13);
      path.close();
      path.moveTo(3, 12);
      path.lineTo(12, 17);
      path.lineTo(21, 12);
      path.moveTo(3, 16);
      path.lineTo(12, 21);
      path.lineTo(21, 16);
    } else if (kind == 'Laminate' || kind == 'Plank') {
      path.addRRect(
        RRect.fromRectAndRadius(
          const Rect.fromLTWH(3, 4, 18, 6),
          const Radius.circular(1),
        ),
      );
      path.addRRect(
        RRect.fromRectAndRadius(
          const Rect.fromLTWH(3, 14, 18, 6),
          const Radius.circular(1),
        ),
      );
    } else if (kind == 'Hybrid') {
      for (final y in [6.0, 11.0, 16.0]) {
        path.moveTo(3, y);
        path.cubicTo(6, y - 4, 8, y + 4, 12, y);
        path.cubicTo(16, y - 4, 18, y + 4, 21, y);
      }
    } else if (kind == 'Accessories') {
      path.moveTo(12, 2);
      path.lineTo(21, 7);
      path.lineTo(21, 17);
      path.lineTo(12, 22);
      path.lineTo(3, 17);
      path.lineTo(3, 7);
      path.close();
      path.moveTo(3, 7);
      path.lineTo(12, 12);
      path.lineTo(21, 7);
      path.moveTo(12, 12);
      path.lineTo(12, 22);
    } else if (kind == 'Herringbone' || kind == 'Chevron') {
      for (final y in [6.0, 14.0]) {
        path.moveTo(4, y);
        path.lineTo(12, y + 5);
        path.lineTo(20, y);
      }
    } else if (kind == 'Profiles') {
      path.moveTo(5, 3);
      path.lineTo(5, 20);
      path.lineTo(21, 20);
      path.moveTo(9, 3);
      path.lineTo(9, 16);
      path.lineTo(21, 16);
    } else if (kind == 'Adhesive') {
      path.moveTo(5, 6);
      path.lineTo(19, 6);
      path.lineTo(17, 21);
      path.lineTo(7, 21);
      path.close();
      path.moveTo(4, 3);
      path.lineTo(20, 3);
    } else if (kind == 'Care') {
      path.addRRect(
        RRect.fromRectAndRadius(
          const Rect.fromLTWH(7, 8, 10, 13),
          const Radius.circular(2),
        ),
      );
      path.addRect(const Rect.fromLTWH(9, 3, 6, 5));
    } else {
      path.moveTo(5, 20);
      path.lineTo(19, 6);
      path.moveTo(4, 16);
      path.lineTo(8, 20);
      path.moveTo(15, 4);
      path.lineTo(20, 9);
    }
    c.drawPath(path, p);
    c.restore();
  }

  @override
  bool shouldRepaint(_InventoryGlyphPainter old) =>
      old.kind != kind || old.color != color;
}
