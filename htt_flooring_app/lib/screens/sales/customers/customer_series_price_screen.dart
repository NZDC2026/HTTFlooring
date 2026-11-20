import '../inventory/inventory_screen.dart' show InventorySwatch;
import '../../../widgets/sales_task_completion.dart';

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../models/app_user.dart';
import '../../../models/sales_user.dart';
import '../../../models/customer.dart';
import '../../../models/product.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/local_sales_request_store.dart';
import '../../../services/pricing_service.dart';
import '../../../widgets/sales_date_picker.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../home/sales_dashboard_support.dart';
import '../inventory/inventory_catalog_data.dart';

void seedCustomerReferencePrices(
  BuildContext context,
  Customer customer,
  List<StockSeries> catalog,
) {
  if (!SalesDashboardData(context).sample || customer.id != 'abc') return;
  context.read<PricingService>().seedReferencePrices(customer.id, {
    for (final s in catalog)
      for (var i = 0; i < s.colours.length; i++)
        s.colours[i].product: s.name == 'Bonita'
            ? i == 0
                  ? 69
                  : i == 1
                  ? 71.5
                  : [7, 9, 11].contains(i)
                  ? 72.5
                  : 69.5
            : s.name == 'Heritage'
            ? 81
            : s.name == 'Studio'
            ? 93.5
            : s.name == 'Guardian'
            ? 47.5
            : s.name == 'MTF'
            ? 32
            : s.name == 'AquaGlow'
            ? 44
            : s.colours[i].product.standardPrice * .85,
  });
}

class CustomerSeriesPriceScreen extends StatefulWidget {
  const CustomerSeriesPriceScreen({
    super.key,
    required this.customer,
    required this.series,
  });
  final Customer customer;
  final StockSeries series;
  @override
  State<CustomerSeriesPriceScreen> createState() => _CustomerSeriesPriceState();
}

class _CustomerSeriesPriceState extends State<CustomerSeriesPriceScreen> {
  final _prices = <String, TextEditingController>{},
      _initial = <String, double>{};
  final _bulk = TextEditingController(),
      _note = TextEditingController(),
      _reason = TextEditingController(),
      _task = TextEditingController();
  final _selected = <String>{};
  final _history = <Map<String, dynamic>>[];
  DateTime _from = DateUtils.dateOnly(DateTime.now()),
      _due = DateUtils.dateOnly(DateTime.now().add(const Duration(days: 30)));
  DateTime? _until;
  bool _ready = false,
      _saving = false,
      _levels = true,
      _follow = false,
      _high = false,
      _leaving = false;
  late AppUser _owner;
  String? _error;
  List<Product> get _products =>
      widget.series.colours.map((c) => c.product).toList();
  List<Product> get _changed => _products
      .where(
        (p) => double.tryParse(_prices[p.id]?.text ?? '') != _initial[p.id],
      )
      .toList();
  List<Product> get _below => _changed.where((p) {
    final n = double.tryParse(_prices[p.id]?.text ?? '');
    return n != null && n.isFinite && n > 0 && n < p.salesFloorPrice;
  }).toList();
  bool get _valid =>
      _changed.isNotEmpty &&
      _changed.every((p) {
        final n = double.tryParse(_prices[p.id]!.text);
        return n != null && n.isFinite && n > 0;
      }) &&
      (_below.isEmpty || _reason.text.trim().isNotEmpty) &&
      (_until == null || !_until!.isBefore(_from));
  String get _key =>
      'customer-price-history-${context.read<AppSession>().currentUser.id}-${widget.customer.id}-${widget.series.id}';
  String _cash(num n) => NumberFormat.currency(symbol: '\$').format(n);
  String _tier(Product p, double n) => n < p.salesFloorPrice
      ? 'Below floor'
      : n <= p.standardPrice * .8 + .001
      ? 'Container'
      : n <= p.standardPrice * .85 + .001
      ? 'VVIP'
      : n <= p.standardPrice * .9 + .001
      ? 'VIP'
      : 'Standard';
  void _changedInput() {
    if (mounted) setState(() {});
  }

