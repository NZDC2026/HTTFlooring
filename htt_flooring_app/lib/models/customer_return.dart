import 'handover_proof.dart';

import 'customer_return_item.dart';

enum CustomerReturnStatus { pending, processed }

class CustomerReturn {
  Map<String, dynamic> toJson() => {
    'id': id,
    'customerId': customerId,
    'customerName': customerName,
    'referenceNumber': referenceNumber,
    'createdAt': createdAt.toIso8601String(),
    'status': status.name,
    'items': items.map((v) => v.toJson()).toList(),
    'handoverProof': handoverProof?.toJson(),
  };
  factory CustomerReturn.fromJson(Map<String, dynamic> j) => CustomerReturn(
    id: j['id'] as String,
    customerId: j['customerId'] as String,
    customerName: j['customerName'] as String,
    referenceNumber: j['referenceNumber'] as String,
    createdAt: DateTime.parse(j['createdAt'] as String),
    status: CustomerReturnStatus.values.byName(j['status'] as String),
    items: (j['items'] as List)
        .map(
          (v) =>
              CustomerReturnItem.fromJson(Map<String, dynamic>.from(v as Map)),
        )
        .toList(),
    handoverProof: j['handoverProof'] == null
        ? null
        : HandoverProof.fromJson(
            Map<String, dynamic>.from(j['handoverProof'] as Map),
          ),
  );

  const CustomerReturn({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.referenceNumber,
    required this.createdAt,
    required this.status,
    required this.items,
    this.handoverProof,
  });

  final HandoverProof? handoverProof;
  final String id;
  final String customerId;
  final String customerName;
  final String referenceNumber;
  final DateTime createdAt;
  final CustomerReturnStatus status;
  final List<CustomerReturnItem> items;

  int get totalQuantity => items.fold(0, (sum, item) => sum + item.quantity);
  String get statusLabel =>
      status == CustomerReturnStatus.pending ? 'Pending' : 'Processed';
}
