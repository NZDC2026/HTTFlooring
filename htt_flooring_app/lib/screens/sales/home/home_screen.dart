import '../../../widgets/sales_task_completion.dart';
import '../inventory/sales_selling_screen.dart';
import '../more/sales_more_screen.dart';

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../services/app_session.dart';
import '../../../services/sales_session.dart';
import '../../../services/customer_service.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/sales_document_service.dart';
import '../customers/business_card_review_screen.dart';
import '../customers/customer_map_screen.dart';
import '../customers/customer_notes_screen.dart';
import '../customers/sales_visit_screen.dart';
import '../customers/customer_detail_screen.dart';
import 'sales_dashboard_support.dart';
import 'home_focus_panels.dart';
import '../customers/customer_directory_data.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.onNavigateToTab});
  final ValueChanged<int> onNavigateToTab;
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) restoreNextSalesFollowUps(context);
    });
  }

  int _focus = 0;
  ValueChanged<int> get onNavigateToTab => widget.onNavigateToTab;
  void _quote(BuildContext context) =>
      dashboardOpen(context, const SalesQuoteRequestScreen());

  Future<void> _noteTask(BuildContext context) async {
    final customer = await chooseSalesCustomer(context);
    if (customer == null || !context.mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      builder: (sheet) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const DashboardIcon(Icons.notes),
              title: const Text('Add Note'),
              onTap: () {
                Navigator.pop(sheet);
                dashboardOpen(context, AddNoteScreen(customer: customer));
              },
            ),
            ListTile(
              leading: const DashboardIcon(Icons.event_note_outlined),
              title: const Text('Add Follow-up'),
              onTap: () {
                Navigator.pop(sheet);
                dashboardOpen(context, AddFollowUpScreen(customer: customer));
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();
    context.watch<AppSession>();
    context.watch<CustomerService>();
    context.watch<CustomerNoteService>();
    context.watch<SalesDocumentService>();
    final d = SalesDashboardData(context);
    final now = DateTime.now();
    final demo = d.sample;
    final sampleVisits = demo && d.visits.isEmpty;
    final visitCount = sampleVisits ? 2 : d.visits.length;
    final taskCount = demo ? 14 : d.due.length;
    final directory = CustomerDirectoryData(context);
    final attentionCount = directory
        .filtered(CustomerListFilter.attention)
        .length;
    final sales = demo && d.sales == 0 ? 42025.0 : d.sales;
    final target = demo ? 65000.0 : 0.0;
    final progress = target > 0 ? (sales / target).clamp(0.0, 1.0) : 0.0;
    final fresh = d.tasks
        .where((t) => t.creatorId != context.read<AppSession>().currentUser.id)
        .length;
    final greeting = now.hour < 12
        ? 'Good morning,'
        : now.hour < 18
        ? 'Good afternoon,'
        : 'Good evening,';
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        toolbarHeight: 52,
        backgroundColor: dashboardGreen,
        foregroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleSpacing: 16,
        title: const Row(
          children: [
            DashboardIcon(
              CupertinoIcons.square_stack_3d_up,
              size: 20,
              color: Color(0xFF38B078),
            ),
            SizedBox(width: 9),
            Text(
              'HTT Flooring',
              style: TextStyle(
                fontFamily: 'HttReference',
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Search',
            icon: const DashboardIcon(Icons.search, size: 22),
            onPressed: () => dashboardOpen(context, const SalesSearchScreen()),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: IconButton(
              tooltip: 'Alerts',
              onPressed: () =>
                  dashboardOpen(context, const SalesAlertsScreen()),
              icon: Badge(
                isLabelVisible: fresh > 0,
                label: Text('$fresh'),
                child: const DashboardIcon(Icons.notifications_none, size: 23),
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          Stack(
            children: [
              Container(
                height: 158,
                color: const Color(0xFF0B352A),
                child: CustomPaint(
                  size: const Size(double.infinity, 158),
                  painter: _HomeWood(),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 15, 12, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      greeting,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFFD0DED7),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      session.salespersonName,
                      style: const TextStyle(
                        fontSize: 25,
                        fontWeight: FontWeight.w600,
                        height: 1.1,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 7),
                    Row(
                      children: [
                        const DashboardIcon(
                          Icons.location_on_outlined,
                          size: 13,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          '${session.regionName} Store',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    _salesCard(
                      sales,
                      target,
                      progress,
                      now,
                      demo && d.sales == 0,
                    ),
                  ],
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 11),
                Row(
                  children: [
                    Expanded(
                      child: _metric(
                        'Visits today',
                        '$visitCount',
                        sampleVisits
                            ? 'Next 10:30 AM'
                            : d.visits.isEmpty
                            ? 'None scheduled'
                            : 'View visits',
                        Icons.location_on_outlined,
                        dashboardGreen,
                        _focus == 0,
                        () => setState(() => _focus = 0),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _metric(
                        'Tasks',
                        '$taskCount',
                        '${demo && d.due.isEmpty ? 14 : d.due.length} due today',
                        Icons.event_note_outlined,
                        const Color(0xFF66766D),
                        _focus == 1,
                        () => setState(() => _focus = 1),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _metric(
                        'Attention',
                        '$attentionCount',
                        '${NumberFormat.currency(symbol: '\$', decimalDigits: 0).format(directory.overdueTotal)} overdue',
                        Icons.warning_amber_outlined,
                        const Color(0xFFC6382C),
                        _focus == 2,
                        () => setState(() => _focus = 2),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 9),
                if (_focus == 1)
                  HomeTaskPreview(data: d)
                else if (_focus == 2)
                  HomeAttentionPreview(data: directory)
                else ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        DateFormat('d MMM yyyy').format(now),
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF6D7C74),
                        ),
                      ),
                      TextButton.icon(
                        style: TextButton.styleFrom(
                          foregroundColor: const Color(0xFF087D46),
                          padding: const EdgeInsets.symmetric(horizontal: 3),
                          visualDensity: VisualDensity.compact,
                          minimumSize: const Size(0, 28),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        onPressed: () =>
                            dashboardOpen(context, const CustomerMapScreen()),
                        icon: const DashboardIcon(
                          Icons.route_outlined,
                          size: 15,
                        ),
                        label: const Text(
                          'Plan route',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  _panel(
                    Column(
                      children: [
                        if (sampleVisits) ...[
                          _visit(
                            context,
                            '10:30 AM',
                            d.customers
                                    .where((c) => c.id == 'abc')
                                    .firstOrNull
                                    ?.businessName ??
                                'ABC Flooring',
                            'Showroom quote review',
                            d.customers.where((c) => c.id == 'abc').firstOrNull,
                          ),
                          const Divider(height: 1, color: Color(0xFFF0F2F0)),
                          _visit(
                            context,
                            '2:00 PM',
                            'City Timber Floors',
                            'Deliver Heritage swatches',
                            null,
                          ),
                        ] else if (d.visits.isEmpty)
                          const Padding(
                            padding: EdgeInsets.all(20),
                            child: Text(
                              'No visits scheduled today',
                              style: TextStyle(
                                fontSize: 12,
                                color: Color(0xFF6D7C74),
                              ),
                            ),
                          )
                        else
                          for (final v in d.visits)
                            _visit(
                              context,
                              v.followUpDate == null
                                  ? 'Today'
                                  : DateFormat('h:mm a')
                                        .format(v.followUpDate!.toLocal()),
                              d.customer(v.customerId)?.businessName ??
                                  'Customer visit',
                              v.content,
                              d.customer(v.customerId),
                            ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 15),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Selling now',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    TextButton(
                      onPressed: () => _selling(context, 'All', demo),
                      child: const Text(
                        'All ›',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF087D46),
                        ),
                      ),
                    ),
                  ],
                ),
                _panel(
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      vertical: 10,
                      horizontal: 6,
                    ),
                    child: Row(
                      children: [
                        for (final entry in [
                          (
                            CupertinoIcons.star,
                            'New',
                            2,
                            const Color(0xFFBD8009),
                            const Color(0xFFFFF3D9),
                          ),
                          (
                            Icons.local_shipping_outlined,
                            'Incoming',
                            11,
                            const Color(0xFF2873DB),
                            const Color(0xFFE7EFFF),
                          ),
                          (
                            CupertinoIcons.tag,
                            'Promotion',
                            2,
                            const Color(0xFF127947),
                            const Color(0xFFE4F2EA),
                          ),
                          (
                            Icons.trending_down,
                            'Clearance',
                            1,
                            const Color(0xFFD04443),
                            const Color(0xFFFFE6E6),
                          ),
                        ])
                          Expanded(
                            child: InkWell(
                              onTap: () => _selling(context, entry.$2, demo),
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(5),
                                        decoration: BoxDecoration(
                                          color: entry.$5,
                                          borderRadius: BorderRadius.circular(
                                            7,
                                          ),
                                        ),
                                        child: DashboardIcon(
                                          entry.$1,
                                          size: 14,
                                          color: entry.$4,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${demo ? entry.$3 : 0}',
                                        style: const TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    entry.$2,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: Color(0xFF63736B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 9),
                if (demo)
                  _panel(
                    Column(
                      children: [
                        _sellingRow(
                          context,
                          CupertinoIcons.tag,
                          'Guardian hybrid — extra 5% off over 200 m²',
                          'Promotion',
                          '12 days left',
                          const Color(0xFF127947),
                          const Color(0xFFFFF1D5),
                          'guardian',
                        ),
                        const Divider(height: 1, color: Color(0xFFF0F2F0)),
                        _sellingRow(
                          context,
                          Icons.trending_down,
                          'AquaGlow Silver — clear remaining stock',
                          'Clearance',
                          '167 m²',
                          const Color(0xFFD04443),
                          const Color(0xFFFFE6E6),
                          'aquaglow',
                        ),
                        const Divider(height: 1, color: Color(0xFFF0F2F0)),
                        _sellingRow(
                          context,
                          CupertinoIcons.star,
                          'MTF laminate — 2 new colours',
                          'New',
                          '43 days left',
                          const Color(0xFFBD8009),
                          const Color(0xFFE4F2EA),
                          null,
                        ),
                      ],
                    ),
                  )
                else
                  _panel(
                    const Padding(
                      padding: EdgeInsets.all(18),
                      child: Text(
                        'No selling updates available.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF6D7C74),
                        ),
                      ),
                    ),
                  ),
                const SizedBox(height: 19),
                const Text(
                  'Quick actions',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 10),
                LayoutBuilder(
                  builder: (context, c) {
                    final width = (c.maxWidth - 16) / 3;
                    return Wrap(
                      spacing: 8,
                      runSpacing: 9,
                      children: [
                        _quick(
                          'Request quote',
                          CupertinoIcons.doc,
                          width,
                          () => _quote(context),
                        ),
                        _quick(
                          'Request sample',
                          CupertinoIcons.cube_box,
                          width,
                          () => dashboardOpen(
                            context,
                            const SalesSamplesScreen(createOnOpen: true),
                          ),
                        ),
                        _quick(
                          'Note & Task',
                          Icons.add,
                          width,
                          () => _noteTask(context),
                        ),
                        _quick(
                          'Plan visit',
                          Icons.calendar_today_outlined,
                          width,
                          () => dashboardOpen(
                            context,
                            const AddFollowUpScreen(
                              initialDescription: 'Plan a customer visit.',
                            ),
                          ),
                        ),
                        _quick(
                          'Add customer',
                          CupertinoIcons.person_add,
                          width,
                          () => dashboardOpen(
                            context,
                            const BusinessCardReviewScreen.manual(),
                          ),
                        ),
                      ],
                    );
                  },
                ),
                if (demo)
                  const Padding(
                    padding: EdgeInsets.only(top: 12),
                    child: Text(
                      'Demo preview · sample sales, visits and selling updates',
                      style: TextStyle(fontSize: 10, color: Color(0xFF8A9690)),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _salesCard(
    double sales,
    double target,
    double progress,
    DateTime now,
    bool sample,
  ) => _panel(
    Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Invoiced · ex GST · ${DateFormat('MMMM').format(now)} to date',
            style: const TextStyle(fontSize: 11, color: Color(0xFF6D7C74)),
          ),
          const SizedBox(height: 3),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      NumberFormat.currency(
                        symbol: '\$',
                        decimalDigits: 0,
                      ).format(sales),
                      style: const TextStyle(
                        fontSize: 27,
                        height: 1.1,
                        fontWeight: FontWeight.w700,
                        color: dashboardGreen,
                      ),
                    ),
                    const SizedBox(height: 3),
                    if (sample)
                      const Text(
                        '+60% vs same period last month',
                        style: TextStyle(
                          fontSize: 10,
                          color: Color(0xFF17834B),
                        ),
                      ),
                    const SizedBox(height: 3),
                    Text(
                      target > 0
                          ? '${NumberFormat.currency(symbol: '\$', decimalDigits: 0).format(target - sales)} to go · ${DateUtils.getDaysInMonth(now.year, now.month) - now.day} days left'
                          : 'Sales target not set',
                      style: const TextStyle(
                        fontSize: 10,
                        color: Color(0xFF6D7C74),
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'Target',
                    style: TextStyle(fontSize: 11, color: Color(0xFF6D7C74)),
                  ),
                  Text(
                    target > 0
                        ? NumberFormat.currency(
                            symbol: '\$',
                            decimalDigits: 0,
                          ).format(target)
                        : '—',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              SizedBox(
                width: 44,
                height: 44,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox.expand(
                      child: CircularProgressIndicator(
                        value: progress,
                        strokeWidth: 5,
                        backgroundColor: const Color(0xFFE8EBE7),
                        color: const Color(0xFF218653),
                        strokeCap: StrokeCap.round,
                      ),
                    ),
                    Text(
                      target > 0 ? '${(progress * 100).round()}%' : '—',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
  Widget _panel(Widget child) => Container(
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: const Color(0xFFE2E7E3)),
      boxShadow: const [
        BoxShadow(
          color: Color(0x0B000000),
          blurRadius: 5,
          offset: Offset(0, 2),
        ),
      ],
    ),
    child: Material(type: MaterialType.transparency, child: child),
  );
  Widget _metric(
    String title,
    String count,
    String subtitle,
    IconData icon,
    Color color,
    bool active,
    VoidCallback tap,
  ) => InkWell(
    onTap: tap,
    child: Container(
      height: 76,
      padding: const EdgeInsets.all(7),
      decoration: BoxDecoration(
        color: active ? const Color(0xFFF2F8F5) : Colors.white,
        border: Border.all(
          color: active ? dashboardGreen : const Color(0xFFE2E7E3),
          width: active ? 1.7 : 1,
        ),
        borderRadius: BorderRadius.circular(13),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 3,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              DashboardIcon(icon, size: 12, color: color),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF69756F),
                  ),
                  maxLines: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            count,
            style: TextStyle(
              fontSize: 20,
              height: 1.0,
              color: title == 'Attention' ? color : const Color(0xFF19231F),
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 11,
              color: title == 'Attention' ? color : const Color(0xFF69756F),
            ),
          ),
        ],
      ),
    ),
  );
  Widget _visit(
    BuildContext context,
    String time,
    String customer,
    String note,
    Customer? value,
  ) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 11),
    child: Row(
      children: [
        Container(
          constraints: const BoxConstraints(minWidth: 66),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFE8F0FF),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            time,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1765CF),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                customer,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                note,
                style: const TextStyle(fontSize: 12, color: Color(0xFF6D7C74)),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        OutlinedButton.icon(
          style: OutlinedButton.styleFrom(
            foregroundColor: dashboardGreen,
            padding: const EdgeInsets.symmetric(horizontal: 9),
            minimumSize: const Size(94, 34),
            visualDensity: VisualDensity.standard,
            side: const BorderSide(color: Color(0xFFD8E1DB)),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(9),
            ),
          ),
          onPressed: () => dashboardOpen(
            context,
            SalesVisitScreen(initialSearch: value?.businessName ?? customer),
          ),
          icon: const DashboardIcon(Icons.location_on_outlined, size: 13),
          label: const Text(
            'Check in',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    ),
  );
  Widget _quick(String title, IconData icon, double width, VoidCallback tap) =>
      SizedBox(
        width: width,
        height: 74,
        child: Material(
          color: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(11),
            side: const BorderSide(color: Color(0xFFE3E8E4)),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(11),
            onTap: tap,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                DashboardIcon(icon, color: const Color(0xFF087D46), size: 19),
                const SizedBox(height: 9),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF34423B),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
  void _selling(BuildContext context, String type, bool demo) =>
      dashboardOpen(context, SalesSellingScreen(type: type));
  Widget _sellingRow(
    BuildContext context,
    IconData icon,
    String title,
    String category,
    String status,
    Color color,
    Color tint,
    String? productId,
  ) => InkWell(
    onTap: () => dashboardOpen(
      context,
      SalesSellingScreen(
        type: category.contains('Promotion')
            ? 'Promotion'
            : category.contains('Clearance')
            ? 'Clearance'
            : 'New',
      ),
    ),
    child: Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: color.withValues(alpha: .09),
              borderRadius: BorderRadius.circular(9),
            ),
            child: DashboardIcon(icon, size: 17, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, height: 1.4)),
                Text(
                  category,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF6D7C74),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
            decoration: BoxDecoration(
              color: tint,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              status,
              style: TextStyle(
                fontSize: 10,
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    ),
  );
}

class _HomeWood extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(size.width * .76, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width, size.height)
      ..close();
    canvas.drawPath(path, Paint()..color = const Color(0xFFCDB98F));
    canvas.save();
    canvas.clipPath(path);
    for (var i = -10; i < 20; i++) {
      canvas.drawLine(
        Offset(size.width - 130 + i * 28, 0),
        Offset(size.width - 290 + i * 28, size.height),
        Paint()
          ..color = const Color(0xFF546853)
          ..strokeWidth = 1.5,
      );
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(_HomeWood old) => false;
}
