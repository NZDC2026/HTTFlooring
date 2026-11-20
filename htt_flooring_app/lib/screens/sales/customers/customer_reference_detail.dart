part of 'customer_detail_screen.dart';

class _ReferenceCustomerDetailState extends _CustomerDetailScreenState {
  int _tab = 0, _period = 30, _documentTab = 0;
  String _activityFilter = 'All', _priceQuery = '', _salesUnit = 'Value';
  bool _companyOpen = false, _metaLoaded = false;
  final Set<String> _priceOpen = {}, _productOpen = {};
  final Map<String, dynamic> _metadata = {};
  List<Map<String, dynamic>> _boardRequests = [];
  Customer get _customer =>
      context.read<CustomerService>().findById(widget.customer.id) ??
      widget.customer;
  DirectoryCustomer? get _record =>
      CustomerDirectoryData(context).rows
          .where((r) => r.customer.id == _customer.id)
          .firstOrNull;
  bool get _sample => SalesDashboardData(context).sample;
  bool get _abc => _sample && _customer.id == 'abc';
  String get _metaKey =>
      'customer-detail-${context.read<AppSession>().currentUser.id}-${widget.customer.id}';
  String _cash(num n, {bool cents = false}) => NumberFormat.currency(
    symbol: '\$',
    decimalDigits: cents ? 2 : 0,
  ).format(n);
  String _day(DateTime? d) => d == null ? '—' : DateFormat('d MMM').format(d);
  List<StockSeries> get _catalog =>
      inventoryCatalog(demo: _sample, region: _customer.region);
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_metaLoaded) {
      _metaLoaded = true;
      _loadMeta();
    }
  }

  Future<void> _loadMeta() async {
    final key = _metaKey;
    final prefs = await SharedPreferences.getInstance();
    try {
      final data = Map<String, dynamic>.from(
        jsonDecode(prefs.getString(key) ?? '{}') as Map,
      );
      if (mounted) {
        if (_abc) seedCustomerReferencePrices(context, _customer, _catalog);
        setState(() => _metadata.addAll(data));
        await _loadBoardRequests();
      }
    } catch (_) {
      /* Ignore obsolete local metadata. */
    }
  }

  void _refresh(VoidCallback action) => setState(action);
  Future<void> _saveMeta() async {
    final key = _metaKey;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, jsonEncode(_metadata));
  }

  List<CustomerContact> get _contacts {
    final rows = context
        .read<CustomerService>()
        .getContactsForCustomer(_customer.id)
        .toList();
    if (_abc &&
        !rows.any((r) => r.name == 'Lisa Tran') &&
        _metadata['removeLisa'] != true) {
      rows.add(
        const CustomerContact(
          id: 'reference-lisa',
          customerId: 'abc',
          name: 'Lisa Tran',
          jobTitle: 'Accounts',
          phone: '0411 555 202',
          email: 'accounts@abcflooring.com.au',
          isAccountsContact: true,
        ),
      );
    }
    return rows;
  }

  @override
  Widget build(BuildContext context) {
    context.watch<CustomerService>();
    context.watch<CustomerNoteService>();
    context.watch<SalesDocumentService>();
    context.watch<PricingService>();
    final c = _customer;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar(
        'Customer',
        actions: [
          IconButton(
            tooltip: 'More actions',
            onPressed: _referenceMenu,
            icon: const DetailGlyph('more'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 28),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 12),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: detailPale,
                  child: Text(
                    c.businessName
                        .split(' ')
                        .where((w) => w.isNotEmpty)
                        .take(2)
                        .map((w) => w[0])
                        .join(),
                    style: const TextStyle(
                      fontSize: 18,
                      color: detailGreen,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        c.businessName,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${c.type} · ${c.region.label}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: detailMuted,
                        ),
                      ),
                      const SizedBox(height: 7),
                      Wrap(
                        spacing: 5,
                        runSpacing: 4,
                        children: [
                          detailBadge(
                            'Grade ${_metadata['grade'] ?? _record?.tier ?? 'B'}',
                          ),
                          detailBadge(c.archived ? 'Archived' : 'Active'),
                          if (_abc)
                            detailBadge(
                              'Showroom',
                              color: const Color(0xFF63706A),
                              background: const Color(0xFFF0F2F1),
                            ),
                          if (_metadata['archiveRequested'] == true)
                            detailBadge(
                              'Archive requested',
                              color: const Color(0xFF9B6900),
                              background: const Color(0xFFFFF2D7),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: [
                _heroAction(
                  _contacts.firstOrNull?.name.split(' ').first ?? 'Call',
                  'phone',
                  _referenceCall,
                ),
                const SizedBox(width: 7),
                _heroAction('Note & Task', 'plus', _addActivity),
                const SizedBox(width: 7),
                _heroAction(
                  'Directions',
                  'go',
                  () => _launchUri(
                    Uri.https('www.google.com', '/maps/dir/', {
                      'api': '1',
                      'destination': c.address,
                    }),
                  ),
                ),
                const SizedBox(width: 7),
                _heroAction(
                  'Check in',
                  'pin',
                  () => dashboardOpen(
                    context,
                    SalesVisitScreen(initialSearch: c.businessName),
                  ),
                  filled: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Container(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: detailLine)),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (var i = 0; i < 6; i++)
                    InkWell(
                      onTap: () => setState(() => _tab = i),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 13,
                        ),
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(
                              color: _tab == i
                                  ? detailGreen
                                  : Colors.transparent,
                              width: 2,
                            ),
                          ),
                        ),
                        child: Text(
                          [
                            'Overview',
                            'Sales',
                            'Activity',
                            'Pricing',
                            'Display board',
                            'Rebate',
                          ][i],
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: _tab == i
                                ? FontWeight.w600
                                : FontWeight.w400,
                            color: _tab == i ? detailGreen : detailMuted,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
            child: switch (_tab) {
              0 => _overview(),
              1 => _sales(),
              2 => _activity(),
              3 => _pricing(),
              4 => _boards(),
              _ => _rebate(),
            },
          ),
          if (_sample)
            const Padding(
              padding: EdgeInsets.fromLTRB(14, 18, 14, 0),
              child: Text(
                'Example customer data',
                style: TextStyle(fontSize: 10, color: detailMuted),
              ),
            ),
        ],
      ),
    );
  }

  Widget _heroAction(
    String title,
    String glyph,
    VoidCallback tap, {
    bool filled = false,
  }) => Expanded(
    child: SizedBox(
      height: 48,
      child: OutlinedButton(
        onPressed: tap,
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 3),
          backgroundColor: filled ? detailGreen : Colors.white,
          foregroundColor: filled ? Colors.white : detailGreen,
          side: const BorderSide(color: detailLine),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            DetailGlyph(
              glyph,
              size: 16,
              color: filled ? Colors.white : detailGreen,
            ),
            const SizedBox(height: 4),
            Text(title, style: const TextStyle(fontSize: 10)),
          ],
        ),
      ),
    ),
  );
  Widget _stat(String label, String value, String hint, {Color? color}) =>
      Expanded(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 10, color: detailMuted),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
              if (hint.isNotEmpty) ...[
                const SizedBox(height: 3),
                Text(
                  hint,
                  style: const TextStyle(fontSize: 10, color: detailMuted),
                ),
              ],
            ],
          ),
        ),
      );
  Widget _overview() {
    final row = _record,
        c = _customer,
        docs = context.read<SalesDocumentService>();
    final today = DateUtils.dateOnly(DateTime.now());
    final outstanding = _abc ? 31630.16 : docs.getCustomerOutstanding(c.id),
        overdue = _abc ? 0.0 : docs.getCustomerOverdue(c.id);
    final credit =
        (_metadata['credit'] as num?)?.toDouble() ?? (_abc ? 50000 : 0);
    final notes = context
        .read<CustomerNoteService>()
        .getCustomerNotes(c.id)
        .where((n) => n.isFollowUp && !n.isCompleted)
        .toList();
    final lastVisit = row?.visitDays == null
        ? null
        : today.subtract(Duration(days: row!.visitDays!));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        detailHeading(
          'Visits',
          action: '+ Schedule',
          onTap: () => showSalesVisitScheduler(context, customer: c),
          top: 14,
        ),
        detailCard(
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _stat(
                  'Last',
                  _day(lastVisit),
                  row?.visitDays == null
                      ? 'Not recorded'
                      : '${row!.visitDays} days ago',
                ),
                _stat(
                  'Next',
                  _abc ? _day(today) : '—',
                  _abc ? '10:30 AM' : 'Nothing scheduled',
                ),
                _stat(
                  'Due',
                  row?.visitDays == null
                      ? '—'
                      : row!.visitDays! < 14
                      ? 'in ${14 - row.visitDays!} days'
                      : 'Visit due',
                  'every ${row?.tier == 'A'
                      ? 14
                      : row?.tier == 'C'
                      ? 60
                      : 30} days',
                ),
              ],
            ),
          ),
        ),
        detailHeading(
          'Account',
          action: 'Invoices ›',
          onTap: () => _openDocumentList('Invoices'),
        ),
        detailCard(
          Padding(
            padding: const EdgeInsets.fromLTRB(13, 13, 13, 12),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Outstanding · incl GST',
                            style: TextStyle(fontSize: 10, color: detailMuted),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _cash(outstanding, cents: true),
                            style: const TextStyle(
                              fontSize: 19,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text(
                          'Credit limit',
                          style: TextStyle(fontSize: 10, color: detailMuted),
                        ),
                        Text(
                          credit == 0 ? 'Not recorded' : _cash(credit),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: credit > 0
                        ? (outstanding / credit).clamp(0.0, 1.0)
                        : 0,
                    color: detailGreen,
                    backgroundColor: detailLine,
                    minHeight: 4,
                  ),
                ),
                const SizedBox(height: 4),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    credit > 0
                        ? '${(outstanding / credit * 100).round()}% used'
                        : 'Credit limit not recorded',
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  ),
                ),
                const Divider(height: 24, color: detailLine),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _stat(
                      'Overdue',
                      overdue == 0 ? 'None' : _cash(overdue),
                      overdue == 0 ? 'all paid on time' : 'payment overdue',
                      color: overdue > 0 ? const Color(0xFFBD2838) : null,
                    ),
                    _stat(
                      'This month',
                      _cash(_abc ? 19621.09 : row?.sales ?? 0, cents: true),
                      'ex GST',
                    ),
                    _stat(
                      'Last order',
                      _day(
                        _abc
                            ? today.subtract(const Duration(days: 6))
                            : c.lastOrderDate,
                      ),
                      _abc ? '6 days ago' : '',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        detailHeading('Open items'),
        LayoutBuilder(
          builder: (context, box) {
            final w = (box.maxWidth - 16) / 3;
            return Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _openItem(
                  'Follow-ups',
                  'calendar',
                  _abc ? 3 : notes.length,
                  'next ${_day(today)}',
                  w,
                  () => setState(() => _tab = 2),
                ),
                _openItem(
                  'Quotes',
                  'doc',
                  _abc
                      ? 1
                      : docs.documents
                            .where((d) => d.customer.id == c.id)
                            .where(
                              (d) => d.status == SalesDocumentStatus.quotation,
                            )
                            .length,
                  'open',
                  w,
                  () => _openDocumentList('Quotes'),
                ),
                _openItem(
                  'Orders',
                  'box',
                  _abc ? 1 : docs.getCustomerOrders(c.id).length,
                  'open',
                  w,
                  () => _openDocumentList('Orders'),
                ),
                _openItem(
                  'Swatches',
                  'box',
                  0,
                  'none',
                  w,
                  () => dashboardOpen(
                    context,
                    SalesSamplesScreen(initialCustomer: c),
                  ),
                ),
                _openItem(
                  'Display board',
                  'layers',
                  _boardPanelCount,
                  _abc ? '3 to update' : 'none',
                  w,
                  () => setState(() => _tab = 4),
                ),
              ],
            );
          },
        ),
        detailHeading(
          'Contacts',
          action: '+ Add',
          onTap: () => _referenceContactForm(),
        ),
        detailCard(
          Column(
            children: [
              for (var i = 0; i < _contacts.length; i++) ...[
                if (i > 0) const Divider(height: 1, color: detailLine),
                _contactRow(_contacts[i]),
              ],
              if (_contacts.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(20),
                  child: Text(
                    'No contacts added yet.',
                    style: TextStyle(fontSize: 13, color: detailMuted),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        detailCard(
          Column(
            children: [
              InkWell(
                onTap: () => setState(() => _companyOpen = !_companyOpen),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Company details',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      Text(
                        '${c.region.label} · ABN ${c.abn.isEmpty ? '—' : '✓'}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: detailMuted,
                        ),
                      ),
                      const SizedBox(width: 10),
                      DetailGlyph(_companyOpen ? 'down' : 'chevron', size: 14),
                    ],
                  ),
                ),
              ),
              if (_companyOpen)
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Divider(color: detailLine),
                      Text(c.address, style: const TextStyle(fontSize: 13)),
                      const SizedBox(height: 7),
                      Text(
                        'ABN ${c.abn}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: detailMuted,
                        ),
                      ),
                      if (c.companyPhone.isNotEmpty)
                        Text(
                          'Phone ${c.companyPhone}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: detailMuted,
                          ),
                        ),
                      const SizedBox(height: 12),
                      detailAction(
                        'Edit company details',
                        'doc',
                        _referenceCompanyForm,
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

  Widget _openItem(
    String title,
    String glyph,
    int n,
    String sub,
    double width,
    VoidCallback tap,
  ) => SizedBox(
    width: width,
    child: detailCard(
      InkWell(
        onTap: tap,
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  DetailGlyph(glyph, size: 12, color: detailMuted),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      title,
                      style: const TextStyle(fontSize: 10, color: detailMuted),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                '$n',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                sub,
                style: const TextStyle(fontSize: 10, color: detailMuted),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  Widget _contactRow(CustomerContact c) => Padding(
    padding: const EdgeInsets.all(12),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 17,
          backgroundColor: detailPale,
          child: Text(
            c.name
                .split(' ')
                .where((s) => s.isNotEmpty)
                .take(2)
                .map((s) => s[0])
                .join(),
            style: const TextStyle(fontSize: 12, color: detailGreen),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: 5,
                children: [
                  Text(
                    c.name,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (c.isPrimary) detailBadge('Primary'),
                  if ((_abc && c.id == 'reference-lisa') ||
                      _metadata['contactPending-${c.id}'] == true)
                    detailBadge(
                      'Change pending',
                      background: const Color(0xFFFFF1DC),
                      color: const Color(0xFF9D6500),
                    ),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                c.jobTitle,
                style: const TextStyle(fontSize: 11, color: detailMuted),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _smallContact(
                    c.name.split(' ').first,
                    'phone',
                    c.phone.isEmpty ? null : () => _callPhone(c.phone),
                  ),
                  const SizedBox(width: 6),
                  _smallContact(
                    '',
                    'mail',
                    c.email.isEmpty ? null : () => _sendEmail(c.email),
                  ),
                  const Spacer(),
                  IconButton(
                    tooltip: 'Contact options',
                    onPressed: () => _contactMenu(c),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                      minWidth: 24,
                      minHeight: 24,
                    ),
                    icon: const DetailGlyph(
                      'more',
                      size: 15,
                      color: detailMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    ),
  );
  Widget _smallContact(String text, String glyph, VoidCallback? tap) => InkWell(
    onTap: tap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F5F2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          DetailGlyph(
            glyph,
            size: 12,
            color: tap == null ? const Color(0xFFADB8B0) : detailGreen,
          ),
          if (text.isNotEmpty) ...[
            const SizedBox(width: 5),
            Text(
              text,
              style: const TextStyle(fontSize: 11, color: detailGreen),
            ),
          ],
        ],
      ),
    ),
  );
}