  @override
  void initState() {
    super.initState();
    for (final c in [_bulk, _note, _reason, _task]) {
      c.addListener(_changedInput);
    }
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final pricing = context.read<PricingService>();
    _owner = context.read<AppSession>().currentUser;
    await pricing.ready;
    if (!mounted) return;
    seedCustomerReferencePrices(context, widget.customer, [widget.series]);
    for (final p in _products) {
      final value = pricing.getCustomerPrice(
        customerId: widget.customer.id,
        product: p,
      );
      _initial[p.id] = value;
      _prices[p.id] = TextEditingController(text: value.toStringAsFixed(2))
        ..addListener(_changedInput);
    }
    try {
      final prefs = await SharedPreferences.getInstance();
      _history.addAll(
        (jsonDecode(prefs.getString(_key) ?? '[]') as List).map(
          (r) => Map<String, dynamic>.from(r as Map),
        ),
      );
    } catch (_) {}
    if (mounted) setState(() => _ready = true);
  }

  @override
  void dispose() {
    for (final c in [..._prices.values, _bulk, _note, _reason, _task]) {
      c.dispose();
    }
    super.dispose();
  }

  void _applyBulk() {
    final value = double.tryParse(_bulk.text);
    if (value == null || !value.isFinite || value <= 0 || _selected.isEmpty) {
      return;
    }
    for (final id in _selected) {
      _prices[id]!.text = value.toStringAsFixed(2);
    }
    _bulk.clear();
  }

  Future<void> _date(bool until) async {
    final day = await pickSalesDate(
      context: context,
      initialDate: until ? _until ?? _from : _from,
      firstDate: until ? _from : DateUtils.dateOnly(DateTime.now()),
      lastDate: DateTime.now().add(const Duration(days: 3650)),
      helpText: until ? 'Price until' : 'Price from',
    );
    if (day == null || !mounted) return;
    setState(() {
      if (until) {
        _until = day;
      } else {
        _from = day;
        if (_until?.isBefore(day) ?? false) _until = null;
      }
    });
  }

  Future<void> _leave() async {
    if (_saving) return;
    setState(() => _leaving = true);
    Navigator.pop(context);
  }

