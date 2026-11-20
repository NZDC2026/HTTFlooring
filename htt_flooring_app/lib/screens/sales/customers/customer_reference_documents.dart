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
    sku: 'HER-003',
    name: 'Heritage Smoked Oak',
    category: 'Engineered Timber',
    colour: 'Smoked Oak',
    sqmPerBox: 1.44,
  );
  const heritageNatural = ProductSnapshot(
    id: 'heritage-natural',
    sku: 'HER-001',
    name: 'Heritage Natural Oak',
    category: 'Engineered Timber',
    colour: 'Natural Oak',
    sqmPerBox: 1.44,
  );
  const aqua = ProductSnapshot(
    id: 'aquaglow-silver',
    sku: 'AQU-002',
    name: 'AquaGlow Silver',
    category: 'Laminate',
    colour: 'Silver',
    sqmPerBox: 2.2,
  );
  const mtf = ProductSnapshot(
    id: 'mtf-white',
    sku: 'MTF-001',
    name: 'MTF White',
    category: 'Laminate',
    colour: 'White',
    sqmPerBox: 2.41,
  );
  const scotia = ProductSnapshot(
    id: 'scotia-natural',
    sku: 'SCO-01',
    name: 'Scotia Natural Oak',
    category: 'Accessories',
    colour: 'Natural Oak',
    sqmPerBox: 0,
  );
  const invoiceLines = <String, List<SalesDocumentItem>>{
    'INV-10163': [
      SalesDocumentItem(product: bonita, boxes: 30, sqm: 66, unitPrice: 69),
      SalesDocumentItem(
        product: heritageNatural,
        boxes: 20,
        sqm: 28.8,
        unitPrice: 81,
      ),
    ],
    'INV-10161': [
      SalesDocumentItem(product: bonita, boxes: 18, sqm: 39.6, unitPrice: 69),
    ],
    'INV-10160': [
      SalesDocumentItem(product: aqua, boxes: 14, sqm: 30.8, unitPrice: 44),
      SalesDocumentItem(product: bonita, boxes: 27, sqm: 59.4, unitPrice: 69),
      SalesDocumentItem(product: mtf, boxes: 18, sqm: 43.38, unitPrice: 30.5),
    ],
    'INV-10159': [
      SalesDocumentItem(product: guardian, boxes: 40, sqm: 88, unitPrice: 47.5),
      SalesDocumentItem(product: scotia, boxes: 30, sqm: 0, unitPrice: 9.5),
    ],
    'INV-10548': [
      SalesDocumentItem(product: bonita, boxes: 52, sqm: 114.4, unitPrice: 69),
    ],
  };
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
        items: invoiceLines[r.$1]!,
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
