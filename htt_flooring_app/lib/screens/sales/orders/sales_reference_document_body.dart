import '../../../models/sales_user.dart';

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

  Widget _value(String label, String value, {String? hint}) => Expanded(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: detailMuted)),
        const SizedBox(height: 5),
        Text(
          value,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        if (hint != null) ...[
          const SizedBox(height: 3),
          Text(hint, style: const TextStyle(fontSize: 11, color: detailMuted)),
        ],
      ],
    ),
  );
  Widget _lineItems(SalesDocument d) => detailCard(
    Column(
      children: [
        for (var i = 0; i < d.items.length; i++) ...[
          if (i > 0) const Divider(height: 1, color: detailLine),
          Padding(
            padding: const EdgeInsets.all(13),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        d.items[i].product.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _referenceQuote
                            ? i == 0
                                  ? '420 m² + 5% wastage → 442.20 m² · 201 boxes @ \$52.00/m²'
                                  : '180 m² + 10% wastage → 200.03 m² · 83 boxes @ \$36.00/m²'
                            : '${d.items[i].sqm.toStringAsFixed(2)} m² · ${d.items[i].boxes} boxes @ ${_money(d.items[i].unitPrice)}${d.status == SalesDocumentStatus.invoice ? '' : '/m²'}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: detailMuted,
                          height: 1.5,
                        ),
                      ),
                      if (_referenceQuote)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            i == 0 ? 'Only 374 m² (170 bx) available' : 'Only 0 m² (0 bx) available · 723 m² arriving 25 Nov',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFFB67100),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  _money(d.items[i].subtotal),
                  style: const TextStyle(
                    fontSize: 14,
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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar(d.number),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 14, 12, 28),
        children: [
          detailCard(
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${invoice
                        ? 'Tax invoice'
                        : quote
                        ? 'Quotation'
                        : 'Sales order'} ${d.number}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 7),
                  Text(
                    '${d.customer.businessName}${invoice ? '' : ' · ${DateFormat('d MMM yyyy').format(date)}'}',
                    style: const TextStyle(fontSize: 13, color: detailMuted),
                  ),
                  const SizedBox(height: 11),
                  detailBadge(
                    invoice
                        ? (d.balanceDue <= 0 ? 'Paid' : 'Outstanding')
                        : quote
                        ? (_referenceQuote ? 'Sent' : 'Draft')
                        : _delivered
                        ? 'Delivered'
                        : 'Confirmed',
                  ),
                  const SizedBox(height: 16),
                  if (invoice)
                    Row(
                      children: [
                        _value(
                          'Invoice date',
                          DateFormat('d MMM yyyy').format(date),
                        ),
                        _value(
                          'Due date',
                          d.dueDate == null
                              ? '—'
                              : DateFormat('d MMM yyyy').format(d.dueDate!),
                        ),
                      ],
                    )
                  else
                    Row(
                      children: [
                        _value(
                          quote ? 'Valid until' : 'Delivery',
                          DateFormat('d MMM yyyy').format(
                            quote
                                ? d.createdAt.add(const Duration(days: 30))
                                : d.createdAt.add(const Duration(days: 9)),
                          ),
                        ),
                        _value(
                          'Total incl. GST',
                          _money(d.total),
                          hint: '${_money(d.subtotal)} excl. GST',
                        ),
                      ],
                    ),
                  if (invoice) ...[
                    const Divider(height: 24, color: detailLine),
                    Text(
                      'Balance',
                      style: const TextStyle(fontSize: 11, color: detailMuted),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      _money(d.balanceDue),
                      style: const TextStyle(
                        fontSize: 25,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      'of ${_money(d.total)}',
                      style: const TextStyle(fontSize: 12, color: detailMuted),
                    ),
                  ],
                ],
              ),
            ),
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

  String _text() {
    final d = _document;
    final quote = d.status == SalesDocumentStatus.quotation;
    return '${d.status == SalesDocumentStatus.invoice
        ? 'Tax invoice'
        : quote
        ? 'Quotation'
        : 'Sales order'} ${d.number}\n${d.customer.businessName}\nDate ${DateFormat('d MMM yyyy').format(d.invoiceDate ?? d.createdAt)}${quote ? ' · Valid until ${DateFormat('d MMM yyyy').format(d.createdAt.add(const Duration(days: 30)))}' : ''}\n${d.items.map((i) => '${i.product.name} (${i.product.sku}) — ${i.sqm.toStringAsFixed(2)} m² · ${i.boxes} boxes @ ${_money(i.unitPrice)} = ${_money(i.subtotal)}').join('\n')}\nSubtotal ${_money(d.subtotal)}\nGST ${_money(d.gst)}\nTotal ${_money(d.total)}${_customerNotes == '—' ? '' : '\nNotes: $_customerNotes'}';
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
    final yes = await showDialog<bool>(
      context: context,
      builder: (dialog) => AlertDialog(
        backgroundColor: Colors.white,
        title: const Text('Mark as delivered?', style: TextStyle(fontSize: 18)),
        content: Text(
          'Confirm delivery for ${_document.number}.',
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialog, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialog, true),
            child: const Text('Confirm'),
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
                                    '${d.items[i].product.sku}${referenceQuote
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
                                '${d.items[i].sqm.toStringAsFixed(2)} m² · ${d.items[i].boxes} boxes',
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
