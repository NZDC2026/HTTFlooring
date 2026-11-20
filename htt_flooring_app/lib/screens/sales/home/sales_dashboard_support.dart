import '../customers/customer_directory_data.dart';
import '../inventory/inventory_catalog_data.dart';

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../models/customer.dart';
import '../../../models/customer_note.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_service.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/sales_session.dart';
import '../../../services/sales_document_service.dart';
import '../customers/customer_detail_screen.dart';
import '../customers/customer_notes_screen.dart';
import '../inventory/inventory_screen.dart';
import '../orders/sales_document_detail_screen.dart';

part 'sales_alerts.dart';

const dashboardGreen = Color(0xFF103F33);
void dashboardOpen(BuildContext context, Widget screen) =>
    Navigator.push(context, MaterialPageRoute<void>(builder: (_) => screen));
AppBar dashboardBar(String title, {List<Widget>? actions}) => AppBar(
  toolbarHeight: 52,
  titleSpacing: 14,
  backgroundColor: Colors.white,
  foregroundColor: const Color(0xFF1D2925),
  elevation: 0,
  scrolledUnderElevation: 0,
  title: Text(
    title,
    style: const TextStyle(
      fontFamily: 'HttReference',
      fontSize: 16,
      fontWeight: FontWeight.w700,
    ),
  ),
  actions: actions,
  shape: const Border(bottom: BorderSide(color: Color(0xFFF0F1F0))),
);

class SalesDashboardData {
  SalesDashboardData(BuildContext context) {
    final app = context.read<AppSession>();
    sample =
        AppSession.demoLoginEnabled &&
        (app.employeeAccessToken?.isEmpty ?? true);
    customers = CustomerDirectoryData(context).rows
        .map((r) => r.customer)
        .toList();
    final ids = customers.map((c) => c.id).toSet();
    tasks = context
        .read<CustomerNoteService>()
        .pendingFollowUps
        .where(
          (n) =>
              n.assignees.any((u) => u.id == app.currentUser.id) &&
              (n.customerId.isEmpty || ids.contains(n.customerId)),
        )
        .toList();
    final today = DateUtils.dateOnly(DateTime.now());
    visits = tasks
        .where(
          (n) =>
              n.followUpType == 'Customer Visit' &&
              DateUtils.isSameDay(n.followUpDate?.toLocal(), today),
        )
        .toList();
    if (sample && tasks.isEmpty) {
      tasks = List.generate(
        16,
        (index) => CustomerNote(
          id: 'sample-dashboard-$index',
          customerId: customers.isEmpty
              ? ''
              : customers[index % customers.length].id,
          type: CustomerNoteType.followUp,
          content: [
            'Confirm payment arrangement',
            'Deliver Heritage sample swatches',
            'Follow up on the flooring quotation',
          ][index % 3],
          createdAt: today.subtract(const Duration(days: 1)),
          followUpDate: index >= 14
              ? today.add(Duration(days: index - 12))
              : today,
          followUpType: [
            'Payment Follow-up',
            'Sample Delivery',
            'Quotation / Order Follow-up',
          ][index % 3],
          creatorId: index < 2 ? 'front-desk' : app.currentUser.id,
          assignees: [app.currentUser],
          followUpStatus: FollowUpStatus.inProgress,
        ),
      );
    }
    due = tasks
        .where((n) => DateUtils.isSameDay(n.followUpDate?.toLocal(), today))
        .toList();
    attention = customers.where((c) => c.overdue > 0).toList();
    noPurchase = customers
        .where(
          (c) =>
              c.lastOrderDate != null &&
              today.difference(c.lastOrderDate!.toLocal()).inDays >= 30,
        )
        .toList();
    final docs = context
        .read<SalesDocumentService>()
        .invoices
        .where((d) => ids.contains(d.customer.id))
        .toList();
    for (final c in customers) {
      double current = 0, previous = 0;
      for (final d in docs.where((d) => d.customer.id == c.id)) {
        final age = today.difference(d.invoiceDate ?? d.createdAt).inDays;
        if (age >= 0 && age < 30) current += d.subtotal;
        if (age >= 30 && age < 60) previous += d.subtotal;
      }
      if (previous > 0 && current <= previous * .7) drop.add(c);
    }
    for (final d in docs) {
      final date = (d.invoiceDate ?? d.createdAt).toLocal();
      if (date.year == today.year && date.month == today.month) {
        sales += d.subtotal;
      }
    }
    overdueAmount = attention.fold(0.0, (s, c) => s + c.overdue);
  }
  late bool sample;
  late List<Customer> customers, attention, noPurchase;
  List<Customer> drop = [];
  late List<CustomerNote> tasks, visits, due;
  double sales = 0, overdueAmount = 0;
  Customer? customer(String id) =>
      customers.where((c) => c.id == id).firstOrNull;
}

