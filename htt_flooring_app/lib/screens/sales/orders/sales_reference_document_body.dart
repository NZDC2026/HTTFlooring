import '../../../models/sales_user.dart';
import '../../../models/customer.dart';
import '../inventory/inventory_screen.dart' show InventorySwatch;

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../models/sales_document.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_service.dart';
import '../../../services/local_sales_request_store.dart';
import '../../../services/sales_document_service.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../customers/customer_detail_screen.dart';
import '../customers/customer_notes_screen.dart';
import '../home/sales_dashboard_support.dart';

class SalesDocumentReferenceBody extends StatefulWidget {
  const SalesDocumentReferenceBody({super.key, required this.document});
  final SalesDocument document;
  @override
  State<SalesDocumentReferenceBody> createState() =>
      _SalesDocumentReferenceState();
}

class _SalesDocumentReferenceState extends State<SalesDocumentReferenceBody> {
  String? _response;
  bool _delivered = false, _loaded = false, _responding = false;
  bool get _referenceQuote =>
      SalesDashboardData(context).sample && _document.number == 'QT-1003';
  String get _customerNotes => _referenceQuote
      ? 'Hornsby townhouses, 12 units. Delivery in 3 drops.'
      : '—';
  String get _key =>
      'sales-document-view-${context.read<AppSession>().currentUser.id}-${widget.document.number}';
  SalesDocument get _document =>
      context.read<SalesDocumentService>().findByNumber(
        widget.document.number,
      ) ??
      widget.document;
  String _money(double n) => NumberFormat.currency(symbol: '\$').format(n);
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loaded = true;
      _load();
    }
  }

  Future<void> _load() async {
    final key = _key;
    final p = await SharedPreferences.getInstance();
    try {
      final data = jsonDecode(p.getString(key) ?? '{}') as Map;
      if (mounted) {
        setState(() {
          _response = data['response'] as String?;
          _delivered = data['delivered'] == true;
        });
      }
    } catch (_) {
      /* Ignore obsolete document view metadata. */
    }
  }

  Future<void> _save() async {
    final key = _key;
    final p = await SharedPreferences.getInstance();
    await p.setString(
      key,
      jsonEncode({'response': _response, 'delivered': _delivered}),
    );
  }

  bool get _referenceAbcQuote =>
      SalesDashboardData(context).sample && _document.number == 'QT-1004';
  String _lineQuantity(SalesDocument d, int i) => _referenceQuote
      ? i == 0
            ? '420 m² + 5% wastage → 442.20 m² · 201 boxes @ \$52.00/m²'
            : '180 m² + 10% wastage → 200.03 m² · 83 boxes @ \$36.00/m²'
      : _referenceAbcQuote
      ? '60 m² + 10% wastage → 66.24 m² · 46 boxes @ \$83.50/m²'
      : d.items[i].pricedByPiece
      ? '${d.items[i].boxes} pcs @ ${_money(d.items[i].unitPrice)}'
      : '${d.items[i].sqm.toStringAsFixed(2)} m² · ${d.items[i].boxes} boxes @ ${_money(d.items[i].unitPrice)}/m²';
  String? _lineAvailability(int i) => _referenceQuote
      ? i == 0
            ? 'Only 374 m² (170 bx) available'
            : 'Only 0 m² (0 bx) available · 723 m² arriving 25 Nov'
      : _referenceAbcQuote
      ? 'Only 26 m² (18 bx) available · 173 m² arriving 28 Nov'
      : null;
  Widget _lineItems(SalesDocument d) => detailCard(
    Column(
      children: [
        for (var i = 0; i < d.items.length; i++) ...[
          if (i > 0) const Divider(height: 1, color: detailLine),
          Padding(
            padding: const EdgeInsets.all(13),
            child: Row(
              children: [
                InventorySwatch(
                  seed: d.items[i].product.colour,
                  size: 36,
                  single: true,
                ),
                const SizedBox(width: 11),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        d.items[i].product.name,
                        style: const TextStyle(fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _lineQuantity(d, i),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          color: detailMuted,
                          height: 1.3,
                        ),
                      ),
                      if (_lineAvailability(i) != null)
                        Text(
                          _lineAvailability(i)!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            color: detailMuted,
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 9),
                Text(
                  _money(d.items[i].subtotal),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    ),
  );
  Widget _documentMetric(String label, String value, {String? hint}) =>
      Expanded(
        child: detailCard(
          Padding(
            padding: const EdgeInsets.all(13),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 12, color: detailMuted),
                ),
                const SizedBox(height: 6),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (hint != null) ...[
                  const SizedBox(height: 5),
                  Text(
                    hint,
                    style: const TextStyle(fontSize: 12, color: detailMuted),
                  ),
                ],
              ],
            ),
          ),
        ),
      );
  Widget _totals(SalesDocument d) => detailCard(
    Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Subtotal (excl. GST)',
                  style: TextStyle(fontSize: 12, color: detailMuted),
                ),
              ),
              Text(_money(d.subtotal), style: const TextStyle(fontSize: 13)),
            ],
          ),
          const SizedBox(height: 7),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'GST 10%',
                  style: TextStyle(fontSize: 12, color: detailMuted),
                ),
              ),
              Text(_money(d.gst), style: const TextStyle(fontSize: 13)),
            ],
          ),
          const Divider(height: 22, color: detailLine),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Total',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
              ),
              Text(
                _money(d.total),
                style: const TextStyle(
                  fontSize: 19,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
  @override
  Widget build(BuildContext context) {
    context.watch<SalesDocumentService>();
    final d = _document;
    final invoice = d.status == SalesDocumentStatus.invoice,
        quote = d.status == SalesDocumentStatus.quotation;
    final date = d.invoiceDate ?? d.createdAt;
    final customer = context.read<CustomerService>().findById(d.customer.id);
    if (invoice) return _invoiceBody(d, customer);
    final validUntil = d.createdAt.add(const Duration(days: 30));
    final validDays = DateUtils.dateOnly(validUntil)
        .difference(DateUtils.dateOnly(DateTime.now()))
        .inDays;
    return Scaffold(
      backgroundColor: const Color(0xfff3f5f4),
      appBar: dashboardBar(d.number),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 16, 12, 28),
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${quote ? 'Quotation' : 'Sales order'} ${d.number}',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Wrap(
                      children: [
                        InkWell(
                          onTap: customer == null
                              ? null
                              : () => dashboardOpen(
                                  context,
                                  CustomerDetailScreen(customer: customer),
                                ),
                          child: Text(
                            d.customer.businessName,
                            style: const TextStyle(
                              fontSize: 13,
                              color: detailGreen,
                            ),
                          ),
                        ),
                        Text(
                          ' · ${DateFormat('d MMM yyyy').format(date)}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: detailMuted,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              detailBadge(
                quote
                    ? (_referenceQuote ? 'Sent' : 'Draft')
                    : _delivered
                    ? 'Delivered'
                    : 'Confirmed',
              ),
            ],
          ),
          const SizedBox(height: 13),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _documentMetric(
                quote ? 'Valid until' : 'Delivery',
                DateFormat('d MMM yyyy').format(
                  quote ? validUntil : d.createdAt.add(const Duration(days: 9)),
                ),
                hint: quote
                    ? (validDays < 0
                          ? 'Expired'
                          : validDays == 0
                          ? 'Expires today'
                          : '$validDays days left')
                    : null,
              ),
              const SizedBox(width: 10),
              _documentMetric(
                'Total incl. GST',
                _money(d.total),
                hint: quote ? '${_money(d.subtotal)} excl. GST' : null,
              ),
            ],
          ),
          detailHeading(invoice ? 'Lines' : 'Products'),
          _lineItems(d),
          const SizedBox(height: 12),
          _totals(d),
          if (quote) ...[
            detailHeading('Notes for customer'),
            detailCard(
              Padding(
                padding: const EdgeInsets.all(14),
                child: Text(
                  _customerNotes,
                  style: const TextStyle(fontSize: 13, color: detailMuted),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: detailAction('Preview', 'doc', _preview)),
                const SizedBox(width: 10),
                Expanded(child: detailAction('Copy text', 'doc', _copy)),
              ],
            ),
            if (_response == null) ...[
              detailHeading('Customer response'),
              Row(
                children: [
                  Expanded(
                    child: detailAction(
                      'Accepted',
                      'check',
                      _responding ? null : () => _customerResponse('Accepted'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: detailAction(
                      'Declined',
                      'close',
                      _responding ? null : () => _customerResponse('Declined'),
                    ),
                  ),
                ],
              ),
            ] else
              Padding(
                padding: const EdgeInsets.only(top: 18),
                child: detailCard(
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        const DetailGlyph('check', size: 17),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Customer ${_response!.toLowerCase()} · saved for office review.',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 10),
            const Text(
              'Only the office can raise or convert orders. Responses are saved locally until office sync is connected.',
              style: TextStyle(fontSize: 11, color: detailMuted, height: 1.5),
            ),
          ] else if (invoice) ...[
            const SizedBox(height: 14),
            detailAction(
              'Add payment follow-up',
              'plus',
              customer == null
                  ? null
                  : () => dashboardOpen(
                      context,
                      AddFollowUpScreen(
                        customer: customer,
                        initialType: 'Payment Follow-up',
                        initialDueDate: DateUtils.dateOnly(DateTime.now()),
                        initialDescription:
                            'Follow up ${d.number} — ${_money(d.balanceDue)} outstanding.',
                      ),
                    ),
              filled: true,
            ),
            const SizedBox(height: 8),
            detailAction(
              'Open customer',
              'person',
              customer == null
                  ? null
                  : () => dashboardOpen(
                      context,
                      CustomerDetailScreen(customer: customer),
                    ),
            ),
          ] else ...[
            const SizedBox(height: 14),
            detailAction(
              _delivered ? 'Delivered' : 'Mark as delivered',
              'check',
              _delivered ? null : _markDelivered,
              filled: true,
            ),
            const SizedBox(height: 10),
            const Text(
              'Delivery confirmation is saved on this device. Stock changes require warehouse synchronization.',
              style: TextStyle(fontSize: 11, color: detailMuted, height: 1.5),
            ),
          ],
        ],
      ),
    );
  }

  Widget _invoiceBody(SalesDocument d, Customer? customer) {
    Widget valueCard(String label, String value, {String? hint}) => detailCard(
      Padding(
        padding: const EdgeInsets.all(13),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: detailMuted),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            if (hint != null) ...[
              const SizedBox(height: 4),
              Text(
                hint,
                style: const TextStyle(fontSize: 12, color: detailMuted),
              ),
            ],
          ],
        ),
      ),
    );
    return Scaffold(
      backgroundColor: const Color(0xfff3f5f4),
      appBar: dashboardBar(d.number),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 16, 12, 28),
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tax invoice ${d.number}',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      d.customer.businessName,
                      style: const TextStyle(fontSize: 13, color: detailMuted),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: d.balanceDue <= 0
                      ? const Color(0xffe5f2eb)
                      : const Color(0xfffff3dc),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  d.balanceDue <= 0 ? 'Paid' : 'Outstanding',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: d.balanceDue <= 0
                        ? detailGreen
                        : const Color(0xff9b660d),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 13),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: valueCard(
                  'Invoice date',
                  DateFormat('d MMM yyyy').format(d.invoiceDate ?? d.createdAt),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: valueCard(
                  'Due date',
                  d.dueDate == null
                      ? '—'
                      : DateFormat('d MMM yyyy').format(d.dueDate!),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: valueCard(
                  'Balance',
                  _money(d.balanceDue),
                  hint: 'of ${_money(d.total)}',
                ),
              ),
              const SizedBox(width: 10),
              const Expanded(child: SizedBox()),
            ],
          ),
          detailHeading('Lines'),
          detailCard(
            Column(
              children: [
                for (final line in d.items) ...[
                  Padding(
                    padding: const EdgeInsets.all(13),
                    child: Row(
                      children: [
                        InventorySwatch(
                          seed: line.product.colour,
                          size: 36,
                          single: true,
                        ),
                        const SizedBox(width: 11),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                line.product.name,
                                style: const TextStyle(fontSize: 14),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                line.pricedByPiece
                                    ? '${line.boxes} pcs @ ${_money(line.unitPrice)}'
                                    : '${line.sqm.toStringAsFixed(2)} m² · ${line.boxes} boxes @ ${_money(line.unitPrice)}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: detailMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 7),
                        Text(
                          _money(line.subtotal),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, color: detailLine),
                ],
                Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Subtotal ${_money(d.subtotal)} + GST ${_money(d.gst)}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: detailMuted,
                          ),
                        ),
                      ),
                      const SizedBox(width: 9),
                      Text(
                        _money(d.total),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: detailAction(
                  'Add payment\nfollow-up',
                  'calendar',
                  customer == null
                      ? null
                      : () => dashboardOpen(
                          context,
                          AddFollowUpScreen(
                            customer: customer,
                            initialType: 'Payment Follow-up',
                            initialDueDate: DateUtils.dateOnly(DateTime.now()),
                            initialDescription:
                                'Follow up ${d.number} — ${_money(d.balanceDue)} outstanding.',
                          ),
                        ),
                  filled: true,
                  fontSize: 13,
                  height: 44,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: detailAction(
                  'Open customer',
                  '',
                  customer == null
                      ? null
                      : () => dashboardOpen(
                          context,
                          CustomerDetailScreen(customer: customer),
                        ),
                  fontSize: 13,
                  height: 44,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _text() {
    final d = _document;
    final quote = d.status == SalesDocumentStatus.quotation;
    return '${d.status == SalesDocumentStatus.invoice
        ? 'Tax invoice'
        : quote
        ? 'Quotation'
        : 'Sales order'} ${d.number}\n${d.customer.businessName}\nDate ${DateFormat('d MMM yyyy').format(d.invoiceDate ?? d.createdAt)}${quote ? ' · Valid until ${DateFormat('d MMM yyyy').format(d.createdAt.add(const Duration(days: 30)))}' : ''}\n${d.items.map((i) => '${i.product.name} (${i.product.sku}) — ${i.pricedByPiece ? '${i.boxes} pcs' : '${i.sqm.toStringAsFixed(2)} m² · ${i.boxes} boxes'} @ ${_money(i.unitPrice)} = ${_money(i.subtotal)}').join('\n')}\nSubtotal ${_money(d.subtotal)}\nGST ${_money(d.gst)}\nTotal ${_money(d.total)}${_customerNotes == '—' ? '' : '\nNotes: $_customerNotes'}';
  }

  Future<void> _copy() async {
    await Clipboard.setData(ClipboardData(text: _text()));
    if (mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Copied document text.')));
    }
  }

  void _preview() => Navigator.push(
    context,
    MaterialPageRoute(
      builder: (_) => _SalesDocumentPreview(
        document: _document,
        notes: _customerNotes,
        referenceQuote: _referenceQuote,
      ),
    ),
  );
  Future<void> _customerResponse(String response) async {
    if (_response != null || _responding) return;
    final user = context.read<AppSession>().currentUser;
    setState(() => _responding = true);
    try {
      await LocalSalesRequestStore.append(user.id, {
        'kind': 'Quote',
        'customer': _document.customer.businessName,
        'customerId': _document.customer.id,
        'document': _document.number,
        'note': 'Customer response: $response',
      });
      if (!mounted) return;
      setState(() => _response = response);
      await _save();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Customer response saved for office review.'),
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not save the response. Try again.'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _responding = false);
    }
  }

  Future<void> _markDelivered() async {
    final yes = await showReferenceModal<bool>(
      context,
      (dialog) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Mark as delivered?',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 9),
          const Text(
            'Confirm delivery and save the result for office review.',
            style: TextStyle(fontSize: 12, color: detailMuted, height: 1.5),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: detailAction(
                  'Cancel',
                  '',
                  () => Navigator.pop(dialog, false),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: detailAction(
                  'Delivered',
                  '',
                  () => Navigator.pop(dialog, true),
                  filled: true,
                ),
              ),
            ],
          ),
        ],
      ),
    );
    if (yes != true || !mounted) return;
    setState(() => _delivered = true);
    await _save();
  }
}

class _SalesDocumentPreview extends StatelessWidget {
  const _SalesDocumentPreview({
    required this.document,
    required this.notes,
    required this.referenceQuote,
  });
  final SalesDocument document;
  final String notes;
  final bool referenceQuote;
  String money(double value) =>
      NumberFormat.currency(symbol: '\$').format(value);
  @override
  Widget build(BuildContext context) {
    final d = document;
    final quote = d.status == SalesDocumentStatus.quotation;
    final invoice = d.status == SalesDocumentStatus.invoice;
    final contact = context
        .read<CustomerService>()
        .getContactsForCustomer(d.customer.id)
        .where((c) => c.isPrimary)
        .firstOrNull;
    return Scaffold(
      backgroundColor: const Color(0xFFE8ECEE),
      appBar: dashboardBar(
        quote
            ? 'Quote preview'
            : invoice
            ? 'Invoice preview'
            : 'Order preview',
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 16, 12, 28),
        children: [
          detailCard(
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'HTT Flooring',
                              style: TextStyle(
                                fontSize: 21,
                                fontWeight: FontWeight.w700,
                                color: detailGreen,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${d.customer.region.label} Store',
                              style: const TextStyle(
                                fontSize: 10,
                                color: detailMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            quote
                                ? 'QUOTATION'
                                : invoice
                                ? 'TAX INVOICE'
                                : 'SALES ORDER',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(d.number, style: const TextStyle(fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Date ${DateFormat('d MMM yyyy').format(d.invoiceDate ?? d.createdAt)}${quote ? ' · Valid until ${DateFormat('d MMM yyyy').format(d.createdAt.add(const Duration(days: 30)))}' : ''}',
                    style: const TextStyle(fontSize: 10, color: detailMuted),
                  ),
                  const Divider(height: 28, color: detailLine),
                  const Text(
                    'Prepared for',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    d.customer.businessName,
                    style: const TextStyle(fontSize: 12),
                  ),
                  if (contact != null)
                    Text(
                      '${contact.name}${contact.jobTitle.isEmpty ? '' : ', ${contact.jobTitle}'}',
                      style: const TextStyle(fontSize: 11),
                    ),
                  if (contact == null && referenceQuote)
                    const Text(
                      'Mark Taylor, Director',
                      style: TextStyle(fontSize: 11),
                    ),
                  if (d.customer.address.isNotEmpty)
                    Text(
                      d.customer.address,
                      style: const TextStyle(fontSize: 11, height: 1.6),
                    ),
                  const SizedBox(height: 20),
                  Table(
                    columnWidths: const {
                      0: FlexColumnWidth(2.4),
                      1: FlexColumnWidth(1.45),
                      2: FlexColumnWidth(1.2),
                      3: FlexColumnWidth(1.6),
                    },
                    border: const TableBorder(
                      horizontalInside: BorderSide(color: detailLine),
                    ),
                    children: [
                      TableRow(
                        children: [
                          for (final heading in [
                            'Product',
                            'Qty',
                            'Unit price',
                            'Amount',
                          ])
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 9,
                                horizontal: 3,
                              ),
                              child: Text(
                                heading,
                                style: const TextStyle(
                                  fontSize: 9,
                                  color: detailMuted,
                                ),
                              ),
                            ),
                        ],
                      ),
                      for (var i = 0; i < d.items.length; i++)
                        TableRow(
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 10,
                                horizontal: 3,
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    d.items[i].product.name,
                                    style: const TextStyle(fontSize: 10),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${d.items[i].product.sku}${d.number == 'QT-1004' ? ' · 60 m² + 10%' : ''}${referenceQuote
                                        ? i == 0
                                              ? ' · 420 m² + 5%'
                                              : ' · 180 m² + 10%'
                                        : ''}',
                                    style: const TextStyle(
                                      fontSize: 9,
                                      color: detailMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 10,
                                horizontal: 3,
                              ),
                              child: Text(
                                d.items[i].pricedByPiece
                                    ? '${d.items[i].boxes} pcs'
                                    : '${d.items[i].sqm.toStringAsFixed(2)} m² · ${d.items[i].boxes} boxes',
                                style: const TextStyle(fontSize: 9),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 10,
                                horizontal: 3,
                              ),
                              child: Text(
                                '${money(d.items[i].unitPrice)}/m²',
                                style: const TextStyle(fontSize: 9),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 10,
                                horizontal: 3,
                              ),
                              child: Text(
                                money(d.items[i].subtotal),
                                textAlign: TextAlign.right,
                                style: const TextStyle(fontSize: 9),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  for (final row in [
                    ('Subtotal', money(d.subtotal)),
                    ('GST 10%', money(d.gst)),
                    ('Total AUD', money(d.total)),
                  ])
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              row.$1,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: row.$1 == 'Total AUD'
                                    ? FontWeight.w700
                                    : FontWeight.w400,
                              ),
                            ),
                          ),
                          Text(
                            row.$2,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: row.$1 == 'Total AUD'
                                  ? FontWeight.w700
                                  : FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (notes != '—') ...[
                    const SizedBox(height: 18),
                    const Text(
                      'Notes',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(notes, style: const TextStyle(fontSize: 11)),
                  ],
                  const SizedBox(height: 20),
                  Text(
                    'Prices in AUD. Stock is not reserved until the order is confirmed. Prepared by ${context.read<AppSession>().currentUser.name}.',
                    style: const TextStyle(
                      fontSize: 10,
                      height: 1.5,
                      color: detailMuted,
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
}
