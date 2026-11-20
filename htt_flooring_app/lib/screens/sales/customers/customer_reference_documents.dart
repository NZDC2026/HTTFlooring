part of 'customer_detail_screen.dart';

List<SalesDocument> referenceCustomerDocuments(
  BuildContext context,
  Customer customer,
) {
  final actual = context
      .read<SalesDocumentService>()
      .documents
      .where((d) => d.customer.id == customer.id)
      .toList();
  if (!SalesDashboardData(context).sample) return actual;
  if (customer.businessName == 'Northern Floors') {
    if (actual.any((d) => d.number == 'QT-1003')) return actual;
    return [
      ...actual,
      SalesDocument(
        number: 'QT-1003',
        customer: CustomerSnapshot(
          id: customer.id,
          businessName: customer.businessName,
          type: customer.type,
          region: customer.region,
          address: '21 Pacific Highway, Hornsby NSW 2077',
          abn: customer.abn,
        ),
        createdAt: DateTime(2026, 11, 4),
        items: const [
          SalesDocumentItem(
            product: ProductSnapshot(
              id: 'guardian-d3017',
              sku: 'GUA-017',
              name: 'Guardian D3017',
              category: 'Hybrid',
              colour: 'D3017',
              sqmPerBox: 2.2,
            ),
            boxes: 201,
            sqm: 442.2,
            unitPrice: 52,
          ),
          SalesDocumentItem(
            product: ProductSnapshot(
              id: 'mtf-grey',
              sku: 'MTF-004',
              name: 'MTF Grey',
              category: 'Laminate',
              colour: 'Grey',
              sqmPerBox: 2.41,
            ),
            boxes: 83,
            sqm: 200.03,
            unitPrice: 36,
          ),
        ],
      ),
    ];
  }
  if (customer.id != 'abc') return actual;
  const bonita = ProductSnapshot(
    id: 'bonita',
    sku: 'BON-001',
    name: 'Bonita Natural Oak',
    category: 'Engineered Timber',
    colour: 'Natural Oak',
    sqmPerBox: 2.2,
  );
  const guardian = ProductSnapshot(
    id: 'guardian',
    sku: 'GUA-016',
    name: 'Guardian D3016',
    category: 'Hybrid',
    colour: 'D3016',
    sqmPerBox: 2.2,
  );
  const heritage = ProductSnapshot(
    id: 'heritage-smoked',
    sku: 'HER-004',
    name: 'Heritage Smoked Oak',
    category: 'Engineered Timber',
    colour: 'Smoked Oak',
    sqmPerBox: 1.44,
  );
  final snapshot = CustomerSnapshot.fromCustomer(customer);
  final examples = [
    SalesDocument(
      number: 'QT-1004',
      customer: snapshot,
      createdAt: DateTime(2026, 11, 17),
      items: const [
        SalesDocumentItem(
          product: heritage,
          boxes: 46,
          sqm: 66.24,
          unitPrice: 83.5,
        ),
      ],
    ),
    SalesDocument(
      number: 'SO-2051',
      customer: snapshot,
      createdAt: DateTime(2026, 11, 12),
      status: SalesDocumentStatus.order,
      items: const [
        SalesDocumentItem(product: bonita, boxes: 40, sqm: 88, unitPrice: 69),
        SalesDocumentItem(
          product: guardian,
          boxes: 20,
          sqm: 44,
          unitPrice: 47.5,
        ),
      ],
    ),
    for (final r in [
      ('INV-10163', 7575.48, 12),
      ('INV-10161', 3005.64, 12),
      ('INV-10160', 7454.58, 12),
      ('INV-10159', 4911.50, 5),
      ('INV-10548', 8682.96, 19),
    ])
      SalesDocument(
        number: r.$1,
        customer: snapshot,
        createdAt: DateTime(2026, r.$1 == 'INV-10548' ? 10 : 11, r.$3),
        invoiceDate: DateTime(2026, r.$1 == 'INV-10548' ? 10 : 11, r.$3),
        dueDate: r.$1 == 'INV-10548'
            ? DateTime(2026, 11, 18)
            : DateTime(2026, 12, r.$3),
        status: SalesDocumentStatus.invoice,
        items: [
          SalesDocumentItem(
            product: bonita,
            boxes: r.$1 == 'INV-10548' ? 52 : (r.$2 / 1.1 / 69 / 2.2).round(),
            sqm: r.$1 == 'INV-10548' ? 114.4 : r.$2 / 1.1 / 69,
            unitPrice: 69,
          ),
        ],
      ),
  ];
  return [
    ...actual,
    ...examples.where((e) => !actual.any((a) => a.number == e.number)),
  ];
}

