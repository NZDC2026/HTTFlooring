import '../../../models/customer.dart';
import '../../../services/app_session.dart';
import '../../../services/local_sales_request_store.dart';
import '../../../widgets/sales_detail_ui.dart';

import 'package:flutter/material.dart';

import 'dart:ui' show ImageFilter;

import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../services/customer_service.dart';
import '../../../services/customer_location_service.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/sales_document_service.dart';
import '../../../services/sales_session.dart';
import '../home/sales_dashboard_support.dart';
import 'customer_directory_data.dart';
import 'business_card_review_screen.dart';
import 'business_card_scanner_screen.dart';
import 'customer_detail_screen.dart';
import 'customer_directory_map.dart';
import 'customer_notes_screen.dart';
import 'sales_visit_screen.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({
    super.key,
    this.initialFilter = CustomerListFilter.all,
    this.showBack = false,
    this.initialAttentionGroup,
  });
  final CustomerListFilter initialFilter;
  final bool showBack;
  final String? initialAttentionGroup;
  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  late CustomerListFilter _filter = widget.initialFilter;
  late final Set<String> _groups = {
    if (widget.initialAttentionGroup != null) widget.initialAttentionGroup!,
  };
  final _search = TextEditingController();
  bool _map = false;
  String _sort = 'Nearby';
  bool _descending = false;
  DateTime? _refreshed;
  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  String _money(double amount) =>
      NumberFormat.currency(symbol: r'$', decimalDigits: 0).format(amount);
  void _open(DirectoryCustomer r) =>
      dashboardOpen(context, CustomerDetailScreen(customer: r.customer));
  void _note(DirectoryCustomer r) => showModalBottomSheet<void>(
    context: context,
    backgroundColor: Colors.white,
    builder: (sheet) => SafeArea(
      child: Wrap(
        children: [
          ListTile(
            title: Text(
              r.customer.businessName,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.edit_note),
            title: const Text('Add Note'),
            onTap: () {
              Navigator.pop(sheet);
              dashboardOpen(context, AddNoteScreen(customer: r.customer));
            },
          ),
          ListTile(
            leading: const Icon(Icons.event_note_outlined),
            title: const Text('Add Follow-up'),
            onTap: () {
              Navigator.pop(sheet);
              dashboardOpen(context, AddFollowUpScreen(customer: r.customer));
            },
          ),
        ],
      ),
    ),
  );
  Future<void> _launch(Uri uri) async {
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) &&
        mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to open this action on this device.'),
        ),
      );
    }
  }

  void _contacts(DirectoryCustomer r) {
    final contacts = context.read<CustomerService>().getContactsForCustomer(
      r.customer.id,
    );
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      builder: (sheet) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${r.customer.businessName} · Contacts',
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              if (contacts.isEmpty)
                ListTile(
                  title: Text(r.contact),
                  subtitle: const Text('No phone number recorded'),
                  onTap: () {
                    Navigator.pop(sheet);
                    _open(r);
                  },
                ),
              for (final c in contacts)
                ListTile(
                  title: Text(c.name),
                  subtitle: Text(
                    c.phone.isEmpty ? 'No phone number recorded' : c.phone,
                  ),
                  trailing: const Icon(Icons.phone_outlined),
                  onTap: c.phone.isEmpty
                      ? null
                      : () {
                          Navigator.pop(sheet);
                          _launch(Uri(scheme: 'tel', path: c.phone));
                        },
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCustomerMenu() {
    showGeneralDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Close customer options',
      barrierColor: Colors.transparent,
      transitionDuration: const Duration(milliseconds: 120),
      pageBuilder: (dialog, _, _) => Stack(
        children: [
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 3, sigmaY: 3),
              child: GestureDetector(
                onTap: () => Navigator.pop(dialog),
                child: Container(color: Colors.white.withValues(alpha: .03)),
              ),
            ),
          ),
          Positioned(
            top: MediaQuery.paddingOf(context).top + 54,
            right: 16,
            child: Material(
              color: Colors.white,
              elevation: 9,
              shadowColor: const Color(0x44000000),
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                width: 196,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 7),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ListTile(
                        dense: true,
                        visualDensity: VisualDensity.compact,
                        leading: const DashboardIcon(
                          Icons.document_scanner_outlined,
                          size: 16,
                        ),
                        minLeadingWidth: 14,
                        title: const Text(
                          'Scan business card',
                          style: TextStyle(fontSize: 12),
                        ),
                        onTap: () {
                          Navigator.pop(dialog);
                          dashboardOpen(
                            context,
                            const BusinessCardScannerScreen(),
                          );
                        },
                      ),
                      ListTile(
                        dense: true,
                        visualDensity: VisualDensity.compact,
                        leading: const Icon(
                          Icons.inventory_2_outlined,
                          size: 16,
                        ),
                        minLeadingWidth: 14,
                        title: const Text(
                          'Archived customers',
                          style: TextStyle(fontSize: 12),
                        ),
                        onTap: () {
                          Navigator.pop(dialog);
                          showDetailSheet<void>(
                            context,
                            (_) => const ArchivedCustomerList(),
                          );
                        },
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
  }

  @override
  Widget build(BuildContext context) {
    context.watch<CustomerService>();
    context.watch<CustomerLocationService>();
    context.watch<CustomerNoteService>();
    context.watch<SalesDocumentService>();
    context.watch<SalesSession>();
    final data = CustomerDirectoryData(context);
    var rows = data.filtered(_filter).where((r) {
      final q = _search.text.trim().toLowerCase();
      return '${r.customer.businessName} ${r.suburb} ${r.contact} ${r.customer.address}'
          .toLowerCase()
          .contains(q);
    }).toList();
    rows.sort(
      (a, b) => switch (_sort) {
        'Name' => a.customer.businessName.compareTo(b.customer.businessName),
        'Last visit' => (a.visitDays ?? 9999).compareTo(b.visitDays ?? 9999),
        'Sales' => b.sales.compareTo(a.sales),
        _ => (a.distance ?? 9999).compareTo(b.distance ?? 9999),
      },
    );
    if (_descending) rows = rows.reversed.toList();
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        toolbarHeight: 52,
        automaticallyImplyLeading: widget.showBack,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF192B23),
        elevation: 0,
        scrolledUnderElevation: 0,
        titleSpacing: widget.showBack ? null : 14,
        title: const Text(
          'Customers',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            tooltip: 'Customer options',
            icon: const Icon(Icons.more_vert, size: 21),
            onPressed: _showCustomerMenu,
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 43,
                          decoration: _fieldDecoration(),
                          child: TextField(
                            controller: _search,
                            onChanged: (_) => setState(() {}),
                            style: const TextStyle(fontSize: 13),
                            decoration: const InputDecoration(
                              filled: false,
                              prefixIcon: Icon(
                                Icons.search,
                                size: 18,
                                color: Color(0xFF8A9690),
                              ),
                              hintText: 'Search name, suburb or contact',
                              hintStyle: TextStyle(
                                fontSize: 13,
                                color: Color(0xFF98A39D),
                              ),
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(
                                vertical: 12,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      SizedBox(
                        height: 43,
                        child: FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: dashboardGreen,
                            padding: const EdgeInsets.symmetric(horizontal: 15),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: () => dashboardOpen(
                            context,
                            const BusinessCardReviewScreen.manual(),
                          ),
                          icon: const DashboardIcon(
                            Icons.person_add_outlined,
                            size: 16,
                            color: Colors.white,
                          ),
                          label: const Text(
                            'Add',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        flex: 5,
                        child: Container(
                          height: 40,
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEDF0EE),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: _toggle(
                                  'List',
                                  Icons.format_list_bulleted,
                                  !_map,
                                  () => setState(() => _map = false),
                                ),
                              ),
                              Expanded(
                                child: _toggle(
                                  'Map',
                                  Icons.map_outlined,
                                  _map,
                                  () => setState(() => _map = true),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 4,
                        child: Container(
                          height: 40,
                          padding: const EdgeInsets.symmetric(horizontal: 9),
                          decoration: _fieldDecoration(),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              isExpanded: true,
                              value: _sort,
                              icon: const Icon(Icons.expand_more, size: 15),
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF26372F),
                              ),
                              items: ['Nearby', 'Name', 'Last visit', 'Sales']
                                  .map(
                                    (s) => DropdownMenuItem(
                                      value: s,
                                      child: Text('Sort: $s'),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (s) => setState(() => _sort = s!),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        width: 40,
                        height: 40,
                        decoration: _fieldDecoration(),
                        child: IconButton(
                          tooltip: _descending
                              ? 'Sort ascending'
                              : 'Sort descending',
                          onPressed: () =>
                              setState(() => _descending = !_descending),
                          icon: Icon(
                            _descending
                                ? Icons.arrow_downward
                                : Icons.arrow_upward,
                            size: 18,
                            color: dashboardGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          SliverPersistentHeader(
            pinned: !_map,
            delegate: _CustomerFilterHeader(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 5,
                ),
                child: Row(
                  children: [
                    for (final f in CustomerListFilter.values) ...[
                      if (f.index > 0) const SizedBox(width: 5),
                      Expanded(child: _chip(f, data.filtered(f).length)),
                    ],
                  ],
                ),
              ),
            ),
          ),
          if (_map)
            SliverToBoxAdapter(
              child: CustomerDirectoryMapPanel(
                rows: rows,
                demo: data.demo,
                onOpen: _open,
              ),
            )
          else if (_filter == CustomerListFilter.attention)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 0),
                child: Column(
                  children: [
                    _attentionGroup(
                      'payment',
                      'Overdue payment',
                      '${_money(data.overdueTotal)} overdue',
                      Icons.attach_money,
                      rows.where((r) => r.overdue > 0).toList(),
                    ),
                    _attentionGroup(
                      'hold',
                      'On hold',
                      'Orders blocked',
                      Icons.lock_outline,
                      rows.where((r) => r.onHold).toList(),
                    ),
                    _attentionGroup(
                      'visit',
                      'No recent visit',
                      'A 14 · B 30 · C 60 days',
                      Icons.location_on_outlined,
                      rows.where((r) => r.noRecentVisit).toList(),
                    ),
                  ],
                ),
              ),
            )
          else ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(14, 7, 14, 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${rows.length} customers',
                      style: const TextStyle(fontSize: 11, color: _muted),
                    ),
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
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Container(
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE4E9E6)),
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0C000000),
                        blurRadius: 3,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      if (rows.isEmpty)
                        const Padding(
                          padding: EdgeInsets.all(30),
                          child: Text('No customers match this filter'),
                        ),
                      for (final r in rows) _customerRow(r),
                    ],
                  ),
                ),
              ),
            ),
          ],
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 16, 12, 26),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.sync, size: 13, color: Color(0xFF97A39C)),
                  const SizedBox(width: 5),
                  Flexible(
                    child: Text(
                      '${data.demo ? 'Demo records' : 'Local records'}${_refreshed == null ? '' : ' · ${DateFormat('h:mm a').format(_refreshed!)}'}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF8D9992),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: () {
                      setState(() => _refreshed = DateTime.now());
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'Local customer and sales records refreshed.',
                          ),
                        ),
                      );
                    },
                    child: const Padding(
                      padding: EdgeInsets.all(5),
                      child: Text(
                        'Sync now',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF087D46),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static const _muted = Color(0xFF65716C);
  BoxDecoration _fieldDecoration() => BoxDecoration(
    color: Colors.white,
    border: Border.all(color: const Color(0xFFDBE2DE)),
    borderRadius: BorderRadius.circular(11),
    boxShadow: const [
      BoxShadow(color: Color(0x08000000), blurRadius: 3, offset: Offset(0, 1)),
    ],
  );
  Widget _toggle(String label, IconData icon, bool active, VoidCallback tap) =>
      Material(
        color: active ? Colors.white : Colors.transparent,
        borderRadius: BorderRadius.circular(7),
        child: InkWell(
          onTap: tap,
          borderRadius: BorderRadius.circular(7),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              DashboardIcon(icon, size: 13, color: const Color(0xFF48544D)),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
      );
  Widget _chip(CustomerListFilter f, int count) {
    final selected = f == _filter;
    final danger = f == CustomerListFilter.attention;
    final label = switch (f) {
      CustomerListFilter.all => 'All',
      CustomerListFilter.attention => 'Attention',
      CustomerListFilter.dueVisit => 'Due visit',
      CustomerListFilter.overdue => 'Overdue',
    };
    return Semantics(
      button: true,
      selected: selected,
      child: InkWell(
        onTap: () => setState(() => _filter = f),
        borderRadius: BorderRadius.circular(25),
        child: Container(
          height: 32,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected
                ? (danger ? const Color(0xFFC12720) : dashboardGreen)
                : Colors.white,
            borderRadius: BorderRadius.circular(25),
            border: Border.all(
              color: danger ? const Color(0xFFEF514B) : const Color(0xFFDFE5E1),
            ),
          ),
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6),
              child: Text(
                '${danger ? '⚠' : ''}$label $count',
                style: TextStyle(
                  fontSize: 11,
                  color: selected
                      ? Colors.white
                      : danger
                      ? const Color(0xFFD22F26)
                      : const Color(0xFF34473C),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _attentionGroup(
    String id,
    String title,
    String subtitle,
    IconData icon,
    List<DirectoryCustomer> rows,
  ) {
    final open = _groups.contains(id);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7F7),
        border: const Border(
          left: BorderSide(color: Color(0xFFEF514B), width: 3),
        ),
        borderRadius: BorderRadius.circular(15),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0C000000),
            blurRadius: 5,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: Column(
          children: [
            InkWell(
              onTap: () =>
                  setState(() => open ? _groups.remove(id) : _groups.add(id)),
              child: Padding(
                padding: const EdgeInsets.all(13),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE14F48),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: icon == Icons.attach_money
                          ? const Center(
                              child: Text(
                                r'$',
                                style: TextStyle(
                                  fontSize: 22,
                                  color: Colors.white,
                                ),
                              ),
                            )
                          : Icon(icon, size: 20, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            subtitle,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFFC92520),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFE7E6),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${rows.length}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFFBE2720),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Transform.rotate(
                      angle: open ? -1.5708 : 1.5708,
                      child: const Icon(
                        Icons.chevron_right,
                        size: 16,
                        color: Color(0xFFB98F8D),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (open)
              Container(
                color: Colors.white,
                child: Column(
                  children: [
                    if (rows.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(20),
                        child: Text('No customers in this group'),
                      ),
                    for (final r in rows) _customerRow(r),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _customerRow(DirectoryCustomer r) {
    final contact = context.read<CustomerService>().getPrimaryContact(
      r.customer.id,
    );
    final email = contact?.email ?? '';
    final visitColor = r.visitDays == null
        ? const Color(0xFF98A39D)
        : r.visitDays! <= 14
        ? const Color(0xFF239E58)
        : r.visitDays! <= 42
        ? const Color(0xFFE46626)
        : const Color(0xFFB48B0B);
    final initials = r.customer.businessName
        .split(' ')
        .where((s) => s.isNotEmpty)
        .take(2)
        .map((s) => s[0])
        .join();
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF0F2F0))),
      ),
      padding: const EdgeInsets.fromLTRB(11, 12, 11, 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () => _open(r),
            child: Container(
              width: 38,
              height: 38,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: r.onHold
                    ? const Color(0xFFECEFED)
                    : const Color(0xFFE4F2EA),
                border: r.overdue > 0
                    ? Border.all(color: const Color(0xFFFF5555), width: 1.5)
                    : null,
              ),
              child: Text(
                initials,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: r.onHold
                      ? const Color(0xFF99A39D)
                      : const Color(0xFF177348),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(right: 88),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          InkWell(
                            onTap: () => _open(r),
                            child: Wrap(
                              crossAxisAlignment: WrapCrossAlignment.center,
                              spacing: 4,
                              runSpacing: 3,
                              children: [
                                Text(
                                  r.customer.businessName,
                                  style: const TextStyle(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF1D2923),
                                  ),
                                ),
                                _smallTag(
                                  r.tier,
                                  const Color(0xFFEDF0F2),
                                  const Color(0xFF4C5660),
                                ),
                                if (r.onHold)
                                  _smallTag(
                                    'On hold',
                                    const Color(0xFFFFEDF1),
                                    const Color(0xFFE3274A),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            spacing: 3,
                            children: [
                              Text(
                                '${r.suburb}${r.distance == null ? '' : ' · ${NumberFormat('0.#').format(r.distance)} km'} ·',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: _muted,
                                ),
                              ),
                              Container(
                                width: 7,
                                height: 7,
                                decoration: BoxDecoration(
                                  color: visitColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              Text(
                                r.visitDays == null
                                    ? 'No visit history'
                                    : '${r.visitDays}d ago',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: visitColor,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Align(
                      alignment: Alignment.topRight,
                      child: SizedBox(
                        width: 85,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            if (r.sales > 0)
                              Text(
                                _money(r.sales),
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              )
                            else ...[
                              const Text(
                                'Last inv.',
                                style: TextStyle(fontSize: 10, color: _muted),
                              ),
                              Text(
                                r.invoiceDays == null
                                    ? '—'
                                    : '${r.invoiceDays}d',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: _muted,
                                ),
                              ),
                            ],
                            if (r.growth != null)
                              Text(
                                '${r.growth! >= 0 ? '↑' : '↓'}${r.growth!.abs().toStringAsFixed(0)}% vs last',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: r.growth! >= 0
                                      ? const Color(0xFF07864A)
                                      : const Color(0xFFD56808),
                                ),
                              )
                            else if (r.sales > 0)
                              const Text(
                                'this month',
                                style: TextStyle(fontSize: 10, color: _muted),
                              ),
                            if (r.overdue > 0)
                              Text(
                                '${_money(r.overdue)} overdue',
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  color: Color(0xFFD42520),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                if (r.visit.isNotEmpty || r.tasks > 0)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Wrap(
                      spacing: 10,
                      runSpacing: 3,
                      children: [
                        if (r.visit.isNotEmpty)
                          InkWell(
                            onTap: () => dashboardOpen(
                              context,
                              AddFollowUpScreen(
                                customer: r.customer,
                                initialDescription: 'Plan a customer visit.',
                              ),
                            ),
                            child: _inline(
                              Icons.calendar_today_outlined,
                              r.visit,
                              const Color(0xFF176BDF),
                            ),
                          ),
                        if (r.tasks > 0)
                          InkWell(
                            onTap: () => dashboardOpen(
                              context,
                              CustomerNotesScreen(
                                customer: r.customer,
                                showOpenFollowUps: true,
                              ),
                            ),
                            child: _inline(
                              Icons.event_note_outlined,
                              '${r.tasks} ${r.tasks == 1 ? 'task' : 'tasks'}',
                              const Color(0xFF7043BB),
                            ),
                          ),
                      ],
                    ),
                  ),
                const SizedBox(height: 7),
                Wrap(
                  spacing: 5,
                  runSpacing: 5,
                  children: [
                    _rowAction(
                      Icons.phone_outlined,
                      () => _contacts(r),
                      label: r.contact.split(' ').first,
                    ),
                    _rowAction(
                      Icons.mail_outline,
                      email.isEmpty
                          ? null
                          : () => _launch(Uri(scheme: 'mailto', path: email)),
                      tooltip: 'Email',
                    ),
                    _rowAction(
                      Icons.location_on_outlined,
                      () => _launch(
                        Uri.https('www.google.com', '/maps/search/', {
                          'api': '1',
                          'query': r.customer.address,
                        }),
                      ),
                      tooltip: 'Map',
                    ),
                    if (r.visit.isEmpty)
                      _rowAction(
                        Icons.calendar_today_outlined,
                        () => dashboardOpen(
                          context,
                          AddFollowUpScreen(
                            customer: r.customer,
                            initialDescription: 'Plan a customer visit.',
                          ),
                        ),
                        tooltip: 'Plan visit',
                      ),
                    _rowAction(
                      Icons.add,
                      () => _note(r),
                      tooltip: 'Note & Task',
                    ),
                    if (r.visit.isNotEmpty && r.visitDays != 14)
                      _rowAction(
                        Icons.location_on_outlined,
                        () => dashboardOpen(
                          context,
                          SalesVisitScreen(
                            initialSearch: r.customer.businessName,
                          ),
                        ),
                        label: 'Check in',
                        dark: true,
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _smallTag(String text, Color bg, Color fg) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
    decoration: BoxDecoration(
      color: bg,
      borderRadius: BorderRadius.circular(5),
    ),
    child: Text(
      text,
      style: TextStyle(fontSize: 9, color: fg, fontWeight: FontWeight.w600),
    ),
  );
  Widget _inline(IconData icon, String label, Color color) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 11, color: color),
      const SizedBox(width: 3),
      Text(label, style: TextStyle(fontSize: 11, color: color)),
    ],
  );
  Widget _rowAction(
    IconData icon,
    VoidCallback? tap, {
    String? label,
    String? tooltip,
    bool dark = false,
  }) => Tooltip(
    message: tooltip ?? label ?? '',
    child: Material(
      color: dark ? dashboardGreen : const Color(0xFFF0F5F2),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: tap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: label == null ? 8 : 10,
            vertical: 7,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              DashboardIcon(
                icon,
                size: 13,
                color: tap == null
                    ? const Color(0xFFC2CBC6)
                    : dark
                    ? Colors.white
                    : dashboardGreen,
              ),
              if (label != null) ...[
                const SizedBox(width: 5),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: dark ? Colors.white : dashboardGreen,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    ),
  );
}

class _CustomerFilterHeader extends SliverPersistentHeaderDelegate {
  _CustomerFilterHeader({required this.child});
  final Widget child;
  @override
  double get minExtent => 42;
  @override
  double get maxExtent => 42;
  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) => child;
  @override
  bool shouldRebuild(covariant _CustomerFilterHeader old) => true;
}

class ArchivedCustomersScreen extends StatelessWidget {
  const ArchivedCustomersScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.white,
    appBar: dashboardBar('Archived customers'),
    body: const Padding(
      padding: EdgeInsets.all(12),
      child: ArchivedCustomerList(showTitle: false),
    ),
  );
}

class ArchivedCustomerList extends StatefulWidget {
  const ArchivedCustomerList({super.key, this.showTitle = true});
  final bool showTitle;
  @override
  State<ArchivedCustomerList> createState() => _ArchivedCustomerListState();
}

class _ArchivedCustomerListState extends State<ArchivedCustomerList> {
  final Set<String> _requested = {};
  bool _loaded = false;
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loaded = true;
      _load();
    }
  }

  Future<void> _load() async {
    final rows = await LocalSalesRequestStore.read(
      context.read<AppSession>().currentUser.id,
    );
    if (mounted) {
      setState(
        () => _requested.addAll(
          rows
              .where((r) => r['kind'] == 'Restore')
              .map((r) => r['customerId'] as String),
        ),
      );
    }
  }

  Future<void> _request(Customer c) async {
    setState(() => _requested.add(c.id));
    try {
      await LocalSalesRequestStore.append(
        context.read<AppSession>().currentUser.id,
        {
          'kind': 'Restore',
          'customerId': c.id,
          'customer': c.businessName,
          'note': 'Request to restore archived customer.',
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Restore request saved locally for the office.'),
          ),
        );
      }
    } catch (_) {
      if (mounted) setState(() => _requested.remove(c.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final service = context.watch<CustomerService>(),
        session = context.watch<SalesSession>();
    final rows = service.archivedCustomers
        .where((c) => session.canAccessRegion(c.region))
        .toList();
    if (rows.isEmpty && SalesDashboardData(context).sample) {
      final seed = CustomerDirectoryData(context).rows.first.customer;
      rows.add(
        Customer.fromJson({
          ...seed.toJson(),
          'id': 'reference-archived-gladesville',
          'businessName': 'Gladesville Floors (closed)',
          'address': 'Gladesville',
          'archived': true,
          'outstanding': 0.0,
          'overdue': 0.0,
          'thisMonthOrders': 0.0,
          'lastMonthOrders': 0.0,
          'lastOrderDate': null,
        }),
      );
    }
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (widget.showTitle)
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Archived customers',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
              ),
              IconButton(
                tooltip: 'Close archived customers',
                icon: const DetailGlyph('close', size: 17),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        const Text(
          'Archived by the office. View only — ask the office to restore.',
          style: TextStyle(fontSize: 12, color: detailMuted, height: 1.5),
        ),
        const SizedBox(height: 14),
        if (rows.isEmpty)
          const Padding(
            padding: EdgeInsets.all(24),
            child: Text(
              'No archived customers',
              style: TextStyle(fontSize: 13, color: detailMuted),
            ),
          ),
        for (final c in rows)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: detailCard(
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c.businessName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      '${c.address} · last invoice ${c.lastOrderDate == null ? '—' : DateFormat('d MMM yyyy').format(c.lastOrderDate!)}',
                      style: const TextStyle(fontSize: 11, color: detailMuted),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        TextButton(
                          onPressed: () => dashboardOpen(
                            context,
                            _ArchivedHistory(customer: c),
                          ),
                          child: const Text(
                            'View history ›',
                            style: TextStyle(fontSize: 12, color: detailGreen),
                          ),
                        ),
                        const Spacer(),
                        _requested.contains(c.id)
                            ? detailBadge('Requested')
                            : TextButton(
                                onPressed: () => _request(c),
                                child: const Text(
                                  'Request restore',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: detailGreen,
                                  ),
                                ),
                              ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _ArchivedHistory extends StatelessWidget {
  const _ArchivedHistory({required this.customer});
  final Customer customer;
  @override
  Widget build(BuildContext context) {
    final notes = context.watch<CustomerNoteService>().getCustomerNotes(
      customer.id,
    );
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar('Customer history'),
      body: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          Text(
            customer.businessName,
            style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerLeft,
            child: detailBadge('Archived · view only'),
          ),
          detailHeading('Activity'),
          if (notes.isEmpty)
            const Text(
              'No recorded activities.',
              style: TextStyle(fontSize: 13, color: detailMuted),
            ),
          for (final n in notes)
            ListTile(
              title: Text(n.content, style: const TextStyle(fontSize: 13)),
              subtitle: Text(
                DateFormat('d MMM yyyy').format(n.createdAt),
                style: const TextStyle(fontSize: 11, color: detailMuted),
              ),
            ),
        ],
      ),
    );
  }
}