class DashboardTaskList extends StatelessWidget {
  const DashboardTaskList({
    super.key,
    required this.title,
    required this.tasks,
  });
  final String title;
  final List<CustomerNote> tasks;
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.white,
    appBar: dashboardBar(title),
    body: tasks.isEmpty
        ? const Center(child: Text('No tasks to show'))
        : ListView(
            children: [
              for (final t in tasks)
                ListTile(
                  title: Text(t.content),
                  subtitle: Text(
                    t.followUpDate == null
                        ? 'No due date'
                        : DateFormat('d MMM yyyy').format(t.followUpDate!),
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () =>
                      dashboardOpen(context, DashboardTaskDetail(task: t)),
                ),
            ],
          ),
  );
}

class DashboardCustomerList extends StatelessWidget {
  const DashboardCustomerList({
    super.key,
    required this.title,
    required this.customers,
  });
  final String title;
  final List<Customer> customers;
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.white,
    appBar: dashboardBar(title),
    body: customers.isEmpty
        ? const Center(child: Text('No customers to show'))
        : ListView(
            children: [
              for (final c in customers)
                ListTile(
                  title: Text(c.businessName),
                  subtitle: Text(c.address),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () =>
                      dashboardOpen(context, CustomerDetailScreen(customer: c)),
                ),
            ],
          ),
  );
}

class SalesSearchScreen extends StatefulWidget {
  const SalesSearchScreen({super.key});
  @override
  State<SalesSearchScreen> createState() => _SalesSearchScreenState();
}

