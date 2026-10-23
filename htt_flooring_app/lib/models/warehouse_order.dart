import 'handover_proof.dart';

import 'warehouse_order_item.dart';

enum WarehouseOrderStatus {
  toPick,
  preparing,
  prepared,
  readyForDispatch,
  completed,
}

enum WarehouseFulfilmentType { pickup, transport }

class WarehouseOrder {
  Map<String, dynamic> toJson() => {
    'id': id,
    'number': number,
    'customerName': customerName,
    'status': status.name,
    'fulfilmentType': fulfilmentType.name,
    'fulfilmentDate': fulfilmentDate.toIso8601String(),
    'items': items.map((v) => v.toJson()).toList(),
    'collectedBy': collectedBy,
    'pickupConfirmedAt': pickupConfirmedAt?.toIso8601String(),
    'dispatchPhotos': dispatchPhotos,
    'dispatchNotes': dispatchNotes,
    'completedAt': completedAt?.toIso8601String(),
    'handoverProof': handoverProof?.toJson(),
  };
  factory WarehouseOrder.fromJson(Map<String, dynamic> j) => WarehouseOrder(
    id: j['id'] as String,
    number: j['number'] as String,
    customerName: j['customerName'] as String,
    status: WarehouseOrderStatus.values.byName(j['status'] as String),
    fulfilmentType: WarehouseFulfilmentType.values.byName(
      j['fulfilmentType'] as String,
    ),
    fulfilmentDate: DateTime.parse(j['fulfilmentDate'] as String),
    items: (j['items'] as List)
        .map(
          (v) =>
              WarehouseOrderItem.fromJson(Map<String, dynamic>.from(v as Map)),
        )
        .toList(),
    collectedBy: j['collectedBy'] as String,
    pickupConfirmedAt: j['pickupConfirmedAt'] == null
        ? null
        : DateTime.parse(j['pickupConfirmedAt'] as String),
    dispatchPhotos: List<String>.from(j['dispatchPhotos'] as List),
    dispatchNotes: j['dispatchNotes'] as String,
    completedAt: j['completedAt'] == null
        ? null
        : DateTime.parse(j['completedAt'] as String),
    handoverProof: j['handoverProof'] == null
        ? null
        : HandoverProof.fromJson(
            Map<String, dynamic>.from(j['handoverProof'] as Map),
          ),
  );

  WarehouseOrder({
    required this.id,
    required this.number,
    required this.customerName,
    required this.status,
    required this.fulfilmentType,
    required this.fulfilmentDate,
    required this.items,
    this.handoverProof,
    this.collectedBy = '',
    this.pickupConfirmedAt,
    List<String>? dispatchPhotos,
    this.dispatchNotes = '',
    this.completedAt,
  }) : dispatchPhotos = dispatchPhotos ?? [];

  final String id;
  final String number;
  final String customerName;
  WarehouseOrderStatus status;
  WarehouseFulfilmentType fulfilmentType;
  final DateTime fulfilmentDate;
  final List<WarehouseOrderItem> items;

  HandoverProof? handoverProof;
  String collectedBy;
  DateTime? pickupConfirmedAt;
  final List<String> dispatchPhotos;
  String dispatchNotes;
  DateTime? completedAt;

  int get totalRequiredBoxes =>
      items.fold(0, (total, item) => total + item.requiredBoxes);

  int get totalPreparedBoxes =>
      items.fold(0, (total, item) => total + item.preparedBoxes);

  int get preparedItemCount => items.where((item) => item.isPrepared).length;

  bool get allItemsPrepared =>
      items.isNotEmpty && items.every((item) => item.isPrepared);

  bool get hasMinimumDispatchPhotos => dispatchPhotos.length >= 2;

  String get statusLabel {
    switch (status) {
      case WarehouseOrderStatus.toPick:
        return 'To Pick';
      case WarehouseOrderStatus.preparing:
        return 'Preparing';
      case WarehouseOrderStatus.prepared:
        return 'Prepared';
      case WarehouseOrderStatus.readyForDispatch:
        return 'Ready for Dispatch';
      case WarehouseOrderStatus.completed:
        return 'Completed';
    }
  }

  String get fulfilmentLabel =>
      fulfilmentType == WarehouseFulfilmentType.pickup ? 'Pickup' : 'Transport';

  String get collectedByLabel =>
      fulfilmentType == WarehouseFulfilmentType.pickup
      ? 'Customer / Collector Name'
      : 'Driver Name';
}
