import '../models/customer_snapshot.dart';
import '../models/product_snapshot.dart';
import '../models/sales_document.dart';
import '../models/sales_document_item.dart';
import '../models/sales_user.dart';
import 'mock_data.dart' as mock;

/// Preview-only invoices; never inserted into SalesDocumentService or storage.
List<SalesDocument> customerProductSalesDemo(String customerId, DateTime now) {
  final customer = CustomerSnapshot(
    id: customerId,
    businessName: 'Demo Customer',
    type: 'Demo',
    region: SalesRegion.sydney,
    address: '',
    abn: '',
  );
  final products = [
    ...mock.products.take(3).map(ProductSnapshot.fromProduct),
    const ProductSnapshot(
      id: 'demo-coastal-oak',
      sku: 'DEMO-COA',
      name: 'Coastal Oak (Demo)',
      category: 'Engineered Timber',
      colour: 'Coastal Oak',
      sqmPerBox: 2.2,
    ),
  ];
  const boxes = [
    [30, 20, 20, 10, 10, 10], // Up in both comparison windows.
    [12, 24, 24, 30, 30, 30], // Down in both windows.
    [16, 16, 16, 16, 16, 16], // No change.
    [8, 0, 0, 0, 0, 0], // New sales, no previous baseline.
  ];
  final documents = <SalesDocument>[];
  for (var p = 0; p < products.length; p++) {
    for (var period = 0; period < 6; period++) {
      final quantity = boxes[p][period];
      if (quantity == 0) continue;
      final date = DateTime(now.year, now.month, now.day - 7 - period * 30, 10);
      documents.add(
        SalesDocument(
          number: 'DEMO-$customerId-$p-$period',
          customer: customer,
          createdAt: date,
          invoiceDate: date,
          status: SalesDocumentStatus.invoice,
          items: [
            SalesDocumentItem(
              product: products[p],
              boxes: quantity,
              sqm: quantity * products[p].sqmPerBox,
              unitPrice: 50,
            ),
          ],
        ),
      );
    }
  }
  return documents;
}