class _SalesSearchScreenState extends State<SalesSearchScreen> {
  final _controller = TextEditingController();
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<CustomerService>();
    context.watch<SalesSession>();
    context.watch<SalesDocumentService>();
    final data = SalesDashboardData(context);
    final q = _controller.text.trim().toLowerCase();
    final customers = q.isEmpty
        ? <Customer>[]
        : data.customers
              .where(
                (c) => '${c.businessName} ${c.address} ${c.abn}'
                    .toLowerCase()
                    .contains(q),
              )
              .toList();
    final availableProducts = inventoryCatalog(
      demo: data.sample,
      region: context.read<SalesSession>().region,
    ).expand((s) => s.colours.map((c) => c.product)).toList();
    final products = availableProducts
        .where(
          (p) =>
              q.isNotEmpty &&
              '${p.name} ${p.colour} ${p.sku} ${p.brand ?? ''}'
                  .toLowerCase()
                  .contains(q),
        )
        .toList();
    final ids = data.customers.map((c) => c.id).toSet();
    final knownDocuments = {
      for (final c in data.customers)
        for (final d in referenceCustomerDocuments(context, c)) d.number: d,
    };
    final docs = knownDocuments.values
        .where(
          (d) =>
              q.isNotEmpty &&
              ids.contains(d.customer.id) &&
              '${d.number} ${d.customer.businessName}'.toLowerCase().contains(
                q,
              ),
        )
        .toList();
    final results = <Widget>[
      if (customers.isEmpty && products.isEmpty && docs.isEmpty)
        const Padding(
          padding: EdgeInsets.all(28),
          child: Text('No results found', textAlign: TextAlign.center),
        ),
      if (customers.isNotEmpty) _heading('CUSTOMERS'),
      for (final c in customers)
        ListTile(
          leading: const Icon(Icons.people_outline),
          title: Text(c.businessName),
          subtitle: Text(c.address),
          trailing: const Icon(Icons.chevron_right),
          onTap: () =>
              dashboardOpen(context, CustomerDetailScreen(customer: c)),
        ),
      if (products.isNotEmpty) _heading('PRODUCTS'),
      for (final p in products)
        ListTile(
          leading: const Icon(CupertinoIcons.cube_box),
          title: Text(p.name),
          subtitle: Text(p.sku),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => openInventoryProduct(context, p),
        ),
      if (docs.isNotEmpty) _heading('SALES DOCUMENTS'),
      for (final d in docs)
        ListTile(
          leading: const Icon(Icons.receipt_long_outlined),
          title: Text(d.number),
          subtitle: Text(d.customer.businessName),
          trailing: const Icon(Icons.chevron_right),
          onTap: () =>
              dashboardOpen(context, SalesDocumentDetailScreen(document: d)),
        ),
    ];
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar('Search'),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _controller,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Customers, products, SKUs, quote or invoice number',
                hintStyle: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF97A29D),
                ),
                prefixIcon: const Icon(
                  Icons.search,
                  size: 20,
                  color: Color(0xFF899790),
                ),
                suffixIcon: q.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () => setState(() => _controller.clear()),
                        icon: const Icon(Icons.close),
                      ),
                isDense: true,
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 13),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFDDE3DF)),
                ),
              ),
            ),
          ),
          Expanded(
            child: q.isEmpty
                ? const Align(
                    alignment: Alignment.topCenter,
                    child: Padding(
                      padding: EdgeInsets.only(top: 18),
                      child: Column(
                        children: [
                          Icon(
                            Icons.search,
                            size: 25,
                            color: Color(0xFFB3BFBA),
                          ),
                          SizedBox(height: 10),
                          Text(
                            'Search across everything',
                            style: TextStyle(
                              fontSize: 13,
                              color: Color(0xFF65766D),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView(children: results),
          ),
        ],
      ),
    );
  }

  Widget _heading(String text) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
    child: Text(
      text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: Color(0xFF65766D),
      ),
    ),
  );
}

class DashboardTaskDetail extends StatelessWidget {
  const DashboardTaskDetail({super.key, required this.task});
  final CustomerNote task;
  @override
  Widget build(BuildContext context) {
    final customer = CustomerDirectoryData(context).rows
        .where((r) => r.customer.id == task.customerId)
        .firstOrNull
        ?.customer;
    if (!task.id.startsWith('sample-dashboard-')) {
      return FollowUpDetail(customer: customer, taskId: task.id);
    }
    return ReferenceExampleFollowUp(task: task, customer: customer);
  }
}

// Draw the few dashboard glyphs directly so they also work with cached fonts.
class DashboardIcon extends StatelessWidget {
  const DashboardIcon(this.icon, {super.key, this.size = 24, this.color});
  final IconData icon;
  final double size;
  final Color? color;
  @override
  Widget build(BuildContext context) {
    final kind = icon == CupertinoIcons.star
        ? 0
        : icon == CupertinoIcons.tag
        ? 1
        : icon == CupertinoIcons.square_stack_3d_up
        ? 2
        : icon == CupertinoIcons.doc
        ? 3
        : (icon == CupertinoIcons.person_add ||
              icon == Icons.person_add_outlined)
        ? 4
        : icon == CupertinoIcons.cube_box
        ? 5
        : icon == Icons.mail_outline
        ? 6
        : icon == Icons.document_scanner_outlined
        ? 7
        : icon == Icons.map_outlined
        ? 8
        : -1;
    if (kind < 0) return Icon(icon, size: size, color: color);
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _DashboardGlyph(
          kind,
          color ?? IconTheme.of(context).color ?? dashboardGreen,
          size,
        ),
      ),
    );
  }
}