class _ReferenceCustomerDocuments extends StatefulWidget {
  const _ReferenceCustomerDocuments({
    required this.customer,
    required this.initialType,
  });
  final Customer customer;
  final String initialType;
  @override
  State<_ReferenceCustomerDocuments> createState() =>
      _ReferenceCustomerDocumentsState();
}

class _ReferenceCustomerDocumentsState
    extends State<_ReferenceCustomerDocuments> {
  late String _type = widget.initialType;
  String _query = '';
  @override
  Widget build(BuildContext context) {
    context.watch<SalesDocumentService>();
    final docs = referenceCustomerDocuments(context, widget.customer)
        .where(
          (d) =>
              (d.status ==
                  (_type == 'Quotes'
                      ? SalesDocumentStatus.quotation
                      : _type == 'Orders'
                      ? SalesDocumentStatus.order
                      : SalesDocumentStatus.invoice)) &&
              d.number.toLowerCase().contains(_query.toLowerCase()),
        )
        .toList();
    final money = NumberFormat.currency(symbol: '\$');
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar(_type),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          Text(
            widget.customer.businessName,
            style: const TextStyle(fontSize: 13, color: detailMuted),
          ),
          const SizedBox(height: 12),
          TextField(
            onChanged: (s) => setState(() => _query = s),
            decoration: detailInput(hint: 'Search document number')
                .copyWith(prefixIcon: const Icon(Icons.search, size: 17)),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              for (final type in ['Quotes', 'Orders', 'Invoices'])
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 5),
                    child: ChoiceChip(
                      label: Text(
                        type,
                        style: TextStyle(
                          fontSize: 12,
                          color: _type == type ? Colors.white : detailGreen,
                        ),
                      ),
                      showCheckmark: false,
                      selected: _type == type,
                      onSelected: (_) => setState(() => _type = type),
                      selectedColor: detailGreen,
                      backgroundColor: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          detailCard(
            Column(
              children: [
                for (final d in docs) ...[
                  ListTile(
                    leading: const DetailGlyph(
                      'doc',
                      size: 17,
                      color: detailMuted,
                    ),
                    title: Text(
                      d.number,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      '${DateFormat('d MMM yyyy').format(d.invoiceDate ?? d.createdAt)}${d.dueDate == null ? '' : ' · due ${DateFormat('d MMM').format(d.dueDate!)}'}',
                      style: const TextStyle(fontSize: 11, color: detailMuted),
                    ),
                    trailing: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          money.format(d.total),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 3),
                        detailBadge(
                          d.status == SalesDocumentStatus.quotation
                              ? 'Draft'
                              : d.status == SalesDocumentStatus.order
                              ? 'Confirmed'
                              : d.balanceDue == 0
                              ? 'Paid'
                              : 'Outstanding',
                        ),
                      ],
                    ),
                    onTap: () => dashboardOpen(
                      context,
                      SalesDocumentDetailScreen(document: d),
                    ),
                  ),
                  const Divider(height: 1, color: detailLine),
                ],
                if (docs.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(24),
                    child: Text(
                      'No documents match.',
                      style: TextStyle(fontSize: 13, color: detailMuted),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