  Future<void> _save() async {
    if (!_valid || _saving) return;
    final user = context.read<AppSession>().currentUser;
    final pricing = context.read<PricingService>(),
        notes = context.read<CustomerNoteService>();
    final changed = _changed, below = _below;
    final valid = {
      for (final p in changed.where((p) => !below.contains(p)))
        p: double.parse(_prices[p.id]!.text),
    };
    final records = [
      for (final p in changed)
        <String, dynamic>{
          'productId': p.id,
          'product': p.colour,
          'sku': p.sku,
          'before': _initial[p.id],
          'after': double.parse(_prices[p.id]!.text),
          'approval': below.contains(p),
        },
    ];
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      if (below.isNotEmpty) {
        await LocalSalesRequestStore.append(user.id, {
          'kind': 'Price',
          'customerId': widget.customer.id,
          'customer': widget.customer.businessName,
          'series': widget.series.name,
          'product': below.map((p) => p.colour).join(', '),
          'price': double.parse(_prices[below.first.id]!.text),
          'sku': below.first.sku,
          'items': records.where((r) => r['approval'] == true).toList(),
          'note': _reason.text.trim(),
          'from': _from.toIso8601String(),
          'until': _until?.toIso8601String(),
        });
      }
      if (valid.isNotEmpty) {
        await pricing.savePricePeriods(
          customerId: widget.customer.id,
          prices: valid,
          from: _from,
          until: _until,
        );
      }
      final history = {
        'id': DateTime.now().microsecondsSinceEpoch.toString(),
        'at': DateTime.now().toIso8601String(),
        'author': user.name,
        'note': _note.text.trim(),
        'reason': _reason.text.trim(),
        'from': _from.toIso8601String(),
        'until': _until?.toIso8601String(),
        'items': records,
      };
      _history.insert(0, history);
      await (await SharedPreferences.getInstance()).setString(
        _key,
        jsonEncode(_history),
      );
      if (_note.text.trim().isNotEmpty) {
        notes.addNote(
          customerId: widget.customer.id,
          content: _note.text.trim(),
          noteType: 'Special Price',
          author: user,
        );
      }
      if (_follow) {
        if (!mounted) return;
        await createNextSalesFollowUp(
          context,
          SalesTaskCompletion('Special Price', nextDate: _due),
          customerId: widget.customer.id,
          content: _task.text.trim().isEmpty
              ? 'Review special price — ${widget.customer.businessName}'
              : _task.text.trim(),
          type: 'Special Price',
          assignees: [_owner],
          priority: _high ? 'High' : 'Normal',
        );
      }
      if (!mounted) return;
      final messenger = ScaffoldMessenger.of(context);
      setState(() => _leaving = true);
      Navigator.pop(context, true);
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            below.isEmpty
                ? '${valid.length} prices saved'
                : valid.isEmpty
                ? '${below.length} price changes awaiting approval'
                : '${valid.length} prices saved · ${below.length} awaiting approval',
          ),
        ),
      );
    } catch (_) {
      if (mounted) {
        setState(
          () => _error =
              'Could not save all changes. Review the prices and try again.',
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final first = _products.first;
    final level = _ready ? _tier(first, _initial[first.id]!) : 'Standard';
    final me = context.read<AppSession>().currentUser;
    final owners = [
      me,
      if (SalesDashboardData(context).sample) ...[
        if (me.id != AppSession.liWei.id) AppSession.liWei,
        const AppUser(
          id: 'manager-sarah',
          name: 'Sarah Chen',
          email: '',
          role: UserRole.manager,
          region: SalesRegion.sydney,
        ),
        const AppUser(
          id: 'accounts',
          name: 'Account',
          email: '',
          role: UserRole.admin,
          region: SalesRegion.sydney,
        ),
      ],
    ];
    return PopScope(
      canPop: _leaving,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _leave();
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: dashboardBar('Customer price'),
        body: !_ready
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.fromLTRB(14, 14, 14, 24),
                children: [
                  Text(
                    widget.customer.businessName,
                    style: const TextStyle(fontSize: 12, color: detailMuted),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${widget.series.category} · ${widget.series.style}'
                        .toUpperCase(),
                    style: const TextStyle(
                      fontSize: 10,
                      letterSpacing: .6,
                      color: detailMuted,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    widget.series.name,
                    style: const TextStyle(
                      fontSize: 25,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    '${_products.length} colours · now at $level',
                    style: const TextStyle(fontSize: 12, color: detailMuted),
                  ),
                  const SizedBox(height: 14),
                  detailCard(
                    Padding(
                      padding: const EdgeInsets.all(10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          InkWell(
                            onTap: () => setState(() => _levels = !_levels),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.info_outline,
                                  size: 13,
                                  color: detailMuted,
                                ),
                                const SizedBox(width: 5),
                                Expanded(
                                  child: Text(
                                    'Price levels reference only · ${first.colour}',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: detailMuted,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (_levels) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                for (final e in [
                                  ('Standard', first.standardPrice),
                                  ('VIP', first.standardPrice * .9),
                                  ('VVIP', first.standardPrice * .85),
                                  ('Container', first.standardPrice * .8),
                                  ('Floor', first.salesFloorPrice),
                                ])
                                  Expanded(
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 5,
                                      ),
                                      decoration: BoxDecoration(
                                        color: e.$1 == level
                                            ? detailPale
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(7),
                                      ),
                                      child: Column(
                                        children: [
                                          Text(
                                            e.$1,
                                            style: TextStyle(
                                              fontSize: 9,
                                              color: e.$1 == 'Floor'
                                                  ? const Color(0xFFC44135)
                                                  : detailMuted,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            _cash(e.$2),
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              color: e.$1 == 'Floor'
                                                  ? const Color(0xFFC44135)
                                                  : detailGreen,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  detailHeading(
                    'New prices',
                    action: _changed.isEmpty
                        ? null
                        : '${_changed.length} changed',
                  ),
                  Row(
                    children: [
                      TextButton.icon(
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 2),
                          minimumSize: const Size(0, 36),
                        ),
                        onPressed: () => setState(() {
                          _selected.length == _products.length
                              ? _selected.clear()
                              : _selected.addAll(_products.map((p) => p.id));
                        }),
                        icon: Icon(
                          _selected.length == _products.length
                              ? Icons.check_box
                              : Icons.check_box_outline_blank,
                          size: 16,
                        ),
                        label: const Text(
                          'All',
                          style: TextStyle(fontSize: 12),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          key: const ValueKey('bulk-price'),
                          controller: _bulk,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          decoration:
                              detailInput(
                                hint: 'Tick colours, then set one price',
                              ).copyWith(
                                prefixText: '\$ ',
                                hintStyle: const TextStyle(
                                  fontSize: 10,
                                  color: detailMuted,
                                ),
                              ),
                        ),
                      ),
                      const SizedBox(width: 7),
                      TextButton(
                        onPressed:
                            _selected.isNotEmpty &&
                                (double.tryParse(_bulk.text)?.isFinite ??
                                    false) &&
                                (double.tryParse(_bulk.text) ?? 0) > 0
                            ? _applyBulk
                            : null,
                        child: const Text(
                          'Apply',
                          style: TextStyle(fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Column(
                    children: [
                      for (final product in _products)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 7),
                          child: detailCard(_priceRow(product)),
                        ),
                    ],
                  ),
                  detailHeading(
                    'Time range',
                    action: _until == null
                        ? 'No end date'
                        : DateFormat('d MMM yyyy').format(_until!),
                  ),
                  detailCard(
                    Padding(
                      padding: const EdgeInsets.all(10),
                      child: Row(
                        children: [
                          Expanded(
                            child: _dateButton(
                              'From',
                              DateUtils.isSameDay(_from, DateTime.now())
                                  ? 'Today'
                                  : DateFormat('d MMM').format(_from),
                              () => _date(false),
                            ),
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8),
                            child: Icon(
                              Icons.arrow_forward,
                              size: 16,
                              color: detailMuted,
                            ),
                          ),
                          Expanded(
                            child: _dateButton(
                              'Until',
                              _until == null
                                  ? 'No end'
                                  : DateFormat('d MMM').format(_until!),
                              () => _date(true),
                            ),
                          ),
                          if (_until != null)
                            IconButton(
                              tooltip: 'Clear end date',
                              onPressed: () => setState(() => _until = null),
                              icon: const Icon(Icons.close, size: 16),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(top: 6),
                    child: Text(
                      'Leave "Until" empty if the new price has no end date.',
                      style: TextStyle(fontSize: 10, color: detailMuted),
                    ),
                  ),
                  detailHeading('Note & task'),
                  TextField(
                    key: const ValueKey('price-note'),
                    controller: _note,
                    minLines: 2,
                    maxLines: 4,
                    decoration: detailInput(
                      hint: 'Why this price? Job, competitor, volume…',
                    ),
                  ),
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    controlAffinity: ListTileControlAffinity.leading,
                    value: _follow,
                    onChanged: (v) => setState(() => _follow = v ?? false),
                    title: const Text(
                      'Create follow-up task',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      'Type: Special Price · appears in Tasks',
                      style: TextStyle(fontSize: 10, color: detailMuted),
                    ),
                  ),
                  if (_follow) ...[
                    TextField(
                      key: const ValueKey('price-task-title'),
                      controller: _task,
                      decoration: detailInput(
                        hint:
                            'Review special price — ${widget.customer.businessName}',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () async {
                              final date = await pickSalesDate(
                                context: context,
                                initialDate: _due,
                                firstDate: DateUtils.dateOnly(DateTime.now()),
                                lastDate: DateTime.now().add(
                                  const Duration(days: 3650),
                                ),
                                helpText: 'Follow-up due',
                              );
                              if (date != null && mounted) {
                                setState(() => _due = date);
                              }
                            },
                            child: Text(
                              'Due ${DateFormat('EEE d MMM').format(_due)}',
                              style: const TextStyle(fontSize: 11),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: DropdownButtonFormField<AppUser>(
                            initialValue: owners.firstWhere(
                              (u) => u.id == _owner.id,
                            ),
                            isExpanded: true,
                            decoration: detailInput(),
                            items: [
                              for (final u in owners)
                                DropdownMenuItem(
                                  value: u,
                                  child: Text(
                                    u.id == me.id
                                        ? 'Me (${me.name.split(' ').first})'
                                        : u.name,
                                    style: const TextStyle(fontSize: 11),
                                  ),
                                ),
                            ],
                            onChanged: (v) => setState(() => _owner = v!),
                          ),
                        ),
                      ],
                    ),
                    Wrap(
                      spacing: 8,
                      children: [
                        for (final high in [false, true])
                          ChoiceChip(
                            label: Text(
                              high ? 'High priority' : 'Normal priority',
                              style: const TextStyle(fontSize: 11),
                            ),
                            selected: _high == high,
                            onSelected: (_) => setState(() => _high = high),
                          ),
                      ],
                    ),
                  ],
                  if (_below.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.only(top: 14),
                      child: Text(
                        '${_below.length} below floor — needs manager approval.',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFFB45C00),
                        ),
                      ),
                    ),
                    detailLabel('Reason for approval', required: true),
                    TextField(
                      key: const ValueKey('price-approval-reason'),
                      controller: _reason,
                      maxLines: 3,
                      decoration: detailInput(
                        hint: 'e.g. Project volume, competitor price',
                      ),
                    ),
                  ],
                  detailHeading('Price history'),
                  for (final h in _history) _historyRow(h),
                  if (SalesDashboardData(context).sample &&
                      widget.customer.id == 'abc' &&
                      widget.series.name == 'Bonita')
                    const ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: DetailGlyph('clock', size: 17),
                      title: Text(
                        'Natural Oak: \$72.00 → \$69.00',
                        style: TextStyle(fontSize: 12),
                      ),
                      subtitle: Text(
                        'Sarah Chen · 2 Aug 2026 · Annual review',
                        style: TextStyle(fontSize: 10, color: detailMuted),
                      ),
                    ),
                  if (_history.isEmpty &&
                      !(SalesDashboardData(context).sample &&
                          widget.customer.id == 'abc' &&
                          widget.series.name == 'Bonita'))
                    const Text(
                      'No price changes recorded.',
                      style: TextStyle(fontSize: 12, color: detailMuted),
                    ),
                  if (_error != null)
                    Text(
                      _error!,
                      style: const TextStyle(color: Colors.red, fontSize: 12),
                    ),
                ],
              ),
        bottomNavigationBar: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _saving ? null : _leave,
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: FilledButton(
                    onPressed: _ready && _valid && !_saving ? _save : null,
                    style: FilledButton.styleFrom(backgroundColor: detailGreen),
                    child: Text(
                      _saving
                          ? 'Saving…'
                          : _changed.isEmpty
                          ? 'No changes'
                          : 'Save ${_changed.length}${_below.isEmpty ? '' : ' · ${_below.length} approval'}',
                      style: const TextStyle(fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _dateButton(String title, String value, VoidCallback action) =>
      InkWell(
        onTap: action,
        child: Padding(
          padding: const EdgeInsets.all(5),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(fontSize: 10, color: detailMuted),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const DetailGlyph('calendar', size: 15),
            ],
          ),
        ),
      );
  Widget _priceRow(Product p) {
    final n = double.tryParse(_prices[p.id]!.text),
        changed = _changed.contains(p),
        invalid = n == null || !n.isFinite || n <= 0;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
      child: Row(
        children: [
          SizedBox(
            width: 30,
            child: Checkbox(
              value: _selected.contains(p.id),
              onChanged: (v) => setState(
                () => v == true ? _selected.add(p.id) : _selected.remove(p.id),
              ),
            ),
          ),
          const SizedBox(width: 5),
          InventorySwatch(seed: p.colour, size: 28, single: true),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  p.colour,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 5),
                Text.rich(
                  TextSpan(
                    children: [
                      const TextSpan(text: 'Now '),
                      TextSpan(
                        text: _cash(_initial[p.id]!),
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      const TextSpan(text: ' · '),
                      TextSpan(
                        text: _tier(p, _initial[p.id]!),
                        style: const TextStyle(color: detailGreen),
                      ),
                    ],
                  ),
                  style: const TextStyle(fontSize: 10, color: detailMuted),
                ),
              ],
            ),
          ),
          const SizedBox(width: 7),
          SizedBox(
            width: 88,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                TextField(
                  key: ValueKey('new-price-${p.sku}'),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: detailGreen,
                  ),
                  controller: _prices[p.id],
                  textAlign: TextAlign.right,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: detailInput().copyWith(
                    prefixText: '\$ ',
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 9,
                    ),
                  ),
                ),
                if (changed)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      invalid ? 'Invalid price' : _tier(p, n),
                      style: TextStyle(
                        fontSize: 9,
                        color: invalid || n < p.salesFloorPrice
                            ? const Color(0xFFC44135)
                            : detailGreen,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _historyRow(Map<String, dynamic> h) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const DetailGlyph('clock', size: 16, color: detailMuted),
        const SizedBox(width: 9),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final row in h['items'] as List? ?? [])
                Text(
                  '${row['product']}: ${_cash(row['before'] as num)} → ${_cash(row['after'] as num)}${row['approval'] == true ? ' · Approval pending' : ''}',
                  style: const TextStyle(fontSize: 12),
                ),
              const SizedBox(height: 4),
              Text(
                '${h['author']} · ${DateFormat('d MMM yyyy').format(DateTime.parse(h['at'] as String))}${'${h['note']}'.isEmpty ? '' : ' · ${h['note']}'}',
                style: const TextStyle(fontSize: 10, color: detailMuted),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}