class _DashboardGlyph extends CustomPainter {
  _DashboardGlyph(this.kind, this.color, this.iconSize);
  final double iconSize;
  final int kind;
  final Color color;
  @override
  void paint(Canvas canvas, Size size) {
    canvas.translate((size.width - iconSize) / 2, (size.height - iconSize) / 2);
    canvas.scale(iconSize / 24, iconSize / 24);
    final p = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6
      ..strokeJoin = StrokeJoin.round
      ..strokeCap = StrokeCap.round;
    final path = Path();
    if (kind == 0) {
      path.moveTo(12, 3);
      path.lineTo(14.8, 8.7);
      path.lineTo(21, 9.6);
      path.lineTo(16.5, 14);
      path.lineTo(17.6, 20.3);
      path.lineTo(12, 17.3);
      path.lineTo(6.4, 20.3);
      path.lineTo(7.5, 14);
      path.lineTo(3, 9.6);
      path.lineTo(9.2, 8.7);
      path.close();
    } else if (kind == 1) {
      path.moveTo(3, 4);
      path.lineTo(12, 4);
      path.lineTo(21, 13);
      path.lineTo(13, 21);
      path.lineTo(3, 11);
      path.close();
      canvas.drawCircle(const Offset(7, 8), 1.2, p);
    } else if (kind == 2) {
      p.style = PaintingStyle.fill;
      path.moveTo(2, 15);
      path.lineTo(11, 4);
      path.lineTo(17, 4);
      path.lineTo(8, 15);
      path.close();
      path.moveTo(9, 21);
      path.lineTo(18, 10);
      path.lineTo(24, 10);
      path.lineTo(15, 21);
      path.close();
    } else if (kind == 3) {
      path.moveTo(5, 3);
      path.lineTo(14, 3);
      path.lineTo(19, 8);
      path.lineTo(19, 21);
      path.lineTo(5, 21);
      path.close();
      path.moveTo(14, 3);
      path.lineTo(14, 8);
      path.lineTo(19, 8);
      path.moveTo(8, 13);
      path.lineTo(16, 13);
      path.moveTo(12, 10);
      path.lineTo(12, 17);
    } else if (kind == 4) {
      canvas.drawCircle(const Offset(9, 7), 3.5, p);
      path.moveTo(2, 21);
      path.cubicTo(2, 12, 16, 12, 16, 21);
      path.moveTo(19, 8);
      path.lineTo(19, 15);
      path.moveTo(15.5, 11.5);
      path.lineTo(22.5, 11.5);
    } else if (kind == 8) {
      path.moveTo(3, 5);
      path.lineTo(9, 2);
      path.lineTo(15, 5);
      path.lineTo(21, 2);
      path.lineTo(21, 19);
      path.lineTo(15, 22);
      path.lineTo(9, 19);
      path.lineTo(3, 22);
      path.close();
      path.moveTo(9, 2);
      path.lineTo(9, 19);
      path.moveTo(15, 5);
      path.lineTo(15, 22);
    } else if (kind == 7) {
      path.moveTo(3, 8);
      path.lineTo(3, 3);
      path.lineTo(8, 3);
      path.moveTo(16, 3);
      path.lineTo(21, 3);
      path.lineTo(21, 8);
      path.moveTo(21, 16);
      path.lineTo(21, 21);
      path.lineTo(16, 21);
      path.moveTo(8, 21);
      path.lineTo(3, 21);
      path.lineTo(3, 16);
      path.moveTo(7, 8);
      path.lineTo(17, 8);
      path.moveTo(7, 12);
      path.lineTo(17, 12);
      path.moveTo(7, 16);
      path.lineTo(14, 16);
    } else if (kind == 6) {
      path.addRRect(
        RRect.fromRectAndRadius(
          const Rect.fromLTWH(3, 5, 18, 14),
          const Radius.circular(2),
        ),
      );
      path.moveTo(3, 6);
      path.lineTo(12, 13);
      path.lineTo(21, 6);
    } else {
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
    }
    canvas.drawPath(path, p);
  }

  @override
  bool shouldRepaint(_DashboardGlyph old) =>
      old.kind != kind || old.color != color || old.iconSize != iconSize;
}
